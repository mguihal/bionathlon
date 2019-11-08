import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import TodayIcon from '@material-ui/icons/Today';
import PersonIcon from '@material-ui/icons/Person';
import HistoryIcon from '@material-ui/icons/History';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';

import TodayPage from './TodayPage';
import AddPlayerPage from './AddPlayerPage';
import AddGamePage from './AddGamePage';
import ProfilePage from './ProfilePage';
import HistoryPage from './HistoryPage';
import RankingPage from './RankingPage';

import { AppState } from '../store';

import styles from '../App.module.css';

const mapping: {[key: string]: string} = {
  '': 'today',
  'addPlayer': 'addPlayer',
  'addGame': 'addGame',
  'profile' : 'profile',
  'history': 'history',
  'ranking': 'ranking',
};

const navMapping: {[value: string]: string} = {
  today: 'today',
  addPlayer: 'today',
  addGame: 'today',
  profile: 'profile',
  history: 'history',
  ranking: 'ranking',
};

interface ConnectedProps {
  currentUserId: number;
}

const Page: React.FunctionComponent<ConnectedProps> = (props) => {
  const { currentUserId } = props;

  const { pathname } = useLocation();
  const [value, setValue] = React.useState('today');

  useEffect(() => {
    const parts = pathname.split('/');
    const segment = parts[1] || '';
    setValue(mapping[mapping[segment] ? segment : '']);
  }, [pathname]);

  return (
    <div className={styles.page}>
      <header className={styles.topNavigation}>
        <AppBar position="fixed" color="default">
          <Tabs
            value={navMapping[value]}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Aujourd'hui" value="today" component={Link} to="/" />
            <Tab label="Mon profil" value="profile" component={Link} to={`/profile/${currentUserId}`} />
            <Tab label="Historique" value="history" component={Link} to="/history" />
            <Tab label="Classement" value="ranking" component={Link} to="/ranking" />
          </Tabs>
        </AppBar>
      </header>

      {value === 'today' && <TodayPage />}
      {value === 'addPlayer' && <AddPlayerPage />}
      {value === 'addGame' && <AddGamePage />}
      {value === 'profile' && <ProfilePage />}
      {value === 'history' && <HistoryPage />}
      {value === 'ranking' && <RankingPage />}

      <footer className={styles.bottomNavigation}>
        <BottomNavigation
          value={navMapping[value]}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          showLabels
        >
          <BottomNavigationAction component={Link} to="/" label="Aujourd'hui" value="today" icon={<TodayIcon />} style={{maxWidth: 'initial', minWidth: 'initial'}}/>
          <BottomNavigationAction component={Link} to={`/profile/${currentUserId}`} label="Mon profil" value="profile" icon={<PersonIcon />} style={{maxWidth: 'initial', minWidth: 'initial'}} />
          <BottomNavigationAction component={Link} to="/history" label="Historique" value="history" icon={<HistoryIcon />} style={{maxWidth: 'initial', minWidth: 'initial'}} />
          <BottomNavigationAction component={Link} to="/ranking" label="Classement" value="ranking" icon={<EmojiEventsIcon />} style={{maxWidth: 'initial', minWidth: 'initial'}} />
        </BottomNavigation>
      </footer>
    </div>
  );
}

export default connect<ConnectedProps, {}, {}, AppState>(
  state => ({
    currentUserId: state.user.user.id,
  })
)(Page);
