import * as t from 'io-ts';
import { nullable } from 'io-ts/lib/Type';
import { useCallback, useEffect } from 'react';
import { getTZDate } from '../helpers';
import { useApi } from './api';

const gameUpdatableAttributes = {
  date: t.string,
  time: t.union([t.literal('midday'), t.literal('evening')]),
  playerId: t.number,
  score: nullable(t.number),
  scoreLeftBottle: nullable(t.number),
  scoreMiddleBottle: nullable(t.number),
  scoreRightBottle: nullable(t.number),
  scoreMalusBottle: nullable(t.number),
  note: nullable(t.string),
  suddenDeath: t.boolean,
};

const gameUpdatableSchema = t.type(gameUpdatableAttributes);
const gameSchema = t.intersection([
  gameUpdatableSchema, 
  t.type({ 
    id: t.number,
    suddenDeath: t.boolean,
    playerName: t.string,
    playerAvatar: nullable(t.string),
  })
]);

export const addGamePayloadSchema = t.type({
  data: gameUpdatableSchema,
});

export const updateGamePayloadSchema = t.type({
  data: t.partial(gameUpdatableAttributes),
});

export const updateGameQueryParamsSchema = t.type({
  id: t.string,
});

export const getGamesQueryParamsSchema = t.partial({
  date: t.string,
  playerId: t.string,
  month: t.string,
  offset: t.string,
  limit: t.string,
});

export type Game = t.TypeOf<typeof gameSchema>;

// ADD GAME
const addGameSchema = t.array(gameUpdatableSchema);
export type AddGameResponse = t.TypeOf<typeof addGameSchema>;
export type AddGamePayload = t.TypeOf<typeof addGamePayloadSchema>;

export const useAddGame = (): ReturnType<typeof useApi<AddGameResponse, {}, AddGamePayload>> => {
  const [responseData, fetchApi] = useApi<AddGameResponse, {}, AddGamePayload>({
    path: '/api/game',
    method: 'POST',
    schema: addGameSchema,
  });

  return [responseData, fetchApi];
};

// UPDATE GAME
const updateGameSchema = t.array(gameUpdatableSchema);
export type UpdateGameResponse = t.TypeOf<typeof updateGameSchema>;
export type UpdateGameQueryParams = t.TypeOf<typeof updateGameQueryParamsSchema>;
export type UpdateGamePayload = t.TypeOf<typeof updateGamePayloadSchema>;

export const useUpdateGame = (): ReturnType<typeof useApi<UpdateGameResponse, UpdateGameQueryParams, UpdateGamePayload>> => {
  const [responseData, fetchApi] = useApi<UpdateGameResponse, UpdateGameQueryParams, UpdateGamePayload>({
    path: '/api/game',
    method: 'PUT',
    schema: updateGameSchema,
  });

  return [responseData, fetchApi];
};

// GET GAMES
const getGamesSchema = t.array(gameSchema);
export type GetGamesResponse = t.TypeOf<typeof getGamesSchema>;
export type GetGamesQueryParams = t.TypeOf<typeof getGamesQueryParamsSchema>;

export const useGetPaginatedGames = (): ReturnType<typeof useApi<GetGamesResponse, GetGamesQueryParams>> => {
  const [responseData, fetchApi] = useApi<GetGamesResponse, GetGamesQueryParams>({
    path: '/api/game',
    schema: getGamesSchema,
  });

  return [responseData, fetchApi];
};

export const useGetTodayGames = (): ReturnType<typeof useApi<GetGamesResponse>> => {
  const [responseData, fetchApi] = useGetPaginatedGames();

  const fetchToday = useCallback(() => fetchApi({ date: getTZDate() }), [fetchApi]);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  return [responseData, fetchToday];
};
