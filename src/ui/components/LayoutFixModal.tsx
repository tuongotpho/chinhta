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
  Text
} from '@fluentui/react-components';

interface LayoutFixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => void;
  isFixing?: boolean;
}

export const LayoutFixModal: React.FC<LayoutFixModalProps> = ({ open, onOpenChange, count, onConfirm, isFixing }) => (
  <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
    <DialogSurface>
      <DialogBody>
        <DialogTitle>Sửa trình bày hàng loạt</DialogTitle>
        <DialogContent>
          <Text block>
            Sửa <strong>{count}</strong> mục: căn đều đoạn văn, đưa font và cỡ chữ về chuẩn của văn bản, gỡ dòng bị giãn.
          </Text>
          <Text block size={200} style={{ marginTop: '8px' }}>
            Dấu cách đầu dòng và căn lề bằng dấu cách không sửa hàng loạt vì có thể đang căn biểu mẫu. Nên lưu một bản sao trước khi sửa.
          </Text>
        </DialogContent>
        <DialogActions>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary" disabled={isFixing}>Hủy bỏ</Button>
          </DialogTrigger>
          <Button appearance="primary" onClick={onConfirm} disabled={isFixing}>
            {isFixing ? 'Đang sửa...' : 'Đồng ý sửa'}
          </Button>
        </DialogActions>
      </DialogBody>
    </DialogSurface>
  </Dialog>
);
