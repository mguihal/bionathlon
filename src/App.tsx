import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import { GoogleOAuthProvider } from '@react-oauth/google';

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

const App = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <GoogleOAuthProvider clientId="459868567762-0roa3b365fl7d9hv63pd1hauoi0ohkmd.apps.googleusercontent.com">
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
      </GoogleOAuthProvider>
    </MuiThemeProvider>
  );
}

export default App;
