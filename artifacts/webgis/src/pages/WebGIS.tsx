import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EditableValue from "../components/EditableValue";
import ImportModal, { type WardOverrides, type EthnicOverride, type PdfFile, type DanTocTyLe } from "../components/ImportModal";
import LayerControl, { type NewLayerInput } from "../components/LayerControl";
import TransectDiagram, { DEFAULT_ZONES, DEFAULT_ETHNIC_ZONES, type TransectZone, type EthnicZone } from "../components/TransectDiagram";
import SeasonalCalendar, { DEFAULT_ACTIVITIES, type CalendarGroup } from "../components/SeasonalCalendar";
import IndigenousKnowledge, { DEFAULT_KNOWLEDGE, type KnowledgeSection } from "../components/IndigenousKnowledge";
import AnnotationModal, { type Annotation } from "../components/AnnotationModal";
import LayerDataEditor from "../components/LayerDataEditor";

interface CustomLayer { id: string; categoryId: string; ten: string; mau: string; bieu_tuong: string; geomType: "point" | "line" | "polygon"; }

/* ─── Types ─── */
interface WardProperties { ma_xa: string; ten_xa: string; loai?: string; dtich_km2?: number; dan_so?: number; matdo_km2?: number; ten_tinh?: string; dan_toc?: DanTocTyLe[]; }
interface GeoJsonData { type: string; features: { type: string; properties: Record<string, unknown>; geometry: unknown }[]; }
interface BaiThuoc { ten: string; nguyen_lieu: string; cong_dung: string; }
interface TriThuc { chu_de: string; bieu_tuong: string; noi_dung: string; bai_thuoc: BaiThuoc[]; }
interface DanTocInfo { id: string; ten: string; mau: string; dan_so_ca_nuoc: number; ngon_ngu: string; mo_ta: string; tri_thuc: TriThuc[]; }
interface DanTocData { dan_toc: DanTocInfo[]; }
interface ProvinceStat { dien_tich: string; dan_so: string; don_vi: number; }
interface LayersData {
  rivers: { id?: string; ten: string; ten_dia_phuong: string; coords: number[][] }[];
  irrigation: { id?: string; ten: string; ten_dia_phuong: string; loai: string; lat: number; lng: number; mo_ta: string }[];
  villages?: { id?: string; ten: string; dan_toc: string; lat: number; lng: number; mo_ta: string }[];
  forests: { id?: string; ten: string; ten_dia_phuong: string; loai: string; lat: number; lng: number; mo_ta: string }[];
  vac_models: { id?: string; ten: string; loai: string; lat: number; lng: number; mo_ta: string; thanh_phan: string[] | string }[];
  medicinal_plants: { id?: string; ten: string; ten_khoa_hoc: string; lat: number; lng: number; cong_dung: string; tinh_trang?: string; "tình_trang"?: string; dan_toc_dung: string[] | string }[];
  customary_zones: { id?: string; ten: string; loai: string; mo_ta: string; coords: number[][] }[];
}

/* ─── Constants ─── */
const PROVINCE_FILES: Record<string, string> = { "Sơn La": "/data/xa_sonla.geojson", "Điện Biên": "/data/xa_dienbien.geojson", "Lai Châu": "/data/xa_laichau.geojson" };
const DEFAULT_STATS: Record<string, ProvinceStat> = { "Sơn La": { dien_tich: "14.174", dan_so: "1,25M", don_vi: 75 }, "Điện Biên": { dien_tich: "9.541", dan_so: "599K", don_vi: 45 }, "Lai Châu": { dien_tich: "9.068", dan_so: "460K", don_vi: 38 } };
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

const LAYER_CATEGORIES = [
  { id: "hydrology", ten: "Tài nguyên nước & Thủy văn", icon: "💧", layers: [
    { id: "rivers",     ten: "Sông suối chính",                    mau: "#4895ef", bieu_tuong: "〰️" },
    { id: "irrigation", ten: "Thủy lợi truyền thống (Mương·Phai)", mau: "#74c69d", bieu_tuong: "🚿" },
  ]},
  { id: "settlement", ten: "Dân cư & Hạ tầng", icon: "🏘️", layers: [
    { id: "ward_boundaries", ten: "Ranh giới xã/phường", mau: "#6b4226", bieu_tuong: "🗺️" },
  ]},
  { id: "landuse", ten: "Sử dụng đất & Sinh kế", icon: "🌾", layers: [
    { id: "forests",    ten: "Phân vùng rừng",             mau: "#2d6a4f", bieu_tuong: "🌲" },
    { id: "vac_models", ten: "Mô hình VAC/VACR tuần hoàn", mau: "#b5e48c", bieu_tuong: "♻️" },
  ]},
  { id: "culture", ten: "Tri thức & Văn hóa bản địa", icon: "🌿", layers: [
    { id: "medicinal_plants", ten: "Khu vực cây thuốc quý",        mau: "#e63946", bieu_tuong: "🌿" },
    { id: "customary_zones",  ten: "Ranh giới luật tục cộng đồng", mau: "#f4a261", bieu_tuong: "⚖️" },
  ]},
];

const EDITABLE_LAYERS = new Set(["rivers", "irrigation", "forests", "vac_models", "medicinal_plants", "customary_zones"]);
const LAYER_GEOM_TYPE: Record<string, "point" | "line" | "polygon"> = {
  rivers: "line", irrigation: "point", forests: "point", vac_models: "point",
  medicinal_plants: "point", customary_zones: "polygon",
};
const LAYER_DISPLAY: Record<string, { name: string; color: string }> = {
  rivers: { name: "Sông suối chính", color: "#4895ef" },
  irrigation: { name: "Thủy lợi truyền thống", color: "#74c69d" },
  forests: { name: "Phân vùng rừng", color: "#2d6a4f" },
  vac_models: { name: "Mô hình VAC/VACR", color: "#b5e48c" },
  medicinal_plants: { name: "Cây thuốc quý", color: "#e63946" },
  customary_zones: { name: "Luật tục cộng đồng", color: "#f4a261" },
};

const FOREST_COLORS: Record<string, string> = { rung_thieng: "#1b4332", rung_ma: "#7209b7", rung_dau_nguon: "#023e8a", rung_trong: "#52b788", rung_tu_nhien: "#2d6a4f", rung_dac_san: "#b7791f", rung_ma_lang: "#7209b7", rung_kieng: "#9d0208" };
const FOREST_LABELS: Record<string, string> = { rung_thieng: "Rừng thiêng", rung_ma: "Rừng ma", rung_dau_nguon: "Rừng đầu nguồn", rung_trong: "Rừng trồng", rung_tu_nhien: "Rừng tự nhiên", rung_dac_san: "Rừng đặc sản", rung_ma_lang: "Rừng ma làng", rung_kieng: "Rừng kiêng" };
const IRRIGATION_LABELS: Record<string, string> = { phai: "Phai (đập)", muong: "Mương (kênh)", lin: "Lịn (máng)", lai: "Lái (kênh phụ)" };
const ETHNIC_COLORS: Record<string, string> = { thai: "#2d6a4f", mong: "#b5179e", dao: "#f4a261", kho_mu: "#6d6875", muong: "#e76f51", la_hu: "#457b9d", lu: "#2a9d8f", mang: "#8338ec", kinh: "#e63946" };
const NHOM_LABELS: Record<string, string> = { tai_nguyen_nuoc:"💧", rung:"🌲", canh_tac:"🌾", ban_lang:"🏘️", van_hoa:"🏺", cay_thuoc:"🌿", luat_tuc:"⚖️", vac_vacr:"♻️", khac:"📍" };

function makeDivIcon(emoji: string, color: string, size = 28): L.DivIcon {
  return L.divIcon({ html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size*0.5}px;border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 6px rgba(0,0,0,0.4)">${emoji}</div>`, className: "", iconSize: [size,size], iconAnchor: [size/2,size/2] });
}

// Normalize array-or-string fields to array
const toArr = (v: string[] | string | undefined): string[] => Array.isArray(v) ? v : (typeof v === "string" && v.trim() ? v.split(",").map(s => s.trim()) : []);

export default function WebGIS() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const provincesLayerRef = useRef<L.GeoJSON | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);
  const annotationGroupRef = useRef<L.LayerGroup | null>(null);
  const layerInstancesRef = useRef<Map<string, L.Layer[]>>(new Map());
  const allWardsRef = useRef<WardProperties[]>([]);
  const drawingPolylineRef = useRef<L.Polyline | null>(null);
  const drawingCoordsRef = useRef<[number,number][]>([]);

  /* ─── Core state ─── */
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"province"|"ward">("province");
  const [danTocData, setDanTocData] = useState<DanTocData | null>(null);
  const [selectedDanToc, setSelectedDanToc] = useState<DanTocInfo | null>(null);
  const [activeTriThuc, setActiveTriThuc] = useState(0);
  const [layersData, setLayersData] = useState<LayersData | null>(null);
  const [allWardsGeoJson, setAllWardsGeoJson] = useState<GeoJsonData | null>(null);
  const [loadingWardBoundaries, setLoadingWardBoundaries] = useState(false);

  /* ─── Editable data state ─── */
  const [wardOverrides, setWardOverrides] = useState<Map<string,WardOverrides>>(new Map());
  const [ethnicOverrides, setEthnicOverrides] = useState<Map<string,EthnicOverride>>(new Map());
  const [triThucOverrides, setTriThucOverrides] = useState<Map<string,TriThuc[]>>(new Map());
  const [provinceEdits, setProvinceEdits] = useState<Map<string,Partial<ProvinceStat>>>(new Map());
  const [pdfFiles, setPdfFiles] = useState<Map<string,PdfFile[]>>(new Map());
  const [calendarData, setCalendarData] = useState<CalendarGroup[]>(DEFAULT_ACTIVITIES);
  const [transectZones, setTransectZones] = useState<TransectZone[]>(DEFAULT_ZONES);
  const [transectEthnic, setTransectEthnic] = useState<EthnicZone[]>(DEFAULT_ETHNIC_ZONES);
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeSection[]>(DEFAULT_KNOWLEDGE);
  const [customLayers, setCustomLayers] = useState<CustomLayer[]>([]);

  /* ─── UI state ─── */
  const [showImport, setShowImport] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showTransect, setShowTransect] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(["rivers"]));
  const [pdfViewer, setPdfViewer] = useState<PdfFile | null>(null);
  const [editingEthnicPct, setEditingEthnicPct] = useState<string|null>(null);
  const [editingLayer, setEditingLayer] = useState<string | null>(null);
  const [layerDragMode, setLayerDragMode] = useState<string | null>(null);

  /* ─── Annotation state ─── */
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [drawMode, setDrawMode] = useState<null|"diem"|"duong"|"vung">(null);
  const [pendingAnnotation, setPendingAnnotation] = useState<{coords:[number,number][];loai:"diem"|"duong"|"vung"}|null>(null);
  const [editingRecipe, setEditingRecipe] = useState<{ethId:string;topicIdx:number;recipeIdx:number|null;data:BaiThuoc}|null>(null);
  const [newTopicForm, setNewTopicForm] = useState<{ethId:string;chu_de:string;bieu_tuong:string;noi_dung:string}|null>(null);

  /* ─── Load data ─── */
  useEffect(() => {
    fetch(BASE_PATH+"/data/dan_toc.json").then(r=>r.json()).then(setDanTocData).catch(console.error);
    fetch(BASE_PATH+"/data/layers.json").then(r=>r.json()).then((d: any) => {
      // Normalize "tình_trang" → "tinh_trang" for consistent editing
      if (d.medicinal_plants) {
        d.medicinal_plants = d.medicinal_plants.map((p: any) => {
          const { ["tình_trang"]: tt, ...rest } = p;
          return tt && !rest.tinh_trang ? { ...rest, tinh_trang: tt } : rest;
        });
      }
      setLayersData(d);
    }).catch(console.error);
  }, []);

  /* ─── Lazy load ward boundaries when toggled ─── */
  useEffect(() => {
    if (!activeLayers.has("ward_boundaries") || allWardsGeoJson) return;
    setLoadingWardBoundaries(true);
    Promise.all([
      { p: "Sơn La", f: "/data/xa_sonla.geojson" },
      { p: "Điện Biên", f: "/data/xa_dienbien.geojson" },
      { p: "Lai Châu", f: "/data/xa_laichau.geojson" }
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

  /* ─── Build overlay layers (rebuild all on any data change) ─── */
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
        layersData.rivers.forEach(r => {
          if (!r.coords || r.coords.length < 2) return;
          const line = L.polyline(r.coords.map(([lng,lat])=>[lat,lng] as L.LatLngExpression), {color:"#4895ef",weight:3,opacity:0.8});
          line.bindTooltip(`<b>${r.ten}</b><br><i>${r.ten_dia_phuong || ""}</i>`,{sticky:true,className:"custom-tooltip"});
          ls.push(line);
        });
      } else if (id === "irrigation") {
        layersData.irrigation.forEach((ir, idx) => {
          const emoji = ir.loai==="phai"?"💧":ir.loai==="lin"?"〰️":"🚿";
          const popup = `<div class="map-popup"><div class="popup-title">${ir.ten}</div><div class="popup-sub">${IRRIGATION_LABELS[ir.loai]||ir.loai} · <i>${ir.ten_dia_phuong||""}</i></div><p>${ir.mo_ta||""}</p></div>`;
          ls.push(makeDraggableMarker(ir.lat, ir.lng, makeDivIcon(emoji,"#74c69d",26), "irrigation", idx, popup));
        });
      } else if (id === "forests") {
        layersData.forests.forEach((f, idx) => {
          const color = FOREST_COLORS[f.loai]||"#2d6a4f";
          const popup = `<div class="map-popup"><div class="popup-title">${f.ten}</div><div class="popup-sub" style="color:${color}">${FOREST_LABELS[f.loai]||f.loai} · <i>${f.ten_dia_phuong||""}</i></div><p>${f.mo_ta||""}</p></div>`;
          ls.push(makeDraggableMarker(f.lat, f.lng, makeDivIcon("🌲",color,26), "forests", idx, popup));
        });
      } else if (id === "vac_models") {
        layersData.vac_models.forEach((v, idx) => {
          const tp = toArr(v.thanh_phan);
          const popup = `<div class="map-popup"><div class="popup-title">${v.ten}</div><div class="popup-sub">Mô hình ${(v.loai||"").toUpperCase()}</div><p>${v.mo_ta||""}</p>${tp.length?`<ul>${tp.map(p=>`<li>${p}</li>`).join("")}</ul>`:""}</div>`;
          ls.push(makeDraggableMarker(v.lat, v.lng, makeDivIcon("♻️","#40916c",28), "vac_models", idx, popup));
        });
      } else if (id === "medicinal_plants") {
        layersData.medicinal_plants.forEach((p, idx) => {
          const tinh_trang = p.tinh_trang || (p as any)["tình_trang"] || "";
          const tinhTrangColor = tinh_trang.toLowerCase().includes("rất") || tinh_trang.toLowerCase().includes("nguy")?"#e63946":tinh_trang.toLowerCase().includes("hiem")||tinh_trang.toLowerCase().includes("hiếm")?"#f4a261":"#52b788";
          const popup = `<div class="map-popup"><div class="popup-title">${p.ten}</div><div class="popup-sub" style="font-style:italic">${p.ten_khoa_hoc||""}</div><p><b>Công dụng:</b> ${p.cong_dung||""}</p>${tinh_trang?`<p><b>Tình trạng:</b> <span style="color:${tinhTrangColor}">${tinh_trang}</span></p>`:""}</div>`;
          ls.push(makeDraggableMarker(p.lat, p.lng, makeDivIcon("🌿","#e63946",26), "medicinal_plants", idx, popup));
        });
      } else if (id === "customary_zones") {
        layersData.customary_zones.forEach(z => {
          const coords = (z.coords && Array.isArray(z.coords[0]) && Array.isArray((z.coords[0] as any)[0])) ? (z.coords as any)[0] : z.coords;
          if (!coords || coords.length < 3) return;
          const poly = L.polygon(coords.map(([lng,lat]: [number,number])=>[lat,lng] as L.LatLngExpression), {color:"#f4a261",weight:2,opacity:0.8,fillColor:"#f4a261",fillOpacity:0.12,dashArray:"6,4"});
          poly.bindPopup(`<div class="map-popup"><div class="popup-title">${z.ten}</div><div class="popup-sub">Luật tục: ${(z.loai||"").replace(/_/g," ")}</div><p>${z.mo_ta||""}</p></div>`);
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
        const layer = L.geoJSON(allWardsGeoJson as GeoJSON.FeatureCollection, {
          style: () => ({ color: "#6b4226", weight: 1, opacity: 0.55, fillColor: "#a8d5a2", fillOpacity: 0.06 }),
          onEachFeature: (feat, lyr) => {
            const p = feat.properties as any;
            lyr.bindTooltip(`<div class="ward-tooltip"><b>${p.ten_xa}</b><br><span style="opacity:0.7">${p.ten_tinh||""}</span></div>`, { sticky: true, className: "custom-tooltip ward-tip" });
            (lyr as L.Path).on({
              mouseover: e => { (e.target as L.Path).setStyle({ fillOpacity: 0.25, color: "#3d1f0d", weight: 2 }); },
              mouseout: e => { (e.target as L.Path).setStyle({ fillOpacity: 0.06, color: "#6b4226", weight: 1 }); },
            });
          }
        });
        ls.push(layer);
      }
      return ls;
    };

    // Clear all current layer instances and rebuild
    layerInstancesRef.current.forEach(layers => layers.forEach(l => og.removeLayer(l)));
    layerInstancesRef.current.clear();

    activeLayers.forEach(id => {
      const built = buildLayer(id);
      layerInstancesRef.current.set(id, built);
      built.forEach(l => og.addLayer(l));
    });
  }, [layersData, activeLayers, layerDragMode, allWardsGeoJson, customLayers]);

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
  const getWardValue = <K extends keyof WardProperties>(w:WardProperties,f:K):WardProperties[K] => { const ov=wardOverrides.get(w.ma_xa); return (ov&&f in ov?ov[f as string]:w[f]) as WardProperties[K]; };
  const getDanTocInfo = (id:string):DanTocInfo|undefined => { const b=danTocData?.dan_toc.find(d=>d.id===id); if (!b) return; const ov=ethnicOverrides.get(id); const triOv=triThucOverrides.get(id); return {...b,...(ov||{}),tri_thuc:triOv||b.tri_thuc}; };
  const getProvinceStat = (t:string):ProvinceStat => ({...(DEFAULT_STATS[t]||{dien_tich:"—",dan_so:"—",don_vi:0}),...provinceEdits.get(t)});
  const updateWardField = (ma_xa:string,field:string,value:unknown) => setWardOverrides(p=>{const n=new Map(p);n.set(ma_xa,{...n.get(ma_xa),[field]:value});return n;});
  const updateEthnicField = (id:string,field:keyof EthnicOverride,value:string|number) => setEthnicOverrides(p=>{const n=new Map(p);n.set(id,{...n.get(id),[field]:value});return n;});
  const updateProvinceStat = (t:string,f:keyof ProvinceStat,v:string) => setProvinceEdits(p=>{const n=new Map(p);n.set(t,{...n.get(t),[f]:f==="don_vi"?(parseInt(v)||0):v});return n;});
  const addPdf = (key:string,files:PdfFile[]) => setPdfFiles(p=>{const n=new Map(p);n.set(key,[...(n.get(key)||[]),...files]);return n;});
  const removePdf = (key:string,idx:number) => setPdfFiles(p=>{const n=new Map(p);const l=[...(n.get(key)||[])];URL.revokeObjectURL(l[idx].url);l.splice(idx,1);if(l.length===0)n.delete(key);else n.set(key,l);return n;});

  const updateWardEthnicPct = (ma_xa:string,danTocId:string,rawVal:string) => {
    const pct=Math.max(0,Math.min(100,parseFloat(rawVal)||0));
    const list=(wardOverrides.get(ma_xa)?.dan_toc??selectedWard?.dan_toc??[]).map(d=>({...d}));
    const idx=list.findIndex(d=>d.dan_toc===danTocId);
    if(idx>=0)list[idx].ty_le=pct;else list.push({dan_toc:danTocId,ty_le:pct});
    const total=list.reduce((s,d)=>s+d.ty_le,0);
    const norm=total>0?list.map(d=>({...d,ty_le:Math.round(d.ty_le*100/total)})):list;
    updateWardField(ma_xa,"dan_toc",norm.filter(d=>d.ty_le>0).sort((a,b)=>b.ty_le-a.ty_le));
    setEditingEthnicPct(null);
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
    setLayersData(prev => {
      if (!prev) return prev;
      const next = { ...prev } as any;
      next[layerId] = [...(next[layerId] || []), feature];
      return next;
    });
  };
  const updateLayerFeature = (layerId: string, idx: number, feature: any) => {
    setLayersData(prev => {
      if (!prev) return prev;
      const next = { ...prev } as any;
      const arr = [...next[layerId]];
      arr[idx] = feature;
      next[layerId] = arr;
      return next;
    });
  };
  const deleteLayerFeature = (layerId: string, idx: number) => {
    setLayersData(prev => {
      if (!prev) return prev;
      const next = { ...prev } as any;
      next[layerId] = next[layerId].filter((_: any, i: number) => i !== idx);
      return next;
    });
  };

  /* ─── Custom layer CRUD ─── */
  const addCustomLayer = (categoryId: string, input: NewLayerInput) => {
    const id = "custom_" + Math.random().toString(36).slice(2, 9);
    const cl: CustomLayer = { id, categoryId, ten: input.ten, mau: input.mau, bieu_tuong: input.bieu_tuong, geomType: input.geomType };
    setCustomLayers(prev => [...prev, cl]);
    setLayersData(prev => ({ ...(prev || {} as LayersData), [id]: [] } as LayersData));
    setActiveLayers(prev => new Set([...prev, id]));
  };
  const deleteCustomLayer = (id: string) => {
    setCustomLayers(prev => prev.filter(c => c.id !== id));
    setLayersData(prev => {
      if (!prev) return prev;
      const next = { ...prev } as any;
      delete next[id];
      return next;
    });
    setActiveLayers(prev => { const n = new Set(prev); n.delete(id); return n; });
    if (editingLayer === id) setEditingLayer(null);
    if (layerDragMode === id) setLayerDragMode(null);
  };

  /* ─── Toggle layer ─── */
  const toggleLayer = (id:string) => {
    setActiveLayers(prev=>{
      const next=new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // turning off — also stop edit/drag for that layer
        if (editingLayer === id) setEditingLayer(null);
        if (layerDragMode === id) setLayerDragMode(null);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openLayerEditor = (layerId: string) => {
    // Auto-activate the layer if not active
    if (!activeLayers.has(layerId)) {
      setActiveLayers(prev => new Set([...prev, layerId]));
    }
    setEditingLayer(layerId);
    setShowLayers(false); // close layer list to give room
  };

  /* ─── Map initialization ─── */
  const addProvincesLayer = (map:L.Map, data:GeoJsonData) => {
    if(provincesLayerRef.current)map.removeLayer(provincesLayerRef.current);
    const layer = L.geoJSON(data as GeoJSON.FeatureCollection, {
      style:()=>({color:"#2d6a4f",weight:2.5,opacity:0.9,fillColor:"#74c69d",fillOpacity:0.2}),
      onEachFeature:(feat,lyr)=>{
        const p=feat.properties as {ten_tinh:string};
        (lyr as L.Path).on({
          mouseover:e=>{(e.target as L.Path).setStyle({fillOpacity:0.45,color:"#1b4332",weight:3.5});(e.target as L.Path).bringToFront();},
          mouseout:e=>{(e.target as L.Path).setStyle({fillOpacity:0.2,color:"#2d6a4f",weight:2.5});},
          click:()=>handleProvinceClick(p.ten_tinh)
        });
        lyr.bindTooltip(`<strong>${p.ten_tinh}</strong>`,{sticky:true,className:"custom-tooltip"});
      },
    });
    layer.addTo(map); provincesLayerRef.current=layer;
  };

  const initMap = useCallback(async () => {
    if(!mapContainerRef.current||mapRef.current)return;
    const map=L.map(mapContainerRef.current,{center:[21.7,103.5],zoom:7,zoomControl:false,doubleClickZoom:false});
    L.control.zoom({position:"topright"}).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',maxZoom:18}).addTo(map);
    const og=L.layerGroup().addTo(map);
    const ag=L.layerGroup().addTo(map);
    overlayGroupRef.current=og; annotationGroupRef.current=ag; mapRef.current=map;
    try {
      const data=await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(map,data);
      const b=L.geoJSON(data as GeoJSON.FeatureCollection).getBounds();
      if(b.isValid())map.fitBounds(b,{padding:[40,40],maxZoom:9});
    } catch(e){console.error(e);}
  }, []);

  const handleProvinceClick = async (name:string) => {
    if(!mapRef.current)return;
    setLoading(true);setSelectedProvince(name);setSelectedWard(null);setSelectedDanToc(null);
    try {
      const data=await fetchGeoJson(PROVINCE_FILES[name]);
      allWardsRef.current=data.features.map(f=>f.properties as unknown as WardProperties);
      if(provincesLayerRef.current){mapRef.current.removeLayer(provincesLayerRef.current);provincesLayerRef.current=null;}
      if(wardsLayerRef.current){mapRef.current.removeLayer(wardsLayerRef.current);wardsLayerRef.current=null;}
      const wl=L.geoJSON(data as GeoJSON.FeatureCollection,{
        style:()=>({color:"#6b4226",weight:1.5,opacity:0.8,fillColor:"#a8d5a2",fillOpacity:0.3}),
        onEachFeature:(feat,lyr)=>{
          const p=feat.properties as unknown as WardProperties;
          (lyr as L.Path).on({
            mouseover:e=>{(e.target as L.Path).setStyle({fillOpacity:0.6,color:"#3d1f0d",weight:2.5,fillColor:"#52b788"});(e.target as L.Path).bringToFront();},
            mouseout:e=>{(e.target as L.Path).setStyle({fillOpacity:0.3,color:"#6b4226",weight:1.5,fillColor:"#a8d5a2"});},
            click:()=>{setSelectedWard(p);setSelectedDanToc(null);setActiveTriThuc(0);setEditingEthnicPct(null);}
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
    setSelectedProvince(null);setSelectedWard(null);setSelectedDanToc(null);setViewMode("province");allWardsRef.current=[];
    try {
      const data=await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(mapRef.current,data);
      const b=L.geoJSON(data as GeoJSON.FeatureCollection).getBounds();
      if(b.isValid())mapRef.current.flyToBounds(b,{padding:[40,40],maxZoom:9,duration:1.5});
    } catch(e){console.error(e);} finally{setLoading(false);}
  };

  useEffect(()=>{initMap();return()=>{if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};},[initMap]);

  /* ─── Derived ─── */
  const wardDanToc:DanTocTyLe[]=selectedWard?(wardOverrides.get(selectedWard.ma_xa)?.dan_toc??selectedWard.dan_toc??[]):[];
  const wardPdfs=selectedWard?(pdfFiles.get(selectedWard.ma_xa)||[]):[];
  const wardCustom=selectedWard?wardOverrides.get(selectedWard.ma_xa):undefined;
  const stats=selectedProvince?getProvinceStat(selectedProvince):null;
  const layerCategoriesWithState = LAYER_CATEGORIES.map(cat => ({
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
  const customDisplay: Record<string, { name: string; color: string }> = {};
  const customGeom: Record<string, "point" | "line" | "polygon"> = {};
  customLayers.forEach(c => { customDisplay[c.id] = { name: c.ten, color: c.mau }; customGeom[c.id] = c.geomType; });
  const layerDisplayAll = { ...LAYER_DISPLAY, ...customDisplay };
  const layerGeomAll = { ...LAYER_GEOM_TYPE, ...customGeom };

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
  const mapCenter: [number, number] = mapRef.current ? [mapRef.current.getCenter().lat, mapRef.current.getCenter().lng] : [21.7, 103.5];

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
          <div className="header-breadcrumb">
            {viewMode==="province"?<span className="breadcrumb-item active">Toàn vùng</span>:(
              <><button className="breadcrumb-item link" onClick={handleBack}>Toàn vùng</button><span className="breadcrumb-sep">›</span><span className="breadcrumb-item active">{selectedProvince}</span>{selectedWard&&<><span className="breadcrumb-sep">›</span><span className="breadcrumb-item active">{(getWardValue(selectedWard,"ten_xa") as string)||selectedWard.ten_xa}</span></>}</>
            )}
          </div>
          <button className={`layer-toggle-btn ${showLayers?"active":""}`} onClick={()=>setShowLayers(s=>!s)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            Lớp bản đồ {activeLayers.size>0&&<span className="layer-count">{activeLayers.size}</span>}
          </button>
          <button className="import-btn" onClick={()=>setShowImport(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Nhập dữ liệu
          </button>
        </div>
      </div>

      <div className="map-body">
        {showLayers&&<LayerControl
          categories={layerCategoriesWithState}
          onToggle={toggleLayer}
          onEditLayer={openLayerEditor}
          onAddCustomLayer={addCustomLayer}
          onDeleteCustomLayer={deleteCustomLayer}
          featureCounts={featureCounts}
          editableLayers={allEditableLayers}
          onClose={()=>setShowLayers(false)}
          showTransect={showTransect}
          onToggleTransect={()=>setShowTransect(s=>!s)}
          showCalendar={showCalendar}
          onToggleCalendar={()=>setShowCalendar(s=>!s)}
          showKnowledge={showKnowledge}
          onToggleKnowledge={()=>setShowKnowledge(s=>!s)}
        />}

        {/* ─── Map ─── */}
        <div className="map-wrapper">
          <div ref={mapContainerRef} className="map-canvas"/>
          {(loading||loadingWardBoundaries)&&<div className="map-overlay"><div className="loading-spinner"/><span>{loadingWardBoundaries?"Đang tải ranh giới xã của 3 tỉnh...":"Đang tải dữ liệu..."}</span></div>}
          {viewMode==="ward"&&<button className="back-button" onClick={handleBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon"><polyline points="15 18 9 12 15 6"/></svg>Quay lại bản đồ vùng</button>}
          {viewMode==="province"&&!drawMode&&<div className="map-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Click vào tỉnh để xem ranh giới xã và dân tộc</div>}

          {/* Drawing toolbar */}
          <div className="draw-toolbar">
            {drawMode ? (
              <div className="draw-active-bar">
                <span className="draw-hint">{drawMode==="diem"?"Click để đặt điểm":"Click để thêm điểm · Double-click để hoàn thành"}</span>
                <button className="draw-cancel-btn" onClick={cancelDraw}>✕ Hủy vẽ</button>
              </div>
            ) : (
              <>
                <button className={`draw-btn ${showAnnotations?"active":""}`} onClick={()=>setShowAnnotations(s=>!s)} title="Danh sách đối tượng">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  {annotations.length>0&&<span className="ann-count">{annotations.length}</span>}
                </button>
                <div className="draw-sep"/>
                <button className="draw-btn" onClick={()=>setDrawMode("diem")} title="Thêm điểm">📍</button>
                <button className="draw-btn" onClick={()=>setDrawMode("duong")} title="Vẽ đường/tuyến">〰️</button>
                <button className="draw-btn" onClick={()=>setDrawMode("vung")} title="Vẽ vùng/khu vực">⬡</button>
              </>
            )}
          </div>

          {/* Drag mode indicator banner */}
          {layerDragMode && (
            <div className="drag-mode-banner">
              ✋ Đang ở chế độ kéo thả lớp <b>{layerDisplayAll[layerDragMode]?.name || layerDragMode}</b> — kéo các điểm trên bản đồ để di chuyển
              <button className="drag-mode-off" onClick={() => setLayerDragMode(null)}>✕ Tắt</button>
            </div>
          )}

          {/* Annotation list panel */}
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

          <div className="map-legend">
            <div className="legend-title">Chú giải</div>
            {viewMode==="province"?<div className="legend-item"><div className="legend-color province-color"/><span>Ranh giới tỉnh</span></div>:<div className="legend-item"><div className="legend-color ward-color"/><span>Ranh giới xã/phường</span></div>}
            {activeLayers.has("ward_boundaries")&&<div className="legend-item"><div className="legend-color" style={{background:"transparent",border:"1.5px solid #6b4226"}}/><span>Ranh giới xã (3 tỉnh)</span></div>}
            {activeLayers.has("rivers")&&<div className="legend-item"><div className="legend-color" style={{background:"#4895ef"}}/><span>Sông suối</span></div>}
            {activeLayers.has("irrigation")&&<div className="legend-item"><div className="legend-color" style={{background:"#74c69d"}}/><span>Thủy lợi</span></div>}
            {activeLayers.has("forests")&&<div className="legend-item"><div className="legend-color" style={{background:"#2d6a4f"}}/><span>Rừng</span></div>}
            {activeLayers.has("vac_models")&&<div className="legend-item"><div className="legend-color" style={{background:"#40916c"}}/><span>VAC/VACR</span></div>}
            {activeLayers.has("medicinal_plants")&&<div className="legend-item"><div className="legend-color" style={{background:"#e63946"}}/><span>Cây thuốc</span></div>}
            {activeLayers.has("customary_zones")&&<div className="legend-item"><div className="legend-color" style={{background:"#f4a261"}}/><span>Luật tục</span></div>}
            {annotations.length>0&&<div className="legend-item"><div className="legend-color" style={{background:"#e9c46a"}}/><span>Đối tượng của tôi</span></div>}
          </div>
        </div>

        {/* ─── Info panel ─── */}
        {viewMode==="ward"&&(
          <div className="info-panel">
            <div className="info-panel-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div><div className="panel-title">Thông tin địa bàn</div><div className="panel-subtitle">{selectedProvince}</div></div>
            </div>

            {selectedWard?(
              <div className="ward-info">
                <div className="ward-name-wrap"><EditableValue value={(getWardValue(selectedWard,"ten_xa") as string)||selectedWard.ten_xa} className="ward-name-editable" onSave={v=>updateWardField(selectedWard.ma_xa,"ten_xa",v)}/></div>
                <div className="ward-badge-row"><EditableValue value={(getWardValue(selectedWard,"loai") as string)||selectedWard.loai||""} placeholder="Loại đơn vị" className="ward-badge-editable" onSave={v=>updateWardField(selectedWard.ma_xa,"loai",v)}/></div>
                <div className="info-grid">
                  <div className="info-row"><div className="info-label">Mã đơn vị</div><div className="info-value">{selectedWard.ma_xa}</div></div>
                  <div className="info-row"><div className="info-label">Diện tích</div><div className="info-value"><EditWard field="dtich_km2" suffix=" km²" type="number" decimals={2}/></div></div>
                  <div className="info-row"><div className="info-label">Dân số</div><div className="info-value"><EditWard field="dan_so" suffix=" người" type="number"/></div></div>
                  <div className="info-row"><div className="info-label">Mật độ</div><div className="info-value"><EditWard field="matdo_km2" suffix=" ng/km²" type="number" decimals={1}/></div></div>
                </div>
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
                    <div className="ethnic-section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Các dân tộc sinh sống</div>
                    <p className="ethnic-hint">Click tên → tri thức bản địa · Click % → chỉnh tỷ lệ</p>
                    <div className="ethnic-tags">
                      {wardDanToc.map(({dan_toc,ty_le})=>{
                        const info=getDanTocInfo(dan_toc);if(!info)return null;
                        const isActive=selectedDanToc?.id===dan_toc;
                        return(<div key={dan_toc} className={`ethnic-tag ${isActive?"active":""}`} style={{"--tag-color":info.mau} as React.CSSProperties}>
                          <span className="tag-dot" style={{background:info.mau}}/><button className="tag-name-btn" onClick={()=>{setSelectedDanToc(isActive?null:info);setActiveTriThuc(0);}}>{info.ten.replace("Dân tộc ","").replace("Người ","")}</button>
                          {editingEthnicPct===dan_toc?<input className="pct-input" type="number" min="0" max="100" defaultValue={ty_le} autoFocus onBlur={e=>updateWardEthnicPct(selectedWard.ma_xa,dan_toc,e.target.value)} onKeyDown={e=>{if(e.key==="Enter")updateWardEthnicPct(selectedWard.ma_xa,dan_toc,(e.target as HTMLInputElement).value);if(e.key==="Escape")setEditingEthnicPct(null);}}/>:<button className="tag-pct-btn" onClick={()=>setEditingEthnicPct(dan_toc)} title="Click để chỉnh">{ty_le}%</button>}
                        </div>);
                      })}
                    </div>
                    <div className="ethnic-bar-wrap">{wardDanToc.map(({dan_toc,ty_le})=>{const info=getDanTocInfo(dan_toc);return info?<div key={dan_toc} className="ethnic-bar-seg" style={{width:`${ty_le}%`,background:info.mau}} title={`${info.ten.replace("Dân tộc ","")}: ${ty_le}%`}/>:null;})}</div>
                  </div>
                )}

                {/* ─── Ethnic knowledge panel (fully editable) ─── */}
                {selectedDanToc&&(()=>{
                  const info=getDanTocInfo(selectedDanToc.id)!;
                  const ethnicPdfs=pdfFiles.get("ethnic_"+info.id)||[];
                  const triThuc=getTriThuc(info.id);

                  return(<div className="knowledge-panel">
                    <div className="knowledge-header" style={{borderLeftColor:info.mau}}>
                      <div className="knowledge-name" style={{color:info.mau}}>{info.ten}</div>
                      <div className="knowledge-meta-row">
                        <EditableValue value={info.ngon_ngu} className="editable-meta" onSave={v=>updateEthnicField(info.id,"ngon_ngu",v)}/>
                        <span> · </span>
                        <EditableValue value={info.dan_so_ca_nuoc} suffix=" người" type="number" className="editable-meta" onSave={v=>updateEthnicField(info.id,"dan_so_ca_nuoc",parseInt(v)||0)}/>
                      </div>
                      <EditableValue value={info.mo_ta} className="knowledge-desc-editable" onSave={v=>updateEthnicField(info.id,"mo_ta",v)}/>
                    </div>

                    {ethnicPdfs.length>0&&<div className="ethnic-pdf-list">{ethnicPdfs.map((pdf,i)=>(<div key={i} className="pdf-item"><div className="pdf-info"><span className="pdf-name">{pdf.name}</span></div><div className="pdf-actions"><button className="pdf-btn view" onClick={()=>setPdfViewer(pdf)}>Xem</button><button className="pdf-btn remove" onClick={()=>removePdf("ethnic_"+info.id,i)}>✕</button></div></div>))}</div>}

                    {/* Topic tabs */}
                    <div className="knowledge-tabs">
                      {triThuc.map((tt,i)=>(
                        <button key={i} className={`knowledge-tab ${activeTriThuc===i?"active":""}`} style={{"--tab-color":info.mau} as React.CSSProperties} onClick={()=>setActiveTriThuc(i)}>
                          <span>{tt.bieu_tuong}</span><span>{tt.chu_de}</span>
                        </button>
                      ))}
                      <button className="knowledge-tab add-tab" onClick={()=>setNewTopicForm({ethId:info.id,chu_de:"",bieu_tuong:"📌",noi_dung:""})} title="Thêm chủ đề mới">+</button>
                    </div>

                    {/* New topic form */}
                    {newTopicForm?.ethId===info.id&&(
                      <div className="new-topic-form">
                        <div className="ntf-row"><input className="ntf-input small" value={newTopicForm.bieu_tuong} onChange={e=>setNewTopicForm(f=>f?{...f,bieu_tuong:e.target.value}:f)} placeholder="🏺" maxLength={2}/><input className="ntf-input" value={newTopicForm.chu_de} onChange={e=>setNewTopicForm(f=>f?{...f,chu_de:e.target.value}:f)} placeholder="Tên chủ đề tri thức..."/></div>
                        <textarea className="ntf-textarea" value={newTopicForm.noi_dung} onChange={e=>setNewTopicForm(f=>f?{...f,noi_dung:e.target.value}:f)} placeholder="Mô tả tri thức bản địa về chủ đề này..." rows={3}/>
                        <div className="ntf-actions"><button className="ntf-cancel" onClick={()=>setNewTopicForm(null)}>Hủy</button><button className="ntf-save" disabled={!newTopicForm.chu_de.trim()} onClick={()=>addTriThucTopic(info.id,newTopicForm.chu_de,newTopicForm.bieu_tuong,newTopicForm.noi_dung)}>Thêm chủ đề</button></div>
                      </div>
                    )}

                    {/* Topic content - editable */}
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

                        {/* Recipes */}
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
            ):(
              <div className="ward-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>Click vào một xã/phường trên bản đồ để xem và chỉnh sửa thông tin</p></div>
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
          </div>
        )}
      </div>

      {/* ─── Modals ─── */}
      {showImport&&<ImportModal onClose={()=>setShowImport(false)} wardOverrides={wardOverrides} onApplyWardCSV={setWardOverrides} onClearWardData={()=>setWardOverrides(new Map())} ethnicOverrides={ethnicOverrides} onApplyEthnicCSV={setEthnicOverrides} onClearEthnicData={()=>setEthnicOverrides(new Map())} pdfFiles={pdfFiles} onAddPdf={addPdf} onRemovePdf={removePdf} onViewPdf={setPdfViewer} currentWard={selectedWard?{ma_xa:selectedWard.ma_xa,ten_xa:selectedWard.ten_xa}:null} wardList={allWardsRef.current.map(w=>({ma_xa:w.ma_xa,ten_xa:w.ten_xa}))}/>}
      {showTransect&&<TransectDiagram onClose={()=>setShowTransect(false)} zones={transectZones} ethnicZones={transectEthnic} onChangeZones={setTransectZones} onChangeEthnicZones={setTransectEthnic}/>}
      {showCalendar&&<SeasonalCalendar onClose={()=>setShowCalendar(false)} data={calendarData} onChange={setCalendarData}/>}
      {showKnowledge&&<IndigenousKnowledge onClose={()=>setShowKnowledge(false)} data={knowledgeData} onChange={setKnowledgeData}/>}
      {pendingAnnotation&&<AnnotationModal coords={pendingAnnotation.coords} loai={pendingAnnotation.loai} onSave={saveAnnotation} onCancel={()=>setPendingAnnotation(null)}/>}

      {editingLayer&&layerDisplayAll[editingLayer]&&(
        <LayerDataEditor
          layerId={editingLayer}
          layerName={layerDisplayAll[editingLayer].name}
          layerColor={layerDisplayAll[editingLayer].color}
          features={editingLayerFeatures}
          geomType={layerGeomAll[editingLayer]}
          dragMode={layerDragMode === editingLayer}
          onToggleDrag={() => setLayerDragMode(prev => prev === editingLayer ? null : editingLayer)}
          onAdd={f => addLayerFeature(editingLayer, f)}
          onUpdate={(idx, f) => updateLayerFeature(editingLayer, idx, f)}
          onDelete={idx => deleteLayerFeature(editingLayer, idx)}
          onClose={() => { setEditingLayer(null); setLayerDragMode(null); }}
          mapCenter={mapCenter}
          onFlyTo={(lat, lng) => mapRef.current?.flyTo([lat, lng], 13, { duration: 1.2 })}
        />
      )}

      {/* Add recipe modal */}
      {editingRecipe&&(()=>{
        const {ethId,topicIdx,data}=editingRecipe;
        return(
          <div className="annotation-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setEditingRecipe(null);}}>
            <div className="annotation-modal">
              <div className="ann-modal-header"><span>Thêm bài thuốc / kỹ thuật</span><button className="modal-close" onClick={()=>setEditingRecipe(null)}>✕</button></div>
              <div className="ann-modal-body">
                <div className="ann-field"><label>Tên bài thuốc / kỹ thuật *</label><input className="ann-input" value={data.ten} onChange={e=>setEditingRecipe(r=>r?{...r,data:{...r.data,ten:e.target.value}}:r)} placeholder="VD: Thuốc chữa đau lưng, Kỹ thuật ủ phân..."/></div>
                <div className="ann-field"><label>Nguyên liệu / Vật liệu</label><textarea className="ann-textarea" value={data.nguyen_lieu} onChange={e=>setEditingRecipe(r=>r?{...r,data:{...r.data,nguyen_lieu:e.target.value}}:r)} placeholder="Liệt kê nguyên liệu, cây cỏ, dụng cụ..." rows={2}/></div>
                <div className="ann-field"><label>Công dụng / Cách dùng</label><textarea className="ann-textarea" value={data.cong_dung} onChange={e=>setEditingRecipe(r=>r?{...r,data:{...r.data,cong_dung:e.target.value}}:r)} placeholder="Mô tả công dụng và cách sử dụng..." rows={2}/></div>
                <div className="ann-actions">
                  <button className="ann-btn-cancel" onClick={()=>setEditingRecipe(null)}>Hủy</button>
                  <button className="ann-btn-save" disabled={!data.ten.trim()} onClick={()=>{
                    const triList=getTriThuc(ethId);
                    const recs=[...triList[topicIdx].bai_thuoc,{ten:data.ten,nguyen_lieu:data.nguyen_lieu,cong_dung:data.cong_dung}];
                    updateBaiThuoc(ethId,topicIdx,recs);setEditingRecipe(null);
                  }}>Lưu</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {pdfViewer&&(
        <div className="pdf-viewer-overlay" onClick={e=>{if(e.target===e.currentTarget)setPdfViewer(null);}}>
          <div className="pdf-viewer-modal">
            <div className="pdf-viewer-header"><span className="pdf-viewer-title">{pdfViewer.name}</span><button className="modal-close" onClick={()=>setPdfViewer(null)}>✕</button></div>
            <iframe src={pdfViewer.url} className="pdf-viewer-iframe" title={pdfViewer.name}/>
          </div>
        </div>
      )}
    </div>
  );
}
