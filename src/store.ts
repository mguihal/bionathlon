import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

import userReducer from './reducers/user';
import gameReducer from './reducers/game';
import playerReducer from './reducers/player';

import logSaga from './sagas/log';
import userSaga from './sagas/user';
import gameSaga from './sagas/game';
import playerSaga from './sagas/player';

const reducers = combineReducers({
  user: userReducer,
  game: gameReducer,
  player: playerReducer,
});

const sagaMiddleware = createSagaMiddleware();

export default createStore(reducers, applyMiddleware(sagaMiddleware));
export type AppState = ReturnType<typeof reducers>;

sagaMiddleware.run(logSaga);
sagaMiddleware.run(userSaga);
sagaMiddleware.run(gameSaga);
sagaMiddleware.run(playerSaga);
