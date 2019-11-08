import { all, put, takeLatest, call, delay } from 'redux-saga/effects';

import {
  TODAY_FETCH,
  todayFetched,
  todayFetchedError,
  PLAYERGAMES_FETCH,
  PlayerGamesFetch,
  playerGamesFetched,
  playerGamesFetchedError,
  ALLGAMES_FETCH,
  allGamesFetched,
  allGamesFetchedError,
  GAME_ADD,
  GameAdd,
  gameAdded,
  gameAddedError,
  gameAddReset,
} from '../actionCreators/game';

import { getGames, GamesResponse, addGame } from './api';

function getTZToday() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    .toISOString()
    .split('T')[0];
}

function* fetchTodaySaga() {
  yield takeLatest(TODAY_FETCH, function*() {
    try {
      const response: GamesResponse = yield call(getGames, {
        date: getTZToday(),
      });

      yield put(todayFetched(response));
    } catch (error) {
      yield put(todayFetchedError(error.message));
    }
  });
}

function* fetchPlayerGames() {
  yield takeLatest<PlayerGamesFetch>(PLAYERGAMES_FETCH, function*(action) {
    try {
      const response: GamesResponse = yield call(getGames, {
        playerId: action.playerId,
      });

      yield put(playerGamesFetched(response));
    } catch (error) {
      yield put(playerGamesFetchedError(error.message));
    }
  });
}

function* fetchAllGames() {
  yield takeLatest(ALLGAMES_FETCH, function*() {
    try {
      const response: GamesResponse = yield call(getGames);

      yield put(allGamesFetched(response));
    } catch (error) {
      yield put(allGamesFetchedError(error.message));
    }
  });
}

function* addGameSaga() {
  yield takeLatest<GameAdd>(GAME_ADD, function*(action) {
    try {
      yield call(addGame, action.date, action.time, action.playerId, action.score, action.note);
      yield put(gameAdded());
    } catch (error) {
      yield put(gameAddedError(error.message));

      console.log({error});
    }

    yield delay(3000);
    yield put(gameAddReset());
  });
}

function* gameSaga() {
  yield all([
    fetchTodaySaga(),
    fetchPlayerGames(),
    fetchAllGames(),
    addGameSaga(),
  ]);
}

export default gameSaga;
