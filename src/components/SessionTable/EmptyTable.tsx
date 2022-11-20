import React from 'react';
import { Typography } from "@material-ui/core";
import styles from './SessionTable.module.css';

const EmptyTable = (props: {message: string}) => (
  <Typography variant="body2" className={styles.emptyTable}>
     {props.message}
  </Typography>
);

export default EmptyTable;
