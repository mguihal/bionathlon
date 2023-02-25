import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  GetPlayersResponse,
  AddPlayerResponse,
  AddPlayerPayload,
  addPlayerPayloadSchema,
} from '../src/services/players';
import { sendNewPlayerOnChat } from './_bot';
import { RouteConfig, routeWrapper, withDb } from './_common';

const routeConfig: RouteConfig = {
  get: {
    handler: async (res) => {
      return withDb(async (db) => {
        const players = await db('player').orderBy('id').select('id', 'email', 'name', 'avatar');
        return res.send(players as GetPlayersResponse);
      });
    },
  },

  post: {
    validate: {
      payload: addPlayerPayloadSchema,
    },
    handler: async (res, payload: AddPlayerPayload, _, user) => {
      return withDb(async (db) => {
        try {
          const players = await db('player')
            .insert({
              email: payload.data.email,
              name: payload.data.name,
            })
            .returning(['id', 'email', 'name', 'avatar']);

          if (user) {
            await sendNewPlayerOnChat(players[0].name, user);
          }

          return res.send(players as AddPlayerResponse);
        } catch (e) {
          const error = e as Error;
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

export default (req: VercelRequest, res: VercelResponse) => routeWrapper(req, res, routeConfig);
