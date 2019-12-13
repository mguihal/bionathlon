import { GamesResponse } from '../sagas/api';

export const TODAY_FETCH = 'TODAY_FETCH';
export const TODAY_FETCHED = 'TODAY_FETCHED';
export const TODAY_FETCHED_ERROR = 'TODAY_FETCHED_ERROR';
export const PLAYERGAMES_FETCH = 'PLAYERGAMES_FETCH';
export const PLAYERGAMES_FETCHED = 'PLAYERGAMES_FETCHED';
export const PLAYERGAMES_FETCHED_ERROR = 'PLAYERGAMES_FETCHED_ERROR';
export const ALLGAMES_FETCH = 'ALLGAMES_FETCH';
export const ALLGAMES_FETCHED = 'ALLGAMES_FETCHED';
export const ALLGAMES_FETCHED_ERROR = 'ALLGAMES_FETCHED_ERROR';
export const GAME_ADD = 'GAME_ADD';
export const GAME_ADD_RESET = 'GAME_ADD_RESET';
export const GAME_ADDED = 'GAME_ADDED';
export const GAME_ADDED_ERROR = 'GAME_ADDED_ERROR';
export const SUDDEN_DEATH_SET = 'SUDDEN_DEATH_SET';

export interface TodayFetch {
  type: typeof TODAY_FETCH;
}

export interface TodayFetched {
  type: typeof TODAY_FETCHED;
  games: GamesResponse;
}

export interface TodayFetchedError {
  type: typeof TODAY_FETCHED_ERROR;
  error: string;
}

export interface PlayerGamesFetch {
  type: typeof PLAYERGAMES_FETCH;
  playerId: number;
}

export interface PlayerGamesFetched {
  type: typeof PLAYERGAMES_FETCHED;
  games: GamesResponse;
}

export interface PlayerGamesFetchedError {
  type: typeof PLAYERGAMES_FETCHED_ERROR;
  error: string;
}

export interface AllGamesFetch {
  type: typeof ALLGAMES_FETCH;
}

export interface AllGamesFetched {
  type: typeof ALLGAMES_FETCHED;
  games: GamesResponse;
}

export interface AllGamesFetchedError {
  type: typeof ALLGAMES_FETCHED_ERROR;
  error: string;
}

export interface GameAdd {
  type: typeof GAME_ADD;
  date: string;
  time: 'midday' | 'evening';
  playerId: number;
  score: number;
  note: string;
}

export interface GameAddReset {
  type: typeof GAME_ADD_RESET;
}

export interface GameAdded {
  type: typeof GAME_ADDED;
}

export interface GameAddedError {
  type: typeof GAME_ADDED_ERROR;
  error: string;
}

export interface SuddenDeathSet {
  type: typeof SUDDEN_DEATH_SET;
  gameId: number;
  context: string;
}

export type GameAction =
  | TodayFetch
  | TodayFetched
  | TodayFetchedError
  | PlayerGamesFetch
  | PlayerGamesFetched
  | PlayerGamesFetchedError
  | AllGamesFetch
  | AllGamesFetched
  | AllGamesFetchedError
  | GameAdd
  | GameAddReset
  | GameAdded
  | GameAddedError
  | SuddenDeathSet;

export function fetchToday(): TodayFetch {
  return {
    type: TODAY_FETCH,
  };
}

export function todayFetched(games: GamesResponse): TodayFetched {
  return {
    type: TODAY_FETCHED,
    games,
  };
}

export function todayFetchedError(error: string): TodayFetchedError {
  return {
    type: TODAY_FETCHED_ERROR,
    error,
  };
}

export function fetchPlayerGames(playerId: number): PlayerGamesFetch {
  return {
    type: PLAYERGAMES_FETCH,
    playerId,
  };
}

export function playerGamesFetched(games: GamesResponse): PlayerGamesFetched {
  return {
    type: PLAYERGAMES_FETCHED,
    games,
  };
}

export function playerGamesFetchedError(error: string): PlayerGamesFetchedError {
  return {
    type: PLAYERGAMES_FETCHED_ERROR,
    error,
  };
}

export function fetchAllGames(): AllGamesFetch {
  return {
    type: ALLGAMES_FETCH,
  };
}

export function allGamesFetched(games: GamesResponse): AllGamesFetched {
  return {
    type: ALLGAMES_FETCHED,
    games,
  };
}

export function allGamesFetchedError(error: string): AllGamesFetchedError {
  return {
    type: ALLGAMES_FETCHED_ERROR,
    error,
  };
}

export function addGame(
  date: string,
  time: string,
  playerId: number,
  score: number,
  note: string,
): GameAdd {
  return {
    type: GAME_ADD,
    date,
    time: time as GameAdd['time'],
    playerId,
    score,
    note,
  };
}

export function gameAddReset(): GameAddReset {
  return {
    type: GAME_ADD_RESET,
  };
}

export function gameAdded(): GameAdded {
  return {
    type: GAME_ADDED,
  };
}

export function gameAddedError(error: string): GameAddedError {
  return {
    type: GAME_ADDED_ERROR,
    error,
  };
}

export function setSuddenDeathWinner(
  gameId: number,
  context: string
): SuddenDeathSet {
  return {
    type: SUDDEN_DEATH_SET,
    gameId,
    context,
  };
}
