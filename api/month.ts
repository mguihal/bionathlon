import { NowRequest, NowResponse } from '@now/node';
import joi from '@hapi/joi';

import { RouteConfig, routeWrapper, withDb } from './_common';

const routeConfig: RouteConfig = {
  get: {
    validate: {
      payload: joi.any(),
      query: joi.any(),
    },
    handler: async res => {
      return withDb(async db => {
        const games = await db('game').select('date').orderBy('date', 'desc');

        const yearMonths: string[] = [];

        games.forEach(game => {
          const date = new Date(game.date);
          const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

          if (!yearMonths.includes(yearMonth)) {
            yearMonths.push(yearMonth);
          }
        });

        return res.send(yearMonths);
      });
    },
  },
};

export default (req: NowRequest, res: NowResponse) =>
  routeWrapper(req, res, routeConfig);
