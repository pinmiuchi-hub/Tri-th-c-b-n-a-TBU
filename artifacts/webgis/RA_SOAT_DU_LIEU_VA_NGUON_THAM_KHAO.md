# Rà soát dữ liệu WebGIS Tây Bắc và danh mục tài liệu tham khảo

Ngày rà soát: 14/10/2026 · Cập nhật vòng 2: 16/10/2026. Phạm vi: `dan_toc.json`, `layers.json`, geojson 4 tỉnh, ảnh minh họa, lược đồ mặt cắt, nông lịch, số liệu trong giao diện.

## 1. Kết luận ngắn

- **Đã đối chiếu được với nguồn chính thống:** số dân 12 dân tộc thiểu số (Tổng điều tra dân số 2019, bản gốc của Tổng cục Thống kê đã mở và đọc trực tiếp). Phát hiện **1 số liệu sai**: người Mảng ghi 3.700 (số liệu cũ) → đúng 2019 là **4.650**.
- **Đã sửa theo nguồn:** thời gian Tết Mông, Gầu Tào, Xên bản, thảo quả; cách gọi vụ lúa ("vụ chiêm" → "vụ xuân" theo cách gọi của Sơn La, Lai Châu, Lào Cai); mô tả địa bàn các dân tộc; mô tả hệ thống thủy lợi người Thái (là mương – phai – lái – lìn, không phải ruộng bậc thang); nhóm ngôn ngữ người Mường (Việt–Mường, không phải Môn–Khmer); bỏ khẳng định sai "hát Then – Sli – Lượn được UNESCO công nhận" ở mô tả người Tày.
- **Phần lớn dữ liệu điểm trong `layers.json` ban đầu KHÔNG có nguồn** (bản làng, rừng, thủy lợi, mô hình VAC, vùng luật tục, cây thuốc). Đã bỏ các con số cụ thể không có căn cứ (diện tích, tuổi, thu nhập, bán kính, số lượng) và gắn nhãn `trang_thai` hiển thị ngay trong popup. **Không nên dùng các lớp chưa được đối chiếu làm căn cứ pháp lý hoặc nghiên cứu cho đến khi xác minh thực địa.** Sau các lần cập nhật: `forests` + `medicinal_plants` (mục 7), `irrigation` + `vac_models` + `customary_zones` (mục 8) và `villages` (mục 9 — thay bằng 25 bản làng thật) đã đối chiếu nguồn; phần lớn `rivers` vẫn ở mức `mot_phan`.
- **Mô tả "tri thức" của từng dân tộc** (mục `tri_thuc`, tri thức bản địa mặc định) chưa có tài liệu đính kèm trừ những mục ghi cụ thể bên dưới. Đã gắn nhãn `chua_xac_minh`.

## 2. Giới hạn của lần rà soát này (cần đọc)

- Trong các nguồn dưới đây, **chỉ tài liệu của Tổng cục Thống kê được mở và đọc toàn văn**. Các nguồn còn lại tôi chỉ đọc được phần trích trong kết quả tìm kiếm. Trước khi trích dẫn trong báo cáo/bài viết, bạn nên mở toàn văn từng nguồn để kiểm tra lại.
- Tôi **không có cách xác minh tọa độ, tên bản, diện tích** của các điểm trong `layers.json`. Việc này cần dữ liệu thực địa, dữ liệu kiểm kê rừng/đất đai của địa phương, hoặc khảo sát cùng cộng đồng.
- Các đoạn văn bạn dán (về lớp phủ bản đồ, khía cạnh tri thức bản địa) đã bị mất ký hiệu trích dẫn khi sao chép, nên tôi **không biết nguồn gốc**. Nếu chúng được tạo từ công cụ tổng hợp tài liệu (ví dụ NotebookLM), hãy lấy lại danh sách tài liệu gốc từ công cụ đó và gửi cho tôi để đối chiếu và ghi nguồn đúng.
- Nông lịch: chỉ các mục có dấu ✓ trong giao diện đã có nguồn. Các mục còn lại (trồng ngô, thu hoạch lúa, thu hái cây thuốc, đánh cá, chè Shan tuyết…) **chưa có nguồn** và hiển thị dấu ⚠.
- Lược đồ mặt cắt: các khoảng độ cao (mét) ban đầu không có nguồn nên đã bỏ. Hướng phân bố chung (người Thái ở thung lũng, người Mông ở vùng cao hơn) phù hợp các nguồn nhưng vẫn là mô tả định tính. Phần người Mường chỉ là bộ khung khởi tạo.

## 3. Chi tiết các thay đổi

### 3.1. `dan_toc.json`

| Dân tộc | Trường | Giá trị cũ | Giá trị mới |
|---|---|---|---|
| thai | mo_ta | Dân tộc Thái là một trong những dân tộc lớn nhất vùng Tây Bắc, sinh sống chủ yếu ở các thung lũng và vùng núi thấp ven sông suối. Người Thái có nền văn hóa phong phú với … | Dân tộc Thái là một trong những dân tộc đông dân nhất vùng Tây Bắc (địa bàn sống chủ yếu: Sơn La, Nghệ An, Thanh Hóa), cư trú ở các thung lũng ven sông suối, trồng lúa nư… |
| thai | tri_thuc:Nông nghiệp | …làm ruộng bậc thang… | …làm ruộng lúa nước… |
| thai | tri_thuc:Lễ hội | Hoa Ban (Xên Đông) tháng 2–3 âm lịch | mùa hoa ban nở, khoảng tháng 2–3 dương lịch |
| mong | mo_ta | Người Mông sinh sống chủ yếu trên các đỉnh núi cao từ 800–1500m, nổi tiếng với sức bền, ý chí và tinh thần cộng đồng mạnh mẽ. Họ có kỹ thuật canh tác nương rẫy độc đáo tr… | Người Mông sinh sống chủ yếu ở vùng núi cao (địa bàn sống chủ yếu: Hà Giang, Điện Biên, Sơn La). Họ có kỹ thuật canh tác nương rẫy trên đất dốc và các nghề thủ công như r… |
| mong | tri_thuc:Lễ hội | Nào Pê Chầu tháng 11–12 âm lịch | cuối tháng 11–đầu tháng 12 âm lịch |
| muong | ngon_ngu | Ngữ hệ Nam Á (nhánh Môn-Khmer) | Ngữ hệ Nam Á (nhóm Việt–Mường) |
| muong | mo_ta | Người Mường có quan hệ gần gũi với người Kinh, sinh sống ở vùng trung du và núi thấp. Họ có nền văn hóa dân gian phong phú với hệ thống sử thi Đẻ Đất Đẻ Nước, cồng chiêng… | Người Mường có quan hệ gần gũi với người Kinh về ngôn ngữ (nhóm Việt–Mường), địa bàn sống chủ yếu: Hòa Bình, Thanh Hóa, Phú Thọ; ở Sơn La có số dân đáng kể. Văn hóa Mường… |
| dao | mo_ta | Người Dao sinh sống ở độ cao trung bình 700–1200m, có nhiều ngành khác nhau (Dao Đỏ, Dao Tiền, Dao Quần Chẹt…). Họ nổi tiếng với nghề thuốc nam gia truyền, chữ Nôm Dao và… | Người Dao có nhiều ngành khác nhau (Dao Đỏ, Dao Tiền, Dao Quần Chẹt…), địa bàn sống chủ yếu: Hà Giang, Tuyên Quang, Lào Cai. Họ nổi tiếng với nghề thuốc nam gia truyền, c… |
| kho_mu | mo_ta | Người Khơ Mú (còn gọi Xá Cẩu, Mứn Xen) sinh sống ở các thung lũng và sườn núi thuộc Sơn La, Điện Biên, Nghệ An. Họ có truyền thống săn bắt, hái lượm và chế tác công cụ từ… | Người Khơ Mú (còn gọi Xá Cẩu, Mứn Xen) sinh sống ở các thung lũng và sườn núi thuộc Nghệ An, Điện Biên, Sơn La. Họ có truyền thống săn bắt, hái lượm và chế tác công cụ từ… |
| la_hu | mo_ta | Người La Hủ là dân tộc thiểu số rất ít người, sinh sống tập trung ở huyện Mường Tè, tỉnh Lai Châu. Họ có lối sống du canh du cư truyền thống trên các vùng núi cao, đang t… | Người La Hủ là dân tộc rất ít người (12.113 người năm 2019), cư trú chủ yếu ở tỉnh Lai Châu, vùng núi cao. Trước đây có lối sống du canh du cư, nay đang trong quá trình đ… |
| lu | mo_ta | Người Lự (còn gọi Lự Đen, Phu Lự) sinh sống ở huyện Tam Đường, Sìn Hồ tỉnh Lai Châu. Họ có quan hệ gần với người Thái Lự ở Vân Nam (Trung Quốc) và Lào, duy trì nền văn hó… | Người Lự (còn gọi Lự Đen, Phù Lự) sinh sống chủ yếu ở tỉnh Lai Châu. Họ có quan hệ gần với người Thái Lự ở Vân Nam (Trung Quốc) và Lào, theo Phật giáo Nam Tông. |
| mang | dan_so_ca_nuoc | 3700 | 4650 |
| mang | mo_ta | Người Mảng là dân tộc rất ít người, cư trú ở huyện Mường Tè và Nậm Nhùn, tỉnh Lai Châu. Họ có hệ thống tri thức sinh tồn độc đáo thích nghi với rừng núi nguyên sinh và đa… | Người Mảng là dân tộc rất ít người (4.650 người năm 2019), cư trú chủ yếu ở tỉnh Lai Châu. |
| tay | mo_ta | Người Tày là dân tộc thiểu số đông thứ hai cả nước, sinh sống tập trung ở các thung lũng và vùng đồi thấp Đông-Tây Bắc (Lào Cai, Yên Bái, Hà Giang, Tuyên Quang). Văn hóa … | Người Tày là dân tộc thiểu số đông dân nhất cả nước (1.845.492 người năm 2019), cư trú ở các thung lũng Đông Bắc (địa bàn sống chủ yếu: Lạng Sơn, Cao Bằng, Tuyên Quang) v… |
| ha_nhi | mo_ta | Người Hà Nhì sinh sống ở vùng cao biên giới Lào Cai (Y Tý, A Lù, Bát Xát) và Lai Châu (Mường Tè), độ cao 1.500–2.000m. Nổi tiếng với nhà trình tường đất kỳ lạ giữa biển m… | Người Hà Nhì sinh sống ở vùng cao biên giới Lào Cai (Y Tý, A Lù, Bát Xát) và Lai Châu (Mường Tè) (địa bàn sống chủ yếu: Lai Châu, Lào Cai, Điện Biên). Nổi tiếng với nhà t… |
| nung | mo_ta | Người Nùng tập trung ở Đông Bắc (Lạng Sơn, Cao Bằng) và rải rác Tây Bắc (Lào Cai – Mường Khương, Bắc Hà, Bảo Yên). Văn hóa gần gũi người Tày nhưng có chữ Nôm Nùng riêng. … | Người Nùng tập trung ở Đông Bắc (Lạng Sơn, Cao Bằng) và rải rác Tây Bắc (Lào Cai – Mường Khương, Bắc Hà, Bảo Yên). Văn hóa gần gũi người Tày. Nổi tiếng với nghề rèn nông … |

Tất cả bản ghi đã thêm: `nam_dan_so`, `nguon`, `ghi_chu_nguon`, `trang_thai_tri_thuc`. Số dân Kinh (82.085.826) chưa đối chiếu được với nguồn gốc (nguồn thứ cấp ghi sơ bộ 82.085.729), cần kiểm tra lại trên cổng của Tổng cục Thống kê.

### 3.2. `layers.json`

Quy ước `trang_thai`: `minh_hoa` = dữ liệu minh họa không có nguồn; `chua_xac_minh` = chưa có nguồn xác minh trực tiếp địa điểm/nội dung (URL đính kèm, nếu có, chỉ là tham khảo tổng quát); `mot_phan` = một phần có nguồn; `co_nguon` = đã đối chiếu nguồn (danh sách URL hiển thị trong popup).

| Lớp | Mã | Nội dung cũ | Nội dung mới |
|---|---|---|---|
| irrigation | ir2 | Kênh tưới chính dẫn nước từ suối Nậm Pàn phục vụ 850ha lúa nước | Kênh tưới chính dẫn nước từ suối Nậm Pàn phục vụ lúa nước |
| irrigation | ir3 | Đập đá truyền thống người Thái Đen xây dựng từ thế kỷ 19 | Đập đá truyền thống người Thái Đen |
| villages | v1 | Bản Thái Đen lâu đời, có trên 150 nóc nhà sàn truyền thống, nổi tiếng với nghề dệt thổ cẩm | Bản Thái Đen lâu đời, có nhà sàn truyền thống, nổi tiếng với nghề dệt thổ cẩm |
| villages | v2 | Bản Mông trên độ cao 1.200m, canh tác ngô đá và nuôi ong rừng | Bản Mông vùng núi cao, canh tác ngô đá và nuôi ong rừng |
| villages | v4 | Bản Thái lớn với hệ thống thủy lợi mương-phai hoàn chỉnh, 3 vụ lúa/năm | Bản Thái lớn với hệ thống thủy lợi mương-phai hoàn chỉnh |
| villages | v6 | Bản La Hủ xa xôi nhất tỉnh Lai Châu, đang định canh định cư từ năm 2015 | Bản La Hủ xa xôi nhất tỉnh Lai Châu, đang trong quá trình định canh định cư |
| villages | v10 | Bản Mông trồng thảo quả dưới tán rừng già, thu nhập cao | Bản Mông trồng thảo quả dưới tán rừng già |
| villages | ban_y_ty | Bản Hà Nhì giữa biển mây Y Tý, nhà trình tường đất 100 năm tuổi, ruộng bậc thang Thề Pả tuyệt đẹp. | Bản Hà Nhì giữa biển mây Y Tý, nhà trình tường đất, ruộng bậc thang Thề Pả tuyệt đẹp. |
| villages | ban_lien | Bản Tày Bắc Hà, sở hữu rừng chè Shan Tuyết cổ thụ 200–500 năm tuổi và nghề làm chè hữu cơ. | Bản Tày Bắc Hà, sở hữu rừng chè Shan Tuyết cổ thụ và nghề làm chè hữu cơ. |
| forests | f1 | Khu rừng cấm do bản Thái quản lý 200 năm qua. Cấm chặt cây, săn thú, bảo vệ đầu nguồn | Khu rừng cấm do bản Thái quản lý lâu đời. Cấm chặt cây, săn thú, bảo vệ đầu nguồn |
| forests | f3 | Rừng bảo vệ nguồn nước suối Nậm Giải cấp cho 5 bản hạ lưu. Luật tục cấm khai thác gỗ | Rừng bảo vệ nguồn nước suối Nậm Giải cấp nước cho các bản hạ lưu. Luật tục cấm khai thác gỗ |
| forests | f4 | Rừng thảo quả dưới tán cây gỗ lớn, diện tích 120ha. Thu hoạch tháng 9-11 hàng năm | Rừng thảo quả dưới tán cây gỗ lớn. Thu hoạch tháng 9-11 hàng năm |
| forests | rung_che_ban_lien | Rừng chè cổ thụ 200–500 tuổi của người Tày Bản Liền (Bắc Hà), được công nhận chè hữu cơ chuẩn châu Âu. | Rừng chè cổ thụ của người Tày Bản Liền (Bắc Hà), được công nhận chè hữu cơ chuẩn châu Âu. |
| vac_models | vac1 | Kết hợp: 0.5ha vườn cây ăn quả + ao cá 1.500m² + chuồng lợn đen + 2ha rừng keo. Thu nhập 85 triệu/năm | Kết hợp vườn cây ăn quả + ao cá + chuồng lợn đen + rừng keo |
| vac_models | vac2 | Mô hình VAC quy mô lớn: vườn chuối, sắn xen canh + ao cá chép + đàn vịt 500 con | Mô hình VAC quy mô lớn: vườn chuối, sắn xen canh + ao cá chép + đàn vịt |
| customary_zones | cz2 | Khu bảo vệ đầu nguồn suối Chiềng Yên. Cộng đồng Thái cấm chặt cây trong bán kính 500m từ mó nước | Khu bảo vệ đầu nguồn suối Chiềng Yên. Cộng đồng Thái cấm chặt cây quanh mó nước |
| customary_zones | cz3 | Quy ước bản: chỉ khai thác gỗ vào tháng 12-2 âm lịch, mỗi nhà tối đa 2 cây/năm | Quy ước bản về thời điểm và số lượng khai thác gỗ |
| customary_zones | cz4 | Khu nương rẫy luân canh 5-7 năm của người Mông. Bỏ hoang để phục hồi đất tự nhiên | Khu nương rẫy luân canh nhiều năm của người Mông. Bỏ hoang để phục hồi đất tự nhiên |
| customary_zones | luat_tuc_muong_khuong | Hệ thống luân canh nương rẫy 5–7 năm của người Mông – đất bỏ hoang được phục hồi tự nhiên trước khi canh tác lại. | Hệ thống luân canh nương rẫy nhiều năm của người Mông – đất bỏ hoang được phục hồi tự nhiên trước khi canh tác lại. |
| forests | rung_hoang_lien | Vườn Quốc gia 28.500 ha bao quanh đỉnh Fansipan – đa dạng sinh học cao nhất Đông Dương, nguồn dược liệu quý. | Vườn Quốc gia bao quanh đỉnh Fansipan, nguồn nước đầu nguồn quan trọng của vùng. |
| forests | rung_dau_nguon_van_ban | Khu Bảo tồn thiên nhiên Hoàng Liên – Văn Bàn 25.000ha, bảo vệ các loài quý hiếm như vọoc, gấu ngựa. | Khu Bảo tồn thiên nhiên Hoàng Liên – Văn Bàn, bảo vệ các loài thú quý hiếm. |
| medicinal_plants | mp1 | tình trạng: Nguy cấp | Chưa xác minh |
| medicinal_plants | mp2 | tình trạng: Sắp nguy cấp | Chưa xác minh |
| medicinal_plants | mp3 | tình trạng: Bảo tồn tốt | Chưa xác minh |
| medicinal_plants | mp4 | tình trạng: Bình thường | Chưa xác minh |
| medicinal_plants | mp5 | tình trạng: Sắp nguy cấp | Chưa xác minh |
| medicinal_plants | mp6 | tình trạng: Bảo tồn tốt | Chưa xác minh |
| medicinal_plants | cay_tam_that_bac_ha | tình trạng: Cần bảo tồn | Chưa xác minh |
| medicinal_plants | cay_atiso_sa_pa | tình trạng: Phổ biến (trồng quy mô) | Chưa xác minh |
| medicinal_plants | cay_la_tam_dao_do | tình trạng: Đặc sản OCOP | Chưa xác minh |
| medicinal_plants | cay_do_trong_bat_xat | tình trạng: Bảo tồn nghiêm ngặt | Chưa xác minh |
| medicinal_plants | cay_dang_sam_y_ty | tình trạng: Quý hiếm | Chưa xác minh |
| forests | f4 | Rừng thảo quả dưới tán cây gỗ lớn. Thu hoạch tháng 9-11 hàng năm | Rừng thảo quả dưới tán cây gỗ lớn. Thảo quả thường thu hoạch vào khoảng tháng 11–12 hàng năm |
| forests | rung_thao_qua_bat_xat | Rừng thảo quả tự nhiên dưới tán rừng già Bát Xát – nguồn thu chủ yếu của người Mông – Hà Nhì vùng cao. | Rừng thảo quả dưới tán rừng ở Bát Xát — huyện có diện tích thảo quả lớn nhất tỉnh Lào Cai theo số liệu Báo Lào Cai. |

Tình trạng bảo tồn của các cây thuốc (Nguy cấp, Quý hiếm…) ban đầu không có nguồn (ví dụ danh lục đỏ, Sách đỏ Việt Nam) nên đã đặt "Chưa xác minh"; giá trị cũ giữ trong trường `tinh_trang_goc_chua_xac_minh`. Sông suối: hình học lấy từ OpenStreetMap theo README dự án, tên địa phương chưa xác minh (`mot_phan`).

### 3.3. Nông lịch và lược đồ mặt cắt

| Mục | Cũ | Mới | Nguồn |
|---|---|---|---|
| Tết Mông (Nào Pê Chầu) | tháng 11–12 dương lịch | tháng 12–1 (cuối tháng 11 đến đầu tháng 12 âm lịch) | [6],[7] |
| Lễ Gầu Tào | tháng 1–2 | tháng 2–3 (mùng 1–rằm tháng Giêng âm lịch) | [8] |
| Xên bản, Xên mường | tháng 1–3 | tháng 2–3 | [4],[5] |
| Thu hoạch thảo quả | tháng 9–11 | tháng 11–12 | [10],[11] |
| Gieo mạ, cấy lúa "vụ chiêm" | tháng 2–4 | "vụ xuân", tháng 2–3 | [2],[3] |
| Tu sửa mương-phai | tháng 1–2 | giữ nguyên, đã có nguồn | [1] |
| Khoảng độ cao trong lược đồ | >1500 m, 900–1500 m, 500–900 m, 200–500 m, <200 m | bỏ số liệu, dùng tên đai định tính | không có nguồn cho các mốc cũ |
| Người Mường | không có | bộ khung khởi tạo, có cảnh báo trong modal | chưa có nguồn |

Ghi chú: [số] là số thứ tự trong danh mục nguồn ở mục 4. Lễ hội âm lịch dịch chuyển theo năm trong khoảng một tháng dương lịch.

## 4. Danh mục tài liệu đã sử dụng

Mức độ tin cậy: **A** = tài liệu thống kê/cơ quan nhà nước; **B** = tạp chí khoa học, tài liệu học thuật; **C** = báo chí chính thống; **D** = nguồn thứ cấp/thương mại, chỉ dùng để đối chiếu.

| # | Mức | Tài liệu | Dùng cho | Đã đọc |
|---|---|---|---|---|
| 1 | C | Báo Nông nghiệp và Môi trường, "Lai Châu điều chỉnh lịch gieo cấy linh hoạt tránh rét đậm rét hại" — https://nongnghiepmoitruong.vn/lai-chau-dieu-chinh-lich-gieo-cay-linh-hoat-tranh-ret-dam-ret-hai-d796188.html | Vệ sinh đồng, nạo vét mương đầu tháng 1 | Trích đoạn |
| 2 | C | Báo Nông nghiệp và Môi trường, "Nông dân Sơn La hối hả sản xuất vụ xuân" — https://nongnghiepmoitruong.vn/nong-dan-son-la-hoi-ha-san-xuat-vu-xuan-d798748.html | Gieo cấy lúa xuân sau Tết | Trích đoạn |
| 3 | C | Báo Lào Cai, "Hoàn thành cấy lúa xuân trong tháng 3" — https://baolaocai.vn/hoan-thanh-cay-lua-xuan-trong-thang-3-post764609.html | Lịch cấy lúa xuân | Trích đoạn |
| 4 | C | Báo Văn hóa, "Xên bản, xên mường — phong tục độc đáo của người Thái ở Pắc Ngà" — https://baovanhoa.vn/dan-toc-ton-giao/xen-ban-xen-muong-phong-tuc-doc-dao-cua-nguoi-thai-o-pac-nga-208745.html | Thời gian Xên bản, Xên mường | Trích đoạn |
| 5 | C | Báo Pháp luật, "Chuỗi sự kiện sẽ diễn ra tại Lễ hội Mùa hoa ban ở Sơn La" — https://baophapluat.vn/chuoi-su-kien-se-dien-ra-tai-le-hoi-mua-hoa-ban-o-son-la-post468771.html; VOV, "Đặc sắc lễ hội Xên Mường của người Thái đen Sơn La" — https://vov.vn/van-hoa/dac-sac-le-hoi-xen-muong-cua-nguoi-thai-den-son-la-post1161419.vov | Hoa ban, Xên mường tháng 2–3 | Trích đoạn |
| 6 | C | Viet Nam News, "Mông ethnic people celebrate new year" — https://vietnamnews.vn/life-style/570458/mong-ethnic-people-celebrate-new-year.html | Thời gian Tết Mông | Trích đoạn |
| 7 | C | Báo Nhân Dân/SGGP, "Đón Tết trên non cao" — https://www.sggp.org.vn/don-tet-tren-non-cao-post583099.html; VnExpress, "Tết sớm của người Mông ở Mộc Châu" — https://vnexpress.net/tet-som-cua-nguoi-mong-o-moc-chau-2931695.html | Đối chiếu Tết Mông | Chỉ thấy trong kết quả tìm kiếm |
| 8 | C | Báo Văn hóa, "Lễ hội Gầu Tào là di sản văn hóa phi vật thể quốc gia của người Mông ở Yên Bái" — https://baovanhoa.vn/van-hoa/le-hoi-gau-tao-la-di-san-van-hoa-phi-vat-the-quoc-gia-cua-nguoi-mong-o-yen-bai-101859.html | Gầu Tào, thời gian tổ chức | Trích đoạn |
| 9 | C | Báo Lào Cai, "Bài 1: Thảo quả — cây làm giàu của nhiều gia đình" — https://baolaocai.vn/bai-1-thao-qua-cay-lam-giau-cua-nhieu-gia-dinh-post9491.html | Thảo quả dưới tán rừng; diện tích theo huyện | Trích đoạn |
| 10 | C | Báo Pháp luật, "Nhớ hương vị tò ho của núi rừng Tây Bắc" — https://baophapluat.vn/nho-huong-vi-to-ho-cua-nui-rung-tay-bac-post383414.html | Thảo quả: độ cao >1.000 m, quả chín khoảng tháng 11–12 | Trích đoạn |
| 11 | D | Pharmacity, "Thảo quả" — https://www.pharmacity.vn/thao-qua.htm | Chỉ đối chiếu mùa thu hái (11–12) | Trích đoạn |
| 12 | B | Phùng Như Giang và cộng sự, Tạp chí Khoa học Lâm nghiệp số 4/2023, "Kết quả chọn cây trội thảo quả tại Yên Bái và Lào Cai" — https://vafs.gov.vn/vn/wp-content/uploads/sites/2/2023/09/Bai-4.-Phung-Nhue-Giang.pdf | Lào Cai, Yên Bái là vùng trồng thảo quả lớn | Trích đoạn |
| 13 | A | Tổng cục Thống kê (2020), Đặc trưng cơ bản của 53 dân tộc thiểu số năm 2019 — https://www.nso.gov.vn/wp-content/uploads/2020/07/Dac-trung-53-dan-toc-thieu-so-2019_ban-in.pdf | Số dân, địa bàn sống chủ yếu của các dân tộc | **Toàn văn** |
| 14 | B | Tạp chí Dân tộc học, bài về tri thức dân gian người Thái — https://vjol.info.vn/tapchiviendantochoc/article/download/128504/105394/ | Hệ thống mương, phai, lái, lìn | Trích đoạn |
| 15 | B | Digital Library of the Commons, Indiana University — https://dlc.dlib.indiana.edu/dlc/handle/10535/560 | Hệ thống muang-fai của người Thái Đen ở Yên Châu, Sơn La | Trích đoạn |
| 16 | B | Trường Đại học Tây Bắc, "Bảo vệ rừng của người Thái tỉnh Sơn La" — https://fss.utb.edu.vn/wp-content/uploads/2021/06/1-1.pdf | Các loại rừng theo tập quán Thái (rừng ma, rừng cấm, rừng cúng) | Trích đoạn (một phần bị lỗi chữ) |
| 17 | B | Tạp chí Dân tộc học (Viện Dân tộc học) — https://vjol.info.vn/tapchiviendantochoc/article/download/125785/103240/; Tạp chí Khoa học ĐH Sư phạm TP.HCM — https://journal.hcmue.edu.vn/index.php/hcmuejos/article/download/810/801 | Xu hướng cư trú theo địa hình (Thái ở thung lũng, Mông cao hơn) | Chỉ thấy trong kết quả tìm kiếm |
| 18 | D | Wikipedia, "Muong people" — https://en.wikipedia.org/wiki/Muong_people | Nhóm ngôn ngữ Việt–Mường, sử thi (chỉ đối chiếu) | Trích đoạn |
| 19 | D | Thư viện Pháp luật, "Dân tộc thiểu số là gì? Danh sách các dân tộc thiểu số ở Việt Nam" — https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/tu-van-phap-luat/43986/dan-toc-thieu-so-la-gi-danh-sach-cac-dan-toc-thieu-so-o-viet-nam | Số liệu sơ bộ người Kinh | Trích đoạn |

## 5. Tài liệu chính thống nên lấy tiếp để hoàn thiện

1. ~~Kết quả toàn bộ Tổng điều tra dân số và nhà ở 2019 cho `DEFAULT_STATS`~~ — **Đã đối chiếu 15/10/2026**, xem mục 6.
2. Ủy ban Dân tộc / Viện Dân tộc học, bộ sách "Các dân tộc ở Việt Nam" (tập Nam Á, Tày–Thái, Mông–Dao) làm cơ sở cho các mục mô tả và `tri_thuc`.
3. Bảo tàng Dân tộc học Việt Nam: hồ sơ lễ hội và tín ngưỡng của Thái, Mông, Mường (Hoa Ban, Xên bản, Gầu Tào, Nào Pê Chầu).
4. Dữ liệu kiểm kê rừng, quy hoạch sử dụng đất của UBND tỉnh Sơn La/Điện Biên/Lai Châu/Lào Cai và Bộ Nông nghiệp và Môi trường (diện tích rừng, thảo quả, thủy lợi); Sách đỏ Việt Nam / Danh lục đỏ IUCN cho tình trạng bảo tồn cây thuốc.
5. Lịch thời vụ chính thức của Sở Nông nghiệp và Môi trường từng tỉnh theo năm.
6. Khảo sát thực địa có sự tham gia của già làng, trưởng bản (để có tọa độ và tên địa phương xác thực, kèm sự đồng ý của cộng đồng đối với các thông tin nhạy cảm như vị trí cây thuốc quý).

## 6. Cập nhật 15/10/2026 — đối chiếu thống kê tỉnh & ghi nguồn

### 6.1. `DEFAULT_STATS` đã đối chiếu nguồn chính thống

| Tỉnh | Diện tích | Dân số | Đơn vị | Nguồn |
|---|---|---|---|---|
| Sơn La | 14.174 km² | 1.248.415 (2019) → hiển thị "1,25M" | 75 | TĐTDS&NO 01/4/2019 (Tổng cục Thống kê); đơn vị theo QĐ 19/2025/QĐ-TTg |
| Điện Biên | 9.541 km² | 598.856 (2019) → "599K" | 45 | TĐTDS&NO 2019; đơn vị sau sắp xếp 2025 |
| Lai Châu | 9.069 km² | 460.196 (2019) → "460K" | 38 | TĐTDS&NO 2019; đơn vị sau sắp xếp 2025 |
| Lào Cai (mới) | 13.257 km² | 1.778.785 (2025) → "1,78M" | 99 | NQ 202/2025/QH15 (sáp nhập với Yên Bái, hiệu lực 01/7/2025); dân số theo GSO 2025 |

- **Đã sửa**: dân số Lào Cai cũ ghi 770K (sai — TĐTDS&NO 2019 là 730.420). Vì dữ liệu ranh giới `xa_laocai.geojson` là **tỉnh Lào Cai mới** (gồm địa bàn Yên Bái cũ, 99 đơn vị, `ma_tinh = "15"`), thống kê đã cập nhật theo tỉnh mới thay vì gắn nhãn "cũ".
- Giao diện hiển thị dòng nguồn ngay dưới khối thống kê tỉnh (`STATS_SOURCE_NOTE`).
- **Lưu ý snapshot hành chính**: toàn bộ app dùng cấu trúc đơn vị hành chính **sau sắp xếp 01/7/2025** (Sơn La 75, Điện Biên 45, Lai Châu 38, Lào Cai 99). Dân số là số liệu điều tra gần nhất.

### 6.2. Ghi nguồn hiển thị trong app

- Chú giải raster chuyên đề: thêm dòng "Nguồn: …" lấy từ `raster/meta.json` (`source`) — elevation/aspect = NASA SRTM (Open-Meteo); nhiệt lượng, lượng mưa, đất = **mô hình ước lượng, không phải quan trắc trực tiếp**.
- Chú giải "Hệ thống sông suối": ghi nguồn **OpenStreetMap (Overpass API)**; lớp rivers đã bật lại trong nhóm Thủy văn.
- Panel bản đồ chuyên đề đã có dòng `Nguồn:` (có sẵn).

### 6.3. Dọn dữ liệu thừa

- Xóa `public/data/gee_catalog.json` (196 KB, không code nào tham chiếu; danh mục GEE không còn dùng).

## 7. Cập nhật 16/10/2026 — lớp `forests` & `medicinal_plants` chuyển từ point sang polygon (shape thật)

### 7.1. `forests` — 11 khu bảo tồn, hình học từ WDPCA

- **Nguồn shape**: UNEP-WCMC / IUCN *World Database on Protected Areas* (WDPCA), truy vấn dịch vụ map service `data-gis.unep-wcmc.org`, bản ghi ISO3 = VNM, lọc theo bbox 4 tỉnh; hiển thị tại [protectedplanet.net](https://protectedplanet.net). Trường `gis_area` (km²) × 100 = `dien_tich_ha`.
- **11 đối tượng**: Hoàng Liên (VQG), Hoàng Liên–Văn Bàn, Hoàng Liên Sơn – Lai Châu, Mường Nhé, Mường Phăng (KBCQ), Sốp Cộp, Copia, Tà Xùa (2 phần → export MultiPolygon), Xuân Nha, Mù Cang Chải, Nà Hẩu.
- **Enum `loai` mới**: `vqg` | `kbttn` | `kbvcq` | `rung_dac_dung` (đã thay enum minh họa cũ `rung_thieng`/`rung_ma`/… trong `FOREST_LABELS`, `FOREST_COLORS` và `FIELD_CONFIG` của LayerDataEditor).
- **Loại bỏ khỏi WDPA (lọc 4 tỉnh)**: `Hang Kia - Pà Cò` (Hòa Bình/Phú Thọ), `Xuân Sơn` (VQG Phú Thọ), `Nam Don` (bản ghi không tra được nguồn tiếng Việt tương ứng).
- **Đổi tên theo tên chính thức**: WDPA `Chế Tạo` → **Mù Cang Chải** (Khu bảo tồn loài – sinh cảnh Mù Cang Chải, 20.293,3 ha, 5 xã Mù Cang Chải — nbca.gov.vn, baolaocai.vn); `Hoang Lien Son - Lai Chau` → `Hoàng Liên Sơn – Lai Châu`.
- **Tỉnh (`ten_dia_phuong`)**: chấm điểm theo đa số đỉnh polygon trong `tinh.geojson` (trừ Mù Cang Chải gán Lào Cai — Yên Bái cũ). Lưu ý: WDPA gộp một số PA xuyên tỉnh trong một MultiPolygon → diện tích theo geometry WDPCA có thể nhỏ hơn số quyết định công bố (ví dụ Copia: 10.317 ha theo WDPCA vs 19.745 ha theo QĐ thành lập — ghi trong `mo_ta`).
- `trang_thai = "co_nguon"` (trạng thái mới: đã đối chiếu nguồn), `nguon` = WDPCA/protectedplanet.net.

### 7.2. `medicinal_plants` — 11 vùng, hình học = polygon hành chính thật

- **Nguồn shape**: polygon từ `public/data/xa_*.geojson` (đơn vị hành chính **sau sáp nhập 01/7/2025**), chọn ring lớn nhất, Douglas–Peucker tol 0.0005°.
- **Đối chiếu sáp nhập (NQ 1681 & NQ 1661/NQ-UBTVQH15)**: Chiềng Chung → **Mường Chanh**; Tênh Phông → **Quài Tở**; Trung Thu → **Sính Phình**; Mồ Sì San gộp vào **Sì Lở Lầu** (một polygon).
- **Nội dung**: sâm Lai Châu (Mồ Sì San–Sì Lở Lầu), sâm Ngọc Linh bản Sam Ta (Mường Chanh), dược liệu cao Quài Tở, sa nhân tím Sốp Cộp, dược liệu Trung Thu/Sính Phình, Mường Phăng–Pá Khoang, 8 loài dưới tán KBTTN Mường La, thảo quả Thuận Châu/Quỳnh Nhai/Bắc Yên, dược liệu Vân Hồ.
- **Nguồn tin bài**: nhandan.vn 5/2022 (dược liệu đặc hữu Tây Bắc); baolaichau.vn 1/2025; thongtindoingoai.sonla.gov.vn 10/2026 (KBTTN Mường La >48 ha chu kỳ 1); nc23.cnnd.vn 11/2025 (Sơn La 16.145 ha dược liệu 2025); văn bản sáp nhập ĐVHC 2025.
- `tinh_trang = "Đã xác minh"` (FIELD_CONFIG), `trang_thai = "co_nguon"`.

### 7.3. Thay đổi code liên quan

- `WebGIS goc.tsx`: type `LayersData`; `LAYER_GEOM_TYPE` → polygon; `DEFAULT_LAYER_SYMBOLOGY` (symbolType polygon, fillOpacity 0.3); render `L.polygon` nhiều ring (`polygonRings`); legend 4 loài rừng + ô màu cây thuốc; `statusNote` thêm nhánh `co_nguon` (xanh lá); migrate localStorage: bỏ dữ liệu point cũ của 2 lớp (chỉ nhận bản polygon), migrate cấu hình symbology point → polygon.
- `geoUtils.ts`: export GeoJSON hỗ trợ MultiPolygon (Tà Xùa), KML xuất `<MultiGeometry>`.
- `LayerDataEditor.tsx`: bỏ trường lat/lng của 2 lớp, enum loai mới, thêm `dien_tich_ha`/`mo_ta`/`ten_dia_phuong`.
- Hành vi tự đúng: đếm feature, xuất KML/GeoJSON, modal symbology, legend composer.

## 8. Cập nhật 16/10/2026 — đối chiếu 3 lớp `irrigation`, `vac_models`, `customary_zones` (nguồn internet thật)

### 8.1. Nguyên tắc

- `co_nguon` = nội dung và địa điểm có nguồn tin cậy đính kèm (`nguon` là URL, bấm được ngay trong popup); `mot_phan` = một phần có nguồn (ví dụ công trình lớn có nguồn nhưng tọa độ cột mốc chỉ mang tính đại diện); `chua_xac_minh` = chưa có nguồn xác minh trực tiếp — popup ghi rõ "cần đối chiếu thêm ở hiện trường".
- Địa điểm mới lấy tọa độ = **centroid polygon hành chính GADM 4.1** (gadm.org, tải 16/10/2026 — OSM/Overpass không có boundary commune ở vùng này), đã đối chiếu bbox với địa bàn nêu trong bài nguồn.

### 8.2. `irrigation` — 11 → 14 điểm

- **3 điểm mới, `co_nguon`**:
  - `con_nam_e_long_he` — cọn nước (guồng) bản Nong Lạnh, dòng Nặm É, xã Long Hẹ, Thuận Châu: tre/nứa, quay bằng sức nước tự nhiên; kèm câu "Mương, phai, lái, lín, lốc, cọn" của người Thái — [baosonla.vn 02/6/2026](https://baosonla.vn/du-lich/giu-nhip-quay-con-nuoc-ben-dong-nam-e-kVg31Vxvg.html), [vov4.vov.vn](https://vov4.vov.vn/tim-hieu-dan-toc-viet-nam/kinh-nghiem-lam-lua-nuoc-cua-nguoi-thai-o-dien-bien-366939.vov4).
  - `muong_chieng_khoong` — xã Chiềng Khoong, Sông Mã: 25 công trình thủy lợi (18 kiên cố, 7 gỗ–đá), gần 20 km mương, 21 tổ thủy nông, tưới 245 ha lúa xuân 2022 — [songma.sonla.gov.vn 15/3/2022](https://songma.sonla.gov.vn/1298/31420/60148/632775/van-hoa-xa-hoi/chieng-khoong-dam-bao-nguon-nuoc-cho-lua-xuan).
  - `muang_fai_yen_chau` — muang-fai Chiềng Khôi, Yên Châu (~5 km từ trung tâm huyện), quản lý theo luật tục — Neef và cộng sự, 2006 ([hdl.handle.net/10535/560](http://hdl.handle.net/10535/560)).
- `ir1` Phai Nậm Rốm → `mot_phan`: Đại thủy nông Nậm Rốm (khởi công cuối 1963, hoàn thành 1969; đập tràn 127 m, hơn 34 km kênh ôm cánh đồng Mường Thanh, 100 km mương, 476 cống; Di tích lịch sử – văn hóa cấp tỉnh QĐ 372/QĐ-UBND 23/5/2014) — [Ban Quản lý di tích tỉnh Điện Biên](http://bqldt.svhttdl.dienbien.gov.vn/portal/pages/2020-6-30/Cong-trinh-Dai-thuy-nong-Nam-Rom9vcbupk907im.aspx); phần "phai" cụ thể tại tọa độ chưa có nguồn.
- `ir2`–`ir7` và 4 điểm cũ (`phai_ban_ho`, `muong_muong_khuong`, `lin_y_ty`, `phai_bac_ha`) → `chua_xac_minh`, đính nguồn tham khảo tổng quát (bài cọn Nặm É định nghĩa mương–phai–lái–lín–lốc–cọn; [Bảo tàng VHDTVN – dẫn thủy nhập điền](http://mcve.org.vn/2023/03/10/tim-hieu-he-thong-dan-thuy-nhap-dien-cua-nhom-cu-dan-tay-thai-qua-he-thong-trung-bay-tai-bao-tang-van-hoa-cac-dan-toc-viet-nam/); Neef 2006).
- Code: thêm loại `con` (cọn/guồng nước) vào `IRRIGATION_LABELS` + options `loai` của LayerDataEditor, emoji 🌀; sửa nghĩa theo nguồn: **lái = máng dẫn, lín = phân phối nước vào ruộng** (bản cũ ghi "Lịn (máng), Lái (kênh phụ)").

### 8.3. `vac_models` — 7 → 9 mô hình

- **2 mô hình mới, `co_nguon`** (tọa độ = centroid GADM):
  - `vac_ta_lai` — VAC gia đình anh Đinh Văn Màu, bản Tà Lọt, xã Tà Lại, Mộc Châu: ~4 ha cây ăn quả (nhãn, xoài, mít, bưởi da xanh) từ 2015, nuôi vịt cổ xanh – thỏ – dúi (~200 con) + ao cá, chăn nuôi trên 100 triệu đồng/năm — [baosonla.org.vn 08/7/2020](https://baosonla.org.vn/guong-sang-ban-lang/lam-giau-tu-mo-hinh-vac-32416.html).
  - `vac_kun_ha` — anh Hàng A Cơ, bản Nậm Pha, xã Khun Há, Tam Đường, Lai Châu: 5 ha thảo quả dưới tán rừng (6.000 gốc, 200–300 triệu đồng/năm) + vườn–ao–chuồng 3 ao cá gần 3.000 m², vịt/gà/trâu, tổng thu trên 500 triệu đồng/năm (2018) — [baotintuc.vn 13/10/2018](https://baotintuc.vn/mo-hinh-phat-trien-kinh-te-hieu-qua-cua-nguoi-mong-huyen-tam-duong-lai-chau-post539261.html).
- `vac_atiso_sa_pa` → `mot_phan`: phần atisô được nguồn xác nhận (trồng tập trung xã Tả Phìn, phường Hàm Rồng và phường Sa Pả, ~60 ha, ~160 hộ, Traphaco Sapa bao tiêu hơn 2.500 tấn lá/năm — [baolaocai.vn 11/12/2023](https://baolaocai.vn/nong-dan-sa-pa-phan-khoi-thu-hoach-cay-atiso-post376999.html), [nongnghiepmoitruong.vn](https://nongnghiepmoitruong.vn/loai-cay-sieu-thuc-pham-o-vung-dat-sa-pa-d408160.html)); mô hình cá hồi – cá tầm tại điểm này chưa có nguồn chỉ định.
- 6 mô hình còn lại → `chua_xac_minh` (bỏ `minh_hoa`: các tên được đặt như địa danh cụ thể nhưng chưa có nguồn xác minh).

### 8.4. `customary_zones` — 7 polygon hành chính thật (thay hình chữ nhật minh họa)

- **Hình học**: ranh giới GADM 4.1 — Mường Tè (huyện), Chiềng Yên (xã), Điện Biên Đông (huyện), Chiềng Sơ (xã), Y Tý (xã), Bản Liền (xã), Mường Khương (huyện). Mọi `mo_ta` đều ghi "ranh giới vẽ theo hành chính cấp địa phương của GADM 4.1, mang tính đại diện".
- `luat_tuc_y_ty` → **`co_nguon`**, đổi tên thành "Rừng thiêng & luật tục rừng Hà Nhì Y Tý": cúng rừng ngày Thìn tháng Giêng; mỗi tuần mở cửa rừng 1 ngày chỉ lấy củi khô; phạt người thấy cháy không dập – không báo; chỉ đến dịp mở hội mới được chặt cây dựng đu. **Sửa lỗi cũ**: "Khô Già Già" là tên *lễ hội cầu mùa* của người Hà Nhì đen (cả 9 thôn ở Y Tý đều tổ chức), được công nhận Di sản văn hóa phi vật thể cấp quốc gia — không phải tên khu rừng thiêng — [baolaocai.vn 17/7/2020](https://baolaocai.vn/le-hoi-cau-mua-cua-nguoi-ha-nhi-post289399.html), [baolaocai.vn 9/5/2016](https://baolaocai.vn/bao-ve-rung-gan-voi-bao-ton-van-hoa-post257142.html).
- `luat_tuc_ban_lien` → **`co_nguon`**: quy ước "Nhà nào phun thuốc là bị phạt một bữa ăn cho cả bản và 5 triệu đồng, đồng thời bị loại khỏi nhóm sản xuất"; hữu cơ từ 2005, chứng nhận EU/USDA 9/2007; HTX Chè Bản Liền 310 thành viên, OCOP 5 sao — [sanphamvungmien.vn (Bộ Công Thương) 23/9/2025](https://sanphamvungmien.vn/san-pham-vung-mien/2025/9/che-shan-tuyet-ban-lien-tu-goc-co-thu-den-thuong-hieu-huu-co-quoc-te).
- `luat_tuc_muong_khuong` → `mot_phan`: luật tục rừng Nùng Dín ở Mường Khương (cúng rừng tháng Bảy âm lịch, 3 ngày cấm chặt cây – bổ củi, vi phạm phải mua gà/vịt/lợn làm lễ tạ lỗi) và người Mông Nậm Chảy giữ rừng gỗ nghiến — [baolaocai.vn 9/5/2016](https://baolaocai.vn/bao-ve-rung-gan-voi-bao-ton-van-hoa-post257142.html); dùng ranh giới **huyện** vì GADM không có polygon xã Mường Khương phù hợp.
- `cz1`–`cz4` → `chua_xac_minh` (nội dung giữ nguyên + ranh giới GADM; `cz4` đính [nguồn tổng quát về quyền sử dụng đất nương luân canh – Viện KHLN](https://vafs.gov.vn/vn/ve-quyen-su-dung-dat-lam-nuong-ray-cua-dong-bao-dan-toc-thieu-so-o-mien-nui/)).

### 8.5. Thay đổi code liên quan

- `WebGIS goc.tsx`: `IRRIGATION_LABELS` thêm `con`, sửa nghĩa lái/lín theo nguồn; emoji cọn 🌀; `statusNote` — thông điệp `chua_xac_minh` đổi thành "Chưa xác minh trực tiếp — cần đối chiếu thêm ở hiện trường", danh sách `nguon` hiển thị thành liên kết bấm được (`target="_blank"`).
- `LayerDataEditor.tsx`: options `loai` của irrigation thêm `con`.
- `customary_zones` giữ nguyên nhánh render (hỗ trợ ring phẳng/nested) — dữ liệu GADM ghi ring phẳng `[lng, lat]`.

### 8.6. Số liệu sau cập nhật

| Lớp | Số đối tượng | `co_nguon` | `mot_phan` | `chua_xac_minh` | `minh_hoa` |
|---|---|---|---|---|---|
| irrigation | 14 | 3 | 1 | 10 | 0 |
| vac_models | 9 | 2 | 1 | 6 | 0 |
| customary_zones | 7 | 2 | 1 | 4 | 0 |

## 9. Cập nhật vòng 2 (16/10/2026)

### 9.1. `villages` — thay 17 điểm minh họa bằng 25 bản làng thật

- **Toàn bộ 17 điểm cũ bị xóa** (10 `minh_hoa` gồm v1–v14 đặt tên không rõ địa chỉ + 7 điểm `chua_xac_minh`). Thay bằng **25 bản làng có thật, 25/25 `co_nguon`** với ít nhất 1 URL nguồn riêng cho từng bản (ubnd xã, cổng TTĐT tỉnh, Sở VHTTDL, VietnamPlus, vietnamtourism, báo địa phương…).
- Phân bố: **Lào Cai 8** (Y Tý, Dền Sáng, Bản Liền, Bản Phố, Lao Chải, Tả Van, Tả Phìn, Séo Mý Tỷ) · **Lai Châu 5** (Mường So, Bum Nưa, Bản Bo, Sin Suối Hồ, Sì Thâu Chải) · **Sơn La 6** (Chiềng Khoong, Nong Lạnh, Phiêng Ban, Bản Bon, Mường Và, Bản Áng) · **Điện Biên 6** (Mường Phăng, Che Căn, Bản Mển, Bản Ten, Na Nát, Sín Thầu) = 25.
- Trường mới: `ten_xa`, `ten_huyen`, `ten_tinh`, `ghi_chu` (ghi rõ sắp xếp hành chính 7/2025: NQ 1673 Lào Cai, NQ 1670 Lai Châu, NQ 1681 Sơn La, NQ 1661 Điện Biên — Lai Châu & Điện Biên bỏ cấp huyện), `anh`, `anh_ghichu`, `trang_thai`, `nguon`.
- **Sửa lỗi mã dân tộc**: `lao` → `ethnic_lao` ở `ban-phieng-ban`, `ban-muong-va` (khớp `slugEthnicName`); sửa gõ nhầm "được ~~选~~ làm" → "được lựa chọn làm".
- **Tọa độ**: ước lượng theo bản đồ OSM/Google — ghi rõ trong `ghi_chu`, KHÔNG phải tọa độ kiểm kê. Nội dung `mo_ta` chỉ dùng chi tiết có nguồn.
- 5 bản gắn ảnh popup (5 trong số 17 ảnh Commons): Y Tý → `yty.jpg`, Lao Chải → `sapa.jpg`, Séo Mý Tỷ → `mucangchai.jpg`, Bản Bo → `con_nuoc.jpg`, Mường So → `thai_stilt_house.jpg`; các ảnh không chụp đúng bản đó được ghi rõ "ảnh đại diện" trong `anh_ghichu`.

### 9.2. Dân tộc từng xã — tra cứu cho Sơn La (3 tỉnh còn lại gắn nhãn trung thực)

- **Sơn La (75 xã)** — thêm trường `dan_toc_trang_thai` (`co_nguon` | `mot_phan` | `du_doan`), `dan_toc_nguon` (URL[]), `dan_toc_ghi_chu`; % tính theo **mẫu cấp huyện** khi chưa có số liệu cấp xã, gắn nhãn huyện trong ghi chú:
  - `co_nguon` 5 xã (nguồn cấp xã/địa phương): Sốp Cộp (UBND xã 63,57/22,35/7,85/3,92%), Tà Xùa (Mông 99,57%), Ngọc Chiến (Thái 65% – Mông 33% – Kinh 0,25%), Mường Khiêng (Thái 98%), Mường Chiên (Thái 72%).
  - `mot_phan` 22 xã = 11 xã có số liệu riêng trong `COMMUNE_OVERRIDE` (Chiềng Cơi, Chiềng Sinh, Chiềng Sơn, Yên Châu, Hat Lot, Chiềng Khương, Phiêng Cằm, Long Hẹ, Gia Phù, Mường Lèo, Vân Hồ) + 11 xã còn lại của TP Sơn La (Tô Hiệu, Chiềng An, Thảo Nguyên), Mộc Châu và Yên Châu dùng mẫu huyện. Nguồn cấp xã tiêu biểu: Long Hẹ (bản Nong Lạnh – cọn nước Nậm É), Phiêng Cằm (Thái 75% – Mông 25%), Chiềng Khương (Thái 50% – Kinh 30% – Khơ Mú 15%), Mường Lèo (5 dân tộc), Gia Phù (5 dân tộc, bản Lá 100% Mường).
  - `du_doan` 48 xã còn lại — mẫu cấp huyện, có `dan_toc_nguon` cấp huyện: TP Sơn La (Thái ~50% — trangtraiviet), Quỳnh Nhai, Thuận Châu, Mường La, Bắc Yên (Cổng dữ liệu tỉnh), Phù Yên, Mộc Châu, Vân Hồ (Mông+Thái >90%), Yên Châu, Mai Sơn (TT2019), Sông Mã, Sốp Cộp.
  - **Lưu ý ghi rõ trong `dan_toc_ghi_chu`**: nhóm ngoài 14 dân tộc hiển thị (Kháng, Xinh Mun, La Chí, Hoa, Lào ở một số nơi) không hiển thị trong thanh % → tổng hiển thị có thể < 100% (thanh bar không bao giờ bị bóp về 100% giả tạo); nguồn/thời điểm số liệu ghi ngay trong ghi chú.
- **Lai Châu (38), Điện Biên (45), Lào Cai (99)**: KHÔNG tra cứu từng xã (ngoài phạm vi được chọn) → gắn `dan_toc_trang_thai: "du_doan"` + `dan_toc_ghi_chu` mẫu nêu rõ "% mang tính tham khảo theo mẫu cấp tỉnh/huyện, Tổng điều tra dân tộc 2019 chỉ công bố tới cấp huyện". Số liệu % cũ giữ nguyên.
- ID dân tộc额外 dùng `ethnic_lao`, `ethnic_la_ha`, `ethnic_xinh_mun`, `ethnic_khang`(không dùng) — khớp `EXTRA_ETHNIC_OPTIONS` nên hiển thị đúng màu/tên trong `getDanTocInfo`.

### 9.3. Ảnh Wikimedia Commons — tải về dự án, có ghi công

- **17/17 ảnh JPEG** tải từ Commons về `public/data/images/` (12 `dan_toc/` + 5 `dia_diem/`) — xem bảng đầy đủ tác giả/giấy phí/trang nguồn: **`public/data/images/NGUON_ANH.md`**.
- `dan_toc.json`: thêm `anh` + `anh_ghichu` cho **12/14 nhóm**. **Không có ảnh** cho Khơ Mú và La Hủ (Commons chưa có ảnh đúng — không gán ảnh nhầm).
- Ghi công hiển thị: banner ảnh dân tộc trong knowledge panel có dòng "Nguồn ảnh: …"; popup bản làng có dòng credit dưới ảnh.

### 9.4. Thay đổi code liên quan (vòng 2)

- `WebGIS goc.tsx`:
  - `LAYER_DATA_REV` 2 → **3**, `LAYER_DATA_REV_KEYS` thêm `"villages"` (ép trình duyệt bỏ bản villages đã lưu trong localStorage).
  - Thêm `villages` vào: `DEFAULT_LAYER_CATEGORIES` (nhóm "Văn hóa & Tri thức bản địa", iconOnly), `LAYER_GEOM_TYPE` ("point"), `LAYER_DISPLAY`, `DEFAULT_LAYER_SYMBOLOGY`, `featureCounts`; nhánh render `buildLayer` (circleMarker divIcon 🏘️ màu theo dân tộc, popup có ảnh + credit + `statusNote`); deps effect thêm `danTocData`, `ethnicOverrides`.
  - Helper `assetUrl()` (ghép `BASE_PATH` cho ảnh `data/images/…`, giữ nguyên http/data/blob).
  - Panel "Các dân tộc sinh sống": thêm khối trạng thái nguồn — chip `✓ Đã có nguồn` / `~ Một phần có nguồn` / `⚠ Ước tính — cần đối chiếu` / `✎ Đã chỉnh sửa cục bộ` + danh sách link `dan_toc_nguon` + `dan_toc_ghi_chu`.
  - Types: `WardProperties` + `dan_toc_trang_thai/nguon/ghi_chu`; `DanTocInfo.anh_ghichu`; `villages[]` + trường địa bàn/ảnh.
- `index.css`: style `.popup-img*`, `.ethnic-photo-credit`.

### 9.5. Số liệu sau cập nhật (vòng 2)

| Nhóm | Số đối tượng | `co_nguon` | `mot_phan` | `du_doan` | Ghi chú |
|---|---|---|---|---|---|
| villages | 25 | 25 | 0 | 0 | thay toàn bộ 17 điểm cũ |
| xa_sonla (dân tộc) | 75 xã | 5 | 22 | 48 | % theo mẫu huyện khi chưa có số liệu xã |
| xa_laichau (dân tộc) | 38 xã | 0 | 0 | 38 | % cũ giữ nguyên, gắn nhãn ước tính |
| xa_dienbien (dân tộc) | 45 xã | 0 | 0 | 45 | như trên |
| xa_laocai (dân tộc) | 99 xã | 0 | 0 | 99 | như trên |
| dan_toc (ảnh) | 14 nhóm | 12 có ảnh | — | — | Khơ Mú, La Hủ: chưa có ảnh phù hợp |



