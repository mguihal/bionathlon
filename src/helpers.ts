import { GamesResponse, GameResponse } from './sagas/api';

export function formatDate(date: string = (new Date()).toISOString()) {
  const dateObject = new Date(date);
  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1;
  const year = dateObject.getFullYear();

  const pad = (n: number) => n < 10 ? `0${n}` : n;

  return `${pad(day)}/${pad(month)}/${year}`;
}

export function groupByDateTime(games: GamesResponse) {
  return games.reduce<{[key: string]: GamesResponse}>(function(groups, game) {
    const groupKey = `${game.date} - ${game.time === 'midday' ? 'midi' : 'soir'}`;
    (groups[groupKey] = groups[groupKey] || []).push(game);

    return groups;
  }, {});
};

export function groupByPlayer(games: GamesResponse) {
  return games.reduce<{[key: string]: GamesResponse}>(function(groups, game) {
    (groups[game.playerId] = groups[game.playerId] || []).push(game);
    return groups;
  }, {});
};

export function byScoreDesc(a: GameResponse, b: GameResponse) {
  if (a.score < b.score) {
    return 1;
  } else if (a.score > b.score) {
    return -1;
  } else {
    return 0;
  }
}

export function byDateTimeDesc(a: GameResponse, b: GameResponse) {
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
  return Math.round(nb*100) / 100;
}

export function isMidDayGame(game: GameResponse) {
  return game.time === 'midday';
}

export function isWinner(game: GameResponse, games: GamesResponse) {
   return games.every(otherGame => {
     return otherGame.playerId === game.playerId || otherGame.score < game.score;
   });
 }

export function getWinner(games: GamesResponse) {
  const sorted = games.sort(byScoreDesc);

  if (sorted.length === 0 || (sorted.length > 1 && sorted[0].score === sorted[1].score)) {
    return null;
  } else {
    return sorted[0].playerId;
  }
}
