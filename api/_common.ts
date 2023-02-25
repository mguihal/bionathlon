/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from 'io-ts';
import { PathReporter, success } from 'io-ts/lib/PathReporter';
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import knex, { Knex } from 'knex';

const jwtVersion = '2';
const jwtSecret = process.env.SECRET || 'secret';
export const JWT_SECRET = jwtSecret + jwtVersion;

export type TokenPayload = {
  id: number;
  name: string;
  isAdmin: boolean;
};

export type MethodConfig = {
  validate?: {
    payload?: t.Any;
    query?: t.Any;
  };
  authenticated?: boolean;
  handler: (res: VercelResponse, payload?: any, query?: any, user?: TokenPayload | null) => Promise<VercelResponse>;
};

export interface RouteConfig {
  get?: MethodConfig;
  post?: MethodConfig;
  put?: MethodConfig;
  delete?: MethodConfig;
}

function withBody(req: VercelRequest) {
  return new Promise<VercelRequest>((resolve) => {
    const data: string[] = [];

    req.on('data', (chunk) => data.push(chunk));
    req.on('end', () => {
      try {
        req.body = JSON.parse(data.join(''));
      } catch (error) {
        req.body = {};
      }
      resolve(req);
    });
  });
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export async function validationWrapper(req: VercelRequest, res: VercelResponse, config: MethodConfig) {
  try {
    req = await withBody(req);

    const queryValidator2 = config.validate?.query || t.unknown;
    const queryValidation = PathReporter.report(queryValidator2.decode(req.query))[0];

    if (queryValidation !== success()[0]) {
      throw new ValidationError(`Format des queryParams incorrect: ${queryValidation}`);
    }

    const payloadValidator2 = config.validate?.payload || t.unknown;
    const payloadValidation = PathReporter.report(payloadValidator2.decode(req.body))[0];

    if (payloadValidation !== success()[0]) {
      throw new ValidationError(`Format du payload incorrect: ${payloadValidation}`);
    }

    let token: TokenPayload | null = null;

    if (config.authenticated !== false && process.env.LOCAL !== 'true') {
      try {
        token = jwt.verify(req.headers.authorization || '', JWT_SECRET) as TokenPayload;
      } catch (err) {
        throw new JsonWebTokenError('Unauthorized token');
      }
    }

    return config.handler(res, req.body, req.query, token);
  } catch (e) {
    const error = e as Error;

    switch (error.constructor) {
      case ValidationError:
        return res.status(400).send({ error: error.message });
      case JsonWebTokenError:
        return res.status(401).send({ error: error.message });
      default:
        return res.status(500).send({});
    }
  }
}

export async function routeWrapper(req: VercelRequest, res: VercelResponse, config: RouteConfig) {
  switch (req.method) {
    case 'GET':
      if (config.get) {
        return validationWrapper(req, res, config.get);
      }
      break;
    case 'POST':
      if (config.post) {
        return validationWrapper(req, res, config.post);
      }
      break;
    case 'PUT':
      if (config.put) {
        return validationWrapper(req, res, config.put);
      }
      break;
    case 'DELETE':
      if (config.delete) {
        return validationWrapper(req, res, config.delete);
      }
      break;
    case 'OPTIONS':
      return res.send('');
    default:
      break;
  }

  return res.status(404).send('Not found');
}

export async function withDb(callback: (db: Knex) => any) {
  const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
  });

  const response = await callback(db);

  db.destroy();

  return response;
}
