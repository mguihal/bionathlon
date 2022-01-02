import { gsap } from 'gsap';
import React, { useLayoutEffect, useRef } from 'react';
import styles from './Recap.module.css';
import stylesScene from './Scene1.module.css';

const Scene1 = () => {
  const ref = useRef(null);
  const q = gsap.utils.selector(ref);
  const timeline = useRef<gsap.core.Timeline>();

  useLayoutEffect(() => {
    timeline.current = gsap.timeline()
      .set(q('*'), { opacity: 0 })
      .set(q('#title1, #rondelle'), { scale: 0.9 })
      .set(q('#bg2'), { y: '100%', opacity: 1 })
      .to(q('#title1, #rondelle'), {
        opacity: 1,
        y: -5,
        scale: 1.1,
        duration: 3,
      }, '+=1')
      .to(q('#bg2'), {
        y: '0%',
        duration: 0.5,
      }, '+=1')
      .to(q('#title2'), { opacity: 1, duration: 2 }, '+=1')
      .to(q('#title3'), { opacity: 1, duration: 2 }, '+=1')
      .set(q('#title1, #rondelle'), { opacity: 0 })
      .to(q('#bg2, #title2, #title3'), { opacity: 0, duration: 0.5 }, '+=1')
      .to(q('#title4'), { opacity: 1, duration: 2 })
      .to(q('#n3'), { opacity: 1, scale: 1.3, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
      .set(q('#n3'), { opacity: 0 }, '+=0.5')
      .to(q('#n2'), { opacity: 1, scale: 1.3, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
      .set(q('#n2'), { opacity: 0 }, '+=0.5')
      .to(q('#n1'), { opacity: 1, scale: 1.3, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
      .set(q('#n1, #title4'), { opacity: 0 }, '+=0.5');
  }, [q]);

  return (
    <div ref={ref} className={`${styles.story} ${stylesScene.scene1}`}>
      <h1 id={'title1'}>Rétrospective 2021</h1>
      <div id={'rondelle'} className={styles.rondelle} />
      <div id={'bg2'} />
      <h2 id={'title2'}>Cette année, vous avez marqué l’histoire du Bionathlon !</h2>
      <h2 id={'title3'}>Mais vous souvenez-vous de tout ce qu'il s'est passé ?</h2>
      <h2 id={'title4'}>Vous êtes prêts ?</h2>
      <h3 id={'n3'}>3</h3>
      <h3 id={'n2'}>2</h3>
      <h3 id={'n1'}>1</h3>
    </div>
  );
};

export default Scene1;
