import * as t from 'io-ts';
import { useEffect } from 'react';
import { useApi } from './api';

export const playersSchema = t.array(
  t.type({
    id: t.number,
    email: t.string,
    name: t.string,
    avatar: t.union([t.string, t.null]),
  })
);

type PlayersResponse = t.TypeOf<typeof playersSchema>;
export type PlayersData = ReturnType<typeof useApi<PlayersResponse>>[0];

export const useGetPlayers = (initialLoad: boolean): ReturnType<typeof useApi<PlayersResponse>> => {
  const [foldData, fetchApi] = useApi<PlayersResponse>({
    path: '/api/player',
    schema: playersSchema,
  });

  useEffect(() => {
    if (initialLoad) {
      fetchApi({});
    }
  }, [initialLoad, fetchApi]);

  return [foldData, fetchApi];
};
