# [02] Báo cáo đánh giá độc lập: Word add-in soát chính tả tiếng Việt

04/11/2026 · Tiếp nối: [01-BAO-CAO-DE-BAI-GEMINI-ADDIN-CHINH-TA.md](01-BAO-CAO-DE-BAI-GEMINI-ADDIN-CHINH-TA.md) · Nguồn: mã nguồn tại commit `bd7e26e` cộng 20 file thay đổi chưa commit lúc 14:15, bộ dữ liệu VSEC, từ điển Viet74K, trang `soatchinhta.web.app`

## 1. Kết luận

**Add-in chạy được về kỹ thuật nhưng chưa đạt để dùng trên văn bản thật và chưa qua các cổng nghiệm thu ở Mục 5 của đề bài.**

- **Làm tốt:** phát hiện từ sai cấu tạo (94,3% trên dữ liệu lỗi thật), tốc độ, tách `src/engine` khỏi `src/word`.
- **Chưa đạt:** báo nhầm dày đặc trên văn bản hành chính, gợi ý sửa kém, và **"Sửa nhanh" có thể làm hỏng chữ đúng**.
- **Không có giá trị nghiệm thu:** các số 100% và 32/32 hiện tại, cùng các dòng "ĐẠT" trong tài liệu kiểm thử.

Báo cáo này chỉ đánh giá, không sửa mã nguồn. Chưa có phép thử nào trên Word thật (xem Mục 8).

## 2. Đối chiếu tiêu chí nghiệm thu (Mục 5 đề bài)

| Tiêu chí | Cách đo theo đề bài | Hiện trạng | Đánh giá |
| --- | --- | --- | --- |
| Bắt đúng ≥ 90% | Bộ 200 câu, chủ dự án duyệt nhãn | Bộ hiện có chỉ khoảng 50 câu lặp lại, chấm sai cách, chưa có xác nhận duyệt nhãn | **Chưa đo được** |
| Báo nhầm < 1 lỗi/trang | 20 văn bản thật đã sạch lỗi | Chưa có văn bản thật. Mẫu tự soạn cho thấy rất xa ngưỡng (Mục 4.3) | **Chưa đo được, dấu hiệu không đạt** |
| Tốc độ ≤ 5 giây | 20 trang trên máy văn phòng thật | 0,8 giây cho khoảng 15.000 từ trong Node | **Đạt sơ bộ**, chưa đo trên Word |
| Riêng tư | Test CSP và theo dõi mạng | Có test CSP, chưa theo dõi mạng khi quét | **Chưa đủ** |
| An toàn văn bản | Danh sách kiểm tra Bước 2, có ảnh chụp | Không có ảnh; mã có lỗi ở Mục 6 | **Không đạt** |
| Dùng trên máy cơ quan | Máy mới, người không biết IT | Không có bằng chứng | **Chưa đo được** |
| Hỗ trợ phiên bản | Bản Word cơ quan và Microsoft 365 | Bảng ghi "Đạt" nhưng không có ảnh | **Chưa kiểm chứng** |

Mẫu tự soạn trong báo cáo này chỉ dùng để phát hiện lỗi. Theo đề bài, nó không được coi là văn bản thật và không thay thế phép đo nghiệm thu.

## 3. Vì sao số đo hiện có không đáng tin

Lệnh `tsc`, `vitest` (23 test), `do-chinh-ta` (100%) và `kiem-tra-doc-lap` (32/32) đều chạy qua, nhưng:

1. **Bộ 200 câu lặp mẫu.** [generate-test-samples.js](scripts/generate-test-samples.js) xoay vòng khoảng 50 câu, chỉ đổi đuôi "(Mẫu số 1)", "(Mục 2)".
2. **Chấm quá dễ.** [do-chinh-ta.ts:40](scripts/do-chinh-ta.ts#L40) tính đúng khi câu có lỗi bất kỳ, không so với `tuLoi`. Báo nhầm trong câu có lỗi không được tính.
3. **Dòng tốc độ ghi cứng "ĐẠT".** [do-chinh-ta.ts:76](scripts/do-chinh-ta.ts#L76) in `ĐẠT [PASSED]` không qua điều kiện. Con số "20 trang" lại quy đổi từ 100 câu.
4. **Bộ "độc lập" đã bị vá theo đề.** [kiem-tra-doc-lap.ts](scripts/kiem-tra-doc-lap.ts) từng đạt 15/32 theo [rasoat.md](rasoat.md), rồi engine được sửa theo chính các câu đó:
   - [syllable.ts:375-376](src/engine/syllable.ts#L375-L376) viết cứng `nghiem`, `nawm`.
   - R2 tăng từ 32 lên 50 cặp, có nguyên `chỉ đọa`, `thục hiện`, `sáng xuất` từ đề.
   - Hệ quả: từ cùng kiểu như `tiep`, `viet`, `dien` không có gợi ý.

Mục 6 đề bài cấm "sửa, xoá, bỏ qua test hoặc hạ ngưỡng để cho xanh". Vá engine theo đúng câu trong đề cho kết quả tương tự: số xanh nhưng không phản ánh chất lượng.

## 4. Kết quả đo lại

### 4.1. Bộ VSEC (lỗi chính tả thật, người gán nhãn)

9.341 câu, 282.459 âm tiết, 11.202 lỗi. Không tính R4 vì VSEC không gán nhãn dấu câu.

| Chỉ số | Kết quả |
| --- | --- |
| Từ sai cấu tạo (1.875 lỗi) | **94,3%** |
| Chữ có nghĩa nhưng sai (9.327 lỗi) | **2,1%** |
| Toàn bộ lỗi | **17,6%** |
| Gợi ý số 1 đúng, trên lỗi bắt được | 33,2% |
| Có gợi ý đúng ở vị trí bất kỳ | 46,0% |
| Lỗi bắt được mà không có gợi ý | 47,5% |
| Độ chính xác | 58,9% (mức sàn, vì có chữ nước ngoài và lỗi chưa gán nhãn) |
| Báo ngoài nhãn | 4,86 trên 1.000 âm tiết |

Cách đọc:

- VSEC là văn bản đại chúng, không phải văn bản hành chính, và **không phải thước đo nghiệm thu**.
- Con số 2,1% không phải vi phạm đề bài. Mục 6 đã xác định "không có AI nên chỉ bắt lỗi ngữ cảnh có trong danh sách". Con số này cho biết giới hạn thực tế đó lớn đến đâu.
- VSEC không có câu sạch, nên không đo được tỷ lệ câu sạch bị báo nhầm.

### 4.2. Bộ kiểm tra âm tiết, đối chiếu từ điển Viet74K

- Chấp nhận 17.952 dạng, trong đó **10.421 dạng không có trong từ điển**, ví dụ `bường`, `lĩn`, `nóm`, `tiêng`. Các lỗi dạng này lọt qua R1.
- Từ chối 1.341 âm tiết trong từ điển. Đa số là chữ nước ngoài, phiên âm hoặc mục lỗi của chính từ điển, nhưng có âm tiết thật bị từ chối sai: `quỳnh`, `quýt`, `quýnh`, `quỵt`.
- Đề bài yêu cầu so với tập âm tiết cỡ vài nghìn. Bản hiện tại sinh theo quy tắc nên rộng hơn nhiều; [data/am-tiet-tieng-viet.txt](data/am-tiet-tieng-viet.txt) không được dùng.

### 4.3. Mẫu văn bản hành chính ngành điện tự soạn (59 đoạn, 642 từ, không có lỗi)

| Phần | Số đoạn | Số từ | Báo nhầm | Mức "Chắc chắn" |
| --- | --- | --- | --- | --- |
| Quyết định thông thường | 39 | 416 | **34** | 34 |
| Phần có câu cố ý đặt bẫy | 20 | 226 | 30 | 26 |
| Tổng | 59 | 642 | 64 | 60 |

Mẫu này cố ý dày thuật ngữ nên tỷ lệ thực tế sẽ thấp hơn. Theo luật: R1 46, R4 9, R2 5, R3 2, R5 1, R6 1.

### 4.4. 68 lỗi hay gặp, không trùng danh sách R2

- Phát hiện **24/68 (35%)**, gợi ý số 1 đúng **15/68 (22%)**.
- Danh sách này do người đánh giá chọn, không đại diện thống kê.

### 4.5. Hiệu năng trong Node

| Dữ liệu | Thời gian |
| --- | --- |
| 900 đoạn, khoảng 15.000 từ | 809 ms |
| 1 đoạn 80.639 ký tự | 504 ms |
| 1 chuỗi không dấu cách 80.000 ký tự | 4.639 ms |

Trường hợp cuối cho thấy regex lookbehind của R4 tăng thời gian mạnh theo độ dài, nhưng khó gặp trong văn bản thường.

## 5. Lỗi engine

### 5.1. Nghiêm trọng: "Sửa nhanh" làm hỏng chữ đúng

Mô phỏng bằng cách áp gợi ý số 1 của mọi lỗi mức "Chắc chắn":

| Trước | Sau |
| --- | --- |
| Tiếp xúc tích cực với khách hàng | Tiếp súc tích cực với khách hàng |
| Sáng xuất phát lúc 7h | Sáng suốt phát lúc 7h |
| được nhận chức vụ Trưởng phòng | được nhậm chức vụ Trưởng phòng |
| đọc giả thuyết của tác giả | độc giả thuyết của tác giả |
| dùng chung thực hiện | dùng trung thực hiện |
| Họ tên:(4 dấu cách)Nguyễn Văn A(2 tab)Đơn vị | Họ tên: Nguyễn Văn A Đơn vị |
| BaoCao.PDF, ASP.NET | BaoCao. PDF, ASP. NET |

Thêm ba nguyên nhân khác:

- Gợi ý luôn thử thanh sắc trước thanh nặng ([syllable.ts:341-344](src/engine/syllable.ts#L341-L344)): `đươc` → `đước`, `hoc` → `hóc`, `lich` → `lích`.
- Mất chữ hoa: `Hoạtt` → `hoạt`, `Ddieefu` → `điều`, `XẢN XUẤT` → `Sản xuất`, `DÀNH GIẢI` → `Giành GIẢI`.
- R2 khớp cụm âm tiết không xét ngữ cảnh nhưng vẫn gắn mức "Chắc chắn".

### 5.2. Báo nhầm nội dung thường gặp

Đề bài yêu cầu bỏ qua mã, số, viết tắt và từ tiếng Anh, nhưng R1 đang báo nhầm:

| Nhóm | Ví dụ | Nguyên nhân |
| --- | --- | --- |
| Chữ cái đơn | `điểm b`, `b)`, `c)`, `đ)`, `Đ/c`, `K/g`, `T/M`, `b/c` | [r1-syllable.ts:53](src/engine/rules/r1-syllable.ts#L53) chỉ miễn nguyên âm |
| Số hiệu, học vị | `QĐ-TTg`, `TTr-KT`, `ThS` | Chữ thường trong mã viết tắt |
| Đơn vị đo | `MWh`, `GWh`, `600kVAr`, `25kA`, `3x240mm2`, `500ms`, `80cm`, `1s` | Danh sách đơn vị thiếu ([tokenizer.ts:25](src/engine/tokenizer.ts#L25)) |
| Tiền | `1.250.000đ`, `đ/kWh` | `đ` bị tách thành chữ đơn |
| Nối gạch | `Tài chính-Kế toán`, `kinh tế-xã hội`, `Công-tơ`, `ô-tô` | Coi cả cụm là một âm tiết ([tokenizer.ts:47](src/engine/tokenizer.ts#L47)) |
| Tiếng Anh, từ vay mượn | `recloser`, `website`, `laptop`, `camera`, `Fax`, `Inverter` | Danh sách cho phép quá ngắn |
| Địa danh, tên đầu câu | `Quỳnh`, `Đắk`, `Kon` | Chỉ miễn tên riêng giữa câu |

Các luật khác:

- **R4:** `P.KT`, `KS.Phạm`, `.docx`, dấu dẫn mục lục `.....`, căn lề bằng tab hoặc dấu cách.
- **R2:** xem Mục 5.1. Trên VSEC còn có `nhận chức`, `xúc tích`, `cọ sát` bị báo ngoài nhãn.
- **R3:** `giành sự công bằng`, `giành thời cơ`.
- **R5:** `từ từ`, `song song`, `chung chung`, `mãi mãi` không có trong danh sách từ láy hợp lệ.
- **R6:** `chính phủ` nghĩa chung (`nhiều chính phủ trên thế giới`).

### 5.3. Bỏ sót

- **Tiêu đề in hoa:** bị coi là viết tắt nên không kiểm tra ([tokenizer.ts:89](src/engine/tokenizer.ts#L89)). `QUYẾT ĐINH`, `BÁO CÁO KÊT QUẢ`, `KẾ HOACH` đều lọt.
- **Lỗi kinh điển:** `kỷ thuật`, `kỹ luật`, `công xuất`, `năng xuất`, `đề suất`, `sửa chửa`, `sữa chữa`, `cập nhập`, `sử lý`, `Trương trình`, `Chung tâm`, `Lội dung`, `Nỗ lực` viết thành `Lỗ lực`.
- **Từ sai nhưng đúng cấu tạo:** `Kiễm`, `Triễn`, `Lảnh`, `xự`, `tiêng`.
- **Thiếu dấu:** `cong ty`, `ve`, các dạng này hợp lệ về cấu tạo nên không báo.
- **Chính tả ghép vần sai:** `coa`, `cuyên`, `cuân` được chấp nhận vì điều kiện cho phụ âm `c` ở [syllable.ts:116](src/engine/syllable.ts#L116) đúng với mọi vần không bắt đầu bằng `i`, `e`, `ê`, `y`.
- **Gõ đảo chữ:** phát hiện được `Cogn`, `Khôgn`, `nhưgn` nhưng không có gợi ý.

### 5.4. Tách token sai

Biểu thức ở [tokenizer.ts:63](src/engine/tokenizer.ts#L63) dùng `\b` chỉ hiểu ASCII nên cắt đôi từ có dấu ngay sau số:

| Câu | Kết quả tách |
| --- | --- |
| Mỗi 5 mét | `5 m` + `ét` |
| Có 12 hộ dân | `12 h` + `ộ` |
| Gồm 10 hợp đồng | `10 h` + `ợp` |
| Đội 3 Vận hành | `3 V` + `ận` |

Hiện ít gây báo nhầm vì phần còn lại vẫn là âm tiết hợp lệ, nhưng làm hỏng các luật khớp theo từ.

## 6. Lỗi tầng Word và giao diện (đọc mã, chưa chạy trên Word thật)

| Mức | Lỗi | Vị trí | Liên hệ đề bài |
| --- | --- | --- | --- |
| Cao | Quét vùng chọn chỉ nhận `Inside`, `Equal`, `Contains`; bỏ `ContainsStart/End`, `InsideStart/End`, `OverlapsBefore/After`. Đoạn đầu và cuối vùng chọn có thể bị bỏ, rồi báo "Văn bản rất chuẩn xác!" | [wordService.ts:109](src/word/wordService.ts#L109) | Thao tác chính Bước 3 |
| Cao | Không đọc lại và so đoạn với lúc quét. Phép so `range.text` với `goc` gần như luôn đúng vì `goc` vừa được dùng để tìm | [wordService.ts:248](src/word/wordService.ts#L248) | Bước 2: "nếu đã đổi thì quét lại đoạn đó và không ghi" |
| Cao | Sửa lần lượt trong cùng đoạn dùng offset cũ. Đã mô phỏng: muốn sửa lần 2 thì chọn lần 3, sửa lần 3 thì thất bại | [wordService.ts:291](src/word/wordService.ts#L291) | Bước 2: sửa đúng lần xuất hiện |
| Cao | Lỗi không có gợi ý bị thay bằng chính nó, tính là đã sửa rồi biến khỏi danh sách | [useChecker.ts:68](src/ui/hooks/useChecker.ts#L68) | Báo sai kết quả |
| Cao | Sửa được một lỗi là toàn bộ lỗi "Chắc chắn" bị xóa khỏi danh sách, kể cả lỗi sửa thất bại | [useChecker.ts:115](src/ui/hooks/useChecker.ts#L115) | Báo sai kết quả |
| Vừa | Worker lỗi thì không có `onerror`, "Đang quét..." quay mãi | [workerClient.ts:38](src/engine/workerClient.ts#L38) | Giao diện |
| Vừa | Sửa thất bại hoặc quét lỗi chỉ ghi console, người dùng không thấy gì | [useChecker.ts](src/ui/hooks/useChecker.ts) | Giao diện |
| Vừa | Đoạn có `©`, `®`, `½`, `§`, `·` bị coi là font cũ và bỏ qua cả đoạn. Văn bản mã VNI như `Vieät Nam` không nhận ra qua nội dung | [fontDetector.ts:15](src/word/fontDetector.ts#L15) | Bước 2: nhận diện font cũ |
| Vừa | Không có dòng nào báo đầu trang, chân trang, chú thích chưa được quét | [useChecker.ts](src/ui/hooks/useChecker.ts) | Bước 2 |
| Vừa | Không có mã xử lý riêng cho chữ đã xoá khi có Track Changes | [wordService.ts](src/word/wordService.ts) | Bước 2: "chữ đã xoá không được tính là lỗi" |
| Thấp | Giao diện không có chỗ bật tắt luật, R7 không bật được | [App.tsx](src/ui/App.tsx) | Tùy chọn |
| Thấp | `cap-tu-ngu-canh.json`, `syllablesData.ts`, `am-tiet-tieng-viet.txt` không được dùng; R3 viết cứng trong mã nên `dành quyền` trong dữ liệu không có tác dụng | [r3-context.ts](src/engine/rules/r3-context.ts) | Bảo trì |

## 7. Hồ sơ và triển khai

- [KIEM-THU-WORD.md](docs/KIEM-THU-WORD.md) ghi 7 tình huống "ĐẠT", [KET-QUA-THU-CAI-DAT.md](docs/KET-QUA-THU-CAI-DAT.md) ghi 3 máy "Đạt", nhưng không có ảnh chụp như cổng Bước 2 yêu cầu. Từ lặp được ghi đạt trong khi mã có lỗi ở Mục 6. Cần coi các dòng này là chưa kiểm chứng.
- [NGUON-DU-LIEU.md](data/NGUON-DU-LIEU.md) mô tả tập âm tiết R1 không còn khớp với cách làm hiện tại.
- Trang đang chạy là bản build lúc 14:06, trùng `dist/`, cũ hơn mã engine sửa lúc 14:13.
- Toàn bộ thay đổi sau `bd7e26e` chưa commit, gồm cả file mới `src/engine/syllable.ts` và `src/engine/workerClient.ts`.

## 8. Phần chưa kiểm được

- Chưa chạy trên Word thật, nên mọi lỗi ở Mục 6 là kết quả đọc mã; riêng lỗi offset đã mô phỏng hàm định vị, lỗi selection đã đối chiếu tên quan hệ trong `@types/office-js`.
- Chưa kiểm: cách Word trả `paragraph.text` khi có Track Changes, tìm kiếm chuỗi chỉ gồm dấu cách hoặc tab, Undo, bảng, chữ đậm nghiêng trong từ, tài liệu 50 trang.
- Chưa thử trên Word 2016/2019 bản cài cố định. Tài liệu ghi là hỗ trợ, nhưng tài liệu Microsoft hiện chỉ nêu WebView2 cho các bản còn được hỗ trợ, nên cần thử trên đúng bản cơ quan đang dùng.
- Chưa có 20 văn bản thật và bộ 200 câu đã duyệt nhãn, nên chưa có số nghiệm thu chính thức.
- Hiệu năng đo trong Node trên máy phát triển, không phải WebView trên máy văn phòng.
- Viet74K chỉ dùng để đối chiếu, chưa kiểm giấy phép. Không được đưa vào sản phẩm trước khi xác minh, theo quy định dữ liệu của đề bài.

## 9. Thứ tự sửa đề xuất

1. **Chặn hỏng văn bản:** Sửa nhanh chỉ áp dụng cho lỗi có đúng một gợi ý chắc chắn, giữ nguyên chữ hoa, không tính đã sửa nếu chưa sửa thật, sửa nốt các lỗi mức Cao ở Mục 6.
2. **Giảm báo nhầm:** sửa tách từ, chữ cái đơn, đơn vị đo, từ nối gạch, ký hiệu hành chính, tiếng Anh; rút hoặc thêm điều kiện ngữ cảnh cho các cặp R2 dễ trùng; không gộp tab căn lề.
3. **Nâng độ phủ:** thêm tập âm tiết hoặc từ điển có giấy phép rõ, xếp gợi ý theo tần suất, quét tiêu đề in hoa, mở rộng R2 theo danh sách chủ dự án duyệt.
4. **Dựng lại phép đo:** gỡ các mẹo viết cứng, chấm theo đúng từ lỗi, tách dữ liệu chỉnh luật khỏi dữ liệu chấm, dùng 200 câu đã duyệt và 20 văn bản thật.
5. **Kiểm thử trên Word thật** theo [KIEM-THU-WORD.md](docs/KIEM-THU-WORD.md), có ảnh chụp, rồi mới cập nhật các dòng "ĐẠT".

## 10. Việc cần chủ dự án quyết định

1. Duyệt nhãn bộ 200 câu và cung cấp 20 văn bản thật đã xoá thông tin nội bộ.
2. Duyệt danh sách R2 mở rộng, vì đề bài cấm tự bịa từ.
3. Chọn phạm vi cho lỗi chữ có nghĩa dùng sai: giữ giới hạn trong đề bài (chỉ bắt lỗi có trong danh sách), hay đầu tư thêm mô hình tần suất cặp từ chạy ngay trên máy. Mô hình này vẫn không dùng AI đám mây nhưng vượt phạm vi đề bài hiện tại.

## Phụ lục. Cách đo

- **VSEC:** github.com/VSEC2021/VSEC, tệp `Dataset/VSEC.jsonl`. Lỗi tính là bắt được khi một báo lỗi không thuộc R4 chồng lên âm tiết gán nhãn sai.
- **Viet74K:** github.com/duyet/vietnamese-wordlist. Loại mục có gạch nối, tách theo dấu cách. Độ lỏng đo bằng cách sinh mọi tổ hợp phụ âm đầu, nguyên âm, âm cuối, thanh, rồi đếm dạng được chấp nhận mà không có trong từ điển.
- **Mẫu hành chính và 68 lỗi:** người đánh giá tự soạn sau khi đọc mã, tránh các cặp đã có trong R2. Phần bẫy cố ý nhắm vào điểm yếu nên được tách riêng ở Mục 4.3.
- **Lệnh kiểm tra dự án:** `npx tsc --noEmit`, `npx vitest run`, `npx tsx scripts/do-chinh-ta.ts`, `npx tsx scripts/kiem-tra-doc-lap.ts`.
