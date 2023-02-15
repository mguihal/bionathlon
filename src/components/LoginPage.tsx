import React, { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { useGoogleLogin } from '@react-oauth/google';

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

  const [loginError, setLoginError] = useState(
    queryExpired ? 'Session expirée' : '',
  );

  const googleLogin = useGoogleLogin({
    onSuccess: ({ access_token }) => {
      console.log('MAX', access_token);
      setLoginError('');
      logUser({}, { data: { googleToken: access_token } }).then((response) => {
        response.fold(
          (payload) => login(payload.token, payload.user),
          (error) => setLoginError(error.message),
          () => {},
        );
      });
    },
    onError: (errorResponse) => {
      setLoginError(`Erreur Google Auth: ${errorResponse || 'Erreur inconnue'}`);
    }
  });

  if (queryToken) {
    const tokenObject = JSON.parse(atob(queryToken));
    login(tokenObject.token, tokenObject.user);
  }

  if (
    !queryToken &&
    window.location.origin !== process.env.REACT_APP_LOGIN_ORIGIN
  ) {
    window.location.href = `${process.env.REACT_APP_LOGIN_ORIGIN}/login?redirect=${window.location.href}`;
    return null;
  }

  if (isLogged) {
    if (queryRedirect) {
      const tokenPayload = btoa(
        JSON.stringify({ token: getToken(), user: getUser() }),
      );
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
        <Button
          onClick={() => googleLogin()}
          className={styles.loginButton}
          variant="contained"
          color="primary"
        >
          Se connecter
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
