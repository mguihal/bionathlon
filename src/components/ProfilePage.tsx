import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import styles from './ProfilePage.module.css';

import { formatDate, round2, byDateTimeDesc, computeScore } from '../helpers';

import ProfileChart from './stats/ProfileChart';
import { useGetPaginatedGames } from '../services/games';
import { useAuth } from '../services/auth';

const ProfilePage = () => {

  const { playerId } = useParams();
  const [playerGames, fetchGames] = useGetPaginatedGames();
  const { getUser } = useAuth();

  const currentUser = getUser();

  useEffect(() => {
    fetchGames({ playerId: playerId ? playerId : currentUser.id.toString() });
  }, [fetchGames, playerId, currentUser.id]);

  const ErrorMessage = (props: {message: string}) => (
    <Typography variant="body2" className={styles.emptyTable}>
       {props.message}
    </Typography>
  );

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
        (error) => <ErrorMessage message={error.message} />,
        () => <ErrorMessage message="Aucune donnée" />,
        () => <ErrorMessage message="Chargement..." />,
      )}

      <div className={`${styles.tableContainer} ${styles.profileTable}`}>
        {
          playerGames.fold(
            (games) => games.length === 0 ?
              <ErrorMessage message="Aucun score" /> :
              <Table aria-label="simple table">
                <TableBody>
                  {games.sort(byDateTimeDesc).map(game => (
                    <TableRow key={game.id}>
                      <TableCell component="th" scope="row" align="right" style={{width: '50%'}}>
                        {formatDate(game.date)} - {game.time === 'midday' ? 'midi' : 'soir'}
                      </TableCell>
                      <TableCell>
                        {computeScore(game)}
                        {game.note && <br/>}
                        {game.note && <span className={styles.tableNote}>({game.note})</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>,
            (error) => <ErrorMessage message={error.message} />,
            () => <ErrorMessage message="Aucune donnée" />,
            () => <ErrorMessage message="Chargement..." />,
          )
        }
      </div>
    </>
  );
}

export default ProfilePage;
