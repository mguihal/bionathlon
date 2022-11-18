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
import DateSelect from './stats/DateSelect';
import Button from '@material-ui/core/Button';
import { useGetRankings } from '../services/stats';

type RankingType =
  | 'nbMatchs'
  | 'nbWonMatchs'
  | 'pctWonMatchs'
  | 'nbPoints'
  | 'nbRondelles'
  | 'efficiency'
  | 'avgPoints'
  | 'topScore';

const RankingPage = () => {
  const [rankings, fetchRankings] = useGetRankings();

  const now = new Date();

  const [rankingType, setRankingType] = useState<RankingType>('nbPoints');
  const [dateFilter, setDateFilter] = useState(
    `${now.getFullYear()}-${(now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1)}`,
  );

  useEffect(() => {
    fetchRankings(dateFilter === 'all' ? {} : { dateFilter });
  }, [dateFilter, fetchRankings]);

  const ErrorMessage = (props: { message: string }) => (
    <Typography variant="body2" className={styles.emptyTable}>
      {props.message}
    </Typography>
  );

  return (
    <>
      <div className={styles.title}>
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
          <DateSelect 
            value={dateFilter} 
            onChange={val => setDateFilter(val)}
          />
        </div>
      </div>
      <div className={styles.tableContainer}>

        {rankings.fold(
          rankingsData =>
            !rankingsData[rankingType] ? (
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
            error => <ErrorMessage message={error.message} />,
            () => <ErrorMessage message="Aucune donnée" />,
            () => <ErrorMessage message="Chargement..." />,
        )}

        <div className={styles.reportsLink}>
          <Button component={Link} href="/charts">Voir les statistiques avancées</Button>
        </div>
      </div>
    </>
  );
};

export default RankingPage;
