import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { RemoteData, fold } from '@devexperts/remote-data-ts';
import React, { useEffect, useState } from 'react';
import { fetchStats } from '../actionCreators/stats';
import styles from '../App.module.css';
import { StatsResponse } from '../sagas/api';
import { AppState } from '../store';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Avatar } from '@material-ui/core';

type RankingType =
  | 'nbMatchs'
  | 'nbWonMatchs'
  | 'pctWonMatchs'
  | 'nbPoints'
  | 'nbRondelles'
  | 'efficiency'
  | 'avgPoints'
  | 'topScore';

function formatDate(date: Date) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }`;
}

function getFilterOptions() {
  const list: { value: string; label: string }[] = [];
  const months = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  let year = 2019;
  let month = 9;

  const now = new Date();

  while (`${year}-${month < 10 ? `0${month}` : month}` <= formatDate(now)) {
    const value = `${year}-${month < 10 ? `0${month}` : month}`;
    const label = `${months[month - 1]} ${year}`;
    list.unshift({ value, label });

    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
  }

  return list;
}

const RankingPage = () => {

  const dispatch = useDispatch();

  const stats = useSelector<AppState, RemoteData<string, StatsResponse>>(state => state.stats.data);

  const now = new Date();

  const [rankingType, setRankingType] = useState<RankingType>('nbPoints');
  const [rankingFilter, setRankingFilter] = useState(
    `${now.getFullYear()}-${(now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1)}`,
  );

  useEffect(() => {
    dispatch(fetchStats(rankingFilter === 'all' ? undefined : rankingFilter));
  }, [rankingFilter, dispatch]);

  const ErrorMessage = (props: { message: string }) => (
    <Typography variant="body2" className={styles.emptyTable}>
      {props.message}
    </Typography>
  );

  return (
    <>
      <div className={styles.profileTitle}>
        <Typography variant="h6">Classement</Typography>
        <div className={styles.rankingFilters}>
          <Select
            id="rankingType"
            value={rankingType}
            onChange={e => setRankingType(e.target.value as RankingType)}
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
            {getFilterOptions().map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={`${styles.tableContainer} ${styles.profileTable}`}>
        {fold<string, StatsResponse, JSX.Element>(
          () => <ErrorMessage message="Aucune donnée" />,
          () => <ErrorMessage message="Chargement..." />,
          error => <ErrorMessage message={error} />,
          stats =>
            !stats[rankingType] ? (
              <ErrorMessage message="Aucun score" />
            ) : (
              <>
                {rankingType === 'efficiency' && (
                  <Alert severity="info">
                    L'efficacité correspond au ratio points/rondelles. Elle
                    n'est prise en compte que pour les sessions depuis avril
                    2020.
                  </Alert>
                )}

                <div className={styles.podium}>
                  <div className={styles.second}>
                    <Avatar alt={stats[rankingType][1].name} src={stats[rankingType][1].avatar} className={styles.avatar} />
                    <Link href={`/profile/${stats[rankingType][1].id}`}>
                      {stats[rankingType][1].name}
                    </Link>
                    <br />
                    {stats[rankingType][1].score}{stats[rankingType][1].suffix}
                  </div>
                  <div className={styles.first}>
                    <Avatar alt={stats[rankingType][0].name} src={stats[rankingType][0].avatar} className={styles.avatar} />
                    <Link href={`/profile/${stats[rankingType][0].id}`}>
                      {stats[rankingType][0].name}
                    </Link>
                    <br />
                    {stats[rankingType][0].score}{stats[rankingType][0].suffix}
                  </div>
                  <div className={styles.third}>
                    <Avatar alt={stats[rankingType][2].name} src={stats[rankingType][2].avatar} className={styles.avatar} />
                    <Link href={`/profile/${stats[rankingType][2].id}`}>
                      {stats[rankingType][2].name}
                    </Link>
                    <br />
                    {stats[rankingType][2].score}{stats[rankingType][2].suffix}
                  </div>
                </div>

                <Table aria-label="simple table">
                  <TableBody>
                    {stats[rankingType].slice(3).map((player, i) => (
                      <TableRow key={player.id}>
                        <TableCell component="th" scope="row" align="right">
                          #{i + 4}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Link href={`/profile/${player.id}`}>
                            {player.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {player.score}
                          {player.suffix ? player.suffix : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ),
        )(stats)}
      </div>
    </>
  );
};

export default RankingPage;
