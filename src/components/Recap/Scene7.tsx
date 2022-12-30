import { gsap } from 'gsap';
import React, { useLayoutEffect, useRef } from 'react';
import styles from './Recap.module.css';
import { useRecapData } from './RecapContext';
import stylesScene from './Scene7.module.css';

const Scene7 = () => {
  const ref = useRef(null);
  const q = gsap.utils.selector(ref);
  const timeline = useRef<gsap.core.Timeline>();

  const data = useRecapData();

  console.log(data.bestDate);

  const date = new Date(data.bestDate);
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  useLayoutEffect(() => {
    timeline.current = gsap.timeline()
      .to(q('#title1'), { opacity: 1, duration: 1 })
      .to(q('#title2'), { opacity: 1, duration: 1 }, '+=1')
      .to(q('#title3'), { opacity: 1, duration: 1 }, '+=1')
      .to(q('#bg2, #title1, #title2, #title3'), { opacity: 0, duration: 1 }, '+=1')
      .to(q('#scene'), { opacity: 1, duration: 1 })
      .to(q('#title4'), { opacity: 1, duration: 1 })
      .to(q('#scene, #title4'), { opacity: 0, duration: 1 }, '+=2')
  }, [q]);

  return (
    <div ref={ref} className={`${styles.story} ${stylesScene.scene7}`}>

      <div id="bg2" />

      <h1 id="title1">Le {date.getDate()} {months[date.getMonth()]} {date.getFullYear()}</h1>
      <h1 id="title2">Vous souvenez-vous de cette date ?</h1>
      <h1 id="title3">Vous avez battu votre record personnel de l'année !</h1>
      <h1 id="title4">{data.bestPoints} points ! 👏</h1>

      <div id="scene">
        <div id="bottle" />
        <div id="bottleLeft" />
        <div id="bottleRight" />
        <div id="bottleMalus" />

        { Array(data.bestMiddle).fill(null).map((_v, i) => {
          return (
            <div key={`middle${i}`}>
              <div className={`rondelleTop rondelleMiddle r${i}`} />
              <div className={`rondelleBottom rondelleMiddle r${i}`} />
            </div>
          )
        })}

        { Array(data.bestLeft).fill(null).map((_v, i) => {
          return (
            <div key={`middle${i}`}>
              <div className={`rondelleTop rondelleLeft r${i}`} />
              <div className={`rondelleBottom rondelleLeft r${i}`} />
            </div>
          )
        })}

        { Array(data.bestRight).fill(null).map((_v, i) => {
          return (
            <div key={`middle${i}`}>
              <div className={`rondelleTop rondelleRight r${i}`} />
              <div className={`rondelleBottom rondelleRight r${i}`} />
            </div>
          )
        })}

        { Array(data.bestMalus).fill(null).map((_v, i) => {
          return (
            <div key={`middle${i}`}>
              <div className={`rondelleTop rondelleMalus r${i}`} />
              <div className={`rondelleBottom rondelleMalus r${i}`} />
            </div>
          )
        })}
      </div>

    </div>
  );
};

export default Scene7;
