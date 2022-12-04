import React, { useCallback, useEffect, useState } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import BottleScore from '../BottleScore/BottleScore';
import MalusBottleScore from '../BottleScore/MalusBottleScore';

import styles from './BottleScore.module.css';
import { Game, useDeleteGame } from '../../services/games';
import { Button, DialogActions } from '@material-ui/core';
import { useAuth } from '../../services/auth';

type Props = {
  game: Game | null;
  onDelete: () => void;
  onClose: () => void;
};

const BottleScoreDialog = ({ game, onClose, onDelete }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { getUser } = useAuth();
  const currentUser = getUser();

  const [, deleteGame] = useDeleteGame();

  useEffect(() => {
    setConfirmDelete(false);
  }, [game]);

  const handleDeleteClick = useCallback(() => {
    if (!game) {
      return;
    }

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    deleteGame({ id: game.id.toString() }).then(() => {
      onDelete();
      onClose();
    });
  }, [confirmDelete, game, deleteGame, onClose, onDelete]);

  return (
    <Dialog
      open={game !== null}
      onClose={() => onClose()}
      aria-labelledby="form-dialog-title"
      className={styles.bottlesScoreDialog}
    >
      <DialogContent>
        <div className={styles.bottlesContainer}>
          <BottleScore
            staticScore={game !== null ? game.scoreLeftBottle : undefined}
          />
          <div>
            <MalusBottleScore
              staticScore={game !== null ? game.scoreMalusBottle : undefined}
            />
            <BottleScore
              staticScore={game !== null ? game.scoreMiddleBottle : undefined}
            />
          </div>
          <BottleScore
            staticScore={game !== null ? game.scoreRightBottle : undefined}
          />
        </div>
      </DialogContent>
      {currentUser.isAdmin && (
        <DialogActions classes={{ root: styles.actions }}>
          <Button
            variant="contained"
            color="primary"
            className={confirmDelete ? styles.dangerButton : ''}
            onClick={() => handleDeleteClick()}
          >
            {confirmDelete ? 'Etes-vous sûr ?' : 'Supprimer le score'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BottleScoreDialog;
