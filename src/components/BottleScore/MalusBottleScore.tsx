import React, { useState, useEffect } from 'react';

import Typography from '@material-ui/core/Typography';

import bottle from '../../assets/malusBottle.svg';

import styles from './BottleScore.module.css';

interface Props {
  staticScore?: number | null;
  onChange?: (score: number) => void;
}

const MalusBottleScore: React.FunctionComponent<Props> = (props) => {

  const { staticScore, onChange } = props;
  const [ score, setScore ] = useState(staticScore || 0);

  useEffect(() => {
    onChange && onChange(score);
  }, [score, onChange]);

  return (
    <div className={styles.bottleScore}>
      <div className={styles.bottlePicture}>
        <img src={bottle} alt="bottle" />
        <div className={styles.rondelles}>
          { Array(score).fill(score).map((v, i) => (<div key={i} className={styles.rondelle} />)) }
        </div>
      </div>
      <div className={styles.bottleButtons} style={{ visibility: staticScore === undefined ? 'visible' : 'hidden' }}>
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

export default MalusBottleScore;
