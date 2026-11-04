import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  CardHeader,
  Badge,
  Button,
  Text,
  RadioGroup,
  Radio
} from '@fluentui/react-components';
import {
  EyeRegular,
  CheckmarkRegular,
  DismissRegular,
  BookmarkAddRegular
} from '@fluentui/react-icons';
import { DisplayErrorItem } from '../hooks/useChecker';
import { Severity } from '../../engine/types';

const useStyles = makeStyles({
  card: {
    ...shorthands.margin('8px', '0'),
    boxShadow: tokens.shadow2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2)
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  originalWord: {
    fontWeight: 'bold',
    textDecorationLine: 'line-through',
    color: tokens.colorPaletteRedForeground1
  },
  reasonText: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    ...shorthands.margin('4px', '0')
  },
  suggestionsSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    ...shorthands.margin('8px', '0')
  },
  actionRow: {
    display: 'flex',
    ...shorthands.gap('6px'),
    paddingTop: '8px',
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke3),
    flexWrap: 'wrap'
  }
});

interface ErrorCardProps {
  item: DisplayErrorItem;
  onSelect: () => void;
  onFix: (suggestion: string) => void;
  onIgnore: () => void;
  onAddToDict: (word: string) => void;
  onUpdateSuggestion: (suggestion: string) => void;
}

const SEVERITY_CONFIG: Record<Severity, { label: string; color: 'danger' | 'warning' | 'informative' }> = {
  'chac-chan': { label: 'Chắc chắn', color: 'danger' },
  'nen-xem': { label: 'Nên xem', color: 'warning' },
  'goi-y': { label: 'Gợi ý', color: 'informative' }
};

export const ErrorCard: React.FC<ErrorCardProps> = ({
  item,
  onSelect,
  onFix,
  onIgnore,
  onAddToDict,
  onUpdateSuggestion
}) => {
  const styles = useStyles();
  const { error, selectedSuggestion } = item;
  const config = SEVERITY_CONFIG[error.mucDo] || { label: 'Lỗi', color: 'danger' };

  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <div className={styles.header}>
            <Text weight="semibold" className={styles.originalWord}>
              {error.goc}
            </Text>
            <Badge appearance="filled" color={config.color} size="small">
              {config.label} ({error.luat})
            </Badge>
          </div>
        }
      />

      <Text className={styles.reasonText}>{error.lyDo}</Text>

      {error.goiY && error.goiY.length > 0 && (
        <div className={styles.suggestionsSection}>
          <Text size={200} weight="semibold">Gợi ý sửa:</Text>
          <RadioGroup
            value={selectedSuggestion}
            onChange={(_, data) => onUpdateSuggestion(data.value)}
          >
            {error.goiY.map((sug, idx) => (
              <Radio key={idx} value={sug} label={sug} />
            ))}
          </RadioGroup>
        </div>
      )}

      <div className={styles.actionRow}>
        <Button
          size="small"
          appearance="primary"
          icon={<CheckmarkRegular />}
          onClick={() => onFix(selectedSuggestion)}
        >
          Sửa
        </Button>

        <Button
          size="small"
          appearance="secondary"
          icon={<EyeRegular />}
          onClick={onSelect}
        >
          Xem
        </Button>

        <Button
          size="small"
          appearance="subtle"
          icon={<DismissRegular />}
          onClick={onIgnore}
        >
          Bỏ qua
        </Button>

        <Button
          size="small"
          appearance="subtle"
          icon={<BookmarkAddRegular />}
          onClick={() => onAddToDict(error.goc)}
        >
          Lưu từ điển
        </Button>
      </div>
    </Card>
  );
};
