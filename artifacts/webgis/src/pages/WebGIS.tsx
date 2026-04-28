import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EditableValue from "../components/EditableValue";
import ImportModal, { type WardOverrides, type EthnicOverride, type PdfFile, type DanTocTyLe } from "../components/ImportModal";

/* ─── Types ─── */
interface WardProperties {
  ma_xa: string; ten_xa: string; loai?: string;
  dtich_km2?: number; dan_so?: number; matdo_km2?: number;
  ten_tinh?: string; dan_toc?: DanTocTyLe[];
}
interface GeoJsonData { type: string; features: { type: string; properties: Record<string, unknown>; geometry: unknown }[]; }
interface BaiThuoc { ten: string; nguyen_lieu: string; cong_dung: string; }
interface TriThuc { chu_de: string; bieu_tuong: string; noi_dung: string; bai_thuoc: BaiThuoc[]; }
interface DanTocInfo { id: string; ten: string; mau: string; dan_so_ca_nuoc: number; ngon_ngu: string; mo_ta: string; tri_thuc: TriThuc[]; }
interface DanTocData { dan_toc: DanTocInfo[]; }
interface ProvinceStat { dien_tich: string; dan_so: string; don_vi: number; }

/* ─── Constants ─── */
const PROVINCE_FILES: Record<string, string> = {
  "Sơn La": "/data/xa_sonla.geojson",
  "Điện Biên": "/data/xa_dienbien.geojson",
  "Lai Châu": "/data/xa_laichau.geojson",
};
const DEFAULT_STATS: Record<string, ProvinceStat> = {
  "Sơn La":    { dien_tich: "14.174", dan_so: "1,25M", don_vi: 75 },
  "Điện Biên": { dien_tich: "9.541",  dan_so: "599K",  don_vi: 45 },
  "Lai Châu":  { dien_tich: "9.068",  dan_so: "460K",  don_vi: 38 },
};
const ETHNIC_LABELS: Record<string,string> = {
  thai:"Thái",mong:"Mông",dao:"Dao",kho_mu:"Khơ Mú",muong:"Mường",kinh:"Kinh",la_hu:"La Hủ",lu:"Lự",mang:"Mảng"
};
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function WebGIS() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const provincesLayerRef = useRef<L.GeoJSON | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
  const allWardsRef = useRef<WardProperties[]>([]);

  /* ─── Core state ─── */
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"province" | "ward">("province");
  const [danTocData, setDanTocData] = useState<DanTocData | null>(null);
  const [selectedDanToc, setSelectedDanToc] = useState<DanTocInfo | null>(null);
  const [activeTriThuc, setActiveTriThuc] = useState(0);

  /* ─── Editable data ─── */
  const [wardOverrides, setWardOverrides] = useState<Map<string, WardOverrides>>(new Map());
  const [ethnicOverrides, setEthnicOverrides] = useState<Map<string, EthnicOverride>>(new Map());
  const [provinceEdits, setProvinceEdits] = useState<Map<string, Partial<ProvinceStat>>>(new Map());
  const [pdfFiles, setPdfFiles] = useState<Map<string, PdfFile[]>>(new Map());

  /* ─── UI state ─── */
  const [showImport, setShowImport] = useState(false);
  const [pdfViewer, setPdfViewer] = useState<PdfFile | null>(null);
  const [editingEthnicPct, setEditingEthnicPct] = useState<string | null>(null); // ethnic id being edited

  const fetchGeoJson = async (url: string): Promise<GeoJsonData> => {
    const res = await fetch(BASE_PATH + url);
    if (!res.ok) throw new Error(`Failed: ${url}`);
    return res.json();
  };

  useEffect(() => {
    fetch(BASE_PATH + "/data/dan_toc.json").then(r => r.json()).then(setDanTocData).catch(console.error);
  }, []);

  /* ─── Merge helpers ─── */
  const getWardValue = <K extends keyof WardProperties>(ward: WardProperties, field: K): WardProperties[K] => {
    const ov = wardOverrides.get(ward.ma_xa);
    if (ov && field in ov) return ov[field as string] as WardProperties[K];
    return ward[field];
  };

  const getDanTocInfo = (id: string): DanTocInfo | undefined => {
    const base = danTocData?.dan_toc.find(d => d.id === id);
    if (!base) return undefined;
    const ov = ethnicOverrides.get(id);
    if (!ov) return base;
    return { ...base, ...ov };
  };

  const getProvinceStat = (tinh: string): ProvinceStat => {
    const base = DEFAULT_STATS[tinh] || { dien_tich: "—", dan_so: "—", don_vi: 0 };
    const ov = provinceEdits.get(tinh);
    return { ...base, ...ov };
  };

  /* ─── Ward override helpers ─── */
  const updateWardField = (ma_xa: string, field: string, value: unknown) => {
    setWardOverrides(prev => {
      const next = new Map(prev);
      next.set(ma_xa, { ...next.get(ma_xa), [field]: value });
      return next;
    });
  };

  const updateWardEthnicPct = (ma_xa: string, danTocId: string, rawVal: string) => {
    const pct = Math.max(0, Math.min(100, parseFloat(rawVal) || 0));
    const currentList: DanTocTyLe[] = (wardOverrides.get(ma_xa)?.dan_toc ?? selectedWard?.dan_toc ?? []).map(d => ({ ...d }));
    const idx = currentList.findIndex(d => d.dan_toc === danTocId);
    if (idx >= 0) currentList[idx].ty_le = pct; else currentList.push({ dan_toc: danTocId, ty_le: pct });
    const total = currentList.reduce((s, d) => s + d.ty_le, 0);
    const normalized = total > 0 ? currentList.map(d => ({ ...d, ty_le: Math.round(d.ty_le * 100 / total) })) : currentList;
    updateWardField(ma_xa, "dan_toc", normalized.filter(d => d.ty_le > 0).sort((a,b) => b.ty_le - a.ty_le));
    setEditingEthnicPct(null);
  };

  /* ─── Ethnic override helpers ─── */
  const updateEthnicField = (id: string, field: keyof EthnicOverride, value: string | number) => {
    setEthnicOverrides(prev => {
      const next = new Map(prev);
      next.set(id, { ...next.get(id), [field]: value });
      return next;
    });
  };

  /* ─── Province stat helpers ─── */
  const updateProvinceStat = (tinh: string, field: keyof ProvinceStat, value: string) => {
    setProvinceEdits(prev => {
      const next = new Map(prev);
      next.set(tinh, { ...next.get(tinh), [field]: field === "don_vi" ? (parseInt(value)||0) : value });
      return next;
    });
  };

  /* ─── PDF helpers ─── */
  const addPdf = (key: string, files: PdfFile[]) => {
    setPdfFiles(prev => {
      const next = new Map(prev);
      next.set(key, [...(next.get(key) || []), ...files]);
      return next;
    });
  };

  const removePdf = (key: string, idx: number) => {
    setPdfFiles(prev => {
      const next = new Map(prev);
      const list = [...(next.get(key) || [])];
      URL.revokeObjectURL(list[idx].url);
      list.splice(idx, 1);
      if (list.length === 0) next.delete(key); else next.set(key, list);
      return next;
    });
  };

  /* ─── Map ─── */
  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { center: [21.7, 103.5], zoom: 7, zoomControl: false });
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>', maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    try {
      const data = await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(map, data);
      const b = L.geoJSON(data as GeoJSON.FeatureCollection).getBounds();
      if (b.isValid()) map.fitBounds(b, { padding: [40, 40], maxZoom: 9 });
    } catch (e) { console.error(e); }
  }, []);

  const addProvincesLayer = (map: L.Map, data: GeoJsonData) => {
    if (provincesLayerRef.current) { map.removeLayer(provincesLayerRef.current); }
    const layer = L.geoJSON(data as GeoJSON.FeatureCollection, {
      style: () => ({ color: "#2d6a4f", weight: 3, opacity: 0.9, fillColor: "#74c69d", fillOpacity: 0.25 }),
      onEachFeature: (feat, lyr) => {
        const p = feat.properties as { ten_tinh: string };
        (lyr as L.Path).on({
          mouseover: e => { (e.target as L.Path).setStyle({ fillOpacity: 0.5, color: "#1b4332", weight: 4 }); (e.target as L.Path).bringToFront(); },
          mouseout:  e => { (e.target as L.Path).setStyle({ fillOpacity: 0.25, color: "#2d6a4f", weight: 3 }); },
          click: () => handleProvinceClick(p.ten_tinh),
        });
        lyr.bindTooltip(`<strong>${p.ten_tinh}</strong>`, { sticky: true, className: "custom-tooltip" });
      },
    });
    layer.addTo(map);
    provincesLayerRef.current = layer;
  };

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
          const p = feat.properties as WardProperties;
          (lyr as L.Path).on({
            mouseover: e => { (e.target as L.Path).setStyle({ fillOpacity: 0.6, color: "#3d1f0d", weight: 2.5, fillColor: "#52b788" }); (e.target as L.Path).bringToFront(); },
            mouseout:  e => { (e.target as L.Path).setStyle({ fillOpacity: 0.3, color: "#6b4226", weight: 1.5, fillColor: "#a8d5a2" }); },
            click: () => { setSelectedWard(p); setSelectedDanToc(null); setActiveTriThuc(0); setEditingEthnicPct(null); },
          });
          lyr.bindTooltip(`<div class="ward-tooltip">${p.ten_xa}</div>`, { sticky: true, className: "custom-tooltip ward-tip" });
        },
      });
      wl.addTo(mapRef.current); wardsLayerRef.current = wl;
      const b = wl.getBounds();
      if (b.isValid()) mapRef.current.fitBounds(b, { padding: [40, 40], maxZoom: 11 });
      setViewMode("ward");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleBack = async () => {
    if (!mapRef.current) return;
    setLoading(true);
    if (wardsLayerRef.current) { mapRef.current.removeLayer(wardsLayerRef.current); wardsLayerRef.current = null; }
    setSelectedProvince(null); setSelectedWard(null); setSelectedDanToc(null); setViewMode("province");
    allWardsRef.current = [];
    try {
      const data = await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(mapRef.current, data);
      const b = L.geoJSON(data as GeoJSON.FeatureCollection).getBounds();
      if (b.isValid()) mapRef.current.flyToBounds(b, { padding: [40, 40], maxZoom: 9, duration: 1.5 });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    initMap();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [initMap]);

  /* ─── Derived values ─── */
  const wardDanToc: DanTocTyLe[] = selectedWard
    ? (wardOverrides.get(selectedWard.ma_xa)?.dan_toc ?? selectedWard.dan_toc ?? [])
    : [];
  const wardPdfs = selectedWard ? (pdfFiles.get(selectedWard.ma_xa) || []) : [];
  const stats = selectedProvince ? getProvinceStat(selectedProvince) : null;
  const wardCustom = selectedWard ? wardOverrides.get(selectedWard.ma_xa) : undefined;

  /* Helper to show editable ward field */
  const EditWard = ({ field, suffix = "", type = "text" as "text" | "number", decimals }: { field: keyof WardProperties & string; suffix?: string; type?: "text" | "number"; decimals?: number }) => {
    if (!selectedWard) return null;
    const raw = getWardValue(selectedWard, field);
    const val = raw != null ? raw : "";
    return (
      <EditableValue
        value={val as string | number}
        suffix={suffix}
        type={type}
        decimals={decimals}
        placeholder="Chưa có — click để nhập"
        onSave={v => updateWardField(selectedWard.ma_xa, field, type === "number" ? parseFloat(v) : v)}
      />
    );
  };

  return (
    <div className="webgis-container">
      {/* ─── Header ─── */}
      <div className="map-header">
        <div className="header-left">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
          </div>
          <div>
            <h1 className="header-title">WebGIS Tây Bắc</h1>
            <p className="header-subtitle">Hệ thống thông tin địa lý & tri thức bản địa vùng Tây Bắc</p>
          </div>
        </div>
        <div className="header-right">
          <div className="header-breadcrumb">
            {viewMode === "province" ? (
              <span className="breadcrumb-item active">Toàn vùng</span>
            ) : (
              <>
                <button className="breadcrumb-item link" onClick={handleBack}>Toàn vùng</button>
                <span className="breadcrumb-sep">›</span>
                <span className="breadcrumb-item active">{selectedProvince}</span>
                {selectedWard && <><span className="breadcrumb-sep">›</span><span className="breadcrumb-item active">{getWardValue(selectedWard,"ten_xa") as string || selectedWard.ten_xa}</span></>}
              </>
            )}
          </div>
          <button className="import-btn" onClick={() => setShowImport(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Nhập dữ liệu
          </button>
        </div>
      </div>

      <div className="map-body">
        {/* ─── Map ─── */}
        <div className="map-wrapper">
          <div ref={mapContainerRef} className="map-canvas" />
          {loading && <div className="map-overlay"><div className="loading-spinner"/><span>Đang tải dữ liệu...</span></div>}
          {viewMode === "ward" && (
            <button className="back-button" onClick={handleBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon"><polyline points="15 18 9 12 15 6"/></svg>
              Quay lại bản đồ vùng
            </button>
          )}
          {viewMode === "province" && (
            <div className="map-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Click vào tỉnh để xem ranh giới xã và dân tộc
            </div>
          )}
          <div className="map-legend">
            <div className="legend-title">Chú giải</div>
            {viewMode === "province"
              ? <div className="legend-item"><div className="legend-color province-color"/><span>Ranh giới tỉnh</span></div>
              : <div className="legend-item"><div className="legend-color ward-color"/><span>Ranh giới xã/phường</span></div>}
          </div>
        </div>

        {/* ─── Info panel ─── */}
        {viewMode === "ward" && (
          <div className="info-panel">
            <div className="info-panel-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div><div className="panel-title">Thông tin địa bàn</div><div className="panel-subtitle">{selectedProvince}</div></div>
            </div>

            {selectedWard ? (
              <div className="ward-info">
                {/* Ward name — editable */}
                <div className="ward-name-wrap">
                  <EditableValue
                    value={getWardValue(selectedWard, "ten_xa") as string || selectedWard.ten_xa}
                    className="ward-name-editable"
                    onSave={v => updateWardField(selectedWard.ma_xa, "ten_xa", v)}
                  />
                </div>
                <div className="ward-badge-row">
                  <EditableValue
                    value={getWardValue(selectedWard, "loai") as string || selectedWard.loai || ""}
                    placeholder="Loại đơn vị"
                    className="ward-badge-editable"
                    onSave={v => updateWardField(selectedWard.ma_xa, "loai", v)}
                  />
                </div>

                {/* Core stats — all editable */}
                <div className="info-grid">
                  <div className="info-row">
                    <div className="info-label">Mã đơn vị</div>
                    <div className="info-value">{selectedWard.ma_xa}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Diện tích</div>
                    <div className="info-value">
                      <EditWard field="dtich_km2" suffix=" km²" type="number" decimals={2}/>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Dân số</div>
                    <div className="info-value">
                      <EditWard field="dan_so" suffix=" người" type="number"/>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Mật độ</div>
                    <div className="info-value">
                      <EditWard field="matdo_km2" suffix=" ng/km²" type="number" decimals={1}/>
                    </div>
                  </div>
                </div>

                {/* Custom text fields — editable */}
                <div className="custom-fields">
                  <div className="info-row">
                    <div className="info-label">Ghi chú</div>
                    <div className="info-value">
                      <EditableValue value={wardCustom?.ghi_chu || ""} placeholder="Click để thêm ghi chú" onSave={v => updateWardField(selectedWard.ma_xa, "ghi_chu", v)}/>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Sản phẩm chính</div>
                    <div className="info-value">
                      <EditableValue value={wardCustom?.san_pham || ""} placeholder="VD: Ngô, Sắn, Lúa" onSave={v => updateWardField(selectedWard.ma_xa, "san_pham", v)}/>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Tình trạng</div>
                    <div className="info-value">
                      <EditableValue value={wardCustom?.tinh_trang || ""} placeholder="VD: Đang phát triển" onSave={v => updateWardField(selectedWard.ma_xa, "tinh_trang", v)}/>
                    </div>
                  </div>
                  {/* Extra custom fields from CSV */}
                  {wardCustom && Object.entries(wardCustom).filter(([k]) => !["ten_xa","loai","dtich_km2","dan_so","matdo_km2","ghi_chu","san_pham","tinh_trang","dan_toc"].includes(k)).map(([k,v]) => (
                    <div key={k} className="info-row">
                      <div className="info-label">{k}</div>
                      <div className="info-value">
                        <EditableValue value={v as string} onSave={nv => updateWardField(selectedWard.ma_xa, k, nv)}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ward PDFs */}
                {wardPdfs.length > 0 && (
                  <div className="pdf-section">
                    <div className="pdf-section-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Tài liệu đính kèm ({wardPdfs.length})
                    </div>
                    {wardPdfs.map((pdf, i) => (
                      <div key={i} className="pdf-item">
                        <div className="pdf-info"><span className="pdf-name">{pdf.name}</span><span className="pdf-size">{pdf.size}</span></div>
                        <div className="pdf-actions">
                          <button className="pdf-btn view" onClick={() => setPdfViewer(pdf)}>Xem</button>
                          <button className="pdf-btn remove" onClick={() => removePdf(selectedWard.ma_xa, i)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── Ethnic groups section ─── */}
                {wardDanToc.length > 0 && (
                  <div className="ethnic-section">
                    <div className="ethnic-section-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Các dân tộc sinh sống
                    </div>
                    <p className="ethnic-hint">Click tên → xem tri thức bản địa · Click % → chỉnh tỷ lệ</p>
                    <div className="ethnic-tags">
                      {wardDanToc.map(({ dan_toc, ty_le }) => {
                        const info = getDanTocInfo(dan_toc);
                        if (!info) return null;
                        const isActive = selectedDanToc?.id === dan_toc;
                        const isEditingPct = editingEthnicPct === dan_toc;
                        return (
                          <div key={dan_toc} className={`ethnic-tag ${isActive ? "active" : ""}`} style={{ "--tag-color": info.mau } as React.CSSProperties}>
                            <span className="tag-dot" style={{ background: info.mau }}/>
                            <button className="tag-name-btn" onClick={() => { setSelectedDanToc(isActive ? null : info); setActiveTriThuc(0); }}>
                              {info.ten.replace("Dân tộc ", "").replace("Người ", "")}
                            </button>
                            {isEditingPct ? (
                              <input
                                className="pct-input" type="number" min="0" max="100"
                                defaultValue={ty_le} autoFocus
                                onBlur={e => updateWardEthnicPct(selectedWard.ma_xa, dan_toc, e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") updateWardEthnicPct(selectedWard.ma_xa, dan_toc, (e.target as HTMLInputElement).value); if (e.key === "Escape") setEditingEthnicPct(null); }}
                              />
                            ) : (
                              <button className="tag-pct-btn" onClick={() => setEditingEthnicPct(dan_toc)} title="Click để chỉnh tỷ lệ">
                                {ty_le}%
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="ethnic-bar-wrap">
                      {wardDanToc.map(({ dan_toc, ty_le }) => {
                        const info = getDanTocInfo(dan_toc);
                        return info ? <div key={dan_toc} className="ethnic-bar-seg" style={{ width: `${ty_le}%`, background: info.mau }} title={`${info.ten.replace("Dân tộc ", "")}: ${ty_le}%`}/> : null;
                      })}
                    </div>
                  </div>
                )}

                {/* ─── Indigenous knowledge panel ─── */}
                {selectedDanToc && (() => {
                  const info = getDanTocInfo(selectedDanToc.id)!;
                  const ethnicPdfs = pdfFiles.get("ethnic_" + info.id) || [];
                  return (
                    <div className="knowledge-panel">
                      <div className="knowledge-header" style={{ borderLeftColor: info.mau }}>
                        <div className="knowledge-name" style={{ color: info.mau }}>{info.ten}</div>
                        <div className="knowledge-meta-row">
                          <EditableValue
                            value={info.ngon_ngu}
                            className="editable-meta"
                            onSave={v => updateEthnicField(info.id, "ngon_ngu", v)}
                          />
                          <span> · </span>
                          <EditableValue
                            value={info.dan_so_ca_nuoc}
                            suffix=" người"
                            type="number"
                            className="editable-meta"
                            onSave={v => updateEthnicField(info.id, "dan_so_ca_nuoc", parseInt(v)||0)}
                          />
                        </div>
                        <EditableValue
                          value={info.mo_ta}
                          className="knowledge-desc-editable"
                          onSave={v => updateEthnicField(info.id, "mo_ta", v)}
                        />
                      </div>

                      {/* Ethnic PDFs */}
                      {ethnicPdfs.length > 0 && (
                        <div className="ethnic-pdf-list">
                          {ethnicPdfs.map((pdf, i) => (
                            <div key={i} className="pdf-item">
                              <div className="pdf-info"><span className="pdf-name">{pdf.name}</span><span className="pdf-size">{pdf.size}</span></div>
                              <div className="pdf-actions">
                                <button className="pdf-btn view" onClick={() => setPdfViewer(pdf)}>Xem</button>
                                <button className="pdf-btn remove" onClick={() => removePdf("ethnic_"+info.id, i)}>✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="knowledge-tabs">
                        {info.tri_thuc.map((tt, i) => (
                          <button key={i} className={`knowledge-tab ${activeTriThuc === i ? "active" : ""}`}
                            style={{ "--tab-color": info.mau } as React.CSSProperties} onClick={() => setActiveTriThuc(i)}>
                            <span>{tt.bieu_tuong}</span><span>{tt.chu_de}</span>
                          </button>
                        ))}
                      </div>

                      {info.tri_thuc[activeTriThuc] && (
                        <div className="knowledge-content">
                          <div className="knowledge-topic">
                            <span>{info.tri_thuc[activeTriThuc].bieu_tuong}</span>
                            {info.tri_thuc[activeTriThuc].chu_de}
                          </div>
                          <p className="knowledge-text">{info.tri_thuc[activeTriThuc].noi_dung}</p>
                          {info.tri_thuc[activeTriThuc].bai_thuoc.length > 0 && (
                            <div className="recipes">
                              <div className="recipes-title">Bài thuốc / Công thức truyền thống</div>
                              {info.tri_thuc[activeTriThuc].bai_thuoc.map((bt, i) => (
                                <div key={i} className="recipe-card" style={{ borderColor: info.mau + "50" }}>
                                  <div className="recipe-name">{bt.ten}</div>
                                  <div className="recipe-row"><span className="recipe-label">Nguyên liệu:</span><span className="recipe-val">{bt.nguyen_lieu}</span></div>
                                  <div className="recipe-row"><span className="recipe-label">Công dụng:</span><span className="recipe-val highlight" style={{ color: info.mau }}>{bt.cong_dung}</span></div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <button className="knowledge-close" onClick={() => setSelectedDanToc(null)}>Đóng thông tin dân tộc</button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="ward-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>Click vào một xã/phường trên bản đồ để xem và chỉnh sửa thông tin</p>
              </div>
            )}

            {/* ─── Province stats — editable ─── */}
            {stats && selectedProvince && (
              <div className="province-stats">
                <div className="stats-title">Thống kê tỉnh {selectedProvince} <span className="stats-edit-hint">— click để chỉnh sửa</span></div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">
                      <EditableValue value={stats.dien_tich} onSave={v => updateProvinceStat(selectedProvince, "dien_tich", v)}/>
                    </div>
                    <div className="stat-label">km² Diện tích</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      <EditableValue value={stats.dan_so} onSave={v => updateProvinceStat(selectedProvince, "dan_so", v)}/>
                    </div>
                    <div className="stat-label">Dân số</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      <EditableValue value={stats.don_vi} type="number" onSave={v => updateProvinceStat(selectedProvince, "don_vi", v)}/>
                    </div>
                    <div className="stat-label">Xã/Phường</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Import modal ─── */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          wardOverrides={wardOverrides}
          onApplyWardCSV={setWardOverrides}
          onClearWardData={() => setWardOverrides(new Map())}
          ethnicOverrides={ethnicOverrides}
          onApplyEthnicCSV={setEthnicOverrides}
          onClearEthnicData={() => setEthnicOverrides(new Map())}
          pdfFiles={pdfFiles}
          onAddPdf={(key, files) => addPdf(key, files)}
          onRemovePdf={removePdf}
          onViewPdf={setPdfViewer}
          currentWard={selectedWard ? { ma_xa: selectedWard.ma_xa, ten_xa: selectedWard.ten_xa } : null}
          wardList={allWardsRef.current.map(w => ({ ma_xa: w.ma_xa, ten_xa: w.ten_xa }))}
        />
      )}

      {/* ─── PDF viewer ─── */}
      {pdfViewer && (
        <div className="modal-overlay pdf-viewer-overlay" onClick={e => { if (e.target === e.currentTarget) setPdfViewer(null); }}>
          <div className="pdf-viewer-modal">
            <div className="pdf-viewer-header">
              <span className="pdf-viewer-name">{pdfViewer.name}</span>
              <button className="modal-close" onClick={() => setPdfViewer(null)}>✕</button>
            </div>
            <iframe src={pdfViewer.url} className="pdf-frame" title={pdfViewer.name}/>
          </div>
        </div>
      )}
    </div>
  );
}
