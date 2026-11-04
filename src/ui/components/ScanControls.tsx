import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Spinner,
  Checkbox,
  MessageBar,
  MessageBarBody
} from '@fluentui/react-components';
import {
  DocumentSearchRegular,
  SelectAllOnRegular,
  WandRegular
} from '@fluentui/react-icons';
import { CheckOptions } from '../../engine/types';
import { Notice } from '../hooks/useChecker';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    ...shorthands.padding('12px', '16px'),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2)
  },
  buttonRow: {
    display: 'flex',
    ...shorthands.gap('8px'),
    flexWrap: 'wrap'
  },
  scanBtn: {
    flexGrow: 1
  },
  sureBtn: {
    backgroundColor: tokens.colorPaletteBlueBackground2,
    color: tokens.colorPaletteBlueForeground2,
    fontWeight: 600
  }
});

interface ScanControlsProps {
  isScanning: boolean;
  onScanAll: () => void;
  onScanSelection: () => void;
  onOpenBatchModal: () => void;
  sureCount: number;
  oldFontWarning: string | null;
  notice: Notice | null;
  hasScanned: boolean;
  options: CheckOptions;
  onOptionsChange: (options: CheckOptions) => void;
}

export const ScanControls: React.FC<ScanControlsProps> = ({
  isScanning,
  onScanAll,
  onScanSelection,
  onOpenBatchModal,
  sureCount,
  oldFontWarning,
  notice,
  hasScanned,
  options,
  onOptionsChange
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {oldFontWarning && (
        <MessageBar intent="warning">
          <MessageBarBody>{oldFontWarning}</MessageBarBody>
        </MessageBar>
      )}

      {notice && (
        <MessageBar intent={notice.intent}>
          <MessageBarBody>{notice.text}</MessageBarBody>
        </MessageBar>
      )}

      {hasScanned && (
        <MessageBar intent="info">
          <MessageBarBody>Chưa quét đầu trang, chân trang, chú thích và hộp văn bản.</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.buttonRow}>
        <Button
          className={styles.scanBtn}
          appearance="primary"
          icon={isScanning ? <Spinner size="tiny" /> : <DocumentSearchRegular />}
          disabled={isScanning}
          onClick={onScanAll}
        >
          {isScanning ? 'Đang quét...' : 'Quét toàn bộ'}
        </Button>

        <Button
          appearance="secondary"
          icon={<SelectAllOnRegular />}
          disabled={isScanning}
          onClick={onScanSelection}
        >
          Vùng chọn
        </Button>
      </div>

      <div className={styles.buttonRow}>
        <Checkbox
          label="Xét ngữ cảnh (R8)"
          checked={options.enableR8 !== false}
          onChange={(_, data) => onOptionsChange({ ...options, enableR8: Boolean(data.checked) })}
        />
        <Checkbox
          label="Thống nhất kiểu dấu (R7)"
          checked={options.enableR7 === true}
          onChange={(_, data) => onOptionsChange({ ...options, enableR7: Boolean(data.checked) })}
        />
      </div>

      {sureCount > 0 && (
        <Button
          appearance="outline"
          className={styles.sureBtn}
          icon={<WandRegular />}
          onClick={onOpenBatchModal}
        >
          Sửa nhanh {sureCount} lỗi chắc chắn
        </Button>
      )}
    </div>
  );
};
