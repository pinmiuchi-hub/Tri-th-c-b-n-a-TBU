import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ProvinceProperties {
  ma_tinh: string;
  ten_tinh: string;
  dien_tich?: number;
  dan_so?: number;
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
}

interface GeoJsonFeature {
  type: string;
  properties: ProvinceProperties | WardProperties;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

const PROVINCE_FILES: Record<string, string> = {
  "Sơn La": "/data/xa_sonla.geojson",
  "Điện Biên": "/data/xa_dienbien.geojson",
  "Lai Châu": "/data/xa_laichau.geojson",
};

const PROVINCE_CENTERS: Record<string, [number, number]> = {
  "Sơn La": [21.1, 104.0],
  "Điện Biên": [21.4, 103.0],
  "Lai Châu": [22.2, 103.4],
};

const PROVINCE_ZOOM: Record<string, number> = {
  "Sơn La": 9,
  "Điện Biên": 9,
  "Lai Châu": 9,
};

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function WebGIS() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const provincesLayerRef = useRef<L.GeoJSON | null>(null);
  const wardsLayerRef = useRef<L.GeoJSON | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"province" | "ward">("province");

  const fetchGeoJson = async (url: string): Promise<GeoJsonData> => {
    const res = await fetch(BASE_PATH + url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.json();
  };

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.3, 103.5],
      zoom: 8,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }
    ).addTo(map);

    mapRef.current = map;

    try {
      const data = await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(map, data);
    } catch (e) {
      console.error("Failed to load provinces:", e);
    }
  }, []);

  const addProvincesLayer = (map: L.Map, data: GeoJsonData) => {
    if (provincesLayerRef.current) {
      map.removeLayer(provincesLayerRef.current);
    }

    const layer = L.geoJSON(data as GeoJSON.FeatureCollection, {
      style: () => ({
        color: "#2d6a4f",
        weight: 3,
        opacity: 0.9,
        fillColor: "#74c69d",
        fillOpacity: 0.25,
        dashArray: undefined,
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties as ProvinceProperties;

        (layer as L.Path).on({
          mouseover: (e) => {
            const l = e.target as L.Path;
            l.setStyle({ fillOpacity: 0.5, color: "#1b4332", weight: 4 });
            l.bringToFront();
          },
          mouseout: (e) => {
            const l = e.target as L.Path;
            l.setStyle({ fillOpacity: 0.25, color: "#2d6a4f", weight: 3 });
          },
          click: () => {
            handleProvinceClick(props.ten_tinh);
          },
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

    const fileUrl = PROVINCE_FILES[provinceName];
    if (!fileUrl) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchGeoJson(fileUrl);

      if (provincesLayerRef.current) {
        map.removeLayer(provincesLayerRef.current);
        provincesLayerRef.current = null;
      }
      if (wardsLayerRef.current) {
        map.removeLayer(wardsLayerRef.current);
        wardsLayerRef.current = null;
      }

      const wardsLayer = L.geoJSON(data as GeoJSON.FeatureCollection, {
        style: () => ({
          color: "#6b4226",
          weight: 1.5,
          opacity: 0.8,
          fillColor: "#a8d5a2",
          fillOpacity: 0.3,
        }),
        onEachFeature: (feature, layer) => {
          const props = feature.properties as WardProperties;

          (layer as L.Path).on({
            mouseover: (e) => {
              const l = e.target as L.Path;
              l.setStyle({ fillOpacity: 0.6, color: "#3d1f0d", weight: 2.5, fillColor: "#52b788" });
              l.bringToFront();
              setHoveredWard(props.ten_xa);
            },
            mouseout: (e) => {
              const l = e.target as L.Path;
              l.setStyle({ fillOpacity: 0.3, color: "#6b4226", weight: 1.5, fillColor: "#a8d5a2" });
              setHoveredWard(null);
            },
            click: () => {
              setSelectedWard(props);
            },
          });

          layer.bindTooltip(
            `<div class="ward-tooltip">${props.ten_xa}</div>`,
            { permanent: false, sticky: true, className: "custom-tooltip ward-tip" }
          );
        },
      });

      wardsLayer.addTo(map);
      wardsLayerRef.current = wardsLayer;

      const center = PROVINCE_CENTERS[provinceName] || [21.1, 103.5];
      const zoom = PROVINCE_ZOOM[provinceName] || 9;

      if (data.features.length > 0) {
        try {
          const bounds = wardsLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
          } else {
            map.setView(center, zoom, { animate: true });
          }
        } catch {
          map.setView(center, zoom, { animate: true });
        }
      } else {
        map.setView(center, zoom, { animate: true });
      }

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

    if (wardsLayerRef.current) {
      map.removeLayer(wardsLayerRef.current);
      wardsLayerRef.current = null;
    }

    setSelectedProvince(null);
    setSelectedWard(null);
    setHoveredWard(null);
    setViewMode("province");

    try {
      const data = await fetchGeoJson("/data/tinh.geojson");
      addProvincesLayer(map, data);
      map.flyTo([21.3, 103.5], 8, { duration: 1.5 });
    } catch (e) {
      console.error("Failed to reload provinces:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

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
            <p className="header-subtitle">Hệ thống thông tin địa lý vùng Tây Bắc Việt Nam</p>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-icon">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Quay lại bản đồ vùng
            </button>
          )}

          {viewMode === "province" && (
            <div className="map-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Click vào tỉnh để xem ranh giới xã
            </div>
          )}

          <div className="map-legend">
            <div className="legend-title">Chú giải</div>
            {viewMode === "province" ? (
              <>
                <div className="legend-item">
                  <div className="legend-color province-color"></div>
                  <span>Ranh giới tỉnh</span>
                </div>
              </>
            ) : (
              <>
                <div className="legend-item">
                  <div className="legend-color ward-color"></div>
                  <span>Ranh giới xã/phường</span>
                </div>
                {hoveredWard && (
                  <div className="legend-hovered">
                    <strong>{hoveredWard}</strong>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {viewMode === "ward" && (
          <div className="info-panel">
            <div className="info-panel-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel-icon">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <div className="panel-title">Thông tin địa bàn</div>
                <div className="panel-subtitle">{selectedProvince}</div>
              </div>
            </div>

            {selectedWard ? (
              <div className="ward-info">
                <div className="ward-name">{selectedWard.ten_xa}</div>
                {selectedWard.loai && (
                  <div className="ward-badge">{selectedWard.loai}</div>
                )}

                <div className="info-grid">
                  <div className="info-row">
                    <div className="info-label">Mã đơn vị</div>
                    <div className="info-value">{selectedWard.ma_xa || "—"}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Diện tích</div>
                    <div className="info-value">
                      {selectedWard.dtich_km2 != null
                        ? `${selectedWard.dtich_km2.toFixed(2)} km²`
                        : "—"}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Dân số</div>
                    <div className="info-value">
                      {selectedWard.dan_so != null
                        ? selectedWard.dan_so.toLocaleString("vi-VN") + " người"
                        : "—"}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Mật độ dân số</div>
                    <div className="info-value">
                      {selectedWard.matdo_km2 != null
                        ? `${selectedWard.matdo_km2.toFixed(1)} người/km²`
                        : "—"}
                    </div>
                  </div>
                  {selectedWard.tru_so && (
                    <div className="info-row">
                      <div className="info-label">Trụ sở</div>
                      <div className="info-value">{selectedWard.tru_so}</div>
                    </div>
                  )}
                  {selectedWard.sap_nhap && (
                    <div className="info-row full">
                      <div className="info-label">Sáp nhập từ</div>
                      <div className="info-value small">{selectedWard.sap_nhap}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="ward-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                  <path d="M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14z" />
                </svg>
                <p>Click vào một xã/phường trên bản đồ để xem thông tin chi tiết</p>
              </div>
            )}

            <div className="province-stats">
              <div className="stats-title">Thống kê tỉnh</div>
              <div className="stats-grid">
                {selectedProvince === "Sơn La" && (
                  <>
                    <div className="stat-item">
                      <div className="stat-value">14.174</div>
                      <div className="stat-label">km² Diện tích</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">1,2M</div>
                      <div className="stat-label">Dân số</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">12</div>
                      <div className="stat-label">Huyện/TP</div>
                    </div>
                  </>
                )}
                {selectedProvince === "Điện Biên" && (
                  <>
                    <div className="stat-item">
                      <div className="stat-value">9.541</div>
                      <div className="stat-label">km² Diện tích</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">598K</div>
                      <div className="stat-label">Dân số</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">10</div>
                      <div className="stat-label">Huyện/TP</div>
                    </div>
                  </>
                )}
                {selectedProvince === "Lai Châu" && (
                  <>
                    <div className="stat-item">
                      <div className="stat-value">9.068</div>
                      <div className="stat-label">km² Diện tích</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">460K</div>
                      <div className="stat-label">Dân số</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">8</div>
                      <div className="stat-label">Huyện/TP</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div ref={tooltipRef} className="floating-tooltip" />
    </div>
  );
}
