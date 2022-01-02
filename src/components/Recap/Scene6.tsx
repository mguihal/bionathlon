import { gsap } from 'gsap';
import React, { useLayoutEffect, useRef } from 'react';
import styles from './Recap.module.css';
import { useRecapData } from './RecapContext';
import stylesScene from './Scene6.module.css';

const Scene6 = () => {
  const ref = useRef(null);
  const q = gsap.utils.selector(ref);
  const timeline = useRef<gsap.core.Timeline>();

  const data = useRecapData();

  useLayoutEffect(() => {
    timeline.current = gsap.timeline()
      .to(q('#scene1'), { scale: 1, y: 0, duration: 1 })
      .to(q('#title1'), { y: 0, opacity: 1, duration: 2, ease: "circ.out" }, '-=1')
      .to(q('#gun'), { scale: 1, opacity: 1, duration: 1 })
      .to(q('#title1'), { opacity: 0, duration: 1 })
      .to(q('.rd'), { opacity: 1, stagger: 0.2, duration: 0.2 }, 4)
      .to(q('.rd2'), { opacity: 0, stagger: 0.2, duration: 0.2 }, 4.3)
      .to(q('#scene2'), { x: 308, duration: 2 }, 4)
      .to(q('#gun'), { opacity: 0, duration: 0.5 }, 4)
      .to(q('#title2'), { opacity: 1, duration: 1 }, 5)
      .to(q('#nbWin'), { opacity: 1, duration: 1 }, 7)
      .to(q('#title3'), { opacity: 1, duration: 1 }, 7)
      .to(q('#bg2'), { y: '0%', duration: 0.5 }, 9)
  }, [q]);

  return (
    <div ref={ref} className={`${styles.story} ${stylesScene.scene6}`}>
      <div id="scene1">
        <div id="cb1" />
        <div id="cb2" />
      </div>

      <h1 id="title1">Vous avez affronté <strong>{data.nbSuddenDeath}</strong> morts subites...</h1>
      <h1 id="title2">...et vous avez éliminé</h1>
      <h1 id="nbWin">{data.nbWonSuddenDeath}</h1>
      <h1 id="title3">de vos adversaires</h1>

      <div id="scene2">
        <div id="gun" />
        <div id={'r1'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r2'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r3'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r4'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r5'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r6'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r7'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r8'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r9'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r10'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r11'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r12'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r13'} className={`${styles.rondelle} rd rd2`} />
        <div id={'r14'} className={`${styles.rondelle} rd`} />
      </div>

      <div id="bg2" />
    </div>
  );
};

export default Scene6;
