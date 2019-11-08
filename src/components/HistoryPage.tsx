import React, { useEffect } from 'react';
import { connect } from 'react-redux'
import { Dataway, fold } from 'dataway';

import MLink from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { AppState } from '../store';

import { fetchAllGames } from '../actionCreators/game';

import styles from '../App.module.css';
import { GamesResponse, GameResponse } from '../sagas/api';

interface ConnectedProps {
  games: Dataway<string, GamesResponse>;
}

interface DispatchedProps {
  fetchAllGames: () => {type: string};
}

function formatDate(date: string) {
  const dateObject = new Date(date);
  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1;
  const year = dateObject.getFullYear();

  const pad = (n: number) => n < 10 ? `0${n}` : n;

  return `${pad(day)}/${pad(month)}/${year}`;
}

function groupByDateTime(games: GamesResponse) {
  return games.reduce<{[key: string]: GamesResponse}>(function(groups, game) {
    const groupKey = `${formatDate(game.date)} - ${game.time === 'midday' ? 'midi' : 'soir'}`;
    (groups[groupKey] = groups[groupKey] || []).push(game);

    return groups;
  }, {});
};

function byScoreDesc(a: GameResponse, b: GameResponse) {
  if (a.score < b.score) {
    return 1;
  } else if (a.score > b.score) {
    return -1;
  } else {
    return 0;
  }
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
        {Object.keys(groupedGames).reverse().map(key => (
          <div className={styles.tableContainer} key={key}>
            <Typography variant="h6">{key}</Typography>
            <Table aria-label="simple table">
              <TableBody>
                {groupedGames[key].sort(byScoreDesc).map(game => (
                  <TableRow key={game.id}>
                    <TableCell component="th" scope="row" align="right" style={{width: '50%'}}>
                      <MLink href={`/profile/${game.playerId}`}>{game.playerName}</MLink>
                    </TableCell>
                    <TableCell>
                      {game.score}
                      {game.note && <br/>}
                      {game.note && <span className={styles.tableNote}>({game.note})</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
