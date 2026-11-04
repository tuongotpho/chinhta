import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bảng thanh điệu chuẩn tiếng Việt
const toneVowels = {
  'a': ['a', 'à', 'á', 'ả', 'ã', 'ạ'],
  'ă': ['ă', 'ằ', 'ắ', 'ẳ', 'ẵ', 'ặ'],
  'â': ['â', 'ầ', 'ấ', 'ẩ', 'ẫ', 'ậ'],
  'e': ['e', 'è', 'é', 'ẻ', 'ẽ', 'ẹ'],
  'ê': ['ê', 'ề', 'ế', 'ể', 'ễ', 'ệ'],
  'i': ['i', 'ì', 'í', 'ỉ', 'ĩ', 'ị'],
  'y': ['y', 'ỳ', 'ý', 'ỷ', 'ỹ', 'ỵ'],
  'o': ['o', 'ò', 'ó', 'ỏ', 'õ', 'ọ'],
  'ô': ['ô', 'ồ', 'ố', 'ổ', 'ỗ', 'ộ'],
  'ơ': ['ơ', 'ờ', 'ớ', 'ở', 'ỡ', 'ợ'],
  'u': ['u', 'ù', 'ú', 'ủ', 'ũ', 'ụ'],
  'ư': ['ư', 'ừ', 'ứ', 'ử', 'ữ', 'ự']
};

// Các vần tiếng Việt cơ bản (phần vần trước khi ghép thanh điệu)
// Cấu trúc: [vần không dấu, vị trí đặt dấu (chữ cái nhận dấu), các thanh cho phép: 'all' hoặc 'sac-nang']
const rhymeTemplates = [
  // Vần đơn
  ['a', 'a', 'all'], ['ăc', 'ă', 'sac-nang'], ['ăt', 'ă', 'sac-nang'], ['ăp', 'ă', 'sac-nang'],
  ['ăm', 'ă', 'all'], ['ăn', 'ă', 'all'], ['ăng', 'ă', 'all'],
  ['â', 'â', 'all'], ['âc', 'â', 'sac-nang'], ['ât', 'â', 'sac-nang'], ['âp', 'â', 'sac-nang'],
  ['âm', 'â', 'all'], ['ân', 'â', 'all'], ['âng', 'â', 'all'], ['âu', 'â', 'all'], ['ây', 'â', 'all'],
  ['ac', 'a', 'sac-nang'], ['at', 'a', 'sac-nang'], ['ap', 'a', 'sac-nang'], ['ach', 'a', 'sac-nang'],
  ['am', 'a', 'all'], ['an', 'a', 'all'], ['ang', 'a', 'all'], ['anh', 'a', 'all'],
  ['ao', 'a', 'all'], ['au', 'a', 'all'], ['ay', 'a', 'all'], ['ai', 'a', 'all'],
  ['e', 'e', 'all'], ['ec', 'e', 'sac-nang'], ['et', 'e', 'sac-nang'], ['ep', 'e', 'sac-nang'],
  ['em', 'e', 'all'], ['en', 'e', 'all'], ['eng', 'e', 'all'], ['eo', 'e', 'all'],
  ['ê', 'ê', 'all'], ['êch', 'ê', 'sac-nang'], ['êt', 'ê', 'sac-nang'], ['êp', 'ê', 'sac-nang'],
  ['êm', 'ê', 'all'], ['ên', 'ê', 'all'], ['ênh', 'ê', 'all'], ['êu', 'ê', 'all'],
  ['i', 'i', 'all'], ['ich', 'i', 'sac-nang'], ['it', 'i', 'sac-nang'], ['ip', 'i', 'sac-nang'],
  ['im', 'i', 'all'], ['in', 'i', 'all'], ['inh', 'i', 'all'], ['iu', 'i', 'all'],
  ['ia', 'i', 'all'], ['iêc', 'ê', 'sac-nang'], ['iêt', 'ê', 'sac-nang'], ['iêp', 'ê', 'sac-nang'],
  ['iêm', 'ê', 'all'], ['iên', 'ê', 'all'], ['iêng', 'ê', 'all'], ['iêu', 'ê', 'all'],
  ['y', 'y', 'all'], ['yêm', 'ê', 'all'], ['yên', 'ê', 'all'], ['yêng', 'ê', 'all'], ['yêu', 'ê', 'all'], ['yêt', 'ê', 'sac-nang'],
  ['o', 'o', 'all'], ['oc', 'o', 'sac-nang'], ['ot', 'o', 'sac-nang'], ['op', 'o', 'sac-nang'],
  ['om', 'o', 'all'], ['on', 'o', 'all'], ['ong', 'o', 'all'], ['oi', 'o', 'all'],
  ['ô', 'ô', 'all'], ['ôc', 'ô', 'sac-nang'], ['ôt', 'ô', 'sac-nang'], ['ôp', 'ô', 'sac-nang'],
  ['ôm', 'ô', 'all'], ['ôn', 'ô', 'all'], ['ông', 'ô', 'all'], ['ôi', 'ô', 'all'],
  ['ơ', 'ơ', 'all'], ['ơt', 'ơ', 'sac-nang'], ['ơp', 'ơ', 'sac-nang'],
  ['ơm', 'ơ', 'all'], ['ơn', 'ơ', 'all'], ['ơi', 'ơ', 'all'],
  ['u', 'u', 'all'], ['uc', 'u', 'sac-nang'], ['ut', 'u', 'sac-nang'], ['up', 'u', 'sac-nang'],
  ['um', 'u', 'all'], ['un', 'u', 'all'], ['ung', 'u', 'all'], ['ui', 'u', 'all'],
  ['ua', 'u', 'all'], ['uôc', 'ô', 'sac-nang'], ['uôt', 'ô', 'sac-nang'], ['uôp', 'ô', 'sac-nang'],
  ['uôm', 'ô', 'all'], ['uôn', 'ô', 'all'], ['uông', 'ô', 'all'], ['uôi', 'ô', 'all'],
  ['ư', 'ư', 'all'], ['ưc', 'ư', 'sac-nang'], ['ưt', 'ư', 'sac-nang'],
  ['ưm', 'ư', 'all'], ['ưn', 'ư', 'all'], ['ưng', 'ư', 'all'], ['ưu', 'ư', 'all'], ['ưi', 'ư', 'all'],
  ['ưa', 'ư', 'all'], ['ươc', 'ơ', 'sac-nang'], ['ươt', 'ơ', 'sac-nang'], ['ươp', 'ơ', 'sac-nang'],
  ['ươm', 'ơ', 'all'], ['ươn', 'ơ', 'all'], ['ương', 'ơ', 'all'], ['ươu', 'ơ', 'all'], ['ươi', 'ơ', 'all'],
  // Vần có âm đệm o / u
  ['oa', 'a', 'all'], ['oac', 'a', 'sac-nang'], ['oat', 'a', 'sac-nang'], ['oap', 'a', 'sac-nang'],
  ['oam', 'a', 'all'], ['oan', 'a', 'all'], ['oang', 'a', 'all'], ['oanh', 'a', 'all'],
  ['oach', 'a', 'sac-nang'], ['oai', 'a', 'all'], ['oao', 'a', 'all'], ['oay', 'a', 'all'],
  ['oăc', 'ă', 'sac-nang'], ['oăt', 'ă', 'sac-nang'], ['oăn', 'ă', 'all'], ['oăng', 'ă', 'all'],
  ['oe', 'e', 'all'], ['oet', 'e', 'sac-nang'], ['oen', 'e', 'all'], ['oeo', 'e', 'all'],
  ['ua', 'u', 'all'], ['uân', 'â', 'all'], ['uâng', 'â', 'all'], ['uât', 'â', 'sac-nang'],
  ['uê', 'ê', 'all'], ['uên', 'ê', 'all'], ['uênh', 'ê', 'all'], ['uêch', 'ê', 'sac-nang'], ['uêt', 'ê', 'sac-nang'],
  ['uy', 'y', 'all'], ['uyn', 'y', 'all'], ['uynh', 'y', 'all'], ['uych', 'y', 'sac-nang'], ['uyt', 'y', 'sac-nang'],
  ['uyp', 'y', 'sac-nang'], ['uyu', 'y', 'all'], ['uya', 'y', 'all'], ['uyêc', 'ê', 'sac-nang'],
  ['uyêt', 'ê', 'sac-nang'], ['uyêm', 'ê', 'all'], ['uyên', 'ê', 'all'], ['uyêng', 'ê', 'all']
];

// Phụ âm đầu
const initials = [
  '', 'b', 'c', 'ch', 'd', 'đ', 'g', 'gh', 'gi', 'h', 'k', 'kh',
  'l', 'm', 'n', 'ng', 'ngh', 'nh', 'p', 'ph', 'qu', 'r', 's', 't', 'th', 'tr', 'v', 'x'
];

function applyTone(baseChar, toneIndex) {
  return toneVowels[baseChar] ? toneVowels[baseChar][toneIndex] : baseChar;
}

const syllableSet = new Set();

for (const initial of initials) {
  for (const [rhyme, toneChar, toneType] of rhymeTemplates) {
    // Quy tắc chính tả âm đầu
    // 1. k, gh, ngh chỉ đi với e, ê, i, y, iê, ia, yê, ya
    const startsWithFrontVowel = /^[eêiy]|^(iê|ia|yê|ya)/.test(rhyme);
    if (['k', 'gh', 'ngh'].includes(initial) && !startsWithFrontVowel) continue;
    // 2. c, g, ng KHÔNG đi với e, ê, i, y, iê, ia
    if (['c', 'g', 'ng'].includes(initial) && startsWithFrontVowel) continue;
    // 3. qu: luôn đi kèm vần bắt đầu bằng a, ă, â, e, ê, i, y, o, ô, ơ (trong âm thanh qu đã có u)
    if (initial === 'qu') {
      if (rhyme.startsWith('u') || rhyme.startsWith('o')) continue;
    }
    // 4. p chỉ đứng đầu trong các từ mượn như pin, pa-nô, pi-a-nô hoặc kết hợp
    if (initial === 'gi' && rhyme.startsWith('i')) continue; // không có gii

    const tonesToApply = toneType === 'sac-nang' ? [2, 5] : [0, 1, 2, 3, 4, 5];

    for (const tone of tonesToApply) {
      // Thay thế ký tự mang dấu
      const pos = rhyme.indexOf(toneChar);
      if (pos === -1) continue;
      const tonedChar = applyTone(toneChar, tone);
      const tonedRhyme = rhyme.substring(0, pos) + tonedChar + rhyme.substring(pos + toneChar.length);
      const fullWord = (initial + tonedRhyme).toLowerCase().normalize('NFC');
      syllableSet.add(fullWord);
    }
  }
}

// Bổ sung các âm tiết đặc biệt, từ đơn thường dùng
const extraWords = [
  'gì', 'già', 'giá', 'giả', 'giã', 'giạ', 'giờ', 'giời', 'giúp', 'giùm',
  'coong', 'boong', 'xích', 'xích', 'kính', 'quốc', 'quần', 'quãng', 'quảng',
  'quang', 'quảng', 'quyết', 'quản', 'quán', 'quang', 'quân', 'quần',
  'tất', 'bật', 'tắt', 'bật', 'quá', 'quạ', 'quạu', 'quẹt', 'quẹo', 'quậy',
  'quậy', 'quàng', 'quáng', 'quầng', 'quăng', 'quẳng', 'quẵng', 'quặng',
  'quắt', 'quặt', 'quăn', 'quần', 'quấn', 'quẩn', 'quẫn', 'quận'
];

for (const w of extraWords) {
  syllableSet.add(w.normalize('NFC'));
}

const sorted = Array.from(syllableSet).sort();
console.log(`Tổng số âm tiết sinh ra: ${sorted.length}`);

fs.writeFileSync(path.join(__dirname, '../data/am-tiet-tieng-viet.txt'), sorted.join('\n'), 'utf8');
console.log('Đã ghi vào data/am-tiet-tieng-viet.txt');
