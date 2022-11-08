import React, { useState } from 'react';
import { Collapse, IconButton, ListItemSecondaryAction, ListItemText, Menu, MenuItem, Select } from "@material-ui/core";
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import styles from './DateSelect.module.css';

function formatDate(date: Date) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }`;
}

function getSelectItems() {
  const list: { value: string; label: string; year: boolean; }[] = [];
  const months = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  let year = 2019;
  let month = 9;

  const now = new Date();

  while (`${year}-${month < 10 ? `0${month}` : month}` <= formatDate(now)) {
    const value = `${year}-${month < 10 ? `0${month}` : month}`;
    const label = `${months[month - 1]} ${year}`;
    list.unshift({ value, label, year: false });

    month += 1;
    if (month === 13) {
      list.unshift({ value: `${year}`, label: `${year}`, year: true });
      month = 1;
      year += 1;
    }
  }

  list.unshift({ value: `${year}`, label: `${year}`, year: true });

  return list;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
}

const DateSelect = (props: Props) => {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [value, setValue] = useState(props.value);

  const handleMenuClick = (target: EventTarget) => {
    setAnchorEl(target as HTMLElement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [openedYear, setOpenedYear] = useState(`${(new Date()).getFullYear()}`);

  const handleOpenedYear = (year: string) => {
    setOpenedYear(year === openedYear ? '' : year);
  };

  const handleChange = (val: string) => {
    setValue(val);
    handleMenuClose();
    props.onChange(val);
  };

  const renderMenu = () => {
    const result: JSX.Element[] = [
      <MenuItem key={'all'} value={'all'} selected={value === 'all'} onClick={() => handleChange('all')}>
        Global
      </MenuItem>
    ];

    getSelectItems().filter(o => o.year).forEach(optionYear => {
      result.push(
        <MenuItem key={optionYear.value} value={optionYear.value} selected={value === optionYear.value} onClick={() => handleChange(optionYear.value)}>
          <ListItemText>{optionYear.label}</ListItemText>
          <ListItemSecondaryAction onClick={() => handleOpenedYear(optionYear.value)}>
            <IconButton edge="end" aria-label="comments">
              {optionYear.value === openedYear ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </ListItemSecondaryAction>
        </MenuItem>
      );

      result.push(
        <Collapse key={`collape-${optionYear.value}`} in={optionYear.value === openedYear} timeout="auto" unmountOnExit>
            {getSelectItems().filter(o => !o.year && o.value.startsWith(optionYear.value)).map(optionMonth => (
              <MenuItem key={optionMonth.value} value={optionMonth.value} selected={value === optionMonth.value} onClick={() => handleChange(optionMonth.value)}>
                {optionMonth.label}
              </MenuItem>
            ))}
        </Collapse>
      );
    });

    return result;
  }

  return (
    <>
      <Select
        value={value}
        open={false}
        onOpen={(e) => handleMenuClick(e.currentTarget)}
        className={styles.dateSelect}
      >
        <MenuItem value={'all'}>Global</MenuItem>
        {getSelectItems().map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        classes={{ list: styles.dateSelect }}
      >
        {renderMenu()}
      </Menu>
    </>
  );
};

export default DateSelect;
