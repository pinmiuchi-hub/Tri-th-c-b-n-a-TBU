import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EditableValue from "../components/EditableValue";
import ImportModal, { type WardOverrides, type EthnicOverride, type PdfFile, type DanTocTyLe } from "../components/ImportModal";
import LayerControl, { type NewLayerInput } from "../components/LayerControl goc";
import TransectDiagram, { DEFAULT_ZONES_BY_ETHNIC, DEFAULT_ETHNIC_ZONES, type TransectZone, type EthnicZone } from "../components/TransectDiagram";
import SeasonalCalendar, { DEFAULT_ACTIVITIES_BY_ETHNIC, type CalendarGroup } from "../components/SeasonalCalendar";
import { toEthnicKey, type EthnicKey } from "../components/ethnicConfig";
import IndigenousKnowledge, { DEFAULT_KNOWLEDGE, type KnowledgeSection } from "../components/IndigenousKnowledge";
import AnnotationModal, { type Annotation } from "../components/AnnotationModal";
import LayerDataEditor from "../components/LayerDataEditor";
import LayerSymbologyEditorModal, { type LayerSymbologyConfig } from "../components/LayerSymbologyEditorModal"; import WardStyleEditorModal, { type WardStyleValue } from "../components/WardStyleEditorModal";
import WardPieSelector from "../components/WardPieSelector";
import WardEthnicEditorModal from "../components/WardEthnicEditorModal";
import Terrain3DModal from "../components/Terrain3DModal";
import MapComposer from '@/components/MapComposer';
import html2canvas from "html2canvas";
import { Printer } from 'lucide-react';

interface CustomLayer { id: string; categoryId: string; ten: string; mau: string; bieu_tuong: string; geomType: "point" | "line" | "polygon"; }
interface LayerCategoryState { id: string; ten: string; icon: string; layers: { id: string; ten: string; mau: string; bieu_tuong: string; iconOnly?: boolean }[]; }

/* ─── Types ─── */
interface WardProperties { ma_xa: string; ten_xa: string; loai?: string; dtich_km2?: number; dan_so?: number; matdo_km2?: number; ten_tinh?: string; dan_toc?: DanTocTyLe[]; }
interface GeoJsonData { type: string; features: { type: string; properties: Record<string, unknown>; geometry: unknown }[]; }
interface BaiThuoc { ten: string; nguyen_lieu: string; cong_dung: string; }
interface TriThuc { chu_de: string; bieu_tuong: string; noi_dung: string; bai_thuoc: BaiThuoc[]; }
interface DanTocInfo { id: string; ten: string; mau: string; dan_so_ca_nuoc: number; ngon_ngu: string; mo_ta: string; tri_thuc: TriThuc[]; anh?: string; nguon?: string[]; ghi_chu_nguon?: string; }
interface DanTocData { dan_toc: DanTocInfo[]; }
interface ProvinceStat { dien_tich: string; dan_so: string; don_vi: number; }
interface LayersData {
  rivers: { id?: string; ten: string; ten_dia_phuong: string; coords: number[][]; cap_song?: number; width?: number; trang_thai?: string; nguon?: string[] }[];
  irrigation: { id?: string; ten: string; ten_dia_phuong: string; loai: string; lat: number; lng: number; mo_ta: string; trang_thai?: string; nguon?: string[] }[];
  villages?: { id?: string; ten: string; dan_toc: string; lat: number; lng: number; mo_ta: string; trang_thai?: string; nguon?: string[] }[];
  forests: { id?: string; ten: string; ten_dia_phuong: string; loai: string; lat: number; lng: number; mo_ta: string; trang_thai?: string; nguon?: string[] }[];
  vac_models: { id?: string; ten: string; loai: string; lat: number; lng: number; mo_ta: string; thanh_phan: string[] | string; trang_thai?: string; nguon?: string[] }[];
  medicinal_plants: { id?: string; ten: string; ten_khoa_hoc: string; lat: number; lng: number; cong_dung: string; tinh_trang?: string; "tình_trang"?: string; dan_toc_dung: string[] | string; trang_thai?: string; nguon?: string[] }[];
  customary_zones: { id?: string; ten: string; loai: string; mo_ta: string; coords: number[][]; trang_thai?: string; nguon?: string[] }[];
}

/* ─── Constants ─── */
const PROVINCE_FILES: Record<string, string> = { "Sơn La": "/data/xa_sonla.geojson", "Điện Biên": "/data/xa_dienbien.geojson", "Lai Châu": "/data/xa_laichau.geojson", "Lào Cai": "/data/xa_laocai.geojson" };
const DEFAULT_STATS: Record<string, ProvinceStat> = { "Sơn La": { dien_tich: "14.174", dan_so: "1,25M", don_vi: 75 }, "Điện Biên": { dien_tich: "9.541", dan_so: "599K", don_vi: 45 }, "Lai Châu": { dien_tich: "9.068", dan_so: "460K", don_vi: 38 }, "Lào Cai": { dien_tich: "6.364", dan_so: "770K", don_vi: 99 } };
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
const LAYER_CONFIG_STORAGE_KEY = "webgis-layer-config";

// Cấu trúc lớp dữ liệu chuẩn hóa theo Atlat Quốc gia Việt Nam — Danh mục GEE
const DEFAULT_LAYER_CATEGORIES = [
  { id: "hydrology", ten: "03. Thủy văn & Tài nguyên nước", icon: "💧", layers: [
    { id: "irrigation", ten: "Thủy lợi truyền thống (Mương·Phai)", mau: "#74c69d", bieu_tuong: "🚿", iconOnly: true }, 
  ]},
  { id: "landcover", ten: "04. Lớp phủ & Sử dụng đất", icon: "🌾", layers: [
    { id: "vac_models", ten: "Mô hình VAC/VACR tuần hoàn", mau: "#b5e48c", bieu_tuong: "🏡", iconOnly: true },
  ]},
  { id: "forest", ten: "05. Rừng & Sinh thái", icon: "🌲", layers: [
    { id: "forests", ten: "Phân vùng rừng", mau: "#2d6a4f", bieu_tuong: "🌲", iconOnly: true },
    { id: "medicinal_plants", ten: "Khu vực cây thuốc quý", mau: "#e63946", bieu_tuong: "🌿", iconOnly: true },
  ]},
  { id: "socio", ten: "09. Kinh tế - Xã hội & Dân cư", icon: "🏘️", layers: [
    { id: "ward_boundaries", ten: "Ranh giới xã/phường", mau: "#6b4226", bieu_tuong: "🗺️" },
    { id: "population_density", ten: "Mật độ dân số", mau: "#2a9d8f", bieu_tuong: "📊" }
  ]},
  { id: "culture", ten: "Văn hóa & Tri thức bản địa", icon: "m", layers: [
    { id: "customary_zones", ten: "Ranh giới luật tục cộng đồng", mau: "#f4a261", bieu_tuong: "⚖️" },
  ]},
];
const EDITABLE_LAYERS = new Set(["irrigation", "forests", "vac_models", "medicinal_plants", "customary_zones"]);
const LAYER_GEOM_TYPE: Record<string, "point" | "line" | "polygon"> = {
  rivers: "line", irrigation: "point", forests: "point", vac_models: "point",
  medicinal_plants: "point", customary_zones: "polygon", population_density: "polygon",
};
const LAYER_DISPLAY: Record<string, { name: string; color: string }> = {
  population_density: { name: "Mật độ dân số", color: "#fe9929" },
  irrigation: { name: "Thủy lợi truyền thống", color: "#74c69d" },
  forests: { name: "Phân vùng rừng", color: "#2d6a4f" },
  vac_models: { name: "Mô hình VAC/VACR", color: "#b5e48c" },
  medicinal_plants: { name: "Cây thuốc quý", color: "#e63946" },
  customary_zones: { name: "Luật tục cộng đồng", color: "#f4a261" },
};

const FOREST_COLORS: Record<string, string> = { rung_thieng: "#1b4332", rung_ma: "#7209b7", rung_dau_nguon: "#023e8a", rung_trong: "#52b788", rung_tu_nhien: "#2d6a4f", rung_dac_san: "#b7791f", rung_ma_lang: "#7209b7", rung_kieng: "#9d0208" };
const FOREST_LABELS: Record<string, string> = { rung_thieng: "Rừng thiêng", rung_ma: "Rừng ma", rung_dau_nguon: "Rừng đầu nguồn", rung_trong: "Rừng trồng", rung_tu_nhien: "Rừng tự nhiên", rung_dac_san: "Rừng đặc sản", rung_ma_lang: "Rừng ma làng", rung_kieng: "Rừng kiêng" };
const IRRIGATION_LABELS: Record<string, string> = { phai: "Phai (đập)", muong: "Mương (kênh)", lin: "Lịn (máng)", lai: "Lái (kênh phụ)" };
const ETHNIC_COLORS: Record<string, string> = { thai: "#2d6a4f", mong: "#b5179e", dao: "#f4a261", kho_mu: "#6d6875", muong: "#e76f51", la_hu: "#457b9d", lu: "#2a9d8f", mang: "#8338ec", kinh: "#e63946", tay: "#1d3557", giay: "#06a77d", ha_nhi: "#a4243b", nung: "#5a189a", phu_la: "#ff8c42", la_chi: "#ffc857" };
const VIETNAMESE_ETHNIC_NAMES = [
  "Ba Na", "Bố Y", "Brâu", "Bru-Vân Kiều", "Chăm", "Chơ Ro", "Chu Ru", "Chứt", "Co", "Cống", "Cơ Ho", "Cơ Lao", "Cơ Tu", "Dao", "Ê Đê", "Gia Rai", "Giáy", "Giẻ-Triêng", "Hà Nhì", "Hrê", "Kháng", "Khmer", "Khơ Mú", "Kinh", "La Chí", "La Ha", "La Hủ", "Lào", "Lự", "Lô Lô", "Mạ", "Mảng", "M'Nông", "Mông", "Mường", "Ngái", "Nùng", "Ơ Đu", "Pà Thẻn", "Phù Lá", "Pu Péo", "Ra Glai", "Rơ Măm", "Sán Chay", "Sán Dìu", "Si La", "Tà Ôi", "Tày", "Thái", "Thổ", "Xinh Mun", "Xơ Đăng", "Xtiêng", "Cao Lan (nhánh Sán Chay)"
];
const EXTRA_ETHNIC_COLORS = ["#2d6a4f", "#b5179e", "#f4a261", "#6d6875", "#e76f51", "#457b9d", "#2a9d8f", "#8338ec", "#e63946", "#1d3557"];
const slugEthnicName = (name: string) => `ethnic_${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase()}`;
const EXTRA_ETHNIC_OPTIONS = VIETNAMESE_ETHNIC_NAMES.map((name, index) => ({ id: slugEthnicName(name), ten: `Dân tộc ${name}`, mau: EXTRA_ETHNIC_COLORS[index % EXTRA_ETHNIC_COLORS.length] }));
const DENSITY_COLORS = ["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404"];
const DENSITY_LABELS = ["< 50", "50–100", "100–200", "200–500", "500–1000", "1000–2000", "> 2000"];
const MAP_SCALE_OPTIONS = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
const scaleFromZoom = (lat: number, zoom: number) => Math.round((156543.03 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom)) * 3779.52);
const zoomFromScale = (scale: number, lat: number) => Math.max(1, Math.min(19, Math.log2((156543.03 * Math.cos(lat * Math.PI / 180) * 3779.52) / scale)));
const DEFAULT_LAYER_SYMBOLOGY: Record<string, LayerSymbologyConfig> = {
  province_boundaries: { title: "Ranh giới tỉnh", symbolType: "polygon", color: "#3c5b45", fillColor: "#f3efe9", lineWeight: 1.2, opacity: 0.9, fillOpacity: 0.02, dashArray: "", classes: [] },
  ward_boundaries: { title: "Ranh giới xã/phường", symbolType: "line", color: "#345b41", fillColor: "#f7f6f3", lineWeight: 1.0, opacity: 0.9, fillOpacity: 0.01, dashArray: "", classes: [] },
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
  irrigation: { title: "Thủy lợi truyền thống", symbolType: "point", color: "#74c69d", fillColor: "#74c69d", lineWeight: 1.4, opacity: 0.95, fillOpacity: 0.95, dashArray: "", classes: [] },
  forests: { title: "Phân vùng rừng", symbolType: "point", color: "#2d6a4f", fillColor: "#2d6a4f", lineWeight: 1.3, opacity: 0.95, fillOpacity: 0.95, dashArray: "", classes: [] },
  vac_models: { title: "Mô hình VAC/VACR", symbolType: "point", color: "#40916c", fillColor: "#40916c", lineWeight: 1.3, opacity: 0.95, fillOpacity: 0.95, dashArray: "", classes: [] },
  medicinal_plants: { title: "Cây thuốc quý", symbolType: "point", color: "#e63946", fillColor: "#e63946", lineWeight: 1.3, opacity: 0.95, fillOpacity: 0.95, dashArray: "", classes: [] },
  customary_zones: { title: "Luật tục cộng đồng", symbolType: "polygon", color: "#f4a261", fillColor: "#f4a261", lineWeight: 1.5, opacity: 0.85, fillOpacity: 0.16, dashArray: "6,4", classes: [] },
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

  return L.divIcon({ 
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size*0.5}px;border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 6px rgba(0,0,0,0.4);overflow:hidden">${inner}</div>`, 
    className: "", 
    iconSize: [size,size], 
    iconAnchor: [size/2,size/2] 
  });
}

const toArr = (v: string[] | string | undefined): string[] => Array.isArray(v) ? v : (typeof v === "string" && v.trim() ? v.split(",").map(s => s.trim()) : []);

const ETHNIC_DATA_LS_KEY = "webgis-ethnic-data-v1";
type SavedEthnicData = { calendar?: Partial<Record<EthnicKey, CalendarGroup[]>>; transect?: Partial<Record<EthnicKey, TransectZone[]>>; ethnicZones?: EthnicZone[] };
const loadEthnicData = (): SavedEthnicData | null => {
  try { const raw = window.localStorage.getItem(ETHNIC_DATA_LS_KEY); return raw ? JSON.parse(raw) as SavedEthnicData : null; } catch { return null; }
};
const savedEthnicData = loadEthnicData();
const statusNote = (x: { trang_thai?: string; nguon?: string[] } | null | undefined): string => {
  if (!x?.trang_thai) return "";
  const msg = x.trang_thai === "minh_hoa" ? "⚠ Dữ liệu minh họa — chưa có nguồn xác minh, không dùng làm căn cứ"
    : x.trang_thai === "chua_xac_minh" ? "ⓘ Chưa có nguồn đính kèm — cần xác minh thực địa"
    : "ⓘ Một phần có nguồn — xem ghi chú nguồn";
  const color = x.trang_thai === "minh_hoa" ? "#b45309" : "#64748b";
  const src = x.nguon && x.nguon.length ? `<p style="margin:4px 0 0;font-size:10px;color:#64748b">Nguồn: ${x.nguon.join("; ")}</p>` : "";
  return `<p style="margin:6px 0 0;font-size:11px;color:${color}">${msg}</p>${src}`;
};

export default function WebGIS() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const provincesLayerRef = useRef<L.GeoJSON | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
  const densityLayerRef = useRef<L.GeoJSON | null>(null);
  const pieChartLayerRef = useRef<L.LayerGroup | null>(null);
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

  /* ─── Core state ─── */
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [selectedWardIds, setSelectedWardIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"province"|"ward">("province");
  const [danTocData, setDanTocData] = useState<DanTocData | null>(null);
  const [selectedDanToc, setSelectedDanToc] = useState<DanTocInfo | null>(null);
  const [activeTriThuc, setActiveTriThuc] = useState(0);
  const [layersData, setLayersData] = useState<LayersData | null>(null);
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

  /* ─── Added missing states to resolve ts(2304) errors ─── */
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [trashEntries, setTrashEntries] = useState<any[]>([]);
  const lastDeletedRef = useRef<any>(null);
  const [customCategoryIds, setCustomCategoryIds] = useState<string[]>([]);
  const [showSpatialAnalysis, setShowSpatialAnalysis] = useState(false);
  const [analysisType, setAnalysisType] = useState<"buffer" | "intersect" | "ward">("buffer");
  const [analysisLayerA, setAnalysisLayerA] = useState("");
  const [analysisLayerB, setAnalysisLayerB] = useState("");
  const [bufferDistance, setBufferDistance] = useState(500);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showAddEthnicModal, setShowAddEthnicModal] = useState(false);

  /* ─── Mock functions for missing logic referenced in UI ─── */
  const restoreTrashEntry = useCallback((entry: any) => {}, []);
  const deleteLayer = useCallback((id: string) => {}, []);
  const addCategory = useCallback((name: string) => {}, []);
  const deleteCategory = useCallback((id: string) => {}, []);
  const clearSpatialAnalysis = useCallback(() => {}, []);
  const runSpatialAnalysis = useCallback(() => {}, []);

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

  /* ─── Editable data state ─── */
  const [wardOverrides, setWardOverrides] = useState<Map<string,WardOverrides>>(new Map());
  const [ethnicOverrides, setEthnicOverrides] = useState<Map<string,EthnicOverride>>(new Map());
  const [triThucOverrides, setTriThucOverrides] = useState<Map<string,TriThuc[]>>(new Map());
  const [provinceEdits, setProvinceEdits] = useState<Map<string,Partial<ProvinceStat>>>(new Map());
  const [pdfFiles, setPdfFiles] = useState<Map<string,PdfFile[]>>(new Map());
  const [calendarByEthnic, setCalendarByEthnic] = useState<Record<EthnicKey, CalendarGroup[]>>({ ...DEFAULT_ACTIVITIES_BY_ETHNIC, ...(savedEthnicData?.calendar ?? {}) });
  const [transectByEthnic, setTransectByEthnic] = useState<Record<EthnicKey, TransectZone[]>>({ ...DEFAULT_ZONES_BY_ETHNIC, ...(savedEthnicData?.transect ?? {}) });
  const [transectEthnic, setTransectEthnic] = useState<EthnicZone[]>(savedEthnicData?.ethnicZones ?? DEFAULT_ETHNIC_ZONES);
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeSection[]>(DEFAULT_KNOWLEDGE);
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
      return Array.isArray(saved?.layerCategories)
        ? (saved.layerCategories as LayerCategoryState[]).map(category => ({
            ...category,
            layers: category.layers.filter(layer => layer.id !== "rivers"),
          }))
        : defaults;
    } catch { return defaults; }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LAYER_CONFIG_STORAGE_KEY, JSON.stringify({ customLayers, layerCategories }));
    } catch { /* Ignore storage quota or privacy errors. */ }
  }, [customLayers, layerCategories]);

  /* ─── UI state ─── */
  const [showImport, setShowImport] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showThematic, setShowThematic] = useState(false);
  const [activeRaster, setActiveRaster] = useState<string | null>(null);
  const [showTerrain3D, setShowTerrain3D] = useState(false);
  const [rasterOpacity, setRasterOpacity] = useState(0.65);
  const [rasterMeta, setRasterMeta] = useState<{ bounds: [[number,number],[number,number]]; layers: Record<string, { file: string; unit: string; label: string; source: string; stops: any }> } | null>(null);
  const [transectFor, setTransectFor] = useState<EthnicKey | null>(null);
  const [calendarFor, setCalendarFor] = useState<EthnicKey | null>(null);
  // Tự động lưu lược đồ mặt cắt & nông lịch theo dân tộc vào localStorage
  useEffect(() => {
    const t = window.setTimeout(() => {
      try { window.localStorage.setItem(ETHNIC_DATA_LS_KEY, JSON.stringify({ calendar: calendarByEthnic, transect: transectByEthnic, ethnicZones: transectEthnic })); } catch { /* bỏ qua lỗi dung lượng */ }
    }, 600);
    return () => window.clearTimeout(t);
  }, [calendarByEthnic, transectByEthnic, transectEthnic]);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showPieSelector, setShowPieSelector] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set());
  const [layerSymbologies, setLayerSymbologies] = useState<Record<string, LayerSymbologyConfig>>(DEFAULT_LAYER_SYMBOLOGY);
  const [editingSymbologyLayer, setEditingSymbologyLayer] = useState<string | null>(null);
  const [pdfViewer, setPdfViewer] = useState<PdfFile | null>(null);
  const [editingEthnicPct, setEditingEthnicPct] = useState<string|null>(null);
  const [editingLayer, setEditingLayer] = useState<string | null>(null); const [composerSnapshot, setComposerSnapshot] = useState<any>(null);
const [showMapComposer, setShowMapComposer] = useState(false);
const [syncPending, setSyncPending] = useState(false);
  const [pieWardSelection, setPieWardSelection] = useState<Set<string>>(new Set());
  const [editingWardComposition, setEditingWardComposition] = useState<WardProperties | null>(null); const [editingWardStyle, setEditingWardStyle] = useState<WardProperties | null>(null);
  const [currentProvinceGeoJson, setCurrentProvinceGeoJson] = useState<GeoJsonData | null>(null);
  const [layerDragMode, setLayerDragMode] = useState<string | null>(null);
const [showPieSelectorModal, setShowPieSelectorModal] = useState(false);
  
  const pickPointCbRef = useRef<((lat: number, lng: number) => void) | null>(null);
  const [pickingPoint, setPickingPoint] = useState(false);
  
  const ethnicPhotoInputRef = useRef<HTMLInputElement>(null);
  const ethnicPhotoTargetRef = useRef<string | null>(null);
  const [ethnicPhotoLightbox, setEthnicPhotoLightbox] = useState<string | null>(null);

  /* ─── Annotation state ─── */
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
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
      setLayersData(prev => ({ ...(prev || fallback), rivers } as LayersData));
    };

    fetch(BASE_PATH+"/data/dan_toc.json").then(r=>r.json()).then(setDanTocData).catch(console.error);
    fetch(BASE_PATH+"/data/raster/meta.json").then(r=>r.json()).then(setRasterMeta).catch(console.error);
    fetch(BASE_PATH+"/data/tinh.geojson").then(r=>r.json()).then((g: GeoJSON.FeatureCollection) => {
      provinceMaskGeomRef.current = g;
      maskedRasterCacheRef.current.clear();
    }).catch(console.error);
    fetch(BASE_PATH+"/data/layers.json").then(r=>r.json()).then((d: any) => {
      if (d.medicinal_plants) {
        d.medicinal_plants = d.medicinal_plants.map((p: any) => {
          const { ["tình_trang"]: tt, ...rest } = p;
          return tt && !rest.tinh_trang ? { ...rest, tinh_trang: tt } : rest;
        });
      }
      setLayersData(d);
      loadStandardHydrography(d).catch(error => console.warn("Using local hydrography fallback:", error));
    }).catch(console.error);
  }, []);

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
        m.bindPopup(popupHtml);
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
          ls.push(casing, line);
        });
      } else if (id === "irrigation") {
        const layerStyle = getLayerSymbology("irrigation");
        layersData.irrigation.forEach((ir, idx) => {
          const emoji = ir.loai==="phai"?"💧":ir.loai==="lin"?"〰️":"🚿";
          const popup = `<div class="map-popup"><div class="popup-title">${ir.ten}</div><div class="popup-sub">${IRRIGATION_LABELS[ir.loai]||ir.loai} · <i>${ir.ten_dia_phuong||""}</i></div><p>${ir.mo_ta||""}</p>${statusNote(ir)}</div>`;
ls.push(makeDraggableMarker(ir.lat, ir.lng, makeDivIcon(emoji,layerStyle.color, 24, true), "irrigation", idx, popup));        });
      } else if (id === "forests") {
  const layerStyle = getLayerSymbology("forests");
        layersData.forests.forEach((f, idx) => {
          const color = FOREST_COLORS[f.loai]||"#2d6a4f";
          const popup = `<div class="map-popup"><div class="popup-title">${f.ten}</div><div class="popup-sub" style="color:${color}">${FOREST_LABELS[f.loai]||f.loai} · <i>${f.ten_dia_phuong||""}</i></div><p>${f.mo_ta||""}</p>${statusNote(f)}</div>`;
ls.push(makeDraggableMarker(f.lat, f.lng, makeDivIcon("🌲",layerStyle.color,26,true), "forests", idx, popup));        });
      } else if (id === "vac_models") {
  const layerStyle = getLayerSymbology("vac_models");
        layersData.vac_models.forEach((v, idx) => {
          const tp = toArr(v.thanh_phan);
          const popup = `<div class="map-popup"><div class="popup-title">${v.ten}</div><div class="popup-sub">Mô hình ${(v.loai||"").toUpperCase()}</div><p>${v.mo_ta||""}</p>${tp.length?`<ul>${tp.map(p=>`<li>${p}</li>`).join("")}</ul>`:""}${statusNote(v)}</div>`;
ls.push(makeDraggableMarker(v.lat, v.lng, makeDivIcon("♻️",layerStyle.color,26,true), "vac_models", idx, popup));        });
      } else if (id === "medicinal_plants") {
  const layerStyle = getLayerSymbology("medicinal_plants");
        layersData.medicinal_plants.forEach((p, idx) => {
          const tinh_trang = p.tinh_trang || (p as any)["tình_trang"] || "";
          const tinhTrangColor = tinh_trang.toLowerCase().includes("rất") || tinh_trang.toLowerCase().includes("nguy")?"#e63946":tinh_trang.toLowerCase().includes("hiem")||tinh_trang.toLowerCase().includes("hiếm")?"#f4a261":"#52b788";
          const popup = `<div class="map-popup"><div class="popup-title">${p.ten}</div><div class="popup-sub" style="font-style:italic">${p.ten_khoa_hoc||""}</div><p><b>Công dụng:</b> ${p.cong_dung||""}</p>${tinh_trang?`<p><b>Tình trạng:</b> <span style="color:${tinhTrangColor}">${tinh_trang}</span></p>`:""}${statusNote(p)}</div>`;
ls.push(makeDraggableMarker(p.lat, p.lng, makeDivIcon("🌿",layerStyle.color,26,true), "medicinal_plants", idx, popup));        });
      } else if (id === "customary_zones") {
        layersData.customary_zones.forEach(z => {
          const coords = (z.coords && Array.isArray(z.coords[0]) && Array.isArray((z.coords[0] as any)[0])) ? (z.coords as any)[0] : z.coords;
          if (!coords || coords.length < 3) return;
          const poly = L.polygon(coords.map(([lng,lat]: [number,number])=>[lat,lng] as L.LatLngExpression), {color:"#f4a261",weight:2,opacity:0.8,fillColor:"#f4a261",fillOpacity:0.12,dashArray:"6,4"});
          poly.bindPopup(`<div class="map-popup"><div class="popup-title">${z.ten}</div><div class="popup-sub">Luật tục: ${(z.loai||"").replace(/_/g," ")}</div><p>${z.mo_ta||""}</p>${statusNote(z)}</div>`);
          ls.push(poly);
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
              poly.bindPopup(`<div class="map-popup"><div class="popup-title">${f.ten || ""}</div>${f.mo_ta ? `<p>${f.mo_ta}</p>` : ""}</div>`);
              ls.push(poly);
            });
          }
        }
      } else if (id === "ward_boundaries" && allWardsGeoJson) {
        const wardStyle = layerSymbologies.ward_boundaries || DEFAULT_LAYER_SYMBOLOGY.ward_boundaries;
        const layer = L.geoJSON(allWardsGeoJson as GeoJSON.FeatureCollection, {
          style: () => ({ color: wardStyle.color, weight: wardStyle.lineWeight, opacity: wardStyle.opacity, fillColor: wardStyle.fillColor, fillOpacity: wardStyle.fillOpacity }),
          onEachFeature: (feat, lyr) => {
            const p = feat.properties as any;
            lyr.bindTooltip(`<div class="ward-tooltip"><b>${p.ten_xa}</b><br><span style="opacity:0.7">${p.ten_tinh||""}</span></div>`, { sticky: true, className: "custom-tooltip ward-tip" });
            (lyr as L.Path).on({
              mouseover: e => {
                if (selectedAreaOnlyRef.current && selectedWard && p.ma_xa !== selectedWard.ma_xa) return;
                (e.target as L.Path).setStyle({ fillOpacity: Math.min(0.24, wardStyle.fillOpacity + 0.18), color: "#3d1f0d", weight: wardStyle.lineWeight + 0.8 });
              },
              mouseout: e => { (e.target as L.Path).setStyle({ fillOpacity: wardStyle.fillOpacity, color: wardStyle.color, weight: wardStyle.lineWeight }); },
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
  }, [layersData, activeLayers, layerDragMode, allWardsGeoJson, customLayers, layerSymbologies]);

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

  /* ─── Ward ethnic pie-chart markers ─── */
  useEffect(() => {
    const overlayGroup = overlayGroupRef.current;
    if (!overlayGroup) return;
    if (pieChartLayerRef.current) {
      overlayGroup.removeLayer(pieChartLayerRef.current);
      pieChartLayerRef.current = null;
    }
    if (!showPieSelector || viewMode !== "ward" || pieWardSelection.size === 0 || !currentProvinceGeoJson) return;

    const group = L.layerGroup();
    group.addTo(overlayGroup);
    pieChartLayerRef.current = group;

    const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
      const start = [cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle)];
      const end = [cx + r * Math.cos(endAngle), cy + r * Math.sin(endAngle)];
      const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
      return `M ${cx} ${cy} L ${start[0]} ${start[1]} A ${r} ${r} 0 ${largeArcFlag} 1 ${end[0]} ${end[1]} Z`;
    };

    currentProvinceGeoJson.features.forEach(feature => {
      const props = feature.properties as unknown as WardProperties;
      if (!pieWardSelection.has(props.ma_xa)) return;
      const wardData = { ...props } as WardProperties;
      const composition = (wardOverrides.get(wardData.ma_xa)?.dan_toc ?? wardData.dan_toc ?? []).slice().sort((a,b) => b.ty_le - a.ty_le);
      const total = composition.reduce((sum, item) => sum + item.ty_le, 0);
      const safeSlices = composition.filter(item => item.ty_le > 0);
      const geoLayer = L.geoJSON(feature as GeoJSON.Feature);
      const center = geoLayer.getBounds().getCenter();
      geoLayer.remove();

      const size = 74;
      const radius = 28;
      const centerX = size / 2;
      const centerY = size / 2;
      const stroke = "#ffffff";
      let startAngle = -Math.PI / 2;
      const paths = safeSlices.length > 0 ? safeSlices.map(item => {
        const info = getDanTocInfo(item.dan_toc);
        const pct = total > 0 ? (item.ty_le / total) * 100 : 0;
        const endAngle = startAngle + (pct / 100) * Math.PI * 2;
        const path = `<path d="${describeArc(centerX, centerY, radius, startAngle, endAngle)}" fill="${info?.mau || "#94a3b8"}" stroke="${stroke}" stroke-width="2"></path>`;
        startAngle = endAngle;
        return path;
      }).join("") : `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#e2e8f0" stroke="${stroke}" stroke-width="2"></circle>`;
      const tooltipContent = safeSlices.length > 0 ? `<div class="ward-tooltip"><b>${props.ten_xa}</b><br/>${safeSlices.map(item => {
        const info = getDanTocInfo(item.dan_toc);
        return `${info?.ten.replace("Dân tộc ", "").replace("Người ", "")}: ${item.ty_le}%`;
      }).join("<br/>")}</div>` : `<div class="ward-tooltip"><b>${props.ten_xa}</b><br/>Chưa có dữ liệu dân tộc</div>`;
      const icon = L.divIcon({
        html: `<div class="pie-chart-marker" title="${props.ten_xa}"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${paths}<circle cx="${centerX}" cy="${centerY}" r="${radius * 0.58}" fill="#ffffff" opacity="0.92"></circle><circle cx="${centerX}" cy="${centerY}" r="${radius * 0.56}" fill="rgba(15,31,15,0.95)"></circle></svg></div>`,
        className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([center.lat, center.lng], { icon, zIndexOffset: 1000 });
      marker.bindTooltip(tooltipContent, { sticky: true, className: "custom-tooltip ward-tip" });
      marker.on("click", () => {
        setSelectedWard(wardData);
        setSelectedDanToc(null);
        setActiveTriThuc(0);
        setEditingEthnicPct(null);
        setEditingWardComposition(wardData);
      });
      marker.addTo(group);
    });

    return () => {
      if (pieChartLayerRef.current) {
        overlayGroup.removeLayer(pieChartLayerRef.current);
        pieChartLayerRef.current = null;
      }
    };
  }, [showPieSelector, currentProvinceGeoJson, pieWardSelection, viewMode, wardOverrides, ethnicOverrides, danTocData]);

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
        m.bindPopup(`<div class="map-popup"><div class="popup-title">${ann.ten}</div><div class="popup-sub">${ann.ngay}</div><p>${ann.mo_ta||""}</p></div>`);
        ag.addLayer(m);
      } else if (ann.loai === "duong" && ann.coords.length >= 2) {
        const line = L.polyline(ann.coords, {color:ann.mau,weight:3});
        line.bindPopup(`<div class="map-popup"><div class="popup-title">${ann.ten}</div><p>${ann.mo_ta||""}</p></div>`);
        ag.addLayer(line);
      } else if (ann.loai === "vung" && ann.coords.length >= 3) {
        const poly = L.polygon(ann.coords, {color:ann.mau,weight:2,fillColor:ann.mau,fillOpacity:0.2});
        poly.bindPopup(`<div class="map-popup"><div class="popup-title">${ann.ten}</div><p>${ann.mo_ta||""}</p></div>`);
        ag.addLayer(poly);
      }
    });
  }, [annotations]);

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
        setPendingAnnotation({coords, loai: drawMode as "duong"|"vung"});
        setDrawMode(null);
      }
    };

    map.on("click", onClick);
    map.on("dblclick", onDblClick);
    return () => {
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
  const getWardMapStyle = (p: WardProperties, baseStyle: LayerSymbologyConfig) => {
  const ov = wardOverrides.get(p.ma_xa);
  const currentZoom = mapRef.current?.getZoom() ?? 7; // 🟢 Thêm dòng này để lấy zoom hiện tại của bản đồ
  return {
    color: (ov?.mau_vien as string) ?? baseStyle.color,
    weight: (ov?.do_day_vien as number) ?? baseStyle.lineWeight,
    opacity: (ov?.do_dam_vien as number) ?? baseStyle.opacity,
    fillColor: (ov?.mau_vung as string) ?? baseStyle.fillColor,
    fillOpacity: (ov?.do_dam_vung as number) ?? baseStyle.fillOpacity,
    dashArray: getZoomAwareDashArray(baseStyle.dashArray, currentZoom), // Bây giờ currentZoom đã có dữ liệu
  };
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
    wardsLayerRef.current.setStyle((feat) => {
      const ward = feat!.properties as unknown as WardProperties;
      const style = getWardMapStyle(ward, wardStyle);
      return selectedAreaOnly && selectedWardIds.size > 0 && !selectedWardIds.has(ward.ma_xa)
        ? { ...style, opacity: 0, fillOpacity: 0 }
        : style;
    });
  }
};
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
  const cancelDraw = () => { setDrawMode(null); if(drawingPolylineRef.current&&mapRef.current){mapRef.current.removeLayer(drawingPolylineRef.current);drawingPolylineRef.current=null;} };

  /* ─── Layer data CRUD ─── */
  const addLayerFeature = (layerId: string, feature: any) => {
    setLayersData(prev => { if (!prev) return prev; const next = { ...prev } as any; next[layerId] = [...(next[layerId] || []), feature]; return next; });
  };
  const updateLayerFeature = (layerId: string, idx: number, feature: any) => {
    setLayersData(prev => { if (!prev) return prev; const next = { ...prev } as any; const arr = [...next[layerId]]; arr[idx] = feature; next[layerId] = arr; return next; });
  };
  const deleteLayerFeature = (layerId: string, idx: number) => {
    setLayersData(prev => { if (!prev) return prev; const next = { ...prev } as any; next[layerId] = next[layerId].filter((_: any, i: number) => i !== idx); return next; });
  };

  /* ─── Custom layer CRUD ─── */
  const addCustomLayer = (categoryId: string, input: NewLayerInput) => {
    const id = "custom_" + Math.random().toString(36).slice(2, 9);
    const cl: CustomLayer = { id, categoryId, ten: input.ten, mau: input.mau, bieu_tuong: input.bieu_tuong, geomType: input.geomType };
    setCustomLayers(prev => [...prev, cl]);
    setLayersData(prev => ({ ...(prev || {} as LayersData), [id]: [] } as LayersData));
    setActiveLayers(prev => new Set([...prev, id]));
  };
  const addLayerCategory = (ten: string, icon: string) => {
  const id = "group_" + Math.random().toString(36).slice(2, 9);
  setLayerCategories(prev => [...prev, { id, ten, icon, layers: [] }]);
};

const deleteLayerCategory = (categoryId: string) => {
  const cat = layerCategories.find(c => c.id === categoryId);
  if (!cat) return;
  // tắt các lớp built-in đang bật thuộc nhóm này
  setActiveLayers(prev => {
    const next = new Set(prev);
    cat.layers.forEach(l => next.delete(l.id));
    return next;
  });
  // xóa luôn các lớp tự tạo nằm trong nhóm này (nếu có)
  setCustomLayers(prev => prev.filter(c => c.categoryId !== categoryId));
  setLayersData(prev => {
    if (!prev) return prev;
    const next = { ...prev } as any;
    cat.layers.forEach(layer => delete next[layer.id]);
    customLayers.filter(layer => layer.categoryId === categoryId).forEach(layer => delete next[layer.id]);
    return next;
  });
  setLayerCategories(prev => prev.filter(c => c.id !== categoryId));
};

const removeBuiltinLayer = (categoryId: string, layerId: string) => {
  setLayerCategories(prev => prev.map(c =>
    c.id === categoryId ? { ...c, layers: c.layers.filter(l => l.id !== layerId) } : c
  ));
  setActiveLayers(prev => { const next = new Set(prev); next.delete(layerId); return next; });
};
  const deleteCustomLayer = (id: string) => {
    setCustomLayers(prev => prev.filter(c => c.id !== id));
    setLayersData(prev => { if (!prev) return prev; const next = { ...prev } as any; delete next[id]; return next; });
    setActiveLayers(prev => { const n = new Set(prev); n.delete(id); return n; });
    if (editingLayer === id) setEditingLayer(null);
    if (layerDragMode === id) setLayerDragMode(null);
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
    const maskElement = mapContainerRef.current.parentElement?.querySelector(".selected-area-mask") as HTMLElement | null;
    let captureMask: HTMLElement | null = null;
    if (maskElement) {
      captureMask = maskElement.cloneNode(true) as HTMLElement;
      captureMask.style.cssText = `${maskElement.style.cssText};position:absolute;inset:0;`;
      const mapRect = mapContainerRef.current.getBoundingClientRect();
      const hostRect = maskElement.parentElement?.getBoundingClientRect();
      const offsetX = mapRect.left - (hostRect?.left ?? mapRect.left);
      const offsetY = mapRect.top - (hostRect?.top ?? mapRect.top);
      const width = Math.max(1, Math.round(mapRect.width));
      const height = Math.max(1, Math.round(mapRect.height));
      const svg = captureMask.querySelector("svg");
      const svgMask = captureMask.querySelector("mask");
      const selectedPath = captureMask.querySelector("mask path");
      const maskBase = captureMask.querySelector("mask rect");
      const whiteOverlay = svg?.querySelector(`rect[mask]`);
      if (svg && svgMask && selectedPath && maskBase && whiteOverlay) {
        const captureMaskId = `composer-capture-mask-${Date.now()}`;
        svgMask.setAttribute("id", captureMaskId);
        whiteOverlay.setAttribute("mask", `url(#${captureMaskId})`);
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("width", String(width));
        svg.setAttribute("height", String(height));
        svgMask.setAttribute("width", String(width));
        svgMask.setAttribute("height", String(height));
        selectedPath.setAttribute("transform", `translate(${-offsetX} ${-offsetY})`);
        maskBase.setAttribute("width", String(width));
        maskBase.setAttribute("height", String(height));
        whiteOverlay.setAttribute("width", String(width));
        whiteOverlay.setAttribute("height", String(height));
      }
      mapContainerRef.current.appendChild(captureMask);
    }
    let canvas: HTMLCanvasElement;
    const boundaryLayers = [provincesLayerRef.current, wardsLayerRef.current].filter(Boolean) as L.Layer[];
    const densityPaths: L.Path[] = [];
    const isolateSelectedDensity = selectedAreaOnly && selectedWardIds.size > 0;
    const captureDensityStyle = getLayerSymbology("population_density");
    boundaryLayers.forEach(layer => mapRef.current?.removeLayer(layer));
    densityLayerRef.current?.eachLayer(layer => {
      if (layer instanceof L.Path) {
        densityPaths.push(layer);
        const feature = (layer as unknown as L.GeoJSON).feature as GeoJSON.Feature | undefined;
        const wardId = String(feature?.properties?.ma_xa ?? "");
        layer.setStyle({
          color: "transparent",
          fillOpacity: isolateSelectedDensity && !selectedWardIds.has(wardId) ? 0 : captureDensityStyle.fillOpacity,
        });
      }
    });
    try {
      canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        allowTaint: false,
        ignoreElements: (el) => el.classList.contains('leaflet-control-container')
      });
    } finally {
      captureMask?.remove();
      boundaryLayers.forEach(layer => layer.addTo(mapRef.current!));
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
          outputContext.clearRect(0, 0, canvas.width, canvas.height);
          outputContext.fillStyle = "#ffffff";
          outputContext.fillRect(0, 0, canvas.width, canvas.height);
          outputContext.drawImage(clipped, 0, 0);
        }
      }
    }
    const base64Image = canvas.toDataURL("image/png");
    const mapBounds = mapRef.current.getBounds();
    const isVisibleFeature = (feature: any): boolean => {
      if (Number.isFinite(Number(feature?.lat)) && Number.isFinite(Number(feature?.lng))) {
        return mapBounds.contains([Number(feature.lat), Number(feature.lng)]);
      }
      const visit = (value: any): boolean => {
        if (!Array.isArray(value)) return false;
        if (value.length >= 2 && value.every((entry: any) => typeof entry === "number")) {
          return mapBounds.contains([Number(value[1]), Number(value[0])]);
        }
        return value.some(visit);
      };
      return visit(feature?.coords);
    };
    const legendLayerIds = Array.from(activeLayers).filter(id => {
      if (id === "population_density") return false;
      if (id === "ward_boundaries" || id === "population_density") {
        return !!currentProvinceGeoJson?.features.length || !!allWardsGeoJson?.features.length;
      }
      const features = layersData ? (layersData as any)[id] : null;
      return Array.isArray(features) && features.some(isVisibleFeature);
    });
    const composerEthnicComposition = showPieSelector
      ? (ethnicLegendComposition.length > 0 ? ethnicLegendComposition : wardDanToc.map(item => {
          const info = getDanTocInfo(item.dan_toc);
          return {
            label: info?.ten || item.dan_toc,
            value: item.ty_le,
            color: info?.mau || ETHNIC_COLORS[item.dan_toc] || "#94a3b8",
          };
        }))
      : [];

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
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest(),
      },
      annotations,
      layerDisplayAll,
      densityLegend: densityLegendEntries.map(entry => ({ label: entry.label, color: entry.color, fillOpacity: entry.fillOpacity })),
      ethnicComposition: composerEthnicComposition,
      ethnicLegend: ethnicLegendItems,
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
};

  useEffect(() => {
    if (!showMapComposer || !composerSnapshot || syncPending) return;
    void syncToComposer();
  }, [showMapComposer, activeLayers, activeRaster, selectedProvince, selectedWard?.ma_xa, selectedWardIds, selectedAreaOnly, selectedAreaFade, currentProvinceGeoJson, layerSymbologies, wardOverrides]);

  /* ─── Toggle layer ─── */
  const toggleLayer = (id:string) => {
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
    const topoLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { maxZoom: 17 });
    let fallbackAdded = false;
    osmLayer.on("tileerror", () => {
      if (fallbackAdded || !map.hasLayer(osmLayer)) return;
      fallbackAdded = true;
      map.removeLayer(osmLayer);
      lightFallbackLayer.addTo(map);
    });
    osmLayer.addTo(map);
    L.control.layers({ "Bản đồ thường": osmLayer, "Vệ tinh": hybridLayer, "Địa hình": topoLayer }, undefined, { position: "topright", collapsed: true }).addTo(map);
    const og=L.layerGroup().addTo(map); const ag=L.layerGroup().addTo(map);
    overlayGroupRef.current=og; annotationGroupRef.current=ag; mapRef.current=map;
    map.on("zoomend", () => {
      refreshBoundaryStyles();
      setMapScale(scaleFromZoom(map.getCenter().lat, map.getZoom()));
    });
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
    setLoading(true);setSelectedProvince(name);setSelectedWard(null);setSelectedWardIds(new Set());setSelectedDanToc(null);
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
      const cur=getWardMapStyle(p, wardStyle);
      (e.target as L.Path).setStyle({...cur, fillOpacity:Math.min(0.6, cur.fillOpacity + 0.26), weight: cur.weight + 0.8});
      (e.target as L.Path).bringToFront();
    },
    mouseout:e=>{(e.target as L.Path).setStyle(getWardMapStyle(p, wardStyle));},
    click:(event: L.LeafletMouseEvent)=>{
      const additive = event.originalEvent.shiftKey || event.originalEvent.ctrlKey || event.originalEvent.metaKey;
      setSelectedWardIds(prev => {
        if (!additive) return new Set([p.ma_xa]);
        const next = new Set(prev);
        if (next.has(p.ma_xa)) next.delete(p.ma_xa); else next.add(p.ma_xa);
        return next;
      });
      setSelectedWard(p);setSelectedDanToc(null);setActiveTriThuc(0);setEditingEthnicPct(null);
      provinceMaskGeomRef.current = { type: "FeatureCollection", features: [feat] } as unknown as GeoJSON.FeatureCollection;
      maskedRasterCacheRef.current.clear();
      const bounds = (lyr as L.GeoJSON).getBounds();
      if (bounds.isValid()) mapRef.current?.fitBounds(bounds, { padding: [70, 70], maxZoom: 14, duration: 0.8 });
    }
  });
  lyr.bindTooltip(`<div class="ward-tooltip">${p.ten_xa}</div>`,{sticky:true,className:"custom-tooltip ward-tip"});
},
      });
      wl.addTo(mapRef.current);wardsLayerRef.current=wl;
      const b=wl.getBounds();if(b.isValid())mapRef.current.fitBounds(b,{padding:[40,40],maxZoom:11});
      setViewMode("ward");
    } catch(e){console.error(e);} finally{setLoading(false);}
  };

  const handleBack = async () => {
    if(!mapRef.current)return; setLoading(true);
    if(wardsLayerRef.current){mapRef.current.removeLayer(wardsLayerRef.current);wardsLayerRef.current=null;}
    setSelectedProvince(null);setSelectedWard(null);setSelectedWardIds(new Set());setSelectedDanToc(null);setViewMode("province");allWardsRef.current=[];setCurrentProvinceGeoJson(null);setPieWardSelection(new Set());
    try {
      const data=await fetchGeoJson("/data/tinh.geojson");
      provinceMaskGeomRef.current = data as unknown as GeoJSON.FeatureCollection;
      maskedRasterCacheRef.current.clear();
      addProvincesLayer(mapRef.current,data);
      const b=L.geoJSON(data as GeoJSON.FeatureCollection).getBounds();
      if(b.isValid())mapRef.current.flyToBounds(b,{padding:[40,40],maxZoom:9,duration:1.5});
    } catch(e){console.error(e);} finally{setLoading(false);}
  };

  useEffect(()=>{initMap();return()=>{if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};},[initMap]);

  useEffect(() => {
  refreshBoundaryStyles();
  }, [layerSymbologies, wardOverrides, selectedProvince, selectedWard, selectedWardIds, selectedAreaOnly]);

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

    const maskHost = map.getContainer().parentElement || map.getContainer();
    const mask = document.createElement("div");
    mask.className = "selected-area-mask";
    mask.style.cssText = "position:absolute;inset:0;z-index:650;pointer-events:none;overflow:hidden";
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
    maskHost.appendChild(mask);
    selectedAreaMaskRef.current = mask;

    const updateMask = () => {
      const mapRect = map.getContainer().getBoundingClientRect();
      const hostRect = maskHost.getBoundingClientRect();
      const width = Math.max(1, Math.round(hostRect.width));
      const height = Math.max(1, Math.round(hostRect.height));
      const offsetX = mapRect.left - hostRect.left;
      const offsetY = mapRect.top - hostRect.top;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svgMask.setAttribute("width", String(width));
      svgMask.setAttribute("height", String(height));
      selectedPath.setAttribute("d", rings.map(ring => {
        const points = ring.map(([lng, lat]) => {
          const point = map.latLngToContainerPoint([lat, lng]);
          return `${point.x + offsetX} ${point.y + offsetY}`;
        });
        return `M ${points.join(" L ")} Z`;
      }).join(" "));
    };
    updateMask();
    map.on("move zoom resize", updateMask);
    return () => {
      map.off("move zoom resize", updateMask);
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
  const ethnicLegendComposition = useMemo(() => {
    if (!showPieSelector || pieWardSelection.size === 0 || viewMode !== "ward") return [];
    const totals = new Map<string, number>();
    const addComposition = (composition: DanTocTyLe[], weight: number) => {
      composition.forEach(item => {
        if (item.ty_le > 0) totals.set(item.dan_toc, (totals.get(item.dan_toc) || 0) + item.ty_le * weight);
      });
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
          label: info?.ten || id,
          value: Math.round((value / total) * 10000) / 100,
          color: info?.mau || ETHNIC_COLORS[id] || "#94a3b8",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [showPieSelector, pieWardSelection, viewMode, selectedWard, selectedProvince, currentProvinceGeoJson, wardDanToc, wardOverrides, ethnicOverrides, danTocData]);
  const ethnicLegendItems = useMemo(() => {
    if (!showPieSelector || pieWardSelection.size === 0 || viewMode !== "ward" || !currentProvinceGeoJson) return [];
    const ids = new Set<string>();
    currentProvinceGeoJson.features.forEach(feature => {
      const props = feature.properties as unknown as WardProperties;
      if (!pieWardSelection.has(props.ma_xa)) return;
      const composition = wardOverrides.get(props.ma_xa)?.dan_toc ?? props.dan_toc ?? [];
      composition.filter(item => item.ty_le > 0).forEach(item => ids.add(item.dan_toc));
    });
    return Array.from(ids).map(id => {
      const info = getDanTocInfo(id);
      return { label: info?.ten || id, color: info?.mau || ETHNIC_COLORS[id] || "#94a3b8" };
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
    return classes.filter((_, index) => present.has(index)).map(entry => ({ ...entry, fillOpacity: densityStyle.fillOpacity }));
  }, [activeRaster, activeLayers, selectedProvince, currentProvinceGeoJson, selectedWard, wardOverrides, layerSymbologies]);
  const wardPdfs=selectedWard?(pdfFiles.get(selectedWard.ma_xa)||[]):[];
  const wardCustom=selectedWard?wardOverrides.get(selectedWard.ma_xa):undefined;
  const stats=selectedProvince?getProvinceStat(selectedProvince):null;
  const layerCategoriesWithState = layerCategories.map(cat => ({
  ...cat,
  layers: [
    ...cat.layers.map(l => ({ ...l, active: activeLayers.has(l.id), isCustom: false })),
    ...customLayers.filter(c => c.categoryId === cat.id).map(c => ({
      id: c.id, ten: c.ten, mau: c.mau, bieu_tuong: c.bieu_tuong, active: activeLayers.has(c.id), isCustom: true
    }))
  ]
}));
  const customLayerIds = customLayers.map(c => c.id);
  const allEditableLayers = new Set<string>([...EDITABLE_LAYERS, ...customLayerIds]);
  const allExportableLayers = new Set<string>([
    "irrigation", "forests", "vac_models", "medicinal_plants", "customary_zones", "ward_boundaries",
    ...customLayerIds,
  ]);
  const customDisplay: Record<string, { name: string; color: string }> = {};
  const customGeom: Record<string, "point" | "line" | "polygon"> = {};
  customLayers.forEach(c => { customDisplay[c.id] = { name: c.ten, color: c.mau }; customGeom[c.id] = c.geomType; });
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
  });

  const featureCounts: Record<string, number> = layersData ? {
    rivers: layersData.rivers?.length || 0,
    irrigation: layersData.irrigation?.length || 0,
    forests: layersData.forests?.length || 0,
    vac_models: layersData.vac_models?.length || 0,
    medicinal_plants: layersData.medicinal_plants?.length || 0,
    customary_zones: layersData.customary_zones?.length || 0,
    ward_boundaries: allWardsGeoJson?.features.length || 0,
    ...Object.fromEntries(customLayerIds.map(id => [id, ((layersData as any)[id] || []).length]))
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
  const totalLayerFeatures = customLayers.length + wardDanToc.length; // Placeholder calculation

  const EditWard=({field,suffix="",type="text" as "text"|"number",decimals}:{field:keyof WardProperties&string;suffix?:string;type?:"text"|"number";decimals?:number})=>{
    if(!selectedWard)return null;
    const val=getWardValue(selectedWard,field);
    return <EditableValue value={(val??"") as string|number} suffix={suffix} type={type} decimals={decimals} placeholder="Click để nhập" onSave={v=>updateWardField(selectedWard.ma_xa,field,type==="number"?parseFloat(v):v)}/>;
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
          <button className={`layer-toggle-btn ${showThematic?"active":""}`} onClick={()=>setShowThematic(s=>!s)} title="Bản đồ chuyên đề">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span className="btn-label">Chuyên đề</span> {activeRaster&&<span className="layer-count">1</span>}
          </button>
          <button className={`layer-toggle-btn ${showLayers?"active":""}`} onClick={()=>setShowLayers(s=>!s)} title="Lớp bản đồ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            <span className="btn-label">Lớp bản đồ</span> {activeLayers.size>0&&<span className="layer-count">{activeLayers.size}</span>}
          </button>
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
  onToggle={toggleLayer}
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


          {showSpatialAnalysis && (
            <div style={{ position: "absolute", top: 160, left: 16, zIndex: 700, width: 320, background: "rgba(10, 20, 16, 0.95)", border: "1px solid rgba(82, 183, 136, 0.25)", borderRadius: 12, padding: 14, boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 700, color: "#d8f3dc" }}>📐 Phân tích không gian</div>
                <button className="modal-close" onClick={() => { setShowSpatialAnalysis(false); clearSpatialAnalysis(); }} title="Đóng">✕</button>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ fontSize: 12, color: "#95d5b2" }}>Loại phân tích
                  <select value={analysisType} onChange={e => setAnalysisType(e.target.value as any)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(82, 183, 136, 0.2)", background: "#13251d", color: "#d8f3dc" }}>
                    <option value="buffer">Vùng đệm</option>
                    <option value="intersect">Giao cắt</option>
                    <option value="ward">Thống kê theo xã</option>
                  </select>
                </label>
                <label style={{ fontSize: 12, color: "#95d5b2" }}>Lớp dữ liệu
                  <select value={analysisLayerA} onChange={e => setAnalysisLayerA(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(82, 183, 136, 0.2)", background: "#13251d", color: "#d8f3dc" }}>
                    {Object.entries(layerDisplayAll).filter(([id]) => id !== "ward_boundaries").map(([id, meta]) => (
                      <option key={id} value={id}>{meta.name}</option>
                    ))}
                  </select>
                </label>
                {analysisType === "buffer" ? (
                  <label style={{ fontSize: 12, color: "#95d5b2" }}>Bán kính (m)
                    <input type="number" min={50} max={5000} step={50} value={bufferDistance} onChange={e => setBufferDistance(Number(e.target.value) || 0)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(82, 183, 136, 0.2)", background: "#13251d", color: "#d8f3dc" }} />
                  </label>
                ) : analysisType === "intersect" ? (
                  <label style={{ fontSize: 12, color: "#95d5b2" }}>Lớp đối chiếu
                    <select value={analysisLayerB} onChange={e => setAnalysisLayerB(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(82, 183, 136, 0.2)", background: "#13251d", color: "#d8f3dc" }}>
                      {Object.entries(layerDisplayAll).filter(([id]) => id !== analysisLayerA).map(([id, meta]) => (
                        <option key={id} value={id}>{meta.name}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <button onClick={runSpatialAnalysis} style={{ padding: "9px 10px", borderRadius: 8, border: "none", background: "#52b788", color: "#07140d", fontWeight: 700, cursor: "pointer" }}>Chạy phân tích</button>
                {analysisSummary && <div style={{ fontSize: 12, color: "#d8f3dc", background: "rgba(82, 183, 136, 0.14)", padding: "8px 10px", borderRadius: 8 }}>{analysisSummary}</div>}
                {analysisError && <div style={{ fontSize: 12, color: "#fda4af", background: "rgba(220, 38, 38, 0.15)", padding: "8px 10px", borderRadius: 8 }}>{analysisError}</div>}
              </div>
            </div>
          )}

          {showThematic && rasterMeta && (
            <div className="thematic-panel">
              <div className="thematic-header"><span className="thematic-title">Bản đồ chuyên đề</span><button className="thematic-close" onClick={()=>setShowThematic(false)} title="Đóng">×</button></div>
              <div className="thematic-body">
                <div className="thematic-group"><div className="thematic-group-label">🌡️ Khí hậu</div>
                  {(["temperature","precipitation"] as const).map(k => {
                    const info = rasterMeta.layers[k]; if (!info) return null;
                    return (<label key={k} className={`thematic-row ${activeRaster===k?"active":""}`}><input type="radio" name="thematic" checked={activeRaster===k} onChange={()=>setActiveRaster(k)} /><span className="thematic-row-label">{info.label}</span></label>);
                  })}
                </div>
                <div className="thematic-group"><div className="thematic-group-label">⛰️ Địa hình</div>
                  {(["elevation","aspect"] as const).map(k => {
                    const info = rasterMeta.layers[k]; if (!info) return null;
                    return (<label key={k} className={`thematic-row ${activeRaster===k?"active":""}`}><input type="radio" name="thematic" checked={activeRaster===k} onChange={()=>setActiveRaster(k)} /><span className="thematic-row-label">{info.label}</span></label>);
                  })}
                </div>
                <div className="thematic-group"><div className="thematic-group-label">🌱 Thổ nhưỡng</div>
                  {(["soil_type","soil_ph"] as const).map(k => {
                    const info = rasterMeta.layers[k]; if (!info) return null;
                    return (<label key={k} className={`thematic-row ${activeRaster===k?"active":""}`}><input type="radio" name="thematic" checked={activeRaster===k} onChange={()=>setActiveRaster(k)} /><span className="thematic-row-label">{info.label}</span></label>);
                  })}
                </div>
                <button className="thematic-clear" disabled={!activeRaster} onClick={()=>setActiveRaster(null)}>Tắt lớp chuyên đề</button>
                {activeRaster === "elevation" && <button className="thematic-3d-btn" onClick={() => setShowTerrain3D(true)}>🌐 Mở địa hình 3D</button>}
                {activeRaster && (<div className="thematic-opacity"><label>Độ trong suốt: {Math.round(rasterOpacity*100)}%</label><input type="range" min={0.2} max={1} step={0.05} value={rasterOpacity} onChange={e=>setRasterOpacity(parseFloat(e.target.value))} /></div>)}
                {activeRaster && rasterMeta.layers[activeRaster] && (<div className="thematic-source">Nguồn: <em>{rasterMeta.layers[activeRaster].source}</em></div>)}
              </div>
            </div>
          )}

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
              </div>
            );
          })()}

          {/* Bản đồ chính */}
          <div className="map-wrapper" style={{ width: "100%", height: "100%", flex: 1, position: "relative" }}>
            <div ref={mapContainerRef} className="map-canvas" style={{ width: "100%", height: "100%" }}/>
            
            {(loading||loadingWardBoundaries)&&<div className="map-overlay"><div className="loading-spinner"/><span>{loadingWardBoundaries?"Đang tải ranh giới xã của 3 tỉnh...":"Đang tải dữ liệu..."}</span></div>}
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
                      <div key={ann.id} className="ann-list-item" onClick={()=>{ const ag=annotationGroupRef.current; ag?.eachLayer(l=>{ if(l instanceof L.Marker){const mp=l.getPopup(); if(mp?.getContent()?.toString().includes(ann.ten))l.openPopup();} }); }}>
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

            <div className="map-legend">
              <div className="legend-title">Chú giải</div>
              {(ethnicLegendItems.length > 0 || ethnicLegendComposition.length > 0) && (
                <div className="legend-ethnic-section">
                  <div className="legend-subtitle">Chú giải màu cơ cấu dân tộc</div>
                  {(ethnicLegendItems.length > 0 ? ethnicLegendItems : ethnicLegendComposition.map(item => ({ label: item.label, color: item.color }))).map(item => (
                    <div className="legend-item" key={`ethnic-${item.label}`}>
                      <span className="legend-color" style={{ background: item.color }} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
{(() => {
  const boundaryStyle = getLayerSymbology(viewMode === "province" ? "province_boundaries" : "ward_boundaries");
  const boundaryDash = getZoomAwareDashArray(boundaryStyle.dashArray, mapRef.current?.getZoom() ?? 7);
  return (
    <div className="legend-item">
      <svg width="18" height="14" viewBox="0 0 18 14" className="legend-color legend-line-swatch" style={{ width: 18, height: 14, background: "transparent" }}>
        <line
          x1="1" y1="7" x2="17" y2="7"
          stroke={boundaryStyle.color}
          strokeWidth={Math.max(1.5, boundaryStyle.lineWeight)}
          strokeDasharray={boundaryDash || undefined}
          strokeLinecap="round"
        />
      </svg>
      <span>{viewMode === "province" ? "Ranh giới tỉnh" : "Ranh giới xã/phường"}</span>
    </div>
  );
})()}{activeLayers.has("ward_boundaries") && (() => {
  const wardLegendStyle = getLayerSymbology("ward_boundaries");
  const wardBoundaryDash = getZoomAwareDashArray(wardLegendStyle.dashArray, mapRef.current?.getZoom() ?? 7);
  return (
    <div className="legend-item">
      <svg width="18" height="14" viewBox="0 0 18 14" className="legend-color legend-line-swatch" style={{ width: 18, height: 14, background: "transparent" }}>
        <line
          x1="1" y1="7" x2="17" y2="7"
          stroke={wardLegendStyle.color}
          strokeWidth={Math.max(1.5, wardLegendStyle.lineWeight)}
          strokeDasharray={wardBoundaryDash || undefined}
          strokeLinecap="round"
        />
      </svg>
      <span>Ranh giới xã (3 tỉnh)</span>
    </div>
  );
})()}
<div className="legend-item">
  <svg width="18" height="14" viewBox="0 0 18 14" className="legend-color legend-line-swatch" style={{ width: 18, height: 14, background: "transparent" }}>
    <path d="M1,10 C5,4 8,12 12,6 S16,3 17,4" fill="none" stroke="#f8fcff" strokeWidth="4.8" strokeLinecap="round" opacity="0.95"/>
    <path d="M1,10 C5,4 8,12 12,6 S16,3 17,4" fill="none" stroke="#2589c7" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  <span>Hệ thống sông suối</span>
</div>
{activeLayers.has("irrigation")&&<div className="legend-item"><span className="legend-symbol">🚿</span><span>Thủy lợi</span></div>}
              {activeLayers.has("forests")&&<div className="legend-item"><span className="legend-symbol">🌲</span><span>Rừng</span></div>}
              {activeLayers.has("vac_models")&&<div className="legend-item"><span className="legend-symbol">♻️</span><span>VAC/VACR</span></div>}
              {activeLayers.has("medicinal_plants")&&<div className="legend-item"><span className="legend-symbol">🌿</span><span>Cây thuốc</span></div>}
              {activeLayers.has("customary_zones")&&<div className="legend-item"><svg width="24" height="12" viewBox="0 0 24 12" className="legend-color legend-line-swatch" style={{width:24,height:12,background:"transparent"}}><rect x="1" y="1" width="22" height="10" fill="#f4a261" fillOpacity="0.12" stroke="#f4a261" strokeWidth="1.5" strokeDasharray="4,3"/></svg><span>Luật tục</span></div>}
              {customLayers.filter(layer => activeLayers.has(layer.id)).map(layer => <div className="legend-item" key={`custom-legend-${layer.id}`}><span className="legend-symbol" style={{color: layer.mau}}>{layer.bieu_tuong?.startsWith("data:image") ? <img src={layer.bieu_tuong} alt="" style={{width: 18, height: 18, objectFit: "contain"}}/> : layer.bieu_tuong}</span><span>{layer.ten}</span></div>)}
              {densityLegendEntries.length > 0 && viewMode === "ward" && <>
                <div className="legend-subtitle">Mật độ dân số</div>
                {densityLegendEntries.map((entry, index) => <div className="legend-item" key={`density-${index}`}><div className="legend-color" style={{background: entry.color, opacity: entry.fillOpacity ?? 1}}/><span>{entry.label} người/km²</span></div>)}
              </>}
              {annotations.length>0&&<div className="legend-item"><div className="legend-color" style={{background:"#e9c46a"}}/><span>Đối tượng của tôi</span></div>}
            </div>
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

{selectedWard ? (
                  <div className="ward-info">
                    <div className="ward-name-wrap">
                      <EditableValue
                        value={(getWardValue(selectedWard, "ten_xa") as string) || selectedWard.ten_xa}
                        className="ward-name-editable"
                        onSave={v => updateWardField(selectedWard.ma_xa, "ten_xa", v)}
                      />
                    </div>
                    <div className="ward-badge-row"><button
  className="ward-style-edit-btn"
  onClick={() => setEditingWardStyle(selectedWard)}
  title="Tùy chỉnh màu sắc / đường viền riêng cho xã này"
>
  🎨 Tùy chỉnh giao diện xã này
</button>
                      <EditableValue
                        value={(getWardValue(selectedWard, "loai") as string) || selectedWard.loai || ""}
                        placeholder="Loại đơn vị"
                        className="ward-badge-editable"
                        onSave={v => updateWardField(selectedWard.ma_xa, "loai", v)}
                      />
                    </div>
                   <div className="info-grid">
  <div className="info-row"><div className="info-label">Mã đơn vị</div><div className="info-value">{selectedWard.ma_xa}</div></div>
  <div className="info-row"><div className="info-label">Diện tích</div><div className="info-value"><EditWard field="dtich_km2" suffix=" km²" type="number" decimals={2}/></div></div>
  <div className="info-row"><div className="info-label">Dân số</div><div className="info-value"><EditWard field="dan_so" suffix=" người" type="number"/></div></div>
  <div className="info-row"><div className="info-label">Mật độ</div><div className="info-value"><EditWard field="matdo_km2" suffix=" ng/km²" type="number" decimals={1}/></div></div>
</div>                                          {/* ✅ THÊM DÒNG NÀY */}
<div className="custom-fields">
  {[{f:"ghi_chu",l:"Ghi chú",p:"Click để thêm"},{f:"san_pham",l:"Sản phẩm chính",p:"VD: Ngô, Sắn, Lúa"},{f:"tinh_trang",l:"Tình trạng",p:"VD: Đang phát triển"}].map(({f,l,p})=>(
    <div key={f} className="info-row"><div className="info-label">{l}</div><div className="info-value"><EditableValue value={(wardCustom?.[f] as string)||""} placeholder={p} onSave={v=>updateWardField(selectedWard.ma_xa,f,v)}/></div></div>
  ))}
</div>

                    {wardPdfs.length>0&&(
                      <div className="pdf-section">
                        <div className="pdf-section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Tài liệu ({wardPdfs.length})</div>
                        {wardPdfs.map((pdf,i)=>(<div key={i} className="pdf-item"><div className="pdf-info"><span className="pdf-name">{pdf.name}</span><span className="pdf-size">{pdf.size}</span></div><div className="pdf-actions"><button className="pdf-btn view" onClick={()=>setPdfViewer(pdf)}>Xem</button><button className="pdf-btn remove" onClick={()=>removePdf(selectedWard.ma_xa,i)}>✕</button></div></div>))}
                      </div>
                    )}

                    {wardDanToc.length>0&&(
                      <div className="ethnic-section">
                        <div className="ethnic-section-title">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          Các dân tộc sinh sống
                          <button className="add-ethnic-btn" onClick={() => { if (selectedWard) setEditingWardComposition(selectedWard); }} title="Thêm hoặc sửa dân tộc của xã này">+</button>
                        </div>
                        <p className="ethnic-hint">Click tên → tri thức bản địa · Click % → chỉnh tỷ lệ</p>
                        <div className="ethnic-tags">
                          {wardDanToc.map(({dan_toc,ty_le})=>{
                            const info=getDanTocInfo(dan_toc);if(!info)return null;
                            const isActive=selectedDanToc?.id===dan_toc;
                            return(<div key={dan_toc} className={`ethnic-tag ${isActive?"active":""}`} style={{"--tag-color":info.mau} as React.CSSProperties}>
                              <span className="tag-dot" style={{background:info.mau}}/><button className="tag-name-btn" onClick={()=>{setSelectedDanToc(isActive?null:info);setActiveTriThuc(0);}}>{info.ten.replace("Dân tộc ","").replace("Người ","")}</button>
                              <button className="tag-remove-btn" title="Xóa dân tộc này khỏi xã" onClick={e=>{
                                e.stopPropagation();
                                const list=(wardOverrides.get(selectedWard.ma_xa)?.dan_toc??selectedWard.dan_toc??[]).filter(d=>d.dan_toc!==dan_toc);
                                const total=list.reduce((s,d)=>s+d.ty_le,0);
                                const norm=total>0?list.map(d=>({...d,ty_le:Math.round(d.ty_le*100/total)})):list;
                                updateWardField(selectedWard.ma_xa,"dan_toc",norm);
                                if(selectedDanToc?.id===dan_toc)setSelectedDanToc(null);
                              }}>✕</button>
                            </div>);
                          })}
                        </div>
                        <div className="ethnic-bar-wrap">{wardDanToc.map(({dan_toc,ty_le})=>{const info=getDanTocInfo(dan_toc);return info?<div key={dan_toc} className="ethnic-bar-seg" style={{width:`${ty_le}%`,background:info.mau}} title={`${info.ten.replace("Dân tộc ","")}: ${ty_le}%`}/>:null;})}</div>
                      </div>
                    )}

                    {selectedDanToc&&(()=>{
                      const info=getDanTocInfo(selectedDanToc.id)!;
                      const ethnicPdfs=pdfFiles.get("ethnic_"+info.id)||[];
                      const triThuc=getTriThuc(info.id);
                      return(<div className="knowledge-panel">
                        {info.anh ? (
                          <div className="ethnic-photo-wrap" style={{borderColor:info.mau+"55"}}>
                            <img src={info.anh} alt={info.ten} className="ethnic-photo" onClick={()=>setEthnicPhotoLightbox(info.anh!)} loading="lazy"/>
                            <div className="ethnic-photo-actions">
                              <button className="ethnic-photo-btn" onClick={()=>pickEthnicPhoto(info.id)} title="Đổi ảnh">🔄</button>
                              <button className="ethnic-photo-btn delete" onClick={()=>{ if (confirm("Xóa ảnh dân tộc này?")) setEthnicPhoto(info.id, undefined); }} title="Xóa ảnh">🗑️</button>
                            </div>
                          </div>
                        ) : (
                          <button className="ethnic-photo-add" onClick={()=>pickEthnicPhoto(info.id)} style={{borderColor:info.mau,color:info.mau}}>
                            📷 Thêm ảnh minh họa cho {info.ten.replace("Dân tộc ","").replace("Người ","")}
                          </button>
                        )}
                        <div className="knowledge-header" style={{borderLeftColor:info.mau}}>
                          <div className="knowledge-name" style={{color:info.mau}}>{info.ten}</div>
                          <div className="knowledge-meta-row">
                            <EditableValue value={info.ngon_ngu} className="editable-meta" onSave={v=>updateEthnicField(info.id,"ngon_ngu",v)}/>
                            <span> · </span>
                            <EditableValue value={info.dan_so_ca_nuoc} suffix=" người" type="number" className="editable-meta" onSave={v=>updateEthnicField(info.id,"dan_so_ca_nuoc",parseInt(v)||0)}/>
                          </div>
                          <EditableValue value={info.mo_ta} className="knowledge-desc-editable" onSave={v=>updateEthnicField(info.id,"mo_ta",v)}/>
                          {(info as any).nguon?.length>0&&(<details style={{marginTop:6,fontSize:11,opacity:.85}}><summary style={{cursor:"pointer"}}>📚 Nguồn tham khảo ({(info as any).nguon.length})</summary><ul style={{margin:"4px 0 0 16px",padding:0}}>{(info as any).nguon.map((n:string,i:number)=>(<li key={i}>{n}</li>))}</ul><div style={{marginTop:4,color:"#f4a261"}}>{(info as any).ghi_chu_nguon}</div></details>)}
                        </div>
                        {toEthnicKey(info.id)&&(<div style={{display:"flex",gap:8,margin:"8px 0",flexWrap:"wrap"}}>
                          <button className="edit-mode-btn" onClick={()=>setTransectFor(toEthnicKey(info.id))}>⛰️ Lược đồ mặt cắt</button>
                          <button className="edit-mode-btn" onClick={()=>setCalendarFor(toEthnicKey(info.id))}>📅 Nông lịch</button>
                        </div>)}
                        {ethnicPdfs.length>0&&<div className="ethnic-pdf-list">{ethnicPdfs.map((pdf,i)=>(<div key={i} className="pdf-item"><div className="pdf-info"><span className="pdf-name">{pdf.name}</span></div><div className="pdf-actions"><button className="pdf-btn view" onClick={()=>setPdfViewer(pdf)}>Xem</button><button className="pdf-btn remove" onClick={()=>removePdf("ethnic_"+info.id,i)}>✕</button></div></div>))}</div>}
                        <div className="knowledge-tabs">
                          {triThuc.map((tt,i)=>(
                            <button key={i} className={`knowledge-tab ${activeTriThuc===i?"active":""}`} style={{"--tab-color":info.mau} as React.CSSProperties} onClick={()=>setActiveTriThuc(i)}>
                              <span>{tt.bieu_tuong}</span><span>{tt.chu_de}</span>
                            </button>
                          ))}
                          <button className="knowledge-tab add-tab" onClick={()=>setNewTopicForm({ethId:info.id,chu_de:"",bieu_tuong:"📌",noi_dung:""})} title="Thêm chủ đề mới">+</button>
                        </div>
                        {newTopicForm?.ethId===info.id&&(
                          <div className="new-topic-form">
                            <div className="ntf-row"><input className="ntf-input small" value={newTopicForm.bieu_tuong} onChange={e=>setNewTopicForm(f=>f?{...f,bieu_tuong:e.target.value}:f)} placeholder="🏺" maxLength={2}/><input className="ntf-input" value={newTopicForm.chu_de} onChange={e=>setNewTopicForm(f=>f?{...f,chu_de:e.target.value}:f)} placeholder="Tên chủ đề tri thức..."/></div>
                            <textarea className="ntf-textarea" value={newTopicForm.noi_dung} onChange={e=>setNewTopicForm(f=>f?{...f,noi_dung:e.target.value}:f)} placeholder="Mô tả tri thức bản địa về chủ đề này..." rows={3}/>
                            <div className="ntf-actions"><button className="ntf-cancel" onClick={()=>setNewTopicForm(null)}>Hủy</button><button className="ntf-save" disabled={!newTopicForm.chu_de.trim()} onClick={()=>addTriThucTopic(info.id,newTopicForm.chu_de,newTopicForm.bieu_tuong,newTopicForm.noi_dung)}>Thêm chủ đề</button></div>
                          </div>
                        )}
                        {triThuc[activeTriThuc]&&(
                          <div className="knowledge-content">
                            <div className="knowledge-topic-header">
                              <div className="knowledge-topic">
                                <EditableValue value={triThuc[activeTriThuc].bieu_tuong} className="editable-symbol" onSave={v=>updateTriThucField(info.id,activeTriThuc,"bieu_tuong",v)}/>
                                <EditableValue value={triThuc[activeTriThuc].chu_de} className="editable-topic-name" onSave={v=>updateTriThucField(info.id,activeTriThuc,"chu_de",v)}/>
                              </div>
                              <button className="topic-delete-btn" onClick={()=>removeTriThucTopic(info.id,activeTriThuc)} title="Xóa chủ đề này">🗑️</button>
                            </div>
                            <EditableValue value={triThuc[activeTriThuc].noi_dung} className="knowledge-text-editable" onSave={v=>updateTriThucField(info.id,activeTriThuc,"noi_dung",v)} multiline/>
                            <div className="recipes">
                              <div className="recipes-title-row">
                                <div className="recipes-title">Bài thuốc / Kỹ thuật</div>
                                <button className="add-recipe-btn" onClick={()=>setEditingRecipe({ethId:info.id,topicIdx:activeTriThuc,recipeIdx:null,data:{ten:"",nguyen_lieu:"",cong_dung:""}})}>+ Thêm</button>
                              </div>
                              {triThuc[activeTriThuc].bai_thuoc.map((bt,i)=>(
                                <div key={i} className="recipe-card" style={{borderColor:info.mau+"50"}}>
                                  <div className="recipe-name-row">
                                    <EditableValue value={bt.ten} className="recipe-name" onSave={v=>{const recs=[...triThuc[activeTriThuc].bai_thuoc];recs[i]={...recs[i],ten:v};updateBaiThuoc(info.id,activeTriThuc,recs);}}/>
                                    <button className="recipe-delete-btn" onClick={()=>{const recs=triThuc[activeTriThuc].bai_thuoc.filter((_,ri)=>ri!==i);updateBaiThuoc(info.id,activeTriThuc,recs);}}>✕</button>
                                  </div>
                                  <div className="recipe-row"><span className="recipe-label">Nguyên liệu:</span><EditableValue value={bt.nguyen_lieu} className="recipe-val-edit" onSave={v=>{const recs=[...triThuc[activeTriThuc].bai_thuoc];recs[i]={...recs[i],nguyen_lieu:v};updateBaiThuoc(info.id,activeTriThuc,recs);}}/></div>
                                  <div className="recipe-row"><span className="recipe-label">Công dụng:</span><EditableValue value={bt.cong_dung} className="recipe-val-edit highlight" style={{color:info.mau}} onSave={v=>{const recs=[...triThuc[activeTriThuc].bai_thuoc];recs[i]={...recs[i],cong_dung:v};updateBaiThuoc(info.id,activeTriThuc,recs);}}/></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <button className="knowledge-close" onClick={()=>setSelectedDanToc(null)}>Đóng thông tin dân tộc</button>
                      </div>);
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
                  </div>
                )}

                {selectedWard && (
                  <div className="province-stats" style={{ marginTop: 10 }}>
                    <div className="stats-title">Tổng quan nhanh</div>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-value">{wardDanToc.length}</div>
                        <div className="stat-label">Dân tộc</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{customLayers.length}</div>
                        <div className="stat-label">Lớp tùy chỉnh</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{totalLayerFeatures}</div>
                        <div className="stat-label">Tổng đối tượng</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── CÁC THÀNH PHẦN ẨN (MODAL, LIGHTBOX, V.V) ─── */}
      <input ref={ethnicPhotoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleEthnicPhotoChosen}/>
      
      {ethnicPhotoLightbox&&(
        <div className="ik-lightbox" onClick={()=>setEthnicPhotoLightbox(null)}>
          <button className="ik-lightbox-close" onClick={()=>setEthnicPhotoLightbox(null)} aria-label="Đóng">✕</button>
          <img src={ethnicPhotoLightbox || undefined} alt="" onClick={e=>e.stopPropagation()}/>
        </div>
      )}

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
      <Terrain3DModal open={showTerrain3D} onClose={() => setShowTerrain3D(false)} basePath={BASE_PATH} />
      <MapComposer
  hidden={!showMapComposer || !!editingLayer}
  onClose={() => setShowMapComposer(false)}
  mapSnapshot={composerSnapshot?.image}
  syncSnapshot={composerSnapshot}
  onRequestSync={syncToComposer}
  syncPending={syncPending}
  onOpenLayerEditor={() => {
    const preferred = editingLayer || Array.from(activeLayers)[0] || "rivers";
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
          onClose={() => { setEditingLayer(null); setLayerDragMode(null); pickPointCbRef.current = null; setPickingPoint(false); }}
          mapCenter={mapCenter}
          onFlyTo={(lat, lng) => mapRef.current?.flyTo([lat, lng], 13, { duration: 1.2 })}
          onPickPoint={cb => { pickPointCbRef.current = cb; setPickingPoint(true); }}
          hidden={pickingPoint}
        />
      )}

      {pickingPoint && (
        <div className="pick-point-banner">
          <span>📍 Click vào vị trí mong muốn trên bản đồ để chọn tọa độ</span>
          <button className="pick-point-cancel" onClick={() => { pickPointCbRef.current = null; setPickingPoint(false); }}>✕ Hủy</button>
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
