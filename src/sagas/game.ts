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
  GAMES_FETCH,
  GamesFetch,
  gamesFetched,
  gamesFetchedError,
  GAME_ADD,
  GameAdd,
  gameAdded,
  gameAddedError,
  gameAddReset,
  SuddenDeathSet,
  SUDDEN_DEATH_SET,
  fetchAllGames,
  fetchToday,
  GAMES_MONTHS_FETCH,
  gamesMonthsFetched,
  gamesMonthsFetchedError,
} from '../actionCreators/game';

import {
  getGames,
  GamesResponse,
  getGamesMonths,
  MonthsResponse,
  addGame,
  setSuddenDeathWinner,
} from './api';

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

function* fetchAllGamesSaga() {
  yield takeLatest(ALLGAMES_FETCH, function*() {
    try {
      const response: GamesResponse = yield call(getGames);

      yield put(allGamesFetched(response));
    } catch (error) {
      yield put(allGamesFetchedError(error.message));
    }
  });
}

function* fetchGamesSaga() {
  yield takeLatest<GamesFetch>(GAMES_FETCH, function*(action) {
    try {
      const response: GamesResponse = yield call(getGames, {
        ...action.filters,
      });

      yield put(gamesFetched(response));
    } catch (error) {
      yield put(gamesFetchedError(error.message));
    }
  });
}

function* fetchGamesMonthsSaga() {
  yield takeLatest(GAMES_MONTHS_FETCH, function*() {
    try {
      const response: MonthsResponse = yield call(getGamesMonths);

      yield put(gamesMonthsFetched(response));
    } catch (error) {
      yield put(gamesMonthsFetchedError(error.message));
    }
  });
}

function* addGameSaga() {
  yield takeLatest<GameAdd>(GAME_ADD, function*(action) {
    try {
      yield call(
        addGame,
        action.date,
        action.time,
        action.playerId,
        action.score,
        action.scoreLeftBottle,
        action.scoreMiddleBottle,
        action.scoreRightBottle,
        action.scoreMalusBottle,
        action.note
      );
      yield put(gameAdded());
    } catch (error) {
      yield put(gameAddedError(error.message));

      console.log({error});
    }

    yield delay(3000);
    yield put(gameAddReset());
  });
}

function* setSuddenDeathWinnerSaga() {
  yield takeLatest<SuddenDeathSet>(SUDDEN_DEATH_SET, function*(action) {
    try {
      yield call(setSuddenDeathWinner, action.gameId);

      if (action.context === 'today') {
        yield put(fetchToday());
      } else {
        yield put(fetchAllGames());
      }
    } catch (error) {
      console.log({error});
    }
  });
}

function* gameSaga() {
  yield all([
    fetchTodaySaga(),
    fetchPlayerGames(),
    fetchAllGamesSaga(),
    fetchGamesSaga(),
    fetchGamesMonthsSaga(),
    addGameSaga(),
    setSuddenDeathWinnerSaga(),
  ]);
}

export default gameSaga;
