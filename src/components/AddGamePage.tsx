import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { Dataway, isSuccess, isFailure, fold } from 'dataway';

import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import UpdateIcon from '@material-ui/icons/Update';

import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import { AppState } from '../store';
import { fetchPlayers } from '../actionCreators/player';
import { addGame } from '../actionCreators/game';

import { PlayersResponse } from '../sagas/api';

import { formatDate } from '../helpers';

import BottleScore from './BottleScore';
import MalusBottleScore from './MalusBottleScore';

import styles from '../App.module.css';

interface ConnectedProps {
  players: Dataway<string, PlayersResponse>;
  currentUserId: number;
  currentUserName: string;
  addResponse: Dataway<string, any>;
}

interface DispatchedProps {
  fetchPlayers: () => {type: string};
  addGame: (
    date: string,
    time: string,
    playerId: number,
    score: number | null,
    scoreLeftBottle: number | null,
    scoreMiddleBottle: number | null,
    scoreRightBottle: number | null,
    scoreMalusBottle: number | null,
    note: string
  ) => {type: string};
}

const AddGamePage: React.FunctionComponent<ConnectedProps & DispatchedProps> = (props) => {

  const { players, currentUserId, currentUserName, fetchPlayers, addResponse } = props;

  const currentTime = new Date();

  const [playerId, setPlayerId] = useState<number>(currentUserId);
  const [score, setScore] = useState<number | ''>('');
  const [scoreLeftBottle, setScoreLeftBottle] = useState<number>(0);
  const [scoreMiddleBottle, setScoreMiddleBottle] = useState<number>(0);
  const [scoreRightBottle, setScoreRightBottle] = useState<number>(0);
  const [scoreMalusBottle, setScoreMalusBottle] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [time, setTime] = useState<string>(currentTime.getHours() < 15 ? 'midday' : 'evening');
  const [date, setDate] = useState<Date>(currentTime);
  const [showDateFields, setShowDateFields] = useState<boolean>(false);
  const [showOldScoreField, setShowOldScoreField] = useState<boolean>(false);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const onSubmit = () => {
    if (score !== '' || !showOldScoreField) {
      props.addGame(
        date.toISOString(),
        time,
        playerId,
        showOldScoreField ? Number(score) : null,
        showOldScoreField ? null : scoreLeftBottle,
        showOldScoreField ? null : scoreMiddleBottle,
        showOldScoreField ? null : scoreRightBottle,
        showOldScoreField ? null : scoreMalusBottle,
        note,
      );
    }
  }

  if (isSuccess(addResponse)) {
    return <Redirect to={'/'} />;
  }

  return (
    <>
      <form noValidate autoComplete="off" className={styles.addPlayerForm} onSubmit={(e) => e.preventDefault()}>
        <Typography variant="h6">
          Ajout d'un score
        </Typography>

        <Typography style={{ display: showDateFields ? 'none': 'auto' }}>
          {formatDate(date.toISOString())}
          &nbsp;-&nbsp;
          {time === 'midday' ? 'Midi' : 'Soir'}
          &nbsp;-&nbsp;
          {currentUserName}
          <IconButton size="small" onClick={() => setShowDateFields(val => !val)}>
            <UpdateIcon />
          </IconButton>
        </Typography>

        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            style={{ display: showDateFields ? 'flex': 'none' }}
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
          display: showDateFields ? 'flex': 'none',
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
          style={{ display: showDateFields ? 'flex': 'none' }}
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

        <div className={styles.bottlesContainer} style={{ display: showOldScoreField ? 'none' : 'flex' }}>
          <BottleScore onChange={score => setScoreLeftBottle(score)} />
          <div>
            <MalusBottleScore onChange={score => setScoreMalusBottle(score)} />
            <Typography variant="h6" className={styles.bottlesScoreLabel}>
              Score :
              <span>&nbsp;
                {
                  Math.min(scoreLeftBottle, scoreMiddleBottle, scoreRightBottle) * 3 +
                  scoreLeftBottle +
                  scoreMiddleBottle +
                  scoreRightBottle -
                  scoreMalusBottle
                }
              </span>
            </Typography>
            <BottleScore onChange={score => setScoreMiddleBottle(score)} />
          </div>
          <BottleScore onChange={score => setScoreRightBottle(score)} />
        </div>

        <Button
          style={{ display: showOldScoreField ? 'none' : 'flex' }}
          onClick={() => setShowOldScoreField(true)}
        >
          Je ne me souviens plus du détail...
        </Button>

        <TextField
          type="number"
          id="score"
          label="Score"
          value={score}
          onChange={e => setScore(Number(e.target.value))}
          style={{ display: showOldScoreField ? 'flex' : 'none' }}
        />
        <TextField
          id="note"
          label="Note (facultatif)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <Button
          type="submit"
          color="primary"
          variant="contained"
          disabled={(showOldScoreField && score === '') || !isSuccess(players)}
          onClick={() => onSubmit()}
        >
          Ajouter
        </Button>
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
    currentUserName: state.user.user.name,
    players: state.player.list,
  }),
  dispatch => ({
    fetchPlayers: () => dispatch(fetchPlayers()),
    addGame: (date, time, playerId, score, scoreLeftBottle, scoreMiddleBottle, scoreRightBottle, scoreMalusBottle, note) =>
      dispatch(addGame(date, time, playerId, score, scoreLeftBottle, scoreMiddleBottle, scoreRightBottle, scoreMalusBottle, note)),
  })
)(AddGamePage);
