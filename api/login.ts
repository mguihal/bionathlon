import { VercelRequest, VercelResponse } from '@vercel/node';
import joi from '@hapi/joi';
import axios from 'axios';
import jwt from 'jsonwebtoken';

import { RouteConfig, routeWrapper, JWT_SECRET, withDb } from './_common';

interface LoginPayload {
  data: {
    googleToken: string;
  };
}

interface GoogleResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

async function loginHandler(res: VercelResponse, payload: LoginPayload) {
  try {
    const googleToken = payload.data.googleToken;
    const response = await axios.get<GoogleResponse>(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${googleToken}`,
    );

    const player = await withDb(async db => {
      return db('player')
        .first()
        .where({ email: response.data.email });
    });

    if (!player) {
      throw new Error('User not authorized');
    }

    const jwtPayload = player;

    const token = jwt.sign(jwtPayload, JWT_SECRET);

    return res.send({
      token,
      user: {
        id: player.id,
        email: player.email,
        name: player.name,
      },
    });
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
      payload: joi
        .object()
        .keys({
          data: joi
            .object()
            .keys({
              googleToken: joi
                .string()
                .required()
                .description('AccessToken Google'),
            })
            .required(),
        })
        .required(),
      query: joi.any(),
    },
    authenticated: false,
    handler: loginHandler,
  },
};

export default (req: VercelRequest, res: VercelResponse) =>
  routeWrapper(req, res, routeConfig);
