import { VercelRequest, VercelResponse } from '@vercel/node';
import { groupByDateTime } from '../src/helpers';
import { sendScoreOnChat, sendSuddenDeathOnChat } from './_bot';
import { RouteConfig, routeWrapper, withDb } from './_common';
import { 
  AddGameResponse, 
  AddGamePayload, 
  addGamePayloadSchema, 
  getGamesQueryParamsSchema, 
  GetGamesQueryParams, 
  GetGamesResponse,
  updateGamePayloadSchema,
  updateGameQueryParamsSchema,
  UpdateGamePayload,
  UpdateGameQueryParams,
  UpdateGameResponse,
} from '../src/services/games';

const routeConfig: RouteConfig = {
  get: {
    validate: {
      query: getGamesQueryParamsSchema,
    },
    handler: async (res, _, query: GetGamesQueryParams) => {
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
            'avatar as playerAvatar',
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
          const limit = parseInt(query.limit, 10);
          const offset = parseInt(query.offset || '0', 10);

          const groupedGames = groupByDateTime(games);
          const sessions = Object.keys(groupedGames)
            .sort()
            .reverse()
            .slice(offset, (offset) + limit);

          games = games.filter(game => {
            const groupKey = `${new Date(game.date).toISOString()} - ${
              game.time === 'midday' ? 'midi' : 'soir'
            }`;

            return sessions.includes(groupKey);
          });
        }

        return res.send(games as GetGamesResponse);
      });
    },
  },

  post: {
    validate: {
      payload: addGamePayloadSchema,
    },
    handler: async (res, payload: AddGamePayload) => {
      return withDb(async db => {
        try {
          const games = await db('game')
            .insert(payload.data)
            .returning([
              'date', 
              'time', 
              'playerId', 
              'score', 
              'scoreLeftBottle', 
              'scoreMiddleBottle', 
              'scoreRightBottle', 
              'scoreMalusBottle', 
              'note', 
              'suddenDeath',
            ]);

          try {
            await sendScoreOnChat(db, payload);
          } catch (error) {
            console.error(error);
          }

          return res.send(games as AddGameResponse);
        } catch (e) {
          const error = e as Error;
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

  put: {
    validate: {
      query: updateGameQueryParamsSchema,
      payload: updateGamePayloadSchema,
    },
    handler: async (res, payload: UpdateGamePayload, query: UpdateGameQueryParams) => {
      return withDb(async db => {
        try {
          const games = await db('game')
            .update(payload.data)
            .where('id', query.id)
            .returning([
              'date', 
              'time', 
              'playerId', 
              'score', 
              'scoreLeftBottle', 
              'scoreMiddleBottle', 
              'scoreRightBottle', 
              'scoreMalusBottle', 
              'note', 
              'suddenDeath',
            ]);

          if (payload.data.suddenDeath) {
            await sendSuddenDeathOnChat(db, query.id);
          }

          return res.send(games as UpdateGameResponse);
        } catch (e) {
          const error = e as Error;
          console.error(error.message);

          if (error.message.indexOf('game_playerid_date_time_unique') >= 0) {
            return res.status(500).send({
              error: `Score déjà existant`,
            });
          }

          return res.status(500).send({
            error: 'Game update error',
          });
        }
      });
    }
  }
};

export default (req: VercelRequest, res: VercelResponse) =>
  routeWrapper(req, res, routeConfig);
