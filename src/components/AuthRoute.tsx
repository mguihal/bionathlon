import React from 'react';
import { useSelector } from 'react-redux';
import {
  Navigate,
  useLocation
} from 'react-router-dom';

import { AppState } from '../store';

const AuthRoute = (props: { children: JSX.Element; }) => {
  const { children } = props;
  const location = useLocation();
  const isLogged = useSelector<AppState, boolean>(state => state.user.token !== '');

  if (!isLogged) {
    return <Navigate to={'/login'} state={{ from: location }} />;
  }

  return children;
}

export default AuthRoute;
