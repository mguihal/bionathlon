import { PlayersResponse } from '../sagas/api';

export const PLAYERS_FETCH = 'PLAYERS_FETCH';
export const PLAYERS_FETCHED = 'PLAYERS_FETCHED';
export const PLAYERS_FETCHED_ERROR = 'PLAYERS_FETCHED_ERROR';
export const PLAYER_ADD = 'PLAYER_ADD';
export const PLAYER_ADD_RESET = 'PLAYER_ADD_RESET';
export const PLAYER_ADDED = 'PLAYER_ADDED';
export const PLAYER_ADDED_ERROR = 'PLAYER_ADDED_ERROR';

export interface PlayersFetch {
  type: typeof PLAYERS_FETCH;
}

export interface PlayersFetched {
  type: typeof PLAYERS_FETCHED;
  players: PlayersResponse;
}

export interface PlayersFetchedError {
  type: typeof PLAYERS_FETCHED_ERROR;
  error: string;
}

export interface PlayerAdd {
  type: typeof PLAYER_ADD;
  email: string;
  name: string;
}

export interface PlayerAddReset {
  type: typeof PLAYER_ADD_RESET;
}

export interface PlayerAdded {
  type: typeof PLAYER_ADDED;
}

export interface PlayerAddedError {
  type: typeof PLAYER_ADDED_ERROR;
  error: string;
}

export type PlayerAction =
  | PlayersFetch
  | PlayersFetched
  | PlayersFetchedError
  | PlayerAdd
  | PlayerAddReset
  | PlayerAdded
  | PlayerAddedError;

export function fetchPlayers(): PlayersFetch {
  return {
    type: PLAYERS_FETCH,
  };
}

export function playersFetched(players: PlayersResponse): PlayersFetched {
  return {
    type: PLAYERS_FETCHED,
    players,
  };
}

export function playersFetchedError(error: string): PlayersFetchedError {
  return {
    type: PLAYERS_FETCHED_ERROR,
    error,
  };
}

export function addPlayer(email: string, name: string): PlayerAdd {
  return {
    type: PLAYER_ADD,
    email,
    name,
  };
}

export function playerAddReset(): PlayerAddReset {
  return {
    type: PLAYER_ADD_RESET,
  };
}

export function playerAdded(): PlayerAdded {
  return {
    type: PLAYER_ADDED,
  };
}

export function playerAddedError(error: string): PlayerAddedError {
  return {
    type: PLAYER_ADDED_ERROR,
    error,
  };
}
