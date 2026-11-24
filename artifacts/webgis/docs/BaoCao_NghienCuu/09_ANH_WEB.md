### J.5. Nông lịch và lược đồ mặt cắt mặc định

Hệ thống đi kèm dữ liệu mẫu nông lịch (lịch canh tác 12 tháng theo nhóm hoạt động) cho ba dân tộc Thái — Mông — Mường và lược đồ mặt cắt (các đai sinh thái theo độ cao) cho cùng ba dân tộc, kèm bảng phân bố dân tộc theo đai. Dữ liệu mẫu được nhúng ngay trong chương trình, hiển thị trong cửa sổ “Nông lịch” và “Lược đồ mặt cắt” mở từ khối tri thức; người dùng chỉnh sửa trực tiếp trên giao diện và lưu đè theo phiên. Nguồn tham khảo dùng để rà soát nội dung được liệt kê sẵn trong cấu hình dân tộc (Đoạn mã H.14): bốn nguồn cho lược đồ mặt cắt và tám nguồn cho nông lịch. Toàn bộ dữ liệu mẫu như sau.

**Đoạn mã J.4. Dữ liệu nông lịch mặc định (Thái, Mông, Mường)**

*Trích từ* `src/components/SeasonalCalendar.tsx`, dòng 4–93.

```tsx
const N_MUONG_LAICHAU = "Báo Nông nghiệp & Môi trường: Lai Châu vệ sinh đồng, nạo vét mương từ đầu tháng 1";
const N_LUA_XUAN = "Báo Lào Cai / Báo Nông nghiệp & Môi trường: gieo cấy lúa xuân quanh Lập xuân, hoàn thành trong tháng 3";
const N_XEN = "Báo Văn hóa (Pắc Ngà), VOV: Xên bản/Xên mường vào khoảng tháng Giêng âm lịch, tháng 2–3 dương lịch";
const N_HOABAN = "Báo Pháp luật: hoa ban nở, lễ hội Mùa hoa ban Sơn La tháng 3";
const N_NAOPE = "Viet Nam News / SGGP: Tết Mông cuối tháng 11–đầu tháng 12 âm lịch";
const N_GAUTAO = "Báo Văn hóa: Gầu Tào tổ chức từ mùng 1 đến rằm tháng Giêng âm lịch";
const N_THAOQUA = "Báo Pháp luật: thảo quả thu hái khoảng tháng 11–12";
const N_TET = "Lịch âm–dương: Tết Nguyên Đán rơi vào cuối tháng 1 đến giữa tháng 2 dương lịch";

export interface CalendarActivity { ten: string; months: number[]; color: string; nguon?: string; }
export interface CalendarGroup { nhom: string; mau: string; activities: CalendarActivity[]; }

export const DEFAULT_ACTIVITIES_BY_ETHNIC: Record<EthnicKey, CalendarGroup[]> = {
  thai: [
    { nhom: "🌾 Lúa nước", mau: "#52b788", activities: [
      { ten: "Làm đất, tu sửa mương-phai", months: [1,2], color: "#74c69d", nguon: N_MUONG_LAICHAU },
      { ten: "Gieo mạ, cấy lúa vụ xuân", months: [2,3], color: "#40916c", nguon: N_LUA_XUAN },
      { ten: "Chăm sóc, làm cỏ", months: [4,5,6,7], color: "#52b788" },
      { ten: "Thu hoạch lúa xuân", months: [6,7], color: "#b7e4c7" },
      { ten: "Cấy lúa mùa", months: [6,7], color: "#40916c" },
      { ten: "Thu hoạch lúa mùa + Ủ phân hữu cơ", months: [10,11], color: "#b7e4c7" },
      { ten: "Lễ cúng cơm mới, xuống đồng", months: [11,12], color: "#d8f3dc" },
    ]},
    { nhom: "🌲 Lâm sản & Rừng", mau: "#2d6a4f", activities: [
      { ten: "Thu hái lâm sản phụ (măng, rau)", months: [4,5,6,7,8], color: "#52b788" },
      { ten: "Thu hái chè Shan tuyết", months: [3,4,5,9,10], color: "#40916c" },
      { ten: "Trồng rừng, tu bổ", months: [2,3,7,8], color: "#74c69d" },
    ]},
    { nhom: "🐟 Thủy sản & Chăn nuôi", mau: "#4895ef", activities: [
      { ten: "Thả cá (ruộng, ao)", months: [4,5,6], color: "#4895ef" },
      { ten: "Đánh bắt cá suối (mùa khô)", months: [12,1,2,3], color: "#023e8a" },
      { ten: "Thu hoạch cá ao-ruộng", months: [10,11], color: "#4895ef" },
      { ten: "Mổ lợn, trữ thịt dịp Tết", months: [12,1], color: "#e07070" },
    ]},
    { nhom: "🌿 Cây thuốc & Thu hái", mau: "#e63946", activities: [
      { ten: "Thu hái lá cây thuốc tươi", months: [5,6,7,8,9], color: "#52b788" },
      { ten: "Thu hoạch củ, rễ cây thuốc", months: [10,11,12], color: "#e63946" },
      { ten: "Sơ chế, phơi sấy thuốc", months: [10,11,12,1], color: "#f4a261" },
      { ten: "Tắm lá sau sinh (quanh năm)", months: [1,2,3,4,5,6,7,8,9,10,11,12], color: "#74c69d" },
    ]},
    { nhom: "🎊 Lễ hội & Văn hóa", mau: "#ffd166", activities: [
      { ten: "Tết Nguyên Đán", months: [1,2], color: "#ffd166", nguon: N_TET },
      { ten: "Lễ Xên Bản, Xên Mường (cúng bản, cúng mường)", months: [2,3], color: "#f4a261", nguon: N_XEN },
      { ten: "Lễ hội Hoa Ban", months: [2,3], color: "#ff9ef5", nguon: N_HOABAN },
      { ten: "Lễ xuống đồng (cầu mùa)", months: [2,3], color: "#b7e4c7" },
      { ten: "Lễ cúng rừng thiêng", months: [3,4], color: "#2d6a4f" },
    ]},
  ],
  mong: [
    { nhom: "⛰️ Nương rẫy", mau: "#b5179e", activities: [
      { ten: "Phát nương, đốt rẫy", months: [2,3], color: "#e9c46a" },
      { ten: "Trồng ngô lần 1", months: [3,4], color: "#f4a261" },
      { ten: "Thu hoạch ngô đợt 1", months: [7,8], color: "#e76f51" },
      { ten: "Trồng ngô lần 2 + Đậu tương", months: [8,9], color: "#f4a261" },
      { ten: "Thu hoạch ngô + Sắn", months: [11,12,1], color: "#e76f51" },
    ]},
    { nhom: "🌲 Lâm sản & Rừng", mau: "#2d6a4f", activities: [
      { ten: "Thu hái lâm sản phụ (măng, rau)", months: [4,5,6,7,8], color: "#52b788" },
      { ten: "Thu hoạch thảo quả", months: [11,12], color: "#1b4332", nguon: N_THAOQUA },
      { ten: "Thu hái chè Shan tuyết", months: [3,4,5,9,10], color: "#40916c" },
      { ten: "Trồng rừng, tu bổ", months: [2,3,7,8], color: "#74c69d" },
    ]},
    { nhom: "🌿 Cây thuốc & Thu hái", mau: "#e63946", activities: [
      { ten: "Thu hái lá cây thuốc tươi", months: [5,6,7,8,9], color: "#52b788" },
      { ten: "Thu hoạch củ, rễ cây thuốc", months: [10,11,12], color: "#e63946" },
      { ten: "Sơ chế, phơi sấy thuốc", months: [10,11,12,1], color: "#f4a261" },
    ]},
    { nhom: "🎊 Lễ hội & Văn hóa", mau: "#ffd166", activities: [
      { ten: "Tết Mông (Nào Pê Chầu)", months: [12,1], color: "#9b5de5", nguon: N_NAOPE },
      { ten: "Lễ Gầu Tào", months: [2,3], color: "#9b5de5", nguon: N_GAUTAO },
      { ten: "Lễ cúng rừng thiêng", months: [3,4], color: "#2d6a4f" },
    ]},
  ],
  // Dữ liệu khởi tạo — cần xác minh với cộng đồng người Mường tại địa phương rồi chỉnh sửa trực tiếp trong modal
  muong: [
    { nhom: "🌾 Lúa nước", mau: "#52b788", activities: [
      { ten: "Làm đất, tu sửa mương", months: [1,2], color: "#74c69d", nguon: N_MUONG_LAICHAU },
      { ten: "Gieo mạ, cấy lúa vụ xuân", months: [2,3], color: "#40916c", nguon: N_LUA_XUAN },
      { ten: "Chăm sóc, làm cỏ", months: [4,5,6,7], color: "#52b788" },
      { ten: "Thu hoạch lúa", months: [6,7,10,11], color: "#b7e4c7" },
    ]},
    { nhom: "🌲 Lâm sản & Rừng", mau: "#2d6a4f", activities: [
      { ten: "Thu hái lâm sản phụ (măng, rau)", months: [4,5,6,7,8], color: "#52b788" },
    ]},
    { nhom: "🎊 Lễ hội & Văn hóa", mau: "#ffd166", activities: [
      { ten: "Tết Nguyên Đán", months: [1,2], color: "#ffd166", nguon: N_TET },
      { ten: "Lễ xuống đồng (cầu mùa)", months: [2,3], color: "#b7e4c7" },
    ]},
  ],
};
```

**Đoạn mã J.5. Dữ liệu lược đồ mặt cắt và vùng phân bố dân tộc mặc định**

*Trích từ* `src/components/TransectDiagram.tsx`, dòng 4–37.

```tsx
export interface TransectZone { label: string; color: string; textColor: string; items: string[]; symbol: string; }
export interface EthnicZone { dan_toc: string; mau: string; vi_tri: string; }

export const DEFAULT_ZONES_BY_ETHNIC: Record<EthnicKey, TransectZone[]> = {
  thai: [
    { label: "Đỉnh núi", color: "#2d6a4f", textColor: "#d8f3dc", symbol: "🌲", items: ["Rừng đầu nguồn", "Rừng thiêng (đông mường)", "Nguồn nước đầu suối"] },
    { label: "Sườn trên", color: "#52b788", textColor: "#d8f3dc", symbol: "🌿", items: ["Rừng ma, rừng cấm bản", "Lâm sản phụ (măng, rau rừng)", "Cây thuốc quý"] },
    { label: "Sườn giữa", color: "#b7e4c7", textColor: "#1b4332", symbol: "🌾", items: ["Nương ngô, sắn", "Cây ăn quả xen canh", "Đầu hệ thống mương-phai"] },
    { label: "Sườn thấp", color: "#f4a261", textColor: "#1b4332", symbol: "🏡", items: ["Bản làng nhà sàn", "Vườn (V): Cây ăn quả", "Ao (A): Cá chép, trắm", "Chuồng (C): Lợn, gà, trâu"] },
    { label: "Thung lũng", color: "#74c69d", textColor: "#1b4332", symbol: "💧", items: ["Lúa nước 2-3 vụ", "Lúa-cá-vịt kết hợp", "Mương - phai - lái - lìn, cọn nước", "Bản làng ven sông"] },
  ],
  mong: [
    { label: "Đỉnh núi", color: "#2d6a4f", textColor: "#d8f3dc", symbol: "🌲", items: ["Rừng già nguyên sinh", "Rừng thiêng", "Nguồn nước đầu suối"] },
    { label: "Sườn trên", color: "#52b788", textColor: "#d8f3dc", symbol: "🏔️", items: ["Bản làng người Mông", "Nương ngô, lúa nương", "Thảo quả, Sơn tra", "Chè Shan tuyết"] },
    { label: "Sườn giữa", color: "#b7e4c7", textColor: "#1b4332", symbol: "🌽", items: ["Nương ngô, sắn, đậu tương", "Ruộng bậc thang", "Hàng rào xanh chống xói mòn"] },
    { label: "Sườn thấp", color: "#f4a261", textColor: "#1b4332", symbol: "🐎", items: ["Chăn nuôi (ngựa, dê, lợn)", "Vườn cây ăn quả"] },
  ],
  // Dữ liệu khởi tạo — cần xác minh với cộng đồng người Mường tại địa phương rồi chỉnh sửa trực tiếp trong modal
  muong: [
    { label: "Núi cao", color: "#2d6a4f", textColor: "#d8f3dc", symbol: "🌲", items: ["Rừng đầu nguồn", "Rừng cấm / rừng thiêng"] },
    { label: "Sườn đồi", color: "#b7e4c7", textColor: "#1b4332", symbol: "🌾", items: ["Nương rẫy", "Cây ăn quả, cây lâm sản phụ"] },
    { label: "Chân núi", color: "#f4a261", textColor: "#1b4332", symbol: "🏡", items: ["Bản làng nhà sàn", "Vườn - Ao - Chuồng"] },
    { label: "Thung lũng", color: "#74c69d", textColor: "#1b4332", symbol: "💧", items: ["Lúa nước", "Hệ thống mương dẫn nước"] },
  ],
};

export const DEFAULT_ETHNIC_ZONES: EthnicZone[] = [
  { dan_toc: "Người Mông", mau: "#b5179e", vi_tri: "Đỉnh & Sườn trên" },
  { dan_toc: "Người Dao", mau: "#f4a261", vi_tri: "Sườn trên & giữa" },
  { dan_toc: "Người Thái", mau: "#2d6a4f", vi_tri: "Sườn thấp & thung lũng" },
  { dan_toc: "Người Mường", mau: "#e76f51", vi_tri: "Chân núi & thung lũng" },
  { dan_toc: "Người Khơ Mú", mau: "#6d6875", vi_tri: "Sườn thấp & ven suối" },
  { dan_toc: "Người Kinh", mau: "#e63946", vi_tri: "Trung tâm thị trấn" },
];
```

### J.6. Hình ảnh sử dụng trên hệ thống WebGIS

Hệ thống dùng 17 ảnh chụp thực tế làm ảnh minh họa cho mục “Thông tin địa bàn” và popup bản làng: 12 ảnh chân dung, trang phục hoặc công trình của các dân tộc (dùng làm banner dân tộc chủ đạo và ảnh đại diện trong khối tri thức) và 5 ảnh địa danh (ruộng bậc thang, nhà sàn, bánh xe nước) dùng cho các bản làng có ảnh. Toàn bộ ảnh được tải từ Wikimedia Commons với giấy phép tự do (CC0, CC BY hoặc CC BY-SA), ghi công đầy đủ trong tệp `NGUON_ANH.md` của dự án và được hiển thị ngay dưới ảnh trên giao diện; các tệp ảnh được sao chép vào thư mục `images/web/` của báo cáo. Danh mục nguồn xem Bảng J.3 và Bảng J.4; ảnh được trình bày tại Hình J.1–J.17.

**Bảng J.3. Danh mục ảnh dân tộc (12 ảnh — thư mục `data/images/dan_toc/`)**

| STT | Tệp | Nội dung | Tác giả | Giấy phép |
|---|---|---|---|---|
| 1 | `thai.jpg` | Phụ nữ dân tộc Thái ở Việt Nam | DTH-BD-NVT | CC BY-SA 4.0 |
| 2 | `mong.jpg` | Phụ nữ Mông trang phục truyền thống | DTH-BD-NVT | CC BY-SA 4.0 |
| 3 | `muong.jpg` | Trò mảng của người Mường (Hòa Bình) | Tong Van Tuan Anh | CC BY 2.0 |
| 4 | `dao.jpg` | Phụ nữ dân tộc Dao tại Sa Pa | Strogonoff | CC BY-SA 3.0 |
| 5 | `lu.jpg` | Người Lự ở Lai Châu | Nguyễn Thanh Quang | CC BY-SA 3.0 |
| 6 | `mang.jpg` | Trang phục người Mang (Bảo tàng Dân tộc học) | Daderot | CC0 |
| 7 | `kinh.jpg` | Trang phục truyền thống dân tộc Kinh | Hoangkid | CC BY 3.0 |
| 8 | `tay.jpg` | Hát Then của dân tộc Tày (VQG Ba Bể) | Ba Be National Park | CC BY-SA 3.0 |
| 9 | `giay.jpg` | Phụ nữ dân tộc Giáy ở Tả Van, Sa Pa | June Owen | CC BY-SA 4.0 |
| 10 | `ha_nhi.jpg` | Nhà truyền thống người Hà Nhì (Bảo tàng Dân tộc học) | NamHyHoangPhong | CC BY-SA 3.0 |
| 11 | `nung.jpg` | Người Nùng nổi tiếng với nghề rèn (Cao Bằng) | Stephan Klage | CC BY-SA 3.0 |
| 12 | `phu_la.jpg` | Trang phục truyền thống dân tộc Phù Lá | Viethavvh | Public domain |

**Bảng J.4. Danh mục ảnh địa điểm (5 ảnh — thư mục `data/images/dia_diem/`)**

| STT | Tệp | Nội dung | Dùng cho bản làng | Tác giả | Giấy phép |
|---|---|---|---|---|---|
| 1 | `yty.jpg` | Thung lũng Y Tý (Bát Xát, Lào Cai) | Y Tý (02701) | Kiếm Anh | CC BY-SA 4.0 |
| 2 | `mucangchai.jpg` | Ruộng bậc thang Mù Cang Chải (ảnh đại diện loại cảnh) | Séo Mý Tỷ (03013) | Gió Đồng | Public domain |
| 3 | `sapa.jpg` | Ruộng bậc thang Sa Pa (ảnh đại diện vùng Sa Pa) | Lao Chải (04474) | Eerin25 | CC0 |
| 4 | `thai_stilt_house.jpg` | Nhà sàn Thái (Mai Châu, Hòa Bình) — ảnh đại diện | Mường So (03549) | Greg Willis | CC BY-SA 2.0 |
| 5 | `con_nuoc.jpg` | Bánh xe nước (Bình Chuẩn, Con Cuông, Nghệ An) — ảnh đại diện loại hình cọn/guồng nước | Bản Bo (03424) | KoheiU | CC0 |

Các ảnh dưới đây được trình bày theo đúng thứ tự danh mục; ảnh 1–12 dùng trong banner và hồ sơ dân tộc, ảnh 13–17 dùng trong thẻ bản làng tiêu biểu.

![Phụ nữ dân tộc Thái](images/web/thai.jpg)

*Hình J.1 — Phụ nữ dân tộc Thái ở Việt Nam; ảnh: DTH-BD-NVT, giấy phép CC BY-SA 4.0.*

![Phụ nữ Mông trang phục truyền thống](images/web/mong.jpg)

*Hình J.2 — Phụ nữ Mông trang phục truyền thống; ảnh: DTH-BD-NVT, giấy phép CC BY-SA 4.0.*

![Trò mảng của người Mường](images/web/muong.jpg)

*Hình J.3 — Trò mảng của người Mường (Hòa Bình); ảnh: Tong Van Tuan Anh, giấy phép CC BY 2.0.*

![Phụ nữ dân tộc Dao tại Sa Pa](images/web/dao.jpg)

*Hình J.4 — Phụ nữ dân tộc Dao tại Sa Pa; ảnh: Strogonoff, giấy phép CC BY-SA 3.0.*

![Người Lự ở Lai Châu](images/web/lu.jpg)

*Hình J.5 — Người Lự ở Lai Châu; ảnh: Nguyễn Thanh Quang, giấy phép CC BY-SA 3.0.*

![Trang phục người Mang](images/web/mang.jpg)

*Hình J.6 — Trang phục người Mang (Bảo tàng Dân tộc học); ảnh: Daderot, giấy phép CC0.*

![Trang phục truyền thống dân tộc Kinh](images/web/kinh.jpg)

*Hình J.7 — Trang phục truyền thống dân tộc Kinh; ảnh: Hoangkid, giấy phép CC BY 3.0.*

![Hát Then của dân tộc Tày](images/web/tay.jpg)

*Hình J.8 — Hát Then của dân tộc Tày (Vườn quốc gia Ba Bể); ảnh: Ba Be National Park, giấy phép CC BY-SA 3.0.*

![Phụ nữ dân tộc Giáy ở Tả Van](images/web/giay.jpg)

*Hình J.9 — Phụ nữ dân tộc Giáy ở Tả Van, Sa Pa; ảnh: June Owen, giấy phép CC BY-SA 4.0.*

![Nhà truyền thống người Hà Nhì](images/web/ha_nhi.jpg)

*Hình J.10 — Nhà truyền thống người Hà Nhì (Bảo tàng Dân tộc học); ảnh: NamHyHoangPhong, giấy phép CC BY-SA 3.0.*

![Người Nùng nghề rèn](images/web/nung.jpg)

*Hình J.11 — Người Nùng nổi tiếng với nghề rèn (Cao Bằng); ảnh: Stephan Klage, giấy phép CC BY-SA 3.0.*

![Trang phục truyền thống dân tộc Phù Lá](images/web/phu_la.jpg)

*Hình J.12 — Trang phục truyền thống dân tộc Phù Lá; ảnh: Viethavvh, giấy phép phạm vi công cộng (public domain).*

![Thung lũng Y Tý](images/web/yty.jpg)

*Hình J.13 — Thung lũng Y Tý (Bát Xát, Lào Cai); ảnh: Kiếm Anh, giấy phép CC BY-SA 4.0; dùng cho bản Y Tý.*

![Ruộng bậc thang Mù Cang Chải](images/web/mucangchai.jpg)

*Hình J.14 — Ruộng bậc thang Mù Cang Chải; ảnh: Gió Đồng, giấy phép phạm vi công cộng; dùng cho bản Séo Mý Tỷ (ảnh đại diện loại cảnh).*

![Ruộng bậc thang Sa Pa](images/web/sapa.jpg)

*Hình J.15 — Ruộng bậc thang Sa Pa; ảnh: Eerin25, giấy phép CC0; dùng cho bản Lao Chải (ảnh đại diện vùng Sa Pa).*

![Nhà sàn Thái tại Mai Châu](images/web/thai_stilt_house.jpg)

*Hình J.16 — Nhà sàn Thái (Mai Châu, Hòa Bình); ảnh: Greg Willis, giấy phép CC BY-SA 2.0; dùng cho bản Mường So (ảnh đại diện).*

![Bánh xe nước Bình Chuẩn](images/web/con_nuoc.jpg)

*Hình J.17 — Bánh xe nước (Bình Chuẩn, Con Cuông, Nghệ An); ảnh: KoheiU, giấy phép CC0; dùng cho bản Bản Bo (ảnh đại diện loại hình cọn, guồng nước).*

Giấy phép CC BY và CC BY-SA yêu cầu giữ ghi công khi tái sử dụng; hệ thống thực hiện yêu cầu này bằng cách hiển thị dòng “Nguồn ảnh” ngay dưới mỗi ảnh trên giao diện. Với các ảnh chỉ mang tính đại diện loại cảnh hoặc đại diện vùng, trường `anh_ghichu` của bản làng ghi rõ nội dung đại diện để người dùng không hiểu nhầm là ảnh chụp tại chính bản đó.
