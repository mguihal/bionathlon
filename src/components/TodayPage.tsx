import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import PersonIcon from '@material-ui/icons/Person';
import SportsESportsIcon from '@material-ui/icons/SportsEsports';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TodayPage.module.css';
import { formatDate, isMidDayGame } from '../helpers';
import { useGetTodayGames } from '../services/games';
import Recap from './Recap/Recap';
import SessionTable from './SessionTable/SessionTable';
import EmptyTable from './SessionTable/EmptyTable';

const TodayPage = () => {

  const [games, fetchTodayGames] = useGetTodayGames();

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onUpdate = () => {
    fetchTodayGames();
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
      <Recap />
      <div className={styles.todayContainer}>
        <div className={styles.tableContainer}>
          <Typography variant="h6">
            {formatDate()} - Midi
          </Typography>
          {
            games.fold(
              (games) => games.filter(isMidDayGame).length === 0 ?
                <EmptyTable message="Aucun score" /> : <SessionTable games={games.filter(isMidDayGame)} onUpdate={onUpdate} />,
                (error) => <EmptyTable message={error.message} />,
              () => <EmptyTable message="Aucune donnée" />,
              () => <EmptyTable message="Chargement..." />,
            )
          }
        </div>

        <div className={styles.tableContainer}>
          <Typography variant="h6">
            {formatDate()} - Soir
          </Typography>
          {
            games.fold(
              (games) => games.filter((e) => !isMidDayGame(e)).length === 0 ?
                <EmptyTable message="Aucun score" /> : <SessionTable games={games.filter((e) => !isMidDayGame(e))} onUpdate={onUpdate} />,
              (error) => <EmptyTable message={error.message} />,
              () => <EmptyTable message="Aucune donnée" />,
              () => <EmptyTable message="Chargement..." />,
            )
          }
        </div>
      </div>
    </>
  );
}

export default TodayPage;
