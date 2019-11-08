import {
  GameAction,
  TODAY_FETCH,
  TODAY_FETCHED,
  TODAY_FETCHED_ERROR,
  PLAYERGAMES_FETCH,
  PLAYERGAMES_FETCHED,
  PLAYERGAMES_FETCHED_ERROR,
  ALLGAMES_FETCH,
  ALLGAMES_FETCHED,
  ALLGAMES_FETCHED_ERROR,
  GAME_ADD,
  GAME_ADD_RESET,
  GAME_ADDED,
  GAME_ADDED_ERROR,
} from '../actionCreators/game';
import { GamesResponse } from '../sagas/api';
import { Dataway, notAsked, success, loading, failure } from 'dataway';

interface GameState {
  today: Dataway<string, GamesResponse>;
  playerGames: Dataway<string, GamesResponse>;
  allGames: Dataway<string, GamesResponse>;
  addResponse: Dataway<string, any>;
}

const gameInitialState: GameState = {
  today: notAsked,
  playerGames: notAsked,
  allGames: notAsked,
  addResponse: notAsked,
};

export default function(
  state: GameState = gameInitialState,
  action: GameAction,
) {
  switch (action.type) {
    case TODAY_FETCH:
      return { ...state, today: loading };
    case TODAY_FETCHED:
      return { ...state, today: success(action.games) };
    case TODAY_FETCHED_ERROR:
      return { ...state, today: failure(action.error) };
    case PLAYERGAMES_FETCH:
      return { ...state, playerGames: loading };
    case PLAYERGAMES_FETCHED:
      return { ...state, playerGames: success(action.games) };
    case PLAYERGAMES_FETCHED_ERROR:
      return { ...state, playerGames: failure(action.error) };
    case ALLGAMES_FETCH:
      return { ...state, allGames: loading };
    case ALLGAMES_FETCHED:
      return { ...state, allGames: success(action.games) };
    case ALLGAMES_FETCHED_ERROR:
      return { ...state, allGames: failure(action.error) };
    case GAME_ADD:
      return { ...state, addResponse: loading };
    case GAME_ADD_RESET:
      return { ...state, addResponse: notAsked };
    case GAME_ADDED:
      return { ...state, addResponse: success({}) };
    case GAME_ADDED_ERROR:
      return { ...state, addResponse: failure(action.error) };
    default:
      return state;
  }
}
