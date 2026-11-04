# [Bước 2] Hướng Dẫn & Danh Mục Kiểm Thử Word Thực Tế (src/word/)

Tài liệu phục vụ nghiệm thu các tình huống tương tác thực tế với Microsoft Word Document Object Model (DOM) theo yêu cầu Cổng Bước 2 của Đề bài 04/11/2026.

---

## 1. Danh Mục Các Tình Huống Kiểm Thử Bắt Buộc

| STT | Tình huống kiểm thử | Cách thức tiến hành | Kết quả kỳ vọng | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC1** | **Chữ đậm/nghiêng trong từ** | Văn bản có từ lỗi chứa định dạng con (ví dụ: *xản* **xuất** hoặc trân *thành*). | Range xác định đúng phạm vi từ; sửa xong định dạng chữ chung được giữ nguyên vẹn. | **ĐẠT** |
| **TC2** | **Nội dung trong ô bảng (Table Cells)** | Tạo bảng 3x3, đưa các từ sai vào các ô trong bảng. | `WordService.readDocument()` duyệt qua toàn bộ các paragraph trong table cells, bắt đúng lỗi. | **ĐẠT** |
| **TC3** | **Từ lặp xuất hiện nhiều lần trong đoạn** | Đoạn văn có 2 từ giống nhau (ví dụ: "trong trong báo cáo và trong cuộc họp"). | `selectError` và `replaceError` tìm đúng vị trí xuất hiện của từ thứ nhất (không chọn nhầm từ thứ hai). | **ĐẠT** |
| **TC4** | **Văn bản đang bật Track Changes** | Bật Track Changes (Review > Track Changes). Xoá một từ sai và sửa từ khác. | - Từ đã xoá không được báo lỗi ảo.<br>- Thao tác sửa của add-in được hiển thị là một tracked revision (đỏ/gạch chân). | **ĐẠT** |
| **TC5** | **Hoàn tác (Undo - Ctrl+Z)** | Bấm nút Sửa hoặc Sửa hàng loạt, sau đó bấm Ctrl+Z trên Word. | Thao tác hoàn tác Word khôi phục văn bản về trạng thái trước khi sửa mà không làm hỏng tài liệu. | **ĐẠT** |
| **TC6** | **Tài liệu dài (50 trang, có bảng và ảnh)** | Mở tài liệu thực tế dài 50 trang (~15.000 từ). Bấm "Quét toàn bộ". | Quét hoàn tất trong thời gian dưới 5 giây; giao diện Taskpane không bị đơ giật nhờ Web Worker. | **ĐẠT** |
| **TC7** | **Tài liệu sử dụng font cũ (TCVN3 / VNI)** | Mở văn bản gõ font `.VnTime` hoặc `VNI-Times`. | Hệ thống hiển thị cảnh báo phát hiện font cũ, bỏ qua các đoạn này, không báo lỗi chính tả hàng loạt. | **ĐẠT** |

---

## 2. Quy Trình Sửa Hàng Loạt An Toàn (Bottom-Up)

Để tránh hiện tượng trượt offset khi thay thế các chuỗi có độ dài khác nhau trong cùng một văn bản:
1. Danh sách lỗi mức **Chắc chắn** được sắp xếp giảm dần theo chỉ số đoạn văn (`paragraphIndex` từ lớn về bé).
2. Trong cùng một đoạn văn, các lỗi được thay thế từ cuối đoạn về đầu đoạn (`batDau` từ lớn về bé).
3. Trước mỗi lệnh ghi, `WordService` tải lại `range.text` để so sánh với `error.goc`. Nếu phát hiện văn bản đã bị sửa đổi thủ công bởi người dùng, add-in sẽ hủy lệnh ghi đó để tránh làm hỏng nội dung.
