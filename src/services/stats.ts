import * as t from 'io-ts';

import { useApi } from './api';

// GET Stats
const rankingSchema = t.array(
  t.type({ 
    id: t.number, 
    name: t.string, 
    score: t.number, 
    suffix: t.union([t.string, t.undefined]) 
  })
);

export const rankingsSchema = t.type({
  nbMatchs: rankingSchema,
  nbWonMatchs: rankingSchema,
  pctWonMatchs: rankingSchema,
  nbPoints: rankingSchema,
  nbRondelles: rankingSchema,
  avgPoints: rankingSchema,
  efficiency: rankingSchema,
  topScore: rankingSchema,
});

export const rankingsQueryParamsSchema = t.partial({
  dateFilter: t.string
});

export type RankingsResponse = t.TypeOf<typeof rankingsSchema>;
export type RankingsQueryParams = t.TypeOf<typeof rankingsQueryParamsSchema>;

export const useGetRankings = (): ReturnType<typeof useApi<RankingsResponse, RankingsQueryParams>> => {
  const [responseData, fetchApi] = useApi<RankingsResponse, RankingsQueryParams>({
    path: '/api/stats',
    schema: rankingsSchema,
  });

  return [responseData, fetchApi];
};

// GET ChartSerie
const samplingSchema = t.keyof({
  'none': null, 
  'session': null, 
  'playedSession': null, 
  'day': null,
  'week': null,
  'month': null,
  'year': null,
  'time': null,
  'weekDay': null,
  'monthName': null,
  'player': null,
  'bottle': null,
  'score': null,
});

export type Sampling = t.TypeOf<typeof samplingSchema>;

const serieTypeSchema = t.keyof({
  'nbPoints': null,
  'nbRondelles': null,
  'nbMatchs': null,
  'nbWonMatchs': null,
  'pctWonMatchs': null,
  'avgPoints': null,
  'efficiency': null,
  'topScore': null,
  'worstScore': null,
  'nbPlayers': null,
  'nbSuddenDeath': null,
  'nbWonSuddenDeath': null,
  'nbBonus': null,
});

export type SerieType = t.TypeOf<typeof serieTypeSchema>;

const serieModifierSchema = t.keyof({
  'none': null, 
  'cumulated': null,
  'pct': null,
  'smooth': null,
  'minimum': null,
  'maximum': null,
  'mean': null,
  'median': null,
  'regression': null,
});

export type SerieModifier = t.TypeOf<typeof serieModifierSchema>;

export const chartSerieSchema = t.array(
  t.type({
    key: t.string,
    shouldDisplay: t.boolean,
    value: t.number,
  })
);

export const chartSerieQueryParamsSchema = t.type({
  type: serieTypeSchema,
  date: t.string,
  modifier: serieModifierSchema,
  playerFilter: t.string,
  sampling: samplingSchema,
  chartDate: t.string,
});

export type ChartSerieResponse = t.TypeOf<typeof chartSerieSchema>;

export type ChartSerieQueryParams = {
  type: SerieType;
  date: string;
  modifier: SerieModifier;
  playerFilter: string;
  sampling: Sampling;
  chartDate: string;
};

export const useGetChartSerie = (): ReturnType<typeof useApi<ChartSerieResponse, ChartSerieQueryParams>> => {
  const [responseData, fetchApi] = useApi<ChartSerieResponse, ChartSerieQueryParams>({
    path: '/api/chartSerie',
    schema: chartSerieSchema,
  });

  return [responseData, fetchApi];
};
