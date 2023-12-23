import MLink from '@material-ui/core/Link';
import Modal from '@material-ui/core/Modal';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import Stories from 'react-insta-stories';
import { useAuth } from '../../services/auth';
import { useGetRecap } from '../../services/recap';
import styles from './Recap.module.css';
import RecapContext from './RecapContext';
import Scene1 from './Scene1';
import Scene2 from './Scene2';
import Scene3 from './Scene3';
import Scene4 from './Scene4';
import Scene5 from './Scene5';
import Scene6 from './Scene6';
import Scene7 from './Scene7';
import Scene8 from './Scene8';

const Recap = () => {

  const { getUser } = useAuth();

  const defaultOpen = false;
  const [recapOpen, setRecapOpen] = React.useState(defaultOpen);

  const [data, fetchRecap] = useGetRecap();

  const year = (new Date()).getFullYear() - 1;

  const openRecap = () => {
    fetchRecap({ playerId: getUser().id.toString(), year: year.toString() }).then(() => {
      setRecapOpen(true);
    });
  };

  const stories = [
    { duration: 17500, content: Scene1 },
    { duration: 6500, content: Scene2 },
    { duration: 6500, content: Scene3 },
    { duration: 15500, content: Scene4 },
    { duration: 20000, content: Scene5 },
    { duration: 10000, content: Scene6 },
    { duration: 12500, content: Scene7 },
    { duration: 5000, content: Scene8 },
  ];

  const now = (new Date()).toISOString();

  if (now < `${year + 1}-01-01` || now >= `${year + 1}-02-01`) {
    return null;
  }

  return (
    <div className={styles.recapInfo}>
      <Alert severity="info">
        <div>
          Votre récapitulatif {year} est prêt. Cliquez&nbsp;
          <MLink component="button" variant="body2" onClick={() => openRecap()}>ici</MLink>
          &nbsp;pour le découvrir !
        </div>
      </Alert>
      {data.getOrElse(null) && (
        <Modal
          open={recapOpen}
          onClose={() => setRecapOpen(false)}
        >
          <RecapContext.Provider value={data.getOrElse(null)}>
            <div className={styles.container}>
              <Stories
                stories={stories.slice(0)}
                defaultInterval={1500}
                width={432}
                height={768}
                onAllStoriesEnd={() => setRecapOpen(defaultOpen)}
              />
            </div>
          </RecapContext.Provider>
        </Modal>
      )}
    </div>
  );
}

export default Recap;
