import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, NavigationControl, ScaleControl, setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import "./Earth3DModal.css";

type Basemap = "sat" | "osm";

interface Props {
  open: boolean;
  onClose: () => void;
  center?: [number, number];
  zoom?: number;
  overlay?: unknown;
}

const SATELLITE_ATTR = "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics";
const DEM_ATTR = "Địa hình: AWS Terrain Tiles (Mapzen · SRTM/ETOPO)";
const OSM_ATTR = "© OpenStreetMap contributors";

const buildStyle = (satVisible: boolean): any => ({
  version: 8,
  sources: {
    sat: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 18,
      attribution: SATELLITE_ATTR,
    },
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: OSM_ATTR,
    },
    terrainrgb: {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 13,
      encoding: "terrarium",
      attribution: DEM_ATTR,
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#0e1a13" } },
    { id: "base-sat", type: "raster", source: "sat", layout: { visibility: satVisible ? "visible" : "none" } },
    { id: "base-osm", type: "raster", source: "osm", layout: { visibility: satVisible ? "none" : "visible" } },
  ],
});

export default function Earth3DModal({ open, onClose, center, zoom, overlay }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const overlayRef = useRef<unknown>(overlay);
  const exagRef = useRef(1.4);
  const [exag, setExag] = useState(1.4);
  const [basemap, setBasemap] = useState<Basemap>("sat");
  const [ready, setReady] = useState(false);
  overlayRef.current = overlay;

  useEffect(() => {
    if (!open || !mountRef.current) return;
    if (maplibreWorkerUrl) { try { setWorkerUrl(maplibreWorkerUrl); } catch { /* giữ URL mặc định */ } }
    const map = new MapLibreMap({
      container: mountRef.current,
      style: buildStyle(true),
      center: center ?? [103.6, 21.7],
      zoom: zoom ?? 9,
      pitch: 55,
      bearing: 0,
      maxPitch: 70,
      attributionControl: { compact: true },
      hash: false,
    });
    mapRef.current = map;
    (window as unknown as Record<string, unknown>).__earth3d = map;
    const onLoad = () => {
      try { map.setTerrain({ source: "terrainrgb", exaggeration: exagRef.current }); } catch (e) { console.warn("setTerrain lỗi:", e); }
      const data = overlayRef.current;
      if (data) {
        try {
          map.addSource("overlay", { type: "geojson", data: data as any });
          map.addLayer({ id: "overlay-fill", type: "fill", source: "overlay", paint: { "fill-color": "#52b788", "fill-opacity": 0.07 } });
          map.addLayer({ id: "overlay-glow", type: "line", source: "overlay", paint: { "line-color": "#06170e", "line-width": 5, "line-opacity": 0.65 } });
          map.addLayer({ id: "overlay-line", type: "line", source: "overlay", paint: { "line-color": "#eafff5", "line-width": 1.7 } });
        } catch (e) { console.warn("Thêm lớp ranh giới 3D lỗi:", e); }
      }
      setReady(true);
    };
    map.on("load", onLoad);
    map.addControl(new NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");
    return () => {
      map.off("load", onLoad);
      map.remove();
      mapRef.current = null;
      setReady(false);
      const w = window as unknown as Record<string, unknown>;
      if (w.__earth3d === map) delete w.__earth3d;
    };
  }, [open, center, zoom]);

  useEffect(() => {
    exagRef.current = exag;
    const m = mapRef.current;
    if (open && ready && m) { try { m.setTerrain({ source: "terrainrgb", exaggeration: exag }); } catch { /* chưa load xong */ } }
  }, [exag, open, ready]);

  useEffect(() => {
    const m = mapRef.current;
    if (!open || !ready || !m) return;
    if (m.getLayer("base-sat")) m.setLayoutProperty("base-sat", "visibility", basemap === "sat" ? "visible" : "none");
    if (m.getLayer("base-osm")) m.setLayoutProperty("base-osm", "visibility", basemap === "osm" ? "visible" : "none");
  }, [basemap, open, ready]);

  if (!open) return null;
  return (
    <div className="earth3d-overlay" onClick={onClose}>
      <div className="earth3d-panel" onClick={e => e.stopPropagation()}>
        <div className="earth3d-header">
          <div className="earth3d-title">
            <b>🌍 Chế độ 3D — địa hình thật (DEM)</b>
            <span>Xoay & nghiêng góc nhìn kiểu Google Earth ·DEM: NASA SRTM qua AWS Terrain Tiles</span>
          </div>
          <div className="earth3d-tools">
            <div className="earth3d-toggle">
              <button className={basemap === "sat" ? "active" : ""} onClick={() => setBasemap("sat")}>🛰️ Vệ tinh</button>
              <button className={basemap === "osm" ? "active" : ""} onClick={() => setBasemap("osm")}>🗺️ Đường phố</button>
            </div>
            <button className="earth3d-close" onClick={onClose} title="Đóng">✕</button>
          </div>
        </div>
        <div className="earth3d-body" ref={mountRef} />
        <div className="earth3d-footer">
          <span className="earth3d-hint">🖱️ <b>Chuột phải</b>: xoay + nghiêng · Cuộn: zoom · Kéo nút 🧭 bên phải để nghiêng · 2 ngón tay trên điện thoại</span>
          <label className="earth3d-exag">Nổi địa hình: {exag.toFixed(1)}×
            <input type="range" min={0} max={2.5} step={0.1} value={exag} onChange={e => setExag(parseFloat(e.target.value))} />
          </label>
        </div>
      </div>
    </div>
  );
}
