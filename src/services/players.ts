import z from 'zod';
import { useEffect } from 'react';
import { useApi } from './api';

export const playersSchema = z.array(
  z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    avatar: z.nullable(z.string()),
  }),
);

export type GetPlayersResponse = z.infer<typeof playersSchema>;
export type PlayersData = ReturnType<typeof useApi<GetPlayersResponse>>[0];

export const useGetPlayers = (initialLoad: boolean): ReturnType<typeof useApi<GetPlayersResponse>> => {
  const [responseData, fetchApi] = useApi<GetPlayersResponse>({
    path: '/api/player',
    schema: playersSchema,
  });

  useEffect(() => {
    if (initialLoad) {
      fetchApi();
    }
  }, [initialLoad, fetchApi]);

  return [responseData, fetchApi];
};

export const addPlayerPayloadSchema = z.object({
  data: z.object({
    email: z.string(),
    name: z.string(),
  }),
});

export type AddPlayerResponse = z.infer<typeof playersSchema>;
export type AddPlayerPayload = z.infer<typeof addPlayerPayloadSchema>;

export const useAddPlayer = (): ReturnType<
  typeof useApi<AddPlayerResponse, Record<string, never>, AddPlayerPayload>
> => {
  const [responseData, fetchApi] = useApi<AddPlayerResponse, Record<string, never>, AddPlayerPayload>({
    path: '/api/player',
    method: 'POST',
    schema: playersSchema,
  });

  return [responseData, fetchApi];
};
