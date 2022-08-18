import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { RemoteData, fold } from '@devexperts/remote-data-ts';
import React, { useCallback, useEffect, useState } from 'react';
import { fetchAllGames } from '../actionCreators/game';
import styles from '../App.module.css';
import { formatDate, groupByDateTime } from '../helpers';
import { GamesResponse } from '../sagas/api';
import { AppState } from '../store';
import SessionTable from './SessionTable';
import { useDispatch, useSelector } from 'react-redux';

const PAGE_COUNT = 10;

const HistoryPage = () => {
  const dispatch = useDispatch();

  const games = useSelector<AppState, RemoteData<string, GamesResponse>>(state => state.game.allGames);

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
    dispatch(fetchAllGames(PAGE_COUNT, currentPage * PAGE_COUNT));
  }, [dispatch, currentPage]);

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

export default HistoryPage;
