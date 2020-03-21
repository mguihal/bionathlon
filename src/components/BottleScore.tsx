import React, { useState, useEffect } from 'react';

import Typography from '@material-ui/core/Typography';

import bottle from './bottle.svg';

import styles from '../App.module.css';

interface Props {
  onChange: (score: number) => void;
}

const BottleScore: React.FunctionComponent<Props> = (props) => {

  const { onChange } = props;
  const [ score, setScore ] = useState(0);

  useEffect(() => {
    onChange(score);
  }, [score, onChange]);

  return (
    <div className={styles.bottleScore}>
      <div className={styles.bottlePicture}>
        <img src={bottle} alt="bottle" />
        <div className={styles.rondelles}>
          { Array(score).fill(score).map((v, i) => (<div key={i} className={styles.rondelle} />)) }
        </div>
      </div>
      <div className={styles.bottleButtons}>
        <button className={styles.bottleButton} onClick={() => setScore(currentScore => Math.max(0, currentScore - 1))}>
          <span>-</span>
        </button>
        <Typography variant="h6" className={styles.bottleScoreLabel}>{score}</Typography>
        <button className={styles.bottleButton} onClick={() => setScore(currentScore => currentScore + 1)}>
          <span>+</span>
        </button>
      </div>
    </div>
  );
}

export default BottleScore;
