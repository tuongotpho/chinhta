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

interface OldFontModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isConverting?: boolean;
}

export const OldFontModal: React.FC<OldFontModalProps> = ({ open, onOpenChange, onConfirm, isConverting }) => (
  <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
    <DialogSurface>
      <DialogBody>
        <DialogTitle>Đổi bảng mã cũ sang Unicode</DialogTitle>
        <DialogContent>
          <Text block>
            Đổi toàn bộ phần thân văn bản, kể cả bảng, từ TCVN3 (.VnTime) và VNI sang Unicode, font đổi sang Times New Roman hoặc Arial. Đậm, nghiêng và cỡ chữ được giữ nguyên.
          </Text>
          <Text block size={200} style={{ marginTop: '8px' }}>
            Nên lưu một bản sao trước khi đổi. Đầu trang, chân trang và hộp văn bản chưa được đổi. Nếu Track Changes đang bật, mọi thay đổi sẽ được ghi nhận.
          </Text>
        </DialogContent>
        <DialogActions>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary" disabled={isConverting}>Hủy bỏ</Button>
          </DialogTrigger>
          <Button appearance="primary" onClick={onConfirm} disabled={isConverting}>
            {isConverting ? 'Đang đổi...' : 'Đồng ý đổi'}
          </Button>
        </DialogActions>
      </DialogBody>
    </DialogSurface>
  </Dialog>
);
