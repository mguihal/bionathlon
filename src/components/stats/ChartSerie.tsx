import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { FormControl, IconButton, InputLabel } from '@material-ui/core';
import DateSelect from './DateSelect';
import DeleteIcon from '@material-ui/icons/Delete';
import styles from './ChartSerie.module.css';
import { PlayersData } from '../../services/players';
import { SerieModifier, SerieType } from '../../services/stats';

export type SerieData = {
  type: SerieType;
  date: string;
  modifier: SerieModifier;
  playerFilter: string;
};

type Props = {
  players: PlayersData;
  id: number;
  data: SerieData;
  canBeDeleted: boolean;
  onChange: (data: SerieData) => void;
  onDelete: () => void;
};

export const typeLabels: Record<SerieType, string> = {
  'nbPoints': 'Nombre de points',
  'nbRondelles': 'Nombre de rondelles',
  'nbMatchs': 'Nombre de matchs joués',
  'nbWonMatchs': 'Nombre de matchs gagnés',
  'pctWonMatchs': '% de matchs gagnés',
  'avgPoints': 'Moyenne par match',
  'efficiency': 'Efficacité',
  'topScore' : 'Meilleur score',
  'worstScore' : 'Moins bon score',
  'nbPlayers': 'Nombre de joueurs distincts',
  'nbSuddenDeath' : 'Nombre de morts subites',
  'nbWonSuddenDeath' : 'Nombre de morts subites gagnées',
  'nbBonus' : 'Nombre de bonus',
};

export const modifiersLabels: Record<SerieModifier, string> = {
  'none': 'Aucun',
  'cumulated': 'Valeur cumulée',
  'pct': 'Pourcentage',
  'smooth': 'Moyenne glissante (/10)',
  'minimum': 'Minimum',
  'maximum': 'Maximum',
  'mean': 'Moyenne',
  'median': 'Médiane',
  'regression': 'Régression linéaire',
};

const ChartSerie = (props: Props) => {
  return (
    <div className={styles.chartSerie}>
      <div className={styles.serieId}>#{props.id}</div>
      <FormControl>
        <InputLabel id="data-label">Donnée</InputLabel>
        <Select
          labelId="data-label"
          value={props.data.type}
          onChange={e => props.onChange({ ...props.data, type: e.target.value as SerieType })}
        >
          { Object.keys(typeLabels).map(key => <MenuItem key={key} value={key}>{typeLabels[key as SerieType]}</MenuItem>) }
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel id="timeRange-label">Période temporelle</InputLabel>
        <DateSelect 
          value={props.data.date}
          onChange={val => props.onChange({ ...props.data, date: val })}
        />
      </FormControl>

      <FormControl>
        <InputLabel id="modifier-label">Modificateur</InputLabel>
        <Select
          labelId="modifier-label"
          value={props.data.modifier}
          onChange={e => props.onChange({ ...props.data, modifier: e.target.value as SerieModifier })}
        >
          { Object.keys(modifiersLabels).map(key => <MenuItem key={key} value={key}>{modifiersLabels[key as SerieModifier]}</MenuItem>) }
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel id="playerFilter-label">Joueur</InputLabel>
        <Select
          labelId="playerFilter-label"
          value={props.data.playerFilter}
          onChange={e => props.onChange({ ...props.data, playerFilter: e.target.value as string })}
        >
          <MenuItem value={'all'}>Tous</MenuItem>
          {
            props.players.fold(
              (players) => players.map(player => <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>),
              () => [<MenuItem key={'error'} value={''} disabled>{'Erreur de récupération'}</MenuItem>],
              () => [<MenuItem key={'notAsked'} value={''} disabled></MenuItem>],
              () => [<MenuItem key={'loading'} value={''} disabled>{'Chargement...'}</MenuItem>],
            )
          }
        </Select>
      </FormControl>

      <div className={styles.button}>
        <IconButton aria-label="delete" onClick={() => props.onDelete()} disabled={!props.canBeDeleted}>
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  )
};

export default ChartSerie;
