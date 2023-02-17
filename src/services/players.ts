import * as t from 'io-ts';
import { nullable } from 'io-ts/lib/Type';
import { useEffect } from 'react';
import { useApi } from './api';

export const playersSchema = t.array(
  t.type({
    id: t.number,
    email: t.string,
    name: t.string,
    avatar: nullable(t.string),
  })
);

export type GetPlayersResponse = t.TypeOf<typeof playersSchema>;
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

export const addPlayerPayloadSchema = t.type({
  data: t.type({
    email: t.string,
    name: t.string,
  })
});

export type AddPlayerResponse = t.TypeOf<typeof playersSchema>;
export type AddPlayerPayload = t.TypeOf<typeof addPlayerPayloadSchema>;

export const useAddPlayer = (): ReturnType<typeof useApi<AddPlayerResponse, Record<string, never>, AddPlayerPayload>> => {
  const [responseData, fetchApi] = useApi<AddPlayerResponse, Record<string, never>, AddPlayerPayload>({
    path: '/api/player',
    method: 'POST',
    schema: playersSchema,
  });

  return [responseData, fetchApi];
};
