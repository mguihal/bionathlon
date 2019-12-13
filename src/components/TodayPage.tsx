import React, { useEffect } from 'react';
import { connect } from 'react-redux'
import { Dataway, fold } from 'dataway';
import { Link } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Fab from '@material-ui/core/Fab';
import PersonIcon from '@material-ui/icons/Person';
import SportsESportsIcon from '@material-ui/icons/SportsEsports';

import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

import SessionTable from './SessionTable';

import { AppState } from '../store';

import { fetchToday } from '../actionCreators/game';

import styles from '../App.module.css';
import { GamesResponse } from '../sagas/api';

import { formatDate, isMidDayGame } from '../helpers';

interface ConnectedProps {
  games: Dataway<string, GamesResponse>;
}

interface DispatchedProps {
  fetchToday: () => {type: string};
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
              <ErrorMessage message="Aucun score" /> : <SessionTable games={games.filter(isMidDayGame)} context={'today'} />
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
              <ErrorMessage message="Aucun score" /> : <SessionTable games={games.filter((e) => !isMidDayGame(e))} context={'today'} />
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
