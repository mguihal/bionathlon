import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import { Avatar, Button } from '@material-ui/core';

import styles from './ProfilePage.module.css';

import { round2, byDateTimeDesc, computeScore } from '../helpers';

import ProfileChart from './stats/ProfileChart';
import { useGetPaginatedGames } from '../services/games';
import { useAuth } from '../services/auth';
import PlayerSessionTable from './SessionTable/PlayerSessionTable';
import EmptyTable from './SessionTable/EmptyTable';

const PAGE_COUNT = 10;

const ProfilePage = () => {
  const { playerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [playerGames, fetchGames] = useGetPaginatedGames();
  const { getUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(Math.max(0, parseInt(searchParams.get('page') || '0', 10) - 1));

  const currentUser = getUser();

  useEffect(() => {
    fetchGames({ playerId: playerId ? playerId : currentUser.id.toString() });
  }, [fetchGames, playerId, currentUser.id]);

  const handleNext = useCallback(() => {
    setCurrentPage(page => {
      setSearchParams({ page: `${page + 2}` });
      return page + 1;
    });
  }, [setSearchParams]);

  const handlePrev = useCallback(() => {
    setCurrentPage(page => {
      setSearchParams({ page: `${page}` });
      return page - 1;
    });
  }, [setSearchParams]);

  const sortedGames = useMemo(() => {
    return playerGames.getOrElse([]).slice().sort(byDateTimeDesc).slice(currentPage * PAGE_COUNT, currentPage * PAGE_COUNT + PAGE_COUNT);
  }, [playerGames, currentPage]);

  return (
    <>
      <div className={styles.profileTitle}>
        <Typography variant="h6">
          {
            playerGames.fold(
              (games) => games.length === 0 ? 'Joueur inconnu' : games[0].playerName,
              () => 'Erreur de chargement',
              () => 'Joueur inconnu',
              () => 'Chargement...',
            )
          }
        </Typography>
        {
          playerGames.fold(
            (games) => games.length === 0 
              ? <Avatar alt={''} src={''} className={styles.avatar} /> 
              : <Avatar alt={games[0].playerName} src={games[0].playerAvatar || ''} imgProps={{ referrerPolicy: 'no-referrer'}} className={styles.avatar} />,
            () => <Avatar alt={''} src={''} className={styles.avatar} />,
            () => <Avatar alt={''} src={''} className={styles.avatar} />,
            () => <Avatar alt={''} src={''} className={styles.avatar} />,
          )
        }
        <Typography variant="subtitle2">
          Matchs joués : {playerGames.fold(
            (games) => games.length.toString(),
            () => 'N/A',
            () => 'N/A',
            () => 'Chargement...',
          )}
        </Typography>
        <Typography variant="subtitle2">
          Points cumulés : {playerGames.fold(
            (games) => games.reduce((acc, cur) => acc + computeScore(cur), 0).toString(),
            () => 'N/A',
            () => 'N/A',
            () => 'Chargement...',
          )}
        </Typography>
        <Typography variant="subtitle2">
          Moyenne par match : {playerGames.fold(
            (games) => round2((games.reduce((acc, cur) => acc + computeScore(cur), 0) / games.length)).toString(),
            () => 'N/A',
            () => 'N/A',
            () => 'Chargement...',
          )}
        </Typography>
        <Typography variant="subtitle2">
          Meilleur score : {playerGames.fold(
            (games) => games.reduce((acc, cur) => computeScore(cur) > acc ? computeScore(cur) : acc, -999).toString(),
            () => 'N/A',
            () => 'N/A',
            () => 'Chargement...',
          )}
        </Typography>
      </div>

      {playerGames.fold(
        (games) => <ProfileChart playerGames={games} />,
        (error) => <EmptyTable message={error.message} />,
        () => <EmptyTable message="Aucune donnée" />,
        () => <EmptyTable message="Chargement..." />,
      )}

      <div className={`${styles.tableContainer} ${styles.profileTable}`}>
        {
          playerGames.fold(
            () => sortedGames.length === 0 ?
              <EmptyTable message="Aucun score" /> :
              <PlayerSessionTable games={sortedGames} />,
            (error) => <EmptyTable message={error.message} />,
            () => <EmptyTable message="Aucune donnée" />,
            () => <EmptyTable message="Chargement..." />,
          )
        }
      </div>
      {currentPage > 0 && (
        <Button onClick={handlePrev} className={styles.loadMoreButton}>
          Précédent
        </Button>
      )}
      {sortedGames.length === PAGE_COUNT && (
        <Button onClick={handleNext} className={styles.loadMoreButton}>
          Suivant
        </Button>
      )}
    </>
  );
}

export default ProfilePage;
