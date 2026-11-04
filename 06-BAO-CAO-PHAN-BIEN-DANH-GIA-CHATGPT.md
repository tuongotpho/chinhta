# [06] Báo cáo phản biện đánh giá của ChatGPT

04/11/2026 · Tiếp nối: [05-BAO-CAO-CACH-CAI-DAT-CHO-NHAN-VIEN-VAN-PHONG.md](05-BAO-CAO-CACH-CAI-DAT-CHO-NHAN-VIEN-VAN-PHONG.md) · Nguồn: [chatGPT-deep-research-report.md](chatGPT-deep-research-report.md), đối chiếu mã nguồn repo, kiểu dữ liệu `@types/office-js`, npm

## 1. Kết luận

**Không nên làm theo báo cáo đó.** Nó không xem mã nguồn của dự án, chỉ là tư vấn chung cho người sắp bắt đầu làm add-in. Phần lớn việc nó đề xuất repo đã có, phần còn lại trái đề bài "không AI, văn bản không rời máy".

Lọc ra được **1 việc đáng làm** (đã làm), **1 điểm đáng ghi nhận**, và **1 khoảng trống đo được** cần anh quyết định. Báo cáo cũng không trả lời câu hỏi đang vướng là cách cài cho nhân viên.

## 2. Vì sao không dùng làm căn cứ

- Báo cáo tự ghi không truy cập được mã nguồn và cho rằng kho mã chưa công khai. Đo lại: repo `tuongotpho/chinhta` đang **PUBLIC**.
- Biểu đồ so sánh hiệu năng được chính nó ghi là giả định, không có số đo.
- Lộ trình cộng lại khoảng 11–14 tuần là để làm từ đầu, trong khi sản phẩm đã có.

## 3. Đối chiếu từng đề xuất

| Đề xuất của báo cáo | Thực tế | Xử lý |
| :--- | :--- | :--- |
| Dùng Office.js, Word.run, task pane | Repo đã làm vậy | Không cần làm |
| Web Worker để khỏi đơ | Đã có | Không cần làm |
| Chuẩn hóa Unicode, tách âm tiết, xử lý từ ghép | Đã có `normalize`, bộ âm tiết, n-gram, tập cụm từ nhầm lẫn | Không cần làm |
| Sửa, Bỏ qua, Thêm từ điển, nút vùng chọn | Đã có | Không cần làm |
| Kiểm thử tự động, CI | 81 test đạt, CI Node 22 | Mẫu CI của báo cáo dùng Node 14 và `npm run lint` mà repo không có, không chép |
| Dùng Hunspell-vi | Theo chính báo cáo, nó chỉ xét từng tiếng. Bộ âm tiết và luật ngữ cảnh của repo đã làm phần này và hơn thế | Bác |
| `nodehun` để chạy offline trong add-in | Đo trên npm: gói này biên dịch thành mã gốc cho Node (`gypfile: true`), không chạy trong trang web của task pane | **Sai kỹ thuật**, bác |
| PhoBERT, VnCoreNLP, máy chủ Python | Trái đề bài không AI, không gửi văn bản ra ngoài. VnCoreNLP cần Java | Bác |
| Tô đỏ lỗi bằng `range.font.color` | Làm đổi định dạng tài liệu thật, lẫn với chữ đỏ của người soạn và sinh sửa đổi khi bật Track Changes. Repo không tô màu (0 chỗ) | Bác |
| `body.getText()`, `getSelection().getText()` | Tra `@types/office-js`: lớp Body và Range không có `getText`, phải đọc thuộc tính `text` | **Sai API**, bác |
| Quyền `DocumentReadWrite`, `Document.ReadWrite` | Tên đúng là `ReadWriteDocument`, repo đang dùng đúng | **Sai tên**, bác |
| Manifest "chuẩn YAML" | Manifest là XML | **Sai**, bác |
| Thêm `<Requirements>` vào manifest | Xem mục 4 | Làm theo cách khác |

## 4. Việc đã làm: Word đời cũ

Điểm gợi ý đúng: manifest không khai phiên bản Word tối thiểu. Kiểm tra mã cho thấy lỗ hổng thật, nhưng hẹp hơn gợi ý:

- Chỉ **quét vùng chọn** cần WordApi 1.3 (`compareLocationWith`). Quét toàn bộ và sửa lỗi theo mã hiện tại chỉ dùng lệnh cơ bản.
- Khai `<Requirements>` 1.3 sẽ làm tab biến mất trên Word cũ, không lời giải thích, mất luôn phần đang chạy được.

Vì vậy em **không sửa manifest**, mà thêm kiểm tra ở `src/word/wordService.ts`: Word cũ bấm quét vùng chọn sẽ nhận thông báo tiếng Việt, hướng dẫn bấm Quét toàn bộ. Có thêm 1 test, tổng 81/81 đạt, kiểm tra kiểu đạt. Chỉ thử bằng Word giả lập, chưa thử trên Word 2016 thật.

Nếu sau này lên Marketplace thì xem lại, vì lúc đó có thể cần khai đủ.

## 5. Điểm đáng ghi nhận

Báo cáo nhắc add-in COM chỉ chạy Windows, mỗi máy phải cài và cập nhật riêng. Ý này đúng và là phản biện thật với đề xuất ở báo cáo [05]. Nhưng nó được viết khi chưa biết lỗi sideload từ 24–25/09/2026, và nhân viên văn phòng ở đây dùng Word trên Windows. Đề xuất ở báo cáo [05] giữ nguyên, kèm cái giá đã ghi. Add-in web hiện tại vẫn giữ lại làm lõi, không bỏ.

## 6. Khoảng trống đo được: văn bản gõ thiếu dấu

Báo cáo có nhắc kiểm thử "thiếu dấu". Em đo trên bộ soát lỗi:

| Câu thử | Số lỗi báo |
| :--- | :--- |
| Cong ty da hoan thanh ke hoach san xuat trong thang 11. | 3 (Cong, hoach, xuat) |
| Ha noi la thu do cua nuoc Viet Nam. | 2 (cua, nuoc) |
| Toi di hoc o Ha Noi. | 1 (hoc) |
| Công ty da hoàn thành kế hoach sản xuất. | 1 (hoach, bỏ sót "da") |

Nguyên nhân: nhiều tiếng không dấu vẫn là tiếng hợp lệ (da, san, thanh), nên bị bỏ qua. Em **chưa sửa**, vì văn bản hành chính hiếm khi gõ không dấu cả đoạn, còn thêm luật bắt loại này dễ báo nhầm với tiếng Anh và tên riêng. Nên làm nếu anh em văn phòng thực sự gặp, kèm đo báo nhầm trên văn bản thật.

(C) August87 - 0982722036
