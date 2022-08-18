import React from 'react';
import { Navigate } from 'react-router-dom';

import { GoogleLogin, GoogleLoginResponse } from 'react-google-login';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import { googleLoginSucceeded, googleLoginFailed, loginSucceeded } from '../actionCreators/user';

import styles from '../App.module.css';

import logo from './logo.png';
import { AppState } from '../store';
import { useDispatch, useSelector } from 'react-redux';

type UserType = AppState['user']['user'];

const LoginPage = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const queryToken = queryParams.get('token');
  const queryRedirect = queryParams.get('redirect');

  const dispatch = useDispatch();

  const isLogged = useSelector<AppState, boolean>(state => state.user.token !== '');
  const loginError = useSelector<AppState, string>(state => state.user.loginError);
  const token = useSelector<AppState, string>(state => state.user.token);
  const user = useSelector<AppState, UserType>(state => state.user.user);

  if (queryToken) {
    const tokenObject = JSON.parse(atob(queryToken));

    localStorage.setItem('token', tokenObject.token);
    localStorage.setItem('user', JSON.stringify(tokenObject.user));

    dispatch(loginSucceeded(tokenObject.token, tokenObject.user));
  }

  if (!queryToken && window.location.origin !== process.env.REACT_APP_LOGIN_ORIGIN) {
    window.location.href = `${process.env.REACT_APP_LOGIN_ORIGIN}/login?redirect=${window.location.href}`;
    return null;
  }

  if (isLogged) {
    if (queryRedirect) {
      const tokenPayload = btoa(JSON.stringify({ token, user }));
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
          onSuccess={(payload) => dispatch(googleLoginSucceeded((payload as GoogleLoginResponse).tokenId))}
          onFailure={(payload) => dispatch(googleLoginFailed(payload.error, payload.details))}
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
