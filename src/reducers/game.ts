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
  GAMES_FETCH,
  GAMES_FETCHED,
  GAMES_FETCHED_ERROR,
  GAMES_MONTHS_FETCH,
  GAMES_MONTHS_FETCHED,
  GAMES_MONTHS_FETCHED_ERROR,
  GAME_ADD,
  GAME_ADD_RESET,
  GAME_ADDED,
  GAME_ADDED_ERROR,
} from '../actionCreators/game';
import { GamesResponse, MonthsResponse } from '../sagas/api';
import { Dataway, notAsked, success, loading, failure } from 'dataway';

interface GameState {
  today: Dataway<string, GamesResponse>;
  playerGames: Dataway<string, GamesResponse>;
  months: Dataway<string, MonthsResponse>;
  allGames: Dataway<string, GamesResponse>;
  games: Dataway<string, GamesResponse>;
  addResponse: Dataway<string, any>;
}

const gameInitialState: GameState = {
  today: notAsked,
  playerGames: notAsked,
  months: notAsked,
  allGames: notAsked,
  games: notAsked,
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
    case GAMES_FETCH:
      return { ...state, games: loading };
    case GAMES_FETCHED:
      return { ...state, games: success(action.games) };
    case GAMES_FETCHED_ERROR:
      return { ...state, games: failure(action.error) };
    case GAMES_MONTHS_FETCH:
      return { ...state, months: loading };
    case GAMES_MONTHS_FETCHED:
      return { ...state, months: success(action.months) };
    case GAMES_MONTHS_FETCHED_ERROR:
      return { ...state, months: failure(action.error) };
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
