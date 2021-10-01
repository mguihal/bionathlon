import joi from '@hapi/joi';
import { NowRequest, NowResponse } from '@now/node';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import knex from 'knex';

const jwtVersion = '1';
const jwtSecret = process.env.SECRET || 'secret';
export const JWT_SECRET = jwtSecret + jwtVersion;

export interface MethodConfig {
  validate: {
    payload: joi.AnySchema;
    query: joi.AnySchema;
  };
  authenticated?: boolean;
  handler: (
    res: NowResponse,
    payload?: any,
    query?: any,
  ) => Promise<NowResponse>;
}

export interface RouteConfig {
  get?: MethodConfig;
  post?: MethodConfig;
  put?: MethodConfig;
}

function withBody(req: NowRequest) {
  return new Promise<NowRequest>(resolve => {
    let data: string[] = [];

    req.on('data', chunk => data.push(chunk));
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

export async function validationWrapper(
  req: NowRequest,
  res: NowResponse,
  config: MethodConfig,
) {
  try {
    req = await withBody(req);

    const payload = await config.validate.payload.validateAsync(req.body);
    const query = await config.validate.query.validateAsync(req.query);

    if (config.authenticated !== false || process.env.LOCAL) {
      try {
        const decoded = jwt.verify(req.headers.authorization || '', JWT_SECRET);
      } catch (err) {
        throw new JsonWebTokenError('Unauthorized token');
      }
    }

    return config.handler(res, payload, query);
  } catch (error) {
    console.log(error);

    switch (error.constructor) {
      case joi.ValidationError:
        return res.status(400).send({ error: error.message });
      case JsonWebTokenError:
        return res.status(401).send({ error: error.message });
      default:
        return res.status(500).send({});
    }
  }
}

export async function routeWrapper(
  req: NowRequest,
  res: NowResponse,
  config: RouteConfig,
) {
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
    case 'OPTIONS':
      return res.send('');
    default:
      break;
  }

  return res.status(404).send('Not found');
}

export async function withDb(callback: (db: knex) => any) {
  const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
  });

  const response = await callback(db);

  db.destroy();

  return response;
}
