import z from 'zod';
import { useApi } from './api';

// GET Stats
const rankingSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    avatar: z.nullable(z.string()),
    score: z.number(),
    suffix: z.optional(z.string()),
  }),
);

export const rankingsSchema = z.object({
  nbMatchs: rankingSchema,
  nbWonMatchs: rankingSchema,
  pctWonMatchs: rankingSchema,
  nbPoints: rankingSchema,
  nbRondelles: rankingSchema,
  avgPoints: rankingSchema,
  efficiency: rankingSchema,
  topScore: rankingSchema,
});

export const rankingsQueryParamsSchema = z
  .object({
    dateFilter: z.string(),
  })
  .partial();

export type RankingsResponse = z.infer<typeof rankingsSchema>;
export type RankingsQueryParams = z.infer<typeof rankingsQueryParamsSchema>;

export const useGetRankings = (): ReturnType<typeof useApi<RankingsResponse, RankingsQueryParams>> => {
  const [responseData, fetchApi] = useApi<RankingsResponse, RankingsQueryParams>({
    path: '/api/stats',
    schema: rankingsSchema,
  });

  return [responseData, fetchApi];
};

// GET ChartSerie
const samplingSchema = z.enum([
  'none',
  'session',
  'playedSession',
  'day',
  'week',
  'month',
  'year',
  'time',
  'weekDay',
  'monthName',
  'player',
  'bottle',
  'score',
]);

export type Sampling = z.infer<typeof samplingSchema>;

const serieTypeSchema = z.enum([
  'nbPoints',
  'nbRondelles',
  'nbMatchs',
  'nbWonMatchs',
  'pctWonMatchs',
  'avgPoints',
  'efficiency',
  'topScore',
  'worstScore',
  'nbPlayers',
  'nbSuddenDeath',
  'nbWonSuddenDeath',
  'nbBonus',
]);

export type SerieType = z.infer<typeof serieTypeSchema>;

const serieModifierSchema = z.enum([
  'none',
  'cumulated',
  'pct',
  'smooth',
  'minimum',
  'maximum',
  'mean',
  'median',
  'regression',
]);

export type SerieModifier = z.infer<typeof serieModifierSchema>;

export const chartSerieSchema = z.array(
  z.object({
    key: z.string(),
    shouldDisplay: z.boolean(),
    value: z.number(),
  }),
);

export const chartSerieQueryParamsSchema = z.object({
  type: serieTypeSchema,
  date: z.string(),
  modifier: serieModifierSchema,
  playerFilter: z.string(),
  sampling: samplingSchema,
  chartDate: z.string(),
});

export type ChartSerieResponse = z.infer<typeof chartSerieSchema>;
export type ChartSerieQueryParams = z.infer<typeof chartSerieQueryParamsSchema>;

export const useGetChartSerie = (): ReturnType<typeof useApi<ChartSerieResponse, ChartSerieQueryParams>> => {
  const [responseData, fetchApi] = useApi<ChartSerieResponse, ChartSerieQueryParams>({
    path: '/api/chartSerie',
    schema: chartSerieSchema,
  });

  return [responseData, fetchApi];
};
