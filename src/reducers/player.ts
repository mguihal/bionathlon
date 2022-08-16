/* eslint-disable import/no-anonymous-default-export */
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
import { RemoteData, initial, success, pending, failure } from '@devexperts/remote-data-ts';
import { PlayersResponse } from '../sagas/api';

interface PlayerState {
  list: RemoteData<string, PlayersResponse>;
  addResponse: RemoteData<string, any>;
}

const playerInitialState: PlayerState = {
  list: initial,
  addResponse: initial,
};

export default function(
  state: PlayerState = playerInitialState,
  action: PlayerAction,
) {
  switch (action.type) {
    case PLAYERS_FETCH:
      return { ...state, list: pending };
    case PLAYERS_FETCHED:
      return { ...state, list: success(action.players) };
    case PLAYERS_FETCHED_ERROR:
      return { ...state, list: failure(action.error) };
    case PLAYER_ADD:
      return { ...state, addResponse: pending };
      case PLAYER_ADD_RESET:
        return { ...state, addResponse: initial };
    case PLAYER_ADDED:
      return { ...state, addResponse: success({}) };
    case PLAYER_ADDED_ERROR:
      return { ...state, addResponse: failure(action.error) };
    default:
      return state;
  }
}
