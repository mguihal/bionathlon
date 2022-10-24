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
import { Collapse, IconButton, ListItemSecondaryAction, ListItemText, Menu } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

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
  const list: { value: string; label: string; year: boolean; }[] = [];
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
    list.unshift({ value, label, year: false });

    month += 1;
    if (month === 13) {
      list.unshift({ value: `${year}`, label: `${year}`, year: true });
      month = 1;
      year += 1;
    }
  }

  list.unshift({ value: `${year}`, label: `${year}`, year: true });

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

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (target: EventTarget) => {
    setAnchorEl(target as HTMLElement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [openedYear, setOpenedYear] = useState(`${now.getFullYear()}`);

  const handleOpenedYear = (year: string) => {
    setOpenedYear(year === openedYear ? '' : year);
  };

  const handleFilterChange = (value: string) => {
    setRankingFilter(value);
    handleMenuClose();
  };

  useEffect(() => {
    dispatch(fetchStats(rankingFilter === 'all' ? undefined : rankingFilter));
  }, [rankingFilter, dispatch]);

  const ErrorMessage = (props: { message: string }) => (
    <Typography variant="body2" className={styles.emptyTable}>
      {props.message}
    </Typography>
  );

  const renderMenu = () => {
    const result: JSX.Element[] = [
      <MenuItem key={'all'} value={'all'} selected={rankingFilter === 'all'} onClick={() => handleFilterChange('all')}>
        Global
      </MenuItem>
    ];

    getFilterOptions().filter(o => o.year).forEach(optionYear => {
      result.push(
        <MenuItem key={optionYear.value} value={optionYear.value} selected={rankingFilter === optionYear.value} onClick={() => handleFilterChange(optionYear.value)}>
          <ListItemText>{optionYear.label}</ListItemText>
          <ListItemSecondaryAction onClick={() => handleOpenedYear(optionYear.value)}>
            <IconButton edge="end" aria-label="comments">
              {optionYear.value === openedYear ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </ListItemSecondaryAction>
        </MenuItem>
      );

      result.push(
        <Collapse key={`collape-${optionYear.value}`} in={optionYear.value === openedYear} timeout="auto" unmountOnExit>
            {getFilterOptions().filter(o => !o.year && o.value.startsWith(optionYear.value)).map(optionMonth => (
              <MenuItem key={optionMonth.value} value={optionMonth.value} selected={rankingFilter === optionMonth.value} onClick={() => handleFilterChange(optionMonth.value)}>
                {optionMonth.label}
              </MenuItem>
            ))}
        </Collapse>
      );
    });

    return result;
  }

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
            open={false}
            onOpen={(e) => handleMenuClick(e.currentTarget)}
          >
            <MenuItem value={'all'}>Global</MenuItem>
            {getFilterOptions().map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <Menu
            id="rankingFilterMenu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {renderMenu()}
          </Menu>
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
                <Table aria-label="simple table">
                  <TableBody>
                    {stats[rankingType].map((player, i) => (
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
        )(stats)}
      </div>
    </>
  );
};

export default RankingPage;
