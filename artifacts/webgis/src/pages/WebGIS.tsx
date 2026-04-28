import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DanTocTyLe {
  dan_toc: string;
  ty_le: number;
}

interface WardProperties {
  ma_xa: string;
  ten_xa: string;
  loai?: string;
  dtich_km2?: number;
  dan_so?: number;
  matdo_km2?: number;
  ten_tinh?: string;
  sap_nhap?: string;
  tru_so?: string;
  dan_toc?: DanTocTyLe[];
}

interface GeoJsonData {
  type: string;
  features: { type: string; properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } }[];
}

interface BaiThuoc {
  ten: string;
  nguyen_lieu: string;
  cong_dung: string;
}

interface TriThuc {
  chu_de: string;
  bieu_tuong: string;
  noi_dung: string;
  bai_thuoc: BaiThuoc[];
}

interface DanTocInfo {
  id: string;
  ten: string;
  mau: string;
  dan_so_ca_nuoc: number;
  ngon_ngu: string;
  mo_ta: string;
  tri_thuc: TriThuc[];
}

interface DanTocData {
  dan_toc: DanTocInfo[];
}

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

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function WebGIS() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const provincesLayerRef = useRef<L.GeoJSON | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"province" | "ward">("province");
  const [danTocData, setDanTocData] = useState<DanTocData | null>(null);
  const [selectedDanToc, setSelectedDanToc] = useState<DanTocInfo | null>(null);
  const [activeTriThuc, setActiveTriThuc] = useState<number>(0);

  const fetchGeoJson = async (url: string): Promise<GeoJsonData> => {
    const res = await fetch(BASE_PATH + url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.json();
  };

  useEffect(() => {
    fetch(BASE_PATH + "/data/dan_toc.json")
      .then(r => r.json())
      .then(setDanTocData)
      .catch(console.error);
  }, []);

  const getDanTocInfo = (id: string): DanTocInfo | undefined =>
    danTocData?.dan_toc.find(d => d.id === id);

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.7, 103.5],
      zoom: 7,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    try {
      const data = await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(map, data);
      const layer = L.geoJSON(data as GeoJSON.FeatureCollection);
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
    } catch (e) {
      console.error("Failed to load provinces:", e);
    }
  }, []);

  const addProvincesLayer = (map: L.Map, data: GeoJsonData) => {
    if (provincesLayerRef.current) { map.removeLayer(provincesLayerRef.current); }
    const layer = L.geoJSON(data as GeoJSON.FeatureCollection, {
      style: () => ({ color: "#2d6a4f", weight: 3, opacity: 0.9, fillColor: "#74c69d", fillOpacity: 0.25 }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties as { ten_tinh: string };
        (layer as L.Path).on({
          mouseover: (e) => { const l = e.target as L.Path; l.setStyle({ fillOpacity: 0.5, color: "#1b4332", weight: 4 }); l.bringToFront(); },
          mouseout: (e) => { const l = e.target as L.Path; l.setStyle({ fillOpacity: 0.25, color: "#2d6a4f", weight: 3 }); },
          click: () => handleProvinceClick(props.ten_tinh),
        });
        layer.bindTooltip(
          `<div class="province-tooltip"><strong>${props.ten_tinh}</strong></div>`,
          { permanent: false, sticky: true, className: "custom-tooltip" }
        );
      },
    });
    layer.addTo(map);
    provincesLayerRef.current = layer;
  };

  const handleProvinceClick = async (provinceName: string) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    setLoading(true);
    setSelectedProvince(provinceName);
    setSelectedWard(null);
    setSelectedDanToc(null);

    try {
      const data = await fetchGeoJson(PROVINCE_FILES[provinceName]);
      if (provincesLayerRef.current) { map.removeLayer(provincesLayerRef.current); provincesLayerRef.current = null; }
      if (wardsLayerRef.current) { map.removeLayer(wardsLayerRef.current); wardsLayerRef.current = null; }

      const wardsLayer = L.geoJSON(data as GeoJSON.FeatureCollection, {
        style: () => ({ color: "#6b4226", weight: 1.5, opacity: 0.8, fillColor: "#a8d5a2", fillOpacity: 0.3 }),
        onEachFeature: (feature, layer) => {
          const props = feature.properties as WardProperties;
          (layer as L.Path).on({
            mouseover: (e) => { const l = e.target as L.Path; l.setStyle({ fillOpacity: 0.6, color: "#3d1f0d", weight: 2.5, fillColor: "#52b788" }); l.bringToFront(); },
            mouseout: (e) => { const l = e.target as L.Path; l.setStyle({ fillOpacity: 0.3, color: "#6b4226", weight: 1.5, fillColor: "#a8d5a2" }); },
            click: () => { setSelectedWard(props); setSelectedDanToc(null); setActiveTriThuc(0); },
          });
          layer.bindTooltip(`<div class="ward-tooltip">${props.ten_xa}</div>`, { permanent: false, sticky: true, className: "custom-tooltip ward-tip" });
        },
      });

      wardsLayer.addTo(map);
      wardsLayerRef.current = wardsLayer;
      try {
        const bounds = wardsLayer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
      } catch { /* ignore */ }
      setViewMode("ward");
    } catch (e) {
      console.error("Failed to load ward data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegion = async () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    setLoading(true);
    if (wardsLayerRef.current) { map.removeLayer(wardsLayerRef.current); wardsLayerRef.current = null; }
    setSelectedProvince(null); setSelectedWard(null); setSelectedDanToc(null);
    setViewMode("province");
    try {
      const data = await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(map, data);
      const layer = L.geoJSON(data as GeoJSON.FeatureCollection);
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 9, duration: 1.5 });
    } catch (e) {
      console.error("Failed to reload provinces:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initMap();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [initMap]);

  const stats = selectedProvince ? PROVINCE_STATS[selectedProvince] : null;
  const wardDanToc = selectedWard?.dan_toc || [];

  return (
    <div className="webgis-container">
      <div className="map-header">
        <div className="header-left">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
          </div>
          <div>
            <h1 className="header-title">WebGIS Tây Bắc</h1>
            <p className="header-subtitle">Hệ thống thông tin địa lý & tri thức bản địa vùng Tây Bắc</p>
          </div>
        </div>
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
      </div>

      <div className="map-body">
        <div className="map-wrapper">
          <div ref={mapContainerRef} className="map-canvas" />

          {loading && (
            <div className="map-overlay">
              <div className="loading-spinner" />
              <span>Đang tải dữ liệu...</span>
            </div>
          )}

          {viewMode === "ward" && (
            <button className="back-button" onClick={handleBackToRegion}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon"><polyline points="15 18 9 12 15 6" /></svg>
              Quay lại bản đồ vùng
            </button>
          )}

          {viewMode === "province" && (
            <div className="map-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              Click vào tỉnh để xem ranh giới xã và dân tộc
            </div>
          )}

          <div className="map-legend">
            <div className="legend-title">Chú giải</div>
            {viewMode === "province" ? (
              <div className="legend-item"><div className="legend-color province-color"></div><span>Ranh giới tỉnh</span></div>
            ) : (
              <div className="legend-item"><div className="legend-color ward-color"></div><span>Ranh giới xã/phường</span></div>
            )}
          </div>
        </div>

        {viewMode === "ward" && (
          <div className="info-panel">
            {/* ---- Panel header ---- */}
            <div className="info-panel-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <div>
                <div className="panel-title">Thông tin địa bàn</div>
                <div className="panel-subtitle">{selectedProvince}</div>
              </div>
            </div>

            {/* ---- Ward info or empty state ---- */}
            {selectedWard ? (
              <div className="ward-info">
                <div className="ward-name">{selectedWard.ten_xa}</div>
                {selectedWard.loai && <div className="ward-badge">{selectedWard.loai}</div>}

                <div className="info-grid">
                  <div className="info-row">
                    <div className="info-label">Mã đơn vị</div>
                    <div className="info-value">{selectedWard.ma_xa || "—"}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Diện tích</div>
                    <div className="info-value">{selectedWard.dtich_km2 != null ? `${selectedWard.dtich_km2.toFixed(2)} km²` : "—"}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Dân số</div>
                    <div className="info-value">{selectedWard.dan_so != null ? selectedWard.dan_so.toLocaleString("vi-VN") + " người" : "—"}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Mật độ</div>
                    <div className="info-value">{selectedWard.matdo_km2 != null ? `${selectedWard.matdo_km2.toFixed(1)} ng/km²` : "—"}</div>
                  </div>
                </div>

                {/* ---- Ethnic groups section ---- */}
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
                          <button
                            key={dan_toc}
                            className={`ethnic-tag ${isActive ? "active" : ""}`}
                            style={{ "--tag-color": info.mau } as React.CSSProperties}
                            onClick={() => {
                              setSelectedDanToc(isActive ? null : info);
                              setActiveTriThuc(0);
                            }}
                          >
                            <span className="tag-dot" style={{ background: info.mau }} />
                            <span className="tag-name">{info.ten.replace("Dân tộc ", "").replace("Người ", "")}</span>
                            <span className="tag-pct">{ty_le}%</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tỷ lệ bar */}
                    <div className="ethnic-bar-wrap">
                      {wardDanToc.map(({ dan_toc, ty_le }) => {
                        const info = getDanTocInfo(dan_toc);
                        return info ? (
                          <div
                            key={dan_toc}
                            className="ethnic-bar-seg"
                            style={{ width: `${ty_le}%`, background: info.mau }}
                            title={`${info.ten.replace("Dân tộc ", "")}: ${ty_le}%`}
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* ---- Indigenous knowledge panel ---- */}
                {selectedDanToc && (
                  <div className="knowledge-panel">
                    <div className="knowledge-header" style={{ borderLeftColor: selectedDanToc.mau }}>
                      <div className="knowledge-name" style={{ color: selectedDanToc.mau }}>{selectedDanToc.ten}</div>
                      <div className="knowledge-meta">{selectedDanToc.ngon_ngu} · {selectedDanToc.dan_so_ca_nuoc.toLocaleString("vi-VN")} người</div>
                      <p className="knowledge-desc">{selectedDanToc.mo_ta}</p>
                    </div>

                    <div className="knowledge-tabs">
                      {selectedDanToc.tri_thuc.map((tt, i) => (
                        <button
                          key={i}
                          className={`knowledge-tab ${activeTriThuc === i ? "active" : ""}`}
                          style={{ "--tab-color": selectedDanToc.mau } as React.CSSProperties}
                          onClick={() => setActiveTriThuc(i)}
                        >
                          <span>{tt.bieu_tuong}</span>
                          <span>{tt.chu_de}</span>
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
                                <div className="recipe-row">
                                  <span className="recipe-label">Nguyên liệu:</span>
                                  <span className="recipe-val">{bt.nguyen_lieu}</span>
                                </div>
                                <div className="recipe-row">
                                  <span className="recipe-label">Công dụng:</span>
                                  <span className="recipe-val highlight" style={{ color: selectedDanToc.mau }}>{bt.cong_dung}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <button className="knowledge-close" onClick={() => setSelectedDanToc(null)}>
                      Đóng thông tin dân tộc
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ward-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>Click vào một xã/phường trên bản đồ để xem thông tin chi tiết và các dân tộc sinh sống</p>
              </div>
            )}

            {/* ---- Province stats ---- */}
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
    </div>
  );
}
