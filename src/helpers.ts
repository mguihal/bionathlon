import { Game } from './services/games';

export function getTZDate(date: Date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    .toISOString()
    .split('T')[0];
}

export function formatDate(date: string = new Date().toISOString()) {
  const dateObject = new Date(date);
  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1;
  const year = dateObject.getFullYear();

  const pad = (n: number) => (n < 10 ? `0${n}` : n);

  return `${pad(day)}/${pad(month)}/${year}`;
}

export function groupByDateTime(games: Game[]) {
  return games.reduce<{ [key: string]: Game[] }>(function(groups, game) {
    const groupKey = `${(new Date(game.date)).toISOString()} - ${
      game.time === 'midday' ? 'midi' : 'soir'
    }`;
    (groups[groupKey] = groups[groupKey] || []).push(game);

    return groups;
  }, {});
}

export function groupByPlayer(games: Game[]) {
  return games.reduce<{ [key: string]: Game[] }>(function(groups, game) {
    (groups[game.playerId] = groups[game.playerId] || []).push(game);
    return groups;
  }, {});
}

export function byScoreDesc(
  a: Pick<Game, 'score' | 'scoreLeftBottle' | 'scoreMiddleBottle' | 'scoreRightBottle' | 'scoreMalusBottle' | 'suddenDeath'>, 
  b: Pick<Game, 'score' | 'scoreLeftBottle' | 'scoreMiddleBottle' | 'scoreRightBottle' | 'scoreMalusBottle'>
) {
  const scoreA = computeScore(a);
  const scoreB = computeScore(b);

  if (scoreA < scoreB) {
    return 1;
  } else if (scoreA > scoreB) {
    return -1;
  } else {
    return a.suddenDeath ? -1 : 1;
  }
}

export function byDateTimeDesc(a: Game, b: Game) {
  const aKey = `${a.date} - ${a.time === 'midday' ? 'midi' : 'soir'}`;
  const bKey = `${b.date} - ${b.time === 'midday' ? 'midi' : 'soir'}`;

  if (aKey < bKey) {
    return 1;
  } else if (aKey > bKey) {
    return -1;
  } else {
    return 0;
  }
}

interface Rank {
  id: number;
  name: string;
  score: number;
}

export function byScore(a: Rank, b: Rank) {
  if (a.score < b.score) {
    return 1;
  } else if (a.score > b.score) {
    return -1;
  } else {
    return 0;
  }
}

export function round2(nb: number) {
  return Math.round(nb * 100) / 100;
}

export function isMidDayGame(game: Game) {
  return game.time === 'midday';
}

export function isWinner(game: Game, games: Game[]) {
  return games.every(otherGame => {
    if (otherGame.playerId === game.playerId) {
      return true;
    } else if (computeScore(otherGame) < computeScore(game)) {
      return true;
    } else if (otherGame.score === game.score && game.suddenDeath) {
      return true;
    }

    return false;
  });
}

export function getWinner(games: Game[]) {
  const sorted = games.sort(byScoreDesc);

  if (
    sorted.length === 0 ||
    (sorted.length > 1 &&
      computeScore(sorted[0]) === computeScore(sorted[1]) &&
      !sorted[0].suddenDeath)
  ) {
    return null;
  } else {
    return sorted[0].playerId;
  }
}

export function getSuddenDeathGames(games: Game[], checkIfDone: boolean = true) {
  if (games.length === 0) {
    return [];
  }

  const sorted = games.sort(byScoreDesc);
  let isSuddenDeathDone = false;
  let suddenDeathGames: Game[] = [];

  games.forEach(game => {
    if (computeScore(game) === computeScore(sorted[0])) {
      suddenDeathGames.push(game);
      isSuddenDeathDone = isSuddenDeathDone || game.suddenDeath;
    }
  });

  return (checkIfDone && isSuddenDeathDone) || suddenDeathGames.length === 1
    ? []
    : suddenDeathGames;
}

export function computeScore(
  game: Pick<Game, 'score' | 'scoreLeftBottle' | 'scoreMiddleBottle' | 'scoreRightBottle' | 'scoreMalusBottle'>,
  onlyScoreWithBottles: boolean = false,
) {
  const {
    score,
    scoreLeftBottle,
    scoreMiddleBottle,
    scoreRightBottle,
    scoreMalusBottle,
  } = game;

  if (score !== null && score !== undefined) {
    return onlyScoreWithBottles ? 0 : score;
  }

  const bonus =
    Math.min(
      scoreLeftBottle || 0,
      scoreMiddleBottle || 0,
      scoreRightBottle || 0,
    ) * 3;

  return (
    bonus +
    (scoreLeftBottle || 0) +
    (scoreMiddleBottle || 0) +
    (scoreRightBottle || 0) -
    (scoreMalusBottle || 0)
  );
}

export function computeRondelles(
  game: Pick<Game, 'score' | 'scoreLeftBottle' | 'scoreMiddleBottle' | 'scoreRightBottle' | 'scoreMalusBottle'>,
) {
  const {
    score,
    scoreLeftBottle,
    scoreMiddleBottle,
    scoreRightBottle,
    scoreMalusBottle,
  } = game;

  if (score !== null && score !== undefined) {
    return 0;
  }

  return (
    (scoreLeftBottle || 0) +
    (scoreMiddleBottle || 0) +
    (scoreRightBottle || 0) +
    (scoreMalusBottle || 0)
  );
}
