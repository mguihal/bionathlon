import * as t from 'io-ts';

import { useApi, ApiHookReturnType } from './api';

export type Sampling = 
  'none' | 
  'session' | 
  'playedSession' | 
  'day' |
  'week' |
  'month' |
  'year' |
  'time' |
  'weekDay' |
  'monthName' |
  'player' |
  'bottle' |
  'score';

export type SerieType = 
  'nbPoints' |
  'nbRondelles' |
  'nbMatchs' |
  'nbWonMatchs' |
  'pctWonMatchs' |
  'avgPoints' |
  'efficiency' |
  'topScore' |
  'worstScore' |
  'nbPlayers' |
  'nbSuddenDeath' |
  'nbWonSuddenDeath' |
  'nbBonus';

export type SerieModifier = 
  'none' | 
  'cumulated' |
  'pct' |
  'smooth' |
  'minimum' |
  'maximum' |
  'mean' |
  'median' |
  'regression';

export const chartSerieSchema = t.array(
  t.type({
    key: t.string,
    shouldDisplay: t.boolean,
    value: t.number,
  })
);

export type ChartSerieResponse = t.TypeOf<typeof chartSerieSchema>;

export type ChartSerieQueryParams = {
  type: SerieType;
  date: string;
  modifier: SerieModifier;
  playerFilter: string;
  sampling: Sampling;
  chartDate: string;
};

export const useGetChartSerie = (): ApiHookReturnType<ChartSerieResponse, ChartSerieQueryParams> => {
  const [foldData, fetchApi] = useApi<ChartSerieResponse, ChartSerieQueryParams>({
    path: '/api/chartSerie',
    schema: chartSerieSchema,
  });

  return [foldData, fetchApi];
};
