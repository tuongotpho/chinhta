# [07] Báo cáo mở rộng dữ liệu từ điển và kết quả đo

05/11/2026 · Tiếp nối: [06-BAO-CAO-PHAN-BIEN-DANH-GIA-CHATGPT.md](06-BAO-CAO-PHAN-BIEN-DANH-GIA-CHATGPT.md) · Nguồn: bộ VSEC, 6 văn bản công việc thật, Wikimedia, Kaikki, Viet74K

## 1. Kết luận

Dữ liệu mới **giảm báo nhầm rõ rệt và bắt thêm các lỗi hay gặp trong văn bản hành chính**, nhưng **không tăng tỷ lệ bắt lỗi chung trên VSEC**. Muốn bắt nhiều hơn phải chấp nhận báo nhầm nhiều hơn. Em giữ ngưỡng cũ, ưu tiên ít báo nhầm.

## 2. Dữ liệu đã thay đổi

| Hạng mục | Trước | Sau |
| :--- | :--- | :--- |
| Bài viết thống kê | Một phần Wikipedia, Wikisource | Toàn bộ Wikipedia (577.313 bài, đã bỏ bài loài sinh vật do máy sinh), Wikisource, Wikibooks, Wiktionary |
| Âm tiết đã đếm | | 187,7 triệu |
| Từ điển mở | Không có | 99.816 mục (Wiktionary, Kaikki, Viet74K) |
| Cặp âm tiết trong bảng | Khoảng 1 triệu | 1,7 triệu |
| Tệp tải về | 6,4 MB | 10,5 MB |
| Cụm lỗi hay gặp | 50 | 173 |

## 3. Kết quả đo

Trên nửa chấm của VSEC, nửa này không dùng để chọn ngưỡng:

| Chỉ số | Trước | Sau |
| :--- | :--- | :--- |
| Toàn bộ lỗi | 60,0% | 59,7% |
| Từ sai cấu tạo | 85,9% | 86,0% |
| Chữ có nghĩa nhưng sai | 54,8% | 54,4% |
| Độ chính xác (mức sàn) | 91,9% | **93,2%** |
| Báo ngoài nhãn trên 1.000 âm tiết | 2,10 | **1,73** |
| Gợi ý số 1 đúng | 84,5% | 84,3% |

Trên 6 văn bản công việc thật, 12.785 từ, đo trước khi thêm 9 cụm cuối:

| Chỉ số | Trước | Sau |
| :--- | :--- | :--- |
| Tổng số mục báo | 123 | 110 |
| Luật ngữ cảnh R8 | 47 | 34 |
| Mục báo trên một trang 400 từ | 3,85 | 3,44 |

Phần lớn còn lại là dấu câu (R4, 44 mục). Chưa chấm từng mục nên không kết luận đây toàn là báo nhầm.

Phép thử 27 lỗi tự viết: trước 22/27, sau khi thêm cụm lỗi thì các chỗ sót đều được bắt. **Con số này không khách quan** vì danh sách được bổ sung sau khi thấy chỗ sót, nên không dùng làm bằng chứng. Tương tự, tệp Word mẫu 30 lỗi không còn là thước đo độc lập cho các cụm đã thêm.

## 4. Lựa chọn ngưỡng

| Ngưỡng R8 trên nửa dev | Bắt lỗi | Độ chính xác | Báo ngoài nhãn/1.000 |
| :--- | :--- | :--- | :--- |
| 7 | 66,0% | 90,8% | 2,67 |
| **8, đang dùng** | 60,0% | 93,6% | 1,63 |
| 9 | 53,7% | 94,4% | 1,28 |

Ngưỡng 7 bắt thêm 6% nhưng trên văn bản thật số báo R8 tăng từ 34 lên 52. Đề bài ưu tiên ít báo nhầm nên giữ 8. Đây là điểm có thể đổi nếu người dùng muốn bắt nhiều hơn.

## 5. Từ điển Hoàng Phê

Tệp epub là bản quét OCR của sách còn bản quyền. Không có dữ liệu nào của sách trong add-in hay repo. Chỉ dùng trên máy một lần để đếm mục từ, bản giải nén đã xóa. Bản OCR cũng kém: chỉ tách được khoảng 27 nghìn mục, 1.407 mục có âm tiết sai vì lỗi quét.

## 6. Giấy phép

Add-in chuyển sang GPL-3.0 trở lên vì dùng Viet74K (GPL) và dữ liệu CC BY-SA 4.0. Trang gốc Viet74K không ghi số phiên bản GPL, bản sao trên GitHub ghi GPL-2.0, nên cần pháp chế xác nhận trước khi dùng chính thức ở cơ quan.

## 7. Chưa kiểm được

- Chưa thử bảng mới trên Word thật.
- Tệp 10,5 MB tải nặng hơn 4 MB, chưa đo trên mạng cơ quan.
- Chưa có bộ văn bản hành chính có nhãn nên chưa biết tỷ lệ bắt lỗi thật trên đúng loại văn bản này.
- Bài thống kê vẫn chứa lỗi chính tả của Wikipedia, chỉ các cặp đã biết mới bị loại.

(C) August87 - 0982722036
