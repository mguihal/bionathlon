import { select, call, put } from 'redux-saga/effects';

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
  score: number;
  note: string;
}

export type GamesResponse = GameResponse[];

export function* getGames(
  filters?: Partial<{ date: string; playerId: number }>,
) {
  let filtersQuery = [];

  if (filters && filters.date) {
    filtersQuery.push(`date=${filters.date}`);
  }

  if (filters && filters.playerId) {
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
  score: number,
  note: string,
) {
  return yield call(doRequest, '/game', 'POST', true, {
    data: {
      date,
      time,
      playerId,
      score,
      note,
    },
  });
}
