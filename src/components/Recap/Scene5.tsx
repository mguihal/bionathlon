import { gsap } from 'gsap';
import React, { useLayoutEffect, useRef } from 'react';
import styles from './Recap.module.css';
import { useRecapData } from './RecapContext';
import stylesScene from './Scene5.module.css';

const Scene5 = () => {
  const ref = useRef(null);
  const q = gsap.utils.selector(ref);
  const timeline = useRef<gsap.core.Timeline>();

  const data = useRecapData();

  // 0.129
  const ratioWin = data.pctBottles;

  useLayoutEffect(() => {
    timeline.current = gsap.timeline()
      .to(q('#title1'), { y: 0, opacity: 1, duration: 2, ease: "circ.out" })
      .to(q('#pieMask'), { rotation: ratioWin * 360, duration: 3 }, '-=2')
      .to(q('#pct'), { scale: 1, opacity: 1, duration: 0.5, ease: 'elastic.out(1, 0.2)' })
      .to(q('#pieRight, #pct'), { opacity: 0, duration: 1 }, '+=1')
      .set(q('#pieLeft, #pieMask, #pct'), { opacity: 0 })
      .to(q('.rondelleTop, .rondelleBottom'), { rotationX: 60, duration: 1 }, '-=0.5')
      .to(q('.rondelleTop, .rondelleBottom'), { y: 300, duration: 4, ease: "power4.out" }, '-=0.5')
      .to(q('#bottle'), { y: 0, duration: 3 }, '-=4')
      .to(q('#title1'), { opacity: 0, duration: 1 }, '-=4')
      .to(q('#title2'), { opacity: 1, duration: 1 }, '-=3')
      .to(q('#title2'), { opacity: 0, duration: 1 })
      .to(q('#scene'), { scale: 0.5, y: 300, duration: 1 })
      .to(q('.rondelleTopLeft, .rondelleBottomLeft'), { y: 0, opacity: 1, duration: 4, ease: "power4.out" }, '-=0.5')
      .to(q('.rondelleTopRight, .rondelleBottomRight'), { y: 0, opacity: 1, duration: 4, ease: "power4.out" }, '-=4.2')
      .to(q('#title3'), { opacity: 1, duration: 1 }, '-=1')
      .to(q('#title3'), { opacity: 0, duration: 1 }, '+=1')
      .to(q('#scene'), { opacity: 0.1, duration: 1 }, '-=1')
      .to(q('#title4'), { opacity: 1, duration: 1 })
      .to(q('#bottleMalus'), { opacity: 1, duration: 1 }, '-=1')
      .to(q('.rondelleMalusTop, .rondelleMalusBottom'), { y: 0, opacity: 1, duration: 1, ease: "power4.out" }, '-=1')
      .to(q('#bg2'), { y: '-100%', duration: 1 }, '+=1')
      .to(q('#bg3'), { y: '0%', duration: 1 }, '-=1')
      .to(q('#bottleMalus'), { opacity: 0, duration: 0.3 }, '-=0.5')
  }, [q, ratioWin]);

  return (
    <div ref={ref} className={`${styles.story} ${stylesScene.scene5}`}>
      <div id="pieLeft" />
      <div id="pieRight" />
      <div id="pieMask" />

      <h1 id="title1">Certaines ont câliné des bouteilles...</h1>
      <h1 id="title2">Soit <strong>{data.nbBottles}</strong> rondelles</h1>
      <h1 id="pct">{Math.round(data.pctBottles * 100)}%</h1>

      <h1 id="title3">Vous avez réalisé <strong>{data.nbBonus}</strong> bonus !</h1>
      <h1 id="title4">Mais aussi visé <strong>{data.nbMalus}</strong> fois la bouteille malus...</h1>

      <div id="scene">
        <div className={'rondelleTop'} />
        <div className={'rondelleBottom'} />
        <div id="bottle" />
        <div id="bottleLeft" />
        <div id="bottleRight" />

        <div className={'rondelleTopLeft'} />
        <div className={'rondelleBottomLeft'} />

        <div className={'rondelleTopRight'} />
        <div className={'rondelleBottomRight'} />
      </div>

      <div id="sceneMalus">
        <div className={'rondelleMalusTop'} />
        <div className={'rondelleMalusBottom'} />
        <div id="bottleMalus" />
      </div>

      <div id="bg2" />
      <div id="bg3" />
    </div>
  );
};

export default Scene5;
