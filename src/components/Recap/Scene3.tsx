import { gsap } from 'gsap';
import React, { useLayoutEffect, useRef } from 'react';
import styles from './Recap.module.css';
import { useRecapData } from './RecapContext';
import stylesScene from './Scene3.module.css';

const Scene3 = () => {
  const ref = useRef(null);
  const q = gsap.utils.selector(ref);
  const timeline = useRef<gsap.core.Timeline>();

  const data = useRecapData();

  const translateY = ((data.nbGamesMidday / data.nbGames) * 768) - 503;
  const middayY = ((data.nbGamesMidday / data.nbGames) * 768) / 2 + 40;
  const eveningY = ((1 - (data.nbGamesMidday / data.nbGames)) * 768) / 2 + 40;

  useLayoutEffect(() => {
    timeline.current = gsap.timeline()
      .to(q('#line'), { y: translateY, duration: 2, ease: 'elastic.out(1, 0.3)' })
      .to(q('#midday'), { y: middayY, duration: 1 }, '-=0.5')
      .to(q('#evening'), { y: -eveningY, duration: 1 })
      .to(q('#line'), { opacity: 0, duration: 0.1 }, '+=1.5')
      .to(q('*'), { opacity: 0, duration: 1 }, '-=0.1')
      .to(q('*'), { x: -432, duration: 2.5 }, '-=1')
  }, [q, translateY, middayY, eveningY]);

  return (
    <div ref={ref} className={`${styles.story} ${stylesScene.scene3}`}>
      <div id="container">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
      <div id="container2">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
      <div id="line">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>

      <div id="midday">
        <div />
        <h1>Vous avez joué <strong>{data.nbGamesMidday}</strong> fois le midi</h1>
      </div>
      <div id="evening">
        <div />
        <h1>Contre <strong>{data.nbGames - data.nbGamesMidday}</strong> fois le soir</h1>
      </div>
    </div>
  );
};

export default Scene3;
