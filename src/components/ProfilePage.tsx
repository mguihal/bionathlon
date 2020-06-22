import React, { useEffect } from 'react';
import { connect } from 'react-redux'
import { Dataway, fold } from 'dataway';
import { useParams } from 'react-router-dom';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { AppState } from '../store';

import { fetchPlayerGames } from '../actionCreators/game';

import styles from '../App.module.css';
import { GamesResponse } from '../sagas/api';

import { formatDate, round2, byDateTimeDesc, computeScore } from '../helpers';

import ProfileChart from './ProfileChart';

interface ConnectedProps {
  playerGames: Dataway<string, GamesResponse>;
  currentUserId: number;
}

interface DispatchedProps {
  fetchPlayerGames: (playerId: number) => {type: string};
}

const ProfilePage: React.FunctionComponent<ConnectedProps & DispatchedProps> = (props) => {

  const { playerGames, fetchPlayerGames, currentUserId } = props;
  const { playerId } = useParams();

  useEffect(() => {
    fetchPlayerGames(playerId ? Number(playerId) : currentUserId);
  }, [fetchPlayerGames, playerId, currentUserId]);

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
            fold<string, GamesResponse, string>(
              () => 'Joueur inconnu',
              () => 'Chargement...',
              (error) => 'Erreur de chargement',
              (games) => games.length === 0 ? 'Joueur inconnu' : games[0].playerName
            )(playerGames)
          }
        </Typography>
        <Typography variant="subtitle2">
          Matchs joués : {fold<string, GamesResponse, string>(
            () => 'N/A',
            () => 'Chargement...',
            () => 'N/A',
            (games) => games.length.toString()
          )(playerGames)}
        </Typography>
        <Typography variant="subtitle2">
          Points cumulés : {fold<string, GamesResponse, string>(
            () => 'N/A',
            () => 'Chargement...',
            () => 'N/A',
            (games) => games.reduce((acc, cur) => acc + computeScore(cur), 0).toString()
          )(playerGames)}
        </Typography>
        <Typography variant="subtitle2">
          Moyenne par match : {fold<string, GamesResponse, string>(
            () => 'N/A',
            () => 'Chargement...',
            () => 'N/A',
            (games) => round2((games.reduce((acc, cur) => acc + computeScore(cur), 0) / games.length)).toString()
          )(playerGames)}
        </Typography>
        <Typography variant="subtitle2">
          Meilleur score : {fold<string, GamesResponse, string>(
            () => 'N/A',
            () => 'Chargement...',
            () => 'N/A',
            (games) => games.reduce((acc, cur) => computeScore(cur) > acc ? computeScore(cur) : acc, -999).toString()
          )(playerGames)}
        </Typography>
      </div>

      {fold<string, GamesResponse, JSX.Element>(
        () => <ErrorMessage message="Aucune donnée" />,
        () => <ErrorMessage message="Chargement..." />,
        (error) => <ErrorMessage message={error} />,
        (games) => <ProfileChart playerGames={games} />
      )(playerGames)}

      <div className={`${styles.tableContainer} ${styles.profileTable}`}>
        {
          fold<string, GamesResponse, JSX.Element>(
            () => <ErrorMessage message="Aucune donnée" />,
            () => <ErrorMessage message="Chargement..." />,
            (error) => <ErrorMessage message={error} />,
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
              </Table>
          )(playerGames)
        }
      </div>
    </>
  );
}

export default connect<ConnectedProps, DispatchedProps, {}, AppState>(
  state => ({
    playerGames: state.game.playerGames,
    currentUserId: state.user.user.id,
  }),
  dispatch => ({
    fetchPlayerGames: (playerId: number) => dispatch(fetchPlayerGames(playerId)),
  })
)(ProfilePage);
