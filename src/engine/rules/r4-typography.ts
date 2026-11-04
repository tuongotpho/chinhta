import { SpellError, Severity } from '../types';

function pushError(
  errors: SpellError[],
  text: string,
  start: number,
  end: number,
  fix: string,
  lyDo: string,
  mucDo: Severity = 'chac-chan'
): void {
  errors.push({ luat: 'R4', batDau: start, ketThuc: end, goc: text.slice(start, end), goiY: [fix], mucDo, lyDo });
}

/**
 * Luật R4: Lỗi dấu câu và khoảng trắng (Mức: Chắc chắn)
 * Ví dụ: "công ty ,trách nhiệm ." -> "công ty, trách nhiệm."
 * Không đụng tới tab và dấu cách căn lề biểu mẫu, dấu dẫn mục lục, tên tệp, viết tắt.
 */
export function checkR4Typography(normalizedText: string): SpellError[] {
  const errors: SpellError[] = [];

  if (!normalizedText) return errors;

  let match: RegExpExecArray | null;

  // 1. Khoảng trắng trước dấu câu. Dấu chấm phải là dấu chấm thật:
  // " .docx" và " ....." không phải lỗi này.
  const spaceBeforePunctRegex = /(\p{L}|\p{N}|[)”"])([  ]+)(?:([,:;?!])|(\.)(?![.\p{L}\p{N}]))/gu;
  while ((match = spaceBeforePunctRegex.exec(normalizedText)) !== null) {
    const punct = match[3] ?? match[4];
    const start = match.index + match[1].length;
    const end = start + match[2].length + punct.length;
    pushError(errors, normalizedText, start, end, punct, `Không đặt dấu cách trước dấu câu '${punct}'`);
  }

  // 2. Thiếu khoảng trắng sau dấu phẩy, chấm phẩy, hai chấm khi nối tiếp chữ cái.
  // Tránh URL, email, số thập phân.
  const missingSpaceAfterRegex = /(?<!https?:\/\/\S*)(?<!www\.\S*)(?<!\S+@\S*)(?<!\d)([,;:])(\p{L})/gu;
  while ((match = missingSpaceAfterRegex.exec(normalizedText)) !== null) {
    pushError(
      errors, normalizedText, match.index, match.index + match[0].length,
      `${match[1]} ${match[2]}`, `Cần có dấu cách sau dấu '${match[1]}' trước từ tiếp theo`
    );
  }

  // 3. Thiếu khoảng trắng sau dấu kết câu khi bắt đầu câu mới: "nghiêm túc.Trân trọng".
  // Chỉ báo khi chữ trước viết thường và chữ sau là chữ thường hóa đầu: loại P.KT, KS.Phạm, ASP.NET, BaoCao.PDF.
  const missingSpaceDotRegex = /(?<!https?:\/\/\S*)(?<!www\.\S*)(?<!\S+@\S*)(?<=\p{Ll}\p{Ll})([.!?])(\p{Lu})(?=\p{Ll})/gu;
  while ((match = missingSpaceDotRegex.exec(normalizedText)) !== null) {
    pushError(
      errors, normalizedText, match.index, match.index + match[0].length,
      `${match[1]} ${match[2]}`, `Cần có dấu cách sau dấu chấm câu '${match[1]}' trước khi viết hoa câu mới`
    );
  }

  // 4. Thừa dấu cách sát trong ngoặc và ngoặc kép: "( 03 )", "“ kế hoạch ”". Ô trống "(   )" của biểu mẫu thì giữ.
  const insideRegex = /([(“])[  ]+([^\s)”])|([^\s(“])[  ]+([)”])/gu;
  while ((match = insideRegex.exec(normalizedText)) !== null) {
    const opening = match[1] !== undefined;
    const fix = opening ? `${match[1]}${match[2]}` : `${match[3]}${match[4]}`;
    pushError(
      errors, normalizedText, match.index, match.index + match[0].length, fix,
      opening ? 'Không đặt dấu cách ngay sau dấu mở' : 'Không đặt dấu cách ngay trước dấu đóng'
    );
  }

  // 5. Dấu câu lặp: ",,", ";;", ".." (dấu ba chấm "..." và dấu dẫn dài vẫn hợp lệ)
  const repeatedPunctRegex = /(?<![.])\.\.(?![.])|,{2,}|;{2,}/gu;
  while ((match = repeatedPunctRegex.exec(normalizedText)) !== null) {
    const single = match[0][0];
    pushError(
      errors, normalizedText, match.index, match.index + match[0].length,
      single, `Dấu '${single}' bị lặp`
    );
  }

  // 6. Thừa dấu cách giữa hai chữ. Bỏ qua sau dấu hai chấm vì đó thường là căn lề biểu mẫu.
  const multipleSpacesRegex = /(?<=[\p{L}\p{N},.;)])[  ]{2,}(?=[\p{L}\p{N}(])/gu;
  while ((match = multipleSpacesRegex.exec(normalizedText)) !== null) {
    pushError(
      errors, normalizedText, match.index, match.index + match[0].length,
      ' ', 'Thừa dấu cách liên tiếp', 'nen-xem'
    );
  }

  return errors;
}
