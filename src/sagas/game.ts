import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import {
  AllGamesFetch,
  allGamesFetched,
  allGamesFetchedError,
  ALLGAMES_FETCH,
  fetchAllGames,
  fetchToday,
  GameAdd,
  gameAdded,
  gameAddedError,
  gameAddReset,
  GAME_ADD,
  PlayerGamesFetch,
  playerGamesFetched,
  playerGamesFetchedError,
  PLAYERGAMES_FETCH,
  SuddenDeathSet,
  SUDDEN_DEATH_SET,
  todayFetched,
  todayFetchedError,
  TODAY_FETCH,
} from '../actionCreators/game';
import { addGame, GamesResponse, getGames, setSuddenDeathWinner } from './api';

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
    } catch (e) {
      const error = e as Error;
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
    } catch (e) {
      const error = e as Error;
      yield put(playerGamesFetchedError(error.message));
    }
  });
}

function* fetchAllGamesSaga() {
  yield takeLatest<AllGamesFetch>(ALLGAMES_FETCH, function*(action) {
    try {
      const response: GamesResponse = yield call(getGames, {
        limit: action.limit,
        offset: action.offset,
      });

      yield put(allGamesFetched(response));
    } catch (e) {
      const error = e as Error;
      yield put(allGamesFetchedError(error.message));
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
        action.note,
      );
      yield put(gameAdded());
    } catch (e) {
      const error = e as Error;
      yield put(gameAddedError(error.message));

      console.log({ error });
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
        yield put(fetchAllGames(10, 0));
      }
    } catch (error) {
      console.log({ error });
    }
  });
}

function* gameSaga() {
  yield all([
    fetchTodaySaga(),
    fetchPlayerGames(),
    fetchAllGamesSaga(),
    addGameSaga(),
    setSuddenDeathWinnerSaga(),
  ]);
}

export default gameSaga;
