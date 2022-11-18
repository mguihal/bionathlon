import React, { useCallback, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { GoogleLogin, GoogleLoginResponse } from 'react-google-login';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import styles from './LoginPage.module.css';

import logo from '../assets/logo.png';
import { useAuth } from '../services/auth';
import { useLogin } from '../services/user';

const LoginPage = () => {
  const [queryParams] = useSearchParams();
  const queryToken = queryParams.get('token');
  const queryRedirect = queryParams.get('redirect');
  const queryExpired = queryParams.get('expired') !== null;

  const { getToken, getUser, login } = useAuth();
  const [, logUser] = useLogin();

  const isLogged = getToken() !== '';

  const [loginError, setLoginError] = useState(queryExpired ? 'Session expirée' : '');

  const onError = useCallback((errorDetails: string) => {
    setLoginError(`Erreur Google Auth: ${errorDetails || 'Erreur inconnue'}`);
  }, []);

  const onSuccess = useCallback((accessToken: string) => {
    setLoginError('');
    logUser({}, { data: { googleToken: accessToken } }).then(response => {
      response.fold(
        (payload) => login(payload.token, payload.user),
        (error) => setLoginError(error.message),
        () => {},
      );
    });
  }, [logUser, login]);

  if (queryToken) {
    const tokenObject = JSON.parse(atob(queryToken));
    login(tokenObject.token, tokenObject.user);
  }

  if (!queryToken && window.location.origin !== process.env.REACT_APP_LOGIN_ORIGIN) {
    window.location.href = `${process.env.REACT_APP_LOGIN_ORIGIN}/login?redirect=${window.location.href}`;
    return null;
  }

  if (isLogged) {
    if (queryRedirect) {
      const tokenPayload = btoa(JSON.stringify({ token: getToken(), user: getUser() }));
      window.location.href = `${queryRedirect}?token=${tokenPayload}`;
      return null;
    }

    return <Navigate to={'/'} />;
  }

  return (
    <div className={styles.page}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={loginError !== ''}
        message={loginError}
      />
      <div className={styles.loginBox}>
        <img src={logo} className={styles.loginLogo} alt="logo" />
        <GoogleLogin
          clientId="459868567762-0roa3b365fl7d9hv63pd1hauoi0ohkmd.apps.googleusercontent.com"
          buttonText="Se connecter"
          onSuccess={(payload) => onSuccess((payload as GoogleLoginResponse).tokenId)}
          onFailure={(payload) => onError(payload.details)}
          cookiePolicy={'single_host_origin'}
          className={styles.loginButton}
          render={renderProps => (
            <Button
              variant="contained"
              color="primary"
              className={styles.loginButton}
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
            >
              Se connecter
            </Button>
          )}
        />
      </div>
    </div>
  );
}

export default LoginPage;
