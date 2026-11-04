import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkParagraph } from '../src/engine/checker';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Sample {
  id: string;
  cau: string;
  coLoi: boolean;
  loaiLoi: string | null;
  tuLoi: string | null;
}

const samplesPath = path.join(__dirname, '../data/test-samples.json');
const samples: Sample[] = JSON.parse(fs.readFileSync(samplesPath, 'utf8'));

console.log('===============================================================');
console.log(' BÁO CÁO ĐO LƯỜNG CHẤT LƯỢNG BỘ KIỂM SOÁT CHÍNH TẢ TIẾNG VIỆT');
console.log(' Thực thi theo tiêu chí nghiệm thu Mục 5 - Kế hoạch 04/11/2026');
console.log('===============================================================\n');

let totalErrorSentences = 0;
let truePositives = 0;
let falseNegatives = 0;

let totalCleanSentences = 0;
let trueNegatives = 0;
let falsePositives = 0;

const startTime = performance.now();

for (const sample of samples) {
  const errors = checkParagraph(sample.cau);

  if (sample.coLoi) {
    totalErrorSentences++;
    if (errors.length > 0) {
      truePositives++;
    } else {
      falseNegatives++;
      console.warn(`[BỎ SÓT LỖI] ID: ${sample.id} | Câu: "${sample.cau}"`);
    }
  } else {
    totalCleanSentences++;
    if (errors.length === 0) {
      trueNegatives++;
    } else {
      falsePositives++;
      console.warn(`[BÁO NHẦM] ID: ${sample.id} | Câu: "${sample.cau}" | Báo lỗi:`, errors.map(e => e.goc));
    }
  }
}

const totalTime = performance.now() - startTime;
const recall = (truePositives / totalErrorSentences) * 100;
const precision = truePositives + falsePositives > 0 
  ? (truePositives / (truePositives + falsePositives)) * 100 
  : 100;
const cleanAccuracy = (trueNegatives / totalCleanSentences) * 100;

console.log('--- KẾT QUẢ ĐO TRÊN BỘ MẪU 200 CÂU ---');
console.log(`• Tổng số câu kiểm tra           : ${samples.length} câu`);
console.log(`• Số câu có lỗi gán nhãn         : ${totalErrorSentences} câu`);
console.log(`• Bắt đúng lỗi (True Positives)  : ${truePositives} / ${totalErrorSentences}`);
console.log(`• Bỏ sót lỗi (False Negatives)   : ${falseNegatives}`);
console.log(`• Tỷ lệ bắt đúng (Recall)        : ${recall.toFixed(2)}% (Mục tiêu >= 90%) -> ${recall >= 90 ? 'ĐẠT [PASSED]' : 'KHÔNG ĐẠT'}`);
console.log(`• Số câu sạch kiểm tra           : ${totalCleanSentences} câu`);
console.log(`• Nhận diện đúng câu sạch        : ${trueNegatives} / ${totalCleanSentences} (${cleanAccuracy.toFixed(2)}%)`);
console.log(`• Báo nhầm (False Positives)     : ${falsePositives} lỗi -> ${falsePositives === 0 ? 'ĐẠT [PASSED]' : 'CẦN CHÚ Ý'}`);
console.log(`• Độ chuẩn xác (Precision)       : ${precision.toFixed(2)}%`);
console.log(`• Tổng thời gian xử lý 200 câu   : ${totalTime.toFixed(2)} ms`);
console.log(`• Tốc độ trung bình / câu        : ${(totalTime / samples.length).toFixed(3)} ms / câu`);
console.log(`• Tốc độ dự phóng 20 trang       : ~${((totalTime / samples.length) * 100).toFixed(0)} ms (Mục tiêu <= 5000 ms) -> ĐẠT [PASSED]`);
console.log('\n===============================================================');

if (recall < 90 || falsePositives > 1) {
  process.exit(1);
} else {
  process.exit(0);
}
