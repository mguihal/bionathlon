import React from 'react';

export type RecapData = {
  nbGames: number;
  nbGamesPreviousYear: number;
  nbGamesMidday: number;
  nbGamesAllPlayers: number;
  pctBottles: number;
  nbBottles: number;
  nbBonus: number;
  nbMalus: number;
  nbSuddenDeath: number;
  nbWonSuddenDeath: number;
  bestDate: string;
  bestPoints: number;
  bestLeft: number;
  bestMiddle: number;
  bestRight: number;
  bestMalus: number;
};

const RecapContext = React.createContext<RecapData>({
  nbGames: 0,
  nbGamesPreviousYear: 0,
  nbGamesMidday: 0,
  nbGamesAllPlayers: 0,
  pctBottles: 0,
  nbBottles: 0,
  nbBonus: 0,
  nbMalus: 0,
  nbSuddenDeath: 0,
  nbWonSuddenDeath: 0,
  bestDate: '',
  bestPoints: 0,
  bestLeft: 0,
  bestMiddle: 0,
  bestRight: 0,
  bestMalus: 0,
});

export const useRecapData = () => {
  const data = React.useContext(RecapContext);

  if (!data) {
    throw new Error('Use recap data outside of its context');
  }

  return data as RecapData;
};

export default RecapContext;
