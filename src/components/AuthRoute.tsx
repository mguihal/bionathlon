import React from 'react';
import { connect } from 'react-redux'
import {
  Route,
  Redirect,
  RouteProps
} from 'react-router-dom';

import { AppState } from '../store';

interface ConnectedProps {
  isLogged: boolean;
}

const AuthRoute: React.FunctionComponent<RouteProps & ConnectedProps> = (props) => {
  const { isLogged, children, ...rest } = props;

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLogged ? (
          children
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: location } }} />
        )
      }
    />
  );
}

export default connect<ConnectedProps, {}, {}, AppState>(state => ({
  isLogged: state.user.token !== '',
}))(AuthRoute);
