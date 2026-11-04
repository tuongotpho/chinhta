import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Spinner,
  MessageBar,
  MessageBarBody
} from '@fluentui/react-components';
import {
  DocumentSearchRegular,
  SelectAllOnRegular,
  WandRegular
} from '@fluentui/react-icons';

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
}

export const ScanControls: React.FC<ScanControlsProps> = ({
  isScanning,
  onScanAll,
  onScanSelection,
  onOpenBatchModal,
  sureCount,
  oldFontWarning
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {oldFontWarning && (
        <MessageBar intent="warning">
          <MessageBarBody>{oldFontWarning}</MessageBarBody>
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
