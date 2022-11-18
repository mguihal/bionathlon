import React from 'react';
import { RecapResponse } from '../../services/recap';

const RecapContext = React.createContext<RecapResponse | null>(null);

export const useRecapData = () => {
  const data = React.useContext(RecapContext);

  if (!data) {
    throw new Error('Use recap data outside of its context');
  }

  return data;
};

export default RecapContext;
