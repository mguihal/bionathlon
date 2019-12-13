import { NowRequest, NowResponse } from '@now/node';
import joi from '@hapi/joi';

import { RouteConfig, routeWrapper, withDb } from './_common';

import { sendSuddenDeathOnChat } from './_bot';

export interface SuddenDeathPayload {
  data: {
    gameId: number;
    won: boolean;
  };
}

const routeConfig: RouteConfig = {
  put: {
    validate: {
      payload: joi
        .object()
        .keys({
          data: joi
            .object()
            .keys({
              gameId: joi
                .number()
                .required()
                .description('Id de la game'),
              won: joi
                .boolean()
                .required()
                .description('Résultat de la mort subite'),
            })
            .required(),
        })
        .required(),
      query: joi.any(),
    },
    handler: async (res, payload: SuddenDeathPayload) => {
      return withDb(async db => {
        try {
          const game = await db('game')
            .update({
              suddenDeath: payload.data.won,
            })
            .where('id', payload.data.gameId)
            .returning('*');

          try {
            await sendSuddenDeathOnChat(db, payload);
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
