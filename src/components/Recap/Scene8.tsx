import { gsap } from 'gsap';
import React, { useLayoutEffect, useRef } from 'react';
import styles from './Recap.module.css';
import stylesScene from './Scene8.module.css';

const Scene8 = () => {
  const ref = useRef(null);
  const q = gsap.utils.selector(ref);
  const timeline = useRef<gsap.core.Timeline>();

  useLayoutEffect(() => {
    timeline.current = gsap.timeline()
      .to(q('#title1'), { opacity: 1, duration: 1 }, 0.5)
      .to(q('#title2'), { opacity: 1, scale: 1, duration: 0.5 }, 2)
      .to(q('#title3'), { opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)' }, 3)
  }, [q]);

  return (
    <div ref={ref} className={`${styles.story} ${stylesScene.scene8}`}>

      <div id="bg2" />

      <h1 id="title1">En un mot :</h1>
      <h1 id="title2"><strong>Bravo !</strong></h1>
      <h1 id="title3">♥️</h1>
    </div>
  );
};

export default Scene8;
