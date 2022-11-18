import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

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

import { formatDate } from '../helpers';

import BottleScore from './BottleScore/BottleScore';
import MalusBottleScore from './BottleScore/MalusBottleScore';

import styles from './AddGamePage.module.css';
import { useGetPlayers } from '../services/players';
import { useAddGame } from '../services/games';
import { useAuth } from '../services/auth';

const AddGamePage = () => {

  const currentTime = new Date();

  const [players] = useGetPlayers(true);
  const [addGameResponse, addGame] = useAddGame();
  const { getUser } = useAuth();

  const currentUser = getUser();

  const [playerId, setPlayerId] = useState<number>(currentUser.id);
  const [score, setScore] = useState<number | ''>('');
  const [scoreLeftBottle, setScoreLeftBottle] = useState<number>(0);
  const [scoreMiddleBottle, setScoreMiddleBottle] = useState<number>(0);
  const [scoreRightBottle, setScoreRightBottle] = useState<number>(0);
  const [scoreMalusBottle, setScoreMalusBottle] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [time, setTime] = useState<'midday' | 'evening'>(currentTime.getHours() < 15 ? 'midday' : 'evening');
  const [date, setDate] = useState<Date>(currentTime);
  const [showDateFields, setShowDateFields] = useState<boolean>(false);
  const [showOldScoreField, setShowOldScoreField] = useState<boolean>(false);

  const onSubmit = () => {
    if (score !== '' || !showOldScoreField) {
      addGame({}, {
        data: {
          date: date.toISOString(),
          time,
          playerId,
          score: showOldScoreField ? Number(score) : null,
          scoreLeftBottle: showOldScoreField ? null : scoreLeftBottle,
          scoreMiddleBottle: showOldScoreField ? null : scoreMiddleBottle,
          scoreRightBottle: showOldScoreField ? null : scoreRightBottle,
          scoreMalusBottle: showOldScoreField ? null : scoreMalusBottle,
          note,
          suddenDeath: false,
        }
      });
    }
  }

  if (addGameResponse.isSuccess()) {
    return <Navigate to={'/'} />;
  }

  return (
    <>
      <form noValidate autoComplete="off" className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <Typography variant="h6">
          Ajout d'un score
        </Typography>

        <Typography style={{ display: showDateFields ? 'none': 'auto' }}>
          {formatDate(date.toISOString())}
          &nbsp;-&nbsp;
          {time === 'midday' ? 'Midi' : 'Soir'}
          &nbsp;-&nbsp;
          {currentUser.name}
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
        <RadioGroup name="time2" value={time} onChange={e => setTime(e.target.value as 'midday' | 'evening')} row style={{
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
            players.fold(
              (data) => data.map(player => <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>),
              () => [<MenuItem key={'error'} value={currentUser.id} disabled>{'Erreur de récupération'}</MenuItem>],
              () => [<MenuItem key={'notAsked'} value={currentUser.id} disabled></MenuItem>],
              () => [<MenuItem key={'loading'} value={currentUser.id} disabled>{'Chargement...'}</MenuItem>],
            )
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
          disabled={(showOldScoreField && score === '') || !players.isSuccess()}
          onClick={() => onSubmit()}
        >
          Ajouter
        </Button>
        <Button type="submit" variant="contained" component={Link} to="/">Retour</Button>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={addGameResponse.isSuccess() || addGameResponse.isError()}
        >
          <SnackbarContent
            style={{background: addGameResponse.isSuccess() ? '#479F4C' : '#D13135'}}
            message={(
              <span>{
                addGameResponse.fold(
                  () => 'Le score a été ajouté',
                  (error) => error.message,
                  () => '',
                )
              }</span>
            )}
          />
        </Snackbar>
      </form>
    </>
  );
}

export default AddGamePage;
