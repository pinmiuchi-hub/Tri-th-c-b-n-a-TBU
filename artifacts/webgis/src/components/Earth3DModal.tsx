import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, NavigationControl, ScaleControl, setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import "./Earth3DModal.css";

type Basemap = "sat" | "osm";

export interface EarthRasterLayer {
  url: string;
  bounds: [[number, number], [number, number]];
  opacity: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  center?: [number, number];
  zoom?: number;
  overlay?: unknown;
  raster?: EarthRasterLayer | null;
  vectors?: GeoJSON.FeatureCollection | null;
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

export default function Earth3DModal({ open, onClose, center, zoom, overlay, raster, vectors }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const overlayRef = useRef<unknown>(overlay);
  const rasterRef = useRef<EarthRasterLayer | null | undefined>(raster);
  const vectorsRef = useRef<GeoJSON.FeatureCollection | null | undefined>(vectors);
  const exagRef = useRef(1.4);
  const [exag, setExag] = useState(1.4);
  const [basemap, setBasemap] = useState<Basemap>("sat");
  const [ready, setReady] = useState(false);
  overlayRef.current = overlay;
  rasterRef.current = raster;
  vectorsRef.current = vectors;

  /* Thêm/cập nhật các lớp đang bật của WebGIS lên bản đồ 3D (idempotent) */
  function applyActiveData(map: MapLibreMap) {
    const r = rasterRef.current;
    try {
      if (r) {
        const [[latS, lngW], [latN, lngE]] = r.bounds;
        const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [[lngW, latN], [lngE, latN], [lngE, latS], [lngW, latS]];
        const source = map.getSource("act-raster") as { updateImage?: (img: { url: string; coordinates: [number, number][] }) => void } | undefined;
        if (source && typeof source.updateImage === "function") {
          source.updateImage({ url: r.url, coordinates });
        } else if (!source) {
          map.addSource("act-raster", { type: "image", url: r.url, coordinates });
        }
        if (!map.getLayer("act-raster-layer")) {
          map.addLayer({ id: "act-raster-layer", type: "raster", source: "act-raster", paint: { "raster-opacity": r.opacity } } as any, map.getLayer("overlay-fill") ? "overlay-fill" : undefined);
        }
        map.setPaintProperty("act-raster-layer", "raster-opacity", r.opacity);
      } else if (map.getLayer("act-raster-layer")) {
        map.removeLayer("act-raster-layer");
        if (map.getSource("act-raster")) map.removeSource("act-raster");
      }
    } catch (e) { console.warn("Lớp raster chuyên đề trong 3D lỗi:", e); }

    const v = vectorsRef.current;
    try {
      if (v && Array.isArray(v.features) && v.features.length > 0) {
        const source = map.getSource("act-vectors") as { setData: (data: unknown) => void } | undefined;
        if (source) {
          source.setData(v);
        } else {
          map.addSource("act-vectors", { type: "geojson", data: v as any });
          const beforeId = map.getLayer("overlay-fill") ? "overlay-fill" : undefined;
          map.addLayer({ id: "act-fill", type: "fill", source: "act-vectors", filter: ["==", ["get", "__geom"], "polygon"], paint: { "fill-color": ["get", "__fillColor"], "fill-opacity": ["get", "__fill"], "fill-outline-color": ["get", "__color"] } } as any, beforeId);
          map.addLayer({ id: "act-line", type: "line", source: "act-vectors", filter: ["==", ["get", "__geom"], "line"], paint: { "line-color": ["get", "__color"], "line-width": ["get", "__weight"] } } as any, beforeId);
          map.addLayer({ id: "act-circle", type: "circle", source: "act-vectors", filter: ["==", ["get", "__geom"], "point"], paint: { "circle-color": ["get", "__color"], "circle-radius": 5, "circle-stroke-color": "#ffffff", "circle-stroke-width": 1 } } as any, beforeId);
        }
      } else if (map.getLayer("act-fill")) {
        ["act-fill", "act-line", "act-circle"].forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
        if (map.getSource("act-vectors")) map.removeSource("act-vectors");
      }
    } catch (e) { console.warn("Lớp vector trong 3D lỗi:", e); }
  }

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
      applyActiveData(map);
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

  // Đồng bộ lớp raster/vector khi props đổi trong lúc đang mở
  useEffect(() => {
    const m = mapRef.current;
    if (!open || !ready || !m) return;
    applyActiveData(m);
  }, [raster, vectors, open, ready]);

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
