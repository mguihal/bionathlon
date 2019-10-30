import React from 'react';
import { connect } from 'react-redux'

import Button from '@material-ui/core/Button';

import styles from '../App.module.css';

import logo from './logo.png';

interface DispatchedProps {
  onLoginClick: () => {type: string};
}

const LoginPage: React.FunctionComponent<DispatchedProps> = (props) => {
  return (
    <div className={styles.page}>
      <img src={logo} className={styles.loginLogo} alt="logo" />
      <Button
        variant="contained"
        color="primary"
        className={styles.loginButton}
        onClick={props.onLoginClick}
      >
        Se connecter
      </Button>
    </div>
  );
}

export default connect<{}, DispatchedProps>(null, dispatch => ({
  onLoginClick: () => dispatch({type: 't'})
}))(LoginPage);
