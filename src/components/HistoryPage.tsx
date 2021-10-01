import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Dataway, fold } from 'dataway';
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchAllGames } from '../actionCreators/game';
import styles from '../App.module.css';
import { formatDate, groupByDateTime } from '../helpers';
import { GamesResponse } from '../sagas/api';
import { AppState } from '../store';
import SessionTable from './SessionTable';

interface ConnectedProps {
  games: Dataway<string, GamesResponse>;
}

interface DispatchedProps {
  fetchAllGames: () => { type: string };
}

const PAGE_COUNT = 10;

const HistoryPage: React.FunctionComponent<ConnectedProps &
  DispatchedProps> = props => {
  const { games, fetchAllGames } = props;

  const [displayedItems, setDisplayedItems] = useState(PAGE_COUNT);

  const handleMoreClick = useCallback(() => {
    setDisplayedItems(items => items + PAGE_COUNT);
  }, []);

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  const ErrorMessage = (props: { message: string }) => (
    <Typography variant="body2" className={styles.emptyTable}>
      {props.message}
    </Typography>
  );

  function renderTables(games: GamesResponse) {
    const groupedGames = groupByDateTime(games);
    const sessionTables = Object.keys(groupedGames)
      .sort()
      .reverse()
      .slice(0, displayedItems);

    return (
      <>
        {sessionTables.map(key => (
          <div className={styles.tableContainer} key={key}>
            <Typography variant="h6">
              {formatDate(groupedGames[key][0].date)} -{' '}
              {groupedGames[key][0].time === 'midday' ? 'midi' : 'soir'}
            </Typography>
            <SessionTable games={groupedGames[key]} context={'history'} />
          </div>
        ))}
        <Button onClick={handleMoreClick}>Sessions précédentes</Button>
      </>
    );
  }

  return (
    <>
      {fold<string, GamesResponse, JSX.Element>(
        () => <ErrorMessage message="Aucune donnée" />,
        () => <ErrorMessage message="Chargement..." />,
        error => <ErrorMessage message={error} />,
        games =>
          games.length === 0 ? (
            <ErrorMessage message="Aucun score" />
          ) : (
            renderTables(games)
          ),
      )(games)}
    </>
  );
};

export default connect<ConnectedProps, DispatchedProps, {}, AppState>(
  state => ({
    games: state.game.allGames,
  }),
  dispatch => ({
    fetchAllGames: () => dispatch(fetchAllGames()),
  }),
)(HistoryPage);
