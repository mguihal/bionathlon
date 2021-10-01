import joi from '@hapi/joi';
import { NowRequest, NowResponse } from '@now/node';
import { RouteConfig, routeWrapper, withDb } from './_common';

interface PlayerPayload {
  data: {
    email: string;
    name: string;
  };
}

const routeConfig: RouteConfig = {
  get: {
    validate: {
      payload: joi.any(),
      query: joi.any(),
    },
    handler: async res => {
      return withDb(async db => {
        const players = await db('player')
          .orderBy('id')
          .select();
        return res.send(players);
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
              email: joi
                .string()
                .email()
                .required()
                .description('Email du joueur'),
              name: joi
                .string()
                .min(3)
                .required()
                .description('Nom du joueur'),
            })
            .required(),
        })
        .required(),
      query: joi.any(),
    },
    handler: async (res, payload: PlayerPayload) => {
      return withDb(async db => {
        try {
          const player = await db('player')
            .insert({
              email: payload.data.email,
              name: payload.data.name,
            })
            .returning('*');

          return res.send(player);
        } catch (error) {
          console.error(error.message);

          if (error.message.indexOf('player_email_unique') >= 0) {
            return res.status(500).send({
              error: `L'email du joueur existe déjà`,
            });
          }

          return res.status(500).send({
            error: `Erreur inconnue lors de l'insertion du joueur`,
          });
        }
      });
    },
  },
};

export default (req: NowRequest, res: NowResponse) =>
  routeWrapper(req, res, routeConfig);
