import joi from '@hapi/joi';
import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  byScore,
  computeRondelles,
  computeScore,
  getWinner,
  groupByDateTime,
  groupByPlayer,
  round2,
} from '../src/helpers';
import { RouteConfig, routeWrapper, withDb } from './_common';

interface Filters {
  month?: string;
}

interface Rank {
  id: number;
  name: string;
  avatar?: string;
  score: number;
  suffix?: string;
}

const routeConfig: RouteConfig = {
  get: {
    validate: {
      payload: joi.any(),
      query: joi.object().keys({
        month: joi.string().description('Filtre par mois (ex: 2021-09)'),
      }),
    },
    handler: async (res, _, query: Filters) => {
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
            'note',
            'name as playerName',
            'avatar as playerAvatar', 
            'suddenDeath',
          );

        if (query.month) {
          gamesQuery.whereRaw(`CAST(date AS TEXT) >= ?`, [`${query.month}-01`]);
          gamesQuery.whereRaw(`CAST(date AS TEXT) <= ?`, [`${query.month}-31`]);
        }

        const games = await gamesQuery;

        const playerGames = groupByPlayer(games);
        const sessionGames = groupByDateTime(games);

        const winnerPlayerIds = Object.keys(sessionGames).map(session => {
          return getWinner(sessionGames[session]);
        });

        // nbMatchs
        const nbMatchs = Object.keys(playerGames)
          .map<Rank>(player => {
            return {
              id: Number(player),
              name: playerGames[player][0].playerName,
              avatar: playerGames[player][0].playerAvatar,
              score: playerGames[player].length,
            };
          })
          .sort(byScore);

        // nbWonMatchs
        const nbWonMatchs = Object.keys(playerGames)
          .map<Rank>(player => {
            return {
              id: Number(player),
              name: playerGames[player][0].playerName,
              avatar: playerGames[player][0].playerAvatar,
              score: winnerPlayerIds.reduce<number>(
                (acc, cur) => acc + (cur === Number(player) ? 1 : 0),
                0,
              ),
            };
          })
          .sort(byScore);

        // pctWonMatchs
        const pctWonMatchs = Object.keys(playerGames)
          .map<Rank>(player => {
            return {
              id: Number(player),
              name: playerGames[player][0].playerName,
              avatar: playerGames[player][0].playerAvatar,
              score: round2(
                (winnerPlayerIds.reduce<number>(
                  (acc, cur) => acc + (cur === Number(player) ? 1 : 0),
                  0,
                ) /
                  playerGames[player].length) *
                  100,
              ),
              suffix: '%',
            };
          })
          .sort(byScore);

        // nbPoints
        const nbPoints = Object.keys(playerGames)
          .map<Rank>(player => {
            return {
              id: Number(player),
              name: playerGames[player][0].playerName,
              avatar: playerGames[player][0].playerAvatar,
              score: playerGames[player].reduce(
                (acc, cur) => acc + computeScore(cur),
                0,
              ),
            };
          })
          .sort(byScore);

        // nbRondelles
        const nbRondelles = Object.keys(playerGames)
          .map<Rank>(player => {
            return {
              id: Number(player),
              name: playerGames[player][0].playerName,
              avatar: playerGames[player][0].playerAvatar,
              score: playerGames[player].reduce(
                (acc, cur) => acc + computeRondelles(cur),
                0,
              ),
            };
          })
          .sort(byScore);

        // efficiency
        const efficiency = Object.keys(playerGames)
          .map<Rank>(player => {
            const pts = playerGames[player].reduce(
              (acc, cur) => acc + computeScore(cur, true),
              0,
            );
            const rondelles = playerGames[player].reduce(
              (acc, cur) => acc + computeRondelles(cur),
              0,
            );

            return {
              id: Number(player),
              name: playerGames[player][0].playerName,
              avatar: playerGames[player][0].playerAvatar,
              score: rondelles > 0 ? round2(pts / rondelles) : 0,
            };
          })
          .sort(byScore);

        // avgPoints
        const avgPoints = Object.keys(playerGames)
          .map<Rank>(player => {
            return {
              id: Number(player),
              name: playerGames[player][0].playerName,
              avatar: playerGames[player][0].playerAvatar,
              score: round2(
                playerGames[player].reduce(
                  (acc, cur) => acc + computeScore(cur),
                  0,
                ) / playerGames[player].length,
              ),
            };
          })
          .sort(byScore);

        // topScore
        const topScore = Object.keys(playerGames)
          .map<Rank>(player => {
            return {
              id: Number(player),
              name: playerGames[player][0].playerName,
              avatar: playerGames[player][0].playerAvatar,
              score: playerGames[player].reduce(
                (acc, cur) =>
                  computeScore(cur) > acc ? computeScore(cur) : acc,
                -999,
              ),
            };
          })
          .sort(byScore);

        return res.send({
          nbMatchs,
          nbWonMatchs,
          pctWonMatchs,
          nbPoints,
          nbRondelles,
          efficiency,
          avgPoints,
          topScore,
        });
      });
    },
  },
};

export default (req: VercelRequest, res: VercelResponse) =>
  routeWrapper(req, res, routeConfig);
