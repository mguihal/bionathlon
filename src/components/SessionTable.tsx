import React from 'react';
import { connect } from 'react-redux';

import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import processString from 'react-process-string';

import { GamesResponse } from '../sagas/api';
import { byScoreDesc, isWinner, getSuddenDeathGames } from '../helpers';

import { setSuddenDeathWinner } from '../actionCreators/game';

import styles from '../App.module.css';

interface Props {
  games: GamesResponse;
  context: string;
}

interface DispatchedProps {
  setSuddenDeathWinner: (gameId: number, context: string) => {type: string};
}

const SessionTable: React.FunctionComponent<Props & DispatchedProps> = (props) => {

  const { games, setSuddenDeathWinner, context } = props;

  const [open, setOpen] = React.useState(false);
  const [winner, setWinner] = React.useState(0);

  const suddenDeathGames = getSuddenDeathGames(games);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    handleClose();
    setSuddenDeathWinner(winner, context);
  };

  const renderNote = (note: string) => {
    return processString([{
      regex: /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/,
      fn: (key: string, result: string[]) => (
        <span key={key}>
          <img alt={'no alternative text'} src={result[0]} />
        </span>
      )
    }])(note);
  }

  return (
    <>
      <Table aria-label="simple table">
        <TableBody>
          {games.sort(byScoreDesc).map(game => (
            <TableRow key={game.id}>
              <TableCell component="th" scope="row" align="right" style={{width: '50%'}}>
                <Link href={`/profile/${game.playerId}`}>{game.playerName}</Link> { isWinner(game, games) ? ' 👑' : ''}
              </TableCell>
              <TableCell>
                {game.score}
                { game.suddenDeath ? ' + Mort subite' : '' }
                { suddenDeathGames.includes(game) && <Button size="small" onClick={handleClickOpen} style={{marginLeft: 20}}>Mort subite ?</Button> }
                {game.note && <br/>}
                {game.note && <span className={styles.tableNote}>({renderNote(game.note)})</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Gagnant de la mort subite</DialogTitle>
        <DialogContent>
          <RadioGroup name="player" value={winner} onChange={(e) => setWinner(Number((e.target as HTMLInputElement).value))}>
            {
              suddenDeathGames.map(game => (
                <FormControlLabel key={game.id} value={game.id} control={<Radio />} label={game.playerName} />
              ))
            }
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} color="primary" disabled={winner === 0}>
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default connect<{}, DispatchedProps, {}, {}>(
  () => ({}),
  dispatch => ({
    setSuddenDeathWinner: (gameId: number, context: string) => dispatch(setSuddenDeathWinner(gameId, context)),
  })
)(SessionTable);
