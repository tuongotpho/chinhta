/**
 * Mô hình tần suất âm tiết và cặp âm tiết dùng cho xếp hạng gợi ý và luật R8.
 * Tệp nhị phân do scripts/build-ngram.py sinh ra; chỉ chứa thống kê, không chứa văn bản.
 * Chưa nạp mô hình thì engine vẫn chạy, chỉ thiếu R8 và xếp hạng theo tần suất.
 */
export interface NgramModel {
  words: string[];
  ids: Map<string, number>;
  unigrams: Uint32Array;
  keys: Uint32Array;
  quantized: Uint16Array;
  total: number;
}

const MAGIC = 0x3152474e; // "NGR1"
const HEADER_BYTES = 28;

let activeModel: NgramModel | null = null;

export function parseNgramModel(buffer: ArrayBuffer): NgramModel {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== MAGIC) {
    throw new Error('Tệp mô hình n-gram không đúng định dạng');
  }
  const vocabSize = view.getUint32(4, true);
  const pairCount = view.getUint32(8, true);
  const vocabBytes = view.getUint32(12, true);
  const total = view.getFloat64(16, true);

  const text = new TextDecoder('utf-8').decode(new Uint8Array(buffer, HEADER_BYTES, vocabBytes));
  const words = text.replace(/\0+$/, '').split('\n');
  let offset = HEADER_BYTES + vocabBytes;
  const unigrams = new Uint32Array(buffer, offset, vocabSize);
  offset += vocabSize * 4;
  const keys = new Uint32Array(buffer, offset, pairCount);
  offset += pairCount * 4;
  const quantized = new Uint16Array(buffer, offset, pairCount);

  const ids = new Map<string, number>();
  words.forEach((word, index) => ids.set(word, index));
  return { words, ids, unigrams, keys, quantized, total };
}

export function setNgramModel(model: NgramModel | null): void {
  activeModel = model;
}

export function getNgramModel(): NgramModel | null {
  return activeModel;
}

export function unigramCount(word: string): number {
  if (!activeModel) return 0;
  const id = activeModel.ids.get(word);
  return id === undefined ? 0 : activeModel.unigrams[id];
}

export function bigramCount(left: string, right: string): number {
  const model = activeModel;
  if (!model) return 0;
  const a = model.ids.get(left);
  const b = model.ids.get(right);
  if (a === undefined || b === undefined) return 0;

  const key = a * 32768 + b;
  let low = 0;
  let high = model.keys.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    const value = model.keys[mid];
    if (value === key) return Math.round(Math.pow(2, model.quantized[mid] / 1024));
    if (value < key) low = mid + 1;
    else high = mid - 1;
  }
  return 0;
}
