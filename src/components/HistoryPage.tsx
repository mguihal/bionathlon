import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { RemoteData, fold } from '@devexperts/remote-data-ts';
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchAllGames } from '../actionCreators/game';
import styles from '../App.module.css';
import { formatDate, groupByDateTime } from '../helpers';
import { GamesResponse } from '../sagas/api';
import { AppState } from '../store';
import SessionTable from './SessionTable';

interface ConnectedProps {
  games: RemoteData<string, GamesResponse>;
}

interface DispatchedProps {
  fetchAllGames: (limit: number, offset: number) => { type: string };
}

const PAGE_COUNT = 10;

const HistoryPage: React.FunctionComponent<ConnectedProps &
  DispatchedProps> = props => {
  const { games, fetchAllGames } = props;

  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentPage(page => page + 1);
    window.scrollTo(0, 0);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentPage(page => page - 1);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchAllGames(PAGE_COUNT, currentPage * PAGE_COUNT);
  }, [fetchAllGames, currentPage]);

  const ErrorMessage = (props: { message: string }) => (
    <Typography variant="body2" className={styles.emptyTable}>
      {props.message}
    </Typography>
  );

  function renderTables(games: GamesResponse) {
    const groupedGames = groupByDateTime(games);
    const sessionTables = Object.keys(groupedGames)
      .sort()
      .reverse();

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
        {currentPage > 0 && (
          <Button onClick={handlePrev} className={styles.loadMoreButton}>
            Précédent
          </Button>
        )}
        <Button onClick={handleNext} className={styles.loadMoreButton}>
          Suivant
        </Button>
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
    fetchAllGames: (limit: number, offset: number) =>
      dispatch(fetchAllGames(limit, offset)),
  }),
)(HistoryPage);
