import React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

import { AppState } from './store';

import AuthRoute from './components/AuthRoute';
import LoginPage from './components/LoginPage';
import Page from './components/Page';

const theme = createTheme({
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
        <BrowserRouter>
          <Routes>
            <Route path="/profile/:playerId" element={<AuthRoute><Page /></AuthRoute>} />
            <Route path="/history" element={<AuthRoute><Page /></AuthRoute>} />
            <Route path="/ranking" element={<AuthRoute><Page /></AuthRoute>} />
            <Route path="/charts" element={<AuthRoute><Page /></AuthRoute>} />
            <Route path="/rules" element={<AuthRoute><Page /></AuthRoute>} />
            <Route path="/addPlayer" element={<AuthRoute><Page /></AuthRoute>} />
            <Route path="/addGame" element={<AuthRoute><Page /></AuthRoute>} />
            <Route path="/" element={<AuthRoute><Page /></AuthRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </MuiThemeProvider>
    </Provider>
  );
}

export default App;
