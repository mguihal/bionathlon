import React from 'react';

import styles from '../App.module.css';
import { GamesResponse } from '../sagas/api';

import { formatDate } from '../helpers';

import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';


interface ConnectedProps {
  playerGames: GamesResponse;
}

const ProfileChart: React.FunctionComponent<ConnectedProps> = (props) => {

  const { playerGames } = props;

  const smoothData = (games: GamesResponse) => {
    return games.map(cur => cur.score).reduce<number[]>((data, score, index, scores) => {
      const smoothOn = scores.slice(Math.max(index - 10, 0), index);
      const smoothedScore = smoothOn
        .reduce((prev, cur) => prev + cur, 0) / smoothOn.length;

      data.push(smoothedScore);
      return data;
    }, []);
  };

  const options: Highcharts.Options = {
    title: {
      text: ''
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: true,
      align: 'right'
    },
    xAxis: {
      categories: playerGames.map(cur => formatDate(cur.date) + ' - ' + (cur.time === 'midday' ? 'midi' : 'soir')),
      visible: false
    },
    yAxis: {
      title: {
        text: 'Score'
      }
    },
    series: [{
      name: 'Moyenne glissante',
      type: 'line',
      data: smoothData(playerGames)
    },
      {
        name: 'Score exact',
        type: 'line',
        data: playerGames.map(cur => cur.score),
        lineWidth: 0
      }]
  };

  return (
    <div className={styles.profileChart}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
}

export default ProfileChart;
