import { call, put, select } from 'redux-saga/effects';
import { logout } from '../actionCreators/user';
import { AppState } from '../store';

const HOST = process.env.REACT_APP_API_HOST;

const getToken = (state: AppState) => state.user.token;

function* doRequest(
  path: string,
  method: string,
  authenticated: boolean,
  body?: any,
) {
  const token = yield select<typeof getToken>(getToken);

  const response = yield call(fetch, `${HOST}/api${path}`, {
    method,
    headers: {
      Authorization: authenticated ? token : null,
    },
    body: body ? JSON.stringify(body) : null,
  });

  switch (response.status) {
    case 200:
      return yield call([response, 'json']);
    case 400:
      throw new Error(`Paramètres de la requête invalides`);
    case 401:
      if (authenticated) {
        yield put(logout('Session expirée'));
      }
      throw new Error(
        authenticated
          ? `Token invalide`
          : `Vous n'êtes pas autorisé à vous connecter`,
      );
    case 500:
      const content = yield call([response, 'json']);
      throw new Error(content.error || 'Erreur inconnue');
    default:
      throw new Error('Erreur inconnue');
  }
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export function* login(accessToken: string) {
  return yield call(doRequest, '/login', 'POST', false, {
    data: {
      googleToken: accessToken,
    },
  });
}

export interface GameResponse {
  id: number;
  date: string;
  time: string;
  playerId: number;
  playerName: string;
  score?: number;
  scoreLeftBottle?: number;
  scoreMiddleBottle?: number;
  scoreRightBottle?: number;
  scoreMalusBottle?: number;
  note: string;
  suddenDeath: boolean;
}

export type GamesResponse = GameResponse[];

export function* getGames(
  filters?: Partial<{ date: string; playerId: number }>,
) {
  let filtersQuery = [];

  if (filters && filters.date) {
    filtersQuery.push(`date=${filters.date}`);
  }

  if (filters && filters.playerId !== undefined) {
    filtersQuery.push(`playerId=${filters.playerId}`);
  }

  return yield call(
    doRequest,
    `/game${filtersQuery ? '?' + filtersQuery.join('&') : ''}`,
    'GET',
    true,
  );
}

export interface PlayerResponse {
  id: number;
  email: string;
  name: string;
}

export type PlayersResponse = PlayerResponse[];

export function* getPlayers() {
  return yield call(doRequest, `/player`, 'GET', true);
}

export function* addPlayer(email: string, name: string) {
  return yield call(doRequest, '/player', 'POST', true, {
    data: {
      email,
      name,
    },
  });
}

export function* addGame(
  date: string,
  time: 'midday' | 'evening',
  playerId: number,
  score: number | null,
  scoreLeftBottle: number | null,
  scoreMiddleBottle: number | null,
  scoreRightBottle: number | null,
  scoreMalusBottle: number | null,
  note: string,
) {
  const data: { [key: string]: any } = {
    date,
    time,
    playerId,
    score,
    scoreLeftBottle,
    scoreMiddleBottle,
    scoreRightBottle,
    scoreMalusBottle,
    note,
  };

  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => value !== null),
  );

  return yield call(doRequest, '/game', 'POST', true, { data: filteredData });
}

export function* setSuddenDeathWinner(gameId: number) {
  return yield call(doRequest, '/suddenDeath', 'PUT', true, {
    data: {
      gameId,
      won: true,
    },
  });
}

interface Rank {
  id: number;
  name: string;
  score: number;
  suffix?: string;
}

export interface StatsResponse {
  nbMatchs: Rank[];
  nbWonMatchs: Rank[];
  pctWonMatchs: Rank[];
  nbPoints: Rank[];
  nbRondelles: Rank[];
  efficiency: Rank[];
  avgPoints: Rank[];
  topScore: Rank[];
}

export function* getStats(filters?: Partial<{ month: string }>) {
  let filtersQuery = [];

  if (filters && filters.month) {
    filtersQuery.push(`month=${filters.month}`);
  }

  return yield call(
    doRequest,
    `/stats${filtersQuery ? '?' + filtersQuery.join('&') : ''}`,
    'GET',
    true,
  );
}
