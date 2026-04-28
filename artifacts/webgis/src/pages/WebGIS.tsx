import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─── Types ─── */
interface DanTocTyLe { dan_toc: string; ty_le: number; }
interface WardProperties {
  ma_xa: string; ten_xa: string; loai?: string;
  dtich_km2?: number; dan_so?: number; matdo_km2?: number;
  ten_tinh?: string; sap_nhap?: string; tru_so?: string;
  dan_toc?: DanTocTyLe[];
}
interface GeoJsonData { type: string; features: { type: string; properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } }[]; }
interface BaiThuoc { ten: string; nguyen_lieu: string; cong_dung: string; }
interface TriThuc { chu_de: string; bieu_tuong: string; noi_dung: string; bai_thuoc: BaiThuoc[]; }
interface DanTocInfo { id: string; ten: string; mau: string; dan_so_ca_nuoc: number; ngon_ngu: string; mo_ta: string; tri_thuc: TriThuc[]; }
interface DanTocData { dan_toc: DanTocInfo[]; }
interface CustomWardData { ghi_chu?: string; san_pham?: string; tinh_trang?: string; dan_toc_csv?: DanTocTyLe[]; extra?: Record<string, string>; }
interface PdfFile { name: string; url: string; size: string; }
interface CsvPreview { headers: string[]; rows: string[][]; matched: number; total: number; }

/* ─── Constants ─── */
const PROVINCE_FILES: Record<string, string> = {
  "Sơn La": "/data/xa_sonla.geojson",
  "Điện Biên": "/data/xa_dienbien.geojson",
  "Lai Châu": "/data/xa_laichau.geojson",
};
const PROVINCE_STATS: Record<string, { dien_tich: string; dan_so: string; don_vi: number }> = {
  "Sơn La":    { dien_tich: "14.174", dan_so: "1,25M", don_vi: 75 },
  "Điện Biên": { dien_tich: "9.541",  dan_so: "599K",  don_vi: 45 },
  "Lai Châu":  { dien_tich: "9.068",  dan_so: "460K",  don_vi: 38 },
};
const ETHNIC_COLS = ["thai","mong","dao","kho_mu","muong","kinh","la_hu","lu","mang"];
const ETHNIC_LABELS: Record<string,string> = {
  thai:"Thái", mong:"Mông", dao:"Dao", kho_mu:"Khơ Mú",
  muong:"Mường", kinh:"Kinh", la_hu:"La Hủ", lu:"Lự", mang:"Mảng",
};
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─── CSV helpers ─── */
function parseCSVText(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const parse = (line: string) => line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
  return { headers: parse(lines[0]), rows: lines.slice(1).map(parse) };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function generateCSVTemplate(wards: WardProperties[]): string {
  const header = ["ma_xa","ten_xa","ghi_chu","san_pham","tinh_trang",...ETHNIC_COLS].join(",");
  const rows = wards.slice(0, 5).map(w => [
    w.ma_xa, w.ten_xa, "", "", "",
    ...ETHNIC_COLS.map(() => "0")
  ].join(","));
  return [header, ...rows].join("\n");
}

/* ─── Main component ─── */
export default function WebGIS() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const provincesLayerRef = useRef<L.GeoJSON | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
  const allWardsRef = useRef<WardProperties[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"province" | "ward">("province");
  const [danTocData, setDanTocData] = useState<DanTocData | null>(null);
  const [selectedDanToc, setSelectedDanToc] = useState<DanTocInfo | null>(null);
  const [activeTriThuc, setActiveTriThuc] = useState(0);

  /* Import state */
  const [showImport, setShowImport] = useState(false);
  const [importTab, setImportTab] = useState<"csv" | "pdf">("csv");
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
  const [csvRaw, setCsvRaw] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [customData, setCustomData] = useState<Map<string, CustomWardData>>(new Map());
  const [pdfFiles, setPdfFiles] = useState<Map<string, PdfFile[]>>(new Map());
  const [pdfWardCode, setPdfWardCode] = useState("");
  const [pdfViewer, setPdfViewer] = useState<PdfFile | null>(null);
  const [importMsg, setImportMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchGeoJson = async (url: string): Promise<GeoJsonData> => {
    const res = await fetch(BASE_PATH + url);
    if (!res.ok) throw new Error(`Failed: ${url}`);
    return res.json();
  };

  useEffect(() => {
    fetch(BASE_PATH + "/data/dan_toc.json").then(r => r.json()).then(setDanTocData).catch(console.error);
  }, []);

  const getDanTocInfo = (id: string) => danTocData?.dan_toc.find(d => d.id === id);

  /* ─── Map init ─── */
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
        lyr.bindTooltip(`<div class="province-tooltip"><strong>${p.ten_tinh}</strong></div>`, { sticky: true, className: "custom-tooltip" });
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
      allWardsRef.current = data.features.map(f => f.properties as WardProperties);
      if (provincesLayerRef.current) { mapRef.current.removeLayer(provincesLayerRef.current); provincesLayerRef.current = null; }
      if (wardsLayerRef.current) { mapRef.current.removeLayer(wardsLayerRef.current); wardsLayerRef.current = null; }
      const wl = L.geoJSON(data as GeoJSON.FeatureCollection, {
        style: () => ({ color: "#6b4226", weight: 1.5, opacity: 0.8, fillColor: "#a8d5a2", fillOpacity: 0.3 }),
        onEachFeature: (feat, lyr) => {
          const p = feat.properties as WardProperties;
          (lyr as L.Path).on({
            mouseover: e => { (e.target as L.Path).setStyle({ fillOpacity: 0.6, color: "#3d1f0d", weight: 2.5, fillColor: "#52b788" }); (e.target as L.Path).bringToFront(); },
            mouseout:  e => { (e.target as L.Path).setStyle({ fillOpacity: 0.3, color: "#6b4226", weight: 1.5, fillColor: "#a8d5a2" }); },
            click: () => { setSelectedWard(p); setSelectedDanToc(null); setActiveTriThuc(0); },
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

  const handleBackToRegion = async () => {
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

  /* ─── CSV import ─── */
  const handleCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSVText(text);
      const maIdx = headers.indexOf("ma_xa");
      if (maIdx === -1) { setImportMsg({ type: "err", text: "File CSV thiếu cột 'ma_xa'. Vui lòng dùng đúng template." }); return; }
      const allMaCodes = new Set(allWardsRef.current.map(w => w.ma_xa));
      const matched = rows.filter(r => allMaCodes.has(r[maIdx])).length;
      const preview: CsvPreview = { headers, rows: rows.slice(0, 8), matched, total: rows.length };
      setCsvPreview(preview); setCsvRaw({ headers, rows }); setImportMsg(null);
    };
    reader.readAsText(file, "utf-8");
  };

  const applyCSV = () => {
    if (!csvRaw) return;
    const { headers, rows } = csvRaw;
    const maIdx = headers.indexOf("ma_xa");
    const newMap = new Map(customData);
    let count = 0;
    for (const row of rows) {
      const ma = row[maIdx];
      if (!ma) continue;
      const entry: CustomWardData = { extra: {} };
      const danTocArr: DanTocTyLe[] = [];
      let totalPct = 0;
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i]; const v = row[i] || "";
        if (h === "ma_xa" || h === "ten_xa") continue;
        if (h === "ghi_chu") { entry.ghi_chu = v; continue; }
        if (h === "san_pham") { entry.san_pham = v; continue; }
        if (h === "tinh_trang") { entry.tinh_trang = v; continue; }
        if (ETHNIC_COLS.includes(h)) {
          const pct = parseFloat(v) || 0;
          if (pct > 0) { danTocArr.push({ dan_toc: h, ty_le: pct }); totalPct += pct; }
          continue;
        }
        if (v) entry.extra![h] = v;
      }
      if (danTocArr.length > 0) {
        // Normalize to 100%
        const sorted = danTocArr.sort((a, b) => b.ty_le - a.ty_le);
        if (totalPct !== 100) sorted.forEach(d => { d.ty_le = Math.round(d.ty_le * 100 / totalPct); });
        entry.dan_toc_csv = sorted;
      }
      newMap.set(ma, entry); count++;
    }
    setCustomData(newMap);
    setCsvPreview(null); setCsvRaw(null);
    setImportMsg({ type: "ok", text: `Đã cập nhật dữ liệu cho ${count} xã thành công.` });
  };

  const downloadTemplate = () => {
    const wards = allWardsRef.current.length > 0 ? allWardsRef.current : [{ ma_xa: "03856", ten_xa: "Ví dụ Xã" } as WardProperties];
    const csv = generateCSVTemplate(wards);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "template_dan_toc.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  /* ─── PDF upload ─── */
  const handlePDFFile = (files: FileList | null) => {
    if (!files || !pdfWardCode.trim()) { setImportMsg({ type: "err", text: "Vui lòng nhập mã xã trước khi tải PDF." }); return; }
    const code = pdfWardCode.trim();
    const newMap = new Map(pdfFiles);
    const existing = newMap.get(code) || [];
    Array.from(files).forEach(file => {
      if (file.type !== "application/pdf") return;
      const url = URL.createObjectURL(file);
      existing.push({ name: file.name, url, size: formatBytes(file.size) });
    });
    newMap.set(code, existing);
    setPdfFiles(newMap);
    setImportMsg({ type: "ok", text: `Đã đính kèm ${files.length} file PDF cho mã xã ${code}.` });
  };

  const removePDF = (maXa: string, idx: number) => {
    const newMap = new Map(pdfFiles);
    const list = [...(newMap.get(maXa) || [])];
    URL.revokeObjectURL(list[idx].url);
    list.splice(idx, 1);
    if (list.length === 0) newMap.delete(maXa); else newMap.set(maXa, list);
    setPdfFiles(newMap);
  };

  /* ─── Derived ward data ─── */
  const wardCustom = selectedWard ? customData.get(selectedWard.ma_xa) : undefined;
  const wardPdfs = selectedWard ? (pdfFiles.get(selectedWard.ma_xa) || []) : [];
  const wardDanToc: DanTocTyLe[] = wardCustom?.dan_toc_csv ?? selectedWard?.dan_toc ?? [];
  const stats = selectedProvince ? PROVINCE_STATS[selectedProvince] : null;

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
                <button className="breadcrumb-item link" onClick={handleBackToRegion}>Toàn vùng</button>
                <span className="breadcrumb-sep">›</span>
                <span className="breadcrumb-item active">{selectedProvince}</span>
                {selectedWard && <><span className="breadcrumb-sep">›</span><span className="breadcrumb-item active">{selectedWard.ten_xa}</span></>}
              </>
            )}
          </div>
          <button className="import-btn" onClick={() => { setShowImport(true); setImportMsg(null); setCsvPreview(null); setCsvRaw(null); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Nhập dữ liệu
          </button>
        </div>
      </div>

      <div className="map-body">
        {/* ─── Map ─── */}
        <div className="map-wrapper">
          <div ref={mapContainerRef} className="map-canvas" />
          {loading && (
            <div className="map-overlay"><div className="loading-spinner"/><span>Đang tải dữ liệu...</span></div>
          )}
          {viewMode === "ward" && (
            <button className="back-button" onClick={handleBackToRegion}>
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
                <div className="ward-name">{selectedWard.ten_xa}</div>
                {selectedWard.loai && <div className="ward-badge">{selectedWard.loai}</div>}

                <div className="info-grid">
                  <div className="info-row"><div className="info-label">Mã đơn vị</div><div className="info-value">{selectedWard.ma_xa || "—"}</div></div>
                  <div className="info-row"><div className="info-label">Diện tích</div><div className="info-value">{selectedWard.dtich_km2 != null ? `${selectedWard.dtich_km2.toFixed(2)} km²` : "—"}</div></div>
                  <div className="info-row"><div className="info-label">Dân số</div><div className="info-value">{selectedWard.dan_so != null ? selectedWard.dan_so.toLocaleString("vi-VN") + " người" : "—"}</div></div>
                  <div className="info-row"><div className="info-label">Mật độ</div><div className="info-value">{selectedWard.matdo_km2 != null ? `${selectedWard.matdo_km2.toFixed(1)} ng/km²` : "—"}</div></div>
                </div>

                {/* Custom data from CSV */}
                {wardCustom && (wardCustom.ghi_chu || wardCustom.san_pham || wardCustom.tinh_trang) && (
                  <div className="custom-data-section">
                    <div className="custom-data-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Dữ liệu bổ sung (từ CSV)
                    </div>
                    <div className="info-grid">
                      {wardCustom.ghi_chu && <div className="info-row"><div className="info-label">Ghi chú</div><div className="info-value">{wardCustom.ghi_chu}</div></div>}
                      {wardCustom.san_pham && <div className="info-row"><div className="info-label">Sản phẩm chính</div><div className="info-value">{wardCustom.san_pham}</div></div>}
                      {wardCustom.tinh_trang && <div className="info-row"><div className="info-label">Tình trạng</div><div className="info-value">{wardCustom.tinh_trang}</div></div>}
                      {wardCustom.extra && Object.entries(wardCustom.extra).map(([k, v]) => (
                        <div key={k} className="info-row"><div className="info-label">{k}</div><div className="info-value">{v}</div></div>
                      ))}
                    </div>
                    {wardCustom.dan_toc_csv && <div className="csv-override-badge">Tỷ lệ dân tộc từ CSV</div>}
                  </div>
                )}

                {/* PDF documents */}
                {wardPdfs.length > 0 && (
                  <div className="pdf-section">
                    <div className="pdf-section-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      Tài liệu đính kèm ({wardPdfs.length})
                    </div>
                    {wardPdfs.map((pdf, i) => (
                      <div key={i} className="pdf-item">
                        <div className="pdf-info">
                          <span className="pdf-name">{pdf.name}</span>
                          <span className="pdf-size">{pdf.size}</span>
                        </div>
                        <div className="pdf-actions">
                          <button className="pdf-btn view" onClick={() => setPdfViewer(pdf)}>Xem</button>
                          <button className="pdf-btn remove" onClick={() => removePDF(selectedWard.ma_xa, i)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ethnic groups */}
                {wardDanToc.length > 0 && (
                  <div className="ethnic-section">
                    <div className="ethnic-section-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Các dân tộc sinh sống
                    </div>
                    <p className="ethnic-hint">Click vào dân tộc để xem tri thức bản địa</p>
                    <div className="ethnic-tags">
                      {wardDanToc.map(({ dan_toc, ty_le }) => {
                        const info = getDanTocInfo(dan_toc);
                        if (!info) return null;
                        const isActive = selectedDanToc?.id === dan_toc;
                        return (
                          <button key={dan_toc} className={`ethnic-tag ${isActive ? "active" : ""}`}
                            style={{ "--tag-color": info.mau } as React.CSSProperties}
                            onClick={() => { setSelectedDanToc(isActive ? null : info); setActiveTriThuc(0); }}>
                            <span className="tag-dot" style={{ background: info.mau }}/>
                            <span className="tag-name">{info.ten.replace("Dân tộc ", "").replace("Người ", "")}</span>
                            <span className="tag-pct">{ty_le}%</span>
                          </button>
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

                {/* Indigenous knowledge */}
                {selectedDanToc && (
                  <div className="knowledge-panel">
                    <div className="knowledge-header" style={{ borderLeftColor: selectedDanToc.mau }}>
                      <div className="knowledge-name" style={{ color: selectedDanToc.mau }}>{selectedDanToc.ten}</div>
                      <div className="knowledge-meta">{selectedDanToc.ngon_ngu} · {selectedDanToc.dan_so_ca_nuoc.toLocaleString("vi-VN")} người</div>
                      <p className="knowledge-desc">{selectedDanToc.mo_ta}</p>
                    </div>
                    <div className="knowledge-tabs">
                      {selectedDanToc.tri_thuc.map((tt, i) => (
                        <button key={i} className={`knowledge-tab ${activeTriThuc === i ? "active" : ""}`}
                          style={{ "--tab-color": selectedDanToc.mau } as React.CSSProperties}
                          onClick={() => setActiveTriThuc(i)}>
                          <span>{tt.bieu_tuong}</span><span>{tt.chu_de}</span>
                        </button>
                      ))}
                    </div>
                    {selectedDanToc.tri_thuc[activeTriThuc] && (
                      <div className="knowledge-content">
                        <div className="knowledge-topic">
                          <span>{selectedDanToc.tri_thuc[activeTriThuc].bieu_tuong}</span>
                          {selectedDanToc.tri_thuc[activeTriThuc].chu_de}
                        </div>
                        <p className="knowledge-text">{selectedDanToc.tri_thuc[activeTriThuc].noi_dung}</p>
                        {selectedDanToc.tri_thuc[activeTriThuc].bai_thuoc.length > 0 && (
                          <div className="recipes">
                            <div className="recipes-title">Bài thuốc / Công thức truyền thống</div>
                            {selectedDanToc.tri_thuc[activeTriThuc].bai_thuoc.map((bt, i) => (
                              <div key={i} className="recipe-card" style={{ borderColor: selectedDanToc.mau + "50" }}>
                                <div className="recipe-name">{bt.ten}</div>
                                <div className="recipe-row"><span className="recipe-label">Nguyên liệu:</span><span className="recipe-val">{bt.nguyen_lieu}</span></div>
                                <div className="recipe-row"><span className="recipe-label">Công dụng:</span><span className="recipe-val highlight" style={{ color: selectedDanToc.mau }}>{bt.cong_dung}</span></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <button className="knowledge-close" onClick={() => setSelectedDanToc(null)}>Đóng thông tin dân tộc</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ward-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>Click vào một xã/phường trên bản đồ để xem thông tin chi tiết và các dân tộc sinh sống</p>
              </div>
            )}

            {stats && (
              <div className="province-stats">
                <div className="stats-title">Thống kê tỉnh {selectedProvince}</div>
                <div className="stats-grid">
                  <div className="stat-item"><div className="stat-value">{stats.dien_tich}</div><div className="stat-label">km² Diện tích</div></div>
                  <div className="stat-item"><div className="stat-value">{stats.dan_so}</div><div className="stat-label">Dân số</div></div>
                  <div className="stat-item"><div className="stat-value">{stats.don_vi}</div><div className="stat-label">Xã/Phường</div></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Import modal ─── */}
      {showImport && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowImport(false); }}>
          <div className="import-modal">
            <div className="modal-header">
              <div className="modal-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Nhập dữ liệu tùy chỉnh
              </div>
              <button className="modal-close" onClick={() => setShowImport(false)}>✕</button>
            </div>

            <div className="modal-tabs">
              <button className={`modal-tab ${importTab === "csv" ? "active" : ""}`} onClick={() => { setImportTab("csv"); setImportMsg(null); }}>
                📊 Import CSV
              </button>
              <button className={`modal-tab ${importTab === "pdf" ? "active" : ""}`} onClick={() => { setImportTab("pdf"); setImportMsg(null); }}>
                📄 Đính kèm PDF
              </button>
            </div>

            <div className="modal-body">
              {importMsg && (
                <div className={`import-message ${importMsg.type}`}>
                  {importMsg.type === "ok" ? "✓" : "⚠"} {importMsg.text}
                </div>
              )}

              {/* ── CSV tab ── */}
              {importTab === "csv" && (
                <div className="csv-tab">
                  <div className="import-info">
                    <strong>Định dạng file CSV:</strong>
                    <p>File CSV cần có cột <code>ma_xa</code> để khớp với xã. Các cột dân tộc: <code>{ETHNIC_COLS.join(", ")}</code> (giá trị từ 0–100, tổng = 100).</p>
                    <p>Các cột thông tin: <code>ghi_chu</code>, <code>san_pham</code>, <code>tinh_trang</code> và các cột tùy chỉnh khác.</p>
                  </div>

                  <div className="btn-row">
                    <button className="action-btn secondary" onClick={downloadTemplate}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Tải template CSV mẫu
                    </button>
                  </div>

                  <label className="file-drop-zone">
                    <input type="file" accept=".csv" hidden onChange={e => { if (e.target.files?.[0]) handleCSVFile(e.target.files[0]); }} />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Click hoặc kéo thả file CSV vào đây</span>
                    <span className="drop-sub">Hỗ trợ encoding UTF-8</span>
                  </label>

                  {csvPreview && (
                    <div className="csv-preview">
                      <div className="preview-stats">
                        Đọc được <strong>{csvPreview.total}</strong> dòng · Khớp <strong className="match-ok">{csvPreview.matched}</strong> xã với dữ liệu hiện tại
                        {viewMode !== "ward" && <span className="match-warn"> (mở tỉnh để kiểm tra khớp đầy đủ)</span>}
                      </div>
                      <div className="preview-table-wrap">
                        <table className="preview-table">
                          <thead><tr>{csvPreview.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                          <tbody>{csvPreview.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c || "—"}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                      <div className="btn-row">
                        <button className="action-btn primary" onClick={applyCSV}>✓ Áp dụng dữ liệu</button>
                        <button className="action-btn ghost" onClick={() => { setCsvPreview(null); setCsvRaw(null); }}>Huỷ</button>
                      </div>
                    </div>
                  )}

                  {customData.size > 0 && (
                    <div className="applied-info">
                      <span>✓ Đang áp dụng dữ liệu tùy chỉnh cho <strong>{customData.size}</strong> xã</span>
                      <button className="clear-btn" onClick={() => { setCustomData(new Map()); setImportMsg({ type: "ok", text: "Đã xóa toàn bộ dữ liệu CSV." }); }}>Xóa tất cả</button>
                    </div>
                  )}
                </div>
              )}

              {/* ── PDF tab ── */}
              {importTab === "pdf" && (
                <div className="pdf-tab">
                  <div className="import-info">
                    <strong>Đính kèm tài liệu PDF cho xã/phường:</strong>
                    <p>Nhập mã xã (<code>ma_xa</code>) rồi chọn file PDF. Tài liệu sẽ hiển thị trong bảng thông tin khi click vào xã đó trên bản đồ.</p>
                  </div>

                  <div className="pdf-upload-form">
                    <label className="form-label">Mã xã (ma_xa)</label>
                    <div className="pdf-input-row">
                      <input
                        type="text" className="code-input" placeholder="Ví dụ: 03856"
                        value={pdfWardCode} onChange={e => setPdfWardCode(e.target.value)}
                      />
                      {selectedWard && (
                        <button className="fill-btn" onClick={() => setPdfWardCode(selectedWard.ma_xa)}>
                          Dùng xã đang chọn ({selectedWard.ten_xa})
                        </button>
                      )}
                    </div>
                    <label className="file-drop-zone">
                      <input type="file" accept=".pdf" multiple hidden
                        onChange={e => handlePDFFile(e.target.files)}/>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span>Click hoặc kéo thả file PDF vào đây</span>
                      <span className="drop-sub">Có thể chọn nhiều file cùng lúc</span>
                    </label>
                  </div>

                  {pdfFiles.size > 0 && (
                    <div className="pdf-list-section">
                      <div className="pdf-list-title">Tài liệu đã đính kèm</div>
                      {Array.from(pdfFiles.entries()).map(([maXa, list]) => (
                        <div key={maXa} className="pdf-ward-group">
                          <div className="pdf-ward-code">Mã xã: {maXa}</div>
                          {list.map((pdf, i) => (
                            <div key={i} className="pdf-item">
                              <div className="pdf-info">
                                <span className="pdf-name">{pdf.name}</span>
                                <span className="pdf-size">{pdf.size}</span>
                              </div>
                              <div className="pdf-actions">
                                <button className="pdf-btn view" onClick={() => setPdfViewer(pdf)}>Xem</button>
                                <button className="pdf-btn remove" onClick={() => removePDF(maXa, i)}>✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── PDF viewer modal ─── */}
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
