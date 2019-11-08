import React, { useEffect } from 'react';
import { connect } from 'react-redux'
import { Dataway, fold } from 'dataway';
import { Link } from 'react-router-dom';

import MLink from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Fab from '@material-ui/core/Fab';
import PersonIcon from '@material-ui/icons/Person';
import SportsESportsIcon from '@material-ui/icons/SportsEsports';

import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

import { AppState } from '../store';

import { fetchToday } from '../actionCreators/game';

import styles from '../App.module.css';
import { GamesResponse, GameResponse } from '../sagas/api';

interface ConnectedProps {
  games: Dataway<string, GamesResponse>;
}

interface DispatchedProps {
  fetchToday: () => {type: string};
}

function formatDate() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const pad = (n: number) => n < 10 ? `0${n}` : n;

  return `${pad(day)}/${pad(month)}/${year}`;
}

function isMidDayGame(game: GameResponse) {
  return game.time === 'midday';
}

function byScoreDesc(a: GameResponse, b: GameResponse) {
  if (a.score < b.score) {
    return 1;
  } else if (a.score > b.score) {
    return -1;
  } else {
    return 0;
  }
}

const TodayPage: React.FunctionComponent<ConnectedProps & DispatchedProps> = (props) => {

  const { games, fetchToday } = props;

  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const ErrorMessage = (props: {message: string}) => (
    <Typography variant="body2" className={styles.emptyTable}>
       {props.message}
    </Typography>
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className={styles.topActionButtons}>
        <ButtonGroup variant="text">
          <Button component={Link} to="/addGame" color="primary">Ajouter un score</Button>
          <Button component={Link} to="/addPlayer">Ajouter un joueur</Button>
        </ButtonGroup>
      </div>
      <div className={styles.floatingActionButtons}>
        <SpeedDial
          ariaLabel="actions"
          icon={<SpeedDialIcon />}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
        >
          <SpeedDialAction
            icon={<Fab component={Link} to="/addGame" color="primary" variant="extended"><SportsESportsIcon /></Fab>}
            tooltipTitle="Score"
            tooltipOpen={true}
            onClick={handleClose}
          />
          <SpeedDialAction
            icon={<Fab component={Link} to="/addPlayer" variant="extended"><PersonIcon /></Fab>}
            tooltipTitle="Joueur"
            tooltipOpen={true}
            onClick={handleClose}
          />
        </SpeedDial>
      </div>
      <div className={styles.tableContainer}>
        <Typography variant="h6">
          {formatDate()} - Midi
        </Typography>
        {
          fold<string, GamesResponse, JSX.Element>(
            () => <ErrorMessage message="Aucune donnée" />,
            () => <ErrorMessage message="Chargement..." />,
            (error) => <ErrorMessage message={error} />,
            (games) => games.filter(isMidDayGame).length === 0 ?
              <ErrorMessage message="Aucun score" /> :
              <Table aria-label="simple table">
                <TableBody>
                  {games.filter(isMidDayGame).sort(byScoreDesc).map(game => (
                    <TableRow key={game.id}>
                      <TableCell component="th" scope="row" align="right" style={{width: '50%'}}>
                        <MLink href={`/profile/${game.playerId}`}>{game.playerName}</MLink>
                      </TableCell>
                      <TableCell>
                        {game.score}
                        {game.note && <br/>}
                        {game.note && <span className={styles.tableNote}>({game.note})</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )(games)
        }
      </div>

      <div className={styles.tableContainer}>
        <Typography variant="h6">
          {formatDate()} - Soir
        </Typography>
        {
          fold<string, GamesResponse, JSX.Element>(
            () => <ErrorMessage message="Aucune donnée" />,
            () => <ErrorMessage message="Chargement..." />,
            (error) => <ErrorMessage message={error} />,
            (games) => games.filter((e) => !isMidDayGame(e)).length === 0 ?
              <ErrorMessage message="Aucun score" /> :
              <Table aria-label="simple table">
                <TableBody>
                  {games.filter((e) => !isMidDayGame(e)).sort(byScoreDesc).map(game => (
                    <TableRow key={game.id}>
                      <TableCell component="th" scope="row" align="right" style={{width: '50%'}}>
                        <MLink href={`/profile/${game.playerId}`}>{game.playerName}</MLink>
                      </TableCell>
                      <TableCell>
                        {game.score}
                        {game.note && <br/>}
                        {game.note && <span className={styles.tableNote}>({game.note})</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )(games)
        }
      </div>
    </>
  );
}

export default connect<ConnectedProps, DispatchedProps, {}, AppState>(
  state => ({
    games: state.game.today,
  }),
  dispatch => ({
    fetchToday: () => dispatch(fetchToday()),
  })
)(TodayPage);
