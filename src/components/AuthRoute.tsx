import React from 'react';
import {
  Navigate,
  useLocation
} from 'react-router-dom';
import { useAuth } from '../services/auth';

const AuthRoute = (props: { children: JSX.Element; }) => {
  const { children } = props;
  const location = useLocation();
  const { getToken } = useAuth();
  const isLogged = getToken() !== '';

  if (!isLogged) {
    return <Navigate to={'/login'} state={{ from: location }} />;
  }

  return children;
}

export default AuthRoute;
