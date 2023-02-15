import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import {
  LoginPayload,
  loginPayloadSchema,
  LoginResponse,
} from '../src/services/user';

import { RouteConfig, routeWrapper, JWT_SECRET, withDb } from './_common';

type GoogleResponse = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

type PlayerQuery = {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  isAdmin: boolean;
};

async function loginHandler(res: VercelResponse, payload: LoginPayload) {
  try {
    const googleToken = payload.data.googleToken;
    const response = await axios.get<GoogleResponse>(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      },
    );

    const player: PlayerQuery = await withDb(async (db) => {
      return db('player').first().where({ email: response.data.email });
    });

    if (!player) {
      throw new Error('User not authorized');
    }

    if (!player.avatar && response.data.picture) {
      await withDb(async (db) => {
        await db('player')
          .update({
            avatar: response.data.picture,
          })
          .where({ email: response.data.email });
        player.avatar = response.data.picture;
      });
    }

    const jwtPayload = player;

    const token = jwt.sign(jwtPayload, JWT_SECRET);

    return res.send({
      token,
      user: {
        id: player.id,
        email: player.email,
        name: player.name,
        avatar: player.avatar,
        isAdmin: player.isAdmin,
      },
    } as LoginResponse);
  } catch (e) {
    const error = e as any;
    if (error.response && error.response.status === 401) {
      return res.status(401).send({ error: 'Token not authorized' });
    }

    if (error.message === 'User not authorized') {
      return res.status(401).send({ error: error.message });
    }

    console.log('ERR', error);
    return res.status(500).send({ error });
  }
}

const routeConfig: RouteConfig = {
  post: {
    validate: {
      payload: loginPayloadSchema,
    },
    authenticated: false,
    handler: loginHandler,
  },
};

export default (req: VercelRequest, res: VercelResponse) =>
  routeWrapper(req, res, routeConfig);
