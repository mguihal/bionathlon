import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './RulesPage.module.css';

import rulesPath from '../rules.md';

const RulesPage = () => {
  const [rules, setRules] = useState('');

  useEffect(() => {
    const fetchRules = async () => {
      const response = await fetch(rulesPath);
      const content = await response.text();
      setRules(content);
    };

    fetchRules();
  }, [])

  return (
    <div className={styles.rules}>
      <ReactMarkdown children={rules} remarkPlugins={[remarkGfm]} />
    </div>
  );
};

export default RulesPage;
