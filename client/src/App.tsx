import React from 'react';
import { Store } from 'redux';
import { Provider, connect } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  RouteProps
} from 'react-router-dom';

import logo from './logo.svg';
import './App.css';

import { AppState } from './store';

const Home: React.FunctionComponent = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

interface ConnectedProps {
  isLogged: boolean;
}

const PrivateRoute: React.FunctionComponent<RouteProps & ConnectedProps> = ({ isLogged, children, ...rest }) => {
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

const ConnectedPrivateRoute = connect((state: AppState) => ({
  isLogged: state.user.token !== '',
}))(PrivateRoute);

const App: React.FunctionComponent<{store: Store<AppState>}> = ({ store }) => {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <ConnectedPrivateRoute path="/protected">
            <Home />
          </ConnectedPrivateRoute>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
