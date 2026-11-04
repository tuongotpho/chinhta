import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Text,
  makeStyles,
  shorthands,
  tokens,
  MessageBar,
  MessageBarBody
} from '@fluentui/react-components';
import {
  DeleteRegular,
  ArrowUploadRegular,
  ArrowDownloadRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  inputRow: {
    display: 'flex',
    ...shorthands.gap('8px'),
    ...shorthands.margin('12px', '0')
  },
  wordList: {
    maxHeight: '200px',
    overflowY: 'auto',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding('8px'),
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px')
  },
  wordItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('4px', '8px'),
    backgroundColor: '#fff',
    borderRadius: '3px',
    ...shorthands.border('1px', 'solid', '#eee')
  },
  note: {
    marginTop: '8px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3
  }
});

interface UserDictionaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  words: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (word: string) => void;
  onExport: () => void;
  onImport: (json: string) => { success: boolean; count: number; error?: string };
}

export const UserDictionaryModal: React.FC<UserDictionaryModalProps> = ({
  open,
  onOpenChange,
  words,
  onAddWord,
  onRemoveWord,
  onExport,
  onImport
}) => {
  const styles = useStyles();
  const [newWord, setNewWord] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (newWord.trim()) {
      onAddWord(newWord.trim());
      setNewWord('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = onImport(content);
      if (res.success) {
        setImportStatus(`Đã nạp thành công ${res.count} từ vào từ điển.`);
      } else {
        setImportStatus(`Lỗi: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Từ điển cá nhân ({words.length} từ)</DialogTitle>
          <DialogContent>
            <div className={styles.inputRow}>
              <Input
                placeholder="Nhập từ hoặc tên riêng..."
                value={newWord}
                onChange={(_, data) => setNewWord(data.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                style={{ flexGrow: 1 }}
              />
              <Button appearance="primary" onClick={handleAdd}>Thêm</Button>
            </div>

            <div className={styles.wordList}>
              {words.length === 0 ? (
                <Text size={200} style={{ textAlign: 'center', color: '#888', padding: '12px' }}>
                  Chưa có từ nào trong từ điển cá nhân.
                </Text>
              ) : (
                words.map((w) => (
                  <div key={w} className={styles.wordItem}>
                    <Text size={200}>{w}</Text>
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={<DeleteRegular />}
                      onClick={() => onRemoveWord(w)}
                    />
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <Button
                size="small"
                icon={<ArrowDownloadRegular />}
                onClick={onExport}
                disabled={words.length === 0}
              >
                Xuất file
              </Button>
              <Button
                size="small"
                icon={<ArrowUploadRegular />}
                onClick={() => fileInputRef.current?.click()}
              >
                Nhập file JSON
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileChange}
              />
            </div>

            {importStatus && (
              <MessageBar style={{ marginTop: '8px' }}>
                <MessageBarBody>{importStatus}</MessageBarBody>
              </MessageBar>
            )}

            <p className={styles.note}>
              ⚠️ <em>Lưu ý: Dữ liệu từ điển này được lưu tại bộ nhớ trình duyệt máy trạm và có thể bị mất khi người dùng xóa cache/dữ liệu trình duyệt của Office. Vui lòng bấm "Xuất file" để sao lưu định kỳ.</em>
            </p>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Đóng</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
