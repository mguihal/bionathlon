import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import styles from './AddPlayerPage.module.css';
import { useAddPlayer } from '../services/players';

const AddPlayerPage = () => {

  const [playerEmail, setPlayerEmail] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [emailError, setEmailError] = useState('');

  const [addPlayerResponse, addPlayer] = useAddPlayer();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');

    if (!playerEmail.includes('@')) {
      setEmailError(`L'email est incorrect`);
      return;
    }

    addPlayer({}, { data: { email: playerEmail, name: playerName } });
  }

  return (
    <>
      <form noValidate autoComplete="off" className={styles.form} onSubmit={onSubmit}>
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
          open={addPlayerResponse.isSuccess() || addPlayerResponse.isError()}
        >
          <SnackbarContent
            style={{background: addPlayerResponse.isSuccess() ? '#479F4C' : '#D13135'}}
            message={(
              <span>{
                addPlayerResponse.fold(
                  () => 'Le joueur a été ajouté',
                  (error) => error.message,
                  () => null,
                )}
              </span>
            )}
          />
        </Snackbar>
      </form>
    </>
  );
}

export default AddPlayerPage;
