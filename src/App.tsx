import React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { AppState } from './store';

import AuthRoute from './components/AuthRoute';
import LoginPage from './components/LoginPage';
import Page from './components/Page';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#DA6345'
    }
  }
});

interface Props {
  store: Store<AppState>;
};

const App: React.FunctionComponent<Props> = (props) => {
  return (
    <Provider store={props.store}>
      <MuiThemeProvider theme={theme}>
        <Router>
          <Switch>
            <AuthRoute exact path="/profile/:playerId">
              <Page />
            </AuthRoute>
            <AuthRoute exact path="/history">
              <Page />
            </AuthRoute>
            <AuthRoute exact path="/ranking">
              <Page />
            </AuthRoute>
            <AuthRoute exact path="/addPlayer">
              <Page />
            </AuthRoute>
            <AuthRoute exact path="/addGame">
              <Page />
            </AuthRoute>
            <AuthRoute exact path="/">
              <Page />
            </AuthRoute>
            <Route exact path="/login">
              <LoginPage />
            </Route>
            <Route path="/">
              <Redirect to="/login" />
            </Route>
          </Switch>
        </Router>
      </MuiThemeProvider>
    </Provider>
  );
}

export default App;
