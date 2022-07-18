import React from 'react';
import { connect } from 'react-redux'
import {
  Navigate,
  useLocation
} from 'react-router-dom';

import { AppState } from '../store';

interface ConnectedProps {
  isLogged: boolean;
}

const AuthRoute = (props: ConnectedProps & { children: JSX.Element; }) => {
  const { isLogged, children } = props;
  const location = useLocation();

  if (!isLogged) {
    return <Navigate to={'/login'} state={{ from: location }} />;
  }

  return children;
}

export default connect<ConnectedProps, {}, {}, AppState>(state => ({
  isLogged: state.user.token !== '',
}))(AuthRoute);
