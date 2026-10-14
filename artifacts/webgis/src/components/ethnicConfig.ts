// Cấu hình dùng chung cho lược đồ mặt cắt & nông lịch theo từng dân tộc
// Đặt tại: src/components/ethnicConfig.ts

import type { CSSProperties } from "react";

export type EthnicKey = "thai" | "mong" | "muong";

export const ETHNIC_KEYS: EthnicKey[] = ["thai", "mong", "muong"];

export const ETHNIC_META: Record<EthnicKey, { ten: string; mau: string }> = {
  thai:  { ten: "Thái",  mau: "#2d6a4f" },
  mong:  { ten: "Mông",  mau: "#b5179e" },
  muong: { ten: "Mường", mau: "#e76f51" },
};

/** id dân tộc trong dan_toc.json → EthnicKey (trả về null nếu dân tộc chưa có lược đồ/nông lịch riêng) */
export const toEthnicKey = (id?: string | null): EthnicKey | null =>
  id === "thai" || id === "mong" || id === "muong" ? id : null;

/** Thanh tab chọn dân tộc dùng chung cho 2 modal */
export const ethnicTabStyle = (active: boolean, color: string): CSSProperties => ({
  padding: "6px 14px",
  borderRadius: 999,
  border: `1.5px solid ${color}`,
  background: active ? color : "transparent",
  color: active ? "#fff" : color,
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
});

export interface SourceRef { text: string; url: string; }

/** Nguồn đã dùng để rà soát lược đồ mặt cắt */
export const TRANSECT_SOURCES: SourceRef[] = [
  { text: "Tạp chí Dân tộc học — tri thức dân gian của người Thái (mương, phai, lái, lìn)", url: "https://vjol.info.vn/tapchiviendantochoc/article/download/128504/105394/" },
  { text: "Đại học Tây Bắc — Bảo vệ rừng của người Thái tỉnh Sơn La", url: "https://fss.utb.edu.vn/wp-content/uploads/2021/06/1-1.pdf" },
  { text: "Tạp chí Dân tộc học — phân bố cư trú theo địa hình của các dân tộc miền núi phía Bắc", url: "https://vjol.info.vn/tapchiviendantochoc/article/download/125785/103240/" },
  { text: "Báo Pháp luật — thảo quả mọc ở độ cao trên 1.000 m, dưới tán rừng", url: "https://baophapluat.vn/nho-huong-vi-to-ho-cua-nui-rung-tay-bac-post383414.html" },
];
export const TRANSECT_NOTE = "Lược đồ mang tính minh họa về xu hướng cư trú và sinh kế theo đai độ cao, không phải số liệu đo đạc. Các khoảng độ cao (mét) trong bản cũ không có nguồn nên đã được bỏ.";

/** Nguồn đã dùng để rà soát nông lịch */
export const CALENDAR_SOURCES: SourceRef[] = [
  { text: "Báo Nông nghiệp & Môi trường — Lai Châu: vệ sinh đồng, nạo vét mương từ đầu tháng 1, lịch gieo cấy lúa", url: "https://nongnghiepmoitruong.vn/lai-chau-dieu-chinh-lich-gieo-cay-linh-hoat-tranh-ret-dam-ret-hai-d796188.html" },
  { text: "Báo Nông nghiệp & Môi trường — Nông dân Sơn La hối hả sản xuất vụ xuân", url: "https://nongnghiepmoitruong.vn/nong-dan-son-la-hoi-ha-san-xuat-vu-xuan-d798748.html" },
  { text: "Báo Lào Cai — Hoàn thành cấy lúa xuân trong tháng 3", url: "https://baolaocai.vn/hoan-thanh-cay-lua-xuan-trong-thang-3-post764609.html" },
  { text: "Báo Văn hóa — Xên bản, xên mường ở Pắc Ngà", url: "https://baovanhoa.vn/dan-toc-ton-giao/xen-ban-xen-muong-phong-tuc-doc-dao-cua-nguoi-thai-o-pac-nga-208745.html" },
  { text: "Báo Pháp luật — Mùa hoa ban, lễ hội Mùa hoa ban Sơn La", url: "https://baophapluat.vn/chuoi-su-kien-se-dien-ra-tai-le-hoi-mua-hoa-ban-o-son-la-post468771.html" },
  { text: "Viet Nam News — Mông ethnic people celebrate new year", url: "https://vietnamnews.vn/life-style/570458/mong-ethnic-people-celebrate-new-year.html" },
  { text: "Báo Văn hóa — Lễ hội Gầu Tào là Di sản văn hóa phi vật thể quốc gia", url: "https://baovanhoa.vn/van-hoa/le-hoi-gau-tao-la-di-san-van-hoa-phi-vat-the-quoc-gia-cua-nguoi-mong-o-yen-bai-101859.html" },
  { text: "Báo Pháp luật — thảo quả ra quả vào mùa đông, khoảng tháng 11–12", url: "https://baophapluat.vn/nho-huong-vi-to-ho-cua-nui-rung-tay-bac-post383414.html" },
];
export const CALENDAR_NOTE = "Mục có dấu ✓ đã có nguồn tham khảo (rê chuột để xem); mục có dấu ⚠ chưa có nguồn xác minh — cần đối chiếu với cộng đồng hoặc cơ quan chuyên môn. Lễ hội âm lịch dịch chuyển theo năm trong khoảng 1 tháng dương lịch.";
