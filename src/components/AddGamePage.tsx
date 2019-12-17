import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { Dataway, isSuccess, isFailure, fold } from 'dataway';

import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import { AppState } from '../store';
import { fetchPlayers } from '../actionCreators/player';
import { addGame } from '../actionCreators/game';

import { PlayersResponse } from '../sagas/api';

import styles from '../App.module.css';

interface ConnectedProps {
  players: Dataway<string, PlayersResponse>;
  currentUserId: number;
  addResponse: Dataway<string, any>;
}

interface DispatchedProps {
  fetchPlayers: () => {type: string};
  addGame: (date: string, time: string, playerId: number, score: number, note: string) => {type: string};
}

const AddGamePage: React.FunctionComponent<ConnectedProps & DispatchedProps> = (props) => {

  const { players, currentUserId, fetchPlayers, addResponse } = props;

  const currentTime = new Date();

  const [playerId, setPlayerId] = useState<number>(currentUserId);
  const [score, setScore] = useState<number | ''>('');
  const [note, setNote] = useState<string>('');
  const [time, setTime] = useState<string>(currentTime.getHours() < 15 ? 'midday' : 'evening');
  const [date, setDate] = useState<Date>(currentTime);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (score !== '') {
      props.addGame(date.toISOString(), time, playerId, score, note);
    }
  }

  if (isSuccess(addResponse)) {
    return <Redirect to={'/'} />;
  }

  return (
    <>
      <form noValidate autoComplete="off" className={styles.addPlayerForm} onSubmit={onSubmit}>
        <Typography variant="h6">
          Ajout d'un score
        </Typography>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            margin="normal"
            id="date"
            label="Date"
            format="dd/MM/yyyy"
            value={date}
            onChange={date => setDate(date || (new Date()))}
            autoOk
            disableFuture
          />
        </MuiPickersUtilsProvider>
        <RadioGroup name="time2" value={time} onChange={e => setTime(e.target.value as string)} row style={{
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <FormControlLabel
            value="midday"
            control={<Radio color="primary" />}
            label="Midi"
            labelPlacement="start"
          />
          <FormControlLabel
            value="evening"
            control={<Radio color="primary" />}
            label="Soir"
            labelPlacement="start"
          />
        </RadioGroup>
        <Select
          id="playerId"
          value={playerId}
          onChange={e => setPlayerId(Number(e.target.value))}
        >
          {
            fold<string, PlayersResponse, JSX.Element[]>(
              () => [<MenuItem key={'notAsked'} value={currentUserId} disabled></MenuItem>],
              () => [<MenuItem key={'loading'} value={currentUserId} disabled>{'Chargement...'}</MenuItem>],
              (error) => [<MenuItem key={'error'} value={currentUserId} disabled>{'Erreur de récupération'}</MenuItem>],
              (players) => players.map(player => <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>)
            )(players)
          }
        </Select>
        <TextField
          type="number"
          id="score"
          label="Score"
          value={score}
          onChange={e => setScore(Number(e.target.value))}
        />
        <TextField
          id="note"
          label="Note (facultatif)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <Button type="submit" color="primary" variant="contained" disabled={score === '' || !isSuccess(players)}>Ajouter</Button>
        <Button type="submit" variant="contained" component={Link} to="/">Retour</Button>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={isSuccess(addResponse) || isFailure(addResponse)}
        >
          <SnackbarContent
            style={{background: isSuccess(addResponse) ? '#479F4C' : '#D13135'}}
            message={(
              <span>{
                fold<string, any, string>(
                  () => '',
                  () => '',
                  (error) => error,
                  () => 'Le score a été ajouté'
                )(addResponse)
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
    addResponse: state.game.addResponse,
    currentUserId: state.user.user.id,
    players: state.player.list,
  }),
  dispatch => ({
    fetchPlayers: () => dispatch(fetchPlayers()),
    addGame: (date, time, playerId, score, note) => dispatch(addGame(date, time, playerId, score, note)),
  })
)(AddGamePage);
