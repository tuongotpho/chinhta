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
  Badge,
  makeStyles,
  shorthands,
  tokens
} from '@fluentui/react-components';

const useStyles = makeStyles({
  section: {
    ...shorthands.margin('12px', '0'),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('6px')
  },
  ruleBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px')
  },
  authorFooter: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #ddd',
    textAlign: 'center',
    fontWeight: 'bold',
    color: tokens.colorNeutralForeground1
  }
});

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ open, onOpenChange }) => {
  const styles = useStyles();

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Giới thiệu & Hướng dẫn sử dụng</DialogTitle>
          <DialogContent>
            <div className={styles.section}>
              <Text weight="semibold">🛡️ Cam kết an toàn & bảo mật:</Text>
              <Text size={200}>
                - Văn bản 100% <strong>không bao giờ rời khỏi máy tính</strong> của bạn.
              </Text>
              <Text size={200}>
                - Không sử dụng AI, LLM hay gửi văn bản qua máy chủ bên ngoài. Add-in chỉ tải về bảng thống kê tần suất cặp âm tiết.
              </Text>
              <Text size={200}>
                - Không làm hỏng định dạng bảng biểu, hình ảnh hay tính năng Theo dõi sửa đổi (Track Changes).
              </Text>
            </div>

            <div className={styles.section}>
              <Text weight="semibold">📌 3 mức độ cảnh báo:</Text>
              <div className={styles.ruleBadgeRow}>
                <Badge appearance="filled" color="danger" size="small">Chắc chắn</Badge>
                <Text size={200}>Lỗi gõ phím Telex, sai âm tiết, cặp từ sai 100%, lỗi dấu câu.</Text>
              </div>
              <div className={styles.ruleBadgeRow}>
                <Badge appearance="filled" color="warning" size="small">Nên xem</Badge>
                <Text size={200}>Từ ngữ phụ thuộc ngữ cảnh, lặp từ, quy chuẩn viết hoa Nghị định 30/2020.</Text>
              </div>
              <div className={styles.ruleBadgeRow}>
                <Badge appearance="filled" color="informative" size="small">Gợi ý</Badge>
                <Text size={200}>Thống nhất kiểu bỏ dấu thanh (hòa/hoà, thủy/thuỷ, kĩ/kỹ).</Text>
              </div>
            </div>

            <div className={styles.section}>
              <Text weight="semibold">⚡ Hỗ trợ chuyên ngành Điện lực (EVN):</Text>
              <Text size={200}>
                Đã tích hợp từ điển chuyên ngành điện (MBA, TBA, CBCNV, 110kV, 220kV, MC 171, v.v.), không báo lỗi nhầm các thuật ngữ kỹ thuật.
              </Text>
            </div>

            <div className={styles.section}>
              <Text weight="semibold">📚 Nguồn dữ liệu:</Text>
              <Text size={200}>- Thống kê tiếng Việt từ Wikipedia, Wikisource, Wikibooks và Wiktionary (CC BY-SA 4.0).</Text>
              <Text size={200}>- Danh sách từ: Wiktionary, Kaikki.org (CC BY-SA 4.0) và Viet74K của Hồ Ngọc Đức (GNU GPL).</Text>
              <Text size={200}>- Quy tắc viết hoa theo Nghị định 30/2020/NĐ-CP.</Text>
              <Text size={200}>- Add-in phát hành theo giấy phép GNU GPL phiên bản 3 trở lên.</Text>
            </div>

            <div className={styles.authorFooter}>
              (C) August87 - 0982722036
            </div>
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
