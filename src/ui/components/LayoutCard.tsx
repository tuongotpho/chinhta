import React from 'react';
import { makeStyles, shorthands, tokens, Button, Text } from '@fluentui/react-components';
import { CheckmarkRegular, DismissRegular, EyeRegular } from '@fluentui/react-icons';
import { LayoutIssue } from '../../word/layoutCheck';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('3px'),
    ...shorthands.margin('0', '0', '6px'),
    ...shorthands.padding('6px', '8px'),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2)
  },
  preview: {
    color: tokens.colorNeutralForeground3,
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('4px')
  }
});

interface LayoutCardProps {
  issue: LayoutIssue;
  onSelect: () => void;
  onFix: () => void;
  onIgnore: () => void;
}

export const LayoutCard: React.FC<LayoutCardProps> = ({ issue, onSelect, onFix, onIgnore }) => {
  const styles = useStyles();
  return (
    <div className={styles.card}>
      <Text weight="semibold" size={300}>{issue.title}</Text>
      <Text size={200}>{issue.detail}</Text>
      <Text size={200} className={styles.preview}>{issue.paragraphText.trim().slice(0, 80)}</Text>
      <div className={styles.actions}>
        {issue.fixable && (
          <Button size="small" appearance="primary" icon={<CheckmarkRegular />} onClick={onFix}>Sửa</Button>
        )}
        <Button size="small" icon={<EyeRegular />} onClick={onSelect}>Xem</Button>
        <Button size="small" appearance="subtle" icon={<DismissRegular />} onClick={onIgnore}>Bỏ qua</Button>
      </div>
    </div>
  );
};
