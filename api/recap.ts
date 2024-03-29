import { VercelRequest, VercelResponse } from '@vercel/node';
import { recapQueryParamsSchema, RecapResponse, RecapQueryParams } from '../src/services/recap';
import { computeScore, groupByDateTime, groupByPlayer } from '../src/helpers';
import { RouteConfig, routeWrapper, withDb } from './_common';

const routeConfig: RouteConfig = {
  get: {
    validate: {
      query: recapQueryParamsSchema,
    },
    handler: async (res, _, query: RecapQueryParams) => {
      const playerId = parseInt(query.playerId, 10);
      const year = parseInt(query.year, 10);

      return withDb(async (db) => {
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
            'note',
            'name as playerName',
            'suddenDeath',
          )
          .whereRaw(`CAST(date AS TEXT) >= ?`, [`${year}-01`])
          .whereRaw(`CAST(date AS TEXT) < ?`, [`${year + 1}-01`]);

        const previousYearQuery = db('game')
          .count('id')
          .where('playerId', playerId)
          .whereRaw(`CAST(date AS TEXT) >= ?`, [`${year - 1}-01`])
          .whereRaw(`CAST(date AS TEXT) < ?`, [`${year}-01`]);

        const games = await gamesQuery;
        const previousYearGames = await previousYearQuery;

        const playersGames = groupByPlayer(games);
        const sessionGames = groupByDateTime(games);

        const currentPlayerGames = playersGames[playerId];

        const nbBottles = currentPlayerGames.reduce((nb, game) => {
          return (
            nb +
            (game.scoreLeftBottle || 0) +
            (game.scoreMiddleBottle || 0) +
            (game.scoreRightBottle || 0) +
            (game.scoreMalusBottle || 0)
          );
        }, 0);

        const nbBonus = currentPlayerGames.reduce((nb, game) => {
          const left = game.scoreLeftBottle || 0;
          const middle = game.scoreMiddleBottle || 0;
          const right = game.scoreRightBottle || 0;

          return nb + Math.min(left, middle, right);
        }, 0);

        const nbMalus = currentPlayerGames.reduce((nb, game) => {
          return nb + (game.scoreMalusBottle || 0);
        }, 0);

        const suddenDeaths = Object.keys(sessionGames).reduce(
          (obj, sessionKey) => {
            const games = sessionGames[sessionKey];

            const currentPlayerGame = games.find((game) => game.playerId === playerId);

            if (currentPlayerGame && games.length > 1) {
              const currentPlayerScore = computeScore(currentPlayerGame);
              const bestScore = games.reduce((nb, game) => {
                const score = computeScore(game);
                return score > nb ? score : nb;
              }, -99);

              const nbBestScore = games.reduce((nb, game) => {
                const score = computeScore(game);
                return score === bestScore ? nb + 1 : nb;
              }, 0);

              if (currentPlayerScore === bestScore && nbBestScore > 1) {
                obj.nb += 1;
                obj.win += currentPlayerGame.suddenDeath ? 1 : 0;
              }
            }

            return obj;
          },
          { nb: 0, win: 0 },
        );

        const best = currentPlayerGames.reduce(
          (obj, game) => {
            const score = computeScore(game);

            if (score > obj.points) {
              obj.date = game.date;
              obj.points = score;
              obj.left = game.scoreLeftBottle || 0;
              obj.middle = game.scoreMiddleBottle || 0;
              obj.right = game.scoreRightBottle || 0;
              obj.malus = game.scoreMalusBottle || 0;
            }

            return obj;
          },
          { date: '', points: -99, left: 0, middle: 0, right: 0, malus: 0 },
        );

        const response: RecapResponse = {
          year,
          nbGames: currentPlayerGames.length,
          nbGamesPreviousYear: parseInt(previousYearGames[0].count as string, 10),
          nbGamesMidday: currentPlayerGames.filter((game) => game.time === 'midday').length,
          nbGamesAllPlayers: games.length,
          pctBottles: nbBottles / (currentPlayerGames.length * 33),
          nbBottles: nbBottles,
          nbBonus,
          nbMalus,
          nbSuddenDeath: suddenDeaths.nb,
          nbWonSuddenDeath: suddenDeaths.win,
          bestDate: best.date,
          bestPoints: best.points,
          bestLeft: best.left,
          bestMiddle: best.middle,
          bestRight: best.right,
          bestMalus: best.malus,
        };

        return res.send(response);
      });
    },
  },
};

export default (req: VercelRequest, res: VercelResponse) => routeWrapper(req, res, routeConfig);
