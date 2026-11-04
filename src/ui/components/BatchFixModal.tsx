import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Text,
  makeStyles,
  shorthands
} from '@fluentui/react-components';

const useStyles = makeStyles({
  listContainer: {
    maxHeight: '160px',
    overflowY: 'auto',
    ...shorthands.margin('12px', '0'),
    ...shorthands.padding('8px'),
    backgroundColor: '#f3f2f1',
    borderRadius: '4px',
    fontSize: '12px'
  }
});

interface BatchFixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => void;
  isFixing?: boolean;
}

export const BatchFixModal: React.FC<BatchFixModalProps> = ({
  open,
  onOpenChange,
  count,
  onConfirm,
  isFixing
}) => {
  const styles = useStyles();

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Xác nhận sửa hàng loạt lỗi</DialogTitle>
          <DialogContent>
            <Text block>
              Tự động sửa <strong>{count}</strong> lỗi ở mức <strong>Chắc chắn</strong> có đúng một cách sửa? Các lỗi có nhiều gợi ý hoặc không có gợi ý cần bạn tự chọn.
            </Text>
            <div className={styles.listContainer}>
              <Text size={200} block>
                • Các lỗi sẽ được xử lý an toàn theo thứ tự từ cuối văn bản lên đầu (bottom-up) để bảo đảm không bị lệch vị trí các đoạn phía trên.
              </Text>
              <Text size={200} block style={{ marginTop: '4px' }}>
                • Nếu tính năng Track Changes đang bật, mọi sửa đổi sẽ được ghi nhận là thay đổi có theo dõi trong Word.
              </Text>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" disabled={isFixing}>Hủy bỏ</Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              onClick={onConfirm}
              disabled={isFixing}
            >
              {isFixing ? 'Đang sửa...' : `Đồng ý sửa (${count})`}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
