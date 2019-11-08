import {
  PlayerAction,
  PLAYERS_FETCH,
  PLAYERS_FETCHED,
  PLAYERS_FETCHED_ERROR,
  PLAYER_ADD,
  PLAYER_ADD_RESET,
  PLAYER_ADDED,
  PLAYER_ADDED_ERROR,
} from '../actionCreators/player';
import { Dataway, notAsked, success, loading, failure } from 'dataway';
import { PlayersResponse } from '../sagas/api';

interface PlayerState {
  list: Dataway<string, PlayersResponse>;
  addResponse: Dataway<string, any>;
}

const playerInitialState: PlayerState = {
  list: notAsked,
  addResponse: notAsked,
};

export default function(
  state: PlayerState = playerInitialState,
  action: PlayerAction,
) {
  switch (action.type) {
    case PLAYERS_FETCH:
      return { ...state, list: loading };
    case PLAYERS_FETCHED:
      return { ...state, list: success(action.players) };
    case PLAYERS_FETCHED_ERROR:
      return { ...state, list: failure(action.error) };
    case PLAYER_ADD:
      return { ...state, addResponse: loading };
      case PLAYER_ADD_RESET:
        return { ...state, addResponse: notAsked };
    case PLAYER_ADDED:
      return { ...state, addResponse: success({}) };
    case PLAYER_ADDED_ERROR:
      return { ...state, addResponse: failure(action.error) };
    default:
      return state;
  }
}
