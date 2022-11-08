import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import React, { useEffect } from 'react';
import styles from '../App.module.css';
import { Button, FormControl, InputLabel } from '@material-ui/core';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DateSelect from './stats/DateSelect';
import ChartSerie, { modifiersLabels, SerieData, typeLabels } from './stats/ChartSerie';
import { PlayersData, useGetPlayers } from '../services/players';
import { useState } from 'react';
import { useCallback } from 'react';
import { useGetChartSerie, Sampling } from '../services/stats';
import { formatDate } from '../helpers';

const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

type SerieChartDate = SerieData & { needUpdate: boolean };

const defaultSerieData: SerieChartDate = { type: 'nbPoints', date: 'all', modifier: 'none', playerFilter: 'all', needUpdate: false }

const formatSerieName = (data: SerieData, playersData: PlayersData) => {
  const date = new Date(data.date);
  const formattedDate = data.date === 'all' ? 'Global' : data.date.includes('-') ? `${months[date.getMonth()]} ${date.getFullYear()}` : `${date.getFullYear()}`;

  const players = playersData((p) => p, () => [], () => [], () => []);
  const player = players.find(p => p.id.toString() === data.playerFilter.toString())?.name || 'inconnu';
  const formattedPlayer = data.playerFilter === 'all' ? null : player;

  const modifierMapping = { ...modifiersLabels, 'none': null };

  return [typeLabels[data.type], formattedDate, formattedPlayer, modifierMapping[data.modifier]].filter(e => !!e).join(' - ');
};

const formatXAxis = (category: string, sampling: Sampling, playersData: PlayersData) => {
  const mapping: Record<Sampling, () => string> = {
    'none': () => 'Total',
    'session': () => {
      const [date, time] = category.split(' - ');
      return `${formatDate(date)} - ${time}`; 
    },
    'playedSession': () => `${parseInt(category, 10) + 1}`,
    'day': () => formatDate(category),
    'month': () => {
      const [year, month] = category.split('-');
      return `${months[parseInt(month, 10) - 1]} ${year}`; 
    },
    'week': () => category,
    'year': () => category,
    'time': () => category === 'midday' ? 'Midi' : 'Soir',
    'weekDay': () => ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][parseInt(category, 10)],
    'monthName': () => months[parseInt(category, 10) - 1],
    'bottle': () => category === 'leftBottle' ? 'Gauche' : category === 'middleBottle' ? 'Milieu' : category === 'rightBottle' ? 'Droite' : 'Malus',
    'player': () => {
      const players = playersData((p) => p, () => [], () => [], () => []);
      return players.find(p => p.id.toString() === category)?.name || 'Inconnu';
    },
    'score': () => category,
  };

  return mapping[sampling]();
};

const samplingLabels: Record<Sampling, string> = {
  'none': 'Aucun',
  'session': 'Session',
  'playedSession': 'Session jouée',
  'day': 'Jour',
  'week': 'Semaine',
  'month': 'Mois',
  'year': 'Année',
  'time': 'Midi / Soir',
  'weekDay': 'Jour de la semaine',
  'monthName': `Mois de l'année`,
  'player': 'Joueur',
  'bottle': 'Bouteille',
  'score': 'Score',
};

const ChartsPage = () => {

  const [players] = useGetPlayers(true);
  const [, fetchChartSerie] = useGetChartSerie();

  const [sampling, setSampling] = useState<Sampling>('none');
  const [dateFilter, setDateFilter] = useState('all');

  const [series, setSeries] = useState<SerieChartDate[]>([defaultSerieData]);
  const [chartSeries, setChartSeries] = useState<{ name: string; type: 'line' | 'column'; data: [number, number][]; categories: string[] }[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [options, setOptions] = useState<Highcharts.Options>({
    chart: {
      type: 'line',
      events: {
        render: () => {
          setChartLoading(false);
        }
      }
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    legend: {
      align: 'right',
    },
    xAxis: {
      categories: [],
    },
    yAxis: {
      title: {
        text: '',
      }
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
        },
        maxPointWidth: 50
      }
    },
    series: []
  });

  // Update series when changing sampling and dateFilter
  useEffect(() => {
    setSeries(val => val.map(s => ({...s, needUpdate: true})));
  }, [sampling, dateFilter]);

  // Refetch data when series need update
  useEffect(() => {
    
    series.forEach((serie, index) => {
      if (!serie.needUpdate) {
        return;
      }
      setChartLoading(series.some(s => s.needUpdate));

      setSeries(val => {
        val[index].needUpdate = false;
        return [...val];
      });

      fetchChartSerie({
        type: serie.type, 
        date: serie.date, 
        modifier: serie.modifier, 
        playerFilter: serie.playerFilter, 
        sampling, 
        chartDate: dateFilter
      }).then((response) => {
        const points = response((p) => p, (error) => {
          console.log('Error when retrieving points:', error);
          return [];
        }, () => [], () => []);
        const categories = points.map(p => p.key);

        setChartSeries(val => {
          val[index] = {
            name: formatSerieName(serie, players),
            type: ['none', 'time', 'weekDay', 'monthName', 'player', 'bottle'].includes(sampling) ? 'column' : 'line',
            data: points.filter(p => p.shouldDisplay).map(p => [categories.indexOf(p.key), p.value]),
            categories: categories.map(category => formatXAxis(category, sampling, players)),
          };
          return [...val];
        });
      });
    })
  }, [series, fetchChartSerie, dateFilter, sampling, players]);

  // Refresh chart options
  useEffect(() => {
    setOptions(options => {
      return {
        ...options,
        xAxis: {
          categories: chartSeries.length > 0 ? chartSeries[0].categories : []
        },
        series: chartSeries,
      };
    });
  }, [chartSeries]);

  const updateSerie = useCallback((index: number) => (data: SerieData) => {
    setSeries(val => {
      val[index] = { ...data, needUpdate: true };
      return [...val];
    });
  }, []);

  const deleteSerie = useCallback((index: number) => () => {
    setSeries(val => [...val.filter((_, i) => i !== index)]);
    setChartSeries(val => [...val.filter((_, i) => i !== index)]);
  }, []);

  const addSerie = useCallback(() => {
    setSeries(val => [...val, {...defaultSerieData, needUpdate: true}]);
  }, []);

  return (
    <>
      <div className={styles.profileTitle}>
        <Typography variant="h6">Statistiques avancées</Typography>
      </div>
      <div className={styles.profileChart}>
        <HighchartsReact highcharts={Highcharts} options={options} />
        {chartLoading && (
          <div className={styles.chartLoading}>Chargement...</div>
        )}
      </div>
      <div className={styles.profileTitle}>
        <Typography variant="h6">Affichage</Typography>
      </div>
      <div className={styles.chartFilters}>
        <FormControl>
          <InputLabel id="xAxis-label">Echantillonage</InputLabel>
          <Select
            labelId='xAxis-label'
            value={sampling}
            onChange={e => setSampling(e.target.value as Sampling)}
          >
            { Object.keys(samplingLabels).map(key => <MenuItem key={key} value={key}>{samplingLabels[key as Sampling]}</MenuItem>) }
          </Select>
        </FormControl>
        {
          ['session', 'day', 'week', 'month', 'year'].includes(sampling) && (
            <FormControl>
                <InputLabel id="timeRange-label">Période temporelle</InputLabel>
                <DateSelect 
                  value={dateFilter}
                  onChange={val => setDateFilter(val)}
                />
              </FormControl>
          )
        }
      </div>
      <div className={styles.profileTitle}>
        <Typography variant="h6">Séries</Typography>
      </div>

      {
        series.map((serieData, index) => (
          <ChartSerie 
            key={`serie-${index}`}
            players={players} 
            id={index + 1} 
            data={serieData}
            canBeDeleted={series.length > 1}
            onChange={(data) => updateSerie(index)(data)}
            onDelete={() => deleteSerie(index)()}
          />
        ))
      }

      <div>
        <Button onClick={() => addSerie()}>Ajouter une nouvelle série</Button>
      </div>
    </>
  );
};

export default ChartsPage;
