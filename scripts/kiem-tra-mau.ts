// Chấm engine trên văn bản mẫu: chạy trên đúng các đoạn của tệp Word, đối chiếu đáp án do generator sinh ra.
// Cách chạy: npx tsx scripts/kiem-tra-mau.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkParagraph } from '../src/engine/checker';
import { parseNgramModel, setNgramModel } from '../src/engine/ngram';
import { detectOldFont } from '../src/word/fontDetector';

interface Planted {
  id: number;
  viTri: string;
  sai: string;
  dung: string;
  loai: string;
  batDau: number;
  ketThuc: number;
  doan: string;
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = fs.readFileSync(path.join(root, 'public/assets/ngram-v1.bin'));
setNgramModel(parseNgramModel(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer));

const { loi, doan } = JSON.parse(fs.readFileSync(path.join(root, 'data/mau/dap-an.json'), 'utf8')) as {
  loi: Planted[];
  doan: { text: string; viTri: string }[];
};

const seen = new Set<string>();
const detail: Record<number, { luat: string; goiY: string[]; mucDo: string }> = {};
const found = new Set<number>();
const correct = new Set<number>();
const falseAlarms: string[] = [];
let words = 0;
let skippedOldFont = 0;

for (const { text, viTri } of doan) {
  if (seen.has(text)) continue;
  seen.add(text);
  words += text.split(/\s+/).length;

  if (detectOldFont(undefined, text).isOldFont) {
    skippedOldFont++;
    continue;
  }

  const planted = loi.filter(l => l.doan === text);
  for (const error of checkParagraph(text)) {
    const match = planted.find(p => error.batDau < p.ketThuc && error.ketThuc > p.batDau);
    if (!match) {
      falseAlarms.push(`${viTri}: ${error.luat}/${error.mucDo} ${JSON.stringify(error.goc)} -> ${JSON.stringify(error.goiY)}`);
      continue;
    }
    found.add(match.id);
    detail[match.id] ??= { luat: error.luat, goiY: error.goiY, mucDo: error.mucDo };
    const fixed = text.slice(0, error.batDau) + (error.goiY[0] ?? '') + text.slice(error.ketThuc);
    const expected = text.slice(0, match.batDau) + match.dung + text.slice(match.ketThuc);
    if (fixed === expected || expected.includes(fixed.slice(error.batDau, error.batDau + (error.goiY[0]?.length ?? 0)))) {
      correct.add(match.id);
    }
  }
}

console.log(`Lỗi cài: ${loi.length}. Phát hiện: ${found.size}. Gợi ý số 1 đúng: ${correct.size}.`);
console.log(`Báo nhầm: ${falseAlarms.length} trên ${words} từ. Đoạn font cũ được bỏ qua: ${skippedOldFont}.`);
console.log('Bỏ sót:', loi.filter(l => !found.has(l.id)).map(l => `${l.sai} (${l.loai})`).join(' | ') || 'không');
console.log('Gợi ý chưa đúng:', loi.filter(l => found.has(l.id) && !correct.has(l.id)).map(l => l.sai).join(' | ') || 'không');
for (const line of falseAlarms) console.log('  ' + line);

fs.writeFileSync(path.join(root, 'data/mau/ket-qua.json'), JSON.stringify({ detail, falseAlarms }, null, 2));
