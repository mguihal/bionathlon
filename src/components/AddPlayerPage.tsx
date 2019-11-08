import React, { useState } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { Dataway, isSuccess, isFailure, fold } from 'dataway';

import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import { AppState } from '../store';
import { addPlayer } from '../actionCreators/player';

import styles from '../App.module.css';

interface ConnectedProps {
  addResponse: Dataway<string, any>;
}

interface DispatchedProps {
  addPlayer: (email: string, name: string) => {type: string};
}

const AddPlayerPage: React.FunctionComponent<ConnectedProps & DispatchedProps> = (props) => {

  const [playerEmail, setPlayerEmail] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [emailError, setEmailError] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');

    if (!playerEmail.includes('@')) {
      setEmailError(`L'email est incorrect`);
      return;
    }

    props.addPlayer(playerEmail, playerName);
  }

  return (
    <>
      <form noValidate autoComplete="off" className={styles.addPlayerForm} onSubmit={onSubmit}>
        <Typography variant="h6">
          Ajout d'un joueur
        </Typography>
        <TextField
          type="email"
          id="email"
          label="Email"
          value={playerEmail}
          onChange={e => setPlayerEmail(e.target.value)}
          error={emailError !== ''}
          helperText={emailError}
        />
        <TextField
          id="name"
          label="Nom"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
        />
        <Button type="submit" color="primary" variant="contained" disabled={playerEmail === '' || playerName === ''}>Ajouter</Button>
        <Button type="submit" variant="contained" component={Link} to="/">Retour</Button>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={isSuccess(props.addResponse) || isFailure(props.addResponse)}
        >
          <SnackbarContent
            style={{background: isSuccess(props.addResponse) ? '#479F4C' : '#D13135'}}
            message={(
              <span>{
                fold<string, any, string>(
                  () => '',
                  () => '',
                  (error) => error,
                  () => 'Le joueur a été ajouté'
                )(props.addResponse)
              }</span>
            )}
          />
        </Snackbar>
      </form>
    </>
  );
}

export default connect<ConnectedProps, DispatchedProps, {}, AppState>(
  state => ({
    addResponse: state.player.addResponse,
  }),
  dispatch => ({
    addPlayer: (email, name) => dispatch(addPlayer(email, name)),
  })
)(AddPlayerPage);
