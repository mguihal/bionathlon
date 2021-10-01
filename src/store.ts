import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import gameReducer from './reducers/game';
import playerReducer from './reducers/player';
import statsReducer from './reducers/stats';
import userReducer from './reducers/user';
import gameSaga from './sagas/game';
import logSaga from './sagas/log';
import playerSaga from './sagas/player';
import statsSaga from './sagas/stats';
import userSaga from './sagas/user';

const reducers = combineReducers({
  user: userReducer,
  game: gameReducer,
  player: playerReducer,
  stats: statsReducer,
});

const sagaMiddleware = createSagaMiddleware();

export default createStore(reducers, applyMiddleware(sagaMiddleware));
export type AppState = ReturnType<typeof reducers>;

sagaMiddleware.run(logSaga);
sagaMiddleware.run(userSaga);
sagaMiddleware.run(gameSaga);
sagaMiddleware.run(playerSaga);
sagaMiddleware.run(statsSaga);
