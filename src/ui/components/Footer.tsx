import React from 'react';
import { makeStyles, shorthands, tokens, Text } from '@fluentui/react-components';

const useStyles = makeStyles({
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('8px', '16px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
    fontSize: '11px',
    color: tokens.colorNeutralForeground3
  }
});

export const Footer: React.FC = () => {
  const styles = useStyles();

  return (
    <footer className={styles.footer}>
      <Text size={100} weight="semibold">
        (C) August87 - 0982722036
      </Text>
    </footer>
  );
};
