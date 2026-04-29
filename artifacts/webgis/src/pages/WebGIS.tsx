import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EditableValue from "../components/EditableValue";
import ImportModal, { type WardOverrides, type EthnicOverride, type PdfFile, type DanTocTyLe } from "../components/ImportModal";
import LayerControl from "../components/LayerControl";
import TransectDiagram from "../components/TransectDiagram";
import SeasonalCalendar from "../components/SeasonalCalendar";

/* ─── Types ─── */
interface WardProperties { ma_xa: string; ten_xa: string; loai?: string; dtich_km2?: number; dan_so?: number; matdo_km2?: number; ten_tinh?: string; dan_toc?: DanTocTyLe[]; }
interface GeoJsonData { type: string; features: { type: string; properties: Record<string, unknown>; geometry: unknown }[]; }
interface TriThuc { chu_de: string; bieu_tuong: string; noi_dung: string; bai_thuoc: { ten: string; nguyen_lieu: string; cong_dung: string }[]; }
interface DanTocInfo { id: string; ten: string; mau: string; dan_so_ca_nuoc: number; ngon_ngu: string; mo_ta: string; tri_thuc: TriThuc[]; }
interface DanTocData { dan_toc: DanTocInfo[]; }
interface ProvinceStat { dien_tich: string; dan_so: string; don_vi: number; }
interface LayersData {
  rivers: { id: string; ten: string; ten_dia_phuong: string; coords: number[][] }[];
  irrigation: { id: string; ten: string; ten_dia_phuong: string; loai: string; lat: number; lng: number; mo_ta: string }[];
  villages: { id: string; ten: string; dan_toc: string; lat: number; lng: number; mo_ta: string }[];
  forests: { id: string; ten: string; ten_dia_phuong: string; loai: string; lat: number; lng: number; mo_ta: string }[];
  vac_models: { id: string; ten: string; loai: string; lat: number; lng: number; mo_ta: string; thanh_phan: string[] }[];
  medicinal_plants: { id: string; ten: string; ten_khoa_hoc: string; lat: number; lng: number; cong_dung: string; tình_trang: string; dan_toc_dung: string[] }[];
  customary_zones: { id: string; ten: string; loai: string; mo_ta: string; coords: number[][] }[];
}

/* ─── Constants ─── */
const PROVINCE_FILES: Record<string, string> = { "Sơn La": "/data/xa_sonla.geojson", "Điện Biên": "/data/xa_dienbien.geojson", "Lai Châu": "/data/xa_laichau.geojson" };
const DEFAULT_STATS: Record<string, ProvinceStat> = { "Sơn La": { dien_tich: "14.174", dan_so: "1,25M", don_vi: 75 }, "Điện Biên": { dien_tich: "9.541", dan_so: "599K", don_vi: 45 }, "Lai Châu": { dien_tich: "9.068", dan_so: "460K", don_vi: 38 } };
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─── Layer config ─── */
const LAYER_CATEGORIES = [
  { id: "hydrology", ten: "Tài nguyên nước & Thủy văn", icon: "💧", layers: [
    { id: "rivers",     ten: "Sông suối chính",                   mau: "#4895ef", bieu_tuong: "〰️" },
    { id: "irrigation", ten: "Thủy lợi truyền thống (Mương·Phai)", mau: "#74c69d", bieu_tuong: "🚿" },
  ]},
  { id: "settlement", ten: "Dân cư & Hạ tầng", icon: "🏘️", layers: [
    { id: "villages", ten: "Bản làng", mau: "#f4a261", bieu_tuong: "🏘️" },
  ]},
  { id: "landuse", ten: "Sử dụng đất & Sinh kế", icon: "🌾", layers: [
    { id: "forests",     ten: "Phân vùng rừng",               mau: "#2d6a4f", bieu_tuong: "🌲" },
    { id: "vac_models",  ten: "Mô hình VAC/VACR tuần hoàn",   mau: "#b5e48c", bieu_tuong: "♻️" },
  ]},
  { id: "culture", ten: "Tri thức & Văn hóa bản địa", icon: "🌿", layers: [
    { id: "medicinal_plants", ten: "Khu vực cây thuốc quý",        mau: "#e63946", bieu_tuong: "🌿" },
    { id: "customary_zones",  ten: "Ranh giới luật tục cộng đồng", mau: "#f4a261", bieu_tuong: "⚖️" },
  ]},
];

/* ─── Forest colors ─── */
const FOREST_COLORS: Record<string, string> = {
  rung_thieng: "#1b4332", rung_ma: "#7209b7", rung_dau_nguon: "#023e8a",
  rung_trong: "#52b788", rung_tu_nhien: "#2d6a4f", rung_dac_san: "#b7791f",
};
const FOREST_LABELS: Record<string, string> = {
  rung_thieng: "Rừng thiêng", rung_ma: "Rừng ma", rung_dau_nguon: "Rừng đầu nguồn",
  rung_trong: "Rừng trồng", rung_tu_nhien: "Rừng tự nhiên", rung_dac_san: "Rừng đặc sản",
};
const IRRIGATION_LABELS: Record<string, string> = { phai: "Phai (đập)", muong: "Mương (kênh)", lin: "Lịn (máng)", lai: "Lái (kênh phụ)" };
const ETHNIC_COLORS: Record<string, string> = { thai: "#2d6a4f", mong: "#b5179e", dao: "#f4a261", kho_mu: "#6d6875", muong: "#e76f51", la_hu: "#457b9d", lu: "#2a9d8f", mang: "#8338ec", kinh: "#e63946" };

function makeDivIcon(emoji: string, color: string, size = 28): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.5}px;border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 6px rgba(0,0,0,0.4)">${emoji}</div>`,
    className: "", iconSize: [size, size], iconAnchor: [size/2, size/2],
  });
}

export default function WebGIS() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const provincesLayerRef = useRef<L.GeoJSON | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);
  const layerInstancesRef = useRef<Map<string, L.Layer[]>>(new Map());
  const allWardsRef = useRef<WardProperties[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"province" | "ward">("province");
  const [danTocData, setDanTocData] = useState<DanTocData | null>(null);
  const [selectedDanToc, setSelectedDanToc] = useState<DanTocInfo | null>(null);
  const [activeTriThuc, setActiveTriThuc] = useState(0);
  const [layersData, setLayersData] = useState<LayersData | null>(null);

  /* Editable data */
  const [wardOverrides, setWardOverrides] = useState<Map<string, WardOverrides>>(new Map());
  const [ethnicOverrides, setEthnicOverrides] = useState<Map<string, EthnicOverride>>(new Map());
  const [provinceEdits, setProvinceEdits] = useState<Map<string, Partial<ProvinceStat>>>(new Map());
  const [pdfFiles, setPdfFiles] = useState<Map<string, PdfFile[]>>(new Map());

  /* UI state */
  const [showImport, setShowImport] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showTransect, setShowTransect] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(["rivers", "villages"]));
  const [pdfViewer, setPdfViewer] = useState<PdfFile | null>(null);
  const [editingEthnicPct, setEditingEthnicPct] = useState<string | null>(null);

  /* ─── Load data ─── */
  useEffect(() => {
    fetch(BASE_PATH + "/data/dan_toc.json").then(r => r.json()).then(setDanTocData).catch(console.error);
    fetch(BASE_PATH + "/data/layers.json").then(r => r.json()).then(setLayersData).catch(console.error);
  }, []);

  /* ─── Build Leaflet layer instances from data ─── */
  useEffect(() => {
    if (!layersData || !overlayGroupRef.current) return;
    const og = overlayGroupRef.current;

    const buildLayer = (id: string): L.Layer[] => {
      const layers: L.Layer[] = [];
      if (id === "rivers") {
        layersData.rivers.forEach(r => {
          const line = L.polyline(r.coords.map(([lng, lat]) => [lat, lng] as L.LatLngExpression), { color: "#4895ef", weight: 3, opacity: 0.8 });
          line.bindTooltip(`<b>${r.ten}</b><br><i>${r.ten_dia_phuong}</i>`, { sticky: true, className: "custom-tooltip" });
          layers.push(line);
        });
      } else if (id === "irrigation") {
        layersData.irrigation.forEach(ir => {
          const emoji = ir.loai === "phai" ? "💧" : ir.loai === "lin" ? "〰️" : "🚿";
          const m = L.marker([ir.lat, ir.lng], { icon: makeDivIcon(emoji, "#74c69d", 26) });
          m.bindPopup(`<div class="map-popup"><div class="popup-title">${ir.ten}</div><div class="popup-sub">${IRRIGATION_LABELS[ir.loai] || ir.loai} · <i>${ir.ten_dia_phuong}</i></div><p>${ir.mo_ta}</p></div>`);
          layers.push(m);
        });
      } else if (id === "villages") {
        layersData.villages.forEach(v => {
          const color = ETHNIC_COLORS[v.dan_toc] || "#f4a261";
          const m = L.marker([v.lat, v.lng], { icon: makeDivIcon("🏘️", color, 28) });
          m.bindPopup(`<div class="map-popup"><div class="popup-title">${v.ten}</div><div class="popup-sub" style="color:${color}">Dân tộc ${v.dan_toc.charAt(0).toUpperCase()+v.dan_toc.slice(1)}</div><p>${v.mo_ta}</p></div>`);
          layers.push(m);
        });
      } else if (id === "forests") {
        layersData.forests.forEach(f => {
          const color = FOREST_COLORS[f.loai] || "#2d6a4f";
          const m = L.marker([f.lat, f.lng], { icon: makeDivIcon("🌲", color, 26) });
          m.bindPopup(`<div class="map-popup"><div class="popup-title">${f.ten}</div><div class="popup-sub" style="color:${color}">${FOREST_LABELS[f.loai] || f.loai} · <i>${f.ten_dia_phuong}</i></div><p>${f.mo_ta}</p></div>`);
          layers.push(m);
        });
      } else if (id === "vac_models") {
        layersData.vac_models.forEach(v => {
          const m = L.marker([v.lat, v.lng], { icon: makeDivIcon("♻️", "#40916c", 28) });
          m.bindPopup(`<div class="map-popup"><div class="popup-title">${v.ten}</div><div class="popup-sub">Mô hình ${v.loai.toUpperCase()}</div><p>${v.mo_ta}</p><ul>${v.thanh_phan.map(p=>`<li>${p}</li>`).join("")}</ul></div>`);
          layers.push(m);
        });
      } else if (id === "medicinal_plants") {
        layersData.medicinal_plants.forEach(p => {
          const m = L.marker([p.lat, p.lng], { icon: makeDivIcon("🌿", "#e63946", 26) });
          m.bindPopup(`<div class="map-popup"><div class="popup-title">${p.ten}</div><div class="popup-sub" style="font-style:italic">${p.ten_khoa_hoc}</div><p><b>Công dụng:</b> ${p.cong_dung}</p><p><b>Tình trạng:</b> <span style="color:${p.tình_trang==="Nguy cấp"?"#e63946":p.tình_trang.includes("Sắp")?"#f4a261":"#52b788"}">${p.tình_trang}</span></p><p><b>Dân tộc sử dụng:</b> ${p.dan_toc_dung.join(", ")}</p></div>`);
          layers.push(m);
        });
      } else if (id === "customary_zones") {
        layersData.customary_zones.forEach(z => {
          const poly = L.polygon(z.coords.map(([lng, lat]) => [lat, lng] as L.LatLngExpression), { color: "#f4a261", weight: 2, opacity: 0.8, fillColor: "#f4a261", fillOpacity: 0.12, dashArray: "6,4" });
          poly.bindPopup(`<div class="map-popup"><div class="popup-title">${z.ten}</div><div class="popup-sub">Luật tục: ${z.loai.replace(/_/g," ")}</div><p>${z.mo_ta}</p></div>`);
          layers.push(poly);
        });
      }
      return layers;
    };

    // Rebuild and show active layers
    activeLayers.forEach(id => {
      if (!layerInstancesRef.current.has(id)) {
        const built = buildLayer(id);
        layerInstancesRef.current.set(id, built);
        built.forEach(l => og.addLayer(l));
      }
    });
  }, [layersData, activeLayers]);

  /* ─── Toggle layer ─── */
  const toggleLayer = (id: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      const og = overlayGroupRef.current;
      if (next.has(id)) {
        next.delete(id);
        layerInstancesRef.current.get(id)?.forEach(l => og?.removeLayer(l));
        layerInstancesRef.current.delete(id);
      } else {
        next.add(id);
        // Will be added in the useEffect above
      }
      return next;
    });
  };

  /* ─── Helpers ─── */
  const getWardValue = <K extends keyof WardProperties>(w: WardProperties, f: K): WardProperties[K] => { const ov = wardOverrides.get(w.ma_xa); return (ov && f in ov ? ov[f as string] : w[f]) as WardProperties[K]; };
  const getDanTocInfo = (id: string): DanTocInfo | undefined => { const b = danTocData?.dan_toc.find(d => d.id === id); if (!b) return; const ov = ethnicOverrides.get(id); return ov ? { ...b, ...ov } : b; };
  const getProvinceStat = (t: string): ProvinceStat => ({ ...(DEFAULT_STATS[t] || { dien_tich: "—", dan_so: "—", don_vi: 0 }), ...provinceEdits.get(t) });
  const updateWardField = (ma_xa: string, field: string, value: unknown) => setWardOverrides(p => { const n = new Map(p); n.set(ma_xa, { ...n.get(ma_xa), [field]: value }); return n; });
  const updateWardEthnicPct = (ma_xa: string, danTocId: string, rawVal: string) => {
    const pct = Math.max(0, Math.min(100, parseFloat(rawVal) || 0));
    const list = (wardOverrides.get(ma_xa)?.dan_toc ?? selectedWard?.dan_toc ?? []).map(d => ({ ...d }));
    const idx = list.findIndex(d => d.dan_toc === danTocId);
    if (idx >= 0) list[idx].ty_le = pct; else list.push({ dan_toc: danTocId, ty_le: pct });
    const total = list.reduce((s, d) => s + d.ty_le, 0);
    const norm = total > 0 ? list.map(d => ({ ...d, ty_le: Math.round(d.ty_le * 100 / total) })) : list;
    updateWardField(ma_xa, "dan_toc", norm.filter(d => d.ty_le > 0).sort((a,b) => b.ty_le - a.ty_le));
    setEditingEthnicPct(null);
  };
  const updateEthnicField = (id: string, field: keyof EthnicOverride, value: string | number) => setEthnicOverrides(p => { const n = new Map(p); n.set(id, { ...n.get(id), [field]: value }); return n; });
  const updateProvinceStat = (t: string, f: keyof ProvinceStat, v: string) => setProvinceEdits(p => { const n = new Map(p); n.set(t, { ...n.get(t), [f]: f==="don_vi"?(parseInt(v)||0):v }); return n; });
  const addPdf = (key: string, files: PdfFile[]) => setPdfFiles(p => { const n = new Map(p); n.set(key, [...(n.get(key)||[]), ...files]); return n; });
  const removePdf = (key: string, idx: number) => setPdfFiles(p => { const n = new Map(p); const l = [...(n.get(key)||[])]; URL.revokeObjectURL(l[idx].url); l.splice(idx,1); if (l.length===0) n.delete(key); else n.set(key,l); return n; });

  /* ─── Map init ─── */
  const fetchGeoJson = async (url: string): Promise<GeoJsonData> => { const r = await fetch(BASE_PATH + url); if (!r.ok) throw new Error(url); return r.json(); };

  const addProvincesLayer = (map: L.Map, data: GeoJsonData) => {
    if (provincesLayerRef.current) map.removeLayer(provincesLayerRef.current);
    const layer = L.geoJSON(data as GeoJSON.FeatureCollection, {
      style: () => ({ color: "#2d6a4f", weight: 3, opacity: 0.9, fillColor: "#74c69d", fillOpacity: 0.25 }),
      onEachFeature: (feat, lyr) => {
        const p = feat.properties as { ten_tinh: string };
        (lyr as L.Path).on({ mouseover: e => { (e.target as L.Path).setStyle({ fillOpacity: 0.5, color: "#1b4332", weight: 4 }); (e.target as L.Path).bringToFront(); }, mouseout: e => { (e.target as L.Path).setStyle({ fillOpacity: 0.25, color: "#2d6a4f", weight: 3 }); }, click: () => handleProvinceClick(p.ten_tinh) });
        lyr.bindTooltip(`<strong>${p.ten_tinh}</strong>`, { sticky: true, className: "custom-tooltip" });
      },
    });
    layer.addTo(map); provincesLayerRef.current = layer;
  };

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { center: [21.7, 103.5], zoom: 7, zoomControl: false });
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>', maxZoom: 18 }).addTo(map);
    const og = L.layerGroup().addTo(map);
    overlayGroupRef.current = og;
    mapRef.current = map;
    try {
      const data = await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(map, data);
      const b = L.geoJSON(data as GeoJSON.FeatureCollection).getBounds();
      if (b.isValid()) map.fitBounds(b, { padding: [40, 40], maxZoom: 9 });
    } catch (e) { console.error(e); }
  }, []);

  const handleProvinceClick = async (name: string) => {
    if (!mapRef.current) return;
    setLoading(true); setSelectedProvince(name); setSelectedWard(null); setSelectedDanToc(null);
    try {
      const data = await fetchGeoJson(PROVINCE_FILES[name]);
      allWardsRef.current = data.features.map(f => f.properties as unknown as WardProperties);
      if (provincesLayerRef.current) { mapRef.current.removeLayer(provincesLayerRef.current); provincesLayerRef.current = null; }
      if (wardsLayerRef.current) { mapRef.current.removeLayer(wardsLayerRef.current); wardsLayerRef.current = null; }
      const wl = L.geoJSON(data as GeoJSON.FeatureCollection, {
        style: () => ({ color: "#6b4226", weight: 1.5, opacity: 0.8, fillColor: "#a8d5a2", fillOpacity: 0.3 }),
        onEachFeature: (feat, lyr) => {
          const p = feat.properties as unknown as WardProperties;
          (lyr as L.Path).on({ mouseover: e => { (e.target as L.Path).setStyle({ fillOpacity: 0.6, color: "#3d1f0d", weight: 2.5, fillColor: "#52b788" }); (e.target as L.Path).bringToFront(); }, mouseout: e => { (e.target as L.Path).setStyle({ fillOpacity: 0.3, color: "#6b4226", weight: 1.5, fillColor: "#a8d5a2" }); }, click: () => { setSelectedWard(p); setSelectedDanToc(null); setActiveTriThuc(0); setEditingEthnicPct(null); } });
          lyr.bindTooltip(`<div class="ward-tooltip">${p.ten_xa}</div>`, { sticky: true, className: "custom-tooltip ward-tip" });
        },
      });
      wl.addTo(mapRef.current); wardsLayerRef.current = wl;
      const b = wl.getBounds(); if (b.isValid()) mapRef.current.fitBounds(b, { padding: [40,40], maxZoom: 11 });
      setViewMode("ward");
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleBack = async () => {
    if (!mapRef.current) return;
    setLoading(true);
    if (wardsLayerRef.current) { mapRef.current.removeLayer(wardsLayerRef.current); wardsLayerRef.current = null; }
    setSelectedProvince(null); setSelectedWard(null); setSelectedDanToc(null); setViewMode("province"); allWardsRef.current = [];
    try {
      const data = await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(mapRef.current, data);
      const b = L.geoJSON(data as GeoJSON.FeatureCollection).getBounds();
      if (b.isValid()) mapRef.current.flyToBounds(b, { padding: [40,40], maxZoom: 9, duration: 1.5 });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { initMap(); return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }; }, [initMap]);

  /* ─── Derived ─── */
  const wardDanToc: DanTocTyLe[] = selectedWard ? (wardOverrides.get(selectedWard.ma_xa)?.dan_toc ?? selectedWard.dan_toc ?? []) : [];
  const wardPdfs = selectedWard ? (pdfFiles.get(selectedWard.ma_xa) || []) : [];
  const wardCustom = selectedWard ? wardOverrides.get(selectedWard.ma_xa) : undefined;
  const stats = selectedProvince ? getProvinceStat(selectedProvince) : null;
  const layerCategoriesWithState = LAYER_CATEGORIES.map(cat => ({ ...cat, layers: cat.layers.map(l => ({ ...l, active: activeLayers.has(l.id) })) }));

  const EditWard = ({ field, suffix="", type="text" as "text"|"number", decimals }: { field: keyof WardProperties & string; suffix?: string; type?: "text"|"number"; decimals?: number }) => {
    if (!selectedWard) return null;
    const val = getWardValue(selectedWard, field);
    return <EditableValue value={(val ?? "") as string|number} suffix={suffix} type={type} decimals={decimals} placeholder="Click để nhập" onSave={v => updateWardField(selectedWard.ma_xa, field, type==="number"?parseFloat(v):v)}/>;
  };

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
            {viewMode==="province" ? <span className="breadcrumb-item active">Toàn vùng</span> : (
              <><button className="breadcrumb-item link" onClick={handleBack}>Toàn vùng</button><span className="breadcrumb-sep">›</span><span className="breadcrumb-item active">{selectedProvince}</span>{selectedWard&&<><span className="breadcrumb-sep">›</span><span className="breadcrumb-item active">{(getWardValue(selectedWard,"ten_xa") as string)||selectedWard.ten_xa}</span></>}</>
            )}
          </div>
          <button className={`layer-toggle-btn ${showLayers?"active":""}`} onClick={() => setShowLayers(s => !s)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            Lớp bản đồ {activeLayers.size > 0 && <span className="layer-count">{activeLayers.size}</span>}
          </button>
          <button className="import-btn" onClick={() => setShowImport(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Nhập dữ liệu
          </button>
        </div>
      </div>

      <div className="map-body">
        {/* ─── Layer panel ─── */}
        {showLayers && <LayerControl categories={layerCategoriesWithState} onToggle={toggleLayer} onClose={() => setShowLayers(false)} showTransect={showTransect} onToggleTransect={() => setShowTransect(s=>!s)} showCalendar={showCalendar} onToggleCalendar={() => setShowCalendar(s=>!s)}/>}

        {/* ─── Map ─── */}
        <div className="map-wrapper">
          <div ref={mapContainerRef} className="map-canvas"/>
          {loading && <div className="map-overlay"><div className="loading-spinner"/><span>Đang tải dữ liệu...</span></div>}
          {viewMode==="ward" && <button className="back-button" onClick={handleBack}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon"><polyline points="15 18 9 12 15 6"/></svg>Quay lại bản đồ vùng</button>}
          {viewMode==="province" && <div className="map-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Click vào tỉnh để xem ranh giới xã và dân tộc</div>}
          <div className="map-legend">
            <div className="legend-title">Chú giải</div>
            {viewMode==="province" ? <div className="legend-item"><div className="legend-color province-color"/><span>Ranh giới tỉnh</span></div> : <div className="legend-item"><div className="legend-color ward-color"/><span>Ranh giới xã/phường</span></div>}
            {activeLayers.has("rivers") && <div className="legend-item"><div className="legend-color" style={{background:"#4895ef"}}/><span>Sông suối</span></div>}
            {activeLayers.has("irrigation") && <div className="legend-item"><div className="legend-color" style={{background:"#74c69d"}}/><span>Thủy lợi</span></div>}
            {activeLayers.has("villages") && <div className="legend-item"><div className="legend-color" style={{background:"#f4a261"}}/><span>Bản làng</span></div>}
            {activeLayers.has("forests") && <div className="legend-item"><div className="legend-color" style={{background:"#2d6a4f"}}/><span>Rừng</span></div>}
            {activeLayers.has("medicinal_plants") && <div className="legend-item"><div className="legend-color" style={{background:"#e63946"}}/><span>Cây thuốc</span></div>}
            {activeLayers.has("customary_zones") && <div className="legend-item"><div className="legend-color" style={{background:"#f4a261",border:"1px dashed #f4a261"}}/><span>Luật tục</span></div>}
          </div>
        </div>

        {/* ─── Info panel ─── */}
        {viewMode==="ward" && (
          <div className="info-panel">
            <div className="info-panel-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div><div className="panel-title">Thông tin địa bàn</div><div className="panel-subtitle">{selectedProvince}</div></div>
            </div>

            {selectedWard ? (
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
                  {wardCustom && Object.entries(wardCustom).filter(([k])=>!["ten_xa","loai","dtich_km2","dan_so","matdo_km2","ghi_chu","san_pham","tinh_trang","dan_toc"].includes(k)).map(([k,v])=>(
                    <div key={k} className="info-row"><div className="info-label">{k}</div><div className="info-value"><EditableValue value={v as string} onSave={nv=>updateWardField(selectedWard.ma_xa,k,nv)}/></div></div>
                  ))}
                </div>

                {wardPdfs.length > 0 && (
                  <div className="pdf-section">
                    <div className="pdf-section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Tài liệu ({wardPdfs.length})</div>
                    {wardPdfs.map((pdf,i)=>(<div key={i} className="pdf-item"><div className="pdf-info"><span className="pdf-name">{pdf.name}</span><span className="pdf-size">{pdf.size}</span></div><div className="pdf-actions"><button className="pdf-btn view" onClick={()=>setPdfViewer(pdf)}>Xem</button><button className="pdf-btn remove" onClick={()=>removePdf(selectedWard.ma_xa,i)}>✕</button></div></div>))}
                  </div>
                )}

                {wardDanToc.length > 0 && (
                  <div className="ethnic-section">
                    <div className="ethnic-section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Các dân tộc sinh sống</div>
                    <p className="ethnic-hint">Click tên → tri thức bản địa · Click % → chỉnh tỷ lệ</p>
                    <div className="ethnic-tags">
                      {wardDanToc.map(({dan_toc,ty_le})=>{
                        const info=getDanTocInfo(dan_toc); if (!info) return null;
                        const isActive=selectedDanToc?.id===dan_toc;
                        return (<div key={dan_toc} className={`ethnic-tag ${isActive?"active":""}`} style={{"--tag-color":info.mau} as React.CSSProperties}>
                          <span className="tag-dot" style={{background:info.mau}}/><button className="tag-name-btn" onClick={()=>{setSelectedDanToc(isActive?null:info);setActiveTriThuc(0);}}>{info.ten.replace("Dân tộc ","").replace("Người ","")}</button>
                          {editingEthnicPct===dan_toc ? <input className="pct-input" type="number" min="0" max="100" defaultValue={ty_le} autoFocus onBlur={e=>updateWardEthnicPct(selectedWard.ma_xa,dan_toc,e.target.value)} onKeyDown={e=>{if(e.key==="Enter")updateWardEthnicPct(selectedWard.ma_xa,dan_toc,(e.target as HTMLInputElement).value);if(e.key==="Escape")setEditingEthnicPct(null);}}/> : <button className="tag-pct-btn" onClick={()=>setEditingEthnicPct(dan_toc)} title="Click để chỉnh">{ty_le}%</button>}
                        </div>);
                      })}
                    </div>
                    <div className="ethnic-bar-wrap">{wardDanToc.map(({dan_toc,ty_le})=>{const info=getDanTocInfo(dan_toc);return info?<div key={dan_toc} className="ethnic-bar-seg" style={{width:`${ty_le}%`,background:info.mau}} title={`${info.ten.replace("Dân tộc ","")}: ${ty_le}%`}/>:null;})}</div>
                  </div>
                )}

                {selectedDanToc && (() => {
                  const info = getDanTocInfo(selectedDanToc.id)!;
                  const ethnicPdfs = pdfFiles.get("ethnic_"+info.id)||[];
                  return (<div className="knowledge-panel">
                    <div className="knowledge-header" style={{borderLeftColor:info.mau}}>
                      <div className="knowledge-name" style={{color:info.mau}}>{info.ten}</div>
                      <div className="knowledge-meta-row"><EditableValue value={info.ngon_ngu} className="editable-meta" onSave={v=>updateEthnicField(info.id,"ngon_ngu",v)}/><span> · </span><EditableValue value={info.dan_so_ca_nuoc} suffix=" người" type="number" className="editable-meta" onSave={v=>updateEthnicField(info.id,"dan_so_ca_nuoc",parseInt(v)||0)}/></div>
                      <EditableValue value={info.mo_ta} className="knowledge-desc-editable" onSave={v=>updateEthnicField(info.id,"mo_ta",v)}/>
                    </div>
                    {ethnicPdfs.length>0 && <div className="ethnic-pdf-list">{ethnicPdfs.map((pdf,i)=>(<div key={i} className="pdf-item"><div className="pdf-info"><span className="pdf-name">{pdf.name}</span><span className="pdf-size">{pdf.size}</span></div><div className="pdf-actions"><button className="pdf-btn view" onClick={()=>setPdfViewer(pdf)}>Xem</button><button className="pdf-btn remove" onClick={()=>removePdf("ethnic_"+info.id,i)}>✕</button></div></div>))}</div>}
                    <div className="knowledge-tabs">{info.tri_thuc.map((tt,i)=>(<button key={i} className={`knowledge-tab ${activeTriThuc===i?"active":""}`} style={{"--tab-color":info.mau} as React.CSSProperties} onClick={()=>setActiveTriThuc(i)}><span>{tt.bieu_tuong}</span><span>{tt.chu_de}</span></button>))}</div>
                    {info.tri_thuc[activeTriThuc] && <div className="knowledge-content"><div className="knowledge-topic"><span>{info.tri_thuc[activeTriThuc].bieu_tuong}</span>{info.tri_thuc[activeTriThuc].chu_de}</div><p className="knowledge-text">{info.tri_thuc[activeTriThuc].noi_dung}</p>{info.tri_thuc[activeTriThuc].bai_thuoc.length>0&&<div className="recipes"><div className="recipes-title">Bài thuốc</div>{info.tri_thuc[activeTriThuc].bai_thuoc.map((bt,i)=>(<div key={i} className="recipe-card" style={{borderColor:info.mau+"50"}}><div className="recipe-name">{bt.ten}</div><div className="recipe-row"><span className="recipe-label">Nguyên liệu:</span><span className="recipe-val">{bt.nguyen_lieu}</span></div><div className="recipe-row"><span className="recipe-label">Công dụng:</span><span className="recipe-val highlight" style={{color:info.mau}}>{bt.cong_dung}</span></div></div>))}</div>}</div>}
                    <button className="knowledge-close" onClick={()=>setSelectedDanToc(null)}>Đóng thông tin dân tộc</button>
                  </div>);
                })()}
              </div>
            ) : (
              <div className="ward-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>Click vào một xã/phường trên bản đồ để xem và chỉnh sửa thông tin</p></div>
            )}

            {stats && selectedProvince && (
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
      {showImport && <ImportModal onClose={()=>setShowImport(false)} wardOverrides={wardOverrides} onApplyWardCSV={setWardOverrides} onClearWardData={()=>setWardOverrides(new Map())} ethnicOverrides={ethnicOverrides} onApplyEthnicCSV={setEthnicOverrides} onClearEthnicData={()=>setEthnicOverrides(new Map())} pdfFiles={pdfFiles} onAddPdf={addPdf} onRemovePdf={removePdf} onViewPdf={setPdfViewer} currentWard={selectedWard?{ma_xa:selectedWard.ma_xa,ten_xa:selectedWard.ten_xa}:null} wardList={allWardsRef.current.map(w=>({ma_xa:w.ma_xa,ten_xa:w.ten_xa}))}/>}
      {showTransect && <TransectDiagram onClose={()=>setShowTransect(false)}/>}
      {showCalendar && <SeasonalCalendar onClose={()=>setShowCalendar(false)}/>}
      {pdfViewer && <div className="modal-overlay pdf-viewer-overlay" onClick={e=>{if(e.target===e.currentTarget)setPdfViewer(null);}}><div className="pdf-viewer-modal"><div className="pdf-viewer-header"><span className="pdf-viewer-name">{pdfViewer.name}</span><button className="modal-close" onClick={()=>setPdfViewer(null)}>✕</button></div><iframe src={pdfViewer.url} className="pdf-frame" title={pdfViewer.name}/></div></div>}
    </div>
  );
}
