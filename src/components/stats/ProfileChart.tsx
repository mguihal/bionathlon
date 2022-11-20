import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React from 'react';
import styles from './ProfileChart.module.css';
import { computeScore, formatDate } from '../../helpers';
import { Game } from '../../services/games';

interface ConnectedProps {
  playerGames: Game[];
}

const ProfileChart: React.FunctionComponent<ConnectedProps> = props => {
  const { playerGames } = props;

  const reversedPlayerGames = playerGames.slice().reverse();

  const smoothData = (games: Game[]) => {
    return games
      .map(cur => computeScore(cur))
      .reduce<number[]>((data, score, index, scores) => {
        const smoothOn = scores.slice(Math.max(index - 10, 0), index);
        const smoothedScore =
          smoothOn.reduce((prev, cur) => prev + cur, 0) / smoothOn.length;

        data.push(smoothedScore);
        return data;
      }, []);
  };

  const options: Highcharts.Options = {
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: true,
      align: 'right',
    },
    xAxis: {
      categories: reversedPlayerGames.map(
        cur =>
          formatDate(cur.date) +
          ' - ' +
          (cur.time === 'midday' ? 'midi' : 'soir'),
      ),
      visible: false,
    },
    yAxis: {
      title: {
        text: 'Score',
      },
    },
    series: [
      {
        name: 'Moyenne glissante',
        type: 'line',
        data: smoothData(reversedPlayerGames),
      },
      {
        name: 'Score exact',
        type: 'line',
        data: reversedPlayerGames.map(cur => computeScore(cur)),
        lineWidth: 0,
      },
    ],
  };

  return (
    <div className={styles.profileChart}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default ProfileChart;
