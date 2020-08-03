import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { Dataway, fold } from 'dataway';

import Link from '@material-ui/core/Link';
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

import { groupByPlayer, groupByDateTime, round2, byScore, getWinner, computeScore, computeRondelles } from '../helpers';

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
  suffix?: string;
}

function getRanking(games: GamesResponse, rankingType: string, rankingFilter: string) {
  const filteredGames = rankingFilter === 'all' ? games : games.filter(game => {
    const date = new Date(game.date);
    const value = `${date.getFullYear()}-${date.getMonth()}`;

    return value === rankingFilter;
  });

  const playerGames = groupByPlayer(filteredGames);
  const sessionGames = groupByDateTime(filteredGames);

  if (rankingType === 'nbMatchs') {
    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: playerGames[player].length
      };
    }).sort(byScore);
  } else if (rankingType === 'nbWonMatchs') {
    const winnerPlayerIds = Object.keys(sessionGames).map(session => {
      return getWinner(sessionGames[session]);
    });

    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: winnerPlayerIds.reduce<number>((acc, cur) => acc + (cur === Number(player) ? 1 : 0), 0)
      };
    }).sort(byScore);
  } else if (rankingType === 'pctWonMatchs') {
    const winnerPlayerIds = Object.keys(sessionGames).map(session => {
      return getWinner(sessionGames[session]);
    });

    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: round2(winnerPlayerIds.reduce<number>((acc, cur) => acc + (cur === Number(player) ? 1 : 0), 0) / playerGames[player].length * 100),
        suffix: '%'
      };
    }).sort(byScore);
  } else if (rankingType === 'nbPoints') {
    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: playerGames[player].reduce((acc, cur) => acc + computeScore(cur), 0)
      };
    }).sort(byScore);
  } else if (rankingType === 'nbRondelles') {
    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: playerGames[player].reduce((acc, cur) => acc + computeRondelles(cur), 0)
      };
    }).sort(byScore);
  } else if (rankingType === 'efficiency') {
    return Object.keys(playerGames).map<Rank>(player => {

      const pts = playerGames[player].reduce((acc, cur) => acc + computeScore(cur), 0);
      const rondelles = playerGames[player].reduce((acc, cur) => acc + computeRondelles(cur), 0);

      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: rondelles > 0 ? round2(pts / rondelles) : 0,
      };
    }).sort(byScore);
  } else if (rankingType === 'avgPoints') {
    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: round2((playerGames[player].reduce((acc, cur) => acc + computeScore(cur), 0) / playerGames[player].length))
      };
    }).sort(byScore);
  } else if (rankingType === 'topScore') {
    return Object.keys(playerGames).map<Rank>(player => {
      return {
        id: Number(player),
        name: playerGames[player][0].playerName,
        score: playerGames[player].reduce((acc, cur) => computeScore(cur) > acc ? computeScore(cur) : acc, -999)
      };
    }).sort(byScore);
  }

  return [];
}

function getFilterOptions(games: GamesResponse) {
  const list: {value: string, label: string}[] = [];
  const values: string[] = [];
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  games.forEach(game => {
    const date = new Date(game.date);
    const value = `${date.getFullYear()}-${date.getMonth()}`;
    const label = `${months[date.getMonth()]} ${date.getFullYear()}`;

    if (!values.includes(value)) {
      values.push(value);
      list.unshift({value, label});
    }
  });

  return list;
}

const RankingPage: React.FunctionComponent<ConnectedProps & DispatchedProps> = (props) => {

  const { games, fetchAllGames } = props;

  const [rankingType, setRankingType] = useState('nbPoints');
  const [rankingFilter, setRankingFilter] = useState('all');

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  useEffect(() => {
    fold<string, GamesResponse, void>(() => {}, () => {}, (error) => {},
      (games) => {
        const options = getFilterOptions(games);

        if (options.length > 0) {
          setRankingFilter(options[0].value);
        }
      }
    )(games)
  }, [games]);

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
        <div className={styles.rankingFilters}>
          <Select
            id="rankingType"
            value={rankingType}
            onChange={e => setRankingType(e.target.value as string)}
          >
            <MenuItem value={'nbMatchs'}>Nombre de matchs joués</MenuItem>
            <MenuItem value={'nbWonMatchs'}>Nombre de matchs gagnés</MenuItem>
            <MenuItem value={'pctWonMatchs'}>% de matchs gagnés</MenuItem>
            <MenuItem value={'nbPoints'}>Cumul des points</MenuItem>
            <MenuItem value={'nbRondelles'}>Cumul des rondelles</MenuItem>
            <MenuItem value={'avgPoints'}>Moyenne par match</MenuItem>
            <MenuItem value={'efficiency'}>Efficacité</MenuItem>
            <MenuItem value={'topScore'}>Meilleur score</MenuItem>
          </Select>
          <Select
            id="rankingFilter"
            value={rankingFilter}
            onChange={e => setRankingFilter(e.target.value as string)}
          >
            <MenuItem value={'all'}>Global</MenuItem>
            {
              fold<string, GamesResponse, JSX.Element[]>(
                () => [<MenuItem key={'nodata'} value={'nodata'} disabled>Aucune donnée</MenuItem>],
                () => [<MenuItem key={'loading'} value={'loading'} disabled>Chargement...</MenuItem>],
                (error) => [<MenuItem key={'error'} value={'error'} disabled>Erreur de chargement</MenuItem>],
                (games) => {
                  return getFilterOptions(games).map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))
                }
              )(games)
            }
          </Select>
        </div>
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
                  {getRanking(games, rankingType, rankingFilter).map((player, i) => (
                    <TableRow key={player.id}>
                      <TableCell component="th" scope="row" align="right">
                        #{i+1}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Link href={`/profile/${player.id}`}>{player.name}</Link>
                      </TableCell>
                      <TableCell>
                        {player.score}{player.suffix ? player.suffix : ''}
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
