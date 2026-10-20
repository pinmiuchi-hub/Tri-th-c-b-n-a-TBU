# PHỤ LỤC

## Phụ lục A — Bảng trường dữ liệu của 7 nhóm tri thức — tài nguyên

**Bảng A.1. Cấu trúc trường dữ liệu (schema) từng nhóm đối tượng [30]**

| Nhóm dữ liệu | Số đối tượng | Các trường dữ liệu chính |
|---|---|---|
| rivers (sông suối) | 7 | id, ten, ten_dia_phuong, coords, trang_thai, nguon, mo_ta, ghi_chu |
| irrigation (thủy lợi truyền thống) | 6 | id, ten, ten_dia_phuong, loai, lat, lng, mo_ta, trang_thai, nguon, ghi_chu |
| villages (bản làng tiêu biểu) | 25 | id, ten, ten_xa, ten_huyen, ten_tinh, dan_toc, lat, lng, mo_ta, nguon, trang_thai, ghi_chu, anh, anh_ghichu, ma_xa |
| forests (rừng và khu bảo tồn) | 11 | id, ten, ten_dia_phuong, loai, dien_tich_ha, mo_ta, coords, trang_thai, nguon, nam_cong_bo |
| vac_models (mô hình VAC/VACR) | 8 | id, ten, loai, lat, lng, mo_ta, thanh_phan, trang_thai, nguon, ghi_chu |
| medicinal_plants (dược liệu) | 11 | id, ten, ten_dia_phuong, ten_khoa_hoc, cong_dung, tinh_trang, dan_toc_dung, mo_ta, coords, trang_thai, nguon |
| customary_zones (luật tục — vùng phong tục) | 5 | id, ten, loai, mo_ta, coords, trang_thai, nguon, ghi_chu, dia_ban_hien_tai, ma_xa |

**Ghi chú:**

- Tất cả nhóm đều có ba trường chung: trang_thai (co_nguon / mot_phan / du_doan / minh_hoa), nguon (liên kết đối chiếu) và mo_ta — là dữ liệu hiển thị trong khung truy thực nguồn (mục 2.3.2).
- Tổng số đối tượng: 73; tính đến ngày 16/10/2026, toàn bộ 73/73 ở trạng thái co_nguon [30].
- Hai nhóm villages và customary_zones hiển thị dạng văn bản theo từng xã (ghép trường ma_xa) trong bảng “Thông tin địa bàn”, không phải lớp bản đồ riêng.
- Kèm theo: 5 lớp raster chuyên đề (độ cao SRTM, khí hậu mô hình, mật độ dân số, v.v.) [24], dữ liệu cơ cấu dân tộc theo đơn vị hành chính [1], [5] và bộ hồ sơ 18 dân tộc.

## Phụ lục B — Danh mục nguồn tham khảo phân hạng

**Bảng B.1. Phân hạng nguồn theo khung A–B–C–D (mục 2.2.3)**

| Hạng | Tiêu chí | Các nguồn |
|---|---|---|
| A — Chính thống, đọc toàn văn | Văn bản nhà nước, số liệu thống kê chính thức, cơ sở dữ liệu quốc tế chính thức | [1], [2], [3], [4], [5], [6], [7], [9], [24] |
| B — Khoa học | Bài báo, công trình nghiên cứu; tài liệu kỹ thuật của thư viện phần mềm | [10], [11], [12], [17], [19], [26], [27], [28] |
| C — Báo chí chính thống / nguồn mở | Báo, cổng thông tin chính thống; dữ liệu mở dùng cho hình học; ảnh minh họa | [8], [13], [14], [15], [16], [18], [20], [21], [22], [23], [25] |
| D — Đối chiếu | Chỉ dùng khi không có nguồn cao hơn, hoặc chỉ để kiểm tra | Dùng nội bộ cho thông tin đối chiếu (không đưa vào danh mục) |

**Ghi chú:** Mỗi đối tượng dữ liệu trước khi đưa vào bản đồ phải qua quy trình đối chiếu tối thiểu hai nguồn độc lập hoặc một nguồn mức A/B. Nguồn [29] và [30] là dữ liệu gốc của đề tài (khảo sát thực địa và bộ dữ liệu không gian), được đối soát nội bộ và công bố kèm báo cáo.

## Phụ lục C — Kịch bản kiểm tra và kết quả

**Bảng C.1. Các nhóm kiểm tra và kết quả**

| STT | Nhóm kiểm tra | Nội dung | Kết quả |
|---|---|---|---|
| 1 | Khởi động hệ thống | Truy cập ứng dụng WebGIS trên trình duyệt tại môi trường phát triển | Đạt — HTTP 200 |
| 2 | Kiểm tra dữ liệu | Đọc layers.json: đủ 7 nhóm, 73 đối tượng, 73/73 ở trạng thái có nguồn | Đạt — 7 nhóm / 73 đối tượng / 100% co_nguon |
| 3 | Kiểm tra mã nguồn | Chạy kiểm tra kiểu (typecheck) toàn dự án | Đạt — không lỗi kiểu |
| 4 | Kiểm thử tự động giao diện | Các luồng chú giải theo khung nhìn/vùng chọn, composer xuất bản đồ, kiểm tra hiển thị biểu đồ và marker — thực hiện bằng Playwright trong quá trình phát triển | Đạt — toàn bộ kịch bản PASS (ghi nhận 11/11 và 12/12) |
| 5 | Đối soát nguồn dữ liệu | Rà soát định kỳ trường nguon và trang_thai của từng đối tượng (vòng cập nhật 16/10/2026) | Đạt — 73/73 co_nguon; 11 đối tượng không tra được nguồn đã bị loại bỏ |
| 6 | Kiểm tra hiển thị | Chụp màn hình giao diện chính (Hình 3.4) | Đạt — giao diện hiển thị đủ công cụ tìm kiếm, lớp bản đồ, chế độ 3D, biên tập |

**Ghi chú:** kết quả kiểm tra mục 1–3 và 5 được thực hiện lại tại thời điểm lập báo cáo; mục 4 ghi nhận từ nhật ký kiểm thử trong quá trình phát triển hệ thống.

## Phụ lục D — Hướng dẫn tra cứu và xuất bản đồ trên hệ thống WebGIS

**Bảng D.1. Các bước sử dụng chính**

| Bước | Thao tác | Kết quả |
|---|---|---|
| 1 | Mở trình duyệt, truy cập địa chỉ hệ thống | Hiển thị bản đồ tỉnh Sơn La với ranh giới đơn vị hành chính |
| 2 | Dùng thanh tìm kiếm, gõ tên xã/tỉnh | Bản đồ bay tới đơn vị hành chính tương ứng; bật vùng chọn |
| 3 | Bấm vào vùng trên bản đồ (hoặc chọn từ danh sách) | Mở bảng “Thông tin địa bàn”: dân tộc, tài nguyên, dữ liệu bản làng/luật tục theo mã hành chính |
| 4 | Mở khung “Lớp bản đồ”, bật/tắt các lớp theo chủ đề | Chỉ hiển thị lớp được chọn; chú giải tự cập nhật theo khung nhìn và vùng chọn |
| 5 | Chuyển chế độ xem 3D | Quan sát địa hình theo chiều cao |
| 6 | Bấm vào đối tượng trên bản đồ | Hiển thị mô tả, trạng thái nguồn và liên kết đối chiếu |
| 7 | Chọn chức năng xuất bản đồ (A4/A3, dọc/ngang) | Tải bản đồ giấy kèm khung, chú giải, tỷ lệ, nguồn dữ liệu theo QCVN 80 [6] |
| 8 | (Nhóm biên tập) đăng nhập chức năng nhập liệu | Thêm/sửa đối tượng; đối tượng hiển thị công khai sau khi có nguồn và được phê duyệt |

**Ghi chú vận hành:** mô hình quản lý nội dung theo đề xuất khảo sát — trưởng bản/người có uy tín quyết định nội dung (73,8% người dân đề nghị [29]), nhóm kỹ thuật xử lý phần mềm, nhà nước bảo trợ dữ liệu tham chiếu.

## Phụ lục E — Bộ phiếu khảo sát thực địa và quy tắc xử lý

**Bảng E.1. Cấu trúc bộ phiếu hỏi [29]**

| Phần | Nội dung | Dạng câu hỏi |
|---|---|---|
| Phần I. Thông tin chung | Mã phiếu, ngày phỏng vấn, người phỏng vấn; họ tên, giới tính, năm sinh, dân tộc, địa chỉ, số năm sinh sống, điện thoại, học vấn, hoạt động thu nhập chính | Điền tự do, danh mục chọn |
| Phần II.1. Đất | Tham gia quản lý đất; ngưng sử dụng đất và nguyên nhân; cách áp dụng quản lý — bảo tồn đất; nguồn biện pháp; biện pháp hiệu quả nhất | Chọn 1, chọn nhiều, số, thang 5 mức |
| Phần II.2. Nước | Công trình sử dụng; quy định và luật tục về nước; tri thức quản lý nước cộng đồng; nguy cơ mai mốt | Chọn 1, chọn nhiều, thang 5 mức |
| Phần II.3. Rừng | Cách phân loại rừng; hương ước/quy ước; tình trạng giao khoán trùng rừng truyền thống; biện pháp bảo vệ rừng | Chọn 1, chọn nhiều, thang 5 mức |
| Phần III. Nhu cầu bản đồ | Mức cần số hóa từng nhóm tài nguyên; hình thức bản đồ mong muốn; người quản lý bản đồ; nội dung ưu tiên hiển thị; sẵn sàng sử dụng | Thang 5 mức, chọn 1, chọn nhiều |

**Bảng E.2. Quy tắc nhập liệu và xử lý (tóm tắt từ hướng dẫn của bộ phiếu)**

| Quy tắc | Nội dung |
|---|---|
| Mẫu | 65 phiếu hợp lệ tại huyện Phù Yên (cũ); mỗi phiếu = 1 dòng; bảng tính chuẩn bị 500 dòng |
| Câu chọn 1 | Chọn từ danh mục thả xuống; chọn “Khác” thì ghi rõ vào cột “Khác (ghi rõ)” |
| Câu chọn nhiều | Mỗi đáp án một cột riêng; tích = điền số 1, không tích = để trống |
| Câu số / năm | Ghi trực tiếp (năm sinh 4 chữ số, ngày phỏng vấn dd/mm/yyyy, điện thoại giữ số 0 đầu) |
| Câu bỏ trống | Không trả lời thì để trống toàn bộ câu đó |
| Thống kê | Sheet “Thống kê” tự đếm tần suất, tỷ lệ % và điểm trung bình thang 5 mức; % câu chọn 1 tính trên số phiếu trả lời câu đó, % câu chọn nhiều tính trên tổng số phiếu |
| Danh mục | Sheet “Danh mục” chứa các danh sách trả lời cho ô thả xuống; sửa danh mục phải cập nhật kèm sheet Thống kê |

Kèm theo: 4 bảng tính của bộ phiếu (Hướng dẫn, Nhập liệu, Thống kê, Danh mục) [29] — số liệu tổng hợp được trích dẫn trong Chương 3.

Để bảo đảm tính tái lập của số liệu, toàn bộ câu hỏi trong bộ phiếu được gán mã cố định, tạo thành chuỗi đối soát từ phiếu gốc đến bảng tính nhập liệu và đến từng kết quả thống kê được trình bày trong Chương 2 và Chương 3. Bảng E.3 trình bày danh mục đầy đủ của bộ phiếu theo bốn phần nội dung, kèm thang đo tương ứng và cách xử lý số liệu của từng câu.

**Bảng E.3. Danh mục câu hỏi theo nhóm, thang đo và cách xử lý số liệu**

| Mã câu | Nội dung câu hỏi | Thang đo | Cách xử lý |
|---|---|---|---|
| I.1 | Họ và tên người trả lời | Điền tự do | Chỉ dùng để đối chiếu phiếu, không tham gia thống kê |
| I.2 | Giới tính của người trả lời | Danh mục chọn một (Nam, Nữ, Khác) | Tần suất và tỷ lệ trên 65 phiếu hợp lệ |
| I.3 | Năm sinh | Điền số, bốn chữ số | Đối chiếu chéo với số năm sinh sống tại địa phương |
| I.4 | Dân tộc | Danh mục chọn một (Thái, Mông, Mường, Khác) | Tần suất, tỷ lệ; dùng làm biến chéo trong kiểm định |
| I.5 | Địa chỉ thường trú | Điền tự do | Gán mã hành chính của đơn vị cư trú để tra cứu thông tin địa bàn |
| I.6 | Số năm sinh sống tại địa phương | Danh mục chọn một, ba mức | Tần suất, tỷ lệ hợp lệ; làm điều kiện chọn mẫu người trả lời có tri thức bản địa |
| I.7 | Số điện thoại liên hệ | Điền số | Giữ số 0 ở đầu; chỉ dùng để liên hệ bổ sung, không công bố |
| I.8 | Trình độ học vấn | Danh mục chọn một, năm mức | Tần suất và tỷ lệ hợp lệ |
| I.9 | Hoạt động tạo ra thu nhập chính | Danh mục chọn một, tám phương án | Tần suất, tỷ lệ hợp lệ; nhóm có tần suất nhỏ được gộp khi trình bày |
| Đ.1.1 | Tham gia quản lý, sử dụng đất canh tác của gia đình | Danh mục chọn một, ba phương án | Tần suất, tỷ lệ hợp lệ; số phiếu thiếu được tách riêng |
| Đ.1.2 | Hoạt động cụ thể đã từng tham gia canh tác | Điền tự do | Dùng làm căn cứ nội dung cho câu Đ.1.1, không thống kê |
| Đ.1.3 | Số năm đã ngừng sử dụng đất canh tác | Điền số | Ghi nhận giá trị cụ thể của từng phiếu đã ngừng sử dụng đất |
| Đ.1.4 | Lý do chính khiến ngừng sử dụng đất canh tác | Danh mục chọn một, bốn phương án | Tần suất, tỷ lệ hợp lệ; chỉ tính người trả lời đã từng tham gia |
| Đ.2 | Các biện pháp thực hành quản lý và bảo tồn đất canh tác | Chọn nhiều, mười phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| Đ.3 | Nguồn gốc của biện pháp quản lý, cải tạo đất | Chọn nhiều, sáu phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| Đ.4 | Biện pháp mang lại hiệu quả quản lý, bảo tồn đất tốt nhất | Chọn nhiều, mười phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| Đ.5 | Nguyên nhân mai một tri thức bản địa về đất | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| Đ.6 | Mức độ cần thiết của việc ghi chép, số hóa bản đồ hướng dẫn về đất | Thang năm mức, từ hoàn toàn không cần thiết đến rất cần thiết | Tần suất, tỷ lệ hợp lệ; tổng nhóm cần thiết và rất cần thiết dùng làm chỉ số nhu cầu |
| N.1 | Loại nguồn nước gia đình đang sử dụng trong sinh hoạt và sản xuất | Chọn nhiều, bảy phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.2.1 | Cách khai thác và sử dụng nguồn nước hiện nay | Chọn nhiều, ba phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống | Thang năm mức, từ rất hiếm khi đến rất thường xuyên | Tần suất, tỷ lệ hợp lệ; dùng làm chỉ số mức vận hành của hệ thống truyền thống |
| N.2.3 | Biện pháp bảo vệ, vệ sinh và phục hồi thủy lợi truyền thống | Chọn nhiều, bảy phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.3 | Hình thức quy định điều chỉnh việc quản lý, bảo vệ nguồn nước | Chọn nhiều, ba phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.4 | Biện pháp cộng đồng trong phân chia, sử dụng và bảo vệ nguồn nước | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.5 | Tần suất thực hiện biện pháp bảo vệ sau khi phân chia, sử dụng nước | Thang năm mức, từ không bao giờ đến luôn luôn | Tần suất, tỷ lệ hợp lệ; dùng làm chỉ số duy trì thực hành cộng đồng |
| N.6 | Nguyên nhân mai một tri thức bản địa về nước | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| N.7 | Mức độ cần thiết của việc ghi chép, số hóa bản đồ hướng dẫn về nước | Thang năm mức | Tần suất, tỷ lệ hợp lệ; tổng nhóm cần thiết và rất cần thiết dùng làm chỉ số nhu cầu |
| R.1 | Duy trì song song cách phân loại rừng theo phong tục | Hai phương án: có hoặc không | Tần suất và tỷ lệ trên toàn bộ phiếu |
| R.2 | Cách phân loại rừng theo phong tục đã được ghi vào hương ước, quy ước | Hai phương án: có hoặc không | Tần suất và tỷ lệ trên toàn bộ phiếu |
| R.3 | Rừng Nhà nước giao hoặc khoán trùng với rừng thiêng, rừng ma, rừng cấm của bản | Hai phương án: có hoặc không | Tần suất và tỷ lệ trên toàn bộ phiếu; dùng làm chỉ số chồng lấn cần gỡ |
| R.4.1 | Thường vào rừng khác để thu hái, tận dụng sản phẩm từ rừng | Hai phương án: có hoặc không | Tần suất và tỷ lệ trên toàn bộ phiếu |
| R.4.2 | Loại sản phẩm thường thu hái từ rừng | Điền tự do | Dùng làm căn cứ nội dung cho câu R.4.1, không thống kê |
| R.5.1 | Áp dụng biện pháp giúp cây rừng tự phục hồi sau khi thu hái | Hai phương án: có hoặc không | Tần suất, tỷ lệ hợp lệ; số phiếu thiếu được tách riêng |
| R.5.2 | Mô tả ngắn gọn cách làm giúp cây rừng tự phục hồi | Điền tự do | Tổng hợp theo nội dung; trích dẫn tiêu biểu khi phân tích |
| R.6 | Nguyên nhân mai một tri thức bản địa về rừng | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| R.7 | Mức độ cần thiết của việc ghi chép, số hóa bản đồ hướng dẫn về rừng | Thang năm mức | Tần suất, tỷ lệ hợp lệ; tổng nhóm cần thiết và rất cần thiết dùng làm chỉ số nhu cầu |
| B.1 | Đã từng biết đến hoặc sử dụng loại bản đồ | Chọn nhiều, năm phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| B.2 | Loại tài nguyên và thông tin cần thể hiện trên bản đồ | Chọn nhiều, tám phương án | Mỗi phương án một cột riêng; tỷ lệ dùng để xếp hạng nội dung ưu tiên hiển thị |
| B.3 | Hình thức bản đồ mong muốn sử dụng | Danh mục chọn một, bốn phương án | Tần suất, tỷ lệ hợp lệ; làm căn cứ thiết kế chức năng xuất bản đồ |
| B.4 | Người nên là người quản lý bản đồ | Chọn nhiều, bốn phương án | Mỗi phương án một cột riêng; tỷ lệ tính trên tổng số phiếu |
| B.5 | Mức độ sẵn sàng sử dụng bản đồ nếu được cung cấp | Danh mục chọn một, ba mức | Tần suất, tỷ lệ hợp lệ; tổng hai nhóm sẵn sàng dùng làm chỉ số chấp nhận |
| B.6 | Góp ý thêm về việc lập bản đồ tri thức bản địa | Điền tự do | Tổng hợp nội dung góp ý theo chủ đề |

Trong quá trình nhập liệu, mỗi phiếu được đối chiếu với quy tắc xử lý nêu ở Bảng E.2; các tình huống phát sinh thêm được xử lý theo nguyên tắc chung ghi ở Bảng E.4. Mục đích của bộ quy tắc này là bảo đảm mọi con số trình bày trong báo cáo đều tra ngược được đến từng dòng dữ liệu gốc.

**Bảng E.4. Quy tắc xác định câu trả lời hợp lệ và xử lý dữ liệu bất thường**

| Tình huống phát hiện | Quy tắc xử lý | Ảnh hưởng tới thống kê |
|---|---|---|
| Phiếu có đủ mã phiếu, ngày phỏng vấn và đã điền xong phần thông tin chung | Coi là phiếu hợp lệ, nhập vào bảng tính | Nằm trong mẫu 65 phiếu phân tích |
| Phiếu trùng mã phiếu hoặc trùng người trả lời, người phỏng vấn, ngày phỏng vấn | Giữ phiếu ghi trước, loại các phiếu trùng | Không tham gia phân tích |
| Phiếu bỏ trống quá nửa số câu điều tra chính | Loại khỏi bộ dữ liệu thống kê | Không tham gia phân tích |
| Câu chọn một mà người trả lời đánh dấu nhiều hơn một phương án | Ghi nhận phương án được đánh dấu rõ ràng nhất theo hướng dẫn của bộ phiếu | Làm giảm số phiếu hợp lệ của câu đó |
| Câu chọn một, chọn phương án khác nhưng không ghi nội dung | Đếm vào nhóm khác và ghi chú thiếu nội dung | Vẫn tính trong số phiếu hợp lệ |
| Câu chọn một để trống hoàn toàn | Ghi nhận là câu thiếu | Loại khỏi mẫu số khi tính tỷ lệ; tỷ lệ tính trên số phiếu đã trả lời câu đó |
| Câu chọn nhiều mà không đánh dấu phương án nào và cũng không ghi phương án khác | Ghi nhận là câu thiếu | Loại khỏi mẫu số khi tính tỷ lệ trên số phiếu trả lời |
| Câu điền số có giá trị bất hợp lý so với lứa tuổi hoặc địa bàn | Rà soát lại phiếu gốc; nếu không xác minh được thì để trống | Không tham gia tính thống kê mô tả |
| Câu thang năm mức mà người trả lời chọn hai mức liền kề | Giữ mức được đánh dấu rõ ràng hơn; trường hợp không xác định được thì để trống | Làm giảm số phiếu hợp lệ của câu đó |
| Phiếu có nội dung trả lời không nhất quán giữa câu tổng và câu chi tiết | Giữ phần trả lời không mâu thuẫn, loại phần mâu thuẫn khỏi phân tích tương ứng | Ghi chú vào phiếu đối soát |
| Phiếu có phần góp ý ở câu cuối | Giữ nguyên nội dung, tổng hợp theo chủ đề khi phân tích | Phần góp ý không tham gia tính tỷ lệ |

## Phụ lục F — Bảng tổng hợp chỉ số khảo sát chính

Phụ lục này tổng hợp các chỉ số chính của bộ khảo sát thực địa 65 phiếu tại huyện Phù Yên (cũ) [29], đối chiếu trực tiếp với kết quả tính toán bằng phần mềm thống kê PSPP. Toàn bộ số liệu dưới đây đều được lấy nguyên trạng từ kết quả đầu ra thống kê, không suy diễn thêm; các tỷ lệ được tính trên mẫu số hợp lệ của từng câu hỏi và được ghi rõ trong nội dung bảng.

**Bảng F.1. Đặc điểm nhân khẩu của người trả lời (n = 65)**

| Biến | Nhóm trả lời | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|
| Giới tính | Nam | 39 | 60,0 |
| Giới tính | Nữ | 26 | 40,0 |
| Dân tộc | Thái | 28 | 43,1 |
| Dân tộc | Mường | 28 | 43,1 |
| Dân tộc | Mông | 9 | 13,8 |
| Số năm sinh sống tại địa phương | Dưới 5 năm | 3 | 4,8 |
| Số năm sinh sống tại địa phương | Từ 5 đến 15 năm | 15 | 23,8 |
| Số năm sinh sống tại địa phương | Trên 15 năm | 45 | 71,4 |
| Trình độ học vấn | Chưa qua đào tạo | 4 | 6,2 |
| Trình độ học vấn | Tiểu học | 5 | 7,7 |
| Trình độ học vấn | Trung học cơ sở | 30 | 46,2 |
| Trình độ học vấn | Trung học phổ thông | 23 | 35,4 |
| Trình độ học vấn | Trung cấp, cao đẳng, đại học trở lên | 3 | 4,6 |
| Hoạt động tạo thu nhập chính | Nông nghiệp | 21 | 32,3 |
| Hoạt động tạo thu nhập chính | Chăn nuôi | 2 | 3,1 |
| Hoạt động tạo thu nhập chính | Lâm nghiệp | 3 | 4,6 |
| Hoạt động tạo thu nhập chính | Tiểu thủ công nghiệp | 1 | 1,5 |
| Hoạt động tạo thu nhập chính | Dịch vụ | 1 | 1,5 |
| Hoạt động tạo thu nhập chính | Công nhân, viên chức Nhà nước | 29 | 44,6 |
| Hoạt động tạo thu nhập chính | Khác | 8 | 12,3 |

**Ghi chú:** biến số năm sinh sống có hai phiếu để trống nên tỷ lệ được tính trên 63 phiếu trả lời; bốn biến còn lại đủ 65 phiếu. Toàn bộ người trả lời thuộc ba dân tộc Mường, Thái và Mông, bảo đảm điều kiện người trả lời có tri thức bản địa thực sự.

**Bảng F.2. Kết quả các câu hỏi nhóm đất (n = 65)**

| Mã câu | Nội dung và mẫu số | Nhóm đáp án | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|---|
| Đ.1.1 | Tham gia quản lý, sử dụng đất canh tác (n = 63) | Đang tham gia thường xuyên | 26 | 41,3 |
| Đ.1.1 | Tham gia quản lý, sử dụng đất canh tác (n = 63) | Đã từng tham gia nhưng hiện đã ngừng | 37 | 58,7 |
| Đ.1.4 | Lý do ngừng sử dụng đất canh tác (n = 37) | Thiếu nhân lực | 26 | 70,3 |
| Đ.1.4 | Lý do ngừng sử dụng đất canh tác (n = 37) | Chuyển đổi mục đích theo quy hoạch | 6 | 16,2 |
| Đ.1.4 | Lý do ngừng sử dụng đất canh tác (n = 37) | Đất bị bạc màu, xói mòn nặng | 4 | 10,8 |
| Đ.1.4 | Lý do ngừng sử dụng đất canh tác (n = 37) | Khác | 1 | 2,7 |
| Đ.6 | Mức độ cần số hóa bản đồ hướng dẫn về đất (n = 64) | Bình thường | 4 | 6,3 |
| Đ.6 | Mức độ cần số hóa bản đồ hướng dẫn về đất (n = 64) | Cần thiết | 58 | 90,6 |
| Đ.6 | Mức độ cần số hóa bản đồ hướng dẫn về đất (n = 64) | Rất cần thiết | 2 | 3,1 |

**Ghi chú:** câu Đ.1.1 có hai phiếu thiếu, câu Đ.1.4 chỉ được hỏi đối với người trả lời đã từng tham gia và hiện đã ngừng, câu Đ.6 có một phiếu thiếu. Nhóm đáp án hoàn toàn không cần thiết và không cần thiết của câu Đ.6 không có phiếu chọn. Tổng nhóm cần thiết và rất cần thiết đạt 93,7% — chỉ số nhu cầu số hóa cao nhất trong ba nhóm tài nguyên.

**Bảng F.3. Kết quả các câu hỏi nhóm nước (n = 65)**

| Mã câu | Nội dung và mẫu số | Nhóm đáp án | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|---|
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Rất hiếm khi | 6 | 9,5 |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Ít khi | 2 | 3,2 |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Thỉnh thoảng | 45 | 71,4 |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Thường xuyên | 8 | 12,7 |
| N.2.2 | Mức độ thường xuyên sử dụng thủy lợi truyền thống (n = 63) | Rất thường xuyên | 2 | 3,2 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Không bao giờ thực hiện | 8 | 12,3 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Hiếm khi | 6 | 9,2 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Thỉnh thoảng | 27 | 41,5 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Thường xuyên | 22 | 33,8 |
| N.5 | Tần suất thực hiện biện pháp bảo vệ nguồn nước (n = 65) | Luôn luôn thực hiện | 2 | 3,1 |
| N.7 | Mức độ cần số hóa bản đồ hướng dẫn về nước (n = 65) | Hoàn toàn không cần thiết | 3 | 4,6 |
| N.7 | Mức độ cần số hóa bản đồ hướng dẫn về nước (n = 65) | Bình thường | 26 | 40,0 |
| N.7 | Mức độ cần số hóa bản đồ hướng dẫn về nước (n = 65) | Cần thiết | 27 | 41,5 |
| N.7 | Mức độ cần số hóa bản đồ hướng dẫn về nước (n = 65) | Rất cần thiết | 9 | 13,8 |

**Ghi chú:** câu N.2.2 có hai phiếu thiếu; nhóm đáp án không cần thiết của câu N.7 không có phiếu chọn. Tổng nhóm cần thiết và rất cần thiết của câu N.7 đạt 55,3% — thấp hơn hẳn nhóm đất và nhóm rừng, chủ yếu do tới 40,0% người trả lời chọn mức bình thường.

**Bảng F.4. Kết quả các câu hỏi nhóm rừng (n = 65)**

| Mã câu | Nội dung và mẫu số | Nhóm đáp án | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|---|
| R.1 | Duy trì song song cách phân loại rừng theo phong tục (n = 65) | Có | 60 | 92,3 |
| R.1 | Duy trì song song cách phân loại rừng theo phong tục (n = 65) | Không | 5 | 7,7 |
| R.2 | Cách phân loại theo phong tục đã ghi vào hương ước, quy ước (n = 65) | Có | 54 | 83,1 |
| R.2 | Cách phân loại theo phong tục đã ghi vào hương ước, quy ước (n = 65) | Không | 11 | 16,9 |
| R.3 | Rừng Nhà nước giao, khoán trùng rừng thiêng, rừng ma, rừng cấm (n = 65) | Có | 42 | 64,6 |
| R.3 | Rừng Nhà nước giao, khoán trùng rừng thiêng, rừng ma, rừng cấm (n = 65) | Không | 23 | 35,4 |
| R.4.1 | Thường vào rừng khác thu hái, tận dụng sản phẩm (n = 65) | Có | 58 | 89,2 |
| R.4.1 | Thường vào rừng khác thu hái, tận dụng sản phẩm (n = 65) | Không | 7 | 10,8 |
| R.5.1 | Áp dụng biện pháp giúp cây rừng tự phục hồi (n = 62) | Có | 60 | 96,8 |
| R.5.1 | Áp dụng biện pháp giúp cây rừng tự phục hồi (n = 62) | Không | 2 | 3,2 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Hoàn toàn không cần thiết | 4 | 6,2 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Không cần thiết | 2 | 3,1 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Bình thường | 7 | 10,8 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Cần thiết | 43 | 66,2 |
| R.7 | Mức độ cần số hóa bản đồ hướng dẫn về rừng (n = 65) | Rất cần thiết | 9 | 13,8 |

**Ghi chú:** câu R.5.1 có ba phiếu thiếu nên tỷ lệ được tính trên 62 phiếu; các câu còn lại đủ 65 phiếu. Tổng nhóm cần thiết và rất cần thiết của câu R.7 đạt 80,0%. Tỷ lệ 64,6% ở câu R.3 là bằng chứng định lượng về hiện tượng chồng lấn giữa rừng do Nhà nước giao, khoán với rừng theo phong tục của bản.

**Bảng F.5. Kết quả nhóm câu hỏi về nhu cầu bản đồ (n = 65)**

| Mã câu | Nội dung và mẫu số | Nhóm đáp án | Tần suất (người) | Tỷ lệ hợp lệ (%) |
|---|---|---|---|---|
| B.3 | Hình thức bản đồ mong muốn sử dụng (n = 61) | Bản đồ giấy treo tại nhà văn hóa bản | 7 | 11,5 |
| B.3 | Hình thức bản đồ mong muốn sử dụng (n = 61) | Ứng dụng, website tra cứu trên điện thoại | 6 | 9,8 |
| B.3 | Hình thức bản đồ mong muốn sử dụng (n = 61) | Cả hai hình thức trên | 46 | 75,4 |
| B.3 | Hình thức bản đồ mong muốn sử dụng (n = 61) | Không có nhu cầu sử dụng | 2 | 3,3 |
| B.5 | Mức độ sẵn sàng sử dụng bản đồ (n = 62) | Sẵn sàng sử dụng thường xuyên | 14 | 22,6 |
| B.5 | Mức độ sẵn sàng sử dụng bản đồ (n = 62) | Sử dụng khi cần thiết | 47 | 75,8 |
| B.5 | Mức độ sẵn sàng sử dụng bản đồ (n = 62) | Không có nhu cầu sử dụng | 1 | 1,6 |

**Ghi chú:** câu B.3 có bốn phiếu thiếu, câu B.5 có ba phiếu thiếu. Tổng nhóm sẵn sàng sử dụng bản đồ đạt 98,4%; tỷ lệ chọn cả hai hình thức đạt 75,4% là cơ sở trực tiếp cho việc hệ thống phải đồng thời hỗ trợ bản đồ số và bản đồ giấy.

**Bảng F.6. Kết quả kiểm định mối liên hệ giữa biến dân tộc và một số biến kết quả**

| Biến chéo | Chi bình phương Pearson | Bậc tự do | Sig. (hai phía) | Số phiếu hợp lệ | Nhận xét |
|---|---|---|---|---|---|
| Dân tộc và hình thức bản đồ mong muốn | 37,51 | 6 | 0,000 | 61 | Có ý nghĩa thống kê; Cramer's V bằng 0,55, hệ số Phi bằng 0,78 |
| Giới tính và dân tộc | 2,57 | 2 | 0,277 | 65 | Không có mối liên hệ thống kê |
| Dân tộc và rừng giao, khoán trùng rừng thiêng | 3,00 | 2 | 0,223 | 65 | Không có mối liên hệ thống kê |

**Ghi chú:** chỉ biến chéo giữa dân tộc và hình thức bản đồ mong muốn đạt ý nghĩa thống kê ở mức cao, cho thấy nhu cầu về hình thức bản đồ khác nhau giữa các dân tộc. Các kết quả kiểm định còn lại cho thấy sự phân bố câu trả lời tương đối đồng đều giữa các nhóm dân tộc được khảo sát.

**Bảng F.7. Phân bố hình thức bản đồ mong muốn theo dân tộc (n = 61)**

| Dân tộc | Bản đồ giấy treo tại nhà văn hóa bản | Ứng dụng, website trên điện thoại | Cả hai hình thức | Không có nhu cầu | Tổng phiếu |
|---|---|---|---|---|---|
| Thái | 0 (0,0%) | 2 (7,4%) | 23 (85,2%) | 2 (7,4%) | 27 |
| Mông | 5 (83,3%) | 0 (0,0%) | 1 (16,7%) | 0 (0,0%) | 6 |
| Mường | 2 (7,1%) | 4 (14,3%) | 22 (78,6%) | 0 (0,0%) | 28 |
| Tổng | 7 (11,5%) | 6 (9,8%) | 46 (75,4%) | 2 (3,3%) | 61 |

**Ghi chú:** bốn phiếu thiếu của câu B.3 được phân bổ gồm một phiếu người Thái và ba phiếu người Mông. Các con số trong ngoặc là tỷ lệ phần trăm theo hàng. Khác biệt giữa ba nhóm dân tộc giải thích cho kết quả kiểm định nêu ở Bảng F.6 và hàm ý thiết kế: hệ thống phải duy trì đồng thời cả bản đồ giấy và bản đồ số thay vì chọn một trong hai hình thức.

## Phụ lục G — Thông số kỹ thuật và hướng dẫn xuất dữ liệu

Phụ lục này bổ sung các thông số kỹ thuật cần thiết để người vận hành có thể tái lập, kiểm tra và mở rộng hệ thống mà không phải tra lại toàn bộ chương trình chính. Nội dung được tổng hợp từ kết quả xây dựng và kiểm chứng hệ thống nêu ở Chương 2 và Chương 3, kèm quy cách xuất bản đồ theo chuẩn trình bày hiện hành.

**Bảng G.1. Thông số kỹ thuật chính của hệ thống WebGIS**

| Hạng mục | Thông số | Ghi chú vận hành |
|---|---|---|
| Kiến trúc hệ thống | Ứng dụng web chạy hoàn toàn trên trình duyệt, kiến trúc phía máy khách | Không cần cài đặt, phù hợp máy trạm của cấp xã |
| Framework giao diện | React [26] | Quản lý trạng thái giao diện, lớp bản đồ và bảng thông tin địa bàn |
| Thư viện bản đồ | Leaflet [27] | Hiển thị lớp phủ, biểu tượng điểm, popup và chú giải |
| Chế độ xem | Hai chiều và ba chiều theo chiều cao địa hình | Chuyển đổi từ thanh công cụ chính |
| Dạng dữ liệu nền | JSON và GeoJSON công khai qua web server | Dễ kiểm tra, đối chiếu và phân phối lại |
| Kiểm thử hệ thống | Kiểm thử đầu cuối bằng Playwright [28] | Kịch bản kiểm tra giao diện nêu ở Phụ lục C |
| Quy trình phát triển | Kiểm định kép giữa máy sinh mã và người đối chiếu nguồn | Kết hợp tám vòng rà soát dữ liệu [30] |
| Bộ dữ liệu nền | Bảy nhóm lớp, 73 đối tượng và năm lớp raster chuyên đề | Cập nhật lần cuối ngày 16/10/2026 [30] |
| Khổ giấy xuất bản đồ | A4 và A3, phương đứng và phương ngang | Bốn tổ hợp khổ, xem Bảng G.3 |
| Chuẩn trình bày bản đồ | QCVN 80:2024/BTNMT [6] | Áp dụng cho cả bản đồ số và bản đồ in |

**Bảng G.2. Lớp dữ liệu của hệ thống và quy cách hiển thị**

| Lớp dữ liệu | Dạng thực thể | Số đối tượng | Nguồn dữ liệu | Cách hiển thị chính |
|---|---|---|---|---|
| Sông suối | Đường | 7 | OpenStreetMap [8] | Lớp tuyến sông, suối theo chủ đề |
| Thủy lợi truyền thống | Điểm | 6 | Tài liệu nghiên cứu [10], [11], [14], [18] | Biểu tượng công trình kèm mô tả và nguồn |
| Bản làng tiêu biểu | Danh sách theo đơn vị hành chính | 25 | Hồ sơ dân tộc và bộ ảnh nguồn [25] | Khối hiển thị trong bảng thông tin địa bàn |
| Rừng và khu bảo tồn | Vùng | 11 | WDPA [7], tài liệu khoa học [12] | Lớp vùng rừng, khu bảo tồn |
| Mô hình VAC và VACR | Điểm | 8 | Báo chí chính thống [20], [21] | Biểu tượng mô hình kèm thành phần tuần hoàn |
| Cây và vùng dược liệu | Vùng, điểm | 11 | Tài liệu [16], [19] | Lớp dược liệu theo địa bàn |
| Luật tục, vùng phong tục | Vùng theo đơn vị hành chính | 5 | Luật tục, hương ước [13] | Danh sách theo đơn vị hành chính |
| Ranh giới đơn vị hành chính | Vùng polygon | 75 đơn vị | Cổng dữ liệu mở tỉnh Sơn La [5], GADM [9] | Lớp nền, tra cứu và khung chọn |
| Cơ cấu dân tộc | Biểu đồ tròn trên marker | 75 đơn vị | Tổng điều tra [1], Cổng dữ liệu mở [5] | Marker biểu đồ tròn, lát cắt phần bù dân tộc khác |
| Mật độ dân số | Vùng polygon tô màu | 75 đơn vị | Tổng điều tra [1], Cổng dữ liệu mở [5] | Thang màu bảy bậc theo người trên một km vuông |
| Raster chuyên đề | Lớp ô | 5 lớp | SRTM và mô hình khí hậu [24] | Lớp nền địa hình, khí hậu và mật độ |

**Bảng G.3. Quy cách xuất bản đồ giấy trên hệ thống**

| Thành phần | Quy cách | Ghi chú |
|---|---|---|
| Khổ giấy | A4 hoặc A3, phương đứng hoặc phương ngang | Người dùng chọn trong chức năng biên tập bản đồ |
| Khung bản đồ | Thiết lập theo tỉ lệ khổ giấy, mỗi chiều chiếm 62 phần trăm diện tích trang | Bảo đảm tỉ lệ khung bằng tỉ lệ trang |
| Chú giải | Đặt ngoài khung bản đồ và tự đồng bộ với các lớp đang bật | Tuân thủ yêu cầu trình bày của QCVN 80 [6] |
| Ký hiệu chuyên đề | Ký hiệu nhóm lớp thống nhất giữa bản đồ số và bản đồ in | Nhất quán với chú giải thích ứng trên giao diện |
| Thang mật độ dân số | Thang màu bảy bậc liên tục theo người trên một km vuông | Các bậc: dưới 50, từ 50 đến 100, từ 100 đến 200, từ 200 đến 500, từ 500 đến 1.000, từ 1.000 đến 2.000, trên 2.000 |
| Biểu đồ cơ cấu dân tộc | Biểu đồ tròn tại từng đơn vị hành chính | Lát cắt phần bù dân tộc khác bằng phép trừ chính xác tới một trăm phần trăm |
| Chú giải thích ứng | Chỉ hiển thị chú giải của đối tượng nằm trong khung nhìn và vùng chọn | Tránh gây rối bản đồ khi zoom ra xa |
| Tiêu đề bản đồ | Tự động cập nhật theo vùng đang xem và khổ giấy đã chọn | Đồng bộ khi đổi khổ |
| Nguồn dữ liệu | Ghi nguồn dữ liệu trên bản đồ in | Tra cứu theo khung phân hạng ở Phụ lục B |
| Kiểm tra trước khi in | Bật đúng các lớp, chọn đúng vùng, kiểm tra chú giải ngoài khung | Theo các bước nêu ở Phụ lục D |

**Quy trình chuẩn hóa và cập nhật dữ liệu.** Dữ liệu được đưa vào hệ thống theo sáu bước: rà soát tài liệu và chọn lọc nguồn theo khung phân hạng ở Phụ lục B; trích xuất nội dung không gian gồm tọa độ, ranh giới và mã đơn vị hành chính; chuẩn hóa định dạng và lược đồ trường dữ liệu theo Phụ lục A; đối chiếu chéo giữa các nguồn; gán mức độ tin cậy nguồn cho từng đối tượng; duyệt trước khi đưa vào hiển thị. Quy trình được áp dụng thống nhất cho cả bảy nhóm lớp và đã trải qua tám vòng rà soát định kỳ; vòng cập nhật gần nhất ngày 16/10/2026 đã loại bỏ 11 đối tượng không còn tra được nguồn [30]. Nguyên tắc xuyên suốt là không tra được nguồn thì không đưa vào bản đồ.

**Cơ chế bảo đảm dữ liệu hiển thị luôn là bản đã kiểm định.** Mỗi đối tượng hiển thị kèm một trong bốn nhãn trạng thái: có nguồn, một phần, dự đoán hoặc minh họa; khi bấm vào đối tượng, người dùng thấy nhãn trạng thái cùng danh sách liên kết nguồn dạng liên kết bấm được. Hệ thống còn tự kiểm tra dữ liệu lưu tạm trong trình duyệt: nếu phát hiện bản dữ liệu cũ mang nhãn chưa xác minh còn tồn đọng, ứng dụng sẽ loại bỏ bản đó và tải lại bản dữ liệu đã kiểm định từ máy chủ, bảo đảm người dùng cuối không nhìn nhầm dữ liệu chờ xác minh thành dữ liệu chính thức. Bộ ba trạng thái này cùng với bảng phân hạng nguồn ở Phụ lục B tạo thành hệ thống kiểm soát chất lượng chạy xuyên suốt từ khâu thu thập đến khâu hiển thị.

**Hướng dẫn mở rộng sang địa phương khác.** Khi áp dụng mô hình cho tỉnh hoặc huyện khác, nhóm vận hành chỉ cần thay bộ dữ liệu nền, cập nhật mã đơn vị hành chính và bảng phân hạng nguồn tương ứng. Khung kỹ thuật, khung truy thực nguồn, quy tắc chú giải thích ứng và quy cách xuất bản đồ nêu trên được giữ nguyên. Việc thay đổi thư viện hoặc phiên bản nền tảng bắt buộc phải đi kèm chạy lại toàn bộ kiểm thử tự động [28] và đối soát lại bảy nhóm lớp theo Phụ lục A. Với nhu cầu cấp xã sau sáp nhập đơn vị hành chính [4], bộ tài liệu này đủ để đội kỹ thuật địa phương tiếp nhận, vận hành và cập nhật hệ thống mà không cần duy trì nhóm phát triển chuyên trách.

**Ghi chú vận hành:** các thông số trên được xác nhận tại thời điểm nghiệm thu đề tài; khi bổ sung đối tượng mới, cần gán đủ trường dữ liệu theo Bảng A.1, cập nhật trường nguồn và trạng thái, sau đó mới phê duyệt để đối tượng hiển thị công khai.
