import { Dataway, failure, loading, notAsked, success } from 'dataway';
import {
  StatsAction,
  STATS_FETCH,
  STATS_FETCHED,
  STATS_FETCHED_ERROR,
} from '../actionCreators/stats';
import { StatsResponse } from '../sagas/api';

interface StatsState {
  data: Dataway<string, StatsResponse>;
}

const statsInitialState: StatsState = {
  data: notAsked,
};

export default function(
  state: StatsState = statsInitialState,
  action: StatsAction,
) {
  switch (action.type) {
    case STATS_FETCH:
      return { ...state, data: loading };
    case STATS_FETCHED:
      return { ...state, data: success(action.stats) };
    case STATS_FETCHED_ERROR:
      return { ...state, data: failure(action.error) };
    default:
      return state;
  }
}
