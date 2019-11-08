import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { Dataway, fold } from 'dataway';

import MLink from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { AppState } from '../store';

import { fetchAllGames } from '../actionCreators/game';

import styles from '../App.module.css';
import { GamesResponse } from '../sagas/api';

interface ConnectedProps {
  games: Dataway<string, GamesResponse>;
  currentUserId: number;
}

interface DispatchedProps {
  fetchAllGames: () => {type: string};
}

interface Rank {
  id: number;
  name: string;
  score: number;
}

function groupByPlayer(games: GamesResponse) {
  return games.reduce<{[key: string]: GamesResponse}>(function(groups, game) {
    (groups[game.playerId] = groups[game.playerId] || []).push(game);
    return groups;
  }, {});
};

function round2(nb: number) {
  return Math.round(nb*100) / 100;
}

function byScore(a: Rank, b: Rank) {
  if (a.score < b.score) {
    return 1;
  } else if (a.score > b.score) {
    return -1;
  } else {
    return 0;
  }
}

function getRanking(games: GamesResponse, rankingType: string) {
  const playerGames = groupByPlayer(games);

  if (rankingType === 'nbMatchs') {
    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: playerGames[player].length
      };
    }).sort(byScore);
  } else if (rankingType === 'nbPoints') {
    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: playerGames[player].reduce((acc, cur) => acc + cur.score, 0)
      };
    }).sort(byScore);
  } else {
    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: round2((playerGames[player].reduce((acc, cur) => acc + cur.score, 0) / playerGames[player].length))
      };
    }).sort(byScore);
  }
}

const RankingPage: React.FunctionComponent<ConnectedProps & DispatchedProps> = (props) => {

  const { games, fetchAllGames } = props;

  const [rankingType, setRankingType] = useState('nbPoints');

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  const ErrorMessage = (props: {message: string}) => (
    <Typography variant="body2" className={styles.emptyTable}>
       {props.message}
    </Typography>
  );

  return (
    <>
      <div className={styles.profileTitle}>
        <Typography variant="h6">
          Classement
        </Typography>
        <Select
          id="rankingType"
          value={rankingType}
          onChange={e => setRankingType(e.target.value as string)}
          style={{marginTop: 20}}
        >
          <MenuItem value={'nbMatchs'}>Nombre de matchs joués</MenuItem>
          <MenuItem value={'nbPoints'}>Cumul des points</MenuItem>
          <MenuItem value={'avgPoints'}>Moyenne par match</MenuItem>
        </Select>
      </div>
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
                  {getRanking(games, rankingType).map((player, i) => (
                    <TableRow key={player.id}>
                      <TableCell component="th" scope="row" align="right">
                        #{i+1}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <MLink href={`/profile/${player.id}`}>{player.name}</MLink>
                      </TableCell>
                      <TableCell>
                        {player.score}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )(games)
        }
      </div>
    </>
  );
}

export default connect<ConnectedProps, DispatchedProps, {}, AppState>(
  state => ({
    games: state.game.allGames,
    currentUserId: state.user.user.id,
  }),
  dispatch => ({
    fetchAllGames: () => dispatch(fetchAllGames()),
  })
)(RankingPage);
