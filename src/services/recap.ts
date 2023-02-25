import z from 'zod';
import { useApi } from './api';

export const recapResponseSchema = z.object({
  year: z.number(),
  nbGames: z.number(),
  nbGamesPreviousYear: z.number(),
  nbGamesMidday: z.number(),
  nbGamesAllPlayers: z.number(),
  pctBottles: z.number(),
  nbBottles: z.number(),
  nbBonus: z.number(),
  nbMalus: z.number(),
  nbSuddenDeath: z.number(),
  nbWonSuddenDeath: z.number(),
  bestDate: z.string(),
  bestPoints: z.number(),
  bestLeft: z.number(),
  bestMiddle: z.number(),
  bestRight: z.number(),
  bestMalus: z.number(),
});

export const recapQueryParamsSchema = z.object({
  playerId: z.string(),
  year: z.string(),
});

export type RecapResponse = z.infer<typeof recapResponseSchema>;
export type RecapQueryParams = z.infer<typeof recapQueryParamsSchema>;

type T = ReturnType<typeof useApi<RecapResponse, RecapQueryParams>>;

export const useGetRecap = (): T => {
  const [responseData, fetchApi] = useApi<RecapResponse, RecapQueryParams>({
    path: '/api/recap',
    schema: recapResponseSchema,
  });

  return [responseData, fetchApi];
};
