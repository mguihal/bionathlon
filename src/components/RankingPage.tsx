import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import React, { useEffect, useState } from 'react';
import styles from './RankingPage.module.css';
import DateSelect, { getSelectItems } from './stats/DateSelect';
import Button from '@material-ui/core/Button';
import { useGetRankings } from '../services/stats';
import EmptyTable from './SessionTable/EmptyTable';
import { useSearchParams } from 'react-router-dom';

type RankingType =
  | 'nbMatchs'
  | 'nbWonMatchs'
  | 'pctWonMatchs'
  | 'nbPoints'
  | 'nbRondelles'
  | 'efficiency'
  | 'avgPoints'
  | 'topScore';

  const rankingTypes: Record<RankingType, string> = {
    'nbPoints': 'Cumul des points',
    'nbRondelles': 'Cumul des rondelles',
    'nbMatchs': 'Nombre de matchs joués',
    'nbWonMatchs': 'Nombre de matchs gagnés',
    'pctWonMatchs': '% de matchs gagnés',
    'avgPoints': 'Moyenne par match',
    'efficiency': 'Efficacité',
    'topScore' : 'Meilleur score'
  };

const RankingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rankings, fetchRankings] = useGetRankings();

  const now = new Date();

  const queryType = searchParams.get('type') || '';
  const initialRankingType = Object.keys(rankingTypes).includes(queryType) ? queryType : 'nbPoints';

  const queryDate = searchParams.get('date') || '';
  const defaultDate = `${now.getFullYear()}-${(now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1)}`;
  const initialDate = getSelectItems().map(i => i.value).includes(queryDate) ? queryDate : defaultDate;

  const [rankingType, setRankingType] = useState<RankingType>(initialRankingType as RankingType);
  const [dateFilter, setDateFilter] = useState(initialDate);

  useEffect(() => {
    fetchRankings(dateFilter === 'all' ? {} : { dateFilter });
  }, [dateFilter, fetchRankings]);

  return (
    <>
      <div className={styles.title}>
        <Typography variant="h6">Classement</Typography>
        <div className={styles.rankingFilters}>
          <Select
            id="rankingType"
            value={rankingType}
            onChange={e => {
              setRankingType(e.target.value as RankingType);
              setSearchParams({ type: e.target.value as string, date: dateFilter });
            }}
          >
            {
              Object.keys(rankingTypes).map(type => (
                <MenuItem key={type} value={type}>{rankingTypes[type as RankingType]}</MenuItem>
              ))
            }
          </Select>
          <DateSelect 
            value={dateFilter} 
            onChange={val => {
              setDateFilter(val);
              setSearchParams({ type: rankingType, date: val });
            }}
          />
        </div>
      </div>
      <div className={styles.tableContainer}>

        {rankings.fold(
          rankingsData =>
            rankingsData[rankingType].length === 0 ? (
              <EmptyTable message="Aucun score" />
            ) : (
              <>
                {rankingType === 'efficiency' && (
                  <Alert severity="info">
                    L'efficacité correspond au ratio points/rondelles. Elle
                    n'est prise en compte que pour les sessions depuis avril
                    2020.
                  </Alert>
                )}
                <Table aria-label="simple table">
                  <TableBody>
                    {rankingsData[rankingType].map((player, i) => (
                      <TableRow key={player.id}>
                        <TableCell component="th" scope="row" align="right">
                          #{i + 1}
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
            error => <EmptyTable message={error.message} />,
            () => <EmptyTable message="Aucune donnée" />,
            () => <EmptyTable message="Chargement..." />,
        )}

        <div className={styles.reportsLink}>
          <Button component={Link} href="/charts">Voir les statistiques avancées</Button>
        </div>
      </div>
    </>
  );
};

export default RankingPage;
