import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Badge,
  Button,
  Text,
  ToggleButton
} from '@fluentui/react-components';
import {
  ArrowRightRegular,
  EyeRegular,
  CheckmarkRegular,
  DismissRegular,
  BookmarkAddRegular
} from '@fluentui/react-icons';
import { DisplayErrorItem } from '../hooks/useChecker';
import { Severity } from '../../engine/types';

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
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    ...shorthands.gap('6px')
  },
  fixLine: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: '4px',
    minWidth: 0,
    fontSize: '13px',
    lineHeight: '18px',
    wordBreak: 'break-word'
  },
  originalWord: {
    fontWeight: 600,
    textDecorationLine: 'line-through',
    color: tokens.colorPaletteRedForeground1
  },
  arrow: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3
  },
  suggestion: {
    fontWeight: 600,
    color: tokens.colorPaletteGreenForeground1
  },
  badge: {
    flexShrink: 0
  },
  reasonText: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    ...shorthands.overflow('hidden'),
    fontSize: '11px',
    lineHeight: '14px',
    color: tokens.colorNeutralForeground3
  },
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('3px')
  },
  suggestionBtn: {
    minWidth: 0,
    height: '22px',
    ...shorthands.padding('0', '6px'),
    fontSize: '12px',
    fontWeight: 400
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('2px'),
    marginTop: '1px'
  },
  actionBtn: {
    minWidth: 0,
    height: '24px',
    ...shorthands.padding('0', '6px'),
    fontSize: '12px',
    fontWeight: 400
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
  const hasSuggestion = error.goiY.length > 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.fixLine}>
          <span className={styles.originalWord}>{error.goc}</span>
          {hasSuggestion && (
            <>
              <ArrowRightRegular className={styles.arrow} />
              <span className={styles.suggestion}>{selectedSuggestion}</span>
            </>
          )}
        </div>
        <Badge
          className={styles.badge}
          appearance="filled"
          color={config.color}
          size="small"
          title={`Luật ${error.luat}`}
        >
          {config.label}
        </Badge>
      </div>

      <Text className={styles.reasonText} title={error.lyDo}>{error.lyDo}</Text>

      {error.goiY.length > 1 && (
        <div className={styles.suggestions} role="group" aria-label="Chọn gợi ý sửa">
          {error.goiY.map(sug => (
            <ToggleButton
              key={sug}
              className={styles.suggestionBtn}
              size="small"
              appearance="outline"
              checked={sug === selectedSuggestion}
              onClick={() => onUpdateSuggestion(sug)}
            >
              {sug}
            </ToggleButton>
          ))}
        </div>
      )}

      <div className={styles.actionRow}>
        {hasSuggestion && (
          <Button
            className={styles.actionBtn}
            size="small"
            appearance="primary"
            icon={<CheckmarkRegular />}
            onClick={() => onFix(selectedSuggestion)}
          >
            Sửa
          </Button>
        )}

        <Button
          className={styles.actionBtn}
          size="small"
          appearance="subtle"
          icon={<EyeRegular />}
          title="Xem chỗ này trong văn bản"
          onClick={onSelect}
        >
          Xem
        </Button>

        <Button
          className={styles.actionBtn}
          size="small"
          appearance="subtle"
          icon={<DismissRegular />}
          onClick={onIgnore}
        >
          Bỏ qua
        </Button>

        <Button
          className={styles.actionBtn}
          size="small"
          appearance="subtle"
          icon={<BookmarkAddRegular />}
          title="Lưu vào từ điển của tôi"
          onClick={() => onAddToDict(error.goc)}
        >
          Lưu
        </Button>
      </div>
    </div>
  );
};
