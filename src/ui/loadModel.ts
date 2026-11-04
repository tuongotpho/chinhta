import { provideNgramModel } from '../engine/workerClient';

const MODEL_URL = '/assets/ngram-v1.bin';

let pending: Promise<boolean> | null = null;

/**
 * Tải bảng thống kê cùng tên miền rồi giao cho engine. Lệnh mạng cố ý nằm ngoài src/engine:
 * engine không có đường ra mạng, và yêu cầu này chỉ tải xuống, không mang theo nội dung văn bản.
 * Không tải được thì engine vẫn chạy, chỉ thiếu R8 và xếp hạng gợi ý theo tần suất.
 */
export function prepareEngine(): Promise<boolean> {
  if (!pending) {
    pending = fetch(MODEL_URL)
      .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        provideNgramModel(await response.arrayBuffer());
        return true;
      })
      .catch(error => {
        console.warn('Không tải được bảng thống kê, tạm bỏ qua luật R8:', error);
        pending = null;
        return false;
      });
  }
  return pending;
}
