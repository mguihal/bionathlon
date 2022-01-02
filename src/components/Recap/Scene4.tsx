import { gsap } from 'gsap';
import React, { useLayoutEffect, useRef } from 'react';
import styles from './Recap.module.css';
import { useRecapData } from './RecapContext';
import stylesScene from './Scene4.module.css';

const Scene4 = () => {
  const ref = useRef(null);
  const q = gsap.utils.selector(ref);
  const timeline = useRef<gsap.core.Timeline>();

  const data = useRecapData();

  const ratio = Math.round(data.nbGames / data.nbGamesAllPlayers * 100 * 10) / 10;

  useLayoutEffect(() => {
    timeline.current = gsap.timeline()
      .set(q('.rondelle'), { x: "random(30, 350)" })
      .to(q('.rondelle'), { y: "random(1000, 1200)", rotation: "random(-360, 360)", duration: 5, ease: 'none', stagger: 0.2 }, 0)
      .to(q('#title1'), { left: -432, opacity: 1, duration: 1.5 }, 1)
      .to(q('#title2'), { left: -432, opacity: 1, duration: 1.5 }, 3)
      .to(q('#title1, #title2'), { left: -864, opacity: 0, duration: 1.5 }, 7)
      .to(q('#title3'), { scale: 1, opacity: 1, duration: 3, ease: "elastic.out(1, 0.2)" }, 9.5)
      .to(q('#title3'), { scale: 8, x: -115, duration: 4, ease: "circ.out" }, 12.5)
      .to(q('.rondelleBorder'), { opacity: 0, duration: 4, ease: "circ.out" }, 12.5)
  }, [q]);

  return (
    <div ref={ref} className={`${styles.story} ${stylesScene.scene4}`}>
      <h1 id="title1">Vous avez utilisé votre poignet pour lancer <strong>{data.nbGames * 33}</strong> rondelles cette année !</h1>
      <h1 id="title2">Soit <strong>{ratio}%</strong> de tous les lancers officiels effectués en 2021 !</h1>
      <h1 id="title3">
        C'est én
        <div className={'rondelleO rondelleBorder'} />
        <div className={'rondelleO '} />
        <div className={'rondelleO rondelleBorder'} />
        rme !!!
      </h1>
      <div className={'rondelle r1'} />
      <div className={'rondelle r2'} />
      <div className={'rondelle r3'} />
      <div className={'rondelle r4'} />
      <div className={'rondelle r5'} />
      <div className={'rondelle r6'} />
      <div className={'rondelle r7'} />
      <div className={'rondelle r8'} />
      <div className={'rondelle r1'} />
      <div className={'rondelle r2'} />
      <div className={'rondelle r3'} />
      <div className={'rondelle r4'} />
      <div className={'rondelle r5'} />
      <div className={'rondelle r6'} />
      <div className={'rondelle r7'} />
      <div className={'rondelle r8'} />
      <div className={'rondelle r1'} />
      <div className={'rondelle r2'} />
      <div className={'rondelle r3'} />
      <div className={'rondelle r4'} />
      <div className={'rondelle r5'} />
      <div className={'rondelle r6'} />
      <div className={'rondelle r7'} />
      <div className={'rondelle r8'} />
      <div className={'rondelle r1'} />
      <div className={'rondelle r2'} />
      <div className={'rondelle r3'} />
      <div className={'rondelle r4'} />
      <div className={'rondelle r5'} />
      <div className={'rondelle r6'} />
      <div className={'rondelle r7'} />
      <div className={'rondelle r8'} />
      <div className={'rondelle r1'} />
      <div className={'rondelle r2'} />
      <div className={'rondelle r3'} />
      <div className={'rondelle r4'} />
      <div className={'rondelle r5'} />
      <div className={'rondelle r6'} />
      <div className={'rondelle r7'} />
      <div className={'rondelle r8'} />
    </div>
  );
};

export default Scene4;
