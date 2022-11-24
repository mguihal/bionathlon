import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './HistoryPage.module.css';
import { formatDate, groupByDateTime } from '../helpers';
import SessionTable from './SessionTable/SessionTable';
import { Game, useGetPaginatedGames } from '../services/games';
import EmptyTable from './SessionTable/EmptyTable';
import { useSearchParams } from 'react-router-dom';

const PAGE_COUNT = 10;

const HistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [games, fetchGames] = useGetPaginatedGames();
  const [currentPage, setCurrentPage] = useState(Math.max(0, parseInt(searchParams.get('page') || '0', 10) - 1));

  const handleNext = useCallback(() => {
    setCurrentPage(page => {
      setSearchParams({ page: `${page + 2}` });
      return page + 1;
    });
    window.scrollTo(0, 0);
  }, [setSearchParams]);

  const handlePrev = useCallback(() => {
    setCurrentPage(page => {
      setSearchParams({ page: `${page}` });
      return page - 1;
    });
    window.scrollTo(0, 0);
  }, [setSearchParams]);

  const onUpdate = useCallback(() => {
    fetchGames({ 
      limit: PAGE_COUNT.toString(), 
      offset: (currentPage * PAGE_COUNT).toString(),
    });
  }, [fetchGames, currentPage]);

  useEffect(() => {
    onUpdate();
  }, [onUpdate]);

  function renderTables(games: Game[]) {
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
            <SessionTable games={groupedGames[key]} onUpdate={onUpdate} />
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
      {games.fold(
        games => games.length === 0 ? <EmptyTable message="Aucun score" /> : renderTables(games),
        error => <EmptyTable message={error.message} />,
        () => <EmptyTable message="Aucune donnée" />,
        () => <EmptyTable message="Chargement..." />,
      )}
    </>
  );
};

export default HistoryPage;
