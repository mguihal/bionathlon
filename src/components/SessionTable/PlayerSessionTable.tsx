import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import MLink from '@material-ui/core/Link';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import BottleScore from '../BottleScore/BottleScore';
import MalusBottleScore from '../BottleScore/MalusBottleScore';

import processString from 'react-process-string';

import { computeScore, formatDate } from '../../helpers';

import styles from './SessionTable.module.css';
import { Game } from '../../services/games';

type Props = {
  games: Game[];
};

const PlayerSessionTable = (props: Props) => {

  const { games } = props;

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
      <Dialog open={openDetails !== null} onClose={() => setOpenDetails(null)} aria-labelledby="form-dialog-title">
        <DialogContent>
          <div className={styles.bottlesContainer}>
            <BottleScore staticScore={openDetails !== null ? openDetails.scoreLeftBottle : undefined} />
            <div>
              <MalusBottleScore staticScore={openDetails !== null ? openDetails.scoreMalusBottle : undefined} />
              <BottleScore staticScore={openDetails !== null ? openDetails.scoreMiddleBottle : undefined} />
            </div>
            <BottleScore staticScore={openDetails !== null ? openDetails.scoreRightBottle : undefined} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PlayerSessionTable;
