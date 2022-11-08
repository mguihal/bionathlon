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
  const token: ReturnType<typeof getToken> = yield select<typeof getToken>(getToken);

  const response: Response = yield call(fetch, `${HOST}/api${path}`, {
    method,
    headers: {
      Authorization: authenticated ? token : '',
    },
    body: body ? JSON.stringify(body) : null,
  });

  switch (response.status) {
    case 200:
      const parsed: object = yield call([response, 'json']);
      return parsed;
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
      const content: { error: string } = yield call([response, 'json']);
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
  const response: LoginResponse = yield call(doRequest, '/login', 'POST', false, {
    data: {
      googleToken: accessToken,
    },
  });
  return response;
}

export interface GameResponse {
  id: number;
  date: string;
  time: string;
  playerId: number;
  playerName: string;
  score: number | null;
  scoreLeftBottle: number | null;
  scoreMiddleBottle: number | null;
  scoreRightBottle: number | null;
  scoreMalusBottle: number | null;
  note: string;
  suddenDeath: boolean;
}

export type GamesResponse = GameResponse[];

export function* getGames(
  filters?: Partial<{
    date: string;
    playerId: number;
    limit: number;
    offset: number;
  }>,
) {
  let filtersQuery = [];

  if (filters && filters.date) {
    filtersQuery.push(`date=${filters.date}`);
  }

  if (filters && filters.playerId !== undefined) {
    filtersQuery.push(`playerId=${filters.playerId}`);
  }

  if (filters && filters.limit !== undefined) {
    filtersQuery.push(`limit=${filters.limit}`);
  }

  if (filters && filters.offset !== undefined) {
    filtersQuery.push(`offset=${filters.offset}`);
  }

  const response: GameResponse = yield call(
    doRequest,
    `/game${filtersQuery ? '?' + filtersQuery.join('&') : ''}`,
    'GET',
    true,
  );
  return response;
}

export interface PlayerResponse {
  id: number;
  email: string;
  name: string;
  avatar: string;
}

export type PlayersResponse = PlayerResponse[];

export function* getPlayers() {
  const response: PlayersResponse = yield call(doRequest, `/player`, 'GET', true);
  return response;
}

export function* addPlayer(email: string, name: string) {
  const response: {} = yield call(doRequest, '/player', 'POST', true, {
    data: {
      email,
      name,
    },
  });
  return response;
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

  const response: {} = yield call(doRequest, '/game', 'POST', true, { data: filteredData });
  return response;
}

export function* setSuddenDeathWinner(gameId: number) {
  const response: {} = yield call(doRequest, '/suddenDeath', 'PUT', true, {
    data: {
      gameId,
      won: true,
    },
  });
  return response;
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

export function* getStats(filters?: Partial<{ dateFilter: string }>) {
  let filtersQuery = [];

  if (filters && filters.dateFilter) {
    filtersQuery.push(`dateFilter=${filters.dateFilter}`);
  }

  const response: StatsResponse = yield call(
    doRequest,
    `/stats${filtersQuery ? '?' + filtersQuery.join('&') : ''}`,
    'GET',
    true,
  );
  return response;
}
