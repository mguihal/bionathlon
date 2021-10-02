import joi from '@hapi/joi';
import { NowRequest, NowResponse } from '@now/node';
import { groupByDateTime } from '../src/helpers';
import { sendScoreOnChat } from './_bot';
import { RouteConfig, routeWrapper, withDb } from './_common';

export interface GamePayload {
  data: {
    date: string;
    time: 'midday' | 'evening';
    playerId: number;
    score?: number;
    scoreLeftBottle?: number;
    scoreMiddleBottle?: number;
    scoreRightBottle?: number;
    scoreMalusBottle?: number;
    note: string;
  };
}

interface GameFilters {
  date?: string;
  playerId?: number;
  month?: string;
  offset?: number;
  limit?: number;
}

const routeConfig: RouteConfig = {
  get: {
    validate: {
      payload: joi.any(),
      query: joi.object().keys({
        date: joi.string().description('Filtre par date'),
        playerId: joi.number().description('Filtre par joueur'),
        month: joi.string().description('Filtre par mois (ex: 2021-09)'),
        offset: joi.number().description('Nombre de sessions omises'),
        limit: joi
          .number()
          .description('Nombre maximal de sessions retournées'),
      }),
    },
    handler: async (res, _, query: GameFilters) => {
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
            'suddenDeath',
          );

        if (query.playerId !== undefined) {
          gamesQuery.where('playerId', query.playerId);
        }

        if (query.date) {
          gamesQuery.whereRaw(`CAST(date AS DATE) = ?`, [query.date]);
        }

        if (query.month) {
          gamesQuery.whereRaw(`CAST(date AS TEXT) >= ?`, [`${query.month}-01`]);
          gamesQuery.whereRaw(`CAST(date AS TEXT) <= ?`, [`${query.month}-31`]);
        }

        gamesQuery.orderBy('game.id', 'desc');

        let games = await gamesQuery;

        if (query.limit) {
          const groupedGames = groupByDateTime(games);
          const sessions = Object.keys(groupedGames)
            .sort()
            .reverse()
            .slice(query.offset || 0, (query.offset || 0) + query.limit);

          games = games.filter(game => {
            const groupKey = `${new Date(game.date).toISOString()} - ${
              game.time === 'midday' ? 'midi' : 'soir'
            }`;

            return sessions.includes(groupKey);
          });
        }

        return res.send(games);
      });
    },
  },

  post: {
    validate: {
      payload: joi
        .object()
        .keys({
          data: joi
            .object()
            .keys({
              date: joi
                .date()
                .required()
                .description('Date du score'),
              time: joi
                .string()
                .required()
                .valid('midday', 'evening')
                .description('Moment du score ("midday" ou "evening")'),
              playerId: joi
                .number()
                .required()
                .description('Id du joueur'),
              score: joi.number().description('Score total du joueur'),
              scoreLeftBottle: joi
                .number()
                .min(0)
                .description('Score de la bouteille gauche'),
              scoreMiddleBottle: joi
                .number()
                .min(0)
                .description('Score de la bouteille centrale'),
              scoreRightBottle: joi
                .number()
                .min(0)
                .description('Score de la bouteille droite'),
              scoreMalusBottle: joi
                .number()
                .min(0)
                .description('Score de la bouteille malus'),
              note: joi
                .string()
                .required()
                .allow('')
                .description('Note pour ce score'),
            })
            .and(
              'scoreLeftBottle',
              'scoreMiddleBottle',
              'scoreRightBottle',
              'scoreMalusBottle',
            )
            .oxor('score', 'scoreLeftBottle')
            .required(),
        })
        .required(),
      query: joi.any(),
    },
    handler: async (res, payload: GamePayload) => {
      return withDb(async db => {
        try {
          const game = await db('game')
            .insert({
              date: payload.data.date,
              time: payload.data.time,
              playerId: payload.data.playerId,
              score: payload.data.score,
              scoreLeftBottle: payload.data.scoreLeftBottle,
              scoreMiddleBottle: payload.data.scoreMiddleBottle,
              scoreRightBottle: payload.data.scoreRightBottle,
              scoreMalusBottle: payload.data.scoreMalusBottle,
              note: payload.data.note,
            })
            .returning('*');

          try {
            await sendScoreOnChat(db, payload);
          } catch (error) {
            console.error(error);
          }

          return res.send(game);
        } catch (error) {
          console.error(error.message);

          if (error.message.indexOf('game_playerid_date_time_unique') >= 0) {
            return res.status(500).send({
              error: `Score déjà existant`,
            });
          }

          return res.status(500).send({
            error: 'Game insertion error',
          });
        }
      });
    },
  },
};

export default (req: NowRequest, res: NowResponse) =>
  routeWrapper(req, res, routeConfig);
