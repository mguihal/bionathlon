import { StatsResponse } from '../sagas/api';

export const STATS_FETCH = 'STATS_FETCH';
export const STATS_FETCHED = 'STATS_FETCHED';
export const STATS_FETCHED_ERROR = 'STATS_FETCHED_ERROR';

export interface StatsFetch {
  type: typeof STATS_FETCH;
  dateFilter?: string;
}

export interface StatsFetched {
  type: typeof STATS_FETCHED;
  stats: StatsResponse;
}

export interface StatsFetchedError {
  type: typeof STATS_FETCHED_ERROR;
  error: string;
}

export type StatsAction = StatsFetch | StatsFetched | StatsFetchedError;

export function fetchStats(dateFilter?: string): StatsFetch {
  return {
    type: STATS_FETCH,
    dateFilter,
  };
}

export function statsFetched(stats: StatsResponse): StatsFetched {
  return {
    type: STATS_FETCHED,
    stats,
  };
}

export function statsFetchedError(error: string): StatsFetchedError {
  return {
    type: STATS_FETCHED_ERROR,
    error,
  };
}
