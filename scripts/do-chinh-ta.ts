import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkParagraph } from '../src/engine/checker';
import { parseNgramModel, setNgramModel } from '../src/engine/ngram';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Sample {
  id: string;
  cau: string;
  coLoi: boolean;
  loaiLoi: string | null;
  tuLoi: string | null;
}

const WORDS_PER_PAGE = 400;
const SPEED_PAGES = 20;
const SPEED_LIMIT_MS = 5000;
const RECALL_TARGET = 90;

const model = fs.readFileSync(path.join(__dirname, '../public/assets/ngram-v2.bin'));
setNgramModel(parseNgramModel(model.buffer.slice(model.byteOffset, model.byteOffset + model.byteLength) as ArrayBuffer));

const samples: Sample[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/test-samples.json'), 'utf8'));

// Bỏ đuôi đánh số để biết số câu khác nhau thật sự
const unique = new Set(samples.map(s => s.cau.replace(/\s*\([^)]*\d+\)\s*$/, ''))).size;

let labelled = 0;
let caught = 0;
let extraOnErrorSentences = 0;
let cleanSentences = 0;
let falsePositives = 0;
let words = 0;

const startTime = performance.now();

for (const sample of samples) {
  const errors = checkParagraph(sample.cau);
  words += sample.cau.split(/\s+/).length;

  if (sample.coLoi && sample.tuLoi) {
    labelled++;
    const target = sample.tuLoi.toLowerCase();
    // Chấm đúng từ đã gán nhãn, không tính câu có báo lỗi bất kỳ
    const hit = errors.some(e => e.goc.toLowerCase().includes(target.trim()) || target.includes(e.goc.toLowerCase().trim()));
    if (hit) caught++;
    else console.warn(`[BỎ SÓT] ${sample.id}: "${sample.tuLoi}" trong "${sample.cau}" -> ${JSON.stringify(errors.map(e => e.goc))}`);
    extraOnErrorSentences += errors.filter(e => !(e.goc.toLowerCase().includes(target.trim()) || target.includes(e.goc.toLowerCase().trim()))).length;
  } else {
    cleanSentences++;
    falsePositives += errors.length;
    if (errors.length) console.warn(`[BÁO NHẦM] ${sample.id}: "${sample.cau}" ->`, errors.map(e => e.goc));
  }
}

const elapsed = performance.now() - startTime;
const recall = (caught / labelled) * 100;
const projected = (elapsed / words) * WORDS_PER_PAGE * SPEED_PAGES;

console.log('--- BỘ MẪU TRONG DỰ ÁN ---');
console.log(`Số câu: ${samples.length}, trong đó khác nhau thật sự: ${unique}`);
console.log(`Lưu ý: bộ mẫu chưa được chủ dự án duyệt nhãn và lặp mẫu, nên đây chưa phải số nghiệm thu Mục 5.`);
console.log(`Bắt đúng từ đã gán nhãn : ${caught}/${labelled} = ${recall.toFixed(1)}% (mục tiêu >= ${RECALL_TARGET}%)`);
console.log(`Báo thêm trên câu có lỗi: ${extraOnErrorSentences}`);
console.log(`Báo nhầm trên câu sạch  : ${falsePositives} (${cleanSentences} câu)`);
console.log(`Quy đổi ${SPEED_PAGES} trang ${WORDS_PER_PAGE} từ: ${projected.toFixed(0)} ms, ${projected <= SPEED_LIMIT_MS ? 'đạt' : 'KHÔNG ĐẠT'} trong Node, chưa đo trên máy văn phòng`);

process.exit(recall < RECALL_TARGET || falsePositives > 1 ? 1 : 0);
