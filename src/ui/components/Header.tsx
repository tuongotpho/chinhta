import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Title3,
  Button,
  Tooltip,
  Badge
} from '@fluentui/react-components';
import {
  BookQuestionMarkRegular,
  BookAddRegular,
  ShieldCheckmarkFilled
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('12px', '16px'),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
    boxShadow: tokens.shadow2
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px')
  },
  shieldIcon: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: '22px'
  },
  actionGroup: {
    display: 'flex',
    ...shorthands.gap('4px')
  }
});

interface HeaderProps {
  onOpenDict: () => void;
  onOpenAbout: () => void;
  dictCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDict,
  onOpenAbout,
  dictCount
}) => {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <ShieldCheckmarkFilled className={styles.shieldIcon} />
        <div>
          <Title3 block style={{ fontSize: '16px', fontWeight: 600 }}>Soát Chính Tả</Title3>
          <Badge size="small" appearance="tint" color="informative">Nội bộ • Không AI</Badge>
        </div>
      </div>

      <div className={styles.actionGroup}>
        <Tooltip content={`Từ điển cá nhân (${dictCount} từ)`} relationship="label">
          <Button
            appearance="subtle"
            icon={<BookAddRegular />}
            onClick={onOpenDict}
            aria-label="Từ điển cá nhân"
          />
        </Tooltip>

        <Tooltip content="Hướng dẫn & Giới thiệu" relationship="label">
          <Button
            appearance="subtle"
            icon={<BookQuestionMarkRegular />}
            onClick={onOpenAbout}
            aria-label="Hướng dẫn & Giới thiệu"
          />
        </Tooltip>
      </div>
    </header>
  );
};
