import z from 'zod';
import { useCallback, useEffect } from 'react';
import { getTZDate } from '../helpers';
import { useApi } from './api';

const gameUpdatableSchema = z.object({
  date: z.string(),
  time: z.enum(['midday', 'evening']),
  playerId: z.number(),
  score: z.nullable(z.number()),
  scoreLeftBottle: z.nullable(z.number()),
  scoreMiddleBottle: z.nullable(z.number()),
  scoreRightBottle: z.nullable(z.number()),
  scoreMalusBottle: z.nullable(z.number()),
  note: z.nullable(z.string()),
  suddenDeath: z.boolean(),
});

const gameSchema = gameUpdatableSchema.and(
  z.object({
    id: z.number(),
    suddenDeath: z.boolean(),
    playerName: z.string(),
    playerAvatar: z.nullable(z.string()),
  }),
);

export const addGamePayloadSchema = z.object({
  data: gameUpdatableSchema,
});

export const updateGamePayloadSchema = z.object({
  data: gameUpdatableSchema.partial(),
});

export const updateGameQueryParamsSchema = z.object({
  id: z.string(),
});

export const getGamesQueryParamsSchema = z
  .object({
    date: z.string(),
    playerId: z.string(),
    month: z.string(),
    offset: z.string(),
    limit: z.string(),
  })
  .partial();

export type Game = z.infer<typeof gameSchema>;

// ADD GAME
const addGameSchema = z.array(gameUpdatableSchema);
export type AddGameResponse = z.infer<typeof addGameSchema>;
export type AddGamePayload = z.infer<typeof addGamePayloadSchema>;

export const useAddGame = (): ReturnType<typeof useApi<AddGameResponse, Record<string, never>, AddGamePayload>> => {
  const [responseData, fetchApi] = useApi<AddGameResponse, Record<string, never>, AddGamePayload>({
    path: '/api/game',
    method: 'POST',
    schema: addGameSchema,
  });

  return [responseData, fetchApi];
};

// UPDATE GAME
const updateGameSchema = z.array(gameUpdatableSchema);
export type UpdateGameResponse = z.infer<typeof updateGameSchema>;
export type UpdateGameQueryParams = z.infer<typeof updateGameQueryParamsSchema>;
export type UpdateGamePayload = z.infer<typeof updateGamePayloadSchema>;

export const useUpdateGame = (): ReturnType<
  typeof useApi<UpdateGameResponse, UpdateGameQueryParams, UpdateGamePayload>
> => {
  const [responseData, fetchApi] = useApi<UpdateGameResponse, UpdateGameQueryParams, UpdateGamePayload>({
    path: '/api/game',
    method: 'PUT',
    schema: updateGameSchema,
  });

  return [responseData, fetchApi];
};

// DELETE GAME
const deleteGameSchema = z.array(gameUpdatableSchema);
export type DeleteGameResponse = z.infer<typeof deleteGameSchema>;
export type DeleteGameQueryParams = z.infer<typeof updateGameQueryParamsSchema>;

export const useDeleteGame = (): ReturnType<typeof useApi<DeleteGameResponse, DeleteGameQueryParams>> => {
  const [responseData, fetchApi] = useApi<DeleteGameResponse, DeleteGameQueryParams>({
    path: '/api/game',
    method: 'DELETE',
    schema: deleteGameSchema,
  });

  return [responseData, fetchApi];
};

// GET GAMES
const getGamesSchema = z.array(gameSchema);
export type GetGamesResponse = z.infer<typeof getGamesSchema>;
export type GetGamesQueryParams = z.infer<typeof getGamesQueryParamsSchema>;

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
