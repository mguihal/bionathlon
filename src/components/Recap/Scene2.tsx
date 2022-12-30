import { gsap } from 'gsap';
import React, { useLayoutEffect, useRef } from 'react';
import styles from './Recap.module.css';
import { useRecapData } from './RecapContext';
import stylesScene from './Scene2.module.css';

const Scene2 = () => {
  const ref = useRef(null);
  const q = gsap.utils.selector(ref);
  const timeline = useRef<gsap.core.Timeline>();

  const data = useRecapData();

  useLayoutEffect(() => {
    timeline.current = gsap.timeline()
      .set(q('#container div'), {
        y: "random(-500, -200)",
        x: "random(-1000, -500)",
        rotate: "random(-100, 100)",
      })
      .set(q('#title1, #title2'), { left: '5%' })
      .to(q('#container div'), {
        y: 0,
        x: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        duration: 1,
        stagger: {
          amount: 0.3,
          grid: "auto",
          from: "center"
        }
      })
      .to(q('#line div'), { opacity: 1, y: 10, duration: 0.1, stagger: 0.05 })
      .to(q('#title1, #title2'), { opacity: 1, duration: 1, stagger: 1 })
      .to(q('#title1, #title2'), { opacity: 0, duration: 1 }, '+=1');
  }, [q]);

  return (
    <div ref={ref} className={`${styles.story} ${stylesScene.scene2}`}>
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
      </div>
      <h1 id="title1">Ces 12 derniers mois, vous vous êtes positionné <strong>{data.nbGames}</strong> fois derrière la ligne de Vallée</h1>
      <h1 id="title2">soit {Math.abs(data.nbGames - data.nbGamesPreviousYear)} fois de {data.nbGames > data.nbGamesPreviousYear ? 'plus' : 'moins'} qu'en {data.year - 1}</h1>
    </div>
  );
};

export default Scene2;
