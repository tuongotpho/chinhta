export type Severity = 'chac-chan' | 'nen-xem' | 'goi-y';

export type RuleCode = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7';

export interface SpellError {
  /** Mã luật vi phạm (R1 - R7) */
  luat: RuleCode;
  /** Vị trí bắt đầu trong chuỗi gốc (offset) */
  batDau: number;
  /** Vị trí kết thúc trong chuỗi gốc (offset) */
  ketThuc: number;
  /** Chuỗi văn bản gốc bị lỗi */
  goc: string;
  /** Danh sách từ/cụm từ gợi ý sửa */
  goiY: string[];
  /** Mức độ cảnh báo: 'chac-chan', 'nen-xem', 'goi-y' */
  mucDo: Severity;
  /** Lý do/giải thích chi tiết lỗi */
  lyDo: string;
}

export interface CheckOptions {
  enableR1?: boolean; // Lỗi âm tiết / gõ Telex (mặc định: true)
  enableR2?: boolean; // Cụm từ nhầm lẫn kiểm duyệt (mặc định: true)
  enableR3?: boolean; // Cặp từ ngữ cảnh (mặc định: true)
  enableR4?: boolean; // Dấu câu và khoảng trắng (mặc định: true)
  enableR5?: boolean; // Lặp từ liền nhau (mặc định: true)
  enableR6?: boolean; // Viết hoa tên cơ quan Nghị định 30 (mặc định: true)
  enableR7?: boolean; // Thống nhất kiểu dấu hoà/hòa (mặc định: false)
  userDictionary?: string[]; // Từ điển người dùng cá nhân thêm vào
  ignoreRules?: RuleCode[]; // Danh sách luật bỏ qua
}

export interface NormalizedResult {
  text: string;
  toOriginalOffset: (normalizedOffset: number) => number;
}
