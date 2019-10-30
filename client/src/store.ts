import { createStore, combineReducers, applyMiddleware } from 'redux';

const userInitialState: {token: string} = {
  token: ''
};

const reducers = combineReducers({
  user: (state: {token: string} = userInitialState, action) => {
    return state;
  }
});

export default () => createStore(reducers, applyMiddleware());

export type AppState = ReturnType<typeof reducers>
