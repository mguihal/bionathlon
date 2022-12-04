import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import MLink from '@material-ui/core/Link';

import processString from 'react-process-string';

import { computeScore, formatDate } from '../../helpers';

import styles from './SessionTable.module.css';
import { Game } from '../../services/games';
import BottleScoreDialog from '../BottleScore/BottleScoreDialog';

type Props = {
  games: Game[];
  onUpdate: () => void;
};

const PlayerSessionTable = (props: Props) => {

  const { games, onUpdate } = props;

  const [openDetails, setOpenDetails] = React.useState<Game | null>(null);

  const renderNote = (note: string) => {
    return processString([{
      regex: /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/,
      fn: (key: string, result: string[]) => (
        <span key={key}>
          <img alt={'no alternative text'} src={result[0]} style={{maxWidth: 500}} />
        </span>
      )
    }])(note);
  }

  return (
    <>
      <Table aria-label="simple table" className={styles.table}>
        <TableBody>
          {games.map(game => (
            <TableRow key={game.id}>
              <TableCell component="th" scope="row" align="right" style={{width: '50%'}}>
                {formatDate(game.date)} - {game.time === 'midday' ? 'midi' : 'soir'}
              </TableCell>
              <TableCell>
                { game.scoreLeftBottle !== null ?
                  <MLink onClick={() => setOpenDetails(game)}>{computeScore(game)}</MLink>
                  : computeScore(game)
                }
                { game.suddenDeath ? ' + Mort subite' : '' }
                {game.note && <br/>}
                {game.note && <span className={styles.tableNote}>({renderNote(game.note)})</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <BottleScoreDialog game={openDetails} onClose={() => setOpenDetails(null)} onDelete={onUpdate} /> 
    </>
  );
}

export default PlayerSessionTable;
