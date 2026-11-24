# DANH SÁCH ĐIỂM TRI THỨC BẢN ĐỊA ĐÃ TÍCH HỢP TRÊN HỆ THỐNG WEBGIS

## Tọa độ đại diện và nguồn tham khảo

Tài liệu này liệt kê toàn bộ 202 đối tượng dữ liệu về tri thức bản địa đang được hệ thống WebGIS hiển thị trên bản đồ, gồm 3 lớp điểm tri thức bản địa (Tài nguyên đất – Tài nguyên nước – Tài nguyên rừng), lớp điểm cây thuốc quý tại Phù Yên và 11 vùng dược liệu dạng vùng (phụ lục). Mỗi đối tượng kèm mã điểm, lĩnh vực, đơn vị hành chính, tọa độ đại diện đã gán và số hiệu nguồn tham khảo.

- Dữ liệu lấy nguyên trạng từ các tệp: `public/data/tri_thuc_ban_dia.json` (rev 11), `public/data/phu_yen_layers.json`, `public/data/layers.json`.
- Quy ước tọa độ: WGS84, dạng số thập phân, cột trước là vĩ độ (lat), cột sau là kinh độ (lng).
- Tọa độ là **điểm đại diện trong đơn vị hành chính** (giãn nhẹ để khỏi chồng lấn giữa các điểm cùng xã), KHÔNG phải tọa độ GPS của công trình, thửa ruộng hay khu rừng cụ thể — cần khảo sát thực địa để đối chiếu.
- Trạng thái: **Có nguồn** = đã có nguồn công bố; **Cần đối chiếu** = cần khảo sát đối chiếu thực địa; **Chưa xác minh** = nguồn đã ghi nhưng chưa xác minh vị trí.
- Cột **Nguồn** hiển thị số hiệu; toàn bộ địa chỉ/citation tương ứng nằm ở mục “Danh mục nguồn tham khảo” cuối tài liệu (đánh số theo lần xuất hiện đầu tiên).

**Bảng 1. Tổng hợp số đối tượng theo lớp dữ liệu**

| Nhóm | Lớp (id) | Loại hiển thị | Số đối tượng |
|---|---|---|---|
| Canh tác & quản lý đất theo tập quán cộng đồng | `canh_tac_quan_ly_dat` | Điểm | 106 |
| Thủy lợi truyền thống & quản lý nước cộng đồng | `thuy_loi_truyen_thong` | Điểm | 43 |
| Luật tục & quy ước bảo vệ rừng cộng đồng | `luat_tuc_bao_ve_rung` | Điểm | 35 |
| Khu vực cây thuốc quý (Phù Yên) | `medicinal_plants` | Điểm | 7 |
| Khu vực cây thuốc quý (phụ lục) | `medicinal_plants` | Vùng (polygon) | 11 |
| **Tổng cộng** | | | **202** |

Phân bố trạng thái: Có nguồn = 184; Cần đối chiếu = 11; Chưa xác minh = 7. Số đơn vị hành chính có điểm: 84. Số nguồn tham khảo duy nhất: 293.

**Bảng 2. Điểm tri thức bản địa — Canh tác & quản lý đất theo tập quán cộng đồng (106 điểm)**

| STT | Mã điểm | Tên điểm | Lĩnh vực | Xã (mã) | Vĩ độ (°B) | Kinh độ (°Đ) | Trạng thái | Nguồn |
|---|---|---|---|---|---|---|---|---|
| 1 | dat-muong-tac-2-vu | Canh tác lúa nước 2 vụ trên cánh đồng Mường Tấc | Đất · ruộng lúa nước | Phù Yên (03910) | 21.26 | 104.66 | Có nguồn | 1, 2 |
| 2 | dat-nuong-mac-nhung | Cây mắc nhung (quả đắng) trên nương đất dốc — đặc sản Phù Yên | Đất · nương rẫy | Phù Yên (03910) | 21.275 | 104.63 | Có nguồn | 3 |
| 3 | dat-muong-bang-dap-doi | Canh tác trên đất đồi dốc, phiêng bãi & ruộng lúa nước bản Sóc | Đất · đồi dốc & ruộng | Mường Bang (03943) | 21.162 | 104.8 | Có nguồn | 4 |
| 4 | dat-kim-bon-chuyen-nuong | Chuyển đổi nương ngô trên đất bạc màu sang sắn và cây tếch | Đất · nương rẫy | Kim Bon (03961) | 21.092 | 104.585 | Có nguồn | 5 |
| 5 | dat-tan-phong-dong-ma | Nông lâm kết hợp chống xói mòn trên đất dốc ven hồ (thôn Đồng Mã) | Đất · nông lâm kết hợp | Tân Phong (03970) | 21.07 | 104.71 | Có nguồn | 6 |
| 6 | dat-quynh-nhai-com-nep-tan | Lúa nếp tan & nghề làm cốm Chiềng Khoang | Đất · lúa nước & đặc sản | Quỳnh Nhai (03703) | 21.612 | 103.652 | Có nguồn | 7, 8 |
| 7 | dat-muong-khieng-xen-ban | Lễ Xên bản (cúng bản) bản Mồng Nọi gắn với chu kỳ canh tác | Đất · nghi lễ mùa màng | Mường Khiêng (03757) | 21.493 | 103.862 | Có nguồn | 9 |
| 8 | dat-muong-gion-tham-canh-ruong-nuoc | Thâm canh ruộng nước trên địa hình 87% đất dốc | Đất · ruộng nước & nương | Mường Giôn (03694) | 21.772 | 103.668 | Có nguồn | 10, 11 |
| 9 | dat-ta-xua-che-shan-tuyet | Canh tác & sao chè shan tuyết cổ thụ bản Bẹ | Đất · cây đặc sản trên đồi | Tà Xùa (03868) | 21.328 | 104.447 | Có nguồn | 12, 13, 14 |
| 10 | dat-co-ma-lua-nuong | Lúa nương Mông trên đất dốc: khoảng 760 ha mỗi năm | Đất · nương rẫy | Co Mạ (03781) | 21.332 | 103.52 | Có nguồn | 15, 16 |
| 11 | dat-suoi-to-khai-hoang-ruong-bac-thang | Chuyển từ lúa nương sang khai hoang ruộng bậc thang | Đất · ruộng bậc thang | Suối Tọ (03901) | 21.342 | 104.568 | Có nguồn | 17, 18 |
| 12 | dat-suoi-to-che-suoi-khang | Chè shan tuyết cổ thụ Suối Khang & HTX liên kết | Đất · cây đặc sản trên đồi | Suối Tọ (03901) | 21.316 | 104.597 | Có nguồn | 18, 19 |
| 13 | dat-gia-phu-vua-lua-muong-tac | Vựa lúa Mường Tấc, tỏi tía vụ đông & măng tre bát độ | Đất · ruộng hàng hóa | Gia Phù (03922) | 21.206 | 104.546 | Có nguồn | 1, 20, 21 |
| 14 | dat-muong-coi-vuon-cam-huu-co | Vườn cam hữu cơ, VietGAP & du lịch canh nông | Đất · cây ăn quả hàng hóa | Mường Cơi (03907) | 21.322 | 104.717 | Có nguồn | 22, 23 |
| 15 | dat-tuong-ha-lua-2-vu-cao-trinh | Ruộng cao trình & ruộng bán ngập sau lòng hồ Hòa Bình | Đất · ruộng nước ven hồ | Tường Hạ (03958) | 21.163 | 104.668 | Có nguồn | 24 |
| 16 | dat-muong-chien-tet-xip-xi-via-trau | Tết Xíp xí: gác bừa & cúng vía trâu sau vụ cấy | Đất · nông lịch & con trâu | Mường Chiên (03688) | 21.9 | 103.575 | Có nguồn | 25, 26 |
| 17 | dat-ngoc-chien-nep-tan-canh-dong-muong-chien | Lúa nếp Tan cánh đồng Mường Chiến & lễ mừng cơm mới | Đất · lúa nếp đặc sản | Ngọc Chiến (03820) | 21.605 | 104.205 | Có nguồn | 27, 28 |
| 18 | dat-xim-vang-ruong-bac-thang-321ha | 321 ha ruộng bậc thang: từ "chọc lỗ tra hạt" sang lúa nước | Đất · khai hoang ruộng bậc thang | Xím Vàng (03862) | 21.34 | 104.31 | Có nguồn | 29, 30 |
| 19 | dat-muong-bam-dong-lua-nuong-ngo | Đồng lúa men suối Nậm Húa & nương ngô của người Thái, Mông | Đất · canh tác ven dòng thượng nguồn | Mường Bám (03760) | 21.39 | 103.37 | Có nguồn | 31, 32 |
| 20 | dat-muong-hung-le-hoi-cau-mua-chieng-cang | Lễ hội Cầu mùa bản Chiềng Cang: cúng thần rừng, thần đất & thi cấy lúa | Đất · lễ hội nông nghiệp | Mường Hung (04219) | 20.955 | 103.86 | Có nguồn | 33, 34 |
| 21 | dat-sop-cop-nep-tan-muong-va | Nếp tan Mường Và: giống lúa bản địa người Thái, Lào (OCOP) | Đất · giống lúa đặc sản | Sốp Cộp (04231) | 20.85 | 103.55 | Có nguồn | 35, 36 |
| 22 | dat-yen-chau-xoai-tron-chi-dan-dia-ly | Xoài tròn Yên Châu (muồng kẻo) — giống bản địa & chỉ dẫn địa lý | Đất · cây ăn quả bản địa | Yên Châu (04075) | 21.075 | 104.255 | Có nguồn | 37, 38 |
| 23 | dat-yen-chau-chuoi-ban-dia-nhan-hieu | Chuối Yên Châu — nhãn hiệu chứng nhận từ 91 bản | Đất · cây ăn quả & nhãn hiệu | Yên Châu (04075) | 21.105 | 104.29 | Có nguồn | 39 |
| 24 | dat-bac-yen-hong-ngai-nuong-lua-ngu | Lúa nương, ruộng bậc thang & ngô trên rẻo cao Hồng Ngài | Đất · canh tác nương ruộng | Bắc Yên (03856) | 21.19 | 104.44 | Có nguồn | 40, 41, 42 |
| 25 | dat-chieng-hac-nep-mac-deu-ocop | Nếp Mác Đươi OCOP & chuyển đổi nương ngô, sắn sang mận, xoài | Đất · cây lương thực & cây ăn quả | Chiềng Hặc (04078) | 20.94 | 104.41 | Có nguồn | 43, 44, 45 |
| 26 | dat-chieng-hac-xoai-vung-cong-nghe-cao | Vùng xoài công nghệ cao Chiềng Hặc (800 ha) | Đất · cây ăn quả hàng hóa | Chiềng Hặc (04078) | 21 | 104.47 | Có nguồn | 46, 47, 48 |
| 27 | dat-muong-la-chieng-san-cay-an-qua | Chiềng San: 500 ha xoài, 147 ha nhãn & chuyển vườn tạp | Đất · cây ăn quả thâm canh | Mường La (03808) | 21.49 | 104.13 | Có nguồn | 49 |
| 28 | dat-muong-sai-gia-tru-bo-bai-vien-ho | Chăn nuôi bãi ven hồ & vận tải thủy sau tái định cư ngập | Đất · chăn nuôi & chuyển đổi sinh kế | Mường Sại (03712) | 21.62 | 103.77 | Có nguồn | 50 |
| 29 | dat-nam-lau-ca-phe-1770ha | Cà phê Nậm Lầu: 1.770 ha trên đất nương cũ | Đất · cây công nghiệp lâu năm | Nậm Lầu (03784) | 21.33 | 103.64 | Có nguồn | 51 |
| 30 | dat-binh-thuan-che-phong-lai-700ha | Vườn chè Phổng Lái (700 ha) & nông sản bản địa | Đất · cây trồng bản địa | Bình Thuận (03724) | 21.549 | 103.5778 | Có nguồn | 52 |
| 31 | dat-huoi-mot-gau-tao-po-pao | Lễ hội Gầu Tào – Pó Pao: tạ trời đất, mừng mùa màng | Đất · lễ hội mùa màng | Huổi Một (04210) | 21.07 | 103.6 | Có nguồn | 53, 54 |
| 32 | dat-pac-nga-xen-muong-cung-dat-dai | Lễ Xên Mường: cúng thần linh cai quản đất đai, sông núi | Đất · nghi lễ cộng đồng | Pắc Ngà (03871) | 21.28 | 104.31 | Có nguồn | 55, 56, 57 |
| 33 | dat-muong-leo-chuyen-doi-nuong-thong-ma-vi | Chuyển nương sắn kém hiệu quả sang chanh leo, thông mã vĩ | Đất · chuyển đổi cấu trúc cây trồng | Mường Lèo (04240) | 20.96 | 103.36 | Có nguồn | 58, 59 |
| 34 | dat-thuan-chau-mai-da-ban-mon | Mái đá Bản Mòn - bằng chứng sử dụng đất hàng ngàn năm của cư dân Tây Bắc | Đất · lịch sử định cư | Thuận Châu (03721) | 21.4253 | 103.7075 | Có nguồn | 60, 61, 62 |
| 35 | dat-muong-bu-vai-ngot-dong-luong | Chuyển đổi đất đồi kém hiệu quả sang trồng vải ngọt (bản Đông Luông, Ta Mo) | Đất · cây ăn quả trên đất dốc | Mường Bú (03847) | 21.39 | 104.04 | Có nguồn | 63, 64 |
| 36 | dat-muong-bu-vung-cay-an-qua-3400ha | Vùng cây ăn quả3.400 ha & chuỗi Musa Green dưới chân đèo Cao Pha | Đất · cây ăn quả hàng hóa | Mường Bú (03847) | 21.41 | 104.07 | Có nguồn | 65, 66 |
| 37 | dat-chieng-sai-mia-nguyen-lieu | Vùng mía nguyên liệu liên kết với Nhà máy Mía đường Sơn La (Co Muồng, Nà Dòn) | Đất · cây công nghiệp | Chiềng Sại (03892) | 21.06 | 104.47 | Có nguồn | 67, 68, 69 |
| 38 | dat-chieng-sai-xoai-ban-dia-tai-canh | Tái canh, ghép cải tạo xoài bản địa & tưới nhỏ giọt bản Nà Dòn | Đất · cây ăn quả & nước tưới | Chiềng Sại (03892) | 21.08 | 104.5 | Có nguồn | 70, 71, 72 |
| 39 | dat-long-phieng-nhan-cnc-htx-phuong-nam | Vùng nhãn công nghệ cao HTX Phương Nam -303 ha chín muộn xuất khẩu | Đất · nhãn ứng dụng CNC | Lóng Phiêng (04096) | 20.89 | 104.39 | Có nguồn | 73, 74 |
| 40 | dat-long-phieng-chuyen-doi-nuong-vuon-tap | Chuyển đổi nương ngô, ghép cải tạo vườn tạp sang1.590 ha cây ăn quả | Đất · chuyển đổi cấu trúc | Lóng Phiêng (04096) | 20.86 | 104.41 | Có nguồn | 75, 76 |
| 41 | dat-song-ma-na-nghiu-nep-tan-do | Lúa nếp tan đỏ Nà Nghịu &4 nghi lễ cúng cơm mới | Đất · lúa nếp & phong tục | Sông Mã (04168) | 21.1 | 103.74 | Có nguồn | 77, 78, 79 |
| 42 | dat-song-ma-nhan-long-me-bon | Nhãn lồng Nà Nghịu từ1960 & HTX An Thịnh bản Mé Bon | Đất · cây ăn quả truyền thống | Sông Mã (04168) | 21.07 | 103.76 | Có nguồn | 80, 81 |
| 43 | dat-long-he-sa-nhan-nong-lam | Nông lâm kết hợp trên đất dốc - sa nhân, cây ăn quả & thâm canh ngô | Đất · nông lâm kết hợp | Long Hẹ (03763) | 21.4381 | 103.514 | Có nguồn | 82, 83 |
| 44 | dat-muong-e-mac-khen-cay-cong-nghiep | Mắc khén OCOP3 sao, cà phê & chè trên đất dốc Mường É | Đất · cây công nghiệp & dược liệu | Mường É (03727) | 21.5 | 103.56 | Có nguồn | 84, 85 |
| 45 | rung-muong-e-dan-may-tre-ban-lua | Đan mây tre bản Lùa - chọn cây bánh tẻ từ rừng, đồi quanh nhà | Rừng · lâm sản ngoài gỗ | Mường É (03727) | 21.52 | 103.54 | Có nguồn | 86, 87 |
| 46 | dat-muoi-noi-nep-tan-lanh-phuc-trang | Bảo tồn giống lúa nếp tan lanh bản địa - chỉ còn3 ha trên54 ha ruộng | Đất · giống lúa bản địa | Muổi Nọi (03799) | 21.3 | 103.79 | Có nguồn | 88, 89 |
| 47 | dat-chieng-hoa-thao-qua-te-ch-duoi-tan | Thảo quả dưới tán rừng & cây tếch - chuyển nương sang lâm nghiệp | Đất · nông lâm kết hợp | Chiềng Hoa (03850) | 21.46 | 104.2 | Có nguồn | 90, 91, 92 |
| 48 | dat-ta-khoa-chuyen-doi-dat-doc-song-da | Chuyển đất dốc ven sông Đà bạc màu sang cây ăn quả & lâm nghiệp chống sạt lở | Đất · chống xói mòn ven sông | Tạ Khoa (03880) | 21.17 | 104.34 | Có nguồn | 93, 94, 95 |
| 49 | dat-chieng-son-che-shan-tuyet-chieu-ve | Vùng chè Shan Tuyết Chiềng Ve -340 ha & chuỗi OCOP mận, xoài sấy dẻo | Đất · chè & cây ăn quả | Chiềng Sơn (03985) | 20.74 | 104.65 | Có nguồn | 96, 97 |
| 50 | dat-tan-yen-che-ngo-sinh-khoi-bo-sua | Đồi chè VietGAP, ngô sinh khối &1.500 ha cây ăn quả cho bò sữa Mộc Châu | Đất · nông nghiệp hàng hóa | Tân Yên (03997) | 20.98 | 104.61 | Có nguồn | 98, 99, 100 |
| 51 | dat-tan-yen-nha-luoi-tu-dong | Nhà lưới tưới tự động - mô hình cà chua1 tỷ đồng của tiểu khu12 | Đất · canh tác nhà lưới | Tân Yên (03997) | 20.96 | 104.64 | Có nguồn | 100, 101 |
| 52 | dat-doan-ket-ngo-sinh-khoi-bo-sua | 9.700 ha nông nghiệp & ngô sinh khối thức ăn bò sữa Mộc Châu Milk | Đất · nông nghiệp cao nguyên | Đoàn Kết (04000) | 20.97 | 104.74 | Có nguồn | 102, 103 |
| 53 | dat-son-la-me-lech-na-dai-son | HTX Mé Lếch -200 ha na VietGAP-hữu cơ, na sầu riêng ghép, tưới app | Đất · cây ăn quả thâm canh | Mai Sơn (04105) | 21.15 | 104.14 | Có nguồn | 104, 105, 106 |
| 54 | dat-muong-bang-ban-bo-ruong-ngot | Bản Bó chuyển100% ruộng xuân sang ngô ngọt - ngô bóng2 vụ/năm | Đất · chuyển đổi ruộng | Chiềng Mung (04123) | 21.26 | 104.03 | Có nguồn | 107, 108 |
| 55 | dat-muong-bon-rung-thong-mia-bao-tieu | Bản Rừng Thông -22 ha mía bao tiêu,50 ha ngô kỹ thuật & xoài Đài Loan | Đất · canh tác hàng hóa | Chiềng Mung (04123) | 21.28 | 104.02 | Có nguồn | 109 |
| 56 | dat-chieng-mai-ca-phe-huu-co-co-sau | Cà phê hữu cơ Co Sâu - liên kết Minh Tiến,3.790 ha cà phê chủ lực | Đất · cà phê hàng hóa | Chiềng Mai (04132) | 21.18 | 103.98 | Có nguồn | 110, 111, 112 |
| 57 | dat-muong-chanh-cam-buoi-tuoi-nho-giot | Cam Vinh, bưởi & tưới nhỏ giọt Israel trên đất đồi Mường Chanh | Đất · chuyển đổi cây ăn quả | Mường Chanh (04117) | 21.21 | 103.87 | Có nguồn | 113, 114 |
| 58 | dat-na-bo-thanh-long-ngoc-hoang | Thanh long ruột đỏ Nà Bó - HTX Ngọc Hoàng300 ha xuất khẩu châu Âu | Đất · thanh long xuất khẩu | Tà Hộc (04136) | 21.23 | 104.18 | Có nguồn | 105, 115, 116 |
| 59 | dat-phieng-cam-chuyen-doi-nuong-che-ca-phe-mac-ca | Chuyển nương ngô-lúa sang cà phê, chè VietGAP & mắc ca xen - giảm nghèo63%→34% | Đất · chuyển đổi đất dốc | Phiêng Cằm (04144) | 21.14 | 103.84 | Có nguồn | 117, 118, 119 |
| 60 | dat-phieng-pan-thuoc-nam-xinh-mun | Cây thuốc nam người Xinh Mun & canh tác ngô-mía-cam trên vùng biên giới | Đất · dược liệu & cây hàng hóa | Phiêng Pằn (04159) | 21.06 | 104.05 | Có nguồn | 120, 121, 110 |
| 61 | dat-chieu-sung-lien-ket-don-hang | Sản xuất theo đơn hàng -160 ha ngô ngọt, chanh leo bao giá7.000 đ/kg | Đất · canh tác theo hợp đồng bao tiêu | Chiềng Sung (04108) | 21.3 | 104.13 | Có nguồn | 122 |
| 62 | dat-muong-lam-nhan-xoai-vuon-ao-chuong | Chuyển đổi nhãn-xoài-quế & mô hình vườn-ao-chuồng Mường Lầm | Đất · chuyển đổi cây trồng | Mường Lầm (04183) | 21.15 | 103.5 | Có nguồn | 123, 124 |
| 63 | dat-muong-lam-ong-mat-vuon-nhan | Nuôi ong lấy mật trên vườn nhãn -20 đàn,30 lít/đàn của bản Phèn Sàng | Đất · chăn nuôi ong vườn | Mường Lầm (04183) | 21.1394 | 103.5266 | Có nguồn | 124 |
| 64 | dat-nam-ty-ca-phe-dat-doc-muon | Nậm Ty -1.271 ha cà phê, bản Mòn chuyển125 ha ngô-sắn lên đất dốc | Đất · cà phê chuyển đổi | Nậm Ty (04186) | 21.22 | 103.66 | Có nguồn | 125, 126 |
| 65 | dat-chieng-so-nhan-tuoi-giot | Chiềng Sơ -900 ha nhãn (600 ha), tưới nhỏ giọt-phun sương &4 HTX | Đất · nhãn thâm canh | Chiềng Sơ (04195) | 21.12 | 103.59 | Có nguồn | 127, 128 |
| 66 | dat-chieu-khoong-nhan-chin-som-long-nhan | HTX Bảo Minh -36 ha nhãn chín sớm rải vụ,50 tấn/ngày chế biến long nhãn XK | Đất · nhãn rải vụ & chế biến | Chiềng Khoong (04204) | 20.96 | 103.77 | Có nguồn | 127, 129, 130 |
| 67 | dat-chieu-khuong-nhan-huu-co-bac-thang | Chuyển đất dốc sang nhãn hữu cơ - "cách mạng" bậc thang, IPM của Chiềng Khương | Đất · phục hồi đất dốc | Chiềng Khương (04222) | 20.95 | 103.99 | Có nguồn | 131, 132, 133 |
| 68 | dat-chieu-khuong-ga-de-trung-cnc | Nuôi gà đẻ trứng CNC bản Thống Nhất -4.000 con,4.300 quả/ngày | Đất · chăn nuôi ứng dụng CNC | Chiềng Khương (04222) | 20.97 | 103.96 | Có nguồn | 133, 132 |
| 69 | dat-muong-lan-chuyen-doi-bien-gioi | Mường Lạn2025 - chuyển80 ha đất kém hiệu quả,370 ha cây ăn quả &57 ha cà phê | Đất · chuyển đổi vùng biên | Mường Lạn (04246) | 20.77 | 103.71 | Có nguồn | 134, 135, 136 |
| 70 | dat-yen-son-man-hau-dau-tay | Yên Sơn - mận hậu Kim Sơn I (50 ha tưới nhỏ giọt) & dâu tây Chiềng Hưng | Đất · cây ăn quả vùng cao | Yên Sơn (04087) | 21 | 104.19 | Có nguồn | 137, 138, 139 |
| 71 | dat-yen-son-thu-doc-lam-nghiep | Sinh kế vùng cao Xinh Mun-Mông - cây dược liệu & chăn nuôi theo CTMTQG | Đất · dược liệu & chăn nuôi | Yên Sơn (04087) | 21.02 | 104.16 | Có nguồn | 139, 140 |
| 72 | dat-phieng-khoai-mận-ruby | Mận Ruby Phiêng Khoài -2.500 ha, vùng mận CNC đầu tiên của tỉnh,35.000 tấn/2025 | Đất · mận hậu chuyên canh | Phiêng Khoài (04099) | 20.95 | 104.28 | Có nguồn | 141, 142 |
| 73 | dat-to-hieu-rau-sach-26-3 | Nông nghiệp đô thị - HTX Nông nghiệp xanh26/3 & Cửa hàng-Bếp xanh | Đất · rau sạch đô thị | Tô Hiệu (03646) | 21.3217 | 103.9398 | Có nguồn | 143, 144 |
| 74 | dat-chieng-an-ca-phe-man-hau | Nông nghiệp hơn80% kinh tế -1.700 ha cà phê &1.200 ha mận hậu Chiềng An | Đất · cà phê-mận hàng hóa | Chiềng An (03664) | 21.38 | 103.9 | Có nguồn | 145, 146 |
| 75 | dat-chieng-an-mang-tay-ban-sang | Măng tây trên đất ngô - HTX Nông nghiệp hữu cơ Bản Sẳng | Đất · rau hàng hóa ngoại ô | Chiềng An (03664) | 21.36 | 103.87 | Có nguồn | 147 |
| 76 | dat-chieng-coi-ca-phe-bich-thao | HTX cà phê Bích Thao -60 ha THA1 hữu cơ, OCOP5 sao, giải vàng cà phê thế giới2026 | Đất · cà phê đặc sản | Chiềng Cơi (03670) | 21.31 | 103.87 | Có nguồn | 148, 149 |
| 77 | dat-chieng-sinh-duoc-khanh-cnc | Công ty Duy Khánh -10 ha cây ăn quả tổng hợp CNC &1.692 ha cà phê Chiềng Sinh | Đất · nông nghiệp CNC ven đô | Chiềng Sinh (03679) | 21.3 | 103.98 | Có nguồn | 150 |
| 78 | dat-chieng-sinh-chuoi-tieu-hong-muong | Chuối tiêu hồng bản Muông -90 hộ,11,7 ha trên đất ngô dốc | Đất · chuyển đổi chuối | Chiềng Sinh (03679) | 21.33 | 103.95 | Có nguồn | 147 |
| 79 | dat-bo-sinh-chuyen-doi-nuong-nhan | Bó Sinh chuyển69 ha nương sang nhãn-xoài-bưởi theo Kết luận121 & Doveco bao ngô ngọt | Đất · chuyển đổi đất dốc | Bó Sinh (04171) | 21.24 | 103.48 | Có nguồn | 151, 152, 153 |
| 80 | dat-bo-sinh-pa-ca-nuong-lua | Bản Pá Ca - nương lúa-ngô-sắn xen1,3 ha cà phê, chuyển đổi hàng hóa | Đất · canh tác nương bản Mông | Bó Sinh (04171) | 21.26 | 103.45 | Có nguồn | 154, 151 |
| 81 | dat-long-sap-cam-canh-ban-bo-sap | Cam canh Lóng Sập -610 ha cây ăn quả, container vào tận bản thu mua | Đất · cam canh biên giới | Lóng Sập (04045) | 20.79 | 104.5 | Có nguồn | 155, 156 |
| 82 | dat-to-mua-che-shan-tuyet-hang-hoa | Chè shan tuyết Tô Múa -600+ ha,80% hộ trồng,15.000 tấn/năm | Đất · chè shan tuyết | Tô Múa (04018) | 20.91 | 104.82 | Có nguồn | 157, 158, 159 |
| 83 | dat-van-ho-cam-huu-co-pa-cop | HTX Nông trại hữu cơ Vân Hồ -16 ha cam đường canh, nấm sinh học, VinEco-BigC | Đất · cam hữu cơ | Vân Hồ (04048) | 20.79 | 104.86 | Có nguồn | 160, 161 |
| 84 | dat-van-ho-ngo-sinh-khoi-bo-sua | Ngô sinh khối chuỗi bò sữa -1.200 ha Vân Hồ & trang trại Sao Đỏ2 vụ/năm | Đất · ngô sinh khối thức ăn | Vân Hồ (04048) | 20.81 | 104.85 | Có nguồn | 162, 161 |
| 85 | dat-muong-sang-rau-cay-an-qua-hang-hoa | HTX rau quả Lộc Thành & chuyển đổi cây ăn quả - Mường Sang | Đất · rau-cây ăn quả hàng hóa | Mộc Châu (03980) | 20.83 | 104.54 | Có nguồn | 163, 164 |
| 86 | dat-muong-sang-nong-nghiep-du-lich-so-luon | Nông nghiệp gắn du lịch - bản Sò Lườn & trên50 hộ làm du lịch cộng đồng | Đất · nông-du lịch | Mộc Châu (03980) | 20.87 | 104.6 | Có nguồn | 165 |
| 87 | dat-dong-sang-rau-vietgap-htx-tu-nhien | HTX rau an toàn Tự Nhiên & vùng rau CNC - Đông Sang | Đất · rau VietGAP-hữu cơ | Mộc Sơn (03979) | 20.79 | 104.67 | Có nguồn | 166, 167 |
| 88 | dat-dong-sang-dau-tay-ocop-hon-90ha | Dâu tây Đông Sang - hơn90 ha,600 hộ, OCOP3 sao & du lịch hái dâu | Đất · dâu tây OCOP | Mộc Sơn (03979) | 20.82 | 104.63 | Có nguồn | 168, 167 |
| 89 | dat-thon-nguyen-cay-an-qua-che-oc | Trung tâm nông nghiệp Mộc Châu -2.276 ha cây ăn quả,515 ha chè,22 OCOP Thảo Nguyên | Đất · cây ăn quả-chè-OCOP | Thảo Nguyên (03982) | 20.83 | 104.66 | Có nguồn | 169 |
| 90 | dat-thon-nguyen-htx-nong-san-sach-quyet-thanh | HTX Nông sản sạch Mộc Châu & HTX Quyết Thanh sấy OCOP - Thảo Nguyên | Đất · cây ăn quả-chế biến | Thảo Nguyên (03982) | 20.8664 | 104.7023 | Có nguồn | 169 |
| 91 | dat-song-khua-lua-te-rau-sri | Lúa SRI & kênh mương -130 ha lúa mùa Song Khủa | Đất · lúa hàng hóa | Song Khủa (04006) | 20.89 | 104.88 | Có nguồn | 170 |
| 92 | dat-song-khua-gao-te-rau-htx-gao | Gạo tẻ râu đặc sản - HTX Gạo Song Khủa & dự án GREAT | Đất · gạo đặc sản | Song Khủa (04006) | 20.92 | 104.93 | Có nguồn | 171 |
| 93 | dat-binh-minh-htx-19-5-farmstay | HTX Nông nghiệp19/5 -110 ha cây ăn quả & farmstay8 ha Chiềng Đi | Đất · nông-du lịch farmstay | Vân Sơn (04033) | 20.86 | 104.71 | Có nguồn | 172, 173 |
| 94 | dat-binh-minh-dau-tay-gia-han-vietgap | Vườn dâu tây Gia Hân -1,5 ha VietGAP,800 khách cuối tuần bán tại vườn | Đất · dâu tây trải nghiệm | Vân Sơn (04033) | 20.89 | 104.73 | Có nguồn | 174, 175 |
| 95 | dat-xuan-nha-nong-lam-ket-hop-ban-thin | Nông lâm kết hợp bản Thín - HTX Nông nghiệp xanh Trường An &316 ha cây ăn quả | Đất · nông lâm kết hợp | Xuân Nha (04057) | 20.64 | 104.72 | Có nguồn | 176, 177 |
| 96 | dat-xuan-nha-mang-bat-do-xuat-khau | Măng tre bát độ - hơn200 ha lớn nhất vùng & HTX Măng sạch xuất khẩu | Đất · cây công nghiệp-xuất khẩu | Xuân Nha (04057) | 20.68 | 104.77 | Có nguồn | 177 |
| 97 | vac1 | Mô hình VACR bản Phiêng Ban | Đất · VAC/VACR | Bắc Yên (03856) | 21.242445 | 104.403079 | Có nguồn | 178, 179 |
| 98 | vac2 | Trang trại sinh thái Nậm Pồ | Đất · VAC/VACR | Mường Chà (03166) | 21.92 | 102.85 | Có nguồn | 180 |
| 99 | vac4 | Mô hình thảo quả-ong-rừng | Đất · VAC/VACR | Mường Mùn (03268) | 21.75 | 103.4 | Có nguồn | 181, 182 |
| 100 | vac_ban_ho | Mô hình ruộng bậc thang – ao – vịt Bản Hồ | Đất · VAC/VACR | Bản Hồ (03046) | 22.282 | 103.966 | Có nguồn | 183, 184 |
| 101 | vac_thao_qua_bat_xat | Mô hình thảo quả – ong rừng Bát Xát | Đất · VAC/VACR | Bát Xát (02683) | 22.532 | 103.853 | Có nguồn | 185, 186 |
| 102 | vac_atiso_sa_pa | Vườn Atisô – cá hồi Sa Pa | Đất · VAC/VACR | Sa Pa (03006) | 22.339 | 103.844 | Có nguồn | 187, 188, 189 |
| 103 | vac_ta_lai | Mô hình VAC Đinh Văn Màu – Tà Lọt | Đất · VAC/VACR | Đoàn Kết (04000) | 20.96 | 104.68078 | Có nguồn | 190 |
| 104 | vac_kun_ha | Mô hình VAC + thảo quả Khun Há (Hàng A Cơ) | Đất · VAC/VACR | Khun Há (03430) | 22.2331 | 103.59963 | Có nguồn | 191 |
| 105 | phu-yen-quang-huy-organic-rice | Mô hình lúa hữu cơ/liên kết cánh đồng Quang Huy | Đất · tri thức Phù Yên | Phù Yên (03910) | 21.2583973 | 104.6435277 | Có nguồn | 192, 193, 194 |
| 106 | phu-yen-thai-knowledge | Tri thức địa phương của người Thái · Phù Yên | Đất · tri thức Phù Yên | Phù Yên (03910) | 21.2598973 | 104.6450277 | Có nguồn | 195, 196, 194, 197 |

**Bảng 3. Điểm tri thức bản địa — Thủy lợi truyền thống & quản lý nước cộng đồng (43 điểm)**

| STT | Mã điểm | Tên điểm | Lĩnh vực | Xã (mã) | Vĩ độ (°B) | Kinh độ (°Đ) | Trạng thái | Nguồn |
|---|---|---|---|---|---|---|---|---|
| 107 | nuoc-suo-tac-tuoi-muong-tac | Suối Tấc & kênh mương tưới cánh đồng Mường Tấc | Nước · tưới tiêu ruộng | Phù Yên (03910) | 21.25 | 104.67 | Có nguồn | 1, 198 |
| 108 | nuoc-muong-bang-chan-muong | Kiên cố hóa kênh mương nội đồng bằng quỹ dịch vụ môi trường rừng (bản Sóc) | Nước · kênh mương cộng đồng | Mường Bang (03943) | 21.175 | 104.818 | Có nguồn | 4 |
| 109 | nuoc-muong-bang-con-nuoc | Cọn nước ven suối Nguộn (bản Nguồn) | Nước · cọn nước | Mường Bang (03943) | 21.168 | 104.83 | Cần đối chiếu | 199, 200 |
| 110 | nuoc-kim-bon-suo-dat-ten-ban | Suối đặt tên bản & dẫn nước tưới nương (Suối On, Suối Lẹt, Suối Vạch…) | Nước · suối & tưới nương | Kim Bon (03961) | 21.104 | 104.605 | Cần đối chiếu | 201, 5 |
| 111 | nuoc-tan-phong-tu-ruong-den-ho | Từ ruộng lúa tới mặt hồ: mưu sinh ven sông Đà | Nước · mặt hồ & sông Đà | Tân Phong (03970) | 21.078 | 104.735 | Có nguồn | 202, 203 |
| 112 | nuoc-gia-phu-thuy-lieu-suoi-tac | Suối Tấc & hệ thống thủy lợi nhỏ phục vụ vụ đông | Nước · tưới tiêu & thủy lợi cộng đồng | Gia Phù (03922) | 21.183 | 104.58 | Có nguồn | 1, 20, 204 |
| 113 | nuoc-quynh-nhai-ca-long-ho | Nuôi cá lồng trên lòng hồ thủy điện Sơn La (bản Bung Én, Pó Ban) | Nước · mặt hồ & sinh kế | Quỳnh Nhai (03703) | 21.65 | 103.75 | Có nguồn | 205, 206, 207 |
| 114 | nuoc-muong-khieng-liet-te-ca-long | Sinh kế mặt hồ ở Liệp Tè: cá lồng & đánh bắt sau tái định cư | Nước · mặt hồ & sinh kế | Mường Khiêng (03757) | 21.462 | 103.903 | Có nguồn | 208, 209 |
| 115 | nuoc-muong-khieng-lang-pang-a-cau-mua | Lễ Láng Pang A: múa cầu mưa & cây nêu "Xặng pang" của người La Ha | Nước · nghi lễ cầu nước | Mường Khiêng (03757) | 21.482 | 103.885 | Có nguồn | 210 |
| 116 | nuoc-muong-gion-suoi-nam-gion | Hệ thống suối Nậm Giôn, Nậm Xanh & mương phai dẫn nước | Nước · suối & mương phai | Mường Giôn (03694) | 21.748 | 103.703 | Cần đối chiếu | 211, 200 |
| 117 | nuoc-co-ma-nguon-nuoc-khan-hiem | Nguồn nước khan hiếm — ràng buộc quyết định làm lúa nương | Nước · nguồn nước sinh hoạt & mưa | Co Mạ (03781) | 21.31 | 103.55 | Có nguồn | 15 |
| 118 | nuoc-muong-coi-ho-suoi-chieu | Hồ Suối Chiếu — thủy lợi & sinh kế ven hồ | Nước · hồ thủy lợi & mặt nước | Mường Cơi (03907) | 21.296 | 104.749 | Có nguồn | 22, 23 |
| 119 | nuoc-tuong-ha-cho-pho-ben-song | Chợ phiên bên sông Tấc & mưu sinh trên lòng hồ | Nước · đường thủy & mặt hồ | Tường Hạ (03958) | 21.146 | 104.702 | Có nguồn | 212, 24 |
| 120 | nuoc-muong-chien-nam-chien-khoang-nong | Suối Nặm Chiên & khoáng nóng bản Bon | Nước · suối khoáng & sinh kế | Mường Chiên (03688) | 21.93 | 103.61 | Có nguồn | 213, 214 |
| 121 | nuoc-ngoc-chien-khoang-nong-luot-dot | Suối khoáng nóng bản Lướt, Đớt & mó nước Khau Vai | Nước · khoáng nóng & tắm cộng đồng | Ngọc Chiến (03820) | 21.63 | 104.235 | Có nguồn | 27, 215 |
| 122 | nuoc-xim-vang-muong-nuoc-dan-ruong | Mương dẫn nước đầu nguồn & thủy lợi bản cho ruộng bậc thang | Nước · dẫn nước & thủy lợi cộng đồng | Xím Vàng (03862) | 21.335 | 104.345 | Có nguồn | 216, 217 |
| 123 | nuoc-muong-bam-nam-hua-dau-nguon-song-ma | Nậm Húa — "suối đầu nguồn" của dòng sông Mã | Nước · dòng sông & thủy điện | Mường Bám (03760) | 21.4 | 103.405 | Có nguồn | 218, 32 |
| 124 | nuoc-muong-hung-dua-thuyen-song-ma | Hội đua thuyền trên sông Mã (lễ hội truyền thống Mường Hung) | Nước · sông & lễ hội đường thủy | Mường Hung (04219) | 20.985 | 103.895 | Có nguồn | 219, 220 |
| 125 | nuoc-sop-cop-nam-ca-dong-tong-na | Suối Nậm Ca & cánh đồng Tông Na Coỏng Mương quanh bản Mường Và | Nước · suối & ao hồ cộng đồng | Sốp Cộp (04231) | 20.875 | 103.59 | Có nguồn | 221, 222 |
| 126 | nuoc-chieng-hac-ho-muong-lum-18ha | Hồ Mường Lựm (Noong Luông): hồ treo trên núi ~18 ha | Nước · hồ treo & nguồn nước bản | Chiềng Hặc (04078) | 20.9536 | 104.3704 | Có nguồn | 223, 44, 224 |
| 127 | nuoc-muong-la-ca-long-muong-trai | Nuôi cá lồng lòng hồ Mường Trai (trên200 lồng) | Nước · nuôi trồng thủy sản lòng hồ | Mường La (03808) | 21.55 | 103.93 | Có nguồn | 225, 226, 227 |
| 128 | nuoc-muong-sai-ca-long-htx | Cá lồng HTX ven lòng hồ (5 HTX,390 lồng) | Nước · nuôi cá lồng cộng đồng | Mường Sại (03712) | 21.565 | 103.715 | Có nguồn | 50 |
| 129 | nuoc-huoi-mot-cau-mua-xen-ban | Xên bản, xên mường & cầu mưa của người Thái, Khơ Mú | Nước · nghi lễ cầu mưa | Huổi Một (04210) | 20.99 | 103.69 | Có nguồn | 54 |
| 130 | nuoc-chieng-la-mach-nuoc-ngam-ao-ca | Mạch nước ngầm, ao cá trắm & hun khói mắc khén OCOP3 sao | Nước · ao cá & mạch nước | Chiềng La (03754) | 21.46 | 103.76 | Có nguồn | 228, 229, 230 |
| 131 | nuoc-pung-banh-nuoi-ca-ao-suan-nam-ban | Nuôi cá ao tận dụng suối Nậm Ban -126 ha,210 tấn/năm | Nước · ao cá & mương dẫn | Púng Bánh (04228) | 20.98 | 103.46 | Có nguồn | 231, 232 |
| 132 | nuoc-muoi-noi-kenh-muong-noi-dong | Kênh mương nội đồng kiên cố hóa11 km - tưới54 ha lúa2 vụ | Nước · thủy lợi nội đồng | Muổi Nọi (03799) | 21.31 | 103.79 | Có nguồn | 233, 89 |
| 133 | nuoc-chieng-lao-nuoi-ca-long-ho | Nuôi cá lồng lòng hồ thủy điện Sơn La -322 lồng, gần900 tấn/năm | Nước · cá lồng trên lòng hồ | Chiềng Lao (03814) | 21.63 | 103.93 | Có nguồn | 234, 235, 236 |
| 134 | nuoc-ta-khoa-ca-long-ho-song-da | Nuôi cá lồng hồ sông Đà & ruộng bán ngập ven suối Nhạn | Nước · hồ thủy điện & ruộng bán ngập | Tạ Khoa (03880) | 21.15 | 104.37 | Có nguồn | 93, 95, 237 |
| 135 | nuoc-doan-ket-ca-tam-va-long-ca | Nuôi cá tầm10.000 con &126 lồng cá trên lòng hồ Hòa Bình | Nước · cá tầm & cá lồng | Đoàn Kết (04000) | 20.95 | 104.71 | Có nguồn | 102, 103 |
| 136 | nuoc-chieng-sung-ho-nong-la-ban-ta-dung | Hồ Nong La & bể nước NTM - bản Tà Đứng bơm tưới vườn ăn quả | Nước · hồ chứa & nước sinh hoạt | Chiềng Sung (04108) | 21.32 | 104.11 | Có nguồn | 238, 239 |
| 137 | nuoc-chieng-mai-3-ho-thuy-le | Hệ thống3 hồ chứa & hơn80% kênh mương kiên cố hóa - nền tảng canh tác Chiềng Mai | Nước · thủy lợi | Chiềng Mai (04132) | 21.2 | 103.96 | Có nguồn | 112 |
| 138 | nuoc-nam-ty-ke-mo-song-ma | Khe-mó nước ven sông Mã giữ ruộng2 vụ bản Nà Tòng | Nước · khe mó & sông | Nậm Ty (04186) | 21.21 | 103.68 | Có nguồn | 125, 240 |
| 139 | nuoc-chieu-khoong-thuy-le-na-dong | Thủy lợi Nà Đông & kênh Cang Kiểng - nền tảng ruộng vườn Chiềng Khoong | Nước · thủy lợi | Chiềng Khoong (04204) | 20.94 | 103.75 | Có nguồn | 130 |
| 140 | nuoc-chieng-coi-suong-nam-la-khoang-nong | Suối Nặm La & khoáng nóng bản Mòng - tắm suối-ẩm thực50.000 lượt khách/năm | Nước · suối & khoáng nóng | Chiềng Cơi (03670) | 21.32 | 103.85 | Có nguồn | 241 |
| 141 | nuoc-xuan-nha-ca-dam-xanh | Nuôi cá dầm xanh - hơn500 hộ &17,4 ha ao Xuân Nha | Nước · thủy sản | Xuân Nha (04057) | 20.66 | 104.75 | Có nguồn | 177, 176 |
| 142 | ir1 | Phai Nậm Rốm | Nước · Phai (đập) | Thanh Nưa (03328) | 21.42 | 103.02 | Có nguồn | 242 |
| 143 | ir6 | Phai Mường Lay | Nước · Phai (đập) | Nậm Hàng (03434) | 22.07 | 102.99 | Có nguồn | 243, 244 |
| 144 | lin_y_ty | Lịn Hà Nhì Y Tý | Nước · Lịn (phân phối nước vào ruộng) | Dền Sáng (02707) | 22.605 | 103.625 | Có nguồn | 243, 245, 246 |
| 145 | con_nam_e_long_he | Cọn nước Nặm É – Long Hẹ | Nước · Cọn (guồng nước) | Long Hẹ (03763) | 21.41545 | 103.5064 | Có nguồn | 243, 244 |
| 146 | muong_chieng_khoong | Mương thủy lợi Chiềng Khoong | Nước · Mương·Lái (kênh, máng dẫn) | Chiềng Khoong (04204) | 21.01769 | 103.80087 | Có nguồn | 247 |
| 147 | muang_fai_yen_chau | Muang-fai Chiềng Khôi | Nước · Mương·Lái (kênh, máng dẫn) | Yên Châu (04075) | 21.00937 | 104.31615 | Có nguồn | 248 |
| 148 | phu-yen-huy-tan-traditional-irrigation | Thủy lợi nội đồng khu vực Huy Tân | Nước · Mương·Phai | Phù Yên (03910) | 21.2652692 | 104.6527218 | Cần đối chiếu | 249, 196 |
| 149 | phu-yen-suoi-tac-con-waterwheel | Cọn nước Suối Tấc | Nước · Cọn (guồng nước) | Phù Yên (03910) | 21.2583973 | 104.6435277 | Cần đối chiếu | 250, 196, 194 |

**Bảng 4. Điểm tri thức bản địa — Luật tục & quy ước bảo vệ rừng cộng đồng (35 điểm)**

| STT | Mã điểm | Tên điểm | Lĩnh vực | Xã (mã) | Vĩ độ (°B) | Kinh độ (°Đ) | Trạng thái | Nguồn |
|---|---|---|---|---|---|---|---|---|
| 150 | rung-phu-yen-mo-nuoc | Rừng Mó Nước & luật tục bảo vệ nguồn nước của người Thái | Rừng · luật tục & rừng đầu nguồn | Phù Yên (03910) | 21.28 | 104.655 | Cần đối chiếu | 251, 252 |
| 151 | rung-muong-bang-dvmt | Chăm sóc trên 27.000 ha rừng & chi trả dịch vụ môi trường rừng cho bản | Rừng · dịch vụ môi trường rừng | Mường Bang (03943) | 21.18 | 104.795 | Có nguồn | 253, 4 |
| 152 | rung-kim-bon-te-ch-keo | Trồng cây tếch, keo phủ đất đồi trọc trên đất dốc | Rừng · trồng rừng trên đất đồi | Kim Bon (03961) | 21.09 | 104.61 | Có nguồn | 5 |
| 153 | rung-tan-phong-khoanh-nuoi | Khoanh nuôi bảo vệ 1.230 ha rừng, hơn 500 triệu đồng DVMT/năm | Rừng · khoanh nuôi & dịch vụ môi trường | Tân Phong (03970) | 21.06 | 104.74 | Có nguồn | 203, 6 |
| 154 | rung-quynh-nhai-le-goi-dau | Nghi lễ Gội đầu (Lúng Ta) & tín ngưỡng thần Núi – thần Sông | Rừng · tín ngưỡng bảo vệ rừng thiêng | Quỳnh Nhai (03703) | 21.637 | 103.67 | Cần đối chiếu | 254, 255 |
| 155 | rung-muong-gion-sa-nhan-tan-rung | Trồng sa nhân dưới tán rừng & khoanh nuôi bảo vệ rừng | Rừng · khai thác lâm dược dưới tán | Mường Giôn (03694) | 21.743 | 103.65 | Có nguồn | 11, 10, 211 |
| 156 | rung-ta-xua-rung-che-co-thu | Rừng chè cổ thụ bản Bẹ: cộng đồng giữ gen cây trong rừng | Rừng · bảo tồn cây cổ thụ | Tà Xùa (03868) | 21.303 | 104.478 | Có nguồn | 256, 257, 13 |
| 157 | rung-co-ma-khong-pha-rung-lam-nuong | Từ bỏ phá rừng làm nương & quy ước bảo vệ rừng của bản | Rừng · quy ước cộng đồng | Co Mạ (03781) | 21.298 | 103.532 | Có nguồn | 15, 258 |
| 158 | rung-suoi-to-cay-lam-nghiep-duong-nuong | Trồng cây lâm nghiệp trên nương bạc màu & dịch vụ môi trường rừng | Rừng · trồng rừng trên đất nương | Suối Tọ (03901) | 21.334 | 104.607 | Có nguồn | 259, 18 |
| 159 | rung-gia-phu-rung-tuong-giap | Rừng bản Nhọt (Rừng Tướng Giáp) & 15 tổ PCCCR | Rừng · hương ước & tổ bảo vệ rừng | Gia Phù (03922) | 21.168 | 104.543 | Có nguồn | 260, 261 |
| 160 | rung-tuong-ha-giao-dat-giao-rung | Giao đất, giao rừng cho nhân dân bảo vệ 607 ha rừng | Rừng · giao rừng & sinh kế | Tường Hạ (03958) | 21.137 | 104.66 | Có nguồn | 24 |
| 161 | rung-ngoc-chien-rung-pomu-son-mu | Xứ sở pơ mu: khoảng 12.000 ha rừng nguyên sinh & nhà sàn gỗ pơ mu | Rừng · rừng quý & kiến trúc gỗ | Ngọc Chiến (03820) | 21.645 | 104.21 | Có nguồn | 27, 262 |
| 162 | rung-xim-vang-rung-tao-meo-son-tra | Rừng táo mèo (sơn tra) lớn nhất Bắc Yên trong KBT Tà Xùa | Rừng · cây lâm sản & dược liệu | Xím Vàng (03862) | 21.365 | 104.335 | Có nguồn | 263, 217 |
| 163 | rung-sop-cop-rung-pu-hong-lok | Rừng quanh bản Mường Và (Pu Hong Lớk) & nhà sàn gỗ Lào | Rừng · tài nguyên rừng & sinh kế | Sốp Cộp (04231) | 20.84 | 103.6 | Có nguồn | 221, 222 |
| 164 | rung-bac-yen-pu-nhi-thong-thao-nguyen | Rừng thông & thảo nguyên Pu Nhi (Phiêng Ban): chăn thả ngựa, gà | Rừng · rừng thông & chăn thả | Bắc Yên (03856) | 21.225 | 104.475 | Có nguồn | 264, 265 |
| 165 | rung-muong-la-thao-qua-duoi-tan | Thảo quả Chiềng Muôn canh tác dưới tán rừng | Rừng · cây dược liệu dưới tán | Mường La (03808) | 21.59 | 104.07 | Cần đối chiếu | 266, 267 |
| 166 | rung-muong-sai-khoanh-nuoi-2470ha | Khoanh nuôi, bảo vệ2.470 ha rừng & trồng cây ăn quả | Rừng · khoanh nuôi phục hồi | Mường Sại (03712) | 21.645 | 103.715 | Cần đối chiếu | 50 |
| 167 | rung-nam-lau-12400ha-cay-che-bong | Rừng Nậm Lầu & cây che bóng chống xói mòn | Rừng · bảo vệ đất rừng | Nậm Lầu (03784) | 21.4048 | 103.7107 | Cần đối chiếu | 268, 51 |
| 168 | rung-binh-thuan-nha-san-thai-go-lim | Nhà sàn Thái & rừng gỗ quý (lim, đinh, sến, táu) | Rừng · kiến trúc & gỗ bản địa | Bình Thuận (03724) | 21.5926 | 103.6497 | Có nguồn | 269 |
| 169 | rung-pac-nga-dan-lat-tre-vau | Đan lát từ rừng tre vầu & nghề rèn Mông bản Suối Cải | Rừng · lâm sản ngoài gỗ & nghề thủ công | Pắc Ngà (03871) | 21.27 | 104.24 | Có nguồn | 270, 271 |
| 170 | rung-muong-leo-khoanh-nuoi-19100ha | Khoanh nuôi19.100 ha rừng & tổ PCCCR từng bản | Rừng · bảo vệ rừng cộng đồng | Mường Lèo (04240) | 20.93 | 103.31 | Có nguồn | 272, 59 |
| 171 | rung-muong-leo-lam-san-ngoai-go-ktrd | Tri thức lâm sản ngoài gỗ của người Thái, Khơ Mú (KTRĐD Sốp Cộp) | Rừng · lâm sản ngoài gỗ | Mường Lèo (04240) | 20.85 | 103.39 | Cần đối chiếu | 273 |
| 172 | rung-thuan-chau-nha-san-tho-moc-thom-mon | Thợ mộc nhà sàn Thôm Mòn - chọn gỗ lim, đinh, sến, táu & kỹ thuật đòn dầm | Rừng · kiến trúc gỗ & quản lý vật liệu | Thuận Châu (03721) | 21.44 | 103.69 | Có nguồn | 269, 274 |
| 173 | rung-long-he-5849ha-rung-cong-phi | Quản lý5.849 ha rừng giao khoán - dịch vụ môi trường rừng & nông lâm kết hợp | Rừng · giao khoán & DVMT | Long Hẹ (03763) | 21.44 | 103.49 | Có nguồn | 82, 83 |
| 174 | rung-pung-banh-phu-xanh-dat-trong | Phủ xanh3.452 ha nương bằng thông mã vĩ - nhận khoán4.981 ha rừng | Rừng · trồng rừng & nhận khoán | Púng Bánh (04228) | 21.01 | 103.44 | Có nguồn | 275, 276 |
| 175 | rung-pung-banh-tranh-chiem-ranh-gioi-364 | Tranh chấp ranh giới rừng đặc dụng - cột mốc364 giáp Nậm Mằn, Đứa Mòn | Rừng · luật tục & ranh giới | Púng Bánh (04228) | 21.03 | 103.4 | Có nguồn | 277, 278, 279 |
| 176 | rung-chieng-lao-mat-ong-da | Ong rừng hút mật dưới tán rừng - mật ong đá Chiềng Lao OCOP | Rừng · lâm sản & ong mật | Chiềng Lao (03814) | 21.65 | 103.9 | Có nguồn | 280, 235 |
| 177 | rung-phieng-cam-rung-cong-pham-che-phu | Rừng gần12.000 ha, che phủ42,4% - sinh kế lâm nghiệp & khoanh nuôi Phiêng Cằm | Rừng · quản lý rừng phòng hộ | Phiêng Cằm (04144) | 21.16 | 103.81 | Có nguồn | 118, 117 |
| 178 | rung-chieng-so-khoanh-nuoi-pe-tien | Khoanh nuôi bảo vệ gần200 ha rừng bản Pe Tiến - giữ đất trên sườn dốc | Rừng · khoanh nuôi | Chiềng Sơ (04195) | 21.11 | 103.57 | Có nguồn | 128 |
| 179 | rung-muong-lan-khoanh-nuoi-che-phu | Khoanh nuôi-giữ rừng11.300 ha, che phủ45% - Mường Lạn biên giới | Rừng · quản lý rừng | Mường Lạn (04246) | 20.79 | 103.68 | Có nguồn | 136, 134 |
| 180 | rung-phieng-khoai-dich-vu-moi-truong-rung | Bảo vệ600+ ha rừng - chi trả dịch vụ môi trường rừng bản Lao Khô | Rừng · dịch vụ môi trường rừng | Phiêng Khoài (04099) | 20.93 | 104.25 | Có nguồn | 281, 282 |
| 181 | rung-chieng-sinh-rung-vang | Rừng Vàng8,7 ha - du lịch sinh thái trên quy hoạch177 ha đất rừng phòng hộ | Rừng · du lịch gắn bảo vệ rừng | Chiềng Sinh (03679) | 21.32 | 103.96 | Có nguồn | 283 |
| 182 | rung-to-mua-che-co-thu-xen-rung | Quần thể100 cây chè Shan tuyết cổ thụ >100 năm - Cây Di sản Việt Nam xen rừng tự nhiên | Rừng · bảo tồn cây di sản | Tô Múa (04018) | 20.93 | 104.8 | Có nguồn | 284, 158 |
| 183 | rung-long-sap-dat-doi-rung-cua-khau | Đất dốc rừng Lóng Sập - chỉ1.700/11.026 ha canh tác, thổ cẩm-rèn dao từ nguyên liệu bản địa | Rừng · đất đồi & lâm sản | Lóng Sập (04045) | 20.81 | 104.47 | Có nguồn | 156, 285 |
| 184 | rung-xuan-nha-phu-xanh-chong-xoi-mon | Phủ xanh đất trống-đồi trọc & bồ kết vùng đệm rừng - Xuân Nha | Rừng · phủ xanh-chống xói mòn | Xuân Nha (04057) | 20.65 | 104.73 | Có nguồn | 176, 177 |

**Bảng 5. Điểm cây thuốc quý tại Phù Yên — dữ liệu bổ sung từ phu_yen_layers.json (7 điểm)**

| STT | Mã điểm | Tên điểm | Lĩnh vực | Xã (mã) | Vĩ độ (°B) | Kinh độ (°Đ) | Trạng thái | Nguồn |
|---|---|---|---|---|---|---|---|---|
| 185 | phu-yen-sa-nhan-muong-bang | Vùng trồng sa nhân tại xã Mường Bang | Đất · Nước · Rừng · dược liệu | Mường Bang (bao gồm Mường Do cũ) | 21.16965 | 104.810028 | Chưa xác minh | 286, 196 |
| 186 | phu-yen-an-xoa-phu-yen | Vùng trồng an xoa tại xã Phù Yên | Đất · Nước · Rừng · dược liệu | Huy Tường cũ; nguồn còn ghi Huy Bắc | 21.265269 | 104.652722 | Chưa xác minh | 286, 196 |
| 187 | phu-yen-an-xoa-tan-phong | Vùng trồng an xoa tại xã Tân Phong | Đất · Nước · Rừng · dược liệu | Bắc Phong cũ | 21.072032 | 104.724922 | Chưa xác minh | 286, 196 |
| 188 | phu-yen-an-xoa-kim-bon | Vùng trồng an xoa tại xã Kim Bon | Đất · Nước · Rừng · dược liệu | Đá Đỏ cũ | 21.09821 | 104.595698 | Chưa xác minh | 286, 196 |
| 189 | phu-yen-sa-phu-yen | Vùng trồng sả tại xã Phù Yên | Đất · Nước · Rừng · dược liệu | Tiến Phong, Huy Tường cũ | 21.265269 | 104.652722 | Chưa xác minh | 286, 196 |
| 190 | phu-yen-sa-tan-phong | Vùng trồng sả tại xã Tân Phong | Đất · Nước · Rừng · dược liệu | Bắc Phong cũ | 21.072032 | 104.724922 | Chưa xác minh | 286, 196 |
| 191 | phu-yen-sa-kim-bon | Vùng trồng sả tại xã Kim Bon | Đất · Nước · Rừng · dược liệu | Đá Đỏ cũ | 21.09821 | 104.595698 | Chưa xác minh | 286, 196 |

**Bảng 6. Phụ lục: vùng cây thuốc quý hiển thị dạng vùng (polygon) — tọa độ tính từ tâm đa giác (11 vùng)**

| STT | Mã điểm | Tên điểm | Lĩnh vực | Xã (mã) | Vĩ độ (°B) | Kinh độ (°Đ) | Trạng thái | Nguồn |
|---|---|---|---|---|---|---|---|---|
| 192 | mp_1 | Vùng sâm Lai Châu Mồ Sì San – Sì Lở Lầu | Dược liệu · Panax vietnamensis var. fuscidiscus | xã Sì Lở Lầu, huyện Phong Thổ, tỉnh Lai Châu | 22.73922 | 103.35345 | Có nguồn | 287, 288, 289 |
| 193 | mp_2 | Vùng sâm Ngọc Linh bản Sam Ta (Chiềng Chung cũ) | Dược liệu · Panax vietnamensis | xã Mường Chanh, huyện Mai Sơn, tỉnh Sơn La | 21.22159 | 103.87217 | Có nguồn | 287, 290 |
| 194 | mp_3 | Vùng dược liệu cao Tênh Phông – Quài Tở | Dược liệu · Anoectochilus annamensis; Disporopsis longifolia; Panax spp. | xã Quài Tở, huyện Tuần Giáo, tỉnh Điện Biên | 21.5614 | 103.47665 | Có nguồn | 287, 291 |
| 195 | mp_4 | Vùng sa nhân tím Sốp Cộp | Dược liệu · Amomum sp. | xã Sốp Cộp, huyện Sốp Cộp, tỉnh Sơn La | 20.86293 | 103.5753 | Có nguồn | 287 |
| 196 | mp_5 | Vùng dược liệu rừng Trung Thu (Sính Phình cũ) | Dược liệu | xã Sính Phình, huyện Tủa Chùa, tỉnh Điện Biên | 21.95 | 103.35313 | Có nguồn | 287, 291 |
| 197 | mp_6 | Vùng dược liệu Mường Phăng – Pá Khoang | Dược liệu | xã Mường Phăng, thành phố Điện Biên Phủ, tỉnh Điện Biên | 21.47809 | 103.09375 | Có nguồn | 287 |
| 198 | mp_7 | Vùng dược liệu dưới tán rừng Mường La | Dược liệu · Stephania pierrei; Gynostemma pentaphyllum; Anoectochilus annamensis; Panax vietnamensis | xã Mường La, huyện Mường La, tỉnh Sơn La | 21.5516 | 104.03784 | Có nguồn | 292 |
| 199 | mp_8 | Vùng thảo quả dưới tán Thuận Châu | Dược liệu · Amomum verum | xã Thuận Châu, huyện Thuận Châu, tỉnh Sơn La | 21.43126 | 103.71948 | Có nguồn | 293, 287 |
| 200 | mp_9 | Vùng thảo quả dưới tán Quỳnh Nhai | Dược liệu · Amomum verum | xã Quỳnh Nhai, huyện Quỳnh Nhai, tỉnh Sơn La | 21.63418 | 103.67984 | Có nguồn | 293, 287 |
| 201 | mp_10 | Vùng thảo quả dưới tán Bắc Yên | Dược liệu · Amomum verum | xã Bắc Yên, huyện Bắc Yên, tỉnh Sơn La | 21.20731 | 104.46068 | Có nguồn | 293, 287 |
| 202 | mp_11 | Vùng dược liệu Vân Hồ | Dược liệu | xã Vân Hồ, huyện Vân Hồ, tỉnh Sơn La | 20.78974 | 104.86792 | Có nguồn | 293 |

## Danh mục nguồn tham khảo

Các nguồn dưới đây được đánh số theo thứ tự xuất hiện trong các bảng trên; mỗi điểm trong bảng ghi số hiệu tương ứng.

1. http://www.baosonla.org.vn/phu-yen/vua-lua-muong-tac-28917.html
2. https://beta20.tuoitre.vn/mua-lua-vang-tren-canh-dong-muong-tac-vung-tay-bac-20190623002123208.htm
3. https://nhandan.vn/ngot-lanh-qua-dang-phu-yen-post621472.html
4. https://baosonla.vn/phu-yen/muong-bang-tim-huong-thoat-ngheo-43789.html
5. https://baosonla.vn/vi/bai-viet/kim-bon-no-luc-giam-ngheo-46768
6. https://vafs.gov.vn/vn/ket-qua-xay-dung-mo-hinh-su-dung-dat-co-hieu-qua-kinh-te-va-phong-ho-cho-vung-xung-yeu-ven-ho-song-da/
7. https://baotintuc.vn/huong-lua-moi-o-chieng-khoang-post836023.html
8. https://baosonla.org.vn/quynh-nhai/chieng-bang-doan-ket-xay-dung-doi-song-van-hoa-35697.html
9. https://sonlatv.vn/bao-ton-phat-huy-gia-tri-van-hoa-dan-toc-la-ha-29705.html
10. https://baosonla.vn/vi/bai-viet/net-moi-muong-gion-1354
11. https://trangtraiviet.danviet.vn/muong-gion-lam-gi-de-nang-cao-thu-nhap-cho-nguoi-dan-20210418105621386-d51994.html
12. https://baosonla.vn/kinh-te/che-shan-tuyet-co-thu-giua-bien-may-ta-xua-kbUu0bFDg.html
13. https://baosonla.vn/van-hoa-xa-hoi/doc-dao-cach-sao-che-cua-dong-bao-dan-toc-mong-ilekkTa4g.html
14. https://nhandan.vn/cay-che-tren-dinh-ta-xua-post744184.html
15. https://trangtraiviet.danviet.vn/nong-dan-tay-bac-mua-vang-o-xa-vung-cao-co-ma-20211030183200436-d53254.html
16. https://baosonla.vn/van-hoa-son-la/vai-net-van-hoa-cua-dan-toc-mong-24712.html
17. https://baosonla.vn/vi/bai-viet/suoi-to-day-manh-khai-hoang-ruong-bac-thang-33956
18. https://baosonla.vn/xa-hoi/danh-thuc-tiem-nang-vung-cao-suoi-to-fQn5lvoDg.html
19. https://vnbusiness.vn/htx-danh-thuc-gia-tri-nong-san-vung-cao-nho-don-bay-khoa-hoc-cong-nghe.html
20. http://www.baosonla.org.vn/phu-yen/cay-vu-dong-o-gia-phu-19035.html
21. https://baosonla.vn/kinh-te/dong-hanh-cung-nhan-dan-phat-trien-kinh-te-Gw0acVNvg.html
22. https://baosonla.vn/du-lich/danh-thuc-tiem-nang-du-lich-muong-coi-yiVGaaJDR.html
23. https://baosonla.vn/van-hoa-xa-hoi/khai-mac-ngay-hoi-van-hoa-cac-dan-toc-va-ngay-hoi-cam-xa-muong-coi-nam-2025-KiVTJCZvR.html
24. https://baosonla.vn/vi/bai-viet/tuong-ha-tap-trung-phat-trien-kinh-te-35115
25. https://baosonla.vn/van-hoa-xa-hoi/le-don-nhan-di-san-van-hoa-phi-vat-the-quoc-gia-nghi-le-tet-xip-xi-cua-nguoi-thai-trang-huyen-quynh-nhai-jcrvq1CIR.html
26. https://nhandan.vn/tet-xip-xi-o-son-la-duoc-cong-nhan-la-di-san-van-hoa-phi-vat-the-quoc-gia-post825113.html
27. https://vietnamtourism.vn/index.php/news/items/7407
28. https://vov4.vov.vn/bao-ton-vh/trai-nghiem-le-mung-com-moi-o-mien-que-co-tich-394937.vov4
29. https://vietnamtourism.gov.vn/post/52632
30. https://vov.vn/du-lich/ve-dep-vung-cao-xim-vang-son-la-post973028.vov
31. https://www.nguoiduatin.vn/doc-dao-thap-co-500-tuoi-giua-dai-ngan-tay-bac-20494898.htm
32. http://khaocohoc.gov.vn/thap-co-muong-bam
33. https://baosonla.org.vn/van-hoa-xa-hoi/le-hoi-cau-mua-xa-chieng-cang-fZJ75dTIR.html
34. https://sonlatv.vn/le-hoi-cau-mua-xa-chieng-cang-nam-2024-19346.html
35. https://vov.vn/du-lich/gao-nep-tan-muong-va-thom-ngon-nuc-tieng-836675.vov
36. https://trangtraiviet.danviet.vn/sop-cop-chu-trong-phat-trien-san-pham-ocop-20220831174819778-d54984.html
37. https://tapchi.vaas.vn/sites/tapchi.vaas.vn/files/tapchi/2022-05/cd1-2022.pdf
38. https://thuonghieu.net.vn/thuong-hieu/xoai-tron-yen-chau-huong-vi-dam-da
39. https://baosonla.vn/vi/bai-viet/xuan-ve-mien-chuoi-ngot-xoai-thom-47537
40. https://nhandan.vn/doi-thay-o-hong-ngai-post377387.html
41. https://www.sggp.org.vn/mua-no-am-tren-que-huong-a-phu-post494614.html
42. https://baotintuc.vn/doi-thay-tren-que-huong-vo-chong-a-phu-post437542.html
43. https://vov.vn/kinh-te/yen-chau-mien-que-chuoi-ngot-xoai-thom-cat-canh-the-nao-post984798.vov
44. https://danviet.vn/mot-ban-nong-thon-moi-son-la-cao-900m-so-voi-muc-nuoc-bien-ho-nuoc-ngot-dep-nhu-phim-lam-du-lich-nguoi-ta-len-xem-d1387484.html
45. https://trangtraiviet.danviet.vn/dua-cay-an-qua-tren-dat-doc-nong-dan-chieng-hac-co-thu-nhap-cao-2021022714124542-d47016.html
46. https://thongtindoingoai.sonla.gov.vn/content-772-vung-xoai-ung-dung-cong-nghe-cao-yen-chau.html
47. https://sonnmt.sonla.gov.vn/vung-nong-nghiep-ung-dung-cong-nghe-cao
48. https://vietnamnet.vn/giam-ngheo-thong-tin-tao-chuyen-bien-ro-net-o-chieng-hac-son-la-2508108.html
49. https://baosonla.org.vn/muong-la/chieng-san-mo-rong-dien-tich-cay-an-qua-36057.html
50. https://baosonla.vn/quynh-nhai/muong-sai-day-manh-chuyen-doi-kinh-te-34488.html
51. https://baosonla.vn/kinh-te/cay-thoat-ngheo-cua-nguoi-dan-nam-lau-U8q8VeWDg.html
52. https://baosonla.vn/vi/bai-viet/nguoi-thai-binh-tren-que-huong-phong-lai-24308
53. https://sonlatv.vn/doc-dao-le-hoi-gau-tao-po-pao-19249.html
54. https://baosonla.vn/van-hoa-xa-hoi/huoi-mot-giu-gin-van-hoa-truyen-thong-JW9LXPPSg.html
55. https://baosonla.vn/van-hoa-xa-hoi/dac-sac-le-hoi-xen-muong-xa-pac-nga-lan-thu-ii-nam-2025-ElVryxoHg.html
56. https://baovanhoa.vn/ve-pac-nga-vui-hoi-xen-muong-voi-dong-bao-dan-toc-thai-127051.html
57. https://baosonla.vn/xa-hoi/pac-nga-no-luc-vuon-len-Ez8r7G9Ng.html
58. https://baosonla.vn/kinh-te/muong-leo-no-luc-vuot-kho-SzFSAK5HR.html
59. https://baosonla.vn/xa-hoi/muong-leo-no-luc-phat-trien-kinh-te-Bkv7uNySR.html
60. https://baosonla.vn/van-hoa-xa-hoi/phat-huy-gia-tri-van-hoa-di-tich-quoc-gia-mai-da-ban-mon-KzBqsRuNg.html
61. https://utb.edu.vn/hoi-nghi-bao-cao-ket-qua-tham-sat-va-khai-quat-di-tich-mai-da-ban-mon-xa-thom-mon-huyen-thuan-chau-tinh-son-la/
62. https://baosonla.vn/van-hoa-xa-hoi/di-tich-khao-co-mai-da-ban-mon-duoc-cong-nhan-xep-hang-di-tich-quoc-gia-dP4c7hmSg.html
63. https://baosonla.vn/kinh-te/mua-vai-ngot-o-muong-bu-AMkEV9YHg.html
64. https://baosonla.vn/xa-hoi/muong-bu-mua-vai-chin-vo6PlIJvR.html
65. https://baosonla.vn/nong-thon-moi/dien-mao-moi-vung-dat-duoi-chan-deo-cao-pha-4Q0bU8rNR.html
66. https://baosonla.vn/xa-hoi/van-bu-xua-va-muong-bu-hom-nay-AQPbDA6Ng.html
67. https://baosonla.vn/kinh-te/chieng-sai-mo-rong-dien-tich-trong-mia-i8gctrfNg.html
68. https://baosonla.vn/kinh-te/vi-ngot-tren-nhung-canh-dong-mia-chieng-sai-Aw1qFudvg.html
69. https://baosonla.vn/kinh-te/chieng-sai-chuyen-doi-co-cau-cay-trong-3g3TROwNg.html
70. https://baosonla.org.vn/bac-yen/chieng-sai-day-manh-chuyen-doi-co-cau-cay-trong-35509.html
71. https://baosonla.org.vn/bac-yen/chieng-sai-tim-huong-thoat-ngheo-44644.html
72. https://baosonla.vn/nong-thon-moi/chieng-sai-vuon-len-phat-trien-kinh-te-aoS47buNg.html
73. http://baosonla.org.vn/kinh-te/vung-nhan-cong-nghe-cao-o-yen-chau-WS7AmNMHg.html
74. https://sonlatv.vn/yen-chau-day-manh-san-xuat-vung-nong-nghiep-ung-dung-cong-nghe-cao-26166.html
75. https://sonlatv.vn/nong-thon-moi-doi-thay-xa-vung-bien-long-phieng-18544.html
76. https://sonla.gov.vn/tin-van-hoa-xa-hoi/xa-long-phieng-phat-trien-kinh-te-tu-trong-cay-an-qua-659220
77. https://baosonla.vn/emagazine/na-nghiu-thom-mui-com-moi-aKxHLQ4IR.html
78. https://baosonla.org.vn/van-hoa-xa-hoi/le-hoi-mung-com-moi-xa-na-nghiu-nam-2023-heXViCnIg.html
79. https://baosonla.vn/emagazine/huong-sac-ngay-mua-rtmwEmdVg.html
80. https://baosonla.org.vn/song-ma/na-nghiu-mo-rong-dien-tich-cay-an-qua-35673.html
81. https://baosonla.org.vn/kinh-te/lien-ket-san-xuat-phat-trien-ben-vung-1WuDpoVSR.html
82. https://baosonla.vn/thuan-chau/ve-long-he-10443.html
83. https://baosonla.org.vn/trung-tam-khuyen-nong-son-la/trung-tam-khuyen-nong-tinh-tich-cuc-giup-do-xa-vung-cao-long-he-14351.html
84. https://baosonla.vn/day-manh-hoc-tap-va-lam-theo-tu-tuong-dao-duc-phong-cach-ho-chi-minh/nhung-dot-pha-lam-doi-thay-o-muong-e-PM8qDvODR.html
85. https://baosonla.vn/nong-thon-moi/ve-muong-e-J8Hv0MWDg.html
86. https://baosonla.vn/van-hoa-xa-hoi/muong-e-bao-ton-phat-huy-gia-tri-nghe-dan-may-tre-truyen-thong-VXSOxNVvR.html
87. https://baosonla.vn/van-hoa-xa-hoi/xa-muong-e-giu-gin-ban-sac-van-hoa-cac-dan-toc-SQkg4Sovg.html
88. https://baosonla.vn/vi/bai-viet/bao-ton-phuc-trang-giong-lua-nep-tan-lanh-o-muoi-noi-24059
89. https://baosonla.vn/nong-nghiep/chu-trong-chuyen-doi-co-cau-cay-trong-vat-nuoi-N1k7VfTSR.html
90. https://baosonla.vn/kinh-te/chieng-hoa-no-luc-thoat-ngheo-KVtvsfXNg.html
91. https://laodong.vn/kinh-doanh/mua-thao-qua-chin-do-duoi-tan-rung-o-son-la-1721016.ldo
92. http://www.baosonla.org.vn/nong-nghiep/chieng-hoa-chuyen-doi-co-cau-cay-trong-vat-nuoi-K4YveJ2Vg.html
93. https://baosonla.org.vn/bac-yen/ta-khoa-chuyen-doi-co-cau-san-xuat-29417.html
94. https://baosonla.org.vn/bac-yen/tim-huong-phat-trien-san-xuat-cho-cac-xa-doc-song-32556.html
95. https://baosonla.vn/chuong-trinh-muc-tieu-quoc-gia-giam-ngheo-ben-vung-nam-2022-tinh-son-la/doi-thay-vung-dat-ta-khoa-hidf70WNg.html
96. https://baosonla.vn/xa-hoi/mau-xanh-bien-gioi-chieng-son-42BBSklNR.html
97. http://chechiengve.com/vi/about/SO-DO-TO-CHUC-CONG-TY-CO-PHAN-CHE-CHIENG-VE-MOC-CHAU.html
98. https://baosonla.org.vn/kinh-te/tan-yen-xay-dung-cac-mo-hinh-kinh-te-fjK8eaANR.html
99. https://nongnghiepmoitruong.vn/sac-xanh-tren-vung-dat-moi-tan-yen-d781259.html
100. https://baosonla.vn/kinh-te/nhieu-mo-hinh-kinh-te-o-tan-yen-qjMoowgDg.html
101. https://sonlatv.vn/nang-cao-hieu-qua-kinh-te-hop-tac-xa-o-moc-chau-27249.html
102. https://baosonla.vn/kinh-te/doan-ket-khai-thac-hieu-qua-tiem-nang-the-manh-bh5xYutvg.html
103. https://baosonla.vn/nong-thon-moi/dien-mao-moi-xa-doan-ket-dKsMwYlHR.html
104. https://vietnamnet.vn/ru-nhau-lam-an-lon-nong-dan-ban-vung-cao-me-lech-om-ve-tien-ty-2384358.html
105. https://baosonla.vn/kinh-te/vai-tro-hop-tac-xa-trong-san-xuat-nong-nghiep-z2fDfaIHR.html
106. https://sonlatv.vn/huyen-mai-son-co-11-500-ha-cay-an-qua-27758.html
107. http://baosonla.org.vn/mai-son/ban-bo-chuyen-doi-co-cau-cay-trong-tren-dat-ruong-29126.html
108. http://baosonla.org.vn/mai-son/muong-bang-no-luc-thuc-hien-tieu-chi-moi-truong-18356.html
109. https://baosonla.vn/xa-hoi/cuoc-song-moi-o-ban-rung-thong-20113.html
110. http://www.baosonla.org.vn/nong-nghiep/lien-ket-san-xuat-ca-phe-huu-co-ben-vung-dGoJDQcVg.html
111. https://baosonla.vn/nong-nghiep/xay-dung-vung-ca-phe-ung-dung-cong-nghe-cao-54084.html
112. https://baosonla.vn/nong-nghiep/day-manh-phat-trien-nong-nghiep-theo-huong-hang-hoa-Su0JZl5DR.html
113. http://baosonla.org.vn/mai-son/muong-chanh-giu-vung-cac-tieu-chi-xay-dung-nong-thon-moi-17467.html
114. https://baosonla.vn/xa-hoi/ve-que-huong-cach-mang-muong-chanh-TKx2B0lHg.html
115. https://sonlatv.vn/thanh-long-ruot-do-son-la-vuon-ra-thi-truong-the-gioi-10992.html
116. https://baosonla.vn/xa-hoi/khoi-sac-vung-dong-bao-dan-toc-thieu-so-sEeRxjkvg.html
117. https://baosonla.vn/phong-su/suc-song-moi-phieng-cam-Bk6lNdOIg.html
118. https://nongnghiepmoitruong.vn/giam-doc-so-nong-nghiep-va-moi-truong-son-la-hien-ke-thao-diem-nghen-phieng-cam-d805943.html
119. https://baosonla.vn/vi/bai-viet/xuan-moi-phieng-cam-36303
120. https://vov.gov.vn/xa-bien-gioi-phieng-pan-moi-son-la-truoc-gio-van-hanh-chinh-quyen-dia-phuong-2-dtnew-1095296
121. https://baomoi.com/tro-lai-phieng-pan-c41422547.epi
122. https://baosonla.vn/vi/bai-viet/khi-doanh-nghiep-htx-va-nong-dan-lien-ket-san-xuat-theo-don-dat-hang-44197
123. http://www.baosonla.org.vn/nong-nghiep/nhan-rong-cac-mo-hinh-kinh-te-phu-hop-gRUJYmrVR.html
124. http://www.baosonla.org.vn/kinh-te/nhan-rong-cac-mo-hinh-kinh-te-RYgmenrIR.html
125. https://www.vietnam.vn/nam-ty-chuyen-doi-co-cau-cay-trong
126. https://baosonla.org.vn/song-ma/nam-ty-day-manh-phat-trien-cay-an-qua-27901.html
127. https://baosonla.vn/kinh-te/song-ma-phat-trien-nong-nghiep-ung-dung-cong-nghe-cao-6jpTEtOHg.html
128. https://baosonla.vn/xa-hoi/doi-thay-o-chieng-so-aQBVazGSR.html
129. https://nhandan.vn/hanh-trinh-tro-thanh-vua-nhan-dung-dau-ca-nuoc-post910387.html
130. https://baosonla.org.vn/song-ma/hieu-qua-phong-trao-xay-dung-nong-thon-moi-o-chieng-khoong-33784.html
131. https://nongnghiepmoitruong.vn/ky-tich-o-chieng-khuong-d396344.html
132. https://trangtraiviet.danviet.vn/bai-ca-ket-doan-trong-xay-dung-nong-thon-moi-o-chieng-khuong--song-ma-d70637.html
133. https://sonlatv.vn/chieng-khuong-xay-dung-nong-thon-moi-nang-cao-25968.html
134. https://baosonla.vn/nong-thon-moi/muong-lan-no-luc-xay-dung-nong-thon-moi-pyBPINbDg.html
135. https://baosonla.vn/kinh-te/chuyen-doi-co-cau-cay-trong-o-xa-bien-gioi-muong-lan-mTAK29mDg.html
136. https://baosonla.vn/sop-cop/doi-thay-o-muong-lan-29989.html
137. http://baosonla.org.vn/nong-thon-moi/yen-son-quyet-tam-khong-con-ho-ngheo-CdEXLvzDR.html
138. https://baosonla.org.vn/nong-thon-moi/yen-son-tap-trung-xay-dung-nong-thon-moi-7LnDPW3Ng.html
139. https://trangtraiviet.danviet.vn/yen-son-don-suc-xay-dung-nong-thon-moi-nang-cao-doi-song-dong-bao-cac-dan-toc-d1367888.html
140. https://baosonla.vn/vi/bai-viet/chieng-on-tim-loi-giai-cho-bai-toan-thoat-ngheo-49705
141. https://trangtraiviet.danviet.vn/mot-xa-bien-gioi-o-son-la-phu-xanh-dat-doc-bang-cay-an-qua-nong-dan-ngay-cang-no-am-d1432726.html
142. https://baosonla.vn/nong-thon-moi/nong-thon-moi-o-phieng-khoai-wWVPc8HDR.html
143. https://baosonla.vn/kinh-te/nong-nghiep-sach-tu-nong-trai-den-ban-an-CCaQNyXHR.html
144. https://vov.vn/kinh-te/nong-dan-son-la-tieu-thu-nong-san-on-dinh-nho-lien-ket-san-xuat-post1099978.vov
145. http://baosonla.org.vn/xay-dung-dang/huong-toi-do-thi-xanh-hien-dai-giau-ban-sac-12noa0lHR.html
146. https://chiengan.sonla.gov.vn/dieu-kien-tu-nhien/dieu-kien-tu-nhien-xa-hoi-xa-chieng-xom-538449
147. https://baosonla.vn/kinh-te/them-nhung-mo-hinh-san-xuat-moi-o-vung-ngoai-o-thanh-pho-41986.html
148. https://baosonla.vn/kinh-te/chieng-coi-phat-huy-vai-tro-cua-cac-hop-tac-xa-S7gR9HyvR.html
149. http://www.baosonla.org.vn/kinh-te/chieng-coi-nhieu-mo-hinh-kinh-te-hieu-qua-ZjfaBf9Hg.html
150. https://baosonla.vn/kinh-te/chieng-sinh-phat-huy-loi-the-phat-trien-kinh-te-ben-vung-QanuZfjvR.html
151. https://baosonla.org.vn/song-ma/bo-sinh-no-luc-vuot-ngheo-17516.html
152. https://baosonla.org.vn/song-ma/doi-thay-o-bo-sinh-25157.html
153. https://baosonla.org.vn/nong-thon-moi/bo-sinh-xay-dung-nong-thon-moi-46470.html
154. https://baosonla.vn/xa-hoi/doi-thay-o-bo-sinh-J4jsMQavR.html
155. https://sonlatv.vn/trai-ngot-mua-xuan-tren-nhung-trien-doi-o-long-sap-26190.html
156. https://baosonla.vn/vi/bai-viet/long-sap-chuyen-minh-18734
157. https://baosonla.vn/nong-nghiep/xay-dung-thuong-hieu-che-to-mua-QvEY8rlIg.html
158. https://tienphong.vn/cach-dan-ban-vung-cao-thoat-ngheo-voi-cay-che-shan-tuyet-post1752061.tpo
159. https://baosonla.vn/vi/bai-viet/ve-vung-che-to-mua-21336
160. https://baomoi.com/htx-nong-trai-huu-co-van-ho-nang-cao-gia-tri-san-pham-tu-quy-trinh-san-xuat-xanh-sach-c32515524.epi
161. https://baosonla.vn/van-ho/doi-moi-o-ban-long-luong-27870.html
162. https://thiennhienmoitruong.vn/son-la-mo-rong-vung-trong-ngo-sinh-khoi.html
163. https://nhandan.vn/chia-tach-dia-gioi-chia-deu-co-hoi-post888948.html
164. https://mst.gov.vn/ho-tro-nguoi-dan-doanh-nghiep-ung-dung-cong-nghe-cao-197241225095726509.htm
165. https://sonlatv.vn/muong-sang-phat-trien-nong-nghiep-gan-voi-du-lich-18306.html
166. https://mst.gov.vn/dong-sang-phat-trien-nong-nghiep-ung-dung-cong-nghe-cao-197241225101539074.htm
167. https://baosonla.vn/nong-nghiep/khau-dot-pha-san-xuat-nong-nghiep-o-dong-sang-n4aShG8Vg.html
168. https://sonlatv.vn/mua-dau-tay-o-dong-sang-26962.html
169. https://baosonla.vn/nong-nghiep/thao-nguyen-phat-trien-nong-nghiep-ung-dung-cong-nghe-cao-OT83nHXHR.html
170. https://baosonla.vn/van-ho/song-khua-mua-lua-chin-26682.html
171. https://equality.aus4vietnam.org/vi/ban-buot-thay-da-doi-thit-nho-giong-lua-dia-phuong/
172. https://trangtraiviet.danviet.vn/chia-khoa-thanh-cong-cua-htx-nong-nghiep-o-son-la-d1326994.html
173. https://nongthon.vietnamtourism.gov.vn/mo-hinh-farmstay-tai-moc-chau-son-la/
174. https://baosonla.vn/du-lich/phat-trien-du-lich-nong-nghiep-ben-vung-0JtdowFHR.html
175. https://nongnghiepmoitruong.vn/de-moc-chau-tro-thanh-da-lat-thu-hai-d757654.html
176. https://baosonla.vn/nong-nghiep/xuan-nha-chuyen-doi-co-cau-cay-trong-vat-nuoi-54475.html
177. https://baosonla.vn/kinh-te/xuan-nha-chuyen-doi-co-cau-cay-trong-vat-nuoi-amZ98XyNR.html
178. https://baosonla.org.vn/guong-sang-ban-lang/phat-trien-mo-hinh-kinh-te-tong-hop-NBpzWQvHg.html
179. https://baosonla.org.vn/bac-yen/phieng-ban-2-chuyen-doi-co-cau-cay-trong-vat-nuoi-33752.html
180. https://trangtraiviet.danviet.vn/nong-dan-tay-bac-nhung-nong-dan-nguoi-mong-lam-kinh-te-gioi-o-si-pa-phin-d1387074.html
181. https://nhandan.vn/nhan-rong-cac-mo-hinh-phat-trien-san-xuat-duoi-tan-rung-post644474.html
182. https://nongnghiepmoitruong.vn/trong-thao-qua-duoi-tan-rung-tang-thu-nhap-bao-ve-rung-d397740.html
183. https://vanhoanghethuat.vn/van-hoa-truyen-thong-cua-nguoi-tay-o-xa-ban-ho-lao-cai-voi-vai-tro-tu-quan-trong-hoat-dong-kinh-doanh-homestay-77757454.html
184. https://baolaocai.vn/nguoc-suoi-muong-hoa-post284803.html
185. https://baolaocai.vn/quan-ly-dien-tich-thao-qua-duoi-tan-rung-tu-nhien-post381933.html
186. https://nhandan.vn/mua-thao-qua-post559807.html
187. https://baolaocai.vn/nong-dan-sa-pa-phan-khoi-thu-hoach-cay-atiso-post376999.html
188. https://nongnghiepmoitruong.vn/loai-cay-sieu-thuc-pham-o-vung-dat-sa-pa-d408160.html
189. https://danviet.vn/ca-tam-ca-hoi-la-ca-quy-toc-nuoi-thanh-cong-o-mot-thi-xa-cua-lao-cai-dan-giau-len-thay-ro-2025022617073904-d848549.html
190. https://baosonla.org.vn/guong-sang-ban-lang/lam-giau-tu-mo-hinh-vac-32416.html
191. https://baotintuc.vn/mo-hinh-phat-trien-kinh-te-hieu-qua-cua-nguoi-mong-huyen-tam-duong-lai-chau-post539261.html
192. https://sonla.gov.vn/thong-tin-tu-so-nganh/dai-su-quan-ireland-tai-viet-nam-tham-va-lam-viec-tai-xa-phu-yen-963321
193. https://baosonla.vn/vi/bai-viet/vua-lua-muong-tac-28909
194. https://www.openstreetmap.org/node/369501601
195. https://sjsh.hpu2.edu.vn/index.php/journal/article/view/604
196. https://sonla.gov.vn/cac-xa-phuong/xa-phu-yen-630410
197. https://baosonla.vn/phu-yen/doan-co-quan-phat-trien-phap-danh-gia-thuc-trang-ho-suoi-chieu-jaqNd8ySg.html
198. https://vov4.vov.vn/tin-tuc/nong-dan-mien-nui-son-la-xuong-dong-san-xuat-vu-xuan-476456.vov4
199. https://danviet.vn/chang-youtuber-o-xa-vung-cao-son-la-ke-chuyen-nong-nghiep-xanh-tren-nen-tang-so-ma-thu-tram-trieu-thang-d1443592.html
200. http://mcve.org.vn/2023/03/10/tim-hieu-he-thong-dan-thuy-nhap-dien-cua-nhom-cu-dan-tay-thai-qua-he-thong-trung-bay-tai-bao-tang-van-hoa-cac-dan-toc-viet-nam/
201. https://vi.wikipedia.org/wiki/Kim_Bon
202. https://baosonla.vn/van-hoa-van-nghe-the-thao/da-giang-mua-nuoc-noi-28696.html
203. https://baosonla.vn/vi/bai-viet/tan-phong-chuyen-huong-san-xuat-tang-thu-nhap-cho-nhan-dan-42304
204. https://nongthonmoi.hatinh.gov.vn/Tin-trong-nuoc/Son-La-Xa-Gia-Phu-khoi-suc-dan-xay-dung-nong-thon-moi-73285.html
205. https://tuoitre.vn/cuoc-song-moi-o-ha-long-cua-mien-tay-bac-20191024095006761.htm
206. https://baosonla.vn/phong-su/ve-quynh-nhai-noi-co-dong-song-hat-ky-1-su-tich-bien-ho-iTHcmm7Hg.html
207. https://baosonla.vn/kinh-te/doi-thay-ban-ven-ho-hl4ooOXHg.html
208. https://vi.wikipedia.org/wiki/M%C6%B0%E1%BB%9Dng_Khi%C3%AAng
209. https://baosonla.vn/phong-su/thuan-chau-trong-hanh-trinh-thoat-ngheo-ky-i-chon-huong-di-phu-hop-MSTHyn8VR.html
210. https://baosonla.vn/van-hoa-xa-hoi/phuc-dung-le-hoi-lang-pang-a-cua-dong-bao-la-ha-xa-muong-khieng-XU9a9ghDg.html
211. https://www.thuvientailieu.vn/tai-lieu/mot-so-nguyen-nhan-chu-quan-anh-huong-toi-thu-nhap-ho-gia-dinh-nong-thon-vung-cao-xa-muong-gion-huyen-quynh-nhai-tinh-56456/
212. https://thanhnien.vn/kham-pha-mot-phien-cho-ben-song-mien-tay-bac-1851024123.htm
213. https://baosonla.vn/quynh-nhai/trai-nghiem-muong-chien-23502.html
214. https://vietnamnet.vn/xa-trong-long-ho-thuy-dien-sau-sap-nhap-va-hanh-trinh-van-hanh-chinh-quyen-moi-2423250.html
215. https://vietnamtourism.gov.vn/post/29181
216. https://www.vietnam.vn/ve-dep-ruong-bac-thang-mua-nuoc-do-o-xim-vang-son-la
217. https://bacyen.sonla.gov.vn/xa-xim-vang/xa-xim-vang-511366
218. https://vi.wikipedia.org/wiki/N%E1%BA%ADm_H%C3%BAa
219. https://sonlatv.vn/muong-hung-to-chuc-le-hoi-truyen-thong-19391.html
220. https://thongtindoingoai.sonla.gov.vn/content-139-bao-ton-va-phat-huy-gia-tri-cac-le-hoi-truyen-thong.html
221. https://baosonla.vn/van-hoa-xa-hoi/du-lich-nong-thon-muong-va-X7l5Flq4R.html
222. https://dantoctongiao.baodantoc.vn/nguoi-lao-o-son-la-phat-huy-ban-sac-de-phat-trien-du-lich-1750216261096.htm
223. https://nhandan.vn/nghia-tinh-muong-lum-post177532.html
224. https://petrotimes.vn/thung-lung-bach-nien-51525.html
225. https://baosonla.vn/kinh-te/phat-trien-nuoi-ca-long-theo-chuoi-gia-tri-23581.html
226. https://baosonla.org.vn/phong-su/muong-la-no-luc-thoat-ngheo-ky-i-nhung-cach-lam-sang-tao-o-co-so-53381.html
227. https://thongtindoingoai.sonla.gov.vn/content-1622-muong-la-day-manh-lien-ket-nang-cao-gia-tri-nuoi-ca-long.html
228. https://nongthonmoi.sonla.gov.vn/index.php?act=view&id=979&module=news
229. https://baosonla.vn/moi-xa-mot-san-pham-2020/ca-tram-hun-khoi-chieng-la-san-pham-ocop-3-sao-38446.html
230. https://congthuong.vn/ca-tram-hun-khoi-chieng-la-dac-san-nui-rung-xuong-pho-nho-thuong-mai-dien-tu-366122.html
231. https://baosonla.vn/kinh-te/phat-trien-mo-hinh-nuoi-ca-ao-hieu-qua-mhBzi6sDg.html
232. https://sonlatv.vn/no-luc-giam-ngheo-o-xa-ngheo-cua-huyen-bien-gioi-sop-cop-16690.html
233. https://baosonla.vn/thuan-chau/muoi-noi-no-luc-xay-dung-nong-thon-moi-20439.html
234. https://baosonla.vn/kinh-te/doi-thay-vung-long-ho-chieng-lao-l4hzWLKDg.html
235. https://baosonla.vn/kinh-te/chieng-lao-phat-huy-noi-luc-thuc-day-kinh-te-xa-hoi-hvSMfcwNg.html
236. https://baosonla.vn/muong-la/chieng-lao-no-luc-phat-trien-kinh-te-33056.html
237. https://danviet.vn/son-la-mua-lon-xuat-hien-lu-quet-cuon-troi-hoa-mau-cua-nguoi-dan-202008061704304-d798428.html
238. https://baosonla.vn/vi/bai-viet/chuyen-o-ban-ta-dung-30288
239. https://baosonla.vn/nong-thon-moi/chieng-sung-doan-ket-xay-dung-nong-thon-moi-d8SRyJQNg.html
240. https://thiennhienmoitruong.vn/son-la-tap-trung-ra-soat-di-doi-dan-cu-ra-khoi-vung-nguy-co-anh-huong-boi-thien-tai.html
241. https://baosonla.vn/du-lich/phat-trien-nong-nghiep-gan-voi-du-lich-o7lLNq3NR.html
242. http://bqldt.svhttdl.dienbien.gov.vn/portal/pages/2020-6-30/Cong-trinh-Dai-thuy-nong-Nam-Rom9vcbupk907im.aspx
243. https://baosonla.vn/du-lich/giu-nhip-quay-con-nuoc-ben-dong-nam-e-kVg31Vxvg.html
244. https://vov4.vov.vn/tim-hieu-dan-toc-viet-nam/kinh-nghiem-lam-lua-nuoc-cua-nguoi-thai-o-dien-bien-366939.vov4
245. http://www.cema.gov.vn/gioi-thieu/cong-dong-54-dan-toc/nguoi-ha-nhi.htm
246. https://vietnam.travel/vi/things-to-do/where-see-vietnams-rice-terraces
247. https://songma.sonla.gov.vn/1298/31420/60148/632775/van-hoa-xa-hoi/chieng-khoong-dam-bao-nguon-nuoc-cho-lua-xuan
248. http://hdl.handle.net/10535/560
249. https://thanhnienviet.vn/phu-yen-san-xuat-lua-gao-theo-huong-huu-co-lien-ket-chuoi-gia-tri-209240718174056727.htm
250. https://www.youtube.com/watch?v=Lq9XnhkjVZI
251. https://data.opendevelopmentmekong.net/dataset/9601c709-94d6-4868-bba6-b79299aea62b/resource/3a9711f6-91fe-4d3f-9f9b-812d8bdcc946/download/ipn17-vie-vai-tro-va-y-nghia-ca-lang-bn-va-rng-cng-ng-cac-dan-tc-vit-nam.pdf
252. https://vanban.org/van-ban/luat-lam-nghiep-2017-16-2017-qh14/dieu-86
253. https://baomoi.com/doi-thay-tren-que-huong-cach-mang-c55853993.epi
254. https://dsvh.gov.vn/nghi-le-goi-dau-lung-ta-cua-nguoi-thai-trang-3266
255. https://baosonla.vn/van-hoa-son-la/xay-dung-doi-song-van-hoa-vung-dat-ben-song-da-7420.html
256. https://nongnghiepmoitruong.vn/vang-trang-noi-dinh-troi-ta-xua-i274620.html
257. https://baosonla.vn/khoa-hoc-va-cong-nghe-son-la/ngat-huong-che-ta-xua-fuKP2SKNg.html
258. https://vov4.vov.vn/xodang/node/94
259. https://nongthonmoi.sonla.gov.vn/index.php?act=view&id=1453&module=news
260. http://www.baosonla.org.vn/phu-yen/mau-xanh-rung-tuong-giap-20989.html
261. http://www.baosonla.org.vn/phu-yen/gia-phu-lam-tot-cong-tac-quan-ly-bao-ve-pcccr-22683.html
262. https://nongthonmoi.danviet.vn/ve-mien-que-co-tich-ngoc-chien-trai-nghiem-diem-du-lich-cong-dong-dat-hang-ocop-4-sao-d23733.html
263. https://dulich.reatimes.vn/xim-vang-mua-tao-meo-tro-bong-202300599.htm
264. https://bacyen.sonla.gov.vn/diem-tham-quan/hut-hon-ve-dep-pu-nhi-nui-biec-chim-trong-suong-chieu-bac-yen-517434
265. https://vietnamtourism.gov.vn/post/49253
266. https://baosonla.vn/kinh-te/cay-thao-qua-duoi-tan-la-rung-51963.html
267. https://vietnamtourism.gov.vn/post/44189
268. https://nongthonmoi.sonla.gov.vn/index.php?act=view&id=1558
269. https://laodong.vn/lao-dong-cuoi-tuan/ban-sac-nha-san-truyen-thong-cua-nguoi-thai-o-son-la-1253845.ldo
270. https://baosonla.vn/van-hoa-xa-hoi/pac-nga-giu-nghe-truyen-thong-in0zJYXDg.html
271. https://sonlatv.vn/le-hoi-xen-muong-pac-nga-hoi-tu-tinh-hoa-nghe-truyen-thong-dan-toc-thai-27088.html
272. https://baomoi.com/rung-xanh-muong-leo-c41817562.epi
273. https://giaotrinh.net/kien-thuc-ban-dia-ve-su-dung-lam-san-ngoai-go-tai-khu-rung-dac-dung-sop-cop-tinh-son-la-3855/
274. https://congdankhuyenhoc.vn/nguoi-thai-dung-nha-san-179220822161040532.htm
275. https://baosonla.org.vn/xa-hoi/pung-banh-phu-xanh-dat-trong-doi-troc-cnAXNPhNR.html
276. https://baosonla.vn/xa-hoi/pung-banh-phu-xanh-dat-trong-doi-troc-cnAXNPhNR.html
277. https://baosonla.vn/sop-cop/can-ngan-chan-tinh-trang-lan-chiem-dat-rung-lam-nuong-19559.html
278. http://www.baosonla.org.vn/phong-su/can-ngan-chan-tinh-trang-lan-chiem-dat-rung-lam-nuong-r19553.html
279. http://www.baosonla.org.vn/song-ma/doan-khao-sat-ban-noi-chinh-tinh-uy-lam-viec-voi-hai-huyen-song-ma-va-sop-cop-0eP8a9zIR.html
280. https://baosonla.vn/nong-thon-moi/chieng-lao-no-luc-xay-dung-ntm-53594.html
281. https://baosonla.vn/bien-phong-son-la/xuan-lao-kho-39954.html
282. https://dantocphattrien.vietnamnet.vn/giai-quyet-sinh-ke-ben-vung-cho-nguoi-dan-mien-nui-yeu-to-can-co-trong-xay-dung-nong-thon-moi-5177.html
283. https://baoangiang.com.vn/khai-thac-tiem-nang-du-lich-sinh-thai-a486712.html
284. https://baosonla.vn/van-ho/phoi-hop-nghien-cuu-bao-ton-phat-trien-gia-tri-che-shan-tuyet-co-tai-huyen-van-ho-61Szz0VHg.html
285. https://vntravel.org.vn/long-sap-lan-toa-sac-mau-van-hoa-vung-cao-ket-noi-phat-trien-du-lich-son-la-hung-yen-a9639.html
286. https://baosonla.vn/vi/bai-viet/phu-yen-phat-trien-cay-duoc-lieu-35211
287. nhandan.vn (5/2022) – Phát triển cây dược liệu đặc hữu vùng Tây Bắc
288. baolaichau.vn (1/2025) – Khai thác tiềm năng phát triển cây dược liệu
289. NQ 1681/NQ-UBTVQH15 (2025) sáp nhập ĐVHC tỉnh Lai Châu
290. NQ 1681/NQ-UBTVQH15 (2025) sáp nhập ĐVHC tỉnh Sơn La
291. NQ 1661/NQ-UBTVQH15 (2025) sáp nhập ĐVHC tỉnh Điện Biên
292. thongtindoingoai.sonla.gov.vn (10/2026) – KBTTN Mường La phát triển cây dược liệu dưới tán rừng
293. nc23.cnnd.vn (11/2025) – Sơn La thúc đẩy ngành dược liệu

## Ghi chú

- Mảng dữ liệu cấp dân tộc (`public/data/dan_toc.json` — nội dung tri thức theo từng dân tộc, bài thuốc, mẫu thông tin) hiển thị trong bảng “Thông tin địa bàn” và KHÔNG có tọa độ nên không nằm trong danh sách điểm này.
- Các mảng `phu_yen_indigenous_knowledge`, `vac_models`, `irrigation` trong `phu_yen_layers.json` đã được gộp vào `tri_thuc_ban_dia.json` (xác nhận trong chú thích tệp và mã nguồn `WebGIS goc.tsx`), vì vậy không liệt kê trùng ở đây.
- Một số điểm có mã xã thuộc đơn vị hành chính các tỉnh giáp ranh (Điện Biên, Lai Châu, Lào Cai) — tên xã đối chiếu từ tệp `xa_dienbien/xa_laichau/xa_laocai.geojson`.
