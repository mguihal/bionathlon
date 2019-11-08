import { NowRequest, NowResponse } from '@now/node';
import joi from '@hapi/joi';

import { RouteConfig, routeWrapper, withDb } from './_common';

interface GamePayload {
  data: {
    date: string;
    time: 'midday' | 'evening';
    playerId: number;
    score: number;
    note: string;
  };
}

interface GameFilters {
  date?: string;
  playerId?: number;
}

const routeConfig: RouteConfig = {
  get: {
    validate: {
      payload: joi.any(),
      query: joi.object().keys({
        date: joi.string().description('Filtre par date'),
        playerId: joi.number().description('Filtre par joueur'),
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
            'note',
            'name as playerName',
          );

        if (query.playerId) {
          gamesQuery.where('playerId', query.playerId);
        }

        if (query.date) {
          gamesQuery.whereRaw(`CAST(date AS DATE) = ?`, [query.date]);
        }

        const games = await gamesQuery;

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
              score: joi
                .number()
                .required()
                .description('Score du joueur'),
              note: joi
                .string()
                .required()
                .allow('')
                .description('Note pour ce score'),
            })
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
              note: payload.data.note,
            })
            .returning('*');

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
