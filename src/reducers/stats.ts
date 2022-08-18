/* eslint-disable import/no-anonymous-default-export */
import { RemoteData, failure, pending, initial, success } from '@devexperts/remote-data-ts';
import {
  StatsAction,
  STATS_FETCH,
  STATS_FETCHED,
  STATS_FETCHED_ERROR,
} from '../actionCreators/stats';
import { StatsResponse } from '../sagas/api';

interface StatsState {
  data: RemoteData<string, StatsResponse>;
}

const statsInitialState: StatsState = {
  data: initial,
};

export default function(
  state: StatsState = statsInitialState,
  action: StatsAction,
) {
  switch (action.type) {
    case STATS_FETCH:
      return { ...state, data: pending };
    case STATS_FETCHED:
      return { ...state, data: success(action.stats) };
    case STATS_FETCHED_ERROR:
      return { ...state, data: failure(action.error) };
    default:
      return state;
  }
}
