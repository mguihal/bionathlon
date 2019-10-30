import React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import { AppState } from './store';

import AuthRoute from './components/AuthRoute';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';

interface Props {
  store: Store<AppState>;
};

const App: React.FunctionComponent<Props> = (props) => {
  return (
    <Provider store={props.store}>
      <Router>
        <Switch>
          <AuthRoute path="/protected">
            <DashboardPage />
          </AuthRoute>
          <Route exact path="/login">
            <LoginPage />
          </Route>
          <Route path = "/">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
