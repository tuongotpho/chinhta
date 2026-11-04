# [01] Đề bài thực thi: Word add-in soát chính tả tiếng Việt nội bộ (không AI)

04/11/2026 · Tiếp nối: [addin-chinhta.md](addin-chinhta.md) · Nguồn: yêu cầu của chủ dự án, tài liệu Microsoft Learn, kết quả chạy thử mã mẫu ngày 04/11/2026

> Gửi Gemini: file này là đề bài duy nhất. `addin-chinhta.md` chỉ để tham khảo; chỗ nào mâu thuẫn thì theo file này. **Không dùng lại** `manifest.xml`, `wordService.ts`, `main.py` trong đó: manifest mẫu không đọc được dưới dạng XML, logic dò lỗi báo nhầm cả chữ đã đúng.

## 1. Mục tiêu và phạm vi

Add-in Word soát lỗi chính tả, dấu câu và viết hoa cho văn bản tiếng Việt, dùng nội bộ một đơn vị thuộc EVN, nhiều người dùng, chủ yếu Word bản mới hoặc Microsoft 365 trên Windows.

**Bắt buộc**

- Văn bản không rời khỏi máy người dùng.
- Cài đặt thuận tiện, không phát sinh cảnh báo bảo mật với người dùng cuối.
- Không làm hỏng định dạng, bảng biểu, Track Changes.

**Cấm trong phạm vi này**

- AI, LLM, huấn luyện hoặc fine-tune mô hình, gọi bất kỳ API ngôn ngữ nào.
- Máy chủ xử lý: Python, FastAPI, Redis, Docker, VPS, cơ sở dữ liệu.
- Đăng nhập, tài khoản, thống kê sử dụng, gửi dữ liệu về.
- Macro VBA, VSTO, file `.exe` hoặc `.msi` cài đặt.
- Số liệu không đo được: không hiển thị "độ tin cậy 99%", không viết "nhanh gấp N lần" nếu không có phép đo trong kho mã.

## 2. Kiến trúc đã chốt

- Office Web Add-in, ngăn bên phải (task pane): TypeScript, React, Vite, Fluent UI v9.
- **Manifest dạng XML** (add-in only manifest).
- Toàn bộ bộ kiểm chạy trong trình duyệt của add-in, đặt trong Web Worker để không đơ giao diện.
- Web tĩnh trên **Firebase Hosting**. Microsoft Marketplace chỉ đăng thông tin và manifest, không chứa mã, nên đi đường nào cũng cần hosting. Mã và từ điển chung cập nhật bằng cách đưa lại web, không cần cài lại ở từng máy.
- Bộ kiểm trong `src/engine/` dùng chung cho cả công cụ web và Word add-in, không viết hai lần.
- CSP (danh sách nguồn mạng được phép) đặt chặt: chỉ cho phép nguồn của chính add-in và Office.js. Văn bản không được xuất hiện trong bất kỳ lệnh mạng nào; phải có test chứng minh.
- `Word.run` chỉ nằm trong một lớp riêng `src/word/`. Bộ kiểm trong `src/engine/` không phụ thuộc Word, để chạy test bằng Node.
- Yêu cầu tối thiểu `WordApi 1.3`. Tính năng cao hơn phải kiểm `isSetSupported` và tự tắt êm nếu không có.
- Đánh dấu ngay trong văn bản (WordApi 1.7) cần Microsoft 365 và **không thuộc phiên bản đầu**. Không tô màu vào tài liệu để đánh dấu lỗi, vì làm bẩn văn bản.

## 3. Đường phát hành

Thực tế cơ quan (chốt 04/11/2026): không có Microsoft 365 quản lý tập trung, không có thư mục mạng dùng chung, không đẩy được Group Policy, máy trạm có internet.

Đã loại: Admin Center (cần quản trị), thư mục mạng (cơ quan không có), SharePoint catalog (cần SharePoint tại chỗ).

**Đường chính: T, cài tại máy có xin phép.** Chủ dự án xin phép cơ quan, rồi khai báo add-in trên từng máy một lần. Đường T là cách Microsoft dành cho lúc phát triển, Microsoft không cam kết hỗ trợ cho sản phẩm thật, nên phải đo ở Bước 0 và ghi rõ giới hạn này trong tài liệu gửi cơ quan.

- Chép `manifest.xml` về `%USERPROFILE%\SoatChinhTa\manifest.xml`.
- Dán một lệnh vào Command Prompt, không cần quyền quản trị. Cách này khớp mã `registerAddIn` trong gói `office-addin-dev-settings` 4.0.1 của Microsoft, với manifest XML cho Word:

```bat
reg add "HKCU\Software\Microsoft\Office\16.0\Wef\Developer" /v "<GUID-manifest>" /t REG_SZ /d "%USERPROFILE%\SoatChinhTa\manifest.xml" /f
```

- Gỡ: `reg delete "HKCU\Software\Microsoft\Office\16.0\Wef\Developer" /v "<GUID-manifest>" /f`
- Hướng dẫn phải điền sẵn GUID thật, người dùng chỉ sao chép và dán.
- Manifest nằm tại máy nhưng mã và từ điển tải từ Firebase Hosting, nên **máy vẫn phải có internet** khi dùng.

Hai đường dự phòng, chỉ làm khi chủ dự án yêu cầu:

| | W: công cụ web | M: Word add-in trên Microsoft Marketplace |
| --- | --- | --- |
| Người dùng làm gì | Mở trang web, kéo file `.docx` vào | Trong Word: Insert > Get Add-ins, tìm và bấm Add |
| Cài đặt | Không | Không có file nào phải chạy |
| Ai phải duyệt | Không ai | Microsoft duyệt đơn vị đăng ký và duyệt add-in |
| Sửa ngay trong Word | Không, sửa trên file rồi mở bằng Word | Có |
| Điều kiện | Firebase Hosting | Tổ chức có số đăng ký kinh doanh, giấy tờ xác minh, tài khoản công ty (Entra), tên miền email; ghi danh MAICPP |
| Rủi ro | File tải về có thể mở ở Protected View (thanh vàng, bấm Enable Editing); phải đo ở Bước 2A | Bị từ chối theo quy định 100.8 về tiện ích phạm vi hẹp; add-in công khai cho mọi người |

**Quy tắc chung:** không phát hành file `.ps1`, `.reg`, `.bat`, `.exe` cho người dùng tự chạy, vì file là thứ dễ gây cảnh báo Windows. Đường T dùng một lệnh dán tay, không phải file.

## 4. Các bước và cổng kiểm tra

Chỉ qua bước sau khi đạt cổng của bước trước. Không đạt thì dừng, báo cáo, không tự đổi đề bài.

**Bước 0. Dựng nền và đo đường đi**

- Dựng dự án, CI, Firebase Hosting với trang HTTPS tối thiểu.
- Làm add-in tối thiểu: một nút mở ngăn bên phải, đọc số đoạn văn.
- Tạo manifest bằng GUID mới; không dùng GUID trong file cũ.
- Chạy công cụ kiểm tra manifest của Microsoft: `npx office-addin-manifest validate manifest.xml`.
- **Cổng:** cài theo Đường T trên ít nhất 3 máy thật đã được phép. Trả lời bằng ảnh chụp: nút có hiện trên thanh Word không hay phải vào Insert > My Add-ins, có cảnh báo nào không, tắt mở lại Word và máy còn không, Word có mở được ngăn add-in và đọc tài liệu không. Ghi phiên bản Word.
- Nếu Đường T không đạt: dừng, báo chủ dự án, chưa làm các bước sau.
- Đầu ra: `docs/KET-QUA-THU-CAI-DAT.md`.

**Bước 1. Bộ kiểm (`src/engine/`)**

- Đầu vào: chuỗi một đoạn văn. Đầu ra: danh sách lỗi `{ luat, batDau, ketThuc, goc, goiY[], mucDo, lyDo }`.
- `mucDo` chỉ gồm 3 mức: `chac-chan`, `nen-xem`, `goi-y`. Mức được quy định theo luật, không tính phần trăm.
- Chuẩn hóa NFC khi so khớp nhưng phải **giữ bảng ánh xạ về vị trí gốc**, vì Word có thể chứa chữ tổ hợp (NFD).

| Mã | Luật | Mức | Ví dụ |
| --- | --- | --- | --- |
| R1 | Âm tiết không hợp lệ, gõ nhầm Telex/VNI | chắc chắn | `ddieefu`, `hoạtt` |
| R2 | Danh sách nhầm lẫn đã kiểm duyệt (cụm sai, cụm đúng) | chắc chắn | `xản xuất`, `xắp xếp`, `trân thành` |
| R3 | Nhầm cần xem ngữ cảnh, chỉ dùng danh sách cặp | nên xem | `dành/giành giải`, `chia sẽ/chia sẻ` |
| R4 | Dấu câu, khoảng trắng | chắc chắn | `công ty ,trách nhiệm .` |
| R5 | Lặp từ liền nhau | nên xem | `trong trong` |
| R6 | Viết hoa tên cơ quan theo Nghị định 30/2020, dùng danh sách | nên xem | `bộ tài chính` |
| R7 | Thống nhất kiểu bỏ dấu `hoà/hòa`, `thuỷ/thủy`, `kỹ/kĩ` | gợi ý, mặc định tắt | |

- R6 chỉ báo khi viết sai hoa/thường. `Bộ Tài chính` và `BỘ TÀI CHÍNH` (tiêu đề in hoa) **không** được báo lỗi. Ba trường hợp này phải là test.
- `chân thành cảm ơn` là đúng, không được báo lỗi.
- R1 cần so với tập âm tiết (cỡ vài nghìn). Từ điển từ là thứ khác. Không gộp hai khái niệm.
- Bỏ qua: URL, email, số, ngày tháng, chữ in hoa viết tắt (`MBA`, `TBA`, `CBCNV`), mã thiết bị (`110kV`, `MC 171`), từ tiếng Anh, tên riêng viết hoa giữa câu.
- Không dùng tìm chuỗi con: phải theo ranh giới âm tiết. `Nguyễn Văn Chia` không được dính luật của `chia`.

**Dữ liệu từ điển**

- Chỉ dùng nguồn có giấy phép rõ ràng. Ghi nguồn, giấy phép, ngày lấy vào `data/NGUON-DU-LIEU.md`.
- Không sao chép từ điển Hoàng Phê. Không tự bịa từ.
- Từ điển ngành điện để file riêng `data/nganh-dien.txt`, dễ sửa, không cần sửa mã.

**Cổng Bước 1:** `npm test` xanh và `npm run do-chinh-ta` in ra số đo trên bộ mẫu ở Mục 5.

**Bước 2A. Công cụ web (Đường W). Chỉ làm khi chủ dự án yêu cầu**

- Trang kéo-thả `.docx`. Đọc và xử lý hoàn toàn trong trình duyệt, không tải file lên đâu cả; test chứng minh 0 lệnh mạng chứa nội dung.
- Hiện danh sách lỗi cùng các mức ở Bước 1. Người dùng chọn lỗi cần sửa.
- Xuất file `.docx` **mới**, các sửa đổi ở dạng Track Changes (`w:ins`, `w:del`) để người dùng xem và chấp nhận trong Word. File gốc giữ nguyên.
- Chỉ sửa khi cụm lỗi nằm gọn trong một đoạn định dạng (run). Cụm nằm vắt qua nhiều định dạng thì chỉ liệt kê, không ghi.
- Không đụng tới bảng, ảnh, công thức, đầu trang, chân trang, ngoài phần chữ được sửa.
- Có dòng bản quyền và mục Hướng dẫn như Bước 3.
- **Cổng:** file xuất ra mở được trong Word không báo lỗi hỏng file, chấp nhận hết thì đúng nội dung mong đợi, từ chối hết thì trùng file gốc. Kiểm trên tài liệu 50 trang có bảng và hình.

**Bước 2. Nối với Word (`src/word/`)**

- Đọc theo đoạn văn trong thân tài liệu, kể cả ô bảng. Đầu trang, chân trang, chú thích: đọc nếu API hỗ trợ, nếu không thì ghi rõ trong giao diện là chưa quét.
- Nhận diện tài liệu font cũ (TCVN3/.VnTime, VNI): hiện một cảnh báo chung, bỏ qua đoạn đó, không báo hàng loạt lỗi.
- Phải kiểm tra văn bản đọc ra khi có Track Changes: chữ đã xoá không được tính là lỗi.
- **Sửa đúng chỗ:** từ lặp trong đoạn phải sửa đúng lần xuất hiện, không lấy kết quả đầu tiên. Trước khi sửa, đọc lại đoạn văn; nếu đã đổi thì quét lại đoạn đó và không ghi. Sau khi tìm thấy phải so `range.text` với chữ gốc.
- Tôn trọng Track Changes: nếu đang bật, sửa đổi phải hiện là sửa đổi được theo dõi.

**Cổng Bước 2:** kiểm tra thủ công trên Word thật theo `docs/KIEM-THU-WORD.md`, có ảnh chụp: chữ đậm/nghiêng trong từ, ô bảng, từ lặp, Track Changes, Undo, tài liệu 50 trang.

**Bước 3. Giao diện add-in**

- Thao tác chính: Quét toàn bộ, Quét vùng chọn. Danh sách lỗi theo nhóm; mỗi lỗi có Xem, Sửa, Bỏ qua, Thêm vào từ điển.
- Sửa hàng loạt chỉ áp dụng cho mức `chac-chan`, có hộp xác nhận nêu số lượng, sửa từ cuối văn bản lên đầu.
- Từ điển cá nhân lưu tại máy, có Xuất/Nhập file. Phải ghi rõ dữ liệu này có thể mất khi xoá dữ liệu trình duyệt của Office.
- Tiếng Việt toàn bộ. Có mục "Hướng dẫn/Giới thiệu".
- Chân trang và hộp Giới thiệu ghi đúng dòng: `(C) August87 - 0982722036`.
- `ProviderName` trong manifest: `August87`. Không dùng tên "VietSpell" vì trùng sản phẩm cũ; không dùng logo hay tên EVN nếu chưa được phép. Tên tạm: `Soát Chính Tả`.

**Bước 4. Đóng gói**

- `docs/GUI-PHONG-CNTT.md`, một trang, dùng làm văn bản xin phép: công cụ đọc gì, không gửi gì, địa chỉ mạng cần mở, quyền `ReadWriteDocument` để làm gì, chính xác thay đổi gì trên máy (một giá trị registry của người dùng và một file manifest), cách gỡ, và việc Microsoft không cam kết hỗ trợ đường cài này.
- `docs/HUONG-DAN-NGUOI-DUNG.md`: có ảnh chụp, người không biết IT làm theo được.
- Nếu đi Đường M, chuẩn bị hồ sơ gửi Microsoft: trang chính sách riêng tư, điều khoản, trang hỗ trợ công khai trên web riêng (Microsoft không nhận GitHub, mạng xã hội hay file trên OneDrive), ảnh chụp 1280x720, logo PNG 216–350 px, ghi chú cho người kiểm duyệt. Mô tả phải có câu tiếng Anh `This application is available in Vietnamese.` Đọc toàn văn quy định 1120 cho Office add-in trước khi nộp.
- Khi sửa manifest: tăng số phiên bản, giữ nguyên ID, nộp lại. Chỉ sửa mã trên web thì không phải nộp lại.

**Bước 5. Dùng thử**

- 5 đến 10 người dùng thật, 2 tuần, trên văn bản thật.
- Thu phiếu ghi tay: lỗi bắt đúng, báo nhầm, lỗi bị sót. Add-in không tự thu thập gì.
- Dùng phiếu để bổ sung từ điển, sau đó mới phát hành rộng.

## 5. Tiêu chí nghiệm thu

| Mục | Cách đo | Đạt |
| --- | --- | --- |
| Bắt đúng lỗi | Bộ 200 câu có lỗi gán nhãn, mọi luật đang bật | ≥ 90% |
| Báo nhầm | 20 văn bản thật đã sạch lỗi | < 1 lỗi báo nhầm / trang |
| Tốc độ | Tài liệu 20 trang trên máy văn phòng thật | ≤ 5 giây, giao diện không đơ |
| Riêng tư | Test CSP + theo dõi mạng khi quét | 0 lệnh mạng chứa văn bản |
| An toàn văn bản | Danh sách kiểm tra Bước 2 | Đạt toàn bộ |
| Dùng trên máy cơ quan | Máy chưa từng dùng, người không biết IT | Tự làm được theo hướng dẫn; không có file phải chạy; mọi cảnh báo gặp phải đều được chụp và báo cáo |
| Hỗ trợ phiên bản | Word bản hiện dùng ở cơ quan và Microsoft 365 | Chạy được, ghi rõ số phiên bản đã thử |

Các ngưỡng trên là đề xuất ban đầu, chủ dự án có quyền chỉnh.

**Bộ mẫu:** Gemini soạn nháp 200 câu; chủ dự án duyệt nhãn. 20 văn bản thật do chủ dự án cung cấp, đã xoá thông tin nội bộ, để trong thư mục đã liệt kê ở `.gitignore`. Không tự soạn văn bản rồi gọi là văn bản thật.

## 6. Quy tắc báo cáo

- Mỗi bước kết thúc bằng báo cáo: lệnh đã chạy, kết quả số, ảnh chụp, phần **chưa kiểm được**.
- Không được sửa, xoá, bỏ qua test hoặc hạ ngưỡng để cho xanh. Không đạt thì báo là không đạt.
- Không báo "xong" khi mới chạy `localhost`. Xong nghĩa là đã chạy trên Word thật qua web HTTPS thật.
- Giới hạn phải ghi cho người dùng biết: không có AI nên chỉ bắt lỗi ngữ cảnh có trong danh sách, không thay được người đọc lại.
- Không commit khoá, mật khẩu, tài liệu thật của cơ quan.
- Đổi tên file phải đúng hoa/thường: Windows không phân biệt nhưng CI Linux có.
- CI GitHub Actions chạy `npm test`, kiểm kiểu TypeScript, build và kiểm manifest.

## 7. Việc cần chủ dự án quyết định

1. Xin phép cơ quan cho cài theo Đường T, dùng `docs/GUI-PHONG-CNTT.md`.
2. Nếu sau này cần phát hành rộng hơn hoặc Đường T hỏng: đi Đường M (cần đơn vị đứng tên) hay Đường W.
