import React, { useEffect } from 'react';
import { connect } from 'react-redux'
import { Dataway, fold } from 'dataway';

import Typography from '@material-ui/core/Typography';

import SessionTable from './SessionTable';

import { AppState } from '../store';

import { fetchAllGames } from '../actionCreators/game';

import styles from '../App.module.css';
import { GamesResponse } from '../sagas/api';

import { formatDate, groupByDateTime } from '../helpers';

interface ConnectedProps {
  games: Dataway<string, GamesResponse>;
}

interface DispatchedProps {
  fetchAllGames: () => {type: string};
}

const HistoryPage: React.FunctionComponent<ConnectedProps & DispatchedProps> = (props) => {

  const { games, fetchAllGames } = props;

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  const ErrorMessage = (props: {message: string}) => (
    <Typography variant="body2" className={styles.emptyTable}>
       {props.message}
    </Typography>
  );

  function renderTables(games: GamesResponse) {
    const groupedGames = groupByDateTime(games);

    return (
      <>
        {Object.keys(groupedGames).sort().reverse().map(key => (
          <div className={styles.tableContainer} key={key}>
            <Typography variant="h6">{formatDate(groupedGames[key][0].date)} - {groupedGames[key][0].time === 'midday' ? 'midi' : 'soir'}</Typography>
            <SessionTable games={groupedGames[key]} context={'history'} />
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {
        fold<string, GamesResponse, JSX.Element>(
          () => <ErrorMessage message="Aucune donnée" />,
          () => <ErrorMessage message="Chargement..." />,
          (error) => <ErrorMessage message={error} />,
          (games) => games.length === 0 ?
            <ErrorMessage message="Aucun score" /> : renderTables(games)
        )(games)
      }
    </>
  );
}

export default connect<ConnectedProps, DispatchedProps, {}, AppState>(
  state => ({
    games: state.game.allGames,
  }),
  dispatch => ({
    fetchAllGames: () => dispatch(fetchAllGames()),
  })
)(HistoryPage);
