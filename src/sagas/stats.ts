import { all, call, put, takeLatest } from 'redux-saga/effects';
import {
  StatsFetch,
  statsFetched,
  statsFetchedError,
  STATS_FETCH,
} from '../actionCreators/stats';
import { getStats, StatsResponse } from './api';

function* fetchStatsSaga() {
  yield takeLatest<StatsFetch>(STATS_FETCH, function*(action) {
    try {
      const response: StatsResponse = yield call(getStats, {
        dateFilter: action.dateFilter,
      });

      yield put(statsFetched(response));
    } catch (e) {
      const error = e as Error;
      yield put(statsFetchedError(error.message));
    }
  });
}

function* statsSaga() {
  yield all([fetchStatsSaga()]);
}

export default statsSaga;
