import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { GoogleLogin } from 'react-google-login';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import { googleLoginSucceeded, googleLoginFailed } from '../actionCreators/user';

import styles from '../App.module.css';

import logo from './logo.png';
import { AppState } from '../store';

interface ConnectedProps {
  isLogged: boolean;
  loginError: string;
}

interface DispatchedProps {
  onGoogleLoginSuccess: (payload: any) => {type: string};
  onGoogleLoginFailure: (payload: any) => {type: string};
}

const LoginPage: React.FunctionComponent<ConnectedProps & DispatchedProps> = (props) => {
  if (props.isLogged) {
    return <Redirect to={'/'} />;
  }

  return (
    <div className={styles.page}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={props.loginError !== ''}
        message={props.loginError}
      />
      <div className={styles.loginBox}>
        <img src={logo} className={styles.loginLogo} alt="logo" />
        <GoogleLogin
          clientId="579427653293-meckkd7sqrgu4niut1qf29moqhhk58qp.apps.googleusercontent.com"
          buttonText="Se connecter"
          onSuccess={props.onGoogleLoginSuccess}
          onFailure={props.onGoogleLoginFailure}
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

export default connect<ConnectedProps, DispatchedProps, {}, AppState>(
  state => ({
    isLogged: state.user.token !== '',
    loginError: state.user.loginError,
  }),
  dispatch => ({
    onGoogleLoginSuccess: (payload) => dispatch(googleLoginSucceeded(payload.accessToken)),
    onGoogleLoginFailure: (payload) => dispatch(googleLoginFailed(payload.error, payload.details)),
  })
)(LoginPage);
