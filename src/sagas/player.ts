import { all, put, takeLatest, call, delay } from 'redux-saga/effects';
import {
  PLAYERS_FETCH,
  PLAYER_ADD,
  PlayerAdd,
  playersFetched,
  playersFetchedError,
  playerAdded,
  playerAddedError,
  playerAddReset,
} from '../actionCreators/player';

import { getPlayers, addPlayer, PlayersResponse } from './api';

function* fetchPlayersSaga() {
  yield takeLatest(PLAYERS_FETCH, function*() {
    try {
      const response: PlayersResponse = yield call(getPlayers);

      yield put(playersFetched(response));
    } catch (e) {
      const error = e as Error;
      yield put(playersFetchedError(error.message));
    }
  });
}

function* addPlayerSaga() {
  yield takeLatest<PlayerAdd>(PLAYER_ADD, function*(action) {
    try {
      yield call(addPlayer, action.email, action.name);
      yield put(playerAdded());
    } catch (e) {
      const error = e as Error;
      yield put(playerAddedError(error.message));
    }

    yield delay(3000);
    yield put(playerAddReset());
  });
}

function* playerSaga() {
  yield all([fetchPlayersSaga(), addPlayerSaga()]);
}

export default playerSaga;
