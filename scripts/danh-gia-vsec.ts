// Đánh giá engine trên VSEC, bộ lỗi chính tả thật do người gán nhãn, nằm ngoài dự án.
//
// Tải dữ liệu: https://github.com/VSEC2021/VSEC (Dataset/VSEC.jsonl) vào data/ngoai/vsec.jsonl
// Chia đôi cố định: dòng chẵn (dev) để chỉnh ngưỡng, dòng lẻ (test) chỉ để chấm.
// Cách chạy: npx tsx scripts/danh-gia-vsec.ts dev 6,7,8,9
//            npx tsx scripts/danh-gia-vsec.ts test 8
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkParagraph } from '../src/engine/checker';
import { isValidSyllable } from '../src/engine/syllable';
import { parseNgramModel, setNgramModel } from '../src/engine/ngram';

interface Annotation {
  current_syllable: string;
  is_correct: boolean;
  alternative_syllables: string[];
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const half = process.argv[2] === 'test' ? 'test' : 'dev';
const thresholds = (process.argv[3] ?? '8').split(',').map(Number);

const raw = fs.readFileSync(path.join(root, 'public/assets/ngram-v2.bin'));
setNgramModel(parseNgramModel(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer));

const rows = fs
  .readFileSync(path.join(root, 'data/ngoai/vsec.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(line => JSON.parse(line) as { text: string; annotations: Annotation[] })
  .filter((_, index) => (index % 2 === 0) === (half === 'dev'));

const clean = (s: string) => s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const pct = (a: number, b: number) => `${a}/${b} = ${((a / Math.max(b, 1)) * 100).toFixed(1)}%`;

for (const threshold of thresholds) {
  let total = 0, hit = 0, nonWord = 0, nonWordHit = 0, realWord = 0, realWordHit = 0;
  let withGold = 0, topRight = 0, noSuggestion = 0, syllables = 0;
  const outside: Record<string, number> = {};
  const started = performance.now();

  for (const row of rows) {
    const spans: { start: number; end: number; ann: Annotation }[] = [];
    let cursor = 0;
    let broken = false;
    for (const ann of row.annotations) {
      const at = row.text.indexOf(ann.current_syllable, cursor);
      if (at < 0) { broken = true; break; }
      spans.push({ start: at, end: at + ann.current_syllable.length, ann });
      cursor = at + ann.current_syllable.length;
    }
    if (broken) continue;

    const errors = checkParagraph(row.text, { r8Threshold: threshold }).filter(e => e.luat !== 'R4');
    syllables += spans.length;

    for (const span of spans) {
      if (span.ann.is_correct) continue;
      total++;
      const isNonWord = !isValidSyllable(clean(span.ann.current_syllable));
      if (isNonWord) nonWord++; else realWord++;

      const found = errors.find(e => e.batDau < span.end && e.ketThuc > span.start);
      if (!found) continue;
      hit++;
      if (isNonWord) nonWordHit++; else realWordHit++;

      const gold = span.ann.alternative_syllables.map(s => clean(s).toLowerCase().normalize('NFC'));
      if (gold.length === 0) continue;
      withGold++;
      if (found.goiY.length === 0) noSuggestion++;
      const first = found.goiY[0]?.toLowerCase().normalize('NFC');
      if (first && gold.some(g => first.includes(g))) topRight++;
    }

    for (const error of errors) {
      const labelled = spans.some(s => !s.ann.is_correct && error.batDau < s.end && error.ketThuc > s.start);
      if (!labelled) outside[error.luat] = (outside[error.luat] ?? 0) + 1;
    }
  }

  const outsideTotal = Object.values(outside).reduce((a, b) => a + b, 0);
  console.log(`\n[${half}] ngưỡng R8 = ${threshold}, ${rows.length} câu, ${syllables} âm tiết, ${(performance.now() - started).toFixed(0)} ms`);
  console.log('  Toàn bộ lỗi           :', pct(hit, total));
  console.log('  Từ sai cấu tạo        :', pct(nonWordHit, nonWord));
  console.log('  Chữ có nghĩa nhưng sai:', pct(realWordHit, realWord));
  console.log('  Độ chính xác (sàn)    :', pct(hit, hit + outsideTotal));
  console.log('  Gợi ý số 1 đúng       :', pct(topRight, withGold));
  console.log('  Không có gợi ý        :', pct(noSuggestion, withGold));
  console.log(`  Báo ngoài nhãn/1000   : ${((outsideTotal / syllables) * 1000).toFixed(2)} ${JSON.stringify(outside)}`);
}
