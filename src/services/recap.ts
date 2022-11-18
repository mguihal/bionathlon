import * as t from 'io-ts';
import { useApi } from './api';

export const recapResponseSchema = t.type({
  nbGames: t.number,
  nbGamesPreviousYear: t.number,
  nbGamesMidday: t.number,
  nbGamesAllPlayers: t.number,
  pctBottles: t.number,
  nbBottles: t.number,
  nbBonus: t.number,
  nbMalus: t.number,
  nbSuddenDeath: t.number,
  nbWonSuddenDeath: t.number,
  bestDate: t.string,
  bestPoints: t.number,
  bestLeft: t.number,
  bestMiddle: t.number,
  bestRight: t.number,
  bestMalus: t.number,
});

export const recapQueryParamsSchema = t.type({
  playerId: t.string,
  year: t.string,
});

export type RecapResponse = t.TypeOf<typeof recapResponseSchema>;
export type RecapQueryParams = t.TypeOf<typeof recapQueryParamsSchema>;

type T = ReturnType<typeof useApi<RecapResponse, RecapQueryParams>>;

export const useGetRecap = (): T => {
  const [responseData, fetchApi] = useApi<RecapResponse, RecapQueryParams>({
    path: '/api/recap',
    schema: recapResponseSchema,
  });

  return [responseData, fetchApi];
};
