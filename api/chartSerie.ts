import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  computeRondelles,
  computeScore,
  getSuddenDeathGames,
  getWinner,
  groupByDateTime,
  round2,
} from '../src/helpers';
import { RouteConfig, routeWrapper, withDb } from './_common';
import { Sampling, SerieModifier, ChartSerieQueryParams, ChartSerieResponse, chartSerieQueryParamsSchema } from '../src/services/stats';

type Point = {
  key: string;
  value: number;
  shouldDisplay: boolean;
};

type GameQueryLine = {
  id: number;
  date: string;
  time: 'midday' | 'evening';
  playerId: number;
  score: number | null;
  scoreLeftBottle: number | null;
  scoreMiddleBottle: number | null;
  scoreRightBottle: number | null;
  scoreMalusBottle: number | null;
  playerName: string;
  playerAvatar: string | null;
  suddenDeath: boolean;
  note: string;
};

type EnrichedGame = GameQueryLine & {
  sampleHash: string;
  computedScore: number;
}

function formatDateMonth(date: Date) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }`;
}


function getWeek(date: Date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7) - 1;
}

function formatDateWeek(date: Date) {
  const week = getWeek(date);
  return `${date.getFullYear()}-${
    week < 10 ? `0${week}` : week
  }`;
}

function createSessionSamples(chartDate: string) {
  const now = new Date();
  let firstDate: Date;
  let endDate: Date = now;
  
  if (chartDate === 'all') {
    firstDate = new Date(2019, 8, 1);
  } else {
    const [year, month] = chartDate.split('-');
    firstDate = month ? new Date(parseInt(year, 10), parseInt(month, 10) - 1) : new Date(parseInt(year, 10), 0);
    endDate = month ? new Date(parseInt(year, 10), parseInt(month, 10)) : new Date(parseInt(year, 10) + 1, 0);
  }

  const result: string[] = [];

  while (firstDate <= endDate && firstDate <= now) {
    if (firstDate.getDay() !== 0 && firstDate.getDay() !== 6) {
      result.push(`${firstDate.toISOString()} - midi`);
      result.push(`${firstDate.toISOString()} - soir`);
    }
    firstDate.setDate(firstDate.getDate() + 1);
  }

  return result;
}

function createDaySamples(chartDate: string) {
  const now = new Date();
  let firstDate: Date;
  let endDate: Date = now;
  
  if (chartDate === 'all') {
    firstDate = new Date(2019, 8, 1);
  } else {
    const [year, month] = chartDate.split('-');
    firstDate = month ? new Date(parseInt(year, 10), parseInt(month, 10) - 1) : new Date(parseInt(year, 10), 0);
    endDate = month ? new Date(parseInt(year, 10), parseInt(month, 10)) : new Date(parseInt(year, 10) + 1, 0);
  }

  const result: string[] = [];

  while (firstDate <= endDate && firstDate <= now) {
    if (firstDate.getDay() !== 0 && firstDate.getDay() !== 6) {
      result.push(`${firstDate.toISOString()}`);
    }
    firstDate.setDate(firstDate.getDate() + 1);
  }

  return result;
}

function createWeekSamples(chartDate: string) {
  const now = new Date();
  let firstDate: Date;
  let endDate: Date = now;
  
  if (chartDate === 'all') {
    firstDate = new Date(2019, 8, 1);
  } else {
    const [year, month] = chartDate.split('-');
    firstDate = month ? new Date(parseInt(year, 10), parseInt(month, 10) - 1) : new Date(parseInt(year, 10), 0);
    endDate = month ? new Date(parseInt(year, 10), parseInt(month, 10)) : new Date(parseInt(year, 10) + 1, 0);
  }

  const result: string[] = [];

  while (firstDate <= endDate && firstDate <= now) {
    result.push(formatDateWeek(firstDate));
    firstDate.setDate(firstDate.getDate() + 7);
  }

  return result;
}

function createMonthSamples(chartDate: string) {
  const now = new Date();
  let firstDate: Date;
  let endDate: Date = now;
  
  if (chartDate === 'all') {
    firstDate = new Date(2019, 8, 1);
  } else {
    const [year, month] = chartDate.split('-');
    firstDate = month ? new Date(parseInt(year, 10), parseInt(month, 10) - 1) : new Date(parseInt(year, 10), 0);
    endDate = month ? new Date(parseInt(year, 10), parseInt(month, 10)) : new Date(parseInt(year, 10) + 1, 0);
  }

  const result: string[] = [];

  while (firstDate < endDate && firstDate <= now) {
    result.push(formatDateMonth(firstDate));
    firstDate.setMonth(firstDate.getMonth() + 1);
  }

  return result;
}

function createYearSamples(chartDate: string) {
  const now = new Date();
  let firstDate: Date;
  let endDate: Date = now;
  
  if (chartDate === 'all') {
    firstDate = new Date(2019, 8, 1);
  } else {
    const [year, month] = chartDate.split('-');
    firstDate = month ? new Date(parseInt(year, 10), parseInt(month, 10) - 1) : new Date(parseInt(year, 10), 0);
    endDate = month ? new Date(parseInt(year, 10), parseInt(month, 10)) : new Date(parseInt(year, 10) + 1, 0);
  }

  const result: string[] = [];

  while (firstDate < endDate && firstDate <= now) {
    result.push(`${firstDate.getFullYear()}`);
    firstDate.setFullYear(firstDate.getFullYear() + 1);
  }

  return result;
}

function filterGames(game: EnrichedGame, sample: string, sampling: Sampling, modifier: SerieModifier) {
  if (sampling === 'none' || sampling === 'playedSession' || sampling === 'bottle') {
    return true;
  } else if (sampling === 'time') {
    return game.time === sample;
  } else if (sampling === 'player') {
    return `${game.playerId}` === sample;
  }

  return modifier === 'cumulated' ? game.sampleHash <= sample : game.sampleHash === sample;
}

const routeConfig: RouteConfig = {
  get: {
    validate: {
      query: chartSerieQueryParamsSchema,
    },
    handler: async (res, _, query: ChartSerieQueryParams) => {
      return withDb(async db => {
        const gamesQuery = db('game')
          .join('player', 'game.playerId', 'player.id')
          .select(
            'game.id',
            'date',
            'time',
            'playerId',
            'score',
            'scoreLeftBottle',
            'scoreMiddleBottle',
            'scoreRightBottle',
            'scoreMalusBottle',
            'name as playerName',
            'avatar as playerAvatar',
            'suddenDeath',
            'note'
          )

        if (query.date !== 'all') {
          gamesQuery
            .whereRaw(`CAST(date AS TEXT) >= ?`, [`${query.date}-01`])
            .whereRaw(`CAST(date AS TEXT) <= ?`, [`${query.date}-31`]);
        }

        const games: GameQueryLine[] = await gamesQuery;

        const enrichedGames: EnrichedGame[] = games.map(game => {
          const gameDate = new Date(game.date);
          const computedScore = computeScore(game);
          let sampleHash = '';

          if (query.sampling === 'session') {
            sampleHash = gameDate.toISOString() + ' - ' + (game.time === 'midday' ? 'midi' : 'soir');
          } else if (query.sampling === 'day') {
            sampleHash = gameDate.toISOString();
          } else if (query.sampling === 'week') {
            sampleHash = formatDateWeek(gameDate);
          } else if (query.sampling === 'month') {
            sampleHash = formatDateMonth(gameDate);
          } else if (query.sampling === 'year') {
            sampleHash = `${gameDate.getFullYear()}`;
          } else if (query.sampling === 'time') {
            sampleHash = game.time;
          } else if (query.sampling === 'weekDay') {
            sampleHash = `${gameDate.getDay()}`;
          } else if (query.sampling === 'monthName') {
            sampleHash = `${gameDate.getMonth() + 1}`;
          } else if (query.sampling === 'player') {
            sampleHash = `${game.playerId}`;
          } else if (query.sampling === 'score') {
            sampleHash = computedScore.toString();
          }

          return {...game, sampleHash, computedScore };
        });

        let sampledData: string[] = [];
        let points: Point[] = [];

        // SAMPLING
        if (query.sampling === 'none') {
          sampledData = ['all'];
        } else if (query.sampling === 'session') {
          sampledData = createSessionSamples(query.chartDate);
        } else if (query.sampling === 'playedSession') {
          sampledData = games.map((g, i) => `${i}`);
        } else if (query.sampling === 'day') {
          sampledData = createDaySamples(query.chartDate);
        } else if (query.sampling === 'week') {
          sampledData = createWeekSamples(query.chartDate);
        } else if (query.sampling === 'month') {
          sampledData = createMonthSamples(query.chartDate);
        } else if (query.sampling === 'year') {
          sampledData = createYearSamples(query.chartDate);
        } else if (query.sampling === 'time') {
          sampledData = ['midday', 'evening'];
        } else if (query.sampling === 'weekDay') {
          sampledData = ['1', '2', '3', '4', '5'];
        } else if (query.sampling === 'monthName') {
          sampledData = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        } else if (query.sampling === 'player') {
          sampledData = games.map(game => `${game.playerId}`).filter((p, i, a) => a.indexOf(p) === i);
        } else if (query.sampling === 'bottle') {
          sampledData = ['leftBottle', 'middleBottle', 'rightBottle', 'malusBottle']
        } else if (query.sampling === 'score') {
          const minScore = -33;
          const maxScore = 66;
          sampledData = Array(maxScore - minScore + 1).fill(0).map((e, i) => `${i + minScore}`);
        }

        points = sampledData.map((sample, i) => {          
          let filteredGames: EnrichedGame[] = enrichedGames.filter(game => {
            return filterGames(game, sample, query.sampling, query.modifier) && 
              (query.playerFilter === 'all' || game.playerId.toString() === query.playerFilter);
          });

          if (query.sampling === 'playedSession') {
            filteredGames = filteredGames.filter((g, i) => i === parseInt(sample, 10));
          }

          if (filteredGames.length === 0) {
            return { key: sample, value: 0, shouldDisplay: false };
          }

          if (query.sampling === 'bottle') {
            const sampleToAttribute = (g: GameQueryLine) => {
              return {
                'leftBottle': g.scoreLeftBottle, 
                'middleBottle': g.scoreMiddleBottle, 
                'rightBottle': g.scoreRightBottle, 
                'malusBottle': g.scoreMalusBottle
              }[sample] || 0;
            };

            switch (query.type) {
              case 'nbPoints':
              case 'nbRondelles':
                return { key: sample, shouldDisplay: true, value: filteredGames.reduce((acc, cur) => acc + sampleToAttribute(cur), 0) };
              case 'nbMatchs':
                return { key: sample, shouldDisplay: true, value: filteredGames.filter(g => sampleToAttribute(g) > 0).length };
              case 'avgPoints':
                return { key: sample, shouldDisplay: true, value: filteredGames.reduce((acc, cur) => acc + sampleToAttribute(cur), 0) / filteredGames.length };
              case 'topScore':
                return { key: sample, shouldDisplay: true, value: Math.max(...filteredGames.map(g => sampleToAttribute(g))) };
              case 'worstScore':
                return { key: sample, shouldDisplay: true, value: Math.min(...filteredGames.map(g => sampleToAttribute(g))) };
              case 'nbPlayers':
                return { key: sample, shouldDisplay: true, value: filteredGames.filter(g => sampleToAttribute(g) > 0).map(game => game.playerId).filter((p, i, a) => a.indexOf(p) === i).length };
              default:
                return { key: sample, shouldDisplay: true, value: 0 };
            }
          }

          // SERIE TYPE
          if (query.type === 'nbPoints') {
            return {
              key: sample,
              value: filteredGames.reduce((acc, cur) => acc + cur.computedScore, 0),
              shouldDisplay: true,
            };
          } else if (query.type === 'nbRondelles') {
            return {
              key: sample,
              value: filteredGames.reduce((acc, cur) => acc + computeRondelles(cur), 0),
              shouldDisplay: true,
            };
          } else if (query.type === 'nbMatchs') {
            return {
              key: sample,
              value: filteredGames.length,
              shouldDisplay: true,
            };
          } else if (query.type === 'nbWonMatchs') {
            const filteredGamesWithoutPlayerFilter = enrichedGames.filter(game => filterGames(game, sample, query.sampling, query.modifier));
            const sessionGames = groupByDateTime(filteredGamesWithoutPlayerFilter);
            const winnerPlayerIds = Object.keys(sessionGames).map(session => getWinner(sessionGames[session]));

            return {
              key: sample,
              value: query.playerFilter === 'all' ? filteredGames.length : winnerPlayerIds.reduce<number>(
                (acc, cur) => acc + (cur === Number(query.playerFilter) ? 1 : 0),
                0,
              ),
              shouldDisplay: true,
            };
          } else if (query.type === 'pctWonMatchs') {
            const filteredGamesWithoutPlayerFilter = enrichedGames.filter(game => filterGames(game, sample, query.sampling, query.modifier));
            const sessionGames = groupByDateTime(filteredGamesWithoutPlayerFilter);
            const winnerPlayerIds = Object.keys(sessionGames).map(session => getWinner(sessionGames[session]));

            return {
              key: sample,
              value: query.playerFilter === 'all' ? 100 : winnerPlayerIds.reduce<number>(
                (acc, cur) => acc + (cur === Number(query.playerFilter) ? 1 : 0),
                0,
              ) / filteredGames.length * 100,
              shouldDisplay: true,
            };
          } else if (query.type === 'avgPoints') {
            return {
              key: sample,
              value: filteredGames.reduce((acc, cur) => acc + cur.computedScore, 0) / filteredGames.length,
              shouldDisplay: true,
            };
          } else if (query.type === 'efficiency') {
            const nbPointsWithBottles = filteredGames.reduce((acc, cur) => acc + computeScore(cur, true), 0);
            const nbRondelles = filteredGames.reduce((acc, cur) => acc + computeRondelles(cur), 0);

            return {
              key: sample,
              value: nbRondelles > 0 ? nbPointsWithBottles / nbRondelles : 0,
              shouldDisplay: true,
            };
          } else if (query.type === 'topScore') {
            return {
              key: sample,
              value: filteredGames.reduce((acc, cur) => cur.computedScore > acc ? cur.computedScore : acc, -Infinity),
              shouldDisplay: true,
            };
          } else if (query.type === 'worstScore') {
            return {
              key: sample,
              value: filteredGames.reduce((acc, cur) => cur.computedScore < acc ? cur.computedScore : acc, Infinity),
              shouldDisplay: true,
            };
          } else if (query.type === 'nbPlayers') {
            return {
              key: sample,
              value: filteredGames.map(game => game.playerId).filter((p, i, a) => a.indexOf(p) === i).length,
              shouldDisplay: true,
            };
          } else if (query.type === 'nbSuddenDeath') {
            const filteredGamesWithoutPlayerFilter = enrichedGames.filter(game => filterGames(game, sample, query.sampling, query.modifier));
            const sessionGames = groupByDateTime(filteredGamesWithoutPlayerFilter);
            const sessionsWithSuddenDeath = Object.keys(sessionGames).map(session => getSuddenDeathGames(sessionGames[session], false));

            return {
              key: sample,
              value: query.playerFilter === 'all' ? 
                sessionsWithSuddenDeath.reduce((acc, cur) => acc + (cur.length > 0 ? 1 : 0), 0) : 
                sessionsWithSuddenDeath.reduce((acc, cur) => acc + (cur.filter(g => g.playerId === Number(query.playerFilter)).length > 0 ? 1 : 0), 0)
              ,
              shouldDisplay: true,
            };
          } else if (query.type === 'nbWonSuddenDeath') {
            const filteredGamesWithoutPlayerFilter = enrichedGames.filter(game => filterGames(game, sample, query.sampling, query.modifier));
            const sessionGames = groupByDateTime(filteredGamesWithoutPlayerFilter);
            const sessionsWithSuddenDeath = Object.keys(sessionGames).map(session => getSuddenDeathGames(sessionGames[session], false));
            const winnerPlayerIds = Object.keys(sessionGames).map(session => getWinner(sessionGames[session]));

            return {
              key: sample,
              value: query.playerFilter === 'all' ? 
                sessionsWithSuddenDeath.reduce((acc, cur) => acc + (cur.length > 0 ? 1 : 0), 0) : 
                sessionsWithSuddenDeath.reduce((acc, cur, i) => acc + (cur.length > 0 && winnerPlayerIds[i] === Number(query.playerFilter) ? 1 : 0), 0)
              ,
              shouldDisplay: true,
            };
          } else if (query.type === 'nbBonus') {
            return {
              key: sample,
              value: filteredGames.reduce((acc, cur) => acc + Math.min(cur.scoreLeftBottle || 0, cur.scoreMiddleBottle || 0, cur.scoreRightBottle || 0), 0),
              shouldDisplay: true,
            };
          }

          return { key: '', value: 0, shouldDisplay: false };
        });

        // MODIFIERS
        if (query.modifier === 'smooth') {
          points = points.map((point, index, arr) => {
            const smoothOn = arr.slice(0, index).filter(p => p.shouldDisplay).reverse().slice(0, 10);
            const smoothedValue = smoothOn.length > 0 ? smoothOn.reduce((prev, cur) => prev + cur.value, 0) / smoothOn.length : point.value;

            return { ...point, value: smoothedValue };
          });
        } else if (query.modifier === 'minimum') {
          const smoothOn = points.filter(p => p.shouldDisplay);
          const minValue = smoothOn.length > 0 ? Math.min(...smoothOn.map(point => point.value)) : 0;

          points = points.map(point => ({...point, value: minValue}));
        } else if (query.modifier === 'maximum') {
          const smoothOn = points.filter(p => p.shouldDisplay);
          const maxValue = smoothOn.length > 0 ? Math.max(...smoothOn.map(point => point.value)) : 0;

          points = points.map(point => ({...point, value: maxValue}));
        } else if (query.modifier === 'mean') {
          const smoothOn = points.filter(p => p.shouldDisplay);
          const meanValue = smoothOn.length > 0 ? smoothOn.reduce((prev, cur) => prev + cur.value, 0) / smoothOn.length : 0;

          points = points.map(point => ({...point, value: meanValue}));
        } else if (query.modifier === 'median') {
          const byValue = (a: number, b: number) =>  a - b;
          const smoothOn = points.filter(p => p.shouldDisplay).map(p => p.value).sort(byValue);

          points = points.map(point => {
            if (smoothOn.length === 0) {
              return { ...point, value: 0 };
            } else if (smoothOn.length % 2 === 0) {
              return { ...point, value: (smoothOn[smoothOn.length / 2 - 1] + smoothOn[smoothOn.length / 2]) / 2 };
            } else {
              return { ...point, value: smoothOn[(smoothOn.length - 1) / 2] };
            }
          });
        } else if (query.modifier === 'regression') {
          const smoothOn = points.filter(p => p.shouldDisplay).map(p => p.value);

          points = points.map((point, index) => {
            if (smoothOn.length === 0) {
              return point;
            } 

            const mx = smoothOn.reduce((acc, cur, i) => acc + i, 0) / smoothOn.length;
            const my = smoothOn.reduce((acc, cur) => acc + cur, 0) / smoothOn.length;

            const varx = (smoothOn.reduce((acc, cur, i) => acc + i*i, 0) / smoothOn.length) - mx * mx;
            const covxy = (smoothOn.reduce((acc, cur, i) => acc + i*cur, 0) / smoothOn.length) - mx * my;

            const a = covxy / varx;
            const b = my - a * mx;
            
            return { ...point, value: a*index + b };
          });
        } else if (query.modifier === 'pct') {
          const total = points.reduce((acc, cur) => acc + cur.value, 0);
          points = points.map(point => ({...point, value: point.value / total * 100 }));
        }

        points = points.map(point => ({...point, value: round2(point.value)}));
        
        return res.send(points as ChartSerieResponse);
      });
    },
  },
};

export default (req: VercelRequest, res: VercelResponse) =>
  routeWrapper(req, res, routeConfig);
