import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EditableValue from "../components/EditableValue";
import ImportModal, { type WardOverrides, type EthnicOverride, type PdfFile, type DanTocTyLe, type MucNoiDung } from "../components/ImportModal";
import LayerControl, { type NewLayerInput, type LayerCategory, SPECIAL_LAYER_IDS, SPECIAL_LAYER_CATEGORY_ID } from "../components/LayerControl goc";
import TransectDiagram, { DEFAULT_ZONES_BY_ETHNIC, DEFAULT_ETHNIC_ZONES, type TransectZone, type EthnicZone } from "../components/TransectDiagram";
import SeasonalCalendar, { DEFAULT_ACTIVITIES_BY_ETHNIC, type CalendarGroup } from "../components/SeasonalCalendar";
import { toEthnicKey, type EthnicKey } from "../components/ethnicConfig";
import IndigenousKnowledge, { DEFAULT_KNOWLEDGE, type KnowledgeSection } from "../components/IndigenousKnowledge";
import AnnotationModal, { type Annotation } from "../components/AnnotationModal";
import LayerDataEditor from "../components/LayerDataEditor";
import { syncKnowledgeLayerIds, isKnowledgeLayer, type KnowledgeLayerDef } from "../utils/knowledgeLayers";
import LayerSymbologyEditorModal, { type LayerSymbologyConfig } from "../components/LayerSymbologyEditorModal"; import WardStyleEditorModal, { type WardStyleValue } from "../components/WardStyleEditorModal";
import WardPieSelector from "../components/WardPieSelector";
import WardEthnicEditorModal from "../components/WardEthnicEditorModal";
import EthnicDetailPanel from "../components/EthnicDetailPanel";
import Earth3DModal from "../components/Earth3DModal";
import MapComposer, { type ComposerLegendSection, type ComposerLegendRow } from '@/components/MapComposer';
import { STORAGE, readJson, writeJsonIfChanged, mapToRec, recToMap, registerQuotaHandler } from "@/utils/persist";
import { getSyncState, subscribeSync, retrySync, syncEnabled, type SyncState } from "@/utils/sync";
import html2canvas from "html2canvas";
import { Printer } from 'lucide-react';
import { useLocation } from "wouter";

interface CustomLayer { id: string; categoryId: string; ten: string; mau: string; bieu_tuong: string; geomType: "point" | "line" | "polygon"; }
interface LayerCategoryState { id: string; ten: string; icon: string; collapsed?: boolean; layers: { id: string; ten: string; mau: string; bieu_tuong: string; iconOnly?: boolean; isThematic?: boolean; isThematicCopy?: boolean; thematicSource?: string }[]; }

/* ─── Types ─── */
interface WardProperties { ma_xa: string; ten_xa: string; loai?: string; dtich_km2?: number; dan_so?: number; matdo_km2?: number; ten_tinh?: string; dan_toc?: DanTocTyLe[]; dan_toc_trang_thai?: string; dan_toc_nguon?: string[]; dan_toc_ghi_chu?: string; dac_diem?: string; dac_diem_nguon?: string[]; dac_diem_trang_thai?: string; dan_so_nguon?: string; dan_so_ky?: string; dtts_so?: number; muc_noi_dung?: MucNoiDung[]; anh_dia_ban?: string; anh_dia_ban_ghichu?: string; }
interface GeoJsonData { type: string; features: { type: string; properties: Record<string, unknown>; geometry: unknown }[]; }
interface BaiThuoc { ten: string; nguyen_lieu: string; cong_dung: string; }
interface TriThuc { chu_de: string; bieu_tuong: string; noi_dung: string; bai_thuoc: BaiThuoc[]; }
interface DanTocInfo { id: string; ten: string; mau: string; dan_so_ca_nuoc: number; ngon_ngu: string; mo_ta: string; tri_thuc: TriThuc[]; anh?: string; anh_ghichu?: string; nguon?: string[]; ghi_chu_nguon?: string; }
interface DanTocData { dan_toc: DanTocInfo[]; }
interface ProvinceStat { dien_tich: string; dan_so: string; don_vi: number; }
interface LayersData {
  rivers: { id?: string; ten: string; ten_dia_phuong: string; coords: number[][]; cap_song?: number; width?: number; mo_ta?: string; trang_thai?: string; nguon?: string[]; ghi_chu?: string }[];
  irrigation: { id?: string; ten: string; ten_dia_phuong: string; loai: string; lat: number; lng: number; mo_ta: string; anh?: string; anh_ghichu?: string; trang_thai?: string; nguon?: string[]; ghi_chu?: string }[];
  villages?: { id?: string; ten: string; dan_toc: string; lat: number; lng: number; mo_ta: string; ten_xa?: string; ten_huyen?: string; ten_tinh?: string; ma_xa?: string; ghi_chu?: string; anh?: string; anh_ghichu?: string; trang_thai?: string; nguon?: string[] }[];
  forests: { id?: string; ten: string; ten_dia_phuong: string; loai: string; coords: number[][] | number[][][]; dien_tich_ha?: number; iucn?: string; nam_cong_bo?: number; mo_ta: string; trang_thai?: string; nguon?: string[] }[];
  vac_models: { id?: string; ten: string; loai: string; lat: number; lng: number; mo_ta: string; thanh_phan: string[] | string; trang_thai?: string; nguon?: string[]; ghi_chu?: string }[];
  medicinal_plants: { id?: string; ten: string; ten_dia_phuong?: string; ten_khoa_hoc: string; coords?: number[][] | number[][][]; lat?: number; lng?: number; dien_tich_ha?: number; cong_dung: string; tinh_trang?: string; "tình_trang"?: string; dan_toc_dung: string[] | string; mo_ta?: string; trang_thai?: string; nguon?: string[]; ghi_chu?: string; scope?: string }[];
  customary_zones: { id?: string; ten: string; loai: string; mo_ta: string; coords: number[][]; ma_xa?: string; dia_ban_hien_tai?: string; trang_thai?: string; nguon?: string[]; ghi_chu?: string }[];
}

/* ─── Constants ─── */
const PROVINCE_FILES: Record<string, string> = { "Sơn La": "/data/xa_sonla.geojson", "Điện Biên": "/data/xa_dienbien.geojson", "Lai Châu": "/data/xa_laichau.geojson", "Lào Cai": "/data/xa_laocai.geojson" };
// Nguồn: Tổng điều tra dân số & nhà ở 01/4/2019 (Tổng cục Thống kê) cho 3 tỉnh giữ nguyên sau sáp nhập;
// Lào Cai theo tỉnh mới sau sáp nhập với Yên Bái (NQ 202/2025/QH15, hiệu lực 01/7/2025) — dân số 2025 (GSO).
const DEFAULT_STATS: Record<string, ProvinceStat> = { "Sơn La": { dien_tich: "14.174", dan_so: "1,25M", don_vi: 75 }, "Điện Biên": { dien_tich: "9.541", dan_so: "599K", don_vi: 45 }, "Lai Châu": { dien_tich: "9.069", dan_so: "460K", don_vi: 38 }, "Lào Cai": { dien_tich: "13.257", dan_so: "1,78M", don_vi: 99 } };
const STATS_SOURCE_DEFAULT_NOTE = "Nguồn: TĐTDS&NO 2019 (Tổng cục Thống kê) · Đơn vị hành chính sau sắp xếp 2025";
const STATS_SOURCE_NOTE: Record<string, string> = {
  "Sơn La": STATS_SOURCE_DEFAULT_NOTE,
  "Điện Biên": STATS_SOURCE_DEFAULT_NOTE,
  "Lai Châu": STATS_SOURCE_DEFAULT_NOTE,
  "Lào Cai": "Nguồn: TĐTDS&NO 2019 (Tổng cục Thống kê) · Lào Cai theo tỉnh mới sau sáp nhập Yên Bái (NQ 202/2025/QH15) · Đơn vị hành chính sau sắp xếp 2025",
};
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
/** Chuyển đường dẫn ảnh tương đối (vd: data/images/...) sang URL có BASE_PATH; giữ nguyên http/data:/blob:. */
const assetUrl = (p?: string): string => (!p ? "" : /^(https?:|data:|blob:)/.test(p) ? p : `${BASE_PATH}/${p.replace(/^\//, "")}`);
const LAYER_CONFIG_STORAGE_KEY = "webgis-layer-config";
// Bump when built-in layer content in public/data/layers.json changes (forces discard of stale saved copies)
const LAYER_DATA_REV = 7;
const LAYER_DATA_REV_KEYS = ["irrigation", "vac_models", "customary_zones", "villages"];
// Bump khi public/data/tri_thuc_ban_dia.json đổi (bản lưu của người dùng cho các lớp tri thức tự lấy lại)
const KNOWLEDGE_DATA_REV = 12;
// Lớp đã gỡ khỏi giao diện bản đồ (round 3): hiển thị văn bản theo xã trong panel "Thông tin địa bàn"
// + vòng gộp lớp: vac_models / irrigation / phu_yen_indigenous_knowledge → lớp tri thức
// + rev 12: 3 nhóm tri thức cũ (canh_tac/thuy_loi/luat_tuc) → 8 lớp L1–L7 trong nhóm "tri_thuc_ban_dia"
const REMOVED_LAYER_IDS = new Set([
  "villages", "customary_zones",
  "phu_yen_land_knowledge", "phu_yen_water_knowledge", "phu_yen_forest_knowledge",
  "vac_models", "irrigation", "phu_yen_indigenous_knowledge",
  "canh_tac_quan_ly_dat", "thuy_loi_truyen_thong", "luat_tuc_bao_ve_rung",
]);

// Cấu trúc lớp dữ liệu chuẩn hóa theo Atlat Quốc gia Việt Nam
// Thứ tự nhóm: Nền & Địa giới → Đất → Nước → Rừng (quy ước nhóm chủ đề, TT 12/2020)
const DEFAULT_LAYER_CATEGORIES = [
  { id: "base_map", ten: "Nền & Địa giới", icon: "🗺️", layers: [
    { id: "ward_boundaries", ten: "Ranh giới xã/phường", mau: "#6b4226", bieu_tuong: "🗺️" },
    { id: "population_density", ten: "Mật độ dân số (người/km²)", mau: "#2a9d8f", bieu_tuong: "📊" },
  ]},
  { id: "tri_thuc_ban_dia", ten: "Tri thức bản địa (L1–L7)", icon: "📚", layers: [
    { id: "tt_l1", ten: "L1 · Giống & canh tác bản địa", mau: "#c9a227", bieu_tuong: "🌾", iconOnly: true },
    { id: "tt_l2", ten: "L2 · Thủy lợi & nguồn nước cộng đồng", mau: "#4ea8de", bieu_tuong: "💧", iconOnly: true },
    { id: "tt_l3", ten: "L3 · Luật tục & quản lý rừng cộng đồng", mau: "#2d6a4f", bieu_tuong: "🌳", iconOnly: true },
    { id: "tt_l4", ten: "L4 · Cây thuốc, lâm sản ngoài gỗ & nghề từ rừng", mau: "#52b788", bieu_tuong: "🌿", iconOnly: true },
    { id: "tt_l5", ten: "L5 · Nghi lễ & lễ hội gắn tài nguyên", mau: "#9b5de5", bieu_tuong: "🎉", iconOnly: true },
    { id: "tt_l6", ten: "L6 · Mô hình tích hợp (VAC, nông lâm kết hợp, tuần hoàn)", mau: "#f4a261", bieu_tuong: "🐄", iconOnly: true },
    { id: "tt_l7", ten: "L7 · Bối cảnh: chuyển đổi sinh kế & sản xuất hàng hóa (tắt mặc định)", mau: "#94a3b8", bieu_tuong: "📦", iconOnly: true },
    { id: "tt_ngoai_pham_vi", ten: "Ngoài phạm vi chính (tắt mặc định)", mau: "#e07b39", bieu_tuong: "🚧", iconOnly: true },
  ]},
  { id: "water_knowledge", ten: "Tài nguyên nước", icon: "💧", layers: [
    { id: "rivers", ten: "Hệ thống sông suối (OpenStreetMap)", mau: "#2589c7", bieu_tuong: "🌊", iconOnly: true },
  ]},
  { id: "forest_knowledge", ten: "Tài nguyên rừng", icon: "🌲", layers: [
    { id: "forests", ten: "Phân vùng rừng", mau: "#2d6a4f", bieu_tuong: "🌲", iconOnly: true },
    { id: "medicinal_plants", ten: "Khu vực cây thuốc quý", mau: "#e63946", bieu_tuong: "🌿", iconOnly: true },
  ]},
];
/**
 * Thư mục "Kinh tế - Xã hội" — đích chứa 2 lớp đặc biệt (Cơ cấu dân tộc · Tên xã).
 * Tự tạo nếu config người dùng chưa có (trừ khi họ đã chủ động xóa thư mục này).
 */
const ensureSocioCategory = (cats: LayerCategoryState[], deletedIds: string[]): LayerCategoryState[] =>
  cats.some(c => c.id === "socio") || deletedIds.includes("socio")
    ? cats
    : [...cats, { id: "socio", ten: "Kinh tế - Xã hội", icon: "👥", layers: [] }];
const EDITABLE_LAYERS = new Set(["forests", "medicinal_plants"]);
const LAYER_GEOM_TYPE: Record<string, "point" | "line" | "polygon"> = {
  rivers: "line", forests: "polygon",
  medicinal_plants: "polygon", population_density: "polygon",
  province_boundaries: "line", ward_boundaries: "line",
};
const LAYER_DISPLAY: Record<string, { name: string; color: string }> = {
  province_boundaries: { name: "Ranh giới tỉnh", color: "#3c5b45" },
  ward_boundaries: { name: "Ranh giới xã/phường", color: "#345b41" },
  population_density: { name: "Mật độ dân số", color: "#fe9929" },
  rivers: { name: "Hệ thống sông suối", color: "#2589c7" },
  forests: { name: "Phân vùng rừng", color: "#52b788" },
  medicinal_plants: { name: "Cây thuốc quý", color: "#e63946" },
};

const THEMATIC_KEYS = ["temperature", "precipitation", "elevation", "aspect", "soil_type", "soil_ph"] as const;
const THEMATIC_ICONS: Record<string, string> = { temperature: "🌡️", precipitation: "🌧️", elevation: "⛰️", aspect: "🧭", soil_type: "🌱", soil_ph: "🧪" };
const thematicColor = (stops: unknown): string => {
  if (stops === "wheel") return "#ff9f1c";
  if (Array.isArray(stops) && stops.length) {
    const mid = stops[Math.floor(stops.length / 2)] as any;
    const first = stops[0] as any;
    if (Array.isArray(mid?.color)) return `rgb(${mid.color[0]},${mid.color[1]},${mid.color[2]})`;
    if (mid?.r !== undefined) return `rgb(${mid.r},${mid.g},${mid.b})`;
    if (Array.isArray(first?.color)) return `rgb(${first.color[0]},${first.color[1]},${first.color[2]})`;
    if (first?.r !== undefined) return `rgb(${first.r},${first.g},${first.b})`;
  }
  return "#4895ef";
};
const escapeHtmlText = (value: string): string => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const walkGeoCoords = (node: unknown, visit: (lng: number, lat: number) => void): void => {
  if (!node) return;
  if (Array.isArray(node)) {
    if (node.length >= 2 && typeof node[0] === "number" && typeof node[1] === "number") { visit(node[0] as number, node[1] as number); return; }
    node.forEach(child => walkGeoCoords(child, visit));
    return;
  }
  if (typeof node === "object") walkGeoCoords((node as { coordinates?: unknown }).coordinates, visit);
};

// Màu phân vùng rừng — cố ý tách sáng/tối/độ bão hòa (rất đậm · bạc hà sáng · xanh dương · tím)
// để phân biệt được ở ô chú giải nhỏ và cả khi tô mờ 0.3 trên bản đồ
const FOREST_COLORS: Record<string, string> = { vqg: "#1b4332", kbttn: "#52b788", kbvcq: "#023e8a", rung_dac_dung: "#9b5de5" };
const FOREST_LABELS: Record<string, string> = { vqg: "Vườn quốc gia", kbttn: "Khu bảo tồn thiên nhiên", kbvcq: "Khu bảo vệ cảnh quan", rung_dac_dung: "Rừng đặc dụng khác" };
// Emoji phân loại theo linh_vuc của điểm thủy lợi (dùng cho lớp L2 — tt_l2).
// Thứ tự tra cứu: Mương phải xét trước Phai (dòng "Mương·Phai" ký hiệu mương).
const THUY_LOI_SUBTYPES = [
  { key: "Phai", emoji: "💧", label: "Phai (đập)" },
  { key: "Mương", emoji: "🚿", label: "Mương · Lái (kênh, máng dẫn)" },
  { key: "Lịn", emoji: "〰️", label: "Lịn (phân phối nước vào ruộng)" },
  { key: "Cọn", emoji: "🌀", label: "Cọn (guồng nước)" },
] as const;
const thuyLoiSubtypeEmoji = (linhVuc: string, fallback: string): string => {
  const s = linhVuc || "";
  if (s.includes("Cọn")) return "🌀";
  if (s.includes("Lịn")) return "〰️";
  if (s.includes("Mương")) return "🚿";
  if (s.includes("Phai")) return "💧";
  return fallback;
};
// Tắt toàn bộ popup trên bản đồ: click đối tượng không mở hộp thoại (tooltip hover giữ nguyên). Bật lại = true.
const POPUPS_ENABLED = false;
// Nhãn rút gọn dùng trong chú giải (bản đồ chính + composer xuất ảnh) — bỏ tiền tố "Lx · " và hậu tố "(tắt mặc định)"
const knowledgeShortLabel = (ten: string): string =>
  ten.replace(/^L\d+\s*·\s*/, "").replace(/\s*\(tắt mặc định\)$/, "");
// Định danh + màu/emoji cho 8 lớp tri thức rev 12 (L1–L7 theo _meta.lop_moi + lớp gom điểm ngoài phạm vi)
const KNOWLEDGE_CATEGORY_ID = "tri_thuc_ban_dia";
const KNOWLEDGE_LAYER_STYLE: Record<string, { icon: string; mau: string }> = {
  tt_l1: { icon: "🌾", mau: "#c9a227" },
  tt_l2: { icon: "💧", mau: "#4ea8de" },
  tt_l3: { icon: "🌳", mau: "#2d6a4f" },
  tt_l4: { icon: "🌿", mau: "#52b788" },
  tt_l5: { icon: "🎉", mau: "#9b5de5" },
  tt_l6: { icon: "🐄", mau: "#f4a261" },
  tt_l7: { icon: "📦", mau: "#94a3b8" },
  tt_ngoai_pham_vi: { icon: "🚧", mau: "#e07b39" },
};
// Lớp tắt mặc định: L7 theo registry _meta.lop_moi + lớp gom điểm ngoài phạm vi chính
const KNOWLEDGE_DEFAULT_OFF = new Set(["tt_l7", "tt_ngoai_pham_vi"]);
// Dựng 8 lớp tri thức rev 12 từ _meta.lop_moi + features phân theo f.layer;
// điểm có scope="ngoài phạm vi chính" gom riêng vào tt_ngoai_pham_vi (lớp L giữ lại phần còn lại).
const buildKnowledgeDefs = (knowledge: any, layersData: any): KnowledgeLayerDef[] => {
  const lopMoi: any[] = Array.isArray(knowledge?._meta?.lop_moi) ? knowledge._meta.lop_moi : [];
  if (!lopMoi.length) return [];
  const all: any[] = [];
  (Array.isArray(knowledge?.layers) ? knowledge.layers : []).forEach((g: any) => {
    (Array.isArray(g?.features) ? g.features : []).forEach((f: any) => all.push(f));
  });
  const isOutside = (f: any): boolean => f?.scope === "ngoài phạm vi chính";
  const defs: KnowledgeLayerDef[] = [];
  lopMoi.forEach((l: any) => {
    const ma = String(l?.ma || "");
    if (!/^L\d+$/.test(ma)) return;
    const id = `tt_${ma.toLowerCase()}`;
    const style = KNOWLEDGE_LAYER_STYLE[id];
    defs.push({
      id,
      ten: String(l?.ten || ma),
      category: KNOWLEDGE_CATEGORY_ID,
      icon: style?.icon || "📌",
      mau: style?.mau || "#64748b",
      features: all.filter(f => f?.layer === ma && !isOutside(f)),
    });
  });
  const outside = all.filter(isOutside);
  (Array.isArray(layersData?.medicinal_plants) ? layersData.medicinal_plants : []).forEach((p: any) => {
    if (isOutside(p)) outside.push(p);
  });
  const styleOut = KNOWLEDGE_LAYER_STYLE.tt_ngoai_pham_vi;
  defs.push({
    id: "tt_ngoai_pham_vi",
    ten: "Ngoài phạm vi chính (tắt mặc định)",
    category: KNOWLEDGE_CATEGORY_ID,
    icon: styleOut.icon,
    mau: styleOut.mau,
    features: outside,
  });
  return defs;
};
// Bảng màu dân tộc — NGUỒN QUY ĐỊNH là trường `mau` trong public/data/dan_toc.json.
// Bản đồ (tô nền), chú giải, tooltip, biểu đồ ở thanh phải và sơ đồ tri thức đều phải
// dùng chung bảng này. Nếu đổi màu: sửa dan_toc.json trước, rồi đồng bộ sang đây.
const ETHNIC_COLORS: Record<string, string> = {
  thai: "#2d6a4f", mong: "#b5179e", muong: "#e76f51", dao: "#f4a261", kho_mu: "#6d6875",
  la_hu: "#457b9d", lu: "#2a9d8f", mang: "#8338ec", kinh: "#e63946", tay: "#1d3557",
  giay: "#06a77d", ha_nhi: "#a4243b", nung: "#5a189a", phu_la: "#ff8c42", la_chi: "#d97706",
  ethnic_khang: "#bc6c25", ethnic_la_ha: "#0096c7", ethnic_xinh_mun: "#8ac926", ethnic_lao: "#7f4f24",
  khac: "#b0a08c",
};
const VIETNAMESE_ETHNIC_NAMES = [
  "Ba Na", "Bố Y", "Brâu", "Bru-Vân Kiều", "Chăm", "Chơ Ro", "Chu Ru", "Chứt", "Co", "Cống", "Cơ Ho", "Cơ Lao", "Cơ Tu", "Dao", "Ê Đê", "Gia Rai", "Giáy", "Giẻ-Triêng", "Hà Nhì", "Hrê", "Kháng", "Khmer", "Khơ Mú", "Kinh", "La Chí", "La Ha", "La Hủ", "Lào", "Lự", "Lô Lô", "Mạ", "Mảng", "M'Nông", "Mông", "Mường", "Ngái", "Nùng", "Ơ Đu", "Pà Thẻn", "Phù Lá", "Pu Péo", "Ra Glai", "Rơ Măm", "Sán Chay", "Sán Dìu", "Si La", "Tà Ôi", "Tày", "Thái", "Thổ", "Xinh Mun", "Xơ Đăng", "Xtiêng", "Cao Lan (nhánh Sán Chay)"
];
// Màu dự phòng cho các dân tộc ngoài danh mục dan_toc.json — cũng dùng trực tiếp làm
// màu chú giải nên bản đồ và chú giải luôn khớp nhau.
const EXTRA_ETHNIC_COLORS = ["#c2410c", "#ca8a04", "#9a3412", "#ea580c", "#a16207", "#b91c1c", "#b45309", "#7c2d12", "#f59e0b", "#dc2626"];
const slugEthnicName = (name: string) => `ethnic_${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase()}`;
const EXTRA_ETHNIC_OPTIONS = VIETNAMESE_ETHNIC_NAMES.map((name, index) => ({ id: slugEthnicName(name), ten: `Dân tộc ${name}`, mau: EXTRA_ETHNIC_COLORS[index % EXTRA_ETHNIC_COLORS.length] }));
const DENSITY_COLORS = ["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404"];
const DENSITY_LABELS = ["< 50", "50–100", "100–200", "200–500", "500–1000", "1000–2000", "> 2000"];
// Một số xã nguồn chỉ công bố % của vài dân tộc (tổng < 100) — phần còn lại là các dân tộc
// khác cộng lại (đúng phép), đưa vào thành mục "Dân tộc khác" để biểu đồ/tròn luôn đủ 100%
// mà không bịa số cho từng dân tộc riêng lẻ.
const ETHNIC_OTHER_ID = "khac";
const ETHNIC_OTHER_LABEL = "Dân tộc khác";
const ETHNIC_OTHER_COLOR = "#b0a08c";
const withOtherEthnic = (list: DanTocTyLe[]): DanTocTyLe[] => {
  const sum = list.reduce((s, d) => s + (Number(d.ty_le) > 0 ? Number(d.ty_le) : 0), 0);
  const rest = Math.round((100 - sum) * 100) / 100;
  return rest > 0.01 ? [...list, { dan_toc: ETHNIC_OTHER_ID, ty_le: rest }] : list;
};
const ethnicLabelOf = (id: string, fallback: string | null | undefined): string =>
  id === ETHNIC_OTHER_ID ? ETHNIC_OTHER_LABEL : (fallback || id);
const MAP_SCALE_OPTIONS = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
const scaleFromZoom = (lat: number, zoom: number) => Math.round((156543.03 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom)) * 3779.52);

// ── Chú giải theo khung nhìn: bbox của geometry (toạ độ [lng, lat] hoặc [lng, lat, ...]) ──
type GeoBBox = [number, number, number, number]; // [west, south, east, north]
const coordsBBox = (coords: unknown): GeoBBox | null => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (value: unknown): void => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
      const lng = value[0] as number;
      const lat = value[1] as number;
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
      if (lng < minX) minX = lng;
      if (lng > maxX) maxX = lng;
      if (lat < minY) minY = lat;
      if (lat > maxY) maxY = lat;
      return;
    }
    (value as unknown[]).forEach(visit);
  };
  visit(coords);
  return Number.isFinite(minX) && Number.isFinite(minY) ? [minX, minY, maxX, maxY] : null;
};
// Giao nhau (xấp xỉ) giữa bbox và khung nhìn — polygon lớn tràn vào khung vẫn được tính
const bboxInView = (bbox: GeoBBox | null, bounds: L.LatLngBounds): boolean =>
  !!bbox && bbox[0] <= bounds.getEast() && bbox[2] >= bounds.getWest() && bbox[1] <= bounds.getNorth() && bbox[3] >= bounds.getSouth();
const pointInView = (lat: number, lng: number, bounds: L.LatLngBounds): boolean =>
  Number.isFinite(lat) && Number.isFinite(lng) && bounds.contains([lat, lng]);
// Giao (xấp xỉ) giữa bbox và vùng chọn — null = chưa chọn vùng (hoặc tắt "Chỉ khu vực chọn") → chỉ theo khung nhìn
const bboxInRegion = (bbox: GeoBBox | null, region: GeoBBox | null): boolean =>
  !region ? !!bbox : (!!bbox && bbox[0] <= region[2] && bbox[2] >= region[0] && bbox[1] <= region[3] && bbox[3] >= region[1]);
const latLngInRegion = (lat: number, lng: number, region: GeoBBox | null): boolean =>
  !region || (Number.isFinite(lat) && Number.isFinite(lng) && lng >= region[0] && lng <= region[2] && lat >= region[1] && lat <= region[3]);
// bbox vùng "Chỉ khu vực chọn" — cùng tập xã với lớp mặt nạ trắng (z-index 660) đang che ngoại vi:
// ký hiệu ngoài vùng bị phủ trắng nên không được đưa vào chú giải, kể cả khi lọt khung nhìn do padding.
const selectedRegionBBoxOf = (
  provinceGeo: { features?: Array<{ properties?: unknown; geometry?: unknown }> } | null | undefined,
  selectedAreaOnly: boolean,
  selectedProvince: string | null,
  wardIds: Set<string>,
): GeoBBox | null => {
  if (!selectedAreaOnly || !selectedProvince || !provinceGeo?.features?.length) return null;
  const feats = wardIds.size > 0
    ? provinceGeo.features.filter(f => wardIds.has(String((f?.properties as { ma_xa?: unknown } | undefined)?.ma_xa)))
    : provinceGeo.features;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  feats.forEach(f => walkGeoCoords(f?.geometry, (lng, lat) => {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
    if (lng < minX) minX = lng;
    if (lng > maxX) maxX = lng;
    if (lat < minY) minY = lat;
    if (lat > maxY) maxY = lat;
  }));
  return Number.isFinite(minX) && Number.isFinite(minY) ? [minX, minY, maxX, maxY] : null;
};
// Toạ độ đối tượng vẽ tay là [lat, lng] (đảo so với GeoJSON) — đổi về [lng, lat] để tính bbox
const annotationBBox = (coords: Array<[number, number]> | undefined): GeoBBox | null =>
  coordsBBox((coords || []).map(([lat, lng]) => [lng, lat]));

const zoomFromScale = (scale: number, lat: number) => Math.max(1, Math.min(19, Math.log2((156543.03 * Math.cos(lat * Math.PI / 180) * 3779.52) / scale)));
const DEFAULT_LAYER_SYMBOLOGY: Record<string, LayerSymbologyConfig> = {
  // Phân cấp ký hiệu địa giới theo chuẩn bản đồ hành chính: cấp tỉnh nét đậm liền, cấp xã nét mảnh đứt
  province_boundaries: { title: "Ranh giới tỉnh", symbolType: "polygon", color: "#3c5b45", fillColor: "#f3efe9", lineWeight: 1.9, opacity: 0.9, fillOpacity: 0.02, dashArray: "", classes: [] },
  ward_boundaries: { title: "Ranh giới xã/phường", symbolType: "line", color: "#345b41", fillColor: "#f7f6f3", lineWeight: 1.0, opacity: 0.9, fillOpacity: 0.01, dashArray: "6,4", classes: [] },
  population_density: { title: "Mật độ dân số", symbolType: "ramp", color: "#0f4c5c", fillColor: "#0f4c5c", lineWeight: 1.1, opacity: 0.95, fillOpacity: 0.85, dashArray: "", classes: [
    { label: "< 50", color: "#fff7bc" },
    { label: "50–100", color: "#fee391" },
    { label: "100–200", color: "#fec44f" },
    { label: "200–500", color: "#fe9929" },
    { label: "500–1000", color: "#ec7014" },
    { label: "1000–2000", color: "#cc4c02" },
    { label: "> 2000", color: "#993404" },
  ] },
  rivers: { title: "Sông suối chính", symbolType: "line", color: "#4b9ad6", fillColor: "#4b9ad6", lineWeight: 1.8, opacity: 0.85, fillOpacity: 0.7, dashArray: "", classes: [] },
  forests: { title: "Phân vùng rừng", symbolType: "polygon", color: "#52b788", fillColor: "#52b788", lineWeight: 1.3, opacity: 0.9, fillOpacity: 0.3, dashArray: "", classes: [] },
  medicinal_plants: { title: "Cây thuốc quý", symbolType: "polygon", color: "#e63946", fillColor: "#e63946", lineWeight: 1.3, opacity: 0.9, fillOpacity: 0.3, dashArray: "", classes: [] },
};
const NHOM_LABELS: Record<string, string> = { tai_nguyen_nuoc:"💧", rung:"🌲", canh_tac:"🌾", ban_lang:"🏘️", van_hoa:"🏺", cay_thuoc:"🌿", luat_tuc:"⚖️", vac_vacr:"♻️", khac:"📍" };

function makeDivIcon(symbol: string, color: string, size = 28, iconOnly = false): L.DivIcon {
  const isImg = typeof symbol === "string" && symbol.startsWith("data:image");
  const inner = isImg
    ? `<img src="${symbol}" alt="" style="width:${size*0.7}px;height:${size*0.7}px;object-fit:contain;border-radius:50%"/>`
    : symbol;
    
  if (iconOnly) {
    return L.divIcon({
      html: `<div style="display:flex;align-items:center;justify-content:center;font-size:${size}px;text-shadow:-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,1px 1px 0 #fff;">${inner}</div>`,
      className: "custom-transparent-marker",
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  }

  // Ghim điểm vị trí (pin) — đầu tròn chứa ký hiệu, mũi nhọn hướng xuống đúng tọa độ
  const pinH = Math.round(size * 1.3);
  const uid = `pin-${Math.random().toString(36).slice(2, 9)}`;
  const defs = isImg ? `<defs><clipPath id="${uid}"><circle cx="20" cy="18" r="13.5"/></clipPath></defs>` : "";
  const head = isImg
    ? `<image href="${symbol}" x="6.5" y="4.5" width="27" height="27" preserveAspectRatio="xMidYMid slice" clip-path="url(#${uid})"/>`
    : `<text x="20" y="19" text-anchor="middle" dominant-baseline="central" font-size="19">${inner}</text>`;
  return L.divIcon({
    html: `<svg width="${size}" height="${pinH}" viewBox="0 0 40 52" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.4))" aria-hidden="true">
      <path d="M20 52 C12 37 4 30 4 18 A16 16 0 1 1 36 18 C36 30 28 37 20 52 Z" fill="${color}" stroke="rgba(255,255,255,0.85)" stroke-width="2.5"/>
      ${defs}${head}
    </svg>`,
    className: "",
    iconSize: [size, pinH],
    iconAnchor: [size/2, pinH]
  });
}

/** Ghim điểm trong chú giải — khớp ký hiệu điểm tri thức trên bản đồ (makeDivIcon pin). */
function LegendPoint({ color, emoji, size = 24 }: { color: string; emoji: string; size?: number }) {
  const h = Math.round(size * 1.3);
  return (
    <svg
      className="legend-point"
      width={size}
      height={h}
      viewBox="0 0 40 52"
      aria-hidden="true"
    >
      <path
        d="M20 52 C12 37 4 30 4 18 A16 16 0 1 1 36 18 C36 30 28 37 20 52 Z"
        fill={color}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="2.5"
      />
      <text x="20" y="19" textAnchor="middle" dominantBaseline="central" fontSize="19">{emoji}</text>
    </svg>
  );
}

/** Chuẩn hóa coords polygon về danh sách ring: hỗ trợ ring phẳng [[lng,lat]..], [ring], hoặc [ring1, ring2] (đa phần). */
const polygonRings = (coords: any): number[][][] => {
  if (!Array.isArray(coords) || coords.length === 0) return [];
  const nested = Array.isArray(coords[0]) && Array.isArray(coords[0][0]);
  if (!nested) return coords.length >= 3 ? [coords as number[][]] : [];
  const rings: number[][][] = [];
  for (const r of coords) {
    if (Array.isArray(r) && r.length >= 3 && Array.isArray(r[0]) && typeof r[0][0] === "number") rings.push(r);
  }
  return rings;
};

const ETHNIC_DATA_LS_KEY = "webgis-ethnic-data-v1";
type SavedEthnicData = { calendar?: Partial<Record<EthnicKey, CalendarGroup[]>>; transect?: Partial<Record<EthnicKey, TransectZone[]>>; ethnicZones?: EthnicZone[] };
const loadEthnicData = (): SavedEthnicData | null => {
  try { const raw = window.localStorage.getItem(ETHNIC_DATA_LS_KEY); return raw ? JSON.parse(raw) as SavedEthnicData : null; } catch { return null; }
};
/** File lưu chung các bản sửa của người dùng (xã · dân tộc · tri thức · số liệu tỉnh). */
type OverridesFile = {
  ward?: Record<string, WardOverrides>;
  ethnic?: Record<string, EthnicOverride>;
  triThuc?: Record<string, TriThuc[]>;
  province?: Record<string, Partial<ProvinceStat>>;
};
const readOverridesFile = (): OverridesFile => readJson<OverridesFile>(STORAGE.overrides) ?? {};
const statusNote = (x: { trang_thai?: string; nguon?: string[] } | null | undefined): string => {
  if (!x?.trang_thai) return "";
  const msg = x.trang_thai === "minh_hoa" ? "⚠ Dữ liệu minh họa — chưa có nguồn xác minh, không dùng làm căn cứ"
    : x.trang_thai === "chua_xac_minh" ? "ⓘ Chưa xác minh trực tiếp — cần đối chiếu thêm ở hiện trường"
    : x.trang_thai === "co_nguon" ? "✓ Đã đối chiếu nguồn — danh sách nguồn bên dưới"
    : "ⓘ Một phần có nguồn — xem ghi chú nguồn";
  const color = x.trang_thai === "minh_hoa" ? "#b45309" : x.trang_thai === "co_nguon" ? "#15803d" : "#64748b";
  const links = (x.nguon || []).map(u => /^https?:\/\//.test(u) ? `<a href="${u}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline">${u}</a>` : u);
  const src = links.length ? `<p style="margin:4px 0 0;font-size:10px;color:#64748b">Nguồn: ${links.join("; ")}</p>` : "";
  return `<p style="margin:6px 0 0;font-size:11px;color:${color}">${msg}</p>${src}`;
};

export default function WebGIS() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const provincesLayerRef = useRef<L.GeoJSON | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
const wardLabelsLayerRef = useRef<L.LayerGroup | null>(null);
  const densityLayerRef = useRef<L.GeoJSON | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);
  const annotationGroupRef = useRef<L.LayerGroup | null>(null);
  const layerInstancesRef = useRef<Map<string, L.Layer[]>>(new Map());
  const allWardsRef = useRef<WardProperties[]>([]);
  const drawingPolylineRef = useRef<L.Polyline | null>(null);
  const drawingCoordsRef = useRef<[number,number][]>([]);
  const rasterOverlayRef = useRef<L.ImageOverlay | null>(null);
  const selectedAreaMaskRef = useRef<HTMLDivElement | null>(null);
  const selectedAreaOnlyRef = useRef(false);
  const selectedAreaFadeRef = useRef(1);
  const provinceMaskGeomRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const maskedRasterCacheRef = useRef<Map<string, string>>(new Map());
  // Lớp ranh giới xã: tự bật khi vào xem xã (để bản đồ có ranh giới như mặc định),
  // và tắt lại khi quay về nếu người dùng chưa tự bật/tắt lớp này.
  const wardBoundaryAutoOnRef = useRef(false);
  const wardBoundaryOnRef = useRef(true);
  const syncQueuedRef = useRef(false);
  /** Bản sao layers.json gốc (chưa trộn bản lưu) — dùng để chỉ lưu lớp người dùng đã sửa. */
  const baseLayersRef = useRef<Record<string, any> | null>(null);

  /* ─── Core state ─── */
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [infoPanelWard, setInfoPanelWard] = useState<WardProperties | null>(null);
  const [selectedWardIds, setSelectedWardIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"province"|"ward">("province");
  const [, navigate] = useLocation();
  /** Mở trang chi tiết dân tộc (route /dan-toc/:id) — bản đồ giữ nguyên phía dưới. */
  const openEthnicPage = (ethnicId: string) => {
    if (!ethnicId || ethnicId === ETHNIC_OTHER_ID) return;
    navigate(`/dan-toc/${encodeURIComponent(ethnicId)}`);
  };
  const [danTocData, setDanTocData] = useState<DanTocData | null>(null);
  const [selectedDanToc, setSelectedDanToc] = useState<DanTocInfo | null>(null);
  const [activeTriThuc, setActiveTriThuc] = useState(0);
  const [layersData, setLayersData] = useState<LayersData | null>(null);
  const [phuYenLayers, setPhuYenLayers] = useState<Record<string, any[]>>({});
  // Khung lớp tri thức bản địa rev 12 — 8 lớp L1–L7 đọc từ tri_thuc_ban_dia.json (_meta.lop_moi)
  const [knowledgeDefs, setKnowledgeDefs] = useState<KnowledgeLayerDef[]>([]);
  const [deletedFeatureIds, setDeletedFeatureIds] = useState<Set<string>>(new Set());
  const [allWardsGeoJson, setAllWardsGeoJson] = useState<GeoJsonData | null>(null);
  const [loadingWardBoundaries, setLoadingWardBoundaries] = useState(false);

  /* ─── Sidebar resizing state ─── */
  const [leftWidth, setLeftWidth] = useState<number>(320);
  const [rightWidth, setRightWidth] = useState<number>(340);
  const [leftCollapsed, setLeftCollapsed] = useState<boolean>(false);
  const [rightCollapsed, setRightCollapsed] = useState<boolean>(false);
  const [selectedAreaOnly, setSelectedAreaOnly] = useState(false);
  const [selectedAreaFade, setSelectedAreaFade] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [pendingWardSearch, setPendingWardSearch] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(100000);
  const [customMapScale, setCustomMapScale] = useState("");

  useEffect(() => {
    selectedAreaOnlyRef.current = selectedAreaOnly;
    selectedAreaFadeRef.current = selectedAreaFade;
  }, [selectedAreaOnly, selectedAreaFade]);

  /* ─── Toast & undo (thùng rác) ─── */
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const lastDeletedRef = useRef<any>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  const showToast = useCallback((message: string, trashEntry?: any) => {
    setToastMessage(message);
    lastDeletedRef.current = trashEntry ?? null;
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      lastDeletedRef.current = null;
      toastTimerRef.current = null;
    }, 8000);
  }, []);

  const restoreTrashEntry = useCallback((entry: any) => {
    if (!entry) return;
    if (entry.type === "feature") {
      if (entry.feature?.id) {
        setDeletedFeatureIds(prev => {
          if (!prev.has(String(entry.feature.id))) return prev;
          const next = new Set(prev);
          next.delete(String(entry.feature.id));
          return next;
        });
      }
      setLayersData(prev => {
        if (!prev) return prev;
        const next = { ...prev } as any;
        const arr = [...(next[entry.layerId] || [])];
        arr.splice(Math.min(entry.idx, arr.length), 0, entry.feature);
        next[entry.layerId] = arr;
        return next;
      });
    } else if (entry.type === "customLayer") {
      setCustomLayers(prev => prev.some(c => c.id === entry.layer.id) ? prev : [...prev, entry.layer]);
      setLayersData(prev => ({ ...(prev || {} as LayersData), [entry.layer.id]: entry.features || [] } as LayersData));
      setActiveLayers(prev => new Set([...prev, entry.layer.id]));
    } else if (entry.type === "builtinLayer") {
      setLayerCategories(prev => prev.map(c => c.id === entry.categoryId && !c.layers.some(l => l.id === entry.layer.id)
        ? { ...c, layers: [...c.layers, entry.layer] } : c));
      setHiddenLayerIds(prev => {
        const list = prev[entry.categoryId];
        if (!list || !list.includes(entry.layer.id)) return prev;
        const rest = list.filter((id: string) => id !== entry.layer.id);
        const next = { ...prev };
        if (rest.length) next[entry.categoryId] = rest; else delete next[entry.categoryId];
        return next;
      });
      setActiveLayers(prev => new Set([...prev, entry.layer.id]));
    } else if (entry.type === "category") {
      const restoredIds = new Set((entry.category.layers || []).map((l: any) => l.id));
      setLayerCategories(prev => prev.some(c => c.id === entry.category.id) ? prev : [
        ...prev.map(c => c.id === entry.category.id ? c : { ...c, layers: c.layers.filter((l: any) => !restoredIds.has(l.id)) }),
        entry.category,
      ]);
      setDeletedCategoryIds(prev => prev.filter((id: string) => id !== entry.category.id));
      if (Array.isArray(entry.customLayers) && entry.customLayers.length) {
        setCustomLayers(prev => [...prev, ...entry.customLayers.filter((c: any) => !prev.some(x => x.id === c.id))]);
      }
      if (entry.customData) setLayersData(prev => ({ ...(prev || {} as LayersData), ...entry.customData } as LayersData));
      setActiveLayers(prev => {
        const next = new Set(prev);
        entry.category.layers.forEach((l: any) => next.add(l.id));
        (entry.customLayers || []).forEach((c: any) => next.add(c.id));
        return next;
      });
    }
    setToastMessage(null);
    lastDeletedRef.current = null;
    if (toastTimerRef.current) { window.clearTimeout(toastTimerRef.current); toastTimerRef.current = null; }
  }, []);

  const startResizingLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(0, Math.min(550, startWidth + (moveEvent.clientX - startX)));
      setLeftWidth(newWidth);
      setLeftCollapsed(newWidth < 40);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startResizingRight = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(0, Math.min(550, startWidth - (moveEvent.clientX - startX)));
      setRightWidth(newWidth);
      setRightCollapsed(newWidth < 40);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  /* ─── Editable data state (khôi phục từ localStorage khi mở trang) ─── */
  const [wardOverrides, setWardOverrides] = useState<Map<string,WardOverrides>>(() => recToMap(readOverridesFile().ward));
  const [ethnicOverrides, setEthnicOverrides] = useState<Map<string,EthnicOverride>>(() => recToMap(readOverridesFile().ethnic));
  const [triThucOverrides, setTriThucOverrides] = useState<Map<string,TriThuc[]>>(() => recToMap(readOverridesFile().triThuc));
  const [provinceEdits, setProvinceEdits] = useState<Map<string,Partial<ProvinceStat>>>(() => recToMap(readOverridesFile().province));
  const [pdfFiles, setPdfFiles] = useState<Map<string,PdfFile[]>>(new Map());
  const [calendarByEthnic, setCalendarByEthnic] = useState<Record<EthnicKey, CalendarGroup[]>>(() => ({ ...DEFAULT_ACTIVITIES_BY_ETHNIC, ...(loadEthnicData()?.calendar ?? {}) }));
  const [transectByEthnic, setTransectByEthnic] = useState<Record<EthnicKey, TransectZone[]>>(() => ({ ...DEFAULT_ZONES_BY_ETHNIC, ...(loadEthnicData()?.transect ?? {}) }));
  const [transectEthnic, setTransectEthnic] = useState<EthnicZone[]>(() => loadEthnicData()?.ethnicZones ?? DEFAULT_ETHNIC_ZONES);
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeSection[]>(() => {
    const saved = readJson<KnowledgeSection[]>(STORAGE.knowledge);
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_KNOWLEDGE;
  });

  // Báo khi trình duyệt đầy bộ nhớ (mọi ghi local đều đi qua persist.writeJson*)
  useEffect(() => registerQuotaHandler(() => showToast("⚠ Bộ nhớ trình duyệt đã đầy — thay đổi mới có thể không được lưu!")), []);

  // Lưu bản sửa của người dùng: xã · dân tộc · tri thức · số liệu tỉnh
  useEffect(() => {
    writeJsonIfChanged(STORAGE.overrides, {
      ward: mapToRec(wardOverrides),
      ethnic: mapToRec(ethnicOverrides),
      triThuc: mapToRec(triThucOverrides),
      province: mapToRec(provinceEdits),
    });
  }, [wardOverrides, ethnicOverrides, triThucOverrides, provinceEdits]);

  // Kiến thức bản địa: chỉ ghi khi người dùng thực sự sửa (không lưu bản mặc định)
  useEffect(() => {
    if (knowledgeData === DEFAULT_KNOWLEDGE) return;
    writeJsonIfChanged(STORAGE.knowledge, knowledgeData);
  }, [knowledgeData]);
  const [customLayers, setCustomLayers] = useState<CustomLayer[]>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      return Array.isArray(saved?.customLayers) ? saved.customLayers : [];
    } catch { return []; }
  });
  const [layerCategories, setLayerCategories] = useState<LayerCategoryState[]>(() => {
    const defaults: LayerCategoryState[] = DEFAULT_LAYER_CATEGORIES.map(c => ({ ...c, layers: c.layers.map(l => ({ ...l })) }));
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      if (!Array.isArray(saved?.layerCategories)) return ensureSocioCategory(defaults, []);
      const savedCats = saved.layerCategories as LayerCategoryState[];
      const deletedCategoryIds: string[] = Array.isArray(saved?.deletedCategoryIds) ? saved.deletedCategoryIds : [];
      const hiddenLayerIds: Record<string, string[]> = saved?.hiddenLayerIds && typeof saved.hiddenLayerIds === "object" ? saved.hiddenLayerIds : {};
      const hiddenAll = new Set<string>(Object.values(hiddenLayerIds).flat());
      // Gộp lớp mặc định mới (vd: rivers) vào config đã lưu, tôn trọng nhóm/lớp người dùng đã ẩn
      const presentIds = new Set<string>();
      savedCats.forEach(c => c.layers.forEach(l => presentIds.add(l.id)));
      DEFAULT_LAYER_CATEGORIES.forEach(def => {
        if (deletedCategoryIds.includes(def.id)) return;
        let existing = savedCats.find(c => c.id === def.id);
        if (!existing) { existing = { ...def, layers: [] }; savedCats.push(existing); }
        def.layers.forEach(dl => {
          if (hiddenAll.has(dl.id)) return;
          if (presentIds.has(dl.id)) return;
          if (!existing!.layers.some(l => l.id === dl.id)) { existing!.layers.push({ ...dl }); presentIds.add(dl.id); }
        });
      });
      // Round 3: gỡ 2 lớp (villages, customary_zones) khỏi config đã lưu của người dùng cũ
      // Rev 12: bỏ luôn nhóm land_knowledge rỗng (đã chuyển 8 lớp tri thức vào nhóm tri_thuc_ban_dia)
      const cleaned = savedCats
        .filter(c => c.id !== "culture" && c.id !== "land_knowledge")
        .map(c => ({ ...c, layers: c.layers.filter(l => !REMOVED_LAYER_IDS.has(l.id)) }));
      // Đồng bộ tiêu đề & thứ tự nhóm/lớp với mặc định hiện hành (config cũ từ trước vòng gộp lớp)
      const cleanedById = new Map(cleaned.map(c => [c.id, c]));
      const normalized: LayerCategoryState[] = [];
      DEFAULT_LAYER_CATEGORIES.forEach(def => {
        if (deletedCategoryIds.includes(def.id)) return;
        const cat = cleanedById.get(def.id);
        if (!cat) {
          normalized.push({ ...def, layers: def.layers.filter(l => !hiddenAll.has(l.id)).map(l => ({ ...l })) });
          return;
        }
        const defaultIds = new Set(def.layers.map(l => l.id));
        const orderedLayers = [
          ...def.layers.flatMap(dl => cat.layers.filter(l => l.id === dl.id)),
          ...cat.layers.filter(l => !defaultIds.has(l.id)),
        ];
        normalized.push({ ...cat, ten: def.ten, icon: def.icon, layers: orderedLayers });
      });
      cleaned.forEach(c => { if (!DEFAULT_LAYER_CATEGORIES.some(d => d.id === c.id)) normalized.push(c); });
      return ensureSocioCategory(normalized, deletedCategoryIds);
    } catch { return ensureSocioCategory(defaults, []); }
  });
  const [deletedCategoryIds, setDeletedCategoryIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      return Array.isArray(saved?.deletedCategoryIds) ? saved.deletedCategoryIds : [];
    } catch { return []; }
  });
  const [hiddenLayerIds, setHiddenLayerIds] = useState<Record<string, string[]>>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      return saved?.hiddenLayerIds && typeof saved.hiddenLayerIds === "object" ? saved.hiddenLayerIds : {};
    } catch { return {}; }
  });

  /* ─── UI state ─── */
  const [showImport, setShowImport] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [activeRaster, setActiveRaster] = useState<string | null>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      return typeof saved?.activeRaster === "string" ? saved.activeRaster : null;
    } catch { return null; }
  });
  const [earth3d, setEarth3d] = useState<{ open: boolean; center?: [number, number]; zoom?: number; overlay?: unknown; raster?: { url: string; bounds: [[number, number], [number, number]]; opacity: number } | null; vectors?: GeoJSON.FeatureCollection | null }>({ open: false });
  const [rasterOpacity, setRasterOpacity] = useState<number>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      return Number.isFinite(Number(saved?.rasterOpacity)) ? Number(saved.rasterOpacity) : 0.8;
    } catch { return 0.8; }
  });
  const [rasterMeta, setRasterMeta] = useState<{ bounds: [[number,number],[number,number]]; layers: Record<string, { file: string; unit: string; label: string; source: string; stops: any }> } | null>(null);
  /* Nhãn tên xã: bật/tắt + màu chữ + cỡ chữ (lưu localStorage) */
  const [wardLabelConfig, setWardLabelConfig] = useState<{ on: boolean; color: string; size: number }>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("webgis-ward-labels") || "null");
      return {
        on: !!saved?.on,
        color: typeof saved?.color === "string" ? saved.color : "#1b4332",
        size: Number.isFinite(Number(saved?.size)) ? Number(saved.size) : 11,
      };
    } catch { return { on: false, color: "#1b4332", size: 11 }; }
  });
  useEffect(() => {
    writeJsonIfChanged("webgis-ward-labels", wardLabelConfig);
  }, [wardLabelConfig]);
  /* Thứ tự 2 lớp đặc biệt trong bảng lớp — kéo–thả để sắp xếp, lưu localStorage */
  const [specialLayerOrder, setSpecialLayerOrder] = useState<string[]>(() => {
    const saved = readJson<string[]>(STORAGE.specialLayerOrder);
    const list = Array.isArray(saved)
      ? saved.filter((x): x is string => typeof x === "string" && SPECIAL_LAYER_IDS.includes(x))
      : [];
    SPECIAL_LAYER_IDS.forEach(id => { if (!list.includes(id)) list.push(id); });
    return list;
  });
  useEffect(() => {
    writeJsonIfChanged(STORAGE.specialLayerOrder, specialLayerOrder);
  }, [specialLayerOrder]);
  /* Chú giải: bật/tắt + kích cỡ (lưu localStorage) */
  const [legendOpts, setLegendOpts] = useState<{ visible: boolean; scale: number }>(() => {
    const saved = readJson<{ visible?: boolean; scale?: number }>(STORAGE.legendOpts);
    return {
      visible: saved?.visible !== false,
      scale: Math.min(1.4, Math.max(0.7, Number(saved?.scale) || 1)),
    };
  });
  useEffect(() => {
    writeJsonIfChanged(STORAGE.legendOpts, legendOpts);
  }, [legendOpts]);
  const bumpLegendScale = (dir: 1 | -1) =>
    setLegendOpts(o => ({ ...o, scale: Math.round(Math.min(1.4, Math.max(0.7, o.scale + dir * 0.1)) * 100) / 100 }));
  const [transectFor, setTransectFor] = useState<EthnicKey | null>(null);
  const [calendarFor, setCalendarFor] = useState<EthnicKey | null>(null);
  // Tự động lưu lược đồ mặt cắt & nông lịch theo dân tộc vào localStorage
  useEffect(() => {
    const t = window.setTimeout(() => {
      writeJsonIfChanged(ETHNIC_DATA_LS_KEY, { calendar: calendarByEthnic, transect: transectByEthnic, ethnicZones: transectEthnic });
    }, 600);
    return () => window.clearTimeout(t);
  }, [calendarByEthnic, transectByEthnic, transectEthnic]);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showPieSelector, setShowPieSelector] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      const ids: unknown = saved?.activeLayers;
      if (!Array.isArray(ids)) return new Set();
      // Chỉ giữ id còn tồn tại trong danh mục lớp hiện tại (lớp bị gỡ không bật lại)
      const valid = new Set<string>();
      layerCategories.forEach(c => c.layers.forEach(l => valid.add(l.id)));
      customLayers.forEach(l => valid.add(l.id));
      return new Set(ids.filter((x): x is string => typeof x === "string" && valid.has(x)));
    } catch { return new Set(); }
  });
  const [layerSymbologies, setLayerSymbologies] = useState<Record<string, LayerSymbologyConfig>>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      const merged: Record<string, LayerSymbologyConfig> = saved?.layerSymbologies && typeof saved.layerSymbologies === "object"
        ? { ...DEFAULT_LAYER_SYMBOLOGY, ...saved.layerSymbologies }
        : { ...DEFAULT_LAYER_SYMBOLOGY };
      // Đồng bộ cấu hình cũ (point) của 2 lớp đã chuyển sang polygon
      (["forests", "medicinal_plants"] as const).forEach(k => {
        const s = merged[k];
        if (s && s.symbolType !== "polygon") merged[k] = { ...s, symbolType: "polygon", fillOpacity: s.fillOpacity > 0.5 ? 0.3 : s.fillOpacity };
      });
      return merged;
    } catch { return { ...DEFAULT_LAYER_SYMBOLOGY }; }
  });
  const [editingSymbologyLayer, setEditingSymbologyLayer] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload: Record<string, unknown> = {
        customLayers, layerCategories, layerSymbologies, deletedCategoryIds, hiddenLayerIds,
        activeRaster, rasterOpacity, activeLayers: [...activeLayers],
        deletedFeatureIds: [...deletedFeatureIds],
      };
      if (layersData) {
        const { rivers: _rivers, ...rest } = layersData as Record<string, any>;
        const hasStaleLabel = (arr: unknown) => Array.isArray(arr) && arr.some((x: any) => x?.trang_thai === "minh_hoa" || x?.trang_thai === "chua_xac_minh");
        // Chỉ lưu mảng người dùng ĐÃ sửa (so với layers.json gốc) + lớp tự tạo —
        // lớp nguyên bản không lưu lại để lần tải sau lấy bản mới từ layers.json
        // và không phình to localStorage/cloud.
        const base = baseLayersRef.current;
        const edited: Record<string, any[]> = {};
        Object.keys(rest).forEach(k => {
          if (!Array.isArray(rest[k])) return;
          if (k.startsWith("custom_")) { edited[k] = rest[k]; return; }
          // Không lưu lại mảng built-in còn nhãn minh họa/chưa xác minh (dữ liệu cũ từ phiên trước)
          // — lớp tri thức bản địa giữ nguyên mọi nhãn trạng thái nghiên cứu
          if (!isKnowledgeLayer(k) && hasStaleLabel(rest[k])) return;
          const b = base ? base[k] : undefined;
          if (b !== undefined && JSON.stringify(b) === JSON.stringify(rest[k])) return;
          edited[k] = rest[k];
        });
        payload.layersData = edited;
        payload.layersDataRev = LAYER_DATA_REV;
        payload.knowledgeDataRev = KNOWLEDGE_DATA_REV;
      } else {
        // Chưa load xong: giữ nguyên layersData đã lưu từ phiên trước
        try {
          const prev = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
          if (prev?.layersData) {
            payload.layersData = prev.layersData;
            payload.layersDataRev = prev.layersDataRev;
            payload.knowledgeDataRev = prev.knowledgeDataRev;
          }
        } catch { /* bỏ qua */ }
      }
      writeJsonIfChanged(LAYER_CONFIG_STORAGE_KEY, payload);
    } catch { /* Ignore storage quota or privacy errors. */ }
  }, [customLayers, layerCategories, layerSymbologies, layersData, deletedCategoryIds, hiddenLayerIds, activeRaster, rasterOpacity, activeLayers, deletedFeatureIds]);

  const [pdfViewer, setPdfViewer] = useState<PdfFile | null>(null);
  const [editingEthnicPct, setEditingEthnicPct] = useState<string|null>(null);
  const [editingLayer, setEditingLayer] = useState<string | null>(null); const [composerSnapshot, setComposerSnapshot] = useState<any>(null);
  const [showMapComposer, setShowMapComposer] = useState(false);
  const [syncPending, setSyncPending] = useState(false);
  const [mapMoveTick, setMapMoveTick] = useState(0);
  const [mapFrameAspect, setMapFrameAspect] = useState<number | null>(null);
  const [pieWardSelection, setPieWardSelection] = useState<Set<string>>(new Set());
  const [editingWardComposition, setEditingWardComposition] = useState<WardProperties | null>(null); const [editingWardStyle, setEditingWardStyle] = useState<WardProperties | null>(null);
  const [currentProvinceGeoJson, setCurrentProvinceGeoJson] = useState<GeoJsonData | null>(null);
  const [layerDragMode, setLayerDragMode] = useState<string | null>(null);
const [showPieSelectorModal, setShowPieSelectorModal] = useState(false);
  
  const pickPointCbRef = useRef<((lat: number, lng: number) => void) | null>(null);
  const drawGeomCbRef = useRef<((coords: [number, number][]) => void) | null>(null);
  const [pickingPoint, setPickingPoint] = useState(false);
  
  const ethnicPhotoInputRef = useRef<HTMLInputElement>(null);
  const ethnicPhotoTargetRef = useRef<string | null>(null);
  const [ethnicPhotoLightbox, setEthnicPhotoLightbox] = useState<string | null>(null);
  /* Ảnh minh họa riêng của từng xã (ảnh đại diện + ảnh đính kèm trong mục nội dung) */
  type WardPhotoTarget = { ma_xa: string; kind: "hero" } | { ma_xa: string; kind: "section"; sectionId: string };
  const wardPhotoInputRef = useRef<HTMLInputElement>(null);
  const wardPhotoTargetRef = useRef<WardPhotoTarget | null>(null);

  /* ─── Annotation state ─── */
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    const saved = readJson<Annotation[]>(STORAGE.annotations);
    return Array.isArray(saved) ? saved : [];
  });
  // Lưu chú thích (chỉ ghi khi nội dung đổi để không đẩy timestamp vô nghĩa)
  useEffect(() => {
    writeJsonIfChanged(STORAGE.annotations, annotations);
  }, [annotations]);
  /** Bản đồ Leaflet đã khởi tạo xong — effect vẽ chú thích phải chạy lại sau đó. */
  const [mapReady, setMapReady] = useState(false);

  /* ─── Trạng thái đồng bộ cloud (chip ☁️ ở thanh tiêu đề) ─── */
  const [syncState, setSyncState] = useState<SyncState>(getSyncState);
  useEffect(() => subscribeSync(() => setSyncState(getSyncState())), []);
  const [drawMode, setDrawMode] = useState<null|"diem"|"duong"|"vung">(null);
  const [pendingAnnotation, setPendingAnnotation] = useState<{coords:[number,number][];loai:"diem"|"duong"|"vung"}|null>(null);
  const [editingRecipe, setEditingRecipe] = useState<{ethId:string;topicIdx:number;recipeIdx:number|null;data:BaiThuoc}|null>(null);
  const [newTopicForm, setNewTopicForm] = useState<{ethId:string;chu_de:string;bieu_tuong:string;noi_dung:string}|null>(null);

  /* ─── Load data ─── */
  useEffect(() => {
  if (showPieSelector && currentProvinceGeoJson && pieWardSelection.size === 0) {
    // Chỉ tự động chọn tất cả nếu lần đầu bật mà danh sách đang trống
    const allWardIds = currentProvinceGeoJson.features.map(f => (f.properties as any).ma_xa);
    setPieWardSelection(new Set(allWardIds));
  }
}, [showPieSelector, currentProvinceGeoJson]);

  const readSavedLayerConfig = (): { layersData?: Record<string, any[]>; layersDataRev?: number; deletedFeatureIds?: string[] } | null => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAYER_CONFIG_STORAGE_KEY) || "null");
      return saved?.layersData && typeof saved.layersData === "object" ? saved : null;
    } catch { return null; }
  };

  useEffect(() => {
    const loadStandardHydrography = async (fallback: any) => {
      const query = `[out:json][timeout:60];(way["waterway"="river"](20.5,101.5,23.5,105.5);way["waterway"="stream"]["name"](20.5,101.5,23.5,105.5););out tags geom;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`Hydrography request failed: ${response.status}`);
      const payload = await response.json() as { elements?: { id: number; tags?: Record<string, string>; geometry?: { lat: number; lon: number }[] }[] };
      const rivers = (payload.elements || []).flatMap(element => {
        const geometry = element.geometry || [];
        if (geometry.length < 2) return [];
        const tags = element.tags || {};
        const isMainRiver = tags.waterway === "river";
        return [{
          id: `osm_${element.id}`,
          ten: tags.name || (isMainRiver ? "Sông không tên" : "Suối không tên"),
          ten_dia_phuong: tags["name:vi"] || "",
          coords: geometry.map(point => [point.lon, point.lat]),
          cap_song: isMainRiver ? 1 : 2,
          width: isMainRiver ? 3.2 : 1.8,
        }];
      });
      if (rivers.length === 0) throw new Error("No standard hydrography features returned");
      // Giữ metadata đã đối chiếu nguồn (mo_ta/nguon/trang_thai) từ layers.json cho các sông khớp tên
      const localByName = new Map<string, any>();
      ((fallback as any)?.rivers || []).forEach((r: any) => { if (r?.ten) localByName.set(String(r.ten).toLowerCase(), r); });
      const enriched = rivers.map(r => {
        const local = localByName.get(String(r.ten).toLowerCase());
        return local ? { ...r, mo_ta: local.mo_ta, nguon: local.nguon, trang_thai: local.trang_thai, ghi_chu: local.ghi_chu } : r;
      });
      setLayersData(prev => ({ ...(prev || fallback), rivers: enriched } as LayersData));
    };

    fetch(BASE_PATH+"/data/dan_toc.json").then(r=>r.json()).then(setDanTocData).catch(console.error);
    fetch(BASE_PATH+"/data/phu_yen_layers.json").then(r=>r.json()).then((d: Record<string, unknown>) => {
      // Vac/thủy lợi/Phù Yên đã gộp vào tri_thuc_ban_dia.json — chỉ còn cây thuốc từ nguồn Phù Yên
      const entries = Object.entries(d).filter(([key, value]) => Array.isArray(value) && key === "medicinal_plants");
      setPhuYenLayers(Object.fromEntries(entries) as Record<string, any[]>);
    }).catch(console.error);
    fetch(BASE_PATH+"/data/raster/meta.json").then(r=>r.json()).then(setRasterMeta).catch(console.error);
    fetch(BASE_PATH+"/data/tinh.geojson").then(r=>r.json()).then((g: GeoJSON.FeatureCollection) => {
      provinceMaskGeomRef.current = g;
      maskedRasterCacheRef.current.clear();
    }).catch(console.error);
    // cache:"no-cache" + ?v=REV: buộc trình duyệt revalidate/ruột URL mới, tránh phụ thuộc heuristic cache của file public (không có Cache-Control)
    Promise.all([
      fetch(BASE_PATH+"/data/layers.json?v="+LAYER_DATA_REV, { cache: "no-cache" }).then(r=>r.json()),
      fetch(BASE_PATH+"/data/tri_thuc_ban_dia.json?v="+KNOWLEDGE_DATA_REV, { cache: "no-cache" }).then(r=>r.json()).catch(() => null),
    ]).then(([d, knowledge]: [any, any]) => {
      // Dựng 8 lớp tri thức rev 12 (L1–L7 + ngoài phạm vi) từ _meta.lop_moi rồi trộn features vào layersData
      const kDefs = buildKnowledgeDefs(knowledge, d);
      setKnowledgeDefs(kDefs);
      syncKnowledgeLayerIds(kDefs);
      kDefs.forEach(def => { d[def.id] = def.features; });
      if (d.medicinal_plants) {
        d.medicinal_plants = d.medicinal_plants.map((p: any) => {
          const { ["tình_trang"]: tt, ...rest } = p;
          return tt && !rest.tinh_trang ? { ...rest, tinh_trang: tt } : rest;
        });
      }
      // Giữ bản gốc (chưa trộn bản lưu, clone sâu để không bị đổi ngầm) để so sánh "lớp nào người dùng đã sửa"
      baseLayersRef.current = structuredClone(d);
      // Phục hồi dữ liệu lớp người dùng đã biên tập trong các phiên trước
      const savedConfig = readSavedLayerConfig();
      setDeletedFeatureIds(new Set(Array.isArray(savedConfig?.deletedFeatureIds) ? savedConfig.deletedFeatureIds : []));
      const savedLayerData = savedConfig?.layersData;
      if (savedLayerData) {
        const savedRev = (savedConfig as any)?.layersDataRev;
        const hasStaleLabel = (arr: unknown) => Array.isArray(arr) && arr.some((x: any) => x?.trang_thai === "minh_hoa" || x?.trang_thai === "chua_xac_minh");
        Object.keys(savedLayerData).forEach(key => {
          if (!Array.isArray(savedLayerData[key])) return;
          if (key === "rivers") return; // rivers tải lại từ Overpass mỗi phiên
          // Bản lưu cũ (trước khi layers.json được đối chiếu nguồn) không dùng nữa — lấy bản mới nhất
          if (LAYER_DATA_REV_KEYS.includes(key) && savedRev !== LAYER_DATA_REV) return;
          // Lớp tri thức bản địa: nhận bản lưu nếu JSON khung còn rev cũ thì bỏ (lấy base mới)
          if (isKnowledgeLayer(key) && (savedConfig as any)?.knowledgeDataRev !== KNOWLEDGE_DATA_REV) return;
          // Bản lưu còn nhãn minh họa/chưa xác minh = dữ liệu trước khi đối chiếu nguồn (kể cả khi rev trùng) — bỏ
          // (trừ lớp tri thức bản địa: nhãn trạng thái là dữ liệu nghiên cứu hợp lệ)
          if (!key.startsWith("custom_") && !isKnowledgeLayer(key) && hasStaleLabel(savedLayerData[key])) return;
          if (key === "forests" || key === "medicinal_plants") {
            // Phiên trước lưu dạng điểm (lat/lng) — không dùng nữa; chỉ nhận bản đã biên tập dạng polygon
            const polygonItems = savedLayerData[key].filter((x: any) => Array.isArray(x?.coords));
            if (polygonItems.length) d[key] = polygonItems;
            return;
          }
          if (key in d || key.startsWith("custom_")) d[key] = savedLayerData[key];
        });
      }
      setLayersData(d);
      loadStandardHydrography(d).catch(error => console.warn("Using local hydrography fallback:", error));
    }).catch(console.error);
  }, []);

  // Bổ sung các điểm Phù Yên đã đối chiếu: nay chỉ còn cây thuốc (vac/irrigation/Phù Yên
  // đã gộp vào tri_thuc_ban_dia.json — tt_l1, tt_l2).
  useEffect(() => {
    if (!layersData) return;
    const overlayKeys = ["medicinal_plants"] as const;
    let changed = false;
    const next = { ...layersData } as LayersData;
    overlayKeys.forEach(key => {
      const additions = (phuYenLayers[key] || []).filter(item =>
        !deletedFeatureIds.has(String(item?.id)) &&
        !(next[key] || []).some((existing: any) => existing?.id === item?.id)
      );
      if (additions.length) {
        next[key] = [...(next[key] || []), ...additions] as never;
        changed = true;
      }
    });
    if (changed) setLayersData(next);
  }, [layersData, phuYenLayers, deletedFeatureIds]);

  // Đăng ký các lớp tri thức bản địa (Đất · Nước · Rừng) vào bảng lớp + symbology mặc định.
  // Chạy 1 lần khi JSON khung vừa tải; tôn trọng lớp người dùng đã ẩn/nhóm đã xóa.
  useEffect(() => {
    if (!knowledgeDefs.length) return;
    const hiddenAll = new Set(Object.values(hiddenLayerIds).flat());
    setLayerCategories(prev => {
      let changed = false;
      const next = prev.map(cat => {
        if (deletedCategoryIds.includes(cat.id)) return cat;
        const add = knowledgeDefs.filter(def =>
          def.category === cat.id &&
          !hiddenAll.has(def.id) &&
          !cat.layers.some(l => l.id === def.id)
        );
        if (!add.length) return cat;
        changed = true;
        return { ...cat, layers: [...cat.layers, ...add.map(def => ({ id: def.id, ten: def.ten, mau: def.mau, bieu_tuong: def.icon, iconOnly: true }))] };
      });
      return changed ? next : prev;
    });
    setLayerSymbologies(prev => {
      let changed = false;
      const next = { ...prev };
      knowledgeDefs.forEach(def => {
        if (next[def.id]) return;
        changed = true;
        next[def.id] = { title: def.ten, symbolType: "point", color: def.mau, fillColor: def.mau, lineWeight: 1.3, opacity: 0.95, fillOpacity: 0.95, dashArray: "", classes: [] };
      });
      return changed ? next : prev;
    });
    setActiveLayers(prev => {
      let changed = false;
      const next = new Set(prev);
      knowledgeDefs.forEach(def => {
        if (hiddenAll.has(def.id) || next.has(def.id)) return;
        // Lớp tắt mặc định (L7, ngoài phạm vi): không tự bật — người dùng tự bật sẽ được lưu qua activeLayers
        if (KNOWLEDGE_DEFAULT_OFF.has(def.id)) return;
        next.add(def.id);
        changed = true;
      });
      return changed ? next : prev;
    });
    // hiddenLayerIds/deletedCategoryIds cố ý không đưa vào deps: effect chỉ chạy lúc tải JSON
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeDefs]);

  /* ─── Lazy load ward boundaries when toggled ─── */
  useEffect(() => {
    if (!activeLayers.has("ward_boundaries") || allWardsGeoJson) return;
    setLoadingWardBoundaries(true);
    Promise.all([
      { p: "Sơn La", f: "/data/xa_sonla.geojson" },
      { p: "Điện Biên", f: "/data/xa_dienbien.geojson" },
      { p: "Lai Châu", f: "/data/xa_laichau.geojson" },
      { p: "Lào Cai", f: "/data/xa_laocai.geojson" }
    ].map(({ p, f }) =>
      fetch(BASE_PATH + f).then(r => r.json()).then((d: GeoJsonData) => ({ p, d }))
    )).then(arr => {
      const merged: GeoJsonData = {
        type: "FeatureCollection",
        features: arr.flatMap(({ p, d }) =>
          d.features.map(f => ({ ...f, properties: { ...f.properties, ten_tinh: p } }))
        )
      };
      setAllWardsGeoJson(merged);
    }).catch(console.error).finally(() => setLoadingWardBoundaries(false));
  }, [activeLayers, allWardsGeoJson]);

  useEffect(() => {
    if (!pendingWardSearch || !currentProvinceGeoJson || !wardsLayerRef.current) return;
    const target = currentProvinceGeoJson.features.find(feature => String(feature.properties.ma_xa || "").toLowerCase() === pendingWardSearch.toLowerCase());
    if (!target) return;
    const props = target.properties as unknown as WardProperties;
    setSelectedWard(props);
    setSelectedWardIds(new Set([props.ma_xa]));
    setSelectedAreaOnly(true);
    wardsLayerRef.current.eachLayer(layer => {
      const feature = (layer as L.GeoJSON).feature as GeoJSON.Feature | undefined;
      if (feature?.properties?.ma_xa === props.ma_xa) {
        const bounds = (layer as L.Layer & { getBounds?: () => L.LatLngBounds }).getBounds?.();
        if (bounds?.isValid()) mapRef.current?.fitBounds(bounds, { padding: [70, 70], maxZoom: 14, duration: 0.8 });
      }
    });
    setPendingWardSearch(null);
  }, [pendingWardSearch, currentProvinceGeoJson]);

  const searchArea = async () => {
    const query = searchText.trim().toLowerCase();
    if (!query) return;
    const province = Object.keys(PROVINCE_FILES).find(name => name.toLowerCase() === query || name.toLowerCase().includes(query));
    if (province) {
      setSearchMessage(null);
      setSelectedAreaOnly(true);
      await handleProvinceClick(province);
      return;
    }
    const sources = Object.entries(PROVINCE_FILES);
    const results = await Promise.all(sources.map(async ([name, url]) => ({ name, data: await fetchGeoJson(url) })));
    const match = results.flatMap(result => result.data.features.map(feature => ({ ...result, feature }))).find(result => {
      const props = result.feature.properties as Record<string, unknown>;
      return String(props.ten_xa || "").toLowerCase().includes(query) || String(props.ma_xa || "").toLowerCase() === query;
    });
    if (!match) {
      setSearchMessage("Không tìm thấy xã hoặc tỉnh phù hợp.");
      return;
    }
    setSearchMessage(null);
    setPendingWardSearch(String((match.feature.properties as Record<string, unknown>).ma_xa || ""));
    setSelectedAreaOnly(true);
    await handleProvinceClick(match.name);
  };

  const applyMapScale = (scale: number) => {
    if (!Number.isFinite(scale) || scale <= 0 || !mapRef.current) return;
    const map = mapRef.current;
    map.setZoom(zoomFromScale(scale, map.getCenter().lat));
    setMapScale(scale);
  };

  /* ─── Build overlay layers ─── */
  useEffect(() => {
    if (!layersData || !overlayGroupRef.current) return;
    const og = overlayGroupRef.current;

    const buildLayer = (id: string): L.Layer[] => {
      const ls: L.Layer[] = [];
      const isDrag = layerDragMode === id;

      const makeDraggableMarker = (lat: number, lng: number, icon: L.DivIcon, layerId: string, idx: number, popupHtml: string): L.Marker => {
        const m = L.marker([lat, lng], { icon, draggable: isDrag });
        if (POPUPS_ENABLED) m.bindPopup(popupHtml);
        if (isDrag) {
          m.on("dragend", (e: L.LeafletEvent) => {
            const newLatLng = (e.target as L.Marker).getLatLng();
            setLayersData(prev => {
              if (!prev) return prev;
              const next = { ...prev } as LayersData;
              const arr = [...(next as any)[layerId]];
              arr[idx] = { ...arr[idx], lat: newLatLng.lat, lng: newLatLng.lng };
              (next as any)[layerId] = arr;
              return next;
            });
          });
        }
        return m;
      };

      if (id === "rivers") {
        const riverStyle = getLayerSymbology("rivers");
        layersData.rivers.forEach(r => {
          if (!r.coords || r.coords.length < 2) return;
          const latlngs = r.coords.map(([lng,lat])=>[lat,lng] as L.LatLngExpression);
          const normalizedName = `${r.id || ""} ${r.ten || ""}`.toLowerCase();
          const isMainRiver = r.cap_song === 1 || r.width !== undefined || /sông đà|sông mã|sông hồng|sông nậm na|sông nậm mu|sông chảy/.test(normalizedName);
          const innerWeight = Math.max(1.6, r.width ?? (isMainRiver ? 3.2 : riverStyle.lineWeight));
          const casing = L.polyline(latlngs, { color: "#f8fcff", weight: innerWeight + 3.2, opacity: 0.95, lineCap: "round", lineJoin: "round", interactive: false });
          const line = L.polyline(latlngs, { color: riverStyle.color || "#2589c7", weight: innerWeight, opacity: Math.max(0.85, riverStyle.opacity), dashArray: riverStyle.dashArray || undefined, lineCap: "round", lineJoin: "round" });
          line.bindTooltip(`<b>${r.ten}</b><br><i>${r.ten_dia_phuong || ""}</i>`,{sticky:true,className:"custom-tooltip"});
          const riverPopup = `<div class="map-popup"><div class="popup-title">${r.ten}</div>${r.ten_dia_phuong ? `<div class="popup-sub"><i>${r.ten_dia_phuong}</i></div>` : ""}${r.mo_ta ? `<p>${r.mo_ta}</p>` : ""}${statusNote(r)}</div>`;
          if (POPUPS_ENABLED) line.bindPopup(riverPopup);
          ls.push(casing, line);
        });
      } else if (id === "forests") {
  const layerStyle = getLayerSymbology("forests");
        layersData.forests.forEach((f) => {
          const color = FOREST_COLORS[f.loai]||layerStyle.color;
          const sizeLine = f.dien_tich_ha ? `<p style="margin:2px 0 0;font-size:11px;color:#475569">📏 ${f.dien_tich_ha.toLocaleString("vi-VN")} ha${f.iucn?` · IUCN ${f.iucn}`:""}${f.nam_cong_bo?` · công bố ${f.nam_cong_bo}`:""}</p>` : "";
          const popup = `<div class="map-popup"><div class="popup-title">${f.ten}</div><div class="popup-sub" style="color:${color}">${FOREST_LABELS[f.loai]||f.loai} · <i>${f.ten_dia_phuong||""}</i></div>${sizeLine}<p>${f.mo_ta||""}</p>${statusNote(f)}</div>`;
          polygonRings(f.coords).forEach(ring => {
            const poly = L.polygon(ring.map(([lng,lat])=>[lat,lng] as L.LatLngExpression), {
              color, weight: Math.max(1, layerStyle.lineWeight), opacity: layerStyle.opacity,
              fillColor: color, fillOpacity: layerStyle.fillOpacity, dashArray: layerStyle.dashArray || undefined,
            });
            if (POPUPS_ENABLED) poly.bindPopup(popup);
            ls.push(poly);
          });
        });
      } else if (id === "medicinal_plants") {
  const layerStyle = getLayerSymbology("medicinal_plants");
        layersData.medicinal_plants.forEach((p) => {
          // Điểm ngoài phạm vi chính gom vào lớp tt_ngoai_pham_vi — không vẽ ở lớp cây thuốc để tránh nhân đôi
          if (p?.scope === "ngoài phạm vi chính") return;
          const tinh_trang = p.tinh_trang || (p as any)["tình_trang"] || "";
          const tinhTrangLower = tinh_trang.toLowerCase();
          const tinhTrangColor = tinhTrangLower.includes("chưa xác minh")?"#e09f3e":tinhTrangLower.includes("rất")||tinhTrangLower.includes("nguy")?"#e63946":tinhTrangLower.includes("hiem")||tinhTrangLower.includes("hiếm")?"#f4a261":"#52b788";
          const sizeLine = p.dien_tich_ha ? `<p style="margin:2px 0 0;font-size:11px;color:#475569">📏 ${p.dien_tich_ha.toLocaleString("vi-VN")} ha</p>` : "";
          const popup = `<div class="map-popup"><div class="popup-title">${p.ten}</div><div class="popup-sub" style="font-style:italic">${p.ten_khoa_hoc||""}${p.ten_dia_phuong?` · <i>${p.ten_dia_phuong}</i>`:""}</div>${sizeLine}<p><b>Công dụng:</b> ${p.cong_dung||""}</p>${tinh_trang?`<p><b>Tình trạng:</b> <span style="color:${tinhTrangColor}">${tinh_trang}</span></p>`:""}${p.mo_ta?`<p>${p.mo_ta}</p>`:""}${p.ghi_chu?`<p style="font-size:11px;color:#64748b">${p.ghi_chu}</p>`:""}${statusNote(p)}</div>`;
          if (Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))) {
            ls.push(makeDraggableMarker(Number(p.lat), Number(p.lng), makeDivIcon("🌿", layerStyle.color, 26, true), "medicinal_plants", layersData.medicinal_plants.indexOf(p), popup));
          }
          polygonRings(p.coords).forEach(ring => {
            const poly = L.polygon(ring.map(([lng,lat])=>[lat,lng] as L.LatLngExpression), {
              color: layerStyle.color, weight: Math.max(1, layerStyle.lineWeight), opacity: layerStyle.opacity,
              fillColor: layerStyle.fillColor || layerStyle.color, fillOpacity: layerStyle.fillOpacity, dashArray: layerStyle.dashArray || undefined,
            });
            if (POPUPS_ENABLED) poly.bindPopup(popup);
            ls.push(poly);
          });
        });
      } else if (isKnowledgeLayer(id)) {
        // Lớp tri thức bản địa rev 12 (L1–L7) — điểm theo ma_xa, ẩn điểm xã khác khi đang xem 1 xã
        const def = knowledgeDefs.find(d => d.id === id);
        const layerStyle = getLayerSymbology(id);
        const wardNames = new Map<string, string>();
        if (allWardsGeoJson) allWardsGeoJson.features.forEach(f => {
          const p = f.properties as Record<string, unknown> | undefined;
          if (p?.ma_xa && p?.ten_xa) wardNames.set(String(p.ma_xa), String(p.ten_xa));
        });
        ((layersData as any)[id] || []).forEach((item: any, idx: number) => {
          const hasPoint = typeof item.lat === "number" && typeof item.lng === "number";
          if (!hasPoint && !Array.isArray(item.coords)) return;
          if (selectedWard && item.ma_xa && item.ma_xa !== selectedWard.ma_xa) return;
          const wardName = item.ma_xa ? wardNames.get(String(item.ma_xa)) || "" : "";
          const srcs: string[] = Array.isArray(item.nguon)
            ? item.nguon.map(String)
            : item.nguon ? String(item.nguon).split(/[;·]|,\s*/).map(s => s.trim()).filter(Boolean) : [];
          const srcHtml = srcs.length ? `<p style="margin:4px 0 0;font-size:10px;color:#64748b">Nguồn: ${srcs.map(u => /^https?:\/\//.test(u) ? `<a href="${u}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline">${escapeHtmlText(u)}</a>` : escapeHtmlText(u)).join("; ")}</p>` : "";
          const statusHtml = item.trang_thai === "co_nguon"
            ? `<p style="margin:6px 0 0;font-size:11px;color:#15803d">✓ Đã đối chiếu nguồn</p>`
            : item.trang_thai === "can_doi_chieu"
              ? `<p style="margin:6px 0 0;font-size:11px;color:#b45309">ⓘ Cần đối chiếu tại chỗ</p>` : "";
          // Cờ tọa độ + độ chính xác từ rà soát rev 12 (lat/lng gốc không đổi — chỉ hiển thị)
          const alertColor = item.coord_alert === "đỏ" ? "#b91c1c" : item.coord_alert === "vàng" ? "#b45309" : "#15803d";
          const alertText = item.coord_alert === "đỏ" ? "🔴 Tọa độ cần đối chiếu" : item.coord_alert === "vàng" ? "🟡 Tọa độ cần kiểm tra" : "";
          const coordHtml = (item.coord_precision || alertText)
            ? `<p style="margin:3px 0 0;font-size:10px;color:${alertColor}">${[item.coord_precision ? escapeHtmlText(String(item.coord_precision)) : "", alertText].filter(Boolean).join(" · ")}</p>` : "";
          const splitHtml = item.split_from
            ? `<p style="margin:3px 0 0;font-size:10px;color:#64748b">✂ Tách từ điểm gốc — nội dung chi tiết chưa xác minh</p>` : "";
          const image = item.anh ? `<img src="${assetUrl(item.anh)}" alt="" style="display:block;width:100%;max-height:170px;object-fit:cover;border-radius:6px;margin:6px 0" />` : "";
          const popup = `<div class="map-popup"><div class="popup-title">${escapeHtmlText(String(item.ten || "(chưa đặt tên)"))}</div><div class="popup-sub">${escapeHtmlText(String(item.linh_vuc || def?.ten || ""))}${wardName ? ` · <i>${escapeHtmlText(wardName)}</i>` : ""}</div>${coordHtml}${image}${item.mo_ta ? `<p>${escapeHtmlText(String(item.mo_ta))}</p>` : ""}${splitHtml}${statusHtml}${srcHtml}${item.ghi_chu ? `<p style="font-size:11px;color:#64748b">${escapeHtmlText(String(item.ghi_chu))}</p>` : ""}</div>`;
          // Emoji theo lớp gốc của điểm (L2 phân loại theo loại hình thủy lợi) — màu theo lớp đang xem
          const ownStyle = typeof item.layer === "string" ? KNOWLEDGE_LAYER_STYLE[`tt_${item.layer.toLowerCase()}`] : undefined;
          const emoji = item.layer === "L2"
            ? thuyLoiSubtypeEmoji(String(item.linh_vuc || ""), ownStyle?.icon || def?.icon || "💧")
            : (ownStyle?.icon || def?.icon || "📌");
          if (hasPoint) {
            // Tọa độ hiển thị (display_lat/lng) — lat/lng gốc giữ nguyên làm dữ liệu
            const dLat = Number.isFinite(Number(item.display_lat)) ? Number(item.display_lat) : item.lat;
            const dLng = Number.isFinite(Number(item.display_lng)) ? Number(item.display_lng) : item.lng;
            ls.push(makeDraggableMarker(dLat, dLng, makeDivIcon(emoji, layerStyle.color, 26, false), id, idx, popup));
          }
          polygonRings(item.coords).forEach(ring => {
            const poly = L.polygon(ring.map(([lng, lat]) => [lat, lng] as L.LatLngExpression), {
              color: layerStyle.color, weight: Math.max(1, layerStyle.lineWeight), opacity: layerStyle.opacity,
              fillColor: layerStyle.fillColor || layerStyle.color, fillOpacity: layerStyle.fillOpacity, dashArray: layerStyle.dashArray || undefined,
            });
            if (POPUPS_ENABLED) poly.bindPopup(popup);
            ls.push(poly);
          });
        });
      } else if (id.startsWith("custom_")) {
        const cl = customLayers.find(c => c.id === id);
        const arr = (layersData as any)[id] as any[] | undefined;
        if (cl && arr) {
          if (cl.geomType === "point") {
            arr.forEach((f, idx) => {
              if (typeof f.lat !== "number" || typeof f.lng !== "number") return;
              const popup = `<div class="map-popup"><div class="popup-title">${f.ten || "(chưa đặt tên)"}</div>${f.mo_ta ? `<p>${f.mo_ta}</p>` : ""}</div>`;
              ls.push(makeDraggableMarker(f.lat, f.lng, makeDivIcon(cl.bieu_tuong || "📌", cl.mau, 26), id, idx, popup));
            });
          } else if (cl.geomType === "line") {
            arr.forEach(f => {
              const coords = f.coords;
              if (!coords || coords.length < 2) return;
              const line = L.polyline(coords.map(([lng, lat]: [number, number]) => [lat, lng] as L.LatLngExpression), { color: cl.mau, weight: 3, opacity: 0.85 });
              line.bindTooltip(`<b>${f.ten || ""}</b>${f.mo_ta ? `<br>${f.mo_ta}` : ""}`, { sticky: true, className: "custom-tooltip" });
              ls.push(line);
            });
          } else if (cl.geomType === "polygon") {
            arr.forEach(f => {
              const raw = f.coords;
              if (!raw) return;
              const coords = (Array.isArray(raw[0]) && Array.isArray(raw[0][0])) ? raw[0] : raw;
              if (!coords || coords.length < 3) return;
              const poly = L.polygon(coords.map(([lng, lat]: [number, number]) => [lat, lng] as L.LatLngExpression), { color: cl.mau, weight: 2, opacity: 0.85, fillColor: cl.mau, fillOpacity: 0.18 });
              if (POPUPS_ENABLED) poly.bindPopup(`<div class="map-popup"><div class="popup-title">${f.ten || ""}</div>${f.mo_ta ? `<p>${f.mo_ta}</p>` : ""}</div>`);
              ls.push(poly);
            });
          }
        }
      } else if (id === "ward_boundaries" && allWardsGeoJson && viewMode === "province") {
        const wardStyle = layerSymbologies.ward_boundaries || DEFAULT_LAYER_SYMBOLOGY.ward_boundaries;
        const layer = L.geoJSON(allWardsGeoJson as GeoJSON.FeatureCollection, {
          style: (feat) => getWardMapStyle((feat?.properties ?? {}) as WardProperties, wardStyle),
          onEachFeature: (feat, lyr) => {
            const p = feat.properties as unknown as WardProperties;
            lyr.bindTooltip(wardTooltipHtml(p), { sticky: true, className: "custom-tooltip ward-tip" });
            (lyr as L.Path).on({
              mouseover: e => {
                if (selectedAreaOnlyRef.current && selectedWard && p.ma_xa !== selectedWard.ma_xa) return;
                const cur = getWardMapStyle(p, wardStyle);
                (e.target as L.Path).setStyle({ ...cur, fillOpacity: Math.min(1, cur.fillOpacity + 0.18), color: "#3d1f0d", weight: cur.weight + 0.8 });
                (e.target as L.Path).bringToFront();
              },
              mouseout: e => { (e.target as L.Path).setStyle(getWardMapStyle(p, wardStyle)); },
            });
          }
        });
        ls.push(layer);
      }
      return ls;
    };

    layerInstancesRef.current.forEach(layers => layers.forEach(l => og.removeLayer(l)));
    layerInstancesRef.current.clear();

    activeLayers.forEach(id => {
      const built = buildLayer(id);
      layerInstancesRef.current.set(id, built);
      built.forEach(l => og.addLayer(l));
    });
  }, [layersData, activeLayers, layerDragMode, allWardsGeoJson, customLayers, layerSymbologies, viewMode, danTocData, ethnicOverrides, wardOverrides, showPieSelector, pieWardSelection, selectedWard, selectedAreaOnly, knowledgeDefs]);

  /* ─── Population density layer ─── */
  useEffect(() => {
    const map = mapRef.current;
    const overlayGroup = overlayGroupRef.current;
    if (!map || !overlayGroup) return;
    if (densityLayerRef.current) {
      overlayGroup.removeLayer(densityLayerRef.current);
      densityLayerRef.current = null;
    }
    if (activeRaster || !activeLayers.has("population_density") || !selectedProvince || !currentProvinceGeoJson) return;
    const densityStyle = getLayerSymbology("population_density");
    if (!map.getPane("density-pane")) {
      const pane = map.createPane("density-pane");
      pane.style.zIndex = "350";
    }

    const layer = L.geoJSON(currentProvinceGeoJson as GeoJSON.FeatureCollection, {
      pane: "density-pane",
      style: (feature) => {
        const props = (feature?.properties as unknown as WardProperties | undefined) ?? {} as WardProperties;
        const density = getDensityValue(props);
        return { color: "#3f3f3f", weight: 1.1, opacity: 0.9, fillColor: getDensityColor(density), fillOpacity: densityStyle.fillOpacity };
      },
      onEachFeature: (feature, lyr) => {
        const props = (feature?.properties as unknown as WardProperties | undefined) ?? {} as WardProperties;
        const density = getDensityValue(props);
        const tooltip = `<div class="ward-tooltip"><b>${props.ten_xa}</b><br/><span style="opacity:0.75">${props.ten_tinh || ""}</span><br/>Mật độ: <b>${density.toFixed(1)} ng/km²</b><br/>Dân số: <b>${Number(props.dan_so || 0).toLocaleString("vi-VN")} người</b></div>`;
        lyr.bindTooltip(tooltip, { sticky: true, className: "custom-tooltip ward-tip" });
        (lyr as L.Path).on({
          mouseover: e => {
            if (selectedAreaOnlyRef.current && selectedWard && props.ma_xa !== selectedWard.ma_xa) return;
            const target = e.target as L.Path;
            target.setStyle({ fillOpacity: Math.min(1, densityStyle.fillOpacity + 0.2), weight: 2, color: "#2d1b0f" });
            target.bringToFront();
          },
          mouseout: e => {
            if (selectedAreaOnlyRef.current && selectedWard && props.ma_xa !== selectedWard.ma_xa) return;
            const target = e.target as L.Path;
            target.setStyle({ fillOpacity: densityStyle.fillOpacity, weight: 1.1, color: "#3f3f3f" });
          },
        });
      },
    });
    layer.addTo(overlayGroup);
    densityLayerRef.current = layer;
    return () => {
      if (densityLayerRef.current) {
        overlayGroup.removeLayer(densityLayerRef.current);
        densityLayerRef.current = null;
      }
    };
  }, [activeLayers, activeRaster, selectedProvince, currentProvinceGeoJson, wardOverrides, layerSymbologies]);

  /* ─── Nhãn tên xã vĩnh viễn (bật/tắt · màu chữ · cỡ chữ) ─── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (wardLabelsLayerRef.current) {
      map.removeLayer(wardLabelsLayerRef.current);
      wardLabelsLayerRef.current = null;
    }
    if (!wardLabelConfig.on) return;
    const source = currentProvinceGeoJson || allWardsGeoJson;
    if (!source?.features?.length) return;
    const features = selectedAreaOnly && selectedWardIds.size > 0 && currentProvinceGeoJson
      ? currentProvinceGeoJson.features.filter(feature => selectedWardIds.has(String((feature.properties as unknown as WardProperties)?.ma_xa)))
      : source.features;
    const group = L.layerGroup();
    features.forEach(feature => {
      const props = (feature.properties ?? {}) as unknown as WardProperties;
      const name = String(props.ten_xa || "").trim();
      if (!name || !feature.geometry) return;
      const probe = L.geoJSON(feature as GeoJSON.Feature);
      const bounds = probe.getBounds();
      probe.remove();
      if (!bounds.isValid()) return;
      const center = bounds.getCenter();
      const icon = L.divIcon({
        className: "ward-label-icon",
        html: `<span style="color:${escapeHtmlText(wardLabelConfig.color)};font-size:${wardLabelConfig.size}px">${escapeHtmlText(name)}</span>`,
        iconSize: [0, 0],
      });
      L.marker([center.lat, center.lng], { icon, interactive: false, keyboard: false, bubblingMouseEvents: false, opacity: 1 }).addTo(group);
    });
    group.addTo(map);
    wardLabelsLayerRef.current = group;
    return () => {
      if (wardLabelsLayerRef.current === group) {
        map.removeLayer(group);
        wardLabelsLayerRef.current = null;
      }
    };
  }, [wardLabelConfig, currentProvinceGeoJson, allWardsGeoJson, selectedAreaOnly, selectedWardIds]);

  /* ─── Cơ cấu dân tộc: TÔ NỀN XÃ THEO DÂN TỘC ĐA SỐ ───
     Trước đây là lớp biểu đồ tròn (pie) đặt lên từng xã — khó đọc và che bản đồ.
     Giờ mỗi xã được tô bằng màu của dân tộc chiếm tỷ lệ cao nhất (tone ấm),
     màu do `getWardMapStyle` quyết định nên hiệu ứng chạy cùng lớp ranh giới xã. */

  /* ─── Render annotations on map ─── */
  useEffect(() => {
    const ag = annotationGroupRef.current;
    if (!ag) return;
    ag.clearLayers();
    annotations.forEach(ann => {
      const emoji = NHOM_LABELS[ann.nhom] || "📍";
      if (ann.loai === "diem" && ann.coords[0]) {
        const [lat,lng] = ann.coords[0];
        const m = L.marker([lat,lng], {icon:makeDivIcon(emoji,ann.mau,28)});
        if (POPUPS_ENABLED) m.bindPopup(`<div class="map-popup"><div class="popup-title">${ann.ten}</div><div class="popup-sub">${ann.ngay}</div><p>${ann.mo_ta||""}</p></div>`);
        ag.addLayer(m);
      } else if (ann.loai === "duong" && ann.coords.length >= 2) {
        const line = L.polyline(ann.coords, {color:ann.mau,weight:3});
        if (POPUPS_ENABLED) line.bindPopup(`<div class="map-popup"><div class="popup-title">${ann.ten}</div><p>${ann.mo_ta||""}</p></div>`);
        ag.addLayer(line);
      } else if (ann.loai === "vung" && ann.coords.length >= 3) {
        const poly = L.polygon(ann.coords, {color:ann.mau,weight:2,fillColor:ann.mau,fillOpacity:0.2});
        if (POPUPS_ENABLED) poly.bindPopup(`<div class="map-popup"><div class="popup-title">${ann.ten}</div><p>${ann.mo_ta||""}</p></div>`);
        ag.addLayer(poly);
      }
    });
  }, [annotations, mapReady]);

  /* ─── Map-pick mode ─── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pickingPoint) return;
    const container = map.getContainer();
    container.style.cursor = "crosshair";
    const onClick = (e: L.LeafletMouseEvent) => {
      const cb = pickPointCbRef.current;
      pickPointCbRef.current = null;
      setPickingPoint(false);
      if (cb) cb(e.latlng.lat, e.latlng.lng);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        pickPointCbRef.current = null;
        setPickingPoint(false);
      }
    };
    map.on("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      map.off("click", onClick);
      window.removeEventListener("keydown", onKey);
      container.style.cursor = "";
    };
  }, [pickingPoint]);

  /* ─── Drawing mode map listeners ─── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();

    if (!drawMode) {
      container.style.cursor = "";
      return;
    }

    container.style.cursor = "crosshair";
    drawingCoordsRef.current = [];

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") cancelDraw();
    };
    window.addEventListener("keydown", onKey);

    const onClick = (e: L.LeafletMouseEvent) => {
      const coord: [number,number] = [e.latlng.lat, e.latlng.lng];
      drawingCoordsRef.current = [...drawingCoordsRef.current, coord];

      if (drawMode === "diem") {
        setPendingAnnotation({coords:[coord], loai:"diem"});
        setDrawMode(null);
      } else {
        if (drawingPolylineRef.current) { map.removeLayer(drawingPolylineRef.current); }
        const preview = L.polyline(drawingCoordsRef.current, {color:"#ffffff",weight:2,dashArray:"6,3",opacity:0.8});
        preview.addTo(map);
        drawingPolylineRef.current = preview;
      }
    };

    const onDblClick = (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
      const coords = [...drawingCoordsRef.current];
      if (drawingPolylineRef.current) { map.removeLayer(drawingPolylineRef.current); drawingPolylineRef.current = null; }
      if (coords.length >= 2) {
        const geomCb = drawGeomCbRef.current;
        drawGeomCbRef.current = null;
        setDrawMode(null);
        if (geomCb) {
          // Chuyển [lat,lng] → quy ước [lng,lat] của dữ liệu lớp
          geomCb(coords.map(([lat, lng]) => [lng, lat] as [number, number]));
        } else {
          setPendingAnnotation({coords, loai: drawMode as "duong"|"vung"});
        }
      }
    };

    map.on("click", onClick);
    map.on("dblclick", onDblClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      map.off("click", onClick);
      map.off("dblclick", onDblClick);
      if (drawingPolylineRef.current) { map.removeLayer(drawingPolylineRef.current); drawingPolylineRef.current = null; }
      container.style.cursor = "";
    };
  }, [drawMode]);

  /* ─── Helpers ─── */
  const fetchGeoJson = async (url: string): Promise<GeoJsonData> => { const r = await fetch(BASE_PATH+url); if (!r.ok) throw new Error(url); return r.json(); };
  const getLayerSymbology = (layerId: string): LayerSymbologyConfig => (
    layerSymbologies[layerId] || DEFAULT_LAYER_SYMBOLOGY[layerId] || {
      title: layerId, symbolType: "point", color: "#4c6ef5", fillColor: "#4c6ef5", lineWeight: 1.2, opacity: 0.9, fillOpacity: 0.14, dashArray: "", classes: [],
    }
  );
  // Từ mức zoom này trở lên, ranh giới vẽ nét liền (giống quy ước bản đồ giấy — nhìn gần thì rõ nét)
const BOUNDARY_SOLID_ZOOM_THRESHOLD = 11;
const getZoomAwareDashArray = (baseDashArray: string, zoom: number) =>
  zoom >= BOUNDARY_SOLID_ZOOM_THRESHOLD ? "" : baseDashArray;
  const getDensityValue = (w: WardProperties) => {
    // Ưu tiên lấy giá trị mật độ đã được chỉnh sửa thủ công từ wardOverrides
    const overrideVal = getWardValue(w, "matdo_km2");
    if (typeof overrideVal === "number" && Number.isFinite(overrideVal)) return overrideVal;
    
    // Dùng String() để an toàn với mọi kiểu dữ liệu mà TypeScript không báo lỗi trim
    const overrideStr = String(overrideVal ?? "").trim();
    if (overrideStr !== "") {
      const parsed = parseFloat(overrideStr);
      if (!isNaN(parsed)) return parsed;
    }
    
    // Nếu chưa sửa, tự động tính từ diện tích và dân số
    const area = getWardValue(w, "dtich_km2");
    const pop = getWardValue(w, "dan_so");
    const areaNum = typeof area === "number" ? area : parseFloat(String(area || "0"));
    const popNum = typeof pop === "number" ? pop : parseFloat(String(pop || "0"));
    if (!areaNum || !popNum) return 0;
    return popNum / areaNum;
  };
  const getDensityColor = (value: number) => {
    const densityStyle = layerSymbologies.population_density || DEFAULT_LAYER_SYMBOLOGY.population_density;
    const classes = densityStyle.classes?.length ? densityStyle.classes : DENSITY_LABELS.map((label, index) => ({ label, color: DENSITY_COLORS[index] }));
    if (!Number.isFinite(value) || value <= 0) return classes[0].color;
    const upperBounds = classes.slice(0, -1).map(entry => {
      const match = entry.label.replace(/,/g, ".").match(/(?:<|–|−|-|to)\s*(\d+(?:\.\d+)?)/);
      return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
    });
    const classIndex = upperBounds.findIndex(bound => value < bound);
    return classes[classIndex < 0 ? classes.length - 1 : classIndex].color;
  };
  const getWardValue = <K extends keyof WardProperties>(w:WardProperties,f:K):WardProperties[K] => { const ov=wardOverrides.get(w.ma_xa); return (ov&&f in ov?ov[f as string]:w[f]) as WardProperties[K]; };
  // Màu hiển thị phải TRÙNG với màu trong chú giải: ưu tiên `mau` của dan_toc.json
  // (nguồn quy định màu cho từng dân tộc), sau đó mới tới bảng màu nội bộ.
  const ethnicDisplayColor = (id: string, fallback?: string) => fallback || ETHNIC_COLORS[id] || ETHNIC_OTHER_COLOR;
  const getWardMapStyle = (p: WardProperties, baseStyle: LayerSymbologyConfig) => {
  const ov = wardOverrides.get(p.ma_xa);
  const composition = ov?.dan_toc ?? p.dan_toc ?? [];
  const dominant = composition.filter(item => Number(item.ty_le) > 0).sort((a, b) => b.ty_le - a.ty_le)[0];
  // Lớp "Biểu đồ cơ cấu dân tộc" = tô nền theo dân tộc đa số (không còn là lớp biểu đồ tròn).
  // Chưa chọn lọc xã nào → áp cho toàn bộ; đã chọn → chỉ tô các xã trong danh sách.
  const ethnicMapActive = showPieSelector && (pieWardSelection.size === 0 || pieWardSelection.has(p.ma_xa));
  const dominantInfo = dominant ? danTocData?.dan_toc.find(item => item.id === dominant.dan_toc) : undefined;
  return {
    color: (ov?.mau_vien as string) ?? baseStyle.color,
    weight: (ov?.do_day_vien as number) ?? baseStyle.lineWeight,
    opacity: (ov?.do_dam_vien as number) ?? baseStyle.opacity,
    fillColor: (ov?.mau_vung as string) ?? (ethnicMapActive && dominant ? ethnicDisplayColor(dominant.dan_toc, dominantInfo?.mau) : baseStyle.fillColor),
    fillOpacity: (ov?.do_dam_vung as number) ?? (ethnicMapActive && dominant ? 0.62 : baseStyle.fillOpacity),
    // Cấp xã giữ nét đứt ở mọi zoom để phân cấp với ranh giới cấp tỉnh (nét liền)
    dashArray: baseStyle.dashArray || undefined,
  };
};
/** Tooltip của xã — khi lớp cơ cấu dân tộc bật thì kèm dân tộc đa số + toàn bộ tỷ lệ. */
const wardTooltipHtml = (p: WardProperties): string => {
  const name = escapeHtmlText(String(p.ten_xa || ""));
  if (!showPieSelector) return `<div class="ward-tooltip">${name}</div>`;
  const composition = withOtherEthnic((wardOverrides.get(p.ma_xa)?.dan_toc ?? p.dan_toc ?? []).slice())
    .filter(item => Number(item.ty_le) > 0)
    .sort((a, b) => b.ty_le - a.ty_le);
  if (!composition.length) return `<div class="ward-tooltip"><b>${name}</b><br/>Chưa có dữ liệu dân tộc</div>`;
  const dominant = composition[0];
  const domName = ethnicLabelOf(dominant.dan_toc, getDanTocInfo(dominant.dan_toc)?.ten);
  const rows = composition.map(item => {
    const info = getDanTocInfo(item.dan_toc);
    const label = ethnicLabelOf(item.dan_toc, info?.ten);
    const color = info?.mau || ETHNIC_COLORS[item.dan_toc] || ETHNIC_OTHER_COLOR;
    return `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:5px"></span>${escapeHtmlText(label)}: <b>${item.ty_le}%</b>`;
  }).join("<br/>");
  return `<div class="ward-tooltip"><b>${name}</b><br/><span style="color:#f3c29d;font-weight:700">Đa số: ${escapeHtmlText(domName)} (${dominant.ty_le}%)</span><br/>${rows}</div>`;
};

/** Xã này có đang được lớp cơ cấu dân tộc tô nền không? */
const wardEthnicFillOn = (p: WardProperties): boolean => {
  if (!showPieSelector) return false;
  if (pieWardSelection.size > 0 && !pieWardSelection.has(p.ma_xa)) return false;
  const composition = wardOverrides.get(p.ma_xa)?.dan_toc ?? p.dan_toc ?? [];
  return composition.some(item => Number(item.ty_le) > 0);
};

const refreshBoundaryStyles = () => {
  const zoom = mapRef.current?.getZoom() ?? 7;
  if (provincesLayerRef.current) {
    const provinceStyle = getLayerSymbology("province_boundaries");
    provincesLayerRef.current.setStyle((feat) => ({
      ...(feat?.properties?.ten_tinh && selectedAreaOnly && selectedProvince && feat.properties.ten_tinh !== selectedProvince ? { opacity: 0, fillOpacity: 0 } : {}),
      color: provinceStyle.color,
      weight: provinceStyle.lineWeight,
      opacity: provinceStyle.opacity,
      fillColor: provinceStyle.fillColor,
      fillOpacity: selectedAreaOnly && selectedProvince ? 0 : selectedProvince ? 0 : provinceStyle.fillOpacity,
      dashArray: getZoomAwareDashArray(provinceStyle.dashArray, zoom),
    }));
  }
  if (wardsLayerRef.current) {
    const wardStyle = getLayerSymbology("ward_boundaries");
    // Dùng ref (đồng bộ theo activeLayers) thay vì state trực tiếp để các lời gọi
    // từ hàm async (handleProvinceClick) luôn đọc được trạng thái mới nhất.
    const wardLayerOn = wardBoundaryOnRef.current;
    wardsLayerRef.current.setStyle((feat) => {
      const ward = feat!.properties as unknown as WardProperties;
      const style = getWardMapStyle(ward, wardStyle);
      // Lớp ranh giới tắt: vẫn giữ màu nền dân tộc nếu lớp cơ cấu đang bật, chỉ giấu nét viền
      if (!wardLayerOn) return wardEthnicFillOn(ward) ? { ...style, opacity: 0 } : { ...style, opacity: 0, fillOpacity: 0 };
      return selectedAreaOnly && selectedWardIds.size > 0 && !selectedWardIds.has(ward.ma_xa)
        ? { ...style, opacity: 0, fillOpacity: 0 }
        : style;
    });
    // Cập nhật nội dung tooltip theo trạng thái hiện tại (dân tộc đa số + cơ cấu)
    wardsLayerRef.current.eachLayer(lyr => {
      const feat = (lyr as unknown as { feature?: GeoJSON.Feature }).feature;
      const props = (feat?.properties ?? null) as WardProperties | null;
      if (props) lyr.setTooltipContent(wardTooltipHtml(props));
    });
  }
};
  useEffect(() => {
    refreshBoundaryStyles();
  }, [activeLayers, wardOverrides, ethnicOverrides, danTocData, selectedAreaOnly, selectedWardIds, showPieSelector, pieWardSelection]);
  const getDanTocInfo = (id:string):DanTocInfo|undefined => {
    const b = danTocData?.dan_toc.find(d => d.id === id);
    const extra = EXTRA_ETHNIC_OPTIONS.find(item => item.id === id);
    if (!b && !extra) return;
    if (!b && extra) return { id, ten: extra.ten, mau: extra.mau, dan_so_ca_nuoc: 0, ngon_ngu: "", mo_ta: "", tri_thuc: [] };
    const ov = ethnicOverrides.get(id);
    const triOv = triThucOverrides.get(id);
    return { ...b!, ...(ov || {}), tri_thuc: triOv || b!.tri_thuc };
  };
  const getProvinceStat = (t:string):ProvinceStat => ({...(DEFAULT_STATS[t]||{dien_tich:"—",dan_so:"—",don_vi:0}),...provinceEdits.get(t)});
  const updateWardField = (ma_xa:string,field:string,value:unknown) => setWardOverrides(p=>{const n=new Map(p);n.set(ma_xa,{...n.get(ma_xa),[field]:value});return n;}); const saveWardStyle = (ma_xa: string, value: WardStyleValue) => {
  setWardOverrides(prev => {
    const n = new Map(prev);
    n.set(ma_xa, { ...(n.get(ma_xa) || {}), ...value });
    return n;
  });
};

const resetWardStyle = (ma_xa: string) => {
  setWardOverrides(prev => {
    const n = new Map(prev);
    const cur = { ...(n.get(ma_xa) || {}) };
    delete cur.mau_vung; delete cur.do_dam_vung; delete cur.mau_vien; delete cur.do_day_vien; delete cur.do_dam_vien;
    n.set(ma_xa, cur);
    return n;
  });
};

  /* ─── "Thông tin địa bàn": danh sách mục nội dung RIÊNG cho từng xã ─── */
  const findWardByMa = (ma_xa: string): WardProperties | undefined => {
    if (panelWard?.ma_xa === ma_xa) return panelWard;
    if (selectedWard?.ma_xa === ma_xa) return selectedWard;
    return currentProvinceGeoJson?.features
      .map(feature => feature.properties as unknown as WardProperties)
      .find(w => w.ma_xa === ma_xa);
  };
  /** Mục nội dung của xã: ưu tiên bản người dùng đã sửa; chưa có → dùng `dac_diem` sẵn trong geojson làm mục đầu. */
  const getWardSections = (ward: WardProperties): MucNoiDung[] => {
    const ov = wardOverrides.get(ward.ma_xa);
    if (Array.isArray(ov?.muc_noi_dung)) return ov.muc_noi_dung as MucNoiDung[];
    return ward.dac_diem ? [{ id: "dac_diem", tieu_de: "Đặc điểm địa bàn", noi_dung: ward.dac_diem }] : [];
  };
  const saveWardSections = (ma_xa: string, list: MucNoiDung[]) => updateWardField(ma_xa, "muc_noi_dung", list);
  const newSectionId = () => `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const addWardSection = (ward: WardProperties, tieu_de = "") => {
    saveWardSections(ward.ma_xa, [...getWardSections(ward), { id: newSectionId(), tieu_de, noi_dung: "" }]);
  };
  const updateWardSection = (ward: WardProperties, sectionId: string, patch: Partial<MucNoiDung>) => {
    saveWardSections(ward.ma_xa, getWardSections(ward).map(s => (s.id === sectionId ? { ...s, ...patch } : s)));
  };
  const moveWardSection = (ward: WardProperties, sectionId: string, dir: -1 | 1) => {
    const list = [...getWardSections(ward)];
    const idx = list.findIndex(s => s.id === sectionId);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= list.length) return;
    [list[idx], list[next]] = [list[next], list[idx]];
    saveWardSections(ward.ma_xa, list);
  };
  const removeWardSection = (ward: WardProperties, sectionId: string) => {
    if (!confirm("Xóa mục nội dung này?")) return;
    saveWardSections(ward.ma_xa, getWardSections(ward).filter(s => s.id !== sectionId));
  };
  const pickWardPhoto = (target: WardPhotoTarget) => { wardPhotoTargetRef.current = target; wardPhotoInputRef.current?.click(); };
  const handleWardPhotoChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const target = wardPhotoTargetRef.current;
    wardPhotoTargetRef.current = null;
    if (!file || !target) return;
    if (!file.type.startsWith("image/")) { alert("Vui lòng chọn tệp ảnh"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Ảnh quá lớn (tối đa 5 MB)"); return; }
    try {
      const { fileToDataUrl, resizeDataUrl } = await import("../utils/imageUtils");
      const small = await resizeDataUrl(await fileToDataUrl(file), 1024);
      if (target.kind === "hero") { updateWardField(target.ma_xa, "anh_dia_ban", small); return; }
      const ward = findWardByMa(target.ma_xa);
      if (!ward) return;
      updateWardSection(ward, target.sectionId, { anh: small });
    } catch { alert("Không đọc được tệp ảnh"); }
  };
  const SECTION_SUGGESTIONS = ["Vị trí địa lý", "Kinh tế", "Văn hóa – xã hội", "Giáo dục", "Giao thông", "Khí hậu – thổ nhưỡng", "Tiềm năng phát triển"];
  const updateEthnicField = (id:string,field:keyof EthnicOverride,value:string|number) => setEthnicOverrides(p=>{const n=new Map(p);n.set(id,{...n.get(id),[field]:value});return n;});
  const setEthnicPhoto = (id:string, anh:string|undefined) => setEthnicOverrides(p=>{const n=new Map(p);n.set(id,{...n.get(id),anh});return n;});
  const pickEthnicPhoto = (id:string) => { ethnicPhotoTargetRef.current = id; ethnicPhotoInputRef.current?.click(); };
  const handleEthnicPhotoChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const target = ethnicPhotoTargetRef.current;
    ethnicPhotoTargetRef.current = null;
    if (!file || !target) return;
    if (!file.type.startsWith("image/")) { alert("Vui lòng chọn tệp ảnh"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Ảnh quá lớn (tối đa 5 MB)"); return; }
    try {
      const { fileToDataUrl, resizeDataUrl } = await import("../utils/imageUtils");
      const dataUrl = await fileToDataUrl(file);
      const small = await resizeDataUrl(dataUrl, 1024);
      setEthnicPhoto(target, small);
    } catch { alert("Không đọc được tệp ảnh"); }
  };
  const updateProvinceStat = (t:string,f:keyof ProvinceStat,v:string) => setProvinceEdits(p=>{const n=new Map(p);n.set(t,{...n.get(t),[f]:f==="don_vi"?(parseInt(v)||0):v});return n;});
  const addPdf = (key:string,files:PdfFile[]) => setPdfFiles(p=>{const n=new Map(p);n.set(key,[...(n.get(key)||[]),...files]);return n;});
  const removePdf = (key:string,idx:number) => setPdfFiles(p=>{const n=new Map(p);const l=[...(n.get(key)||[])];URL.revokeObjectURL(l[idx].url);l.splice(idx,1);if(l.length===0)n.delete(key);else n.set(key,l);return n;});

  const updateWardEthnicPct = (ma_xa:string,danTocId:string,rawVal:string) => {
    const pct=Math.max(0,Math.min(100,parseFloat(rawVal)||0));
    const list=(wardOverrides.get(ma_xa)?.dan_toc??selectedWard?.dan_toc??[]).map(d=>({...d}));
    const idx=list.findIndex(d=>d.dan_toc===danTocId);
    if(idx>=0)list[idx].ty_le=pct;else list.push({dan_toc:danTocId,ty_le:pct});
    const total=list.reduce((s,d)=>s+d.ty_le,0);
    const scaled = total > 0 ? list.map(d => Math.round(d.ty_le * 10000 / total) / 100) : list.map(d => d.ty_le);
    const scaledTotal = scaled.reduce((sum, value) => sum + value, 0);
    const norm=total>0?list.map((d, index) => ({ ...d, ty_le: index === list.length - 1 ? Math.max(0, Math.round((scaled[index] + 100 - scaledTotal) * 100) / 100) : scaled[index] })):list;
    updateWardField(ma_xa,"dan_toc",norm.filter(d=>d.ty_le>0).sort((a,b)=>b.ty_le-a.ty_le));
    setEditingEthnicPct(null);
  };
  const saveWardComposition = (ma_xa: string, composition: DanTocTyLe[], colors: Record<string, string>) => {
  const normalized = composition.filter(item => Number.isFinite(item.ty_le) && item.ty_le > 0).sort((a,b) => b.ty_le - a.ty_le);
  const total = normalized.reduce((sum, item) => sum + item.ty_le, 0);
  const rounded = total > 0 ? normalized.map(item => Math.round(item.ty_le * 10000 / total) / 100) : [];
  const roundedTotal = rounded.reduce((sum, value) => sum + value, 0);
  const adjusted = total > 0 ? normalized.map((item, idx) => ({
    ...item,
    ty_le: idx === normalized.length - 1 ? Math.max(0, Math.round((rounded[idx] + 100 - roundedTotal) * 100) / 100) : rounded[idx],
  })).filter(item => item.ty_le > 0) : normalized;

  // 1. Cập nhật vào wardOverrides
  updateWardField(ma_xa, "dan_toc", adjusted.filter(item => item.ty_le > 0));

  // 2. 🔥 CẬP NHẬT TRỰC TIẾP VÀO selectedWard ĐANG CHỌN (Tránh bị đọc lại dữ liệu cũ)
  setSelectedWard(prev => {
    if (prev && prev.ma_xa === ma_xa) {
      return { ...prev, dan_toc: adjusted };
    }
    return prev;
  });

  // 3. Cập nhật màu sắc dân tộc nếu có
  const nextEthnicOverrides = new Map(ethnicOverrides);
  Object.entries(colors).forEach(([id, color]) => {
    const entry = nextEthnicOverrides.get(id) || {};
    nextEthnicOverrides.set(id, { ...entry, mau: color });
  });
  setEthnicOverrides(nextEthnicOverrides);
  
  setEditingWardComposition(null);
};

  /* ─── Tri thuc editing helpers ─── */
  const getTriThuc = (ethId:string):TriThuc[] => { const info=getDanTocInfo(ethId); return triThucOverrides.get(ethId)||(info?.tri_thuc??[]); };
  const updateTriThucField = (ethId:string,topicIdx:number,field:keyof TriThuc,value:string) => {
    setTriThucOverrides(p=>{const n=new Map(p);const list=[...getTriThuc(ethId)];list[topicIdx]={...list[topicIdx],[field]:value};n.set(ethId,list);return n;});
  };
  const updateBaiThuoc = (ethId:string,topicIdx:number,recipes:BaiThuoc[]) => {
    setTriThucOverrides(p=>{const n=new Map(p);const list=[...getTriThuc(ethId)];list[topicIdx]={...list[topicIdx],bai_thuoc:recipes};n.set(ethId,list);return n;});
  };
  const addTriThucTopic = (ethId:string,chu_de:string,bieu_tuong:string,noi_dung:string) => {
    setTriThucOverrides(p=>{const n=new Map(p);const list=[...getTriThuc(ethId),{chu_de,bieu_tuong,noi_dung,bai_thuoc:[]}];n.set(ethId,list);return n;});
    setNewTopicForm(null);
  };
  const removeTriThucTopic = (ethId:string,topicIdx:number) => {
    setTriThucOverrides(p=>{const n=new Map(p);const list=getTriThuc(ethId).filter((_,i)=>i!==topicIdx);n.set(ethId,list);return n;});
    setActiveTriThuc(prev=>Math.max(0,prev-1));
  };

  /* ─── Annotation helpers ─── */
  const saveAnnotation = (ann:Annotation) => { setAnnotations(p=>[...p,ann]); setPendingAnnotation(null); };
  const removeAnnotation = (id:string) => setAnnotations(p=>p.filter(a=>a.id!==id));
  const exportAnnotations = () => {
    const gj = { type:"FeatureCollection", features:annotations.map(a=>({ type:"Feature", properties:{ten:a.ten,mo_ta:a.mo_ta,nhom:a.nhom,loai:a.loai,ngay:a.ngay}, geometry:a.loai==="diem"?{type:"Point",coordinates:[a.coords[0][1],a.coords[0][0]]}:a.loai==="duong"?{type:"LineString",coordinates:a.coords.map(([lat,lng])=>[lng,lat])}:{type:"Polygon",coordinates:[a.coords.map(([lat,lng])=>[lng,lat])]} })) };
    const blob=new Blob([JSON.stringify(gj,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="annotations_taybac.geojson";a.click();URL.revokeObjectURL(url);
  };
  const cancelDraw = () => { setDrawMode(null); drawGeomCbRef.current = null; if(drawingPolylineRef.current&&mapRef.current){mapRef.current.removeLayer(drawingPolylineRef.current);drawingPolylineRef.current=null;} };
  const startDrawGeom = (geom: "duong" | "vung", cb: (coords: [number, number][]) => void) => {
    pickPointCbRef.current = null;
    setPickingPoint(false);
    drawGeomCbRef.current = cb;
    if (drawingPolylineRef.current && mapRef.current) { mapRef.current.removeLayer(drawingPolylineRef.current); drawingPolylineRef.current = null; }
    drawingCoordsRef.current = [];
    setDrawMode(geom);
  };

  /* ─── Layer data CRUD ─── */
  const addLayerFeature = (layerId: string, feature: any) => {
    setLayersData(prev => { if (!prev) return prev; const next = { ...prev } as any; next[layerId] = [...(next[layerId] || []), feature]; return next; });
  };
  const updateLayerFeature = (layerId: string, idx: number, feature: any) => {
    setLayersData(prev => { if (!prev) return prev; const next = { ...prev } as any; const arr = [...next[layerId]]; arr[idx] = feature; next[layerId] = arr; return next; });
  };
  const deleteLayerFeature = (layerId: string, idx: number) => {
    const feature = layersData ? ((layersData as any)[layerId] || [])[idx] : null;
    if (feature?.id) setDeletedFeatureIds(prev => new Set([...prev, String(feature.id)]));
    setLayersData(prev => { if (!prev) return prev; const next = { ...prev } as any; next[layerId] = next[layerId].filter((_: any, i: number) => i !== idx); return next; });
    showToast(`Đã xóa "${feature?.ten || "đối tượng"}"`, { type: "feature", layerId, idx, feature });
  };

  /* ─── Custom layer CRUD ─── */
  const addCustomLayer = (categoryId: string, input: NewLayerInput) => {
    const id = "custom_" + Math.random().toString(36).slice(2, 9);
    const cl: CustomLayer = { id, categoryId, ten: input.ten, mau: input.mau, bieu_tuong: input.bieu_tuong, geomType: input.geomType };
    setCustomLayers(prev => [...prev, cl]);
    setLayersData(prev => ({ ...(prev || {} as LayersData), [id]: [] } as LayersData));
    setActiveLayers(prev => new Set([...prev, id]));
  };
  const thematicSourceOf = (id: string): string | null => {
    const stored = layerCategories.flatMap(category => category.layers).find(layer => layer.id === id);
    if (stored?.isThematic) return stored.thematicSource || id;
    return THEMATIC_KEYS.includes(id as (typeof THEMATIC_KEYS)[number]) ? id : null;
  };
  const duplicateLayer = (layerId: string, categoryId: string) => {
    const source = layerCategories.flatMap(category => category.layers).find(layer => layer.id === layerId)
      || customLayers.find(layer => layer.id === layerId)
      || (rasterMeta?.layers[layerId] ? { id: layerId, ten: rasterMeta.layers[layerId].label, mau: thematicColor(rasterMeta.layers[layerId].stops), bieu_tuong: THEMATIC_ICONS[layerId] ?? "🗺️" } : null);
    if (!source) return;
    const id = `custom_${Math.random().toString(36).slice(2, 9)}`;
    const thematicSource = thematicSourceOf(layerId);
    if (thematicSource) {
      const targetCategoryId = categoryId === "__thematic__" ? layerCategories[0]?.id : categoryId;
      if (!targetCategoryId) return;
      const copy = { id, ten: `${source.ten} (bản sao)`, mau: source.mau, bieu_tuong: source.bieu_tuong, isThematic: true, isThematicCopy: true, thematicSource };
      setLayerCategories(prev => prev.map(category => category.id === targetCategoryId ? { ...category, layers: [...category.layers, copy] } : category));
      setActiveRaster(thematicSource);
      showToast(`Đã tạo bản sao lớp chuyên đề "${copy.ten}"`);
      return;
    }
    // Hai lớp nền đặc biệt không nằm trong layers.json — muốn copy được phải đúc poligon từ ranh giới xã
    const wardBacked = layerId === "ward_boundaries" || layerId === "population_density";
    let geomType: CustomLayer["geomType"] = LAYER_GEOM_TYPE[layerId] || (source as CustomLayer).geomType || "point";
    let sourceData: unknown[] | null = null;
    if (wardBacked) {
      const wardSource = currentProvinceGeoJson || allWardsGeoJson;
      if (!wardSource?.features?.length) {
        showToast("Chưa có dữ liệu ranh giới xã — hãy vào một tỉnh rồi thử sao chép lại.");
        return;
      }
      sourceData = wardSource.features.map(feature => {
        const props = feature.properties as unknown as WardProperties;
        const geometry = feature.geometry as { type?: string; coordinates?: unknown } | null;
        const rings = geometry?.type === "MultiPolygon"
          ? ((geometry.coordinates as number[][][][])?.[0] ?? null)
          : geometry?.type === "Polygon" ? (geometry.coordinates as number[][][] | undefined) ?? null : null;
        const outer = rings?.[0];
        return { ten: props.ten_xa, mo_ta: String((feature.properties as { ten_huyen?: string })?.ten_huyen || props.ten_tinh || ""), coords: outer };
      }).filter(item => Array.isArray(item.coords) && item.coords.length >= 3);
      geomType = "polygon";
      if (!sourceData.length) { showToast("Không đọc được hình dạng ranh giới để sao chép lớp."); return; }
    }
    const copy: CustomLayer = {
      id,
      categoryId,
      ten: `${source.ten} (bản sao)`,
      mau: source.mau,
      bieu_tuong: source.bieu_tuong,
      geomType,
    };
    setCustomLayers(prev => [...prev, copy]);
    setLayersData(prev => ({
      ...(prev || {} as LayersData),
      [id]: sourceData ?? JSON.parse(JSON.stringify((prev as any)?.[layerId] || [])),
    } as LayersData));
    setActiveLayers(prev => new Set([...prev, id]));
    showToast(`Đã tạo bản sao "${copy.ten}"`);
  };
  const toggleLayerCategory = (categoryId: string) => {
    const ids = combinedLayerIds(categoryId);
    if (!ids.length) return;
    setActiveLayers(prev => {
      const next = new Set(prev);
      const shouldEnable = ids.some(id => !next.has(id));
      ids.forEach(id => shouldEnable ? next.add(id) : next.delete(id));
      return next;
    });
  };
  const addLayerCategory = (ten: string, icon: string) => {
  const id = "group_" + Math.random().toString(36).slice(2, 9);
  setLayerCategories(prev => [...prev, { id, ten, icon, layers: [] }]);
};

const deleteLayerCategory = (categoryId: string) => {
  const cat = layerCategories.find(c => c.id === categoryId);
  if (!cat) return;
  // tắt các lớp đang bật thuộc nhóm này
  setActiveLayers(prev => {
    const next = new Set(prev);
    cat.layers.forEach(l => next.delete(l.id));
    return next;
  });
  // Chỉ xóa dữ liệu của lớp TỰ TẠO trong nhóm; dữ liệu lớp builtin được giữ nguyên (chỉ ẩn đi)
  const customInCat = customLayers.filter(c => c.categoryId === categoryId);
  if (customInCat.length) {
    setCustomLayers(prev => prev.filter(c => c.categoryId !== categoryId));
    setLayersData(prev => {
      if (!prev) return prev;
      const next = { ...prev } as any;
      customInCat.forEach(layer => delete next[layer.id]);
      return next;
    });
  }
  // Nếu là nhóm mặc định: ghi nhớ để không tự động khôi phục khi tải lại
  if (DEFAULT_LAYER_CATEGORIES.some(c => c.id === categoryId)) {
    setDeletedCategoryIds(prev => prev.includes(categoryId) ? prev : [...prev, categoryId]);
  }
  setLayerCategories(prev => {
    const next = prev.filter(c => c.id !== categoryId);
    const hiddenAll = new Set<string>(Object.values(hiddenLayerIds).flat());
    // Lớp builtin bị gom vào thư mục người dùng: trả về nhóm gốc khi thư mục bị xóa
    cat.layers.forEach(l => {
      const def = DEFAULT_LAYER_CATEGORIES.find(d => d.layers.some(x => x.id === l.id));
      if (!def || def.id === categoryId) return;
      if (deletedCategoryIds.includes(def.id)) return;
      if (hiddenAll.has(l.id)) return;
      const target = next.find(c => c.id === def.id);
      if (target && !target.layers.some(x => x.id === l.id)) {
        next[next.indexOf(target)] = { ...target, layers: [...target.layers, l] };
      }
    });
    return next;
  });
  if (editingLayer && cat.layers.some(l => l.id === editingLayer)) setEditingLayer(null);
  const customData: Record<string, any[]> = {};
  customInCat.forEach(layer => { if (layersData) customData[layer.id] = (layersData as any)[layer.id] || []; });
  showToast(`Đã xóa nhóm "${cat.ten}"`, { type: "category", category: cat, customLayers: customInCat, customData });
};

const removeBuiltinLayer = (categoryId: string, layerId: string) => {
  const layer = layerCategories.find(c => c.id === categoryId)?.layers.find(l => l.id === layerId);
  setLayerCategories(prev => prev.map(c =>
    c.id === categoryId ? { ...c, layers: c.layers.filter(l => l.id !== layerId) } : c
  ));
  setHiddenLayerIds(prev => {
    const list = prev[categoryId] || [];
    if (list.includes(layerId)) return prev;
    return { ...prev, [categoryId]: [...list, layerId] };
  });
  setActiveLayers(prev => { const next = new Set(prev); next.delete(layerId); return next; });
  if (layer) showToast(`Đã ẩn lớp "${layer.ten}" khỏi bảng lớp`, { type: "builtinLayer", categoryId, layer });
};
  const deleteCustomLayer = (id: string) => {
    const layer = customLayers.find(c => c.id === id);
    const features = layersData ? (layersData as any)[id] || [] : [];
    setCustomLayers(prev => prev.filter(c => c.id !== id));
    setLayersData(prev => { if (!prev) return prev; const next = { ...prev } as any; delete next[id]; return next; });
    setActiveLayers(prev => { const n = new Set(prev); n.delete(id); return n; });
    if (editingLayer === id) setEditingLayer(null);
    if (layerDragMode === id) setLayerDragMode(null);
    if (layer) showToast(`Đã xóa lớp "${layer.ten}"`, { type: "customLayer", layer, features });
  };
  const renameCustomLayer = (id: string, name: string) => {
    setCustomLayers(prev => prev.map(layer => layer.id === id ? { ...layer, ten: name } : layer));
  };
  const renameLayer = (id: string, name: string) => {
    renameCustomLayer(id, name);
    setLayerCategories(prev => prev.map(category => ({
      ...category,
      layers: category.layers.map(layer => layer.id === id ? { ...layer, ten: name } : layer),
    })));
  };
  const renameCategory = (id: string, name: string) => {
    setLayerCategories(prev => prev.map(category => category.id === id ? { ...category, ten: name } : category));
  };
  const toggleFolderCollapse = (id: string) => {
    setLayerCategories(prev => prev.map(category => category.id === id ? { ...category, collapsed: !category.collapsed } : category));
  };
  const combinedLayerIds = (categoryId: string): string[] => [
    ...(layerCategories.find(c => c.id === categoryId)?.layers.map(l => l.id) ?? []),
    ...customLayers.filter(c => c.categoryId === categoryId).map(c => c.id),
  ];
  const moveLayer = (layerId: string, targetCategoryId: string, index: number) => {
    // ── Lớp đặc biệt (Cơ cấu dân tộc · Tên xã): chỉ sắp xếp trong nhóm riêng ──
    const isSpecial = SPECIAL_LAYER_IDS.includes(layerId);
    if (isSpecial || targetCategoryId === SPECIAL_LAYER_CATEGORY_ID) {
      if (!isSpecial || targetCategoryId !== SPECIAL_LAYER_CATEGORY_ID) return;
      const next = specialLayerOrder.filter(id => SPECIAL_LAYER_IDS.includes(id) && id !== layerId);
      next.splice(Math.max(0, Math.min(index, next.length)), 0, layerId);
      setSpecialLayerOrder(next);
      return;
    }

    const storedThematic = layerCategories.flatMap(category => category.layers).find(layer => layer.id === layerId);
    const thematic = !!storedThematic?.isThematic || THEMATIC_KEYS.includes(layerId as (typeof THEMATIC_KEYS)[number]);
    const custom = customLayers.find(c => c.id === layerId);

    // ── Kéo vào nhóm "Bản đồ chuyên đề" ──
    // Nhóm này vốn là nhóm ảo (chỉ chứa raster); giờ cho phép cất lớp thường vào đó.
    if (targetCategoryId === "__thematic__") {
      const builtinLayer = layerCategories.flatMap(category => category.layers).find(layer => layer.id === layerId);
      const sourceLayer = builtinLayer
        ?? (thematic && rasterMeta?.layers[layerId] ? {
          id: layerId,
          ten: rasterMeta.layers[layerId].label,
          mau: thematicColor(rasterMeta.layers[layerId].stops),
          bieu_tuong: THEMATIC_ICONS[layerId] ?? "🗺️",
          isThematic: true,
          thematicSource: layerId,
        } : undefined);
      if (!sourceLayer && !custom) return;
      setLayerCategories(prev => {
        let next = prev.map(category => ({ ...category, layers: category.layers.filter(layer => layer.id !== layerId) }));
        if (!next.some(c => c.id === "__thematic__")) {
          next = [...next, { id: "__thematic__", ten: "Bản đồ chuyên đề", icon: "🗺️", layers: [] }];
        }
        if (!sourceLayer) return next;
        return next.map(category => {
          if (category.id !== "__thematic__") return category;
          const layers = [...category.layers];
          layers.splice(Math.max(0, Math.min(index, layers.length)), 0, sourceLayer);
          return { ...category, layers };
        });
      });
      if (custom) setCustomLayers(prev => prev.map(c => c.id === layerId ? { ...c, categoryId: "__thematic__" } : c));
      return;
    }

    if (thematic) {
      const sourceLayer = storedThematic
        ?? (rasterMeta?.layers[layerId] ? {
          id: layerId,
          ten: rasterMeta.layers[layerId].label,
          mau: thematicColor(rasterMeta.layers[layerId].stops),
          bieu_tuong: THEMATIC_ICONS[layerId] ?? "🗺️",
          isThematic: true,
          thematicSource: layerId,
        } : undefined);
      if (!sourceLayer) return;
      setLayerCategories(prev => {
        const without = prev.map(category => ({ ...category, layers: category.layers.filter(layer => layer.id !== layerId) }));
        const target = without.find(category => category.id === targetCategoryId);
        if (!target) return prev;
        const nextLayers = [...target.layers];
        nextLayers.splice(Math.max(0, Math.min(index, nextLayers.length)), 0, sourceLayer);
        return without.map(category => category.id === targetCategoryId ? { ...category, layers: nextLayers } : category);
      });
      return;
    }
    if (!layerCategories.some(c => c.id === targetCategoryId)) return;
    const builtin = layerCategories.flatMap(c => c.layers).find(l => l.id === layerId);
    if (!builtin && !custom) return;
    const sourceCategoryId = builtin
      ? layerCategories.find(c => c.layers.some(l => l.id === layerId))?.id
      : custom!.categoryId;
    if (!sourceCategoryId) return;
    const srcOrder = combinedLayerIds(sourceCategoryId).filter(id => id !== layerId);
    const tgtWithout = combinedLayerIds(targetCategoryId).filter(id => id !== layerId);
    const tgtOrder = [...tgtWithout];
    tgtOrder.splice(Math.max(0, Math.min(index, tgtWithout.length)), 0, layerId);
    const orderBuiltin = (layers: LayerCategoryState["layers"], order: string[], extra?: typeof builtin) => {
      const byId = new Map(layers.map(l => [l.id, l] as const));
      if (extra && !byId.has(extra.id)) byId.set(extra.id, extra);
      return order.map(id => byId.get(id)).filter((l): l is LayerCategoryState["layers"][number] => !!l);
    };
    const sameFolder = sourceCategoryId === targetCategoryId;
    setLayerCategories(prev => prev.map(c => {
      if (c.id === targetCategoryId) return { ...c, layers: orderBuiltin(c.layers, tgtOrder, builtin) };
      if (!sameFolder && c.id === sourceCategoryId) return { ...c, layers: orderBuiltin(c.layers, srcOrder) };
      return c;
    }));
    setCustomLayers(prev => {
      const moved = custom && prev.find(c => c.id === layerId);
      const withCat = moved ? prev.map(c => c.id === layerId ? { ...c, categoryId: targetCategoryId } : c) : prev;
      const reorder = (list: CustomLayer[], catId: string, order: string[]) => {
        const firstIdx = list.findIndex(c => c.categoryId === catId);
        if (firstIdx < 0) return list;
        const inCat = list.filter(c => c.categoryId === catId);
        const ordered = order.map(id => inCat.find(c => c.id === id)).filter((c): c is CustomLayer => !!c);
        return [...list.slice(0, firstIdx), ...ordered, ...list.slice(firstIdx).filter(c => c.categoryId !== catId)];
      };
      let out = withCat;
      if (!sameFolder) out = reorder(out, sourceCategoryId, srcOrder);
      out = reorder(out, targetCategoryId, tgtOrder);
      return out;
    });
  };

  /* ─── Import/Export Layer ─── */
  const importLayerFile = async (categoryId: string, file: File, color: string, symbol: string) => {
    const { parseGeoFile } = await import("../utils/geoUtils");
    const parsed = await parseGeoFile(file);
    if (!parsed) { alert("Không đọc được file. Hãy chọn file GeoJSON (.geojson/.json) hoặc KML (.kml) hợp lệ."); return; }
    const id = "custom_" + Math.random().toString(36).slice(2, 9);
    const ten = parsed.suggestedName || file.name.replace(/\.[^.]+$/, "") || "Lớp nhập";
    const cl: CustomLayer = { id, categoryId, ten, mau: color, bieu_tuong: symbol, geomType: parsed.geomType };
    setCustomLayers(prev => [...prev, cl]);
    setLayersData(prev => ({ ...(prev || {} as LayersData), [id]: parsed.features as any[] } as LayersData));
    setActiveLayers(prev => new Set([...prev, id]));
  };

  const exportLayer = async (layerId: string, format: "geojson" | "kml") => {
    const { featuresToGeoJSON, featuresToKML, downloadFile } = await import("../utils/geoUtils");
    const { symbolToBadgePng } = await import("../utils/imageUtils");
    const layerName = (layerDisplayAll[layerId]?.name) || layerId;
    const safeName = layerName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_").toLowerCase() || "layer";
    const meta = layerSymbolAll[layerId] || { mau: "#4895ef", bieu_tuong: "📍" };

    if (layerId === "ward_boundaries") {
      if (!allWardsGeoJson) { alert("Chưa có dữ liệu ranh giới xã"); return; }
      if (format === "geojson") {
        downloadFile(`${safeName}.geojson`, JSON.stringify(allWardsGeoJson, null, 2), "application/geo+json");
      } else {
        const features = allWardsGeoJson.features.map((f: any) => {
          const props = f.properties || {};
          const coords = f.geometry?.type === "Polygon" ? f.geometry.coordinates[0] : f.geometry?.type === "MultiPolygon" ? f.geometry.coordinates[0][0] : null;
          if (!coords) return null;
          return { ten: props.ten_xa || "", mo_ta: `${props.ten_huyen || ""} - ${props.ten_tinh || ""}`, coords };
        }).filter(Boolean) as any[];
        downloadFile(`${safeName}.kml`, featuresToKML(layerName, features, "polygon", { color: meta.mau }), "application/vnd.google-earth.kml+xml");
      }
      return;
    }

    const features = layersData ? ((layersData as any)[layerId] || []) : [];
    if (features.length === 0) { alert("Lớp này chưa có dữ liệu để xuất."); return; }
    const geomType = layerGeomAll[layerId] || "point";

    if (format === "geojson") {
      const fc = featuresToGeoJSON(features, geomType, { color: meta.mau, symbol: meta.bieu_tuong });
      downloadFile(`${safeName}.geojson`, JSON.stringify(fc, null, 2), "application/geo+json");
    } else {
      const iconHref = geomType === "point" ? await symbolToBadgePng(meta.bieu_tuong, meta.mau, 96) : undefined;
      const kml = featuresToKML(layerName, features, geomType, { color: meta.mau, iconHref, iconScale: 1.3 });
      downloadFile(`${safeName}.kml`, kml, "application/vnd.google-earth.kml+xml");
    }
  };
  const syncToComposer = async () => {
  if (!mapRef.current || !mapContainerRef.current) return;
  setSyncPending(true);

  try {
    mapRef.current.invalidateSize({ animate: false });
    refreshBoundaryStyles();
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    // Không chụp phần tử mask DOM (vùng Ngoại vi trắng): html2canvas từng render lệch mask
    // (dịch kép toạ độ) làm Ngoại vi = trắng cắt nhầm nội dung tỉnh. Thay vào đó, vùng trắng
    // được vẽ lại bằng canvas theo toạ độ ward gốc ngay bên dưới.
    let canvas: HTMLCanvasElement;
    const densityPaths: L.Path[] = [];
    const isolateSelectedDensity = selectedAreaOnly && selectedWardIds.size > 0;
    const captureDensityStyle = getLayerSymbology("population_density");
    densityLayerRef.current?.eachLayer(layer => {
      if (layer instanceof L.Path) {
        densityPaths.push(layer);
        const feature = (layer as unknown as L.GeoJSON).feature as GeoJSON.Feature | undefined;
        const wardId = String(feature?.properties?.ma_xa ?? "");
        layer.setStyle({
          fillOpacity: isolateSelectedDensity && !selectedWardIds.has(wardId) ? 0 : captureDensityStyle.fillOpacity,
        });
      }
    });
    try {
      canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        allowTaint: false,
        ignoreElements: (el) => el.classList.contains('leaflet-control-container') || el.classList.contains('selected-area-mask'),
        // html2canvas serialize SVG kèm cả CSS transform của Leaflet (zoom-animation) rồi
        // lại vẽ theo bounds đã gồm transform → dịch vị trí kép, làm mất fill ở một số vùng.
        // Gỡ transform + chuẩn hóa viewBox trong bản clone trước khi chụp.
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll<SVGSVGElement>('svg.leaflet-zoom-animated').forEach(svgEl => {
            svgEl.style.transform = 'none';
            svgEl.style.transformOrigin = '0 0';
            const vb = (svgEl.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number);
            if (vb.length === 4 && vb.every(n => Number.isFinite(n)) && (vb[0] !== 0 || vb[1] !== 0)) {
              svgEl.setAttribute('viewBox', `0 0 ${vb[2]} ${vb[3]}`);
            }
          });
        },
      });
    } finally {
      densityPaths.forEach(layer => {
        const feature = (layer as unknown as L.GeoJSON).feature as GeoJSON.Feature | undefined;
        const density = getDensityValue(feature?.properties as WardProperties);
        layer.setStyle({ color: "#3f3f3f", fillColor: getDensityColor(density), fillOpacity: captureDensityStyle.fillOpacity });
      });
    }
    if (selectedAreaOnly && selectedWardIds.size > 0 && currentProvinceGeoJson) {
      const selectedFeatures = currentProvinceGeoJson.features.filter(feature => selectedWardIds.has(String(feature.properties.ma_xa)));
      const mapRect = mapContainerRef.current.getBoundingClientRect();
      const scaleX = canvas.width / Math.max(1, mapRect.width);
      const scaleY = canvas.height / Math.max(1, mapRect.height);
      const clipped = document.createElement("canvas");
      clipped.width = canvas.width;
      clipped.height = canvas.height;
      const clippedContext = clipped.getContext("2d");
      if (clippedContext) {
        clippedContext.drawImage(canvas, 0, 0);
        clippedContext.globalCompositeOperation = "destination-in";
        clippedContext.beginPath();
        selectedFeatures.forEach(feature => {
          const geometry = feature.geometry as { type?: string; coordinates?: unknown } | null;
          const polygons = geometry?.type === "Polygon"
            ? [geometry.coordinates]
            : geometry?.type === "MultiPolygon"
              ? (geometry.coordinates as unknown[])
              : [];
          (polygons as unknown[]).forEach(polygon => {
            (polygon as unknown[]).forEach(ring => {
              if (!Array.isArray(ring) || ring.length < 3) return;
              ring.forEach((point, pointIndex) => {
                if (!Array.isArray(point) || point.length < 2) return;
                const projected = mapRef.current!.latLngToContainerPoint([Number(point[1]), Number(point[0])]);
                const x = projected.x * scaleX;
                const y = projected.y * scaleY;
                if (pointIndex === 0) clippedContext.moveTo(x, y);
                else clippedContext.lineTo(x, y);
              });
              clippedContext.closePath();
            });
          });
        });
        clippedContext.fill("evenodd");
        const outputContext = canvas.getContext("2d");
        if (outputContext) {
          outputContext.save();
          outputContext.setTransform(1, 0, 0, 1, 0, 0);
          outputContext.globalAlpha = 1;
          outputContext.globalCompositeOperation = "source-over";
          outputContext.clearRect(0, 0, canvas.width, canvas.height);
          outputContext.fillStyle = "#ffffff";
          outputContext.fillRect(0, 0, canvas.width, canvas.height);
          outputContext.drawImage(clipped, 0, 0);
          outputContext.restore();
        }
      }
    }
    // Vẽ lại vùng ngoại vi trắng (thanh "Ngoại vi") thẳng lên ảnh chụp theo toạ độ ward gốc,
    // thay vì dựa vào phần tử mask DOM — html2canvas từng render lệch mask nên Ngoại vi = trắng
    // cắt nhầm vào nội dung tỉnh.
    if (selectedAreaOnly && selectedAreaFade > 0 && selectedProvince && currentProvinceGeoJson) {
      const whiteFeatures = selectedWardIds.size > 0
        ? currentProvinceGeoJson.features.filter(feature => selectedWardIds.has(String(feature.properties.ma_xa)))
        : currentProvinceGeoJson.features;
      const fadeRect = mapContainerRef.current.getBoundingClientRect();
      const fadeScaleX = canvas.width / Math.max(1, fadeRect.width);
      const fadeScaleY = canvas.height / Math.max(1, fadeRect.height);
      const fadeCanvas = document.createElement("canvas");
      fadeCanvas.width = canvas.width;
      fadeCanvas.height = canvas.height;
      const fadeContext = fadeCanvas.getContext("2d");
      if (fadeContext) {
        fadeContext.globalAlpha = Math.min(1, Math.max(0, selectedAreaFade));
        fadeContext.fillStyle = "#ffffff";
        fadeContext.fillRect(0, 0, fadeCanvas.width, fadeCanvas.height);
        fadeContext.globalAlpha = 1;
        fadeContext.globalCompositeOperation = "destination-out";
        fadeContext.beginPath();
        whiteFeatures.forEach(feature => {
          const geometry = feature.geometry as { type?: string; coordinates?: unknown } | null;
          const polygons = geometry?.type === "Polygon"
            ? [geometry.coordinates]
            : geometry?.type === "MultiPolygon"
              ? (geometry.coordinates as unknown[])
              : [];
          (polygons as unknown[]).forEach(polygon => {
            (polygon as unknown[]).forEach(ring => {
              if (!Array.isArray(ring) || ring.length < 3) return;
              ring.forEach((point, pointIndex) => {
                if (!Array.isArray(point) || point.length < 2) return;
                const projected = mapRef.current!.latLngToContainerPoint([Number(point[1]), Number(point[0])]);
                const x = projected.x * fadeScaleX;
                const y = projected.y * fadeScaleY;
                if (pointIndex === 0) fadeContext.moveTo(x, y);
                else fadeContext.lineTo(x, y);
              });
              fadeContext.closePath();
            });
          });
        });
        fadeContext.fill("evenodd");
        // html2canvas để lại transform dư trên context của canvas kết quả (dịch theo vị trí
        // phần tử trong document) → drawImage bị lệch, vùng trắng chỉ phủ được một phần khung.
        const outputContext = canvas.getContext("2d");
        if (outputContext) {
          outputContext.save();
          outputContext.setTransform(1, 0, 0, 1, 0, 0);
          outputContext.globalAlpha = 1;
          outputContext.globalCompositeOperation = "source-over";
          outputContext.drawImage(fadeCanvas, 0, 0);
          outputContext.restore();
        }
      }
    }
    // Cắt ảnh chụp về đúng vùng nội dung khi "Chỉ khu vực chọn" làm trắng ngoại vi,
    // giúp khung bản đồ trong composer được lấp đầy thay vì các khoảng trắng lớn quanh vùng chọn.
    const liveBounds = mapRef.current.getBounds();
    let capturedViewportBounds = { north: liveBounds.getNorth(), south: liveBounds.getSouth(), east: liveBounds.getEast(), west: liveBounds.getWest() };
    if (selectedAreaOnly && selectedProvince && currentProvinceGeoJson) {
      const cropFeatures = selectedWardIds.size > 0
        ? currentProvinceGeoJson.features.filter(feature => selectedWardIds.has(String(feature.properties.ma_xa)))
        : currentProvinceGeoJson.features;
      const cropRect = mapContainerRef.current.getBoundingClientRect();
      const cropScaleX = canvas.width / Math.max(1, cropRect.width);
      const cropScaleY = canvas.height / Math.max(1, cropRect.height);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const trackPoint = (lng: number, lat: number) => {
        const p = mapRef.current!.latLngToContainerPoint([lat, lng]);
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      };
      cropFeatures.forEach(feature => walkGeoCoords(feature.geometry, trackPoint));
      if (Number.isFinite(minX) && maxX > minX && maxY > minY) {
        const pad = 18;
        let sx = Math.max(0, Math.floor((minX - pad) * cropScaleX));
        let sy = Math.max(0, Math.floor((minY - pad) * cropScaleY));
        let sw = Math.min(canvas.width, Math.ceil((maxX + pad) * cropScaleX)) - sx;
        let sh = Math.min(canvas.height, Math.ceil((maxY + pad) * cropScaleY)) - sy;
        // Mở rộng khung cắt cho đúng tỉ lệ khung bản đồ trong composer (thêm vùng nền trắng hai bên
        // thay vì để objectFit: cover cắt mất phần đầu/cuối của vùng chọn).
        if (mapFrameAspect && mapFrameAspect > 0 && sw > 0 && sh > 0) {
          const currentAspect = sw / sh;
          const clampX = (value: number, width: number) => Math.max(0, Math.min(value, canvas.width - width));
          const clampY = (value: number, height: number) => Math.max(0, Math.min(value, canvas.height - height));
          if (currentAspect < mapFrameAspect) {
            const wantedW = Math.min(canvas.width, sh * mapFrameAspect);
            sx = clampX(sx + sw / 2 - wantedW / 2, wantedW);
            sw = wantedW;
            if (sw < sh * mapFrameAspect) {
              const wantedH = sw / mapFrameAspect;
              sy = clampY(sy + sh / 2 - wantedH / 2, wantedH);
              sh = wantedH;
            }
          } else if (currentAspect > mapFrameAspect) {
            const wantedH = Math.min(canvas.height, sw / mapFrameAspect);
            sy = clampY(sy + sh / 2 - wantedH / 2, wantedH);
            sh = wantedH;
            if (sh < sw / mapFrameAspect) {
              const wantedW = sh * mapFrameAspect;
              sx = clampX(sx + sw / 2 - wantedW / 2, wantedW);
              sw = wantedW;
            }
          }
          sx = Math.round(sx); sy = Math.round(sy); sw = Math.round(sw); sh = Math.round(sh);
        }
        const coversCanvas = sx <= 2 && sy <= 2 && sw >= canvas.width - 4 && sh >= canvas.height - 4;
        if (sw > 48 && sh > 48 && !coversCanvas) {
          const croppedCanvas = document.createElement("canvas");
          croppedCanvas.width = sw;
          croppedCanvas.height = sh;
          const cropContext = croppedCanvas.getContext("2d");
          if (cropContext) {
            cropContext.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
            canvas = croppedCanvas;
            const topLeft = mapRef.current!.containerPointToLatLng(L.point(sx / cropScaleX, sy / cropScaleY));
            const bottomRight = mapRef.current!.containerPointToLatLng(L.point((sx + sw) / cropScaleX, (sy + sh) / cropScaleY));
            capturedViewportBounds = {
              north: Math.max(topLeft.lat, bottomRight.lat),
              south: Math.min(topLeft.lat, bottomRight.lat),
              east: Math.max(topLeft.lng, bottomRight.lng),
              west: Math.min(topLeft.lng, bottomRight.lng),
            };
          }
        }
      }
    }
    const base64Image = canvas.toDataURL("image/png");
    const mapBounds = mapRef.current.getBounds();
    // Vùng "Chỉ khu vực chọn" — cùng tập xã với mặt nạ trắng đang che ngoại vi trên bản đồ.
    // Ký hiệu ngoài vùng (bị phủ trắng) phải bị loại khỏi chú giải, kể cả khi bbox lọt khung nhìn.
    const regionBBox = selectedRegionBBoxOf(currentProvinceGeoJson, selectedAreaOnly, selectedProvince, selectedWardIds);
    const featureVisible = (feature: any): boolean => {
      const lat = Number(feature?.lat), lng = Number(feature?.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return mapBounds.contains([lat, lng]) && latLngInRegion(lat, lng, regionBBox);
      const bbox = coordsBBox(feature?.coords ?? feature?.geometry);
      return bboxInView(bbox, mapBounds) && bboxInRegion(bbox, regionBBox);
    };
    const annotationVisible = (ann: { coords?: Array<[number, number]> }): boolean => {
      const bbox = annotationBBox(ann.coords);
      return bboxInView(bbox, mapBounds) && bboxInRegion(bbox, regionBBox);
    };
    const isVisibleFeature = featureVisible;
    const legendLayerIds = Array.from(activeLayers).filter(id => {
      if (id === "population_density") return false;
      if (id === "ward_boundaries" || id === "population_density") {
        return !!currentProvinceGeoJson?.features.length || !!allWardsGeoJson?.features.length;
      }
      const features = layersData ? (layersData as any)[id] : null;
      return Array.isArray(features) && features.some(isVisibleFeature);
    });
    // Bản đồ chính luôn vẽ ranh giới cấp tỉnh ở chế độ tỉnh — đưa vào chú giải để ký hiệu nào có trên bản đồ đều được giải thích
    if (viewMode === "province" && !legendLayerIds.includes("province_boundaries")) {
      legendLayerIds.unshift("province_boundaries");
    }
    const composerEthnicComposition = showPieSelector
      ? (ethnicLegendComposition.length > 0 ? ethnicLegendComposition : withOtherEthnic(wardDanToc).map(item => {
          const info = getDanTocInfo(item.dan_toc);
          return {
            label: ethnicLabelOf(item.dan_toc, info?.ten),
            value: item.ty_le,
            color: info?.mau || ETHNIC_COLORS[item.dan_toc] || ETHNIC_OTHER_COLOR,
          };
        }))
      : [];

    // Chú giải composer dựng lại theo đúng chú giải giao diện chính:
    // cùng thứ tự (chuyên môn → nền địa lý), cùng nhóm con và ký hiệu.
    const buildLegendSections = (): ComposerLegendSection[] => {
      const sections: ComposerLegendSection[] = [];
      // 1. Địa giới (phân cấp nét theo chuẩn)
      if (viewMode === "province" || activeLayers.has("ward_boundaries")) {
        const mainId = viewMode === "province" ? "province_boundaries" : "ward_boundaries";
        const mainStyle = getLayerSymbology(mainId);
        const rows: ComposerLegendRow[] = [{
          type: "line",
          label: viewMode === "province" ? "Ranh giới tỉnh" : "Ranh giới xã/phường",
          color: mainStyle.color, lineWeight: mainStyle.lineWeight, lineDash: mainStyle.dashArray,
        }];
        if (viewMode === "province" && activeLayers.has("ward_boundaries")) {
          const wardStyle = getLayerSymbology("ward_boundaries");
          rows.push({ type: "line", label: "Ranh giới xã/phường (4 tỉnh)", color: wardStyle.color, lineWeight: wardStyle.lineWeight, lineDash: wardStyle.dashArray });
        }
        sections.push({ rows });
      }
      // 2. Mật độ dân số (chế độ xem cấp xã)
      if (viewMode === "ward" && densityLegendEntries.length > 0) {
        sections.push({
          title: "Mật độ dân số (người/km²)",
          rows: densityLegendEntries.map(entry => ({
            type: "swatch", label: entry.label, color: entry.color, fillOpacity: entry.fillOpacity,
            dimmed: entry.present === false,
            dimTitle: entry.present === false ? "Chưa có xã nào ở bậc này" : undefined,
          })),
        });
      }
      // 3. Cơ cấu dân tộc
      const ethnicRowsData = ethnicLegendItems.length > 0
        ? ethnicLegendItems
        : ethnicLegendComposition.map(item => ({ label: item.label, color: item.color }));
      if (ethnicRowsData.length > 0) {
        sections.push({ title: "Cơ cấu dân tộc", rows: ethnicRowsData.map(item => ({ type: "swatch", label: item.label, color: item.color })) });
      }
      // 4. Tri thức bản địa rev 12 — 8 lớp L1–L7 (huy hiệu tròn khớp marker bản đồ)
      const knowledgeHasFeatures = (id: string): boolean =>
        activeLayers.has(id) && ((layersData as any)?.[id] || []).some((f: any) => featureVisible(f));
      const knowledgeRows: ComposerLegendRow[] = [];
      knowledgeDefs.forEach(def => {
        if (!knowledgeHasFeatures(def.id)) return;
        if (def.id === "tt_l2") {
          // L2 phân loại theo loại hình thủy lợi (cọn/mương/phai/lịn) khớp marker
          const feats = ((layersData as any)?.tt_l2 || []).filter((f: any) => featureVisible(f));
          let matched = false;
          for (const st of THUY_LOI_SUBTYPES) {
            if (feats.some((f: any) => String(f.linh_vuc || "").includes(st.key))) {
              matched = true;
              knowledgeRows.push({ type: "point", label: st.label, color: def.mau, emoji: st.emoji });
            }
          }
          if (!matched) knowledgeRows.push({ type: "point", label: knowledgeShortLabel(def.ten), color: def.mau, emoji: def.icon });
        } else {
          knowledgeRows.push({ type: "point", label: knowledgeShortLabel(def.ten), color: def.mau, emoji: def.icon });
        }
      });
      if (knowledgeRows.length) sections.push({ title: "Tri thức bản địa (L1–L7)", rows: knowledgeRows });
      // 5. Nhóm Nước: sông suối (nền)
      const waterRows: ComposerLegendRow[] = [];
      if (activeLayers.has("rivers") && ((layersData as any)?.rivers || []).some((r: any) => featureVisible(r))) {
        waterRows.push({ type: "river", label: "Hệ thống sông suối", osm: true });
      }
      if (waterRows.length) sections.push({ title: "Tài nguyên nước", rows: waterRows });
      // 6. Nhóm Rừng: phân vùng rừng + cây thuốc
      const forestSectionRows: ComposerLegendRow[] = [];
      if (activeLayers.has("forests")) {
        (["vqg", "kbttn", "kbvcq", "rung_dac_dung"] as const)
          .filter(k => ((layersData as any)?.forests || []).some((f: any) => f.loai === k && featureVisible(f)))
          .forEach(k => forestSectionRows.push({ type: "forest", label: FOREST_LABELS[k], color: FOREST_COLORS[k] }));
      }
      if (activeLayers.has("medicinal_plants") && ((layersData as any)?.medicinal_plants || []).some((m: any) => featureVisible(m))) {
        forestSectionRows.push({ type: "forest", label: "Cây thuốc quý", color: "#e63946" });
      }
      if (forestSectionRows.length) sections.push({ title: "Tài nguyên rừng", rows: forestSectionRows });
      // 7. Các lớp tùy chỉnh của người dùng (cùng điều kiện hiển thị như bản đồ chính)
      customLayers.filter(layer => activeLayers.has(layer.id) && ((layersData as any)?.[layer.id] || []).some((f: any) => featureVisible(f))).forEach(layer => {
        sections.push({ rows: [{ type: "custom", label: layer.ten, color: layer.mau, bieu_tuong: layer.bieu_tuong }] });
      });
      // 8. Đối tượng vẽ tay (toạ độ [lat, lng] — đã đổi khi tính bbox)
      if (annotations.some(ann => annotationVisible(ann))) sections.push({ rows: [{ type: "swatch", label: "Đối tượng của tôi", color: "#e9c46a" }] });
      return sections;
    };
    const legendSections = buildLegendSections();

    setComposerSnapshot({
      activeLayers: new Set(activeLayers),
      legendLayerIds,
      layersData,
      selectedProvince,
      selectedWard,
      mapCenter: {
        lat: mapRef.current.getCenter().lat,
        lng: mapRef.current.getCenter().lng,
        zoom: mapRef.current.getZoom(),
      },
      viewportBounds: {
        north: capturedViewportBounds.north,
        south: capturedViewportBounds.south,
        east: capturedViewportBounds.east,
        west: capturedViewportBounds.west,
      },
      annotations,
      layerDisplayAll,
      densityLegend: densityLegendEntries.map(entry => ({ label: entry.label, color: entry.color, fillOpacity: entry.fillOpacity, present: entry.present })),
      ethnicComposition: composerEthnicComposition,
      ethnicLegend: ethnicLegendItems,
      legendSections,
      selectedAreaOnly,
      selectedAreaFade,
      capturedAt: Date.now(),
      image: base64Image,
    });
  } catch (error) {
    console.error("Lỗi khi chụp bản đồ:", error);
    alert("Không thể chụp bản đồ. Hãy thử lại.");
  }

  setSyncPending(false);
  // Nếu trong lúc chụp có thay đổi khác (deps đổi) thì chụp lại để snapshot không bị cũ
  if (syncQueuedRef.current) {
    syncQueuedRef.current = false;
    void syncToComposer();
  }
};

  useEffect(() => {
    if (!showMapComposer) { syncQueuedRef.current = false; return; }
    if (syncPending) { syncQueuedRef.current = true; return; }
    void syncToComposer();
  }, [showMapComposer, activeLayers, activeRaster, selectedProvince, selectedWard?.ma_xa, selectedWardIds, selectedAreaOnly, selectedAreaFade, currentProvinceGeoJson, allWardsGeoJson, layerSymbologies, wardOverrides, layersData, phuYenLayers, annotations, rasterOpacity, pieWardSelection, showPieSelector, customLayers, ethnicOverrides, wardLabelConfig, mapFrameAspect, mapMoveTick]);

  /* ─── Toggle layer ─── */
  const toggleLayer = (id:string) => {
    const thematicSource = thematicSourceOf(id);
    if (thematicSource || THEMATIC_KEYS.includes(id as (typeof THEMATIC_KEYS)[number])) {
      setActiveRaster(prev => prev === thematicSource ? null : thematicSource);
      return;
    }
    if(id==="ward_boundaries") wardBoundaryAutoOnRef.current=false;
    setActiveLayers(prev=>{
      const next=new Set(prev);
      if (next.has(id)) { next.delete(id); if (editingLayer === id) setEditingLayer(null); if (layerDragMode === id) setLayerDragMode(null); } 
      else { next.add(id); }
      return next;
    });
  };

  const openLayerEditor = (layerId: string) => {
    if (!activeLayers.has(layerId)) { setActiveLayers(prev => new Set([...prev, layerId])); }
    setEditingLayer(layerId);
    setShowLayers(false);
  };

  const openSymbologyEditor = (layerId: string) => {
    setEditingSymbologyLayer(layerId);
    setShowLayers(false);
  };

  const saveLayerSymbology = (layerId: string, value: LayerSymbologyConfig) => {
    setLayerSymbologies(prev => ({ ...prev, [layerId]: value }));
  };

  /* ─── Map initialization ─── */
  const addProvincesLayer = (map:L.Map, data:GeoJsonData) => {
    if(provincesLayerRef.current)map.removeLayer(provincesLayerRef.current);
    const provinceStyle = getLayerSymbology("province_boundaries");
    const layer = L.geoJSON(data as GeoJSON.FeatureCollection, {
style:()=>({
  color:provinceStyle.color,
  weight:provinceStyle.lineWeight,
  opacity:provinceStyle.opacity,
  fillColor:provinceStyle.fillColor,
  fillOpacity:selectedAreaOnly && selectedProvince ? 0 : provinceStyle.fillOpacity,
  dashArray:getZoomAwareDashArray(provinceStyle.dashArray, map.getZoom()),
}),
      onEachFeature:(feat,lyr)=>{
        const p=feat.properties as {ten_tinh:string};
        (lyr as L.Path).on({
          mouseover:e=>{
            if (selectedAreaOnlyRef.current && selectedProvince && p.ten_tinh !== selectedProvince) return;
            (e.target as L.Path).setStyle({fillOpacity:Math.min(0.36, provinceStyle.fillOpacity + 0.12),color:"#1d4d2d",weight:provinceStyle.lineWeight + 0.8});
            (e.target as L.Path).bringToFront();
          },
          mouseout:e=>{
            if (selectedAreaOnlyRef.current && selectedProvince && p.ten_tinh !== selectedProvince) return;
            (e.target as L.Path).setStyle({fillOpacity:provinceStyle.fillOpacity,color:provinceStyle.color,weight:provinceStyle.lineWeight,dashArray:provinceStyle.dashArray});
          },
          click:()=>handleProvinceClick(p.ten_tinh)
        });
        lyr.bindTooltip(`<strong>${p.ten_tinh}</strong>`,{sticky:true,className:"custom-tooltip"});
      },
    });
    layer.addTo(map); provincesLayerRef.current=layer;
  };

  const initMap = useCallback(async () => {
    if(!mapContainerRef.current||mapRef.current)return;
    const map=L.map(mapContainerRef.current,{center:[21.7,103.5],zoom:7,zoomControl:false,doubleClickZoom:false,zoomSnap:0,zoomDelta:0.1,wheelPxPerZoomLevel:120});
    L.control.zoom({position:"topright"}).addTo(map);
    const osmAttribution = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';
    const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: osmAttribution, maxZoom: 19, zIndex: 1 });
    const lightFallbackLayer = L.tileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", { attribution: osmAttribution, maxZoom: 19, zIndex: 1 });
    const satLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: 'Tiles © Esri' });
    const satLabels = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, opacity: 0.9, attribution: 'Labels © Esri' });
    const hybridLayer = L.layerGroup([satLayer, satLabels]);
    const cloudlessLayer = L.tileLayer("https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2019_3857/default/g/{z}/{y}/{x}.jpg", {
      maxZoom: 19,
      maxNativeZoom: 14,
      attribution: 'Sentinel-2 cloudless © EOX IT Services GmbH · Contains modified Copernicus Sentinel data (2019)',
    });
    const topoLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { maxZoom: 17 });
    let fallbackAdded = false;
    osmLayer.on("tileerror", () => {
      if (fallbackAdded || !map.hasLayer(osmLayer)) return;
      fallbackAdded = true;
      map.removeLayer(osmLayer);
      lightFallbackLayer.addTo(map);
    });
    osmLayer.addTo(map);
    L.control.layers({ "Bản đồ thường": osmLayer, "Vệ tinh không mây (Sentinel-2)": cloudlessLayer, "Vệ tinh (Esri)": hybridLayer, "Địa hình": topoLayer }, undefined, { position: "topright", collapsed: true }).addTo(map);
    const og=L.layerGroup().addTo(map); const ag=L.layerGroup().addTo(map);
    overlayGroupRef.current=og; annotationGroupRef.current=ag; mapRef.current=map;
    setMapReady(true); // effect vẽ chú thích chạy lại để vẽ bản đã khôi phục
    map.on("zoomend", () => {
      refreshBoundaryStyles();
      setMapScale(scaleFromZoom(map.getCenter().lat, map.getZoom()));
    });
    // Chú giải theo khung nhìn: báo (debounce) mỗi lần pan/zoom để chú giải chính dựng lại
    // — chạy mọi lúc, không chỉ khi mở composer, vì chú giải chính cũng phải khớp vùng đang xem.
    let legendMoveTimer = 0;
    const queueLegendRebuild = () => {
      window.clearTimeout(legendMoveTimer);
      legendMoveTimer = window.setTimeout(() => setMapMoveTick(v => v + 1), 450);
    };
    map.on("moveend zoomend", queueLegendRebuild);
    setMapMoveTick(v => v + 1); // đợt đầu: map đã sẵn sàng → chú giải tính ngay các loại trong khung nhìn
    let lastCoordsUpdate = 0;
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      const now = Date.now();
      if (now - lastCoordsUpdate < 120) return;
      lastCoordsUpdate = now;
      setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    map.on("mouseout", () => setMouseCoords(null));
    try {
      const data=await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(map,data);
      const b=L.geoJSON(data as GeoJSON.FeatureCollection).getBounds();
      if(b.isValid())map.fitBounds(b,{padding:[40,40],maxZoom:9});
      setMapScale(scaleFromZoom(map.getCenter().lat, map.getZoom()));
    } catch(e){console.error(e);}
  }, []);

  const handleProvinceClick = async (name:string) => {
    if(!mapRef.current)return;
    setLoading(true);setSelectedProvince(name);setSelectedWard(null);setInfoPanelWard(null);setSelectedWardIds(new Set());setSelectedDanToc(null);
    // Vào xem xã: tự bật lớp ranh giới để bản đồ luôn có ranh giới (đồng bộ với badge/chú giải)
    if(!activeLayers.has("ward_boundaries")){
      setActiveLayers(prev=>prev.has("ward_boundaries")?prev:new Set([...prev,"ward_boundaries"]));
      wardBoundaryAutoOnRef.current=true;
    }
    try {
      const data=await fetchGeoJson(PROVINCE_FILES[name]);
      const wardStyle = getLayerSymbology("ward_boundaries");
      setCurrentProvinceGeoJson(data);
      provinceMaskGeomRef.current = data as unknown as GeoJSON.FeatureCollection;
      maskedRasterCacheRef.current.clear();
      allWardsRef.current=data.features.map(f=>f.properties as unknown as WardProperties);
      if(wardsLayerRef.current){mapRef.current.removeLayer(wardsLayerRef.current);wardsLayerRef.current=null;}
      const wl=L.geoJSON(data as GeoJSON.FeatureCollection,{
        style:(feat)=>{
  const p=feat!.properties as unknown as WardProperties;
  return getWardMapStyle(p, wardStyle);
},
onEachFeature:(feat,lyr)=>{
  const p=feat.properties as unknown as WardProperties;
  (lyr as L.Path).on({
    mouseover:e=>{
      if(!wardBoundaryOnRef.current)return;
      const cur=getWardMapStyle(p, wardStyle);
      (e.target as L.Path).setStyle({...cur, fillOpacity:Math.min(0.6, cur.fillOpacity + 0.26), weight: cur.weight + 0.8});
      (e.target as L.Path).bringToFront();
    },
    mouseout:e=>{
      if(!wardBoundaryOnRef.current)return;
      (e.target as L.Path).setStyle(getWardMapStyle(p, wardStyle));
    },
    click:(event: L.LeafletMouseEvent)=>{
      const additive = event.originalEvent.shiftKey || event.originalEvent.ctrlKey || event.originalEvent.metaKey;
      setSelectedWardIds(prev => {
        if (!additive) return new Set([p.ma_xa]);
        const next = new Set(prev);
        if (next.has(p.ma_xa)) next.delete(p.ma_xa); else next.add(p.ma_xa);
        return next;
      });
      setSelectedWard(p);setInfoPanelWard(null);setSelectedDanToc(null);setActiveTriThuc(0);setEditingEthnicPct(null);
      provinceMaskGeomRef.current = { type: "FeatureCollection", features: [feat] } as unknown as GeoJSON.FeatureCollection;
      maskedRasterCacheRef.current.clear();
      const bounds = (lyr as L.GeoJSON).getBounds();
      if (bounds.isValid()) mapRef.current?.fitBounds(bounds, { padding: [70, 70], maxZoom: 14, duration: 0.8 });
    }
  });
  lyr.bindTooltip(wardTooltipHtml(p),{sticky:true,className:"custom-tooltip ward-tip"});
},
      });
      wl.addTo(mapRef.current);wardsLayerRef.current=wl;
      refreshBoundaryStyles();
      const b=wl.getBounds();if(b.isValid())mapRef.current.fitBounds(b,{padding:[40,40],maxZoom:11});
      setViewMode("ward");
    } catch(e){console.error(e);} finally{setLoading(false);}
  };

  const handleBack = async () => {
    if(!mapRef.current)return; setLoading(true);
    if(wardsLayerRef.current){mapRef.current.removeLayer(wardsLayerRef.current);wardsLayerRef.current=null;}
    // Nếu lớp ranh giới chỉ được tự bật khi vào xem xã thì tắt lại khi quay về,
    // giữ nguyên nếu người dùng đã tự bật/tắt lớp này.
    if(wardBoundaryAutoOnRef.current){
      wardBoundaryAutoOnRef.current=false;
      setActiveLayers(prev=>{if(!prev.has("ward_boundaries"))return prev;const n=new Set(prev);n.delete("ward_boundaries");return n;});
    }
    setSelectedProvince(null);setSelectedWard(null);setInfoPanelWard(null);setSelectedWardIds(new Set());setSelectedDanToc(null);setViewMode("province");allWardsRef.current=[];setCurrentProvinceGeoJson(null);setPieWardSelection(new Set());
    try {
      const data=await fetchGeoJson("/data/tinh.geojson");
      provinceMaskGeomRef.current = data as unknown as GeoJSON.FeatureCollection;
      maskedRasterCacheRef.current.clear();
      addProvincesLayer(mapRef.current,data);
      const b=L.geoJSON(data as GeoJSON.FeatureCollection).getBounds();
      if(b.isValid())mapRef.current.flyToBounds(b,{padding:[40,40],maxZoom:9,duration:1.5});
    } catch(e){console.error(e);} finally{setLoading(false);}
  };

  const selectWardFromInfoPanel = (maXa: string) => {
    if (!currentProvinceGeoJson || !maXa) return;
    const feature = currentProvinceGeoJson.features.find(item => String(item.properties?.ma_xa || "") === maXa);
    if (!feature) return;
    const props = feature.properties as unknown as WardProperties;
    setInfoPanelWard(props);
    setSelectedDanToc(null);
    setActiveTriThuc(0);
    setEditingEthnicPct(null);
  };

  useEffect(()=>{initMap();return()=>{if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};},[initMap]);

  useEffect(() => {
  wardBoundaryOnRef.current = activeLayers.has("ward_boundaries");
  refreshBoundaryStyles();
  }, [layerSymbologies, wardOverrides, selectedProvince, selectedWard, selectedWardIds, selectedAreaOnly, activeLayers, showPieSelector, pieWardSelection, danTocData, ethnicOverrides]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedAreaMaskRef.current) {
      selectedAreaMaskRef.current.remove();
      selectedAreaMaskRef.current = null;
    }
    if (!selectedAreaOnly || !selectedProvince || !currentProvinceGeoJson) return;

    const selectedFeatures = selectedWardIds.size > 0
      ? currentProvinceGeoJson.features.filter(feature => selectedWardIds.has(String(feature.properties.ma_xa)))
      : currentProvinceGeoJson.features;
    const rings: [number, number][][] = [];
    const toLngLatRing = (value: unknown): [number, number][] => {
      if (!Array.isArray(value)) return [];
      return value.flatMap(point => {
        if (!Array.isArray(point) || point.length < 2) return [];
        const lng = Number(point[0]);
        const lat = Number(point[1]);
        return Number.isFinite(lat) && Number.isFinite(lng) ? [[lng, lat] as [number, number]] : [];
      });
    };
    selectedFeatures.forEach(feature => {
      const geometry = feature.geometry as { type?: string; coordinates?: unknown } | null;
      if (!geometry?.coordinates) return;
      if (geometry.type === "Polygon") {
        (geometry.coordinates as unknown[]).forEach(rawRing => {
          const ring = toLngLatRing(rawRing);
          if (ring.length >= 3) rings.push(ring);
        });
      } else if (geometry.type === "MultiPolygon") {
        (geometry.coordinates as unknown[]).forEach(polygon => {
          (polygon as unknown[]).forEach(rawRing => {
            const ring = toLngLatRing(rawRing);
            if (ring.length >= 3) rings.push(ring);
          });
        });
      }
    });
    if (rings.length === 0) return;

    const mapPane = map.getPane("mapPane") || map.getContainer().parentElement || map.getContainer();
    const mask = document.createElement("div");
    mask.className = "selected-area-mask";
    mask.style.cssText = "position:absolute;left:0;top:0;z-index:660;pointer-events:none;overflow:hidden";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.display = "block";
    const maskId = `selected-area-mask-${Date.now()}`;
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const svgMask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    svgMask.setAttribute("id", maskId);
    svgMask.setAttribute("maskUnits", "userSpaceOnUse");
    svgMask.setAttribute("maskContentUnits", "userSpaceOnUse");
    svgMask.setAttribute("x", "0");
    svgMask.setAttribute("y", "0");
    svgMask.setAttribute("width", "100%");
    svgMask.setAttribute("height", "100%");
    svgMask.style.maskType = "luminance";
    const maskBase = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    maskBase.setAttribute("x", "0");
    maskBase.setAttribute("y", "0");
    maskBase.setAttribute("width", "100%");
    maskBase.setAttribute("height", "100%");
    maskBase.setAttribute("fill", "#fff");
    maskBase.setAttribute("fill-opacity", String(Math.max(0, Math.min(1, selectedAreaFade))));
    const selectedPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    selectedPath.setAttribute("fill", "#000");
    selectedPath.setAttribute("fill-rule", "evenodd");
    svgMask.appendChild(maskBase);
    svgMask.appendChild(selectedPath);
    defs.appendChild(svgMask);
    svg.appendChild(defs);
    const whiteOverlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    whiteOverlay.setAttribute("x", "0");
    whiteOverlay.setAttribute("y", "0");
    whiteOverlay.setAttribute("width", "100%");
    whiteOverlay.setAttribute("height", "100%");
    whiteOverlay.setAttribute("fill", "#fff");
    whiteOverlay.setAttribute("mask", `url(#${maskId})`);
    svg.appendChild(whiteOverlay);
    mask.appendChild(svg);
    mapPane.appendChild(mask);
    selectedAreaMaskRef.current = mask;

    const updateMask = () => {
      const contRect = map.getContainer().getBoundingClientRect();
      const paneRect = mapPane.getBoundingClientRect();
      const width = Math.max(1, Math.round(contRect.width));
      const height = Math.max(1, Math.round(contRect.height));
      mask.style.left = `${Math.round(contRect.left - paneRect.left)}px`;
      mask.style.top = `${Math.round(contRect.top - paneRect.top)}px`;
      mask.style.width = `${width}px`;
      mask.style.height = `${height}px`;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svgMask.setAttribute("width", String(width));
      svgMask.setAttribute("height", String(height));
      selectedPath.setAttribute("d", rings.map(ring => {
        const points = ring.map(([lng, lat]) => {
          const point = map.latLngToContainerPoint([lat, lng]);
          return `${point.x} ${point.y}`;
        });
        return `M ${points.join(" L ")} Z`;
      }).join(" "));
    };
    updateMask();
    map.on("move zoom resize moveend zoomend", updateMask);
    // Theo dõi kích thước khung map: khi panel/thanh bên đổi cỡ (transition) mà không có
    // sự kiện move/resize của Leaflet thì hộp mask cũ khiến vùng trắng lệch ranh giới
    // (nội dung ở rìa bản đồ, ví dụ Mường Chiêng/Sốp Cộp bị "cắt" mất).
    let maskRaf = 0;
    const maskResizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
      window.cancelAnimationFrame(maskRaf);
      maskRaf = window.requestAnimationFrame(() => updateMask());
    }) : null;
    maskResizeObserver?.observe(map.getContainer());
    return () => {
      map.off("move zoom resize moveend zoomend", updateMask);
      window.cancelAnimationFrame(maskRaf);
      try { maskResizeObserver?.disconnect(); } catch { /* bỏ qua */ }
      if (selectedAreaMaskRef.current) selectedAreaMaskRef.current.remove();
      selectedAreaMaskRef.current = null;
    };
  }, [selectedAreaOnly, selectedAreaFade, selectedProvince, selectedWardIds, currentProvinceGeoJson]);

  /* Thematic raster overlay management — clip raster to province polygons */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !rasterMeta) return;
    if (rasterOverlayRef.current) { map.removeLayer(rasterOverlayRef.current); rasterOverlayRef.current = null; }
    if (!activeRaster || !rasterMeta.layers[activeRaster]) return;

    let cancelled = false;
    const info = rasterMeta.layers[activeRaster];
    const rawUrl = `${BASE_PATH}/data/raster/${info.file}`;
    const cached = maskedRasterCacheRef.current.get(activeRaster);

    const addOverlay = (url: string) => {
      if (cancelled || !mapRef.current) return;
      const ov = L.imageOverlay(url, rasterMeta.bounds, { opacity: rasterOpacity, interactive: false, className: `thematic-raster thematic-raster-${activeRaster}` });
      ov.addTo(mapRef.current);
      rasterOverlayRef.current = ov;
    };

    if (cached) { addOverlay(cached); return () => { cancelled = true; }; }

    const provinces = provinceMaskGeomRef.current;
    if (!provinces) { addOverlay(rawUrl); return () => { cancelled = true; }; }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth, h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { addOverlay(rawUrl); return; }
      ctx.drawImage(img, 0, 0);

      const [[latS, lngW], [latN, lngE]] = rasterMeta.bounds;
      const lon2x = (lng: number) => ((lng - lngW) / (lngE - lngW)) * w;
      const lat2y = (lat: number) => ((latN - lat) / (latN - latS)) * h;

      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      const drawRing = (ring: number[][]) => {
        if (ring.length === 0) return;
        ctx.moveTo(lon2x(ring[0][0]), lat2y(ring[0][1]));
        for (let i = 1; i < ring.length; i++) ctx.lineTo(lon2x(ring[i][0]), lat2y(ring[i][1]));
        ctx.closePath();
      };
      for (const f of provinces.features) {
        const g = f.geometry;
        if (!g) continue;
        if (g.type === "Polygon") (g.coordinates as number[][][]).forEach(drawRing);
        else if (g.type === "MultiPolygon") (g.coordinates as number[][][][]).forEach(poly => poly.forEach(drawRing));
      }
      ctx.fill("evenodd");

      const dataUrl = canvas.toDataURL("image/png");
      maskedRasterCacheRef.current.set(activeRaster, dataUrl);
      addOverlay(dataUrl);
    };
    img.onerror = () => { if (!cancelled) addOverlay(rawUrl); };
    img.src = rawUrl;

    return () => { cancelled = true; };
  }, [activeRaster, rasterMeta, rasterOpacity, selectedProvince, selectedWard?.ma_xa, selectedAreaOnly]);

  /* ─── Derived ─── */
  const wardDanToc:DanTocTyLe[]=selectedWard?(wardOverrides.get(selectedWard.ma_xa)?.dan_toc??selectedWard.dan_toc??[]):[];
  const panelWard = infoPanelWard ?? selectedWard;
  const panelWardDanToc:DanTocTyLe[]=panelWard?(wardOverrides.get(panelWard.ma_xa)?.dan_toc??panelWard.dan_toc??[]):[];
  const ethnicLegendComposition = useMemo(() => {
    if (!showPieSelector || pieWardSelection.size === 0 || viewMode !== "ward") return [];
    const totals = new Map<string, number>();
    const addComposition = (composition: DanTocTyLe[], weight: number) => {
      let listed = 0;
      composition.forEach(item => {
        if (item.ty_le > 0) {
          totals.set(item.dan_toc, (totals.get(item.dan_toc) || 0) + item.ty_le * weight);
          listed += item.ty_le;
        }
      });
      // Các dân tộc không được nêu % riêng = phần còn lại để tổng đủ 100%
      const rest = Math.round((100 - listed) * 100) / 100;
      if (rest > 0.01) totals.set(ETHNIC_OTHER_ID, (totals.get(ETHNIC_OTHER_ID) || 0) + rest * weight);
    };

    if (selectedWard) {
      addComposition(wardDanToc, 1);
    } else if (selectedProvince && currentProvinceGeoJson) {
      const features = currentProvinceGeoJson.features.filter(feature => {
        const props = feature.properties as unknown as WardProperties;
        return !props.ten_tinh || props.ten_tinh === selectedProvince;
      });
      const weights = features.map(feature => Number((feature.properties as unknown as WardProperties).dan_so) || 0);
      const totalPopulation = weights.reduce((sum, value) => sum + value, 0);
      features.forEach((feature, index) => {
        const props = feature.properties as unknown as WardProperties;
        const composition = wardOverrides.get(props.ma_xa)?.dan_toc ?? props.dan_toc ?? [];
        addComposition(composition, totalPopulation > 0 ? weights[index] / totalPopulation : 1 / Math.max(features.length, 1));
      });
    }

    const total = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
    if (total <= 0) return [];
    return Array.from(totals.entries())
      .map(([id, value]) => {
        const info = getDanTocInfo(id);
        return {
          label: ethnicLabelOf(id, info?.ten),
          value: Math.round((value / total) * 10000) / 100,
          color: info?.mau || ETHNIC_COLORS[id] || ETHNIC_OTHER_COLOR,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [showPieSelector, pieWardSelection, viewMode, selectedWard, selectedProvince, currentProvinceGeoJson, wardDanToc, wardOverrides, ethnicOverrides, danTocData]);
  /** Tổng hợp cơ cấu dân tộc của xã đang chọn (hoặc cả tỉnh nếu chưa chọn xã) — trọng số theo dân số. */
  const ethnicTotals = useMemo(() => {
    if (!selectedProvince) return null;
    const totals = new Map<string, number>();
    const add = (items: DanTocTyLe[], weight = 1) => {
      const listed = items.reduce((sum, item) => sum + Math.max(0, Number(item.ty_le) || 0), 0);
      items.forEach(item => {
        if (item.ty_le > 0) totals.set(item.dan_toc, (totals.get(item.dan_toc) || 0) + item.ty_le * weight);
      });
      if (listed < 100) totals.set(ETHNIC_OTHER_ID, (totals.get(ETHNIC_OTHER_ID) || 0) + (100 - listed) * weight);
    };
    if (panelWard) add(panelWardDanToc);
    else if (currentProvinceGeoJson) {
      const features = currentProvinceGeoJson.features;
      const population = features.reduce((sum, feature) => sum + (Number((feature.properties as unknown as WardProperties).dan_so) || 0), 0);
      features.forEach(feature => {
        const props = feature.properties as unknown as WardProperties;
        add(wardOverrides.get(props.ma_xa)?.dan_toc ?? props.dan_toc ?? [], population ? (Number(props.dan_so) || 0) / population : 1 / Math.max(features.length, 1));
      });
    }
    return totals;
  }, [selectedProvince, panelWard, panelWardDanToc, currentProvinceGeoJson, wardOverrides]);
  /** Biểu đồ 4 cột: Thái · Mông · Mường · Dân tộc khác */
  const ethnicPanelBars = useMemo(() => {
    if (!ethnicTotals) return [];
    const groups = [
      { id: "thai", label: "Thái", full: "Thái", color: ethnicDisplayColor("thai", getDanTocInfo("thai")?.mau) },
      { id: "mong", label: "Mông", full: "Mông", color: ethnicDisplayColor("mong", getDanTocInfo("mong")?.mau) },
      { id: "muong", label: "Mường", full: "Mường", color: ethnicDisplayColor("muong", getDanTocInfo("muong")?.mau) },
      { id: ETHNIC_OTHER_ID, label: "Khác", full: ETHNIC_OTHER_LABEL, color: ETHNIC_OTHER_COLOR },
    ];
    const values = groups.map(group => ({
      ...group,
      value: group.id === ETHNIC_OTHER_ID
        ? Array.from(ethnicTotals.entries()).filter(([id]) => !["thai", "mong", "muong"].includes(id)).reduce((sum, [, amount]) => sum + amount, 0)
        : ethnicTotals.get(group.id) || 0,
    }));
    const total = values.reduce((sum, item) => sum + item.value, 0);
    return total ? values.map(item => ({ ...item, value: Math.round(item.value / total * 1000) / 10 })) : [];
  }, [ethnicTotals, danTocData, ethnicOverrides]);
  /** Tên đầy đủ từng dân tộc có mặt + tỷ lệ — bấm để mở trang chi tiết dân tộc. */
  const ethnicPanelNames = useMemo(() => {
    if (!ethnicTotals) return [];
    const entries = Array.from(ethnicTotals.entries()).filter(([, value]) => value > 0);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    if (!total) return [];
    return entries
      .map(([id, value]) => {
        const info = getDanTocInfo(id);
        return {
          id,
          ten: ethnicLabelOf(id, info?.ten),
          color: info?.mau || ETHNIC_COLORS[id] || ETHNIC_OTHER_COLOR,
          value: Math.round(value / total * 1000) / 10,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [ethnicTotals, danTocData, ethnicOverrides]);
  const ethnicLegendItems = useMemo(() => {
    if (!showPieSelector || pieWardSelection.size === 0 || viewMode !== "ward" || !currentProvinceGeoJson) return [];
    const ids = new Set<string>();
    let hasOther = false;
    currentProvinceGeoJson.features.forEach(feature => {
      const props = feature.properties as unknown as WardProperties;
      if (!pieWardSelection.has(props.ma_xa)) return;
      const composition = wardOverrides.get(props.ma_xa)?.dan_toc ?? props.dan_toc ?? [];
      const listed = composition.reduce((sum, item) => sum + (Number(item.ty_le) > 0 ? Number(item.ty_le) : 0), 0);
      if (listed < 99.99) hasOther = true;
      composition.filter(item => item.ty_le > 0).forEach(item => ids.add(item.dan_toc));
    });
    if (hasOther) ids.add(ETHNIC_OTHER_ID);
    return Array.from(ids).map(id => {
      const info = getDanTocInfo(id);
      return { label: ethnicLabelOf(id, info?.ten), color: info?.mau || ETHNIC_COLORS[id] || ETHNIC_OTHER_COLOR };
    });
  }, [showPieSelector, pieWardSelection, viewMode, currentProvinceGeoJson, wardOverrides, ethnicOverrides, danTocData]);
  const densityLegendEntries = useMemo(() => {
    if (activeRaster || !activeLayers.has("population_density") || !selectedProvince || !currentProvinceGeoJson) return [];
    const densityStyle = getLayerSymbology("population_density");
    const classes = densityStyle.classes?.length ? densityStyle.classes : DENSITY_LABELS.map((label, index) => ({ label, color: DENSITY_COLORS[index] }));
    const upperBounds = classes.slice(0, -1).map(entry => {
      const match = entry.label.replace(/,/g, ".").match(/(?:<|–|−|-|to)\s*(\d+(?:\.\d+)?)/);
      return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
    });
    const features = selectedWard
      ? currentProvinceGeoJson.features.filter(feature => String(feature.properties.ma_xa) === selectedWard.ma_xa)
      : currentProvinceGeoJson.features;
    const present = new Set<number>();
    features.forEach(feature => {
      const value = getDensityValue(feature.properties as unknown as WardProperties);
      const index = upperBounds.findIndex(bound => value < bound);
      present.add(index < 0 ? classes.length - 1 : index);
    });
    // Hiển thị ĐỦ các bậc; bậc chưa có xã nào rơi vào sẽ bị mờ để chú giải luôn liên tục
    return classes.map((entry, index) => ({ ...entry, fillOpacity: densityStyle.fillOpacity, present: present.has(index) }));
  }, [activeRaster, activeLayers, selectedProvince, currentProvinceGeoJson, selectedWard, wardOverrides, layerSymbologies]);
  // Ký hiệu con trong chú giải (nhóm rừng, nhóm thủy lợi) chỉ hiện loại thật sự nằm trong
  // khung nhìn hiện tại — ví dụ zoom tới Sơn La chỉ còn "Khu bảo tồn thiên nhiên".
  // Cập nhật khi pan/zoom (mapMoveTick debounce 450ms) hoặc khi đổi dữ liệu lớp.
  // Khi bật "Chỉ khu vực chọn" phải giao thêm với vùng chọn: khung nhìn sau fitBounds có padding
  // vẫn lọt mép tỉnh bên cạnh (VD kbvcq Mường Phăng) nhưng mặt nạ trắng đã che nó đi.
  const legendRegionBBox = useMemo<GeoBBox | null>(
    () => selectedRegionBBoxOf(currentProvinceGeoJson, selectedAreaOnly, selectedProvince, selectedWardIds),
    [selectedAreaOnly, selectedProvince, currentProvinceGeoJson, selectedWardIds],
  );
  const legendInViewKinds = useMemo(() => {
    const map = mapRef.current;
    if (!map) return null;
    const bounds = map.getBounds();
    const region = legendRegionBBox;
    const forests = new Set<string>();
    (layersData?.forests || []).forEach(f => { const bb = coordsBBox(f.coords); if (bboxInView(bb, bounds) && bboxInRegion(bb, region)) forests.add(String(f.loai)); });
    return { forests, bounds, region };
  }, [layersData, mapMoveTick, legendRegionBBox]);
  // Lớp đơn dòng trong chú giải (VAC, cây thuốc, sông, lớp tùy chỉnh): chỉ hiện khi có đối tượng
  // thật sự nằm trên bản đồ (trong khung nhìn và — khi bật mặt nạ — trong vùng chọn).
  const legendFeatureVisible = (feature: unknown): boolean => {
    const k = legendInViewKinds;
    if (!k) return true; // map chưa sẵn sàng — giữ theo bật/tắt, sẽ tự chốt khi map lên
    const anyFeature = feature as { lat?: unknown; lng?: unknown; coords?: unknown; geometry?: unknown } | null | undefined;
    const lat = Number(anyFeature?.lat), lng = Number(anyFeature?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return pointInView(lat, lng, k.bounds) && latLngInRegion(lat, lng, k.region);
    const bbox = coordsBBox(anyFeature?.coords ?? anyFeature?.geometry);
    return bboxInView(bbox, k.bounds) && bboxInRegion(bbox, k.region);
  };
  const legendLayerHasFeature = (id: string): boolean => {
    if (!activeLayers.has(id)) return false;
    if (!legendInViewKinds) return true;
    const features = (layersData as any)?.[id];
    return Array.isArray(features) && features.some(legendFeatureVisible);
  };
  const legendAnnotationsVisible = (): boolean => {
    if (!annotations.length) return false;
    if (!legendInViewKinds) return true;
    return annotations.some(ann => {
      const bbox = annotationBBox(ann.coords);
      return bboxInView(bbox, legendInViewKinds.bounds) && bboxInRegion(bbox, legendInViewKinds.region);
    });
  };
  const wardPdfs=panelWard?(pdfFiles.get(panelWard.ma_xa)||[]):[];
  const stats=selectedProvince?getProvinceStat(selectedProvince):null;
  const layerCategoriesWithState = layerCategories
    // Nhóm "Bản đồ chuyên đề" được render riêng (thematicCategory) — không nhân đôi.
    .filter(cat => cat.id !== "__thematic__")
    .map(cat => ({
  ...cat,
  layers: [
    ...cat.layers.map(l => ({
      ...l,
      active: l.isThematic ? activeRaster === (l.thematicSource || l.id) : activeLayers.has(l.id),
      isCustom: false,
      isThematic: l.isThematic,
      isThematicCopy: l.isThematicCopy || (l.isThematic && l.id.startsWith("custom_")),
    })),
    ...customLayers.filter(c => c.categoryId === cat.id).map(c => ({
      id: c.id, ten: c.ten, mau: c.mau, bieu_tuong: c.bieu_tuong, active: activeLayers.has(c.id), isCustom: true
    }))
  ]
}));
  const customLayerIds = customLayers.map(c => c.id);
  // "Bản đồ chuyên đề" = raster ảo (chưa cất) + các lớp người dùng đã kéo vào nhóm này.
  const storedThematicCat = layerCategories.find(cat => cat.id === "__thematic__");
  const thematicCategory: LayerCategory | null = rasterMeta || storedThematicCat ? {
    id: "__thematic__",
    ten: storedThematicCat?.ten || "Bản đồ chuyên đề",
    icon: storedThematicCat?.icon || "🗺️",
    isThematic: true,
    layers: [
      ...(storedThematicCat ? [
        ...storedThematicCat.layers.map(l => ({
          ...l,
          active: l.isThematic ? activeRaster === (l.thematicSource || l.id) : activeLayers.has(l.id),
          isCustom: false,
          isThematic: l.isThematic,
          isThematicCopy: l.isThematicCopy || (l.isThematic && l.id.startsWith("custom_")),
        })),
        ...customLayers.filter(c => c.categoryId === "__thematic__").map(c => ({
          id: c.id, ten: c.ten, mau: c.mau, bieu_tuong: c.bieu_tuong, active: activeLayers.has(c.id), isCustom: true,
        })),
      ] : []),
      ...(rasterMeta ? THEMATIC_KEYS.filter(k => rasterMeta.layers[k] && !layerCategories.some(category => category.layers.some(layer => layer.isThematic && (layer.thematicSource || layer.id) === k))).map(k => {
      const info = rasterMeta.layers[k];
      return { id: k, ten: info.label, mau: thematicColor(info.stops), bieu_tuong: THEMATIC_ICONS[k] ?? "🗺️", active: activeRaster === k, isThematic: true };
      }) : []),
    ],
  } : null;
  const allEditableLayers = new Set<string>([...EDITABLE_LAYERS, ...customLayerIds, ...knowledgeDefs.map(d => d.id)]);
  const allExportableLayers = new Set<string>([
    "forests", "medicinal_plants", "ward_boundaries",
    ...customLayerIds,
    ...knowledgeDefs.map(d => d.id),
  ]);
  const customDisplay: Record<string, { name: string; color: string }> = {};
  const customGeom: Record<string, "point" | "line" | "polygon"> = {};
  customLayers.forEach(c => { customDisplay[c.id] = { name: c.ten, color: c.mau }; customGeom[c.id] = c.geomType; });
  knowledgeDefs.forEach(d => { customDisplay[d.id] = { name: d.ten, color: d.mau }; customGeom[d.id] = d.features.length > 0 && d.features.every(f => Array.isArray((f as any)?.coords)) ? "polygon" : "point"; });
  const layerDisplayAll: Record<string, any> = { ...LAYER_DISPLAY, ...customDisplay };
  const layerGeomAll = { ...LAYER_GEOM_TYPE, ...customGeom };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => mapRef.current?.invalidateSize({ animate: false }));
    return () => window.cancelAnimationFrame(frame);
  }, [leftCollapsed, rightCollapsed, leftWidth, rightWidth]);
  
  const layerSymbolAll: Record<string, { mau: string; bieu_tuong: string }> = {};
  layerCategories.forEach((cat: any) => cat.layers.forEach((l: any) => { 
  layerSymbolAll[l.id] = { mau: l.mau, bieu_tuong: l.bieu_tuong }; 
}));
  customLayers.forEach(c => { layerSymbolAll[c.id] = { mau: c.mau, bieu_tuong: c.bieu_tuong }; });
  Object.entries(layerDisplayAll).forEach(([id, meta]) => {
    meta.geomType = layerGeomAll[id];
    meta.bieu_tuong = layerSymbolAll[id]?.bieu_tuong;
    // Lớp dạng tuyến dùng ký hiệu thật từ symbology (màu, lực nét, kiểu nét) để chú giải khớp bản đồ
    if (meta.geomType === "line") {
      const sym = getLayerSymbology(id);
      meta.color = sym.color;
      meta.lineWeight = sym.lineWeight;
      meta.lineDash = sym.dashArray || undefined;
    }
  });

  const featureCounts: Record<string, number> = layersData ? {
    rivers: layersData.rivers?.length || 0,
    forests: layersData.forests?.length || 0,
    medicinal_plants: layersData.medicinal_plants?.length || 0,
    ward_boundaries: allWardsGeoJson?.features.length || 0,
    ...Object.fromEntries(customLayerIds.map(id => [id, ((layersData as any)[id] || []).length])),
    ...Object.fromEntries(knowledgeDefs.map(def => [def.id, (((layersData as any)[def.id] as any[]) || []).length] as [string, number])),
  } : {};
  const editingLayerFeatures = editingLayer && layersData ? ((layersData as any)[editingLayer] || []) : [];
  const ethnicColorMap = useMemo(() => Object.fromEntries((danTocData?.dan_toc || []).map(item => [item.id, ethnicOverrides.get(item.id)?.mau || item.mau])), [danTocData, ethnicOverrides]);
  const ethnicEditorOptions = useMemo(() => {
    const catalog = (danTocData?.dan_toc || []).map(item => ({ id: item.id, ten: item.ten, mau: item.mau }));
    const knownNames = new Set(catalog.map(item => item.ten.toLowerCase().replace(/^dân tộc\s+/, "").replace(/^người\s+/, "")));
    return [...catalog, ...EXTRA_ETHNIC_OPTIONS.filter(item => !knownNames.has(item.ten.toLowerCase().replace(/^dân tộc\s+/, "")))];
  }, [danTocData]);
  const mapCenter: [number, number] = mapRef.current ? [mapRef.current.getCenter().lat, mapRef.current.getCenter().lng] : [21.7, 103.5];
  const pieSelectableWards = useMemo(() => {
    if (!currentProvinceGeoJson) return [];
    return currentProvinceGeoJson.features.map(feature => {
      const props = feature.properties as unknown as WardProperties;
      return { ma_xa: props.ma_xa, ten_xa: props.ten_xa, ten_tinh: props.ten_tinh || selectedProvince || "" };
    });
  }, [currentProvinceGeoJson, selectedProvince]);
  const totalLayerFeatures = layersData ? Object.values(featureCounts).reduce((sum, n) => sum + (n || 0), 0) : 0;

  // Hàm render thường (không phải component) để tránh remount EditableValue mỗi lần re-render
  const renderEditWard=({field,suffix="",type="text" as "text"|"number",decimals}:{field:keyof WardProperties&string;suffix?:string;type?:"text"|"number";decimals?:number}):React.ReactNode=>{
    if(!panelWard)return null;
    const val=getWardValue(panelWard,field);
    return <EditableValue value={(val??"") as string|number} suffix={suffix} type={type} decimals={decimals} placeholder="Click để nhập" onSave={v=>updateWardField(panelWard.ma_xa,field,type==="number"?parseFloat(v):v)}/>;
  };

  const openEarth3D = async () => {
    const m = mapRef.current;
    const center: [number, number] = m ? [m.getCenter().lng, m.getCenter().lat] : [103.6, 21.7];
    const zoom = m ? Math.min(Math.max(m.getZoom(), 7), 11) : 9;
    let overlay: unknown = null;
    if (selectedWard && currentProvinceGeoJson) {
      overlay = { type: "FeatureCollection", features: currentProvinceGeoJson.features.filter(f => (f.properties as Record<string, unknown>)?.ma_xa === selectedWard.ma_xa) };
    } else if (currentProvinceGeoJson) {
      overlay = currentProvinceGeoJson;
    } else if (provinceMaskGeomRef.current) {
      overlay = provinceMaskGeomRef.current;
    }

    // Lớp raster chuyên đề đang bật — dùng bản đã cắt theo ranh giới nếu có cache
    let raster: { url: string; bounds: [[number, number], [number, number]]; opacity: number } | null = null;
    if (activeRaster && rasterMeta?.layers[activeRaster]) {
      const info = rasterMeta.layers[activeRaster];
      raster = {
        url: maskedRasterCacheRef.current.get(activeRaster) || `${BASE_PATH}/data/raster/${info.file}`,
        bounds: rasterMeta.bounds,
        opacity: rasterOpacity,
      };
    }

    // Gộp các lớp vector đang bật thành một FeatureCollection cho MapLibre 3D
    const { featuresToGeoJSON } = await import("../utils/geoUtils");
    const earthFeatures: GeoJSON.Feature[] = [];
    const pushInternalLayer = (features: any[], geom: "point" | "line" | "polygon", color: string, fillColor: string, fill: number, weight: number) => {
      if (!Array.isArray(features) || features.length === 0) return;
      const fc = featuresToGeoJSON(features, geom, { color, lineWidth: weight, fillAlpha: fill }) as GeoJSON.FeatureCollection;
      fc.features.forEach(feature => {
        feature.properties = { ...(feature.properties || {}), __geom: geom, __color: color, __fillColor: fillColor, __fill: fill, __weight: weight };
        earthFeatures.push(feature);
      });
    };
    const pushWardLayer = (fc: unknown, color: string, fillColor: string, fill: number, weight: number) => {
      if (!fc) return;
      const features = (fc as GeoJSON.FeatureCollection).features;
      if (!Array.isArray(features) || features.length === 0) return;
      features.forEach(feature => {
        if (!feature?.geometry) return;
        earthFeatures.push({
          type: "Feature",
          properties: { __geom: "polygon", __color: color, __fillColor: fillColor, __fill: fill, __weight: weight },
          geometry: feature.geometry,
        });
      });
    };

    const wardStyle = getLayerSymbology("ward_boundaries");
    if (wardBoundaryOnRef.current) {
      if (currentProvinceGeoJson) pushWardLayer(currentProvinceGeoJson, wardStyle.color, wardStyle.fillColor, wardStyle.fillOpacity, wardStyle.lineWeight);
      else if (allWardsGeoJson) pushWardLayer(allWardsGeoJson, wardStyle.color, wardStyle.fillColor, wardStyle.fillOpacity, wardStyle.lineWeight);
    }
    if (activeLayers.has("population_density") && !activeRaster && selectedProvince && currentProvinceGeoJson) {
      const densityStyle = getLayerSymbology("population_density");
      ((currentProvinceGeoJson as unknown) as GeoJSON.FeatureCollection).features.forEach(feature => {
        const props = (feature?.properties ?? {}) as unknown as WardProperties;
        if (!feature?.geometry) return;
        earthFeatures.push({
          type: "Feature",
          properties: {
            __geom: "polygon",
            __color: "#3f3f3f",
            __fillColor: getDensityColor(getDensityValue(props)),
            __fill: densityStyle.fillOpacity,
            __weight: 1.1,
          },
          geometry: feature.geometry,
        });
      });
    }
    activeLayers.forEach(id => {
      if (id === "ward_boundaries" || id === "population_density") return;
      const features = layersData ? (layersData as Record<string, any>)[id] : null;
      if (!Array.isArray(features) || features.length === 0) return;
      const geom = layerGeomAll[id] || "point";
      const style = getLayerSymbology(id);
      const hasOwnSymbology = !!layerSymbologies[id] || !!DEFAULT_LAYER_SYMBOLOGY[id];
      const customColor = customDisplay[id]?.color;
      const color = (hasOwnSymbology ? style.color : customColor) || customColor || style.color || "#4c6ef5";
      const fillColor = (hasOwnSymbology ? style.fillColor : customColor) || color;
      pushInternalLayer(features, geom, color, fillColor, geom === "polygon" ? style.fillOpacity : 0, style.lineWeight || 2);
    });

    const vectors: GeoJSON.FeatureCollection | null = earthFeatures.length > 0
      ? { type: "FeatureCollection", features: earthFeatures }
      : null;
    setEarth3d({ open: true, center, zoom, overlay, raster, vectors });
  };

  /* ─── Render ─── */
  return (
    <div className="webgis-container">
      
      {/* ─── Header ─── */}
      <div className="map-header">
        <div className="header-left">
          <div className="header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg></div>
          <div><h1 className="header-title">WebGIS Tây Bắc</h1><p className="header-subtitle">Hệ thống thông tin địa lý & tri thức bản địa vùng Tây Bắc</p></div>
        </div>
        <div className="header-right">
          <form onSubmit={e => { e.preventDefault(); void searchArea(); }} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input value={searchText} onChange={e => { setSearchText(e.target.value); setSearchMessage(null); }} placeholder="Tìm xã hoặc tỉnh..." aria-label="Tìm xã hoặc tỉnh" style={{ width: 170, padding: "7px 9px", borderRadius: 6, border: "1px solid rgba(82,183,136,0.35)", background: "#13251d", color: "#d8f3dc" }}/>
            <button type="submit" className="import-btn" title="Tìm kiếm">Tìm kiếm</button>
          </form>
          {searchMessage && <span style={{ color: "#f4a261", fontSize: 11 }}>{searchMessage}</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 5px", border: "1px solid rgba(82,183,136,0.35)", borderRadius: 6, background: "#13251d" }} title="Tỉ lệ bản đồ: 1 cm trên bản đồ bằng bao nhiêu cm ngoài thực địa">
            <span style={{ color: "#b7e4c7", fontSize: 11 }}>1:</span>
            <select
              value={MAP_SCALE_OPTIONS.includes(mapScale) ? String(mapScale) : ""}
              onChange={e => { const value = Number(e.target.value); setCustomMapScale(""); applyMapScale(value); }}
              aria-label="Tỉ lệ định sẵn"
              style={{ width: 92, border: 0, outline: 0, background: "transparent", color: "#52b788", fontSize: 12, fontWeight: 700 }}
            >
              <option value="">Tùy chỉnh</option>
              {MAP_SCALE_OPTIONS.map(scale => <option key={scale} value={scale}>{scale.toLocaleString("vi-VN")}</option>)}
            </select>
            <input
              type="number"
              min={1000}
              step={1000}
              value={customMapScale}
              placeholder={String(mapScale)}
              onChange={e => setCustomMapScale(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") applyMapScale(Number(customMapScale)); }}
              onBlur={() => { if (customMapScale) applyMapScale(Number(customMapScale)); }}
              aria-label="Nhập tỉ lệ bản đồ"
              style={{ width: 70, padding: "3px 4px", border: "1px solid rgba(82,183,136,0.25)", borderRadius: 4, background: "#1a3a29", color: "#d8f3dc", fontSize: 11 }}
            />
          </div>
          <div className="header-breadcrumb">
            {viewMode==="province"?<span className="breadcrumb-item active">Toàn vùng</span>:(
              <><button className="breadcrumb-item link" onClick={handleBack}>Toàn vùng</button><span className="breadcrumb-sep">›</span><span className="breadcrumb-item active">{selectedProvince}</span>{selectedWard&&<><span className="breadcrumb-sep">›</span><span className="breadcrumb-item active">{(getWardValue(selectedWard,"ten_xa") as string)||selectedWard.ten_xa}</span></>}</>
            )}
          </div>
          <button className="layer-toggle-btn" onClick={openEarth3D} title="Chế độ 3D (xoay · nghiêng góc nhìn)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span className="btn-label">Chế độ 3D</span>
          </button>
          <button className={`layer-toggle-btn ${showLayers?"active":""}`} onClick={()=>setShowLayers(s=>!s)} title="Lớp bản đồ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            <span className="btn-label">Lớp bản đồ</span> {(activeLayers.size + (activeRaster ? 1 : 0))>0&&<span className="layer-count">{activeLayers.size + (activeRaster ? 1 : 0)}</span>}
          </button>
          <button className="layer-toggle-btn" onClick={() => navigate("/nguon-du-lieu")} title="Tra cứu nguồn dữ liệu của từng lớp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="16" y2="7"/><line x1="9" y1="11" x2="14" y2="11"/></svg>
            <span className="btn-label">Nguồn dữ liệu</span>
          </button>
          {syncEnabled && (
            <button
              className="layer-toggle-btn"
              onClick={() => { if (syncState.phase === "error") retrySync(); }}
              title={
                syncState.phase === "error"
                  ? `Đồng bộ lỗi: ${syncState.error || "không rõ"} — bấm để thử lại`
                  : syncState.phase === "syncing"
                    ? "Đang đồng bộ dữ liệu chung…"
                    : syncState.lastSyncAt
                      ? `Đã đồng bộ dữ liệu chung lúc ${new Date(syncState.lastSyncAt).toLocaleTimeString("vi-VN")}`
                      : "Đồng bộ dữ liệu chung (mọi máy thấy giống nhau)"
              }
              style={{ gap: 5 }}
            >
              <span style={{ fontSize: 13 }}>
                {syncState.phase === "syncing" ? "☁️…" : syncState.phase === "error" ? "☁️⚠" : "☁️"}
              </span>
              <span className="btn-label">
                {syncState.phase === "syncing" ? "Đang đồng bộ" : syncState.phase === "error" ? "Lỗi đồng bộ" : "Đã đồng bộ"}
              </span>
            </button>
          )}
          <button className="import-btn" onClick={()=>setShowImport(true)} title="Nhập dữ liệu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span className="btn-label">Nhập dữ liệu</span>
          </button>
          <button 
            className="import-btn" 
            style={{ background: "#2563eb", borderColor: "#3b82f6" }} 
onClick={() => setShowMapComposer(s => !s)}
            title="Biên tập & Xuất bản đồ"
          >
            <Printer className="w-4 h-4" />
            <span className="btn-label">Biên tập bản đồ</span>
          </button>
        </div>
      </div>

      {/* ─── MAP BODY (3 CỘT) ─── */}
      <div className="map-body" style={{ display: "flex", width: "100%", height: "calc(100vh - 60px)", overflow: "hidden", position: "relative" }}>
        
        {/* ── 1. SIDEBAR TRÁI (Lớp bản đồ & LayerControl) ── */}
        <div style={{
          width: leftCollapsed ? "8px" : `${leftWidth}px`,
          display: "flex",
          transition: leftCollapsed ? "width 0.2s ease" : "none",
          position: "relative", flexShrink: 0, background: "#0a1410",
          borderRight: "1px solid rgba(82,183,136,0.2)", overflow: "hidden", height: "100%"
        }}>
          <div style={{ width: leftCollapsed ? "0px" : `${leftWidth}px`, height: "100%", overflowY: "auto", flexShrink: 0 }}>
            {toastMessage && (
              <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1200, background: "rgba(10, 18, 18, 0.95)", color: "#d8f3dc", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(82,183,136,0.35)", boxShadow: "0 12px 28px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
                <span>{toastMessage}</span>
                {lastDeletedRef.current && (
                  <button onClick={() => restoreTrashEntry(lastDeletedRef.current!)} style={{ background: "#52b788", border: "none", borderRadius: 6, color: "#07140d", padding: "4px 8px", cursor: "pointer", fontWeight: 700 }}>Khôi phục</button>
                )}
              </div>
            )}
            {showLayers && <LayerControl
  categories={layerCategoriesWithState}
  thematicCategory={thematicCategory}
  onToggle={toggleLayer}
  onToggleCategory={toggleLayerCategory}
  onDuplicateLayer={duplicateLayer}
  onEditLayer={openLayerEditor}
  onEditSymbology={openSymbologyEditor}
  onAddCustomLayer={addCustomLayer}
  onImportLayerFile={importLayerFile}
  onDeleteCustomLayer={deleteCustomLayer}
  onRenameCustomLayer={renameCustomLayer}
  onRenameLayer={renameLayer}
  onRenameCategory={renameCategory}
  onAddCategory={addLayerCategory}
  onDeleteCategory={deleteLayerCategory}
  onRemoveBuiltinLayer={removeBuiltinLayer}
  onToggleFolderCollapse={toggleFolderCollapse}
  onMoveLayer={moveLayer}
  rasterOpacity={rasterOpacity}
  onRasterOpacity={setRasterOpacity}
  thematicSource={activeRaster && rasterMeta?.layers[activeRaster] ? rasterMeta.layers[activeRaster].source : undefined}
  onClearThematic={() => setActiveRaster(null)}
  onExportLayer={exportLayer}
  featureCounts={featureCounts}
  editableLayers={allEditableLayers}
  exportableLayers={allExportableLayers}
  onClose={()=>setShowLayers(false)}
  showKnowledge={showKnowledge}
  onToggleKnowledge={()=>setShowKnowledge(s=>!s)}
  showEthnicPie={showPieSelector}
  onToggleEthnicPie={()=>setShowPieSelector(prev => { if (prev) { setPieWardSelection(new Set()); setShowPieSelectorModal(false); } return !prev; })}
  onOpenPieSelector={() => { setShowPieSelector(true); setShowPieSelectorModal(true); }}
  showWardLabels={wardLabelConfig.on}
  onToggleWardLabels={() => setWardLabelConfig(c => ({ ...c, on: !c.on }))}
  wardLabelColor={wardLabelConfig.color}
  onWardLabelColor={(value) => setWardLabelConfig(c => ({ ...c, color: value }))}
  wardLabelSize={wardLabelConfig.size}
  onWardLabelSize={(value) => setWardLabelConfig(c => ({ ...c, size: value }))}
  specialOrder={specialLayerOrder}
/>}
          </div>
          <div onMouseDown={startResizingLeft} style={{ position: "absolute", top: 0, right: 0, width: "8px", height: "100%", cursor: "col-resize", background: "transparent", zIndex: 10 }} title="Kéo để thay đổi độ rộng"/>
        </div>

        {/* ── 2. KHU VỰC BẢN ĐỒ CHÍNH ── */}
        <div style={{ flex: 1, height: "100%", position: "relative", minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          
          <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <button onClick={() => setSelectedAreaOnly(value => !value)} style={{ position: "relative", zIndex: 2, background: selectedAreaOnly ? "#2d6a4f" : "#13251d", color: "#d8f3dc", border: "1px solid rgba(82,183,136,0.3)", padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }} disabled={!selectedProvince}>
              {selectedAreaOnly ? "✓ Chỉ khu vực chọn" : "Chỉ khu vực chọn"}
            </button>
            {viewMode === "ward" && <span style={{ color: "#b7e4c7", fontSize: 10, paddingLeft: 2 }}>Giữ Shift/Ctrl khi click để chọn nhiều xã</span>}
            <label style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 5, background: "#13251d", color: "#d8f3dc", border: "1px solid rgba(82,183,136,0.3)", padding: "4px 8px", borderRadius: 6, fontSize: 11, opacity: selectedProvince ? 1 : 0.55, whiteSpace: "nowrap" }} title="0% giữ nguyên ngoại vi, 100% làm trắng ngoại vi">
              Ngoại vi
              <input type="range" min="0" max="1" step="0.05" value={selectedAreaFade} disabled={!selectedProvince} onChange={e => { setSelectedAreaOnly(true); setSelectedAreaFade(Number(e.target.value)); }} style={{ width: 80 }} />
              <span>{selectedAreaFade === 1 ? "trắng" : `${Math.round((1 - selectedAreaFade) * 100)}%`}</span>
            </label>
          </div>


          {activeRaster && rasterMeta && rasterMeta.layers[activeRaster] && (() => {
            const info = rasterMeta.layers[activeRaster];
            const stops = info.stops;
            const isClass = Array.isArray(stops) && stops.length > 0 && (stops as any[])[0].name !== undefined;
            const isWheel = stops === "wheel";
            return (
              <div className="thematic-legend">
                <div className="legend-title">{info.label} <span className="legend-unit">({info.unit})</span></div>
                {isWheel ? (
                  <div className="legend-wheel">
                    {[{dir:"B (Bắc)",color:"#e63c3c"},{dir:"ĐB",color:"#ffb43c"},{dir:"Đ (Đông)",color:"#fff550"},{dir:"ĐN",color:"#82dc50"},{dir:"N (Nam)",color:"#3cc882"},{dir:"TN",color:"#3cb4dc"},{dir:"T (Tây)",color:"#5064e6"},{dir:"TB",color:"#c850dc"}].map((d,i)=><div key={i} className="legend-wheel-row"><span className="legend-swatch" style={{background:d.color}}/><span>{d.dir}</span></div>)}
                  </div>
                ) : isClass ? (
                  <div className="legend-classes">
                    {(stops as {name:string;color:[number,number,number]}[]).map((s,i) => (<div key={i} className="legend-class-row"><span className="legend-swatch" style={{background:`rgb(${s.color[0]},${s.color[1]},${s.color[2]})`}}/><span>{s.name}</span></div>))}
                  </div>
                ) : (
                  <div className="legend-ramp-wrap">
                    <div className="legend-ramp" style={{background:`linear-gradient(to right, ${(stops as {v:number;r:number;g:number;b:number}[]).map(s=>`rgb(${s.r},${s.g},${s.b})`).join(", ")})`}}/>
                    <div className="legend-ramp-labels">
                      <span>{(stops as {v:number}[])[0].v}</span>
                      <span>{(stops as {v:number}[])[Math.floor((stops as any[]).length/2)].v}</span>
                      <span>{(stops as {v:number}[])[(stops as any[]).length-1].v}</span>
                    </div>
                  </div>
                )}
                {info.source && <div className="legend-source" title="Nguồn dữ liệu" style={{marginTop:6,fontSize:9.5,lineHeight:1.4,opacity:0.7,fontStyle:"italic"}}>Nguồn: {info.source}</div>}
              </div>
            );
          })()}

          {/* Bản đồ chính */}
          <div className="map-wrapper" style={{ width: "100%", height: "100%", flex: 1, position: "relative" }}>
            <div ref={mapContainerRef} className="map-canvas" style={{ width: "100%", height: "100%" }}/>

            {!editingLayer && (
            <div className="draw-toolbar">
              <button className={`draw-btn ${drawMode==="diem"?"active":""}`} onClick={()=>setDrawMode(drawMode==="diem"?null:"diem")} title="Vẽ điểm đánh dấu">📍 Điểm</button>
              <button className={`draw-btn ${drawMode==="duong"?"active":""}`} onClick={()=>setDrawMode(drawMode==="duong"?null:"duong")} title="Vẽ đường">〰️ Đường</button>
              <button className={`draw-btn ${drawMode==="vung"?"active":""}`} onClick={()=>setDrawMode(drawMode==="vung"?null:"vung")} title="Vẽ vùng">⬡ Vùng</button>
              <div className="draw-sep"/>
              {drawMode ? (
                <div className="draw-active-bar">
                  <span className="draw-hint">{drawMode==="diem"?"Click vào bản đồ để đặt điểm":"Click để vẽ · Double-click để kết thúc"}</span>
                  <button className="draw-cancel-btn" onClick={cancelDraw}>Hủy</button>
                </div>
              ) : (
                <button className={`draw-btn ${showAnnotations?"active":""}`} onClick={()=>setShowAnnotations(v=>!v)} title="Danh sách đối tượng đã đánh dấu">
                  📋 Danh sách{annotations.length>0&&<span className="ann-count">{annotations.length}</span>}
                </button>
              )}
            </div>
            )}

            {(loading||loadingWardBoundaries)&&<div className="map-overlay"><div className="loading-spinner"/><span>{loadingWardBoundaries?"Đang tải ranh giới xã của 4 tỉnh...":"Đang tải dữ liệu..."}</span></div>}
            {viewMode==="ward"&&<button className="back-button" onClick={handleBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon"><polyline points="15 18 9 12 15 6"/></svg>Quay lại bản đồ vùng</button>}
            {viewMode==="province"&&!drawMode&&<div className="map-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Click vào tỉnh để xem ranh giới xã và dân tộc</div>}

            {layerDragMode && (
              <div className="drag-mode-banner">
                ✋ Đang ở chế độ kéo thả lớp <b>{layerDisplayAll[layerDragMode]?.name || layerDragMode}</b> — kéo các điểm trên bản đồ để di chuyển
                <button className="drag-mode-off" onClick={() => setLayerDragMode(null)}>✕ Tắt</button>
              </div>
            )}

            {showAnnotations&&(
              <div className="ann-list-panel">
                <div className="ann-list-header">
                  <span>Đối tượng đã đánh dấu ({annotations.length})</span>
                  <div className="ann-list-actions">
                    {annotations.length>0&&<button className="ann-export-btn" onClick={exportAnnotations}>⬇ GeoJSON</button>}
                    <button className="modal-close" onClick={()=>setShowAnnotations(false)}>✕</button>
                  </div>
                </div>
                {annotations.length===0?(
                  <div className="ann-list-empty">Chưa có đối tượng nào.<br/>Dùng nút 📍〰️⬡ để vẽ trên bản đồ.</div>
                ):(
                  <div className="ann-list-body">
                    {annotations.map(ann=>(
                      <div key={ann.id} className="ann-list-item" onClick={()=>{ if(!POPUPS_ENABLED) return; const ag=annotationGroupRef.current; ag?.eachLayer(l=>{ if(l instanceof L.Marker){const mp=l.getPopup(); if(mp?.getContent()?.toString().includes(ann.ten))l.openPopup();} }); }}>
                        <div className="ann-list-dot" style={{background:ann.mau}}/>
                        <div className="ann-list-info">
                          <div className="ann-list-name">{NHOM_LABELS[ann.nhom]||"📍"} {ann.ten}</div>
                          <div className="ann-list-meta">{ann.loai==="diem"?"Điểm":ann.loai==="duong"?"Đường":"Vùng"} · {ann.ngay}</div>
                        </div>
                        <button className="ann-list-delete" onClick={e=>{e.stopPropagation();removeAnnotation(ann.id);}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mouseCoords && (
              <div className="mouse-coords-bar" style={{
                position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)",
                background: "rgba(8,20,12,0.92)", color: "#d8f3dc",
                fontSize: 11, fontFamily: "'Courier New', monospace",
                padding: "4px 14px", borderRadius: 5,
                border: "1px solid rgba(82,183,136,0.4)",
                pointerEvents: "none", zIndex: 450,
                display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
                boxShadow: "0 3px 14px rgba(0,0,0,0.45)",
              }}>
                <span style={{ color: "#52b788", fontSize: 13 }}>⊕</span>
                <span style={{ color: "#b7e4c7" }}>{mouseCoords.lat.toFixed(5)}°N</span>
                <span style={{ color: "rgba(82,183,136,0.35)" }}>·</span>
                <span style={{ color: "#b7e4c7" }}>{mouseCoords.lng.toFixed(5)}°E</span>
              </div>
            )}

            {legendOpts.visible ? (
            <div className="map-legend" style={{ transform: `scale(${legendOpts.scale})`, transformOrigin: "bottom right" }}>
              <div className="legend-head">
                <div className="legend-title">Chú giải</div>
                <div className="legend-head-actions">
                  <button onClick={() => bumpLegendScale(-1)} title="Thu nhỏ chú giải" aria-label="Thu nhỏ chú giải">−</button>
                  <button onClick={() => bumpLegendScale(1)} title="Phóng to chú giải" aria-label="Phóng to chú giải">＋</button>
                  <button onClick={() => setLegendOpts(o => ({ ...o, visible: false }))} title="Ẩn chú giải" aria-label="Ẩn chú giải">✕</button>
                </div>
              </div>
              <div className="legend-subtitle">Nền &amp; Địa giới</div>
{(viewMode === "province" || activeLayers.has("ward_boundaries")) && (() => {
  const boundaryStyle = getLayerSymbology(viewMode === "province" ? "province_boundaries" : "ward_boundaries");
  return (
    <div className="legend-item">
      <svg width="18" height="14" viewBox="0 0 18 14" className="legend-color legend-line-swatch" style={{ width: 18, height: 14, background: "transparent" }}>
        <line
          x1="1" y1="7" x2="17" y2="7"
          stroke={boundaryStyle.color}
          strokeWidth={Math.max(1.5, boundaryStyle.lineWeight)}
          strokeDasharray={boundaryStyle.dashArray || undefined}
          strokeLinecap="round"
        />
      </svg>
      <span>{viewMode === "province" ? "Ranh giới tỉnh" : "Ranh giới xã/phường"}</span>
    </div>
  );
})()}{activeLayers.has("ward_boundaries") && viewMode === "province" && (() => {
  const wardLegendStyle = getLayerSymbology("ward_boundaries");
  return (
    <div className="legend-item">
      <svg width="18" height="14" viewBox="0 0 18 14" className="legend-color legend-line-swatch" style={{ width: 18, height: 14, background: "transparent" }}>
        <line
          x1="1" y1="7" x2="17" y2="7"
          stroke={wardLegendStyle.color}
          strokeWidth={Math.max(1.5, wardLegendStyle.lineWeight)}
          strokeDasharray={wardLegendStyle.dashArray || undefined}
          strokeLinecap="round"
        />
      </svg>
      <span>Ranh giới xã/phường (4 tỉnh)</span>
    </div>
  );
})()}
              {densityLegendEntries.length > 0 && viewMode === "ward" && <>
                <div className="legend-subtitle">Mật độ dân số (người/km²)</div>
                {densityLegendEntries.map((entry, index) => (
                  <div
                    className="legend-item"
                    key={`density-${index}`}
                    style={entry.present ? undefined : { opacity: 0.4 }}
                    title={entry.present ? undefined : "Chưa có xã nào ở bậc này"}
                  >
                    <div className="legend-color" style={{background: entry.color, opacity: entry.fillOpacity ?? 1}}/>
                    <span>{entry.label}</span>
                  </div>
                ))}
              </>}
              {(ethnicLegendItems.length > 0 || ethnicLegendComposition.length > 0) && (
                <div className="legend-ethnic-section">
                  <div className="legend-subtitle">Cơ cấu dân tộc</div>
                  {(ethnicLegendItems.length > 0 ? ethnicLegendItems : ethnicLegendComposition.map(item => ({ label: item.label, color: item.color }))).map(item => (
                    <div className="legend-item" key={`ethnic-${item.label}`}>
                      <span className="legend-color" style={{ background: item.color }} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* ── Tri thức bản địa rev 12 (L1–L7) ── */}
              {(() => {
                const defs = knowledgeDefs.filter(d => legendLayerHasFeature(d.id));
                if (!defs.length) return null;
                return (<>
                  <div className="legend-subtitle">Tri thức bản địa (L1–L7)</div>
                  {defs.map(d => {
                    if (d.id !== "tt_l2") return (
                      <div className="legend-item" key={`legend-${d.id}`}>
                        <LegendPoint color={d.mau} emoji={d.icon}/>
                        <span>{knowledgeShortLabel(d.ten)}</span>
                      </div>
                    );
                    // L2 phân loại theo loại hình thủy lợi khớp marker
                    const feats = ((layersData as any)?.tt_l2 || []) as any[];
                    const subtypes = THUY_LOI_SUBTYPES.filter(st =>
                      feats.some(f => legendFeatureVisible(f) && String(f.linh_vuc || "").includes(st.key)));
                    if (subtypes.length === 0) return (
                      <div className="legend-item" key={`legend-${d.id}`}>
                        <LegendPoint color={d.mau} emoji={d.icon}/>
                        <span>{knowledgeShortLabel(d.ten)}</span>
                      </div>
                    );
                    return subtypes.map(st => (
                      <div className="legend-item" key={`legend-${d.id}-${st.key}`}>
                        <LegendPoint color={d.mau} emoji={st.emoji}/>
                        <span>{st.label}</span>
                      </div>
                    ));
                  })}
                </>);
              })()}
              {/* ── Sông suối (OSM) ── */}
              {legendLayerHasFeature("rivers") && (() => {
                return (<>
                  <div className="legend-subtitle">Tài nguyên nước</div>
                  <div className="legend-item">
                    <svg width="18" height="14" viewBox="0 0 18 14" className="legend-color legend-line-swatch" style={{ width: 18, height: 14, background: "transparent" }}>
                      <path d="M1,10 C5,4 8,12 12,6 S16,3 17,4" fill="none" stroke="#f8fcff" strokeWidth="4.8" strokeLinecap="round" opacity="0.95"/>
                      <path d="M1,10 C5,4 8,12 12,6 S16,3 17,4" fill="none" stroke="#2589c7" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <span title="Nguồn: OpenStreetMap (Overpass API)">Hệ thống sông suối <span style={{opacity:0.6,fontSize:"inherit",fontStyle:"italic"}}>(OSM)</span></span>
                  </div>
                </>);
              })()}
              {/* ── Tài nguyên rừng (phân vùng rừng + cây thuốc) ── */}
              {(() => {
                const kinds = legendInViewKinds;
                const forestRows = activeLayers.has("forests") ? (["vqg","kbttn","kbvcq","rung_dac_dung"] as const).filter(k =>
                  kinds ? kinds.forests.has(k) : (!layersData || (layersData.forests||[]).some(f => f.loai === k))
                ) : [];
                const hasMed = legendLayerHasFeature("medicinal_plants");
                if (!forestRows.length && !hasMed) return null;
                return (<>
                  <div className="legend-subtitle">Tài nguyên rừng</div>
                  {forestRows.map(k => (
                    <div className="legend-item" key={`legend-forest-${k}`}>
                      <svg width="18" height="12" viewBox="0 0 18 12" className="legend-color legend-line-swatch" style={{width:18,height:12,background:"transparent"}}><rect x="1" y="1" width="16" height="10" rx="2" fill="#ffffff" fillOpacity="0.88"/><rect x="1" y="1" width="16" height="10" rx="2" fill={FOREST_COLORS[k]} fillOpacity="0.75" stroke={FOREST_COLORS[k]} strokeWidth="1.5"/></svg>
                      <span>{FOREST_LABELS[k]}</span>
                    </div>
                  ))}
                  {hasMed && (
                    <div className="legend-item">
                      <svg width="18" height="12" viewBox="0 0 18 12" className="legend-color legend-line-swatch" style={{width:18,height:12,background:"transparent"}}><rect x="1" y="1" width="16" height="10" rx="2" fill="#ffffff" fillOpacity="0.88"/><rect x="1" y="1" width="16" height="10" rx="2" fill="#e63946" fillOpacity="0.75" stroke="#e63946" strokeWidth="1.5"/></svg>
                      <span>Cây thuốc quý</span>
                    </div>
                  )}
                </>);
              })()}
              {customLayers.filter(layer => legendLayerHasFeature(layer.id)).map(layer => <div className="legend-item" key={`custom-legend-${layer.id}`}><span className="legend-symbol" style={{color: layer.mau}}>{layer.bieu_tuong?.startsWith("data:image") ? <img src={layer.bieu_tuong} alt="" style={{width: 18, height: 18, objectFit: "contain"}}/> : layer.bieu_tuong}</span><span>{layer.ten}</span></div>)}
              {legendAnnotationsVisible()&&<div className="legend-item"><div className="legend-color" style={{background:"#e9c46a"}}/><span>Đối tượng của tôi</span></div>}
            </div>
            ) : (
            <button className="legend-show-btn" onClick={() => setLegendOpts(o => ({ ...o, visible: true }))} title="Hiện chú giải" aria-label="Hiện chú giải">📖</button>
            )}
          </div>
        </div>

        {/* ── 3. SIDEBAR PHẢI (Thông tin địa bàn) ── */}
        <div style={{
          width: rightCollapsed ? "8px" : `${rightWidth}px`,
          display: "flex",
          transition: rightCollapsed ? "width 0.2s ease" : "none",
          position: "relative", flexShrink: 0, background: "#0a1410",
          borderLeft: "1px solid rgba(82,183,136,0.2)", overflow: "hidden", height: "100%"
        }}>
          <div onMouseDown={startResizingRight} style={{ position: "absolute", top: 0, left: 0, width: "8px", height: "100%", cursor: "col-resize", background: "transparent", zIndex: 10 }} title="Kéo để thay đổi độ rộng"/>
          <div style={{ width: rightCollapsed ? "0px" : `${rightWidth}px`, height: "100%", overflowY: "auto", flexShrink: 0 }}>
            {viewMode==="ward" && (
              <div className="info-panel" style={{ width: "100%", height: "100%", border: "none", background: "transparent", boxShadow: "none" }}>
                <div className="info-panel-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <div className="info-panel-titles"><div className="panel-title">Thông tin địa bàn</div><div className="panel-subtitle">{selectedProvince}</div></div>
                  <button className="info-panel-close" onClick={handleBack} title="Đóng / quay lại bản đồ">✕</button>
                </div>
                <div style={{ padding: "8px 10px 0" }}>
                  <label htmlFor="info-panel-ward-select" style={{ display: "block", color: "#9bc7ad", fontSize: 11, marginBottom: 4 }}>
                    Chọn xã/phường để xem thông tin
                  </label>
                  <select
                    id="info-panel-ward-select"
                    value={panelWard?.ma_xa || ""}
                    onChange={event => selectWardFromInfoPanel(event.target.value)}
                    style={{ width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid rgba(82,183,136,0.35)", background: "#13251d", color: "#d8f3dc", fontSize: 12 }}
                  >
                    <option value="">-- Chọn xã/phường --</option>
                    {currentProvinceGeoJson?.features
                      .map(feature => feature.properties as unknown as WardProperties)
                      .sort((a, b) => a.ten_xa.localeCompare(b.ten_xa, "vi"))
                      .map(ward => <option key={ward.ma_xa} value={ward.ma_xa}>{ward.ten_xa}</option>)}
                  </select>
                </div>

                {ethnicPanelBars.length > 0 && (
                  <div className="ethnic-panel-chart">
                    <div className="ethnic-panel-chart-title">
                      Cơ cấu dân tộc
                      {panelWard && (
                        <button className="add-ethnic-btn" onClick={() => setEditingWardComposition(panelWard)} title="Thêm hoặc sửa dân tộc của xã này">+</button>
                      )}
                    </div>
                    <div className="ethnic-panel-chart-subtitle">
                      {panelWard ? panelWard.ten_xa : `Tỉnh ${selectedProvince}`} · 4 nhóm chính
                    </div>
                    <div className="ethnic-panel-cols">
                      {ethnicPanelBars.map(bar => (
                        <div className="ethnic-panel-col" key={bar.id} title={`${bar.full}: ${bar.value}%`}>
                          <span className="ethnic-panel-col-value">{bar.value}%</span>
                          <div className="ethnic-panel-col-track">
                            <div
                              className="ethnic-panel-col-fill"
                              style={{ height: `${Math.max(2, bar.value)}%`, background: bar.color }}
                            />
                          </div>
                          <span className="ethnic-panel-col-label">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                    {ethnicPanelNames.length > 0 && (
                      <>
                        <div className="ethnic-panel-names-title">
                          Danh sách dân tộc · {panelWard ? panelWard.ten_xa : `tỉnh ${selectedProvince}`}
                          {panelWard && <span style={{ opacity: 0.7 }}> — bấm để mở panel lớn</span>}
                        </div>
                        <div className="ethnic-panel-all-names">
                          {ethnicPanelNames.map(item => {
                            if (item.id === ETHNIC_OTHER_ID) return (
                              <span className="ethnic-name-chip is-static" key={item.id} title={`${ETHNIC_OTHER_LABEL}: ${item.value}%`}>
                                <span className="ethnic-name-dot" style={{ background: item.color }} />
                                {item.ten}<b>{item.value}%</b>
                              </span>
                            );
                            const isActive = selectedDanToc?.id === item.id;
                            return (
                              <button
                                className={`ethnic-name-chip${isActive ? " is-active" : ""}`}
                                key={item.id}
                                onClick={() => {
                                  const info = getDanTocInfo(item.id);
                                  if (!info) return;
                                  // Chưa chọn xã → panel tri thức chưa hiển thị được → mở trang chi tiết
                                  if (!panelWard) { openEthnicPage(item.id); return; }
                                  // Chọn xã → mở PANEL LỚN (cơ cấu + tri thức dân tộc) thay vì chen trong cột hẹp
                                  setSelectedDanToc(info);
                                  setActiveTriThuc(0);
                                }}
                                title={isActive ? "Đang mở trong panel dân tộc" : `Xem cơ cấu & tri thức bản địa ${item.ten}`}
                              >
                                <span className="ethnic-name-dot" style={{ background: item.color }} />
                                {item.ten}<b>{item.value}%</b>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

{panelWard ? (
                  <div className="ward-info">
                    <div className="ward-name-wrap">
                      <EditableValue
                        value={(getWardValue(panelWard, "ten_xa") as string) || panelWard.ten_xa}
                        className="ward-name-editable"
                        onSave={v => updateWardField(panelWard.ma_xa, "ten_xa", v)}
                      />
                    </div>
                    <div className="ward-badge-row"><button
  className="ward-style-edit-btn"
  onClick={() => setEditingWardStyle(panelWard)}
  title="Tùy chỉnh màu sắc / đường viền riêng cho xã này"
>
  🎨 Tùy chỉnh giao diện xã này
</button>
                      <EditableValue
                        value={(getWardValue(panelWard, "loai") as string) || panelWard.loai || ""}
                        placeholder="Loại đơn vị"
                        className="ward-badge-editable"
                        onSave={v => updateWardField(panelWard.ma_xa, "loai", v)}
                      />
                    </div>
                    {/* ── Ảnh minh họa riêng của xã (fallback: ảnh dân tộc chủ đạo) ── */}
                    {(() => {
                      const heroAnh = (getWardValue(panelWard, "anh_dia_ban") as string) || "";
                      const heroGhichu = (getWardValue(panelWard, "anh_dia_ban_ghichu") as string) || "";
                      const dom = (panelWardDanToc || []).filter(d => (d.ty_le || 0) > 0).slice().sort((a, b) => (b.ty_le || 0) - (a.ty_le || 0))[0];
                      const domInfo = dom ? getDanTocInfo(dom.dan_toc) : undefined;
                      const isFallback = !heroAnh && !!domInfo?.anh;
                      const src = heroAnh || (domInfo?.anh ? assetUrl(domInfo.anh) : "");
                      if (!src) {
                        return (
                          <button className="ward-hero-add" onClick={() => pickWardPhoto({ ma_xa: panelWard.ma_xa, kind: "hero" })}>
                            📷 Thêm ảnh minh họa riêng cho {panelWard.ten_xa}
                          </button>
                        );
                      }
                      return (
                        <div
                          className="ward-banner ward-hero"
                          onClick={() => (isFallback ? pickWardPhoto({ ma_xa: panelWard.ma_xa, kind: "hero" }) : setEthnicPhotoLightbox(src))}
                          title={isFallback ? "Bấm để đặt ảnh riêng cho xã này" : "Xem ảnh lớn"}
                        >
                          <img src={src} alt={panelWard.ten_xa} loading="lazy" />
                          <div className="ward-banner-caption">
                            <div className="ward-banner-title">
                              {isFallback
                                ? `Ảnh minh họa · ${domInfo?.ten.replace("Dân tộc ", "").replace("Người ", "")} — dân tộc chủ đạo của ${panelWard.ten_xa} · bấm để đặt ảnh riêng`
                                : `Ảnh minh họa · ${panelWard.ten_xa}`}
                            </div>
                            {heroAnh && (
                              <div onClick={e => e.stopPropagation()}>
                                <EditableValue
                                  value={heroGhichu}
                                  placeholder="Nguồn / ghi chú ảnh (click để sửa)"
                                  className="ward-banner-credit"
                                  onSave={v => updateWardField(panelWard.ma_xa, "anh_dia_ban_ghichu", v)}
                                />
                              </div>
                            )}
                            {isFallback && domInfo?.anh_ghichu && <div className="ward-banner-credit">Nguồn ảnh: {domInfo.anh_ghichu}</div>}
                          </div>
                          <div className="ethnic-photo-actions" onClick={e => e.stopPropagation()}>
                            <button className="ethnic-photo-btn" onClick={() => pickWardPhoto({ ma_xa: panelWard.ma_xa, kind: "hero" })} title="Đặt / đổi ảnh riêng của xã">📷</button>
                            {heroAnh && (
                              <button
                                className="ethnic-photo-btn delete"
                                onClick={() => { if (confirm("Xóa ảnh minh họa của xã này?")) updateWardField(panelWard.ma_xa, "anh_dia_ban", undefined); }}
                                title="Xóa ảnh"
                              >🗑️</button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                   <div className="info-grid">
  <div className="info-row"><div className="info-label">Mã đơn vị</div><div className="info-value">{panelWard.ma_xa}</div></div>
  <div className="info-row"><div className="info-label">Diện tích</div><div className="info-value">{renderEditWard({ field: "dtich_km2", suffix: " km²", type: "number", decimals: 2 })}</div></div>
  <div className="info-row"><div className="info-label">Dân số</div><div className="info-value">{renderEditWard({ field: "dan_so", suffix: " người", type: "number" })}</div></div>
  <div className="info-row"><div className="info-label">Mật độ</div><div className="info-value">{renderEditWard({ field: "matdo_km2", suffix: " ng/km²", type: "number", decimals: 1 })}</div></div>
  </div>
  {panelWard.dan_so_nguon && (
    <div className="ward-data-src">
      Dân số, mật độ: {panelWard.dan_so_ky || "Số liệu chính thống"} ·{" "}
      <a href={panelWard.dan_so_nguon} target="_blank" rel="noopener noreferrer">Cổng dữ liệu mở tỉnh Sơn La</a>
      {typeof panelWard.dtts_so === "number" && <span> · DTTS: {panelWard.dtts_so.toLocaleString("vi-VN")} người</span>}
    </div>
  )}

                    {/* ── MẪU NHIỀU MỤC: nội dung địa bàn riêng của từng xã ── */}
                    {(() => {
                      const sections = getWardSections(panelWard);
                      return (
                        <div className="ward-sections">
                          <div className="ethnic-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            Nội dung địa bàn
                            <span className="ward-sections-hint">— click để sửa · ↑↓ sắp xếp</span>
                          </div>

                          {sections.length === 0 && (
                            <div className="ward-sections-empty">Xã này chưa có mục nội dung nào — bấm "+ Thêm mục nội dung" bên dưới.</div>
                          )}

                          {sections.map(sec => (
                            <div className="ward-section-card" key={sec.id}>
                              <div className="ward-section-head">
                                <EditableValue
                                  value={sec.tieu_de}
                                  placeholder="Tiêu đề mục..."
                                  className="ward-section-title"
                                  onSave={v => updateWardSection(panelWard, sec.id, { tieu_de: v })}
                                />
                                <div className="ward-section-actions">
                                  <button className="ward-section-btn" onClick={() => moveWardSection(panelWard, sec.id, -1)} title="Lên trên">↑</button>
                                  <button className="ward-section-btn" onClick={() => moveWardSection(panelWard, sec.id, 1)} title="Xuống dưới">↓</button>
                                  <button className="ward-section-btn danger" onClick={() => removeWardSection(panelWard, sec.id)} title="Xóa mục này">✕</button>
                                </div>
                              </div>
                              <EditableValue
                                value={sec.noi_dung}
                                multiline
                                placeholder="Nội dung mục này (click để sửa)..."
                                className="ward-section-body"
                                onSave={v => updateWardSection(panelWard, sec.id, { noi_dung: v })}
                              />
                              <EditableValue
                                value={sec.nguon || ""}
                                placeholder="Nguồn tham khảo của mục này (click để thêm)"
                                className="ward-section-source"
                                onSave={v => updateWardSection(panelWard, sec.id, { nguon: v })}
                              />
                              {sec.anh ? (
                                <div className="ward-section-photo">
                                  <img src={assetUrl(sec.anh)} alt={sec.tieu_de} loading="lazy" onClick={() => setEthnicPhotoLightbox(assetUrl(sec.anh))} title="Xem ảnh lớn" />
                                  <div className="ward-section-photo-bar">
                                    <EditableValue
                                      value={sec.anh_ghichu || ""}
                                      placeholder="Nguồn ảnh (click để sửa)"
                                      className="ward-section-credit"
                                      onSave={v => updateWardSection(panelWard, sec.id, { anh_ghichu: v })}
                                    />
                                    <div className="ward-section-photo-actions">
                                      <button className="ward-section-btn" onClick={() => pickWardPhoto({ ma_xa: panelWard.ma_xa, kind: "section", sectionId: sec.id })} title="Đổi ảnh">🔄</button>
                                      <button className="ward-section-btn danger" onClick={() => updateWardSection(panelWard, sec.id, { anh: undefined, anh_ghichu: undefined })} title="Xóa ảnh">🗑️</button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <button className="ward-section-photo-add" onClick={() => pickWardPhoto({ ma_xa: panelWard.ma_xa, kind: "section", sectionId: sec.id })}>
                                  📷 Thêm ảnh cho mục này
                                </button>
                              )}
                            </div>
                          ))}

                          <div className="ward-section-add-row">
                            <button className="ward-section-add" onClick={() => addWardSection(panelWard)}>+ Thêm mục nội dung</button>
                            <select
                              className="ward-section-suggest"
                              value=""
                              onChange={e => { if (e.target.value) addWardSection(panelWard, e.target.value); }}
                              title="Thêm nhanh mục gợi ý"
                            >
                              <option value="">Thêm mục gợi ý…</option>
                              {SECTION_SUGGESTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>

                          {!!panelWard.dac_diem_nguon?.length && (
                            <div className="ward-data-src">
                              Nguồn đặc điểm địa bàn: {panelWard.dac_diem_trang_thai === "co_nguon" ? "đã đối chiếu" : "cần đối chiếu"} ·{" "}
                              {panelWard.dac_diem_nguon.map((url, i) => (
                                <span key={i}>
                                  {i > 0 && " · "}
                                  <a href={url} target="_blank" rel="noopener noreferrer">nguồn {i + 1}</a>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* ── TRI THỨC BẢN ĐỊA TẠI XÃ NÀY (8 lớp L1–L7 rev 12) ── */}
                    {(() => {
                      const items = knowledgeDefs.flatMap(def =>
                        (((layersData as any)?.[def.id] as any[]) || [])
                          .filter(f => f && f.ma_xa === panelWard.ma_xa)
                          .map(f => ({ f, def }))
                      );
                      if (!items.length) return null;
                      return (
                        <div className="ward-sections knowledge-ward-list">
                          <div className="ethnic-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            Tri thức bản địa tại xã này
                            <span className="ward-sections-hint">— 📍 để xem trên bản đồ</span>
                          </div>
                          {items.map(({ f, def }, i) => (
                            <div className="knowledge-ward-item" key={`${def.id}-${f.id || i}`}>
                              <div className="knowledge-ward-item-head">
                                <span className="knowledge-ward-item-icon" style={{ background: def.mau }}>{def.icon}</span>
                                <div className="knowledge-ward-item-main">
                                  <div className="knowledge-ward-item-ten">{f.ten || "(chưa đặt tên)"}</div>
                                  <div className="knowledge-ward-item-sub">{f.linh_vuc || def.ten}</div>
                                </div>
                                {Number.isFinite(Number(f.lat)) && Number.isFinite(Number(f.lng)) && (
                                  <button
                                    className="ward-section-btn"
                                    title="Xem trên bản đồ"
                                    onClick={() => {
                                      if (!activeLayers.has(def.id)) setActiveLayers(prev => { const n = new Set(prev); n.add(def.id); return n; });
                                      // Dùng tọa độ hiển thị (display_lat/lng) nếu có — khớp vị trí marker trên bản đồ
                                      const dLat = Number.isFinite(Number(f.display_lat)) ? Number(f.display_lat) : Number(f.lat);
                                      const dLng = Number.isFinite(Number(f.display_lng)) ? Number(f.display_lng) : Number(f.lng);
                                      mapRef.current?.setView([dLat, dLng], 16);
                                    }}
                                  >📍</button>
                                )}
                              </div>
                              {f.mo_ta && <div className="knowledge-ward-item-mota">{f.mo_ta}</div>}
                              {(f.nguon || f.trang_thai) && (
                                <div className="knowledge-ward-item-src">
                                  {f.trang_thai === "co_nguon" ? "✓ Có nguồn" : f.trang_thai === "can_doi_chieu" ? "ⓘ Cần đối chiếu" : ""}
                                  {f.nguon ? `${f.trang_thai ? " · " : ""}Nguồn: ${Array.isArray(f.nguon) ? f.nguon.join("; ") : f.nguon}` : ""}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {wardPdfs.length>0&&(
                      <div className="pdf-section">
                        <div className="pdf-section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Tài liệu ({wardPdfs.length})</div>
                        {wardPdfs.map((pdf,i)=>(<div key={i} className="pdf-item"><div className="pdf-info"><span className="pdf-name">{pdf.name}</span><span className="pdf-size">{pdf.size}</span></div><div className="pdf-actions"><button className="pdf-btn view" onClick={()=>setPdfViewer(pdf)}>Xem</button><button className="pdf-btn remove" onClick={()=>removePdf(panelWard.ma_xa,i)}>✕</button></div></div>))}
                      </div>
                    )}

                    {(() => {
                      const wardVillages = (layersData?.villages || []).filter(v => v.ma_xa === panelWard.ma_xa);
                      if (!wardVillages.length) return null;
                      return (
                        <div className="ward-place-section">
                          <div className="ward-place-title">🏘️ Bản làng tiêu biểu ({wardVillages.length})</div>
                          {wardVillages.map((v, i) => {
                            const info = getDanTocInfo(v.dan_toc);
                            return (
                              <div className="ward-place-card" key={v.id || `vil-${i}`}>
                                <div className="ward-place-head">
                                  <span className="ward-place-dot" style={{ background: info?.mau || "#6d4c41" }} />
                                  <span className="ward-place-name">{v.ten}</span>
                                  {info && <span className="ward-place-ethnic">{info.ten.replace("Dân tộc ", "").replace("Người ", "")}</span>}
                                </div>
                                {v.mo_ta && <p className="ward-place-desc">{v.mo_ta}</p>}
                                {v.anh && (
                                  <div className="ward-place-photo">
                                    <img src={assetUrl(v.anh)} alt={v.ten} loading="lazy" onClick={() => setEthnicPhotoLightbox(assetUrl(v.anh))} />
                                    {v.anh_ghichu && <div className="ward-place-credit">Nguồn ảnh: {v.anh_ghichu}</div>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    {(() => {
                      const wardLaw = (layersData?.customary_zones || []).filter(z => z.ma_xa === panelWard.ma_xa);
                      if (!wardLaw.length) return null;
                      return (
                        <div className="ward-place-section">
                          <div className="ward-place-title">⚖️ Luật tục cộng đồng ({wardLaw.length})</div>
                          {wardLaw.map((z, i) => (
                            <div className="ward-place-card" key={z.id || `law-${i}`}>
                              <div className="ward-place-head">
                                <span className="ward-place-dot law" />
                                <span className="ward-place-name">{z.ten}</span>
                                <span className="ward-place-ethnic">{(z.loai || "").replace(/_/g, " ")}</span>
                              </div>
                              {z.dia_ban_hien_tai && <div className="ward-place-dia-ban">📍 {z.dia_ban_hien_tai}</div>}
                              {z.mo_ta && <p className="ward-place-desc">{z.mo_ta}</p>}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="ward-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <p>Click vào một xã/phường trên bản đồ để xem và chỉnh sửa thông tin</p>
                  </div>
                )}
                {stats&&selectedProvince&&(
                  <div className="province-stats">
                    <div className="stats-title">Thống kê tỉnh {selectedProvince} <span className="stats-edit-hint">— click để chỉnh sửa</span></div>
                    <div className="stats-grid">
                      <div className="stat-item"><div className="stat-value"><EditableValue value={stats.dien_tich} onSave={v=>updateProvinceStat(selectedProvince,"dien_tich",v)}/></div><div className="stat-label">km² Diện tích</div></div>
                      <div className="stat-item"><div className="stat-value"><EditableValue value={stats.dan_so} onSave={v=>updateProvinceStat(selectedProvince,"dan_so",v)}/></div><div className="stat-label">Dân số</div></div>
                      <div className="stat-item"><div className="stat-value"><EditableValue value={stats.don_vi} type="number" onSave={v=>updateProvinceStat(selectedProvince,"don_vi",v)}/></div><div className="stat-label">Xã/Phường</div></div>
                    </div>
                    {(() => { const sourceNote = STATS_SOURCE_NOTE[selectedProvince] || STATS_SOURCE_DEFAULT_NOTE; return (
                    <div className="stats-source" title={sourceNote} style={{ marginTop: 6, fontSize: 9.5, lineHeight: 1.4, color: "rgba(149,213,177,0.65)", fontStyle: "italic" }}>{sourceNote}</div>
                    ); })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── CÁC THÀNH PHẦN ẨN (MODAL, LIGHTBOX, V.V) ─── */}
      <input ref={ethnicPhotoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleEthnicPhotoChosen}/>
      <input ref={wardPhotoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleWardPhotoChosen}/>
      
      {ethnicPhotoLightbox&&(
        <div className="ik-lightbox" onClick={()=>setEthnicPhotoLightbox(null)}>
          <button className="ik-lightbox-close" onClick={()=>setEthnicPhotoLightbox(null)} aria-label="Đóng">✕</button>
          <img src={ethnicPhotoLightbox || undefined} alt="" onClick={e=>e.stopPropagation()}/>
        </div>
      )}

      {/* ── PANEL DÂN TỘC LỚN: mở khi bấm một dân tộc trong "Cơ cấu dân tộc" ── */}
      {selectedDanToc && (() => {
        const info = getDanTocInfo(selectedDanToc.id);
        if (!info) return null;
        return (
          <EthnicDetailPanel
            wardName={panelWard?.ten_xa ?? null}
            bars={ethnicPanelBars}
            names={ethnicPanelNames}
            info={info}
            triThuc={getTriThuc(info.id)}
            activeTopic={activeTriThuc}
            ethnicPdfs={pdfFiles.get("ethnic_" + info.id) || []}
            newTopicForm={newTopicForm}
            onSelectEthnic={id => { const next = getDanTocInfo(id); if (next) { setSelectedDanToc(next); setActiveTriThuc(0); setNewTopicForm(null); } }}
            onClose={() => { setSelectedDanToc(null); setNewTopicForm(null); }}
            onEditComposition={panelWard ? () => setEditingWardComposition(panelWard) : null}
            onEthnicField={updateEthnicField}
            onPickPhoto={pickEthnicPhoto}
            onDeletePhoto={id => setEthnicPhoto(id, undefined)}
            onOpenPhoto={setEthnicPhotoLightbox}
            onOpenPage={openEthnicPage}
            onOpenTransect={() => { const k = toEthnicKey(info.id); if (k) setTransectFor(k); }}
            onOpenCalendar={() => { const k = toEthnicKey(info.id); if (k) setCalendarFor(k); }}
            onOpenPdf={setPdfViewer}
            onRemovePdf={idx => removePdf("ethnic_" + info.id, idx)}
            setActiveTopic={setActiveTriThuc}
            setNewTopicForm={setNewTopicForm}
            onAddTopic={addTriThucTopic}
            onUpdateTopicField={updateTriThucField}
            onRemoveTopic={removeTriThucTopic}
            onSetRecipes={updateBaiThuoc}
            onAddRecipe={(ethId, topicIdx) => setEditingRecipe({ ethId, topicIdx, recipeIdx: null, data: { ten: "", nguyen_lieu: "", cong_dung: "" } })}
          />
        );
      })()}

      {showImport && (
  <ImportModal
    currentWard={selectedWard ? { ma_xa: selectedWard.ma_xa, ten_xa: selectedWard.ten_xa } : null}
    onClose={() => setShowImport(false)}
    wardOverrides={wardOverrides}
    onApplyWardCSV={(overrides) => setWardOverrides(overrides)}
    onClearWardData={() => setWardOverrides(new Map())}
    ethnicOverrides={ethnicOverrides}
    onApplyEthnicCSV={(overrides) => setEthnicOverrides(overrides)}
    onClearEthnicData={() => setEthnicOverrides(new Map())}
    pdfFiles={pdfFiles}
    onAddPdf={addPdf}
    onRemovePdf={removePdf}
    onViewPdf={(pdf) => setPdfViewer(pdf)}
    wardList={allWardsRef.current}
  />
)}
      
      {transectFor && <TransectDiagram onClose={()=>setTransectFor(null)} initialEthnic={transectFor} zonesByEthnic={transectByEthnic} ethnicZones={transectEthnic} onChangeZones={(k,z)=>setTransectByEthnic(p=>({...p,[k]:z}))} onChangeEthnicZones={setTransectEthnic}/>}
      
      {calendarFor && <SeasonalCalendar onClose={()=>setCalendarFor(null)} initialEthnic={calendarFor} dataByEthnic={calendarByEthnic} onChange={(k,d)=>setCalendarByEthnic(p=>({...p,[k]:d}))}/>}
      
      {showKnowledge && <IndigenousKnowledge onClose={()=>setShowKnowledge(false)} data={knowledgeData} onChange={setKnowledgeData}/>}
      
      {pendingAnnotation && <AnnotationModal coords={pendingAnnotation.coords} loai={pendingAnnotation.loai} onSave={saveAnnotation} onCancel={()=>setPendingAnnotation(null)}/>}
      <Earth3DModal open={earth3d.open} onClose={() => setEarth3d(s => ({ ...s, open: false }))} center={earth3d.center} zoom={earth3d.zoom} overlay={earth3d.overlay} raster={earth3d.raster} vectors={earth3d.vectors} />
      <MapComposer
  hidden={!showMapComposer || !!editingLayer}
  onClose={() => setShowMapComposer(false)}
  mapSnapshot={composerSnapshot?.image}
  syncSnapshot={composerSnapshot}
  onRequestSync={syncToComposer}
  syncPending={syncPending}
  onFrameAspect={setMapFrameAspect}
  onOpenLayerEditor={() => {
    const candidates = Array.from(activeLayers);
    const isEditable = (id: string) => allEditableLayers.has(id) && !!layerDisplayAll[id];
    const preferred = editingLayer && isEditable(editingLayer) ? editingLayer : candidates.find(isEditable);
    if (!preferred) {
      alert("Hãy bật một lớp có thể biên tập trước (Thủy lợi, Rừng, Cây thuốc, Luật tục, mô hình VAC hoặc lớp tự tạo).");
      return;
    }
    cancelDraw();
    setEditingLayer(preferred);
    setShowMapComposer(true);
    setShowLayers(false);
  }}
/>

      {editingLayer && layerDisplayAll[editingLayer] && (
       <LayerDataEditor
          layerId={editingLayer}
          layerName={layerDisplayAll[editingLayer].name}
          layerColor={layerDisplayAll[editingLayer].color}
          onRenameLayer={name => renameLayer(editingLayer, name)}
          features={editingLayerFeatures}
          geomType={layerGeomAll[editingLayer]}
          dragMode={layerDragMode === editingLayer}
          onToggleDrag={() => setLayerDragMode(prev => prev === editingLayer ? null : editingLayer)}
          onAdd={f => addLayerFeature(editingLayer, f)}
          onUpdate={(idx, f) => updateLayerFeature(editingLayer, idx, f)}
          onDelete={idx => deleteLayerFeature(editingLayer, idx)}
          onClose={() => { setEditingLayer(null); setLayerDragMode(null); pickPointCbRef.current = null; setPickingPoint(false); cancelDraw(); }}
          mapCenter={mapCenter}
          onFlyTo={(lat, lng) => mapRef.current?.flyTo([lat, lng], 13, { duration: 1.2 })}
          onPickPoint={cb => { cancelDraw(); pickPointCbRef.current = cb; setPickingPoint(true); }}
          onDrawGeom={startDrawGeom}
          hidden={pickingPoint || drawMode !== null}
        />
      )}

      {(pickingPoint || (editingLayer && drawMode)) && (
        <div className="pick-point-banner">
          <span>{pickingPoint ? "📍 Click vào vị trí mong muốn trên bản đồ để chọn tọa độ" : "✏️ Đang vẽ hình — click để thêm đỉnh, double-click để kết thúc"}</span>
          <button className="pick-point-cancel" onClick={() => { if (pickingPoint) { pickPointCbRef.current = null; setPickingPoint(false); } else { cancelDraw(); } }}>✕ Hủy</button>
        </div>
      )}

           {editingRecipe && (() => {
        const {ethId, topicIdx, data} = editingRecipe;
        return (
          <div className="annotation-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditingRecipe(null); }}>
            <div className="annotation-modal">
              <div className="ann-modal-header">
                <span>Thêm bài thuốc / kỹ thuật</span>
                <button className="modal-close" onClick={() => setEditingRecipe(null)}>✕</button>
              </div>
              <div className="ann-modal-body">
                <div className="ann-field">
                  <label>Tên bài thuốc / kỹ thuật *</label>
                  <input
                    className="ann-input"
                    value={data.ten}
                    onChange={e => setEditingRecipe(r => r ? {...r, data: {...r.data, ten: e.target.value}} : r)}
                    placeholder="VD: Thuốc chữa đau lưng, Kỹ thuật ủ phân..."
                  />
                </div>
                <div className="ann-field">
                  <label>Nguyên liệu / Vật liệu</label>
                  <textarea
                    className="ann-textarea"
                    value={data.nguyen_lieu}
                    onChange={e => setEditingRecipe(r => r ? {...r, data: {...r.data, nguyen_lieu: e.target.value}} : r)}
                    placeholder="Liệt kê nguyên liệu, cây cỏ, dụng cụ..."
                    rows={2}
                  />
                </div>
                <div className="ann-field">
                  <label>Công dụng / Cách dùng</label>
                  <textarea
                    className="ann-textarea"
                    value={data.cong_dung}
                    onChange={e => setEditingRecipe(r => r ? {...r, data: {...r.data, cong_dung: e.target.value}} : r)}
                    placeholder="Mô tả công dụng và cách sử dụng..."
                    rows={2}
                  />
                </div>
                <div className="ann-actions">
                  <button className="ann-btn-cancel" onClick={() => setEditingRecipe(null)}>Hủy</button>
                  <button
                    className="ann-btn-save"
                    disabled={!data.ten.trim()}
                    onClick={() => {
                      const triList = getTriThuc(ethId);
                      const recs = [...triList[topicIdx].bai_thuoc, {
                        ten: data.ten,
                        nguyen_lieu: data.nguyen_lieu,
                        cong_dung: data.cong_dung
                      }];
                      updateBaiThuoc(ethId, topicIdx, recs);
                      setEditingRecipe(null);
                    }}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

       {editingWardComposition && (
  <WardEthnicEditorModal
    ward={{
      ...editingWardComposition,
      // 🔥 Ưu tiên lấy từ override nếu đã từng sửa, nếu chưa mới lấy từ dữ liệu gốc
      dan_toc: wardOverrides.get(editingWardComposition.ma_xa)?.dan_toc ?? editingWardComposition.dan_toc ?? []
    }}
    ethnicGroups={ethnicEditorOptions}
    initialColors={ethnicColorMap}
    onSave={(composition, colors) => saveWardComposition(editingWardComposition.ma_xa, composition, colors)}
    onClose={() => setEditingWardComposition(null)}
  />
)}
      {editingWardStyle && (
  <WardStyleEditorModal
    ward={{ ma_xa: editingWardStyle.ma_xa, ten_xa: editingWardStyle.ten_xa }}
    initialValue={wardOverrides.get(editingWardStyle.ma_xa) || {}}
    defaultStyle={getLayerSymbology("ward_boundaries")}
    onClose={() => setEditingWardStyle(null)}
    onSave={saveWardStyle}
    onReset={resetWardStyle}
  />
)}

      {showPieSelectorModal && showPieSelector && (
        <WardPieSelector
          wards={pieSelectableWards}
          selected={pieWardSelection}
          onChange={(newSelected) => setPieWardSelection(newSelected)}
          onClose={() => setShowPieSelectorModal(false)}
        />
      )}

      {editingSymbologyLayer && (
        <LayerSymbologyEditorModal
          open
          layerId={editingSymbologyLayer}
          layerName={layerDisplayAll[editingSymbologyLayer]?.name}
          initialValue={getLayerSymbology(editingSymbologyLayer)}
          onClose={() => setEditingSymbologyLayer(null)}
          onSave={saveLayerSymbology}
        />
      )}

      {pdfViewer && (
        <div className="pdf-viewer-overlay" onClick={e => { if (e.target === e.currentTarget) setPdfViewer(null); }}>
          <div className="pdf-viewer-modal">
            <div className="pdf-viewer-header">
              <span className="pdf-viewer-title">{pdfViewer.name}</span>
              <button className="modal-close" onClick={() => setPdfViewer(null)}>✕</button>
            </div>
            <iframe src={pdfViewer.url} className="pdf-viewer-iframe" title={pdfViewer.name} />
          </div>
        </div>
      )}
    </div>
  );
}
