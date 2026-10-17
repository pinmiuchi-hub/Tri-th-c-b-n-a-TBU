import React, { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./MapComposer.css";
// 🟢 THÊM HÀM NÀY VÀO TRÊN CÙNG FILE MapComposer.tsx:
const isImageSymbol = (str?: string): boolean => {
  if (!str) return false;
  return (
    str.startsWith('data:image/') ||
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.endsWith('.png') ||
    str.endsWith('.jpg') ||
    str.endsWith('.svg') ||
    str.endsWith('.webp')
  );
};
// ─────────────────────────────────────────────
// SYNC STATE TYPE
// ─────────────────────────────────────────────
export interface MapSyncSnapshot {
  activeLayers: Set<string>;
  layersData: any | null;
  selectedProvince: string | null;
  selectedWard: { ma_xa: string; ten_xa: string } | null;
  mapCenter: { lat: number; lng: number; zoom: number };
  viewportBounds?: { north: number; south: number; east: number; west: number };
  annotations: any[];
  legendLayerIds?: string[];
  layerDisplayAll: Record<string, { name: string; color: string; geomType?: "point" | "line" | "polygon"; bieu_tuong?: string; lineDash?: string; lineWeight?: number; fillOpacity?: number }>;
  capturedAt: number;
  ethnicComposition?: { label: string; value: number; color: string }[];
  ethnicLegend?: { label: string; color: string }[];
  densityLegend?: { label: string; color: string; fillOpacity?: number; present?: boolean }[];
  legendSections?: ComposerLegendSection[];
}

// ─────────────────────────────────────────────
// CHÚ GIẢI THEO NHÓM (dựng từ giao diện chính — cùng thứ tự & ký hiệu)
// ─────────────────────────────────────────────
export interface ComposerLegendRow {
  type: "line" | "swatch" | "emoji" | "forest" | "river" | "custom";
  label: string;
  color?: string;
  lineWeight?: number;
  lineDash?: string;
  fillOpacity?: number;
  emoji?: string;
  bieu_tuong?: string;
  osm?: boolean;
  dimmed?: boolean;
  dimTitle?: string;
}
export interface ComposerLegendSection { title?: string; rows: ComposerLegendRow[] }

// ─────────────────────────────────────────────
// SCALE UTILITY
// ─────────────────────────────────────────────
// Hàm tính tỉ lệ chuẩn
const getMapScaleString = (lat: number, zoom: number) => {
  // 156543.03 là độ phân giải tại xích đạo của Web Mercator (mét/pixel) ở mức zoom 0
  const resolutionMetersPerPixel = 156543.03 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
  
  // Quy đổi hệ màn hình chuẩn 96 DPI (1 inch = 2.54 cm -> 96 px = 2.54 cm)
  const scale = Math.round(resolutionMetersPerPixel * 3779.52);
  
  // Trả về định dạng 1 : 1.000.000
  return `1 : ${scale.toLocaleString('vi-VN')}`;
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type ElementType =
  | "mapFrame" | "scalebar" | "northArrow" | "legend"
  | "graticule" | "title" | "chart" | "image" | "textbox";

interface ComposerElement {
  id: string;
  type: ElementType;
  x: number; y: number;
  width: number; height: number;
  zIndex: number;
  locked: boolean; visible: boolean;
  props: Record<string, unknown>;
}

interface PageSize { label: string; width: number; height: number; }

const PAGE_SIZES: PageSize[] = [
  { label: "A4 Ngang", width: 297, height: 210 },
  { label: "A4 Đứng",  width: 210, height: 297 },
  { label: "A3 Ngang", width: 420, height: 297 },
  { label: "A3 Đứng",  width: 297, height: 420 },
  { label: "Letter",   width: 279, height: 216 },
];

const DPI = 3.7795;
const uid = () => Math.random().toString(36).slice(2, 8);
const makeElement = (type: ElementType, page: PageSize, existing: ComposerElement[]): ComposerElement => {
  const pw = page.width * DPI;
  const ph = page.height * DPI;
  const zIndex = existing.length + 1;
  const defaults: Record<ElementType, Partial<ComposerElement>> = {
    // Khung bản đồ thu về khoảng 2/3 bề ngang để chú giải, thước tỉ lệ đặt NGOÀI khung
    // (theo QCVN 80:2024/BTNMT — bảng chú giải bố trí ngoài phạm vi thể hiện lãnh thổ)
    mapFrame:   { x: pw*0.05, y: ph*0.08, width: pw*0.62, height: ph*0.75, props: { showGraticule: false, showGraticuleLabels: true, graticuleInterval: 1, graticuleColor: "#4a6fa1", graticuleOpacity: 0.65, graticuleLineStyle: "dashed" } },
    scalebar:   { x: pw*0.05, y: ph*0.87, width: pw*0.25, height: 44,     props: { unit: "km", style: "line" } },
    northArrow: { x: pw*0.88, y: ph*0.88, width: 48,      height: 48,     props: { style: "classic" } },
    legend:     { x: pw*0.70, y: ph*0.10, width: pw*0.25, height: ph*0.55, props: { title: "Chú giải", bgColor: "#ffffff", bgOpacity: 0.92, fontSize: 10, fontFamily: "Arial", titleFontSize: 11, textColor: "#333333" } },
    graticule:  { x: 0,       y: 0,       width: pw,       height: ph,     props: { interval: 1, showLabels: true } },
    title:      { x: pw*0.10, y: ph*0.01, width: pw*0.80, height: 50,     props: { text: "Tiêu đề bản đồ", fontSize: 24, fontFamily: "Arial", textColor: "#111111", align: "center" } },
    chart:      { x: pw*0.05, y: ph*0.55, width: pw*0.25, height: ph*0.25,props: { chartType: "pie", title: "Cơ cấu dân tộc", showPercent: true, chartScale: 1 } },
    image:      { x: pw*0.05, y: ph*0.05, width: 150,     height: 100,    props: { src: "", alt: "Hình ảnh" } },
    textbox:    { x: pw*0.05, y: ph*0.90, width: pw*0.55, height: 40,     props: { text: "Nguồn: Tổng cục Thống kê (TĐTDS&NO 2019) · OpenStreetMap · NASA SRTM", fontSize: 11, fontFamily: "Arial", textColor: "#333333" } },
  };
  return { id: uid(), type, zIndex, locked: false, visible: true, ...defaults[type] } as ComposerElement;
};

// Ký hiệu chuẩn cho các lớp tích hợp — dùng khi snapshot đồng bộ cũ chưa kèm layerDisplayAll
const BUILTIN_LAYER_FALLBACK: Record<string, { name: string; color: string; geomType?: "point" | "line" | "polygon"; lineDash?: string; lineWeight?: number }> = {
  province_boundaries: { name: "Ranh giới tỉnh", color: "#3c5b45", geomType: "line", lineWeight: 1.9 },
  ward_boundaries: { name: "Ranh giới xã/phường", color: "#345b41", geomType: "line", lineDash: "6,4", lineWeight: 1.0 },
  population_density: { name: "Mật độ dân số", color: "#fe9929", geomType: "polygon" },
  rivers: { name: "Hệ thống sông suối", color: "#4b9ad6", geomType: "line", lineWeight: 1.8 },
};

const TOOLS: { type: ElementType; icon: string; label: string }[] = [
  { type: "mapFrame",   icon: "🗺️", label: "Khung bản đồ" },
  { type: "scalebar",   icon: "📏", label: "Thước đo" },
  { type: "northArrow", icon: "🧭", label: "Hướng Bắc" },
  { type: "legend",     icon: "📋", label: "Chú giải" },
  { type: "title",      icon: "🔤", label: "Tiêu đề" },
  { type: "chart",      icon: "📊", label: "Biểu đồ" },
  { type: "image",      icon: "🖼️", label: "Hình ảnh" },
  { type: "textbox",    icon: "✏️", label: "Văn bản" },
];

// ─────────────────────────────────────────────
// GRATICULE OVERLAY (dùng bounds thực từ snapshot)
// ─────────────────────────────────────────────
const GraticuleOverlay: React.FC<{
  width: number; height: number; interval: number; showLabels: boolean;
  color?: string; opacity?: number; lineStyle?: string;
  realBounds?: { north: number; south: number; east: number; west: number };
}> = ({ width, height, interval, showLabels, color = "#4a6fa1", opacity = 0.65, lineStyle = "dashed", realBounds }) => {
  const lines: React.ReactNode[] = [];
  const strokeDasharray = lineStyle === "solid" ? undefined : lineStyle === "dotted" ? "1,3" : "4,3";
  const safeInterval = Number.isFinite(interval) && interval > 0 ? interval : 1;

  if (realBounds) {
    const { north, south, east, west } = realBounds;
    const step = safeInterval;
    const lon2x = (lng: number) => `${((lng - west) / (east - west)) * 100}%`;
    const lat2y = (lat: number) => `${((north - lat) / (north - south)) * 100}%`;

    for (let lng = Math.ceil(west / step) * step; lng <= east + 0.001; lng = Math.round((lng + step) * 1000) / 1000) {
      const x = lon2x(lng);
      lines.push(<line key={`v${lng}`} x1={x} y1="0" x2={x} y2="100%" stroke={color} strokeWidth="0.6" strokeDasharray={strokeDasharray} opacity={opacity}/>);
      if (showLabels) lines.push(
        <text key={`vl${lng}`} x={x} y="98%" fill={color} opacity={opacity} fontSize="9" textAnchor="middle" fontFamily="monospace">
          {lng.toFixed(step < 1 ? 2 : 0)}°E
        </text>
      );
    }
    for (let lat = Math.ceil(south / step) * step; lat <= north + 0.001; lat = Math.round((lat + step) * 1000) / 1000) {
      const y = lat2y(lat);
      lines.push(<line key={`h${lat}`} x1="0" y1={y} x2="100%" y2={y} stroke={color} strokeWidth="0.6" strokeDasharray={strokeDasharray} opacity={opacity}/>);
      if (showLabels) lines.push(
        <text key={`hl${lat}`} x="1%" y={y} fill={color} opacity={opacity} fontSize="9" fontFamily="monospace" dominantBaseline="auto">
          {lat.toFixed(step < 1 ? 2 : 0)}°N
        </text>
      );
    }
  } else {
    const cols = Math.floor(5 / safeInterval) + 1;
    const rows = Math.floor(4 / safeInterval) + 1;
    for (let i = 0; i <= cols; i++) {
      const x = (i / cols) * 100;
      lines.push(<line key={`v${i}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke={color} strokeWidth="0.5" strokeDasharray={strokeDasharray} opacity={opacity}/>);
      if (showLabels && i < cols) lines.push(
        <text key={`vl${i}`} x={`${x}%`} y="98%" fill="#1a3a6b" fontSize="9" textAnchor="middle">{(102 + i * interval).toFixed(0)}°E</text>
      );
    }
    for (let i = 0; i <= rows; i++) {
      const y = (i / rows) * 100;
      lines.push(<line key={`h${i}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke={color} strokeWidth="0.5" strokeDasharray={strokeDasharray} opacity={opacity}/>);
      if (showLabels && i < rows) lines.push(
        <text key={`hl${i}`} x="1%" y={`${y + 2}%`} fill="#1a3a6b" fontSize="9">{(24 - i * interval).toFixed(0)}°N</text>
      );
    }
  }

  return (
    <svg className="graticule-svg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {lines}
    </svg>
  );
};

// ─────────────────────────────────────────────
// SCALEBAR CONTENT
// ─────────────────────────────────────────────
const ScalebarContent: React.FC<{ el: ComposerElement; snapshot?: MapSyncSnapshot | null; displayZoom?: number }> = ({ el, snapshot, displayZoom }) => {
  const style = (el.props.style as string) || "line";
  let label0 = "0";
  let labelMid = "25 km";
  let labelEnd = "50 km";

  if (snapshot) {
    const zoom = displayZoom ?? snapshot.mapCenter.zoom;
    const { lat } = snapshot.mapCenter;
    const metersPerPx = (156543.03 / Math.pow(2, zoom)) * Math.cos((lat * Math.PI) / 180);
    const barWidthPx = 200;
    const totalMeters = metersPerPx * barWidthPx;
    const unit = (el.props.unit as string) || "km";
    if (unit === "km") {
      const km = totalMeters / 1000;
      const nice = km < 1 ? km.toFixed(1) : Math.round(km);
      labelMid = `${+(nice as any) / 2} km`;
      labelEnd = `${nice} km`;
    } else if (unit === "m") {
      const nice = Math.round(totalMeters / 10) * 10;
      labelMid = `${nice / 2} m`;
      labelEnd = `${nice} m`;
    }
  }

  const ratioZoom = snapshot ? (displayZoom ?? snapshot.mapCenter.zoom) : 7;
  const ratioLat = snapshot?.mapCenter.lat ?? 21.7;
  const ratioValue = Math.round((156543.03 * Math.cos(ratioLat * Math.PI / 180) / Math.pow(2, ratioZoom)) * 3779.52);

  if (style === "text_ratio") {
    const kmPerCm = ratioValue / 100000;
    return (
      <div className="el-scalebar el-scalebar-text">
        <div className="scalebar-ratio">1 : {ratioValue.toLocaleString("vi-VN")}</div>
        <div className="scalebar-ratio-sub">1 cm ≈ {kmPerCm.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} km</div>
      </div>
    );
  }

  const ratioCaption = <div className="scalebar-ratio-cap">Tỷ lệ 1 : {ratioValue.toLocaleString("vi-VN")}</div>;

  if (style === "alternating") {
    return (
      <div className="el-scalebar">
        <svg viewBox="0 0 200 20" style={{ width: "100%", height: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <rect key={i} x={i * 50} y={4} width={50} height={8} fill={i % 2 === 0 ? "#1a1a2e" : "#ffffff"} stroke="#1a1a2e" strokeWidth="1"/>
          ))}
        </svg>
        <div className="scalebar-labels"><span>{label0}</span><span>{labelMid}</span><span>{labelEnd}</span></div>
        {ratioCaption}
      </div>
    );
  }

  if (style === "stepped") {
    return (
      <div className="el-scalebar">
        <svg viewBox="0 0 200 20" style={{ width: "100%", height: 16 }}>
          <line x1="0" y1="10" x2="200" y2="10" stroke="#1a1a2e" strokeWidth="2"/>
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i}>
              <line x1={i * 40} y1="6" x2={i * 40} y2="14" stroke="#1a1a2e" strokeWidth="1.5"/>
              <line x1={i * 40} y1="10" x2={i * 40 + 20} y2="10" stroke="#1a1a2e" strokeWidth="1.5"/>
            </g>
          ))}
        </svg>
        <div className="scalebar-labels"><span>{label0}</span><span>{labelMid}</span><span>{labelEnd}</span></div>
        {ratioCaption}
      </div>
    );
  }

  return (
    <div className="el-scalebar">
      <div className="scalebar-line">
        <div className="scalebar-tick"/>
        <div className="scalebar-body"/>
        <div className="scalebar-tick"/>
      </div>
      <div className="scalebar-labels">
        <span>{label0}</span>
        <span>{labelMid}</span>
        <span>{labelEnd}</span>
      </div>
      {ratioCaption}
    </div>
  );
};

const hexToRgb = (hex: string) => {
  const value = (hex || "#ffffff").replace("#", "");
  const normalized = value.length === 3 ? value.split("").map(c => c + c).join("") : value;
  const int = Number.parseInt(normalized, 16);
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
};

const LegendSwatch: React.FC<{ d: MapSyncSnapshot["layerDisplayAll"][string] }> = ({ d }) => {
  if (d.geomType === "point") {
    return (
      <div className="legend-swatch-point" style={{ borderColor: d.color }}>
        {d.bieu_tuong && isImageSymbol(d.bieu_tuong)
          ? <img src={d.bieu_tuong} alt="" className="legend-symbol-img"/>
          : <span>{d.bieu_tuong || "●"}</span>}
      </div>
    );
  }
  if (d.geomType === "line") {
    return (
      <svg width="24" height="12" className="legend-swatch-line">
        <line x1="0" y1="6" x2="24" y2="6" stroke={d.color} strokeWidth={d.lineWeight ? Math.max(1.5, Math.min(4, d.lineWeight * 1.8)) : 3} strokeDasharray={d.lineDash || undefined}/>
      </svg>
    );
  }
  return (
    <div
      className="legend-swatch-polygon"
      style={{ background: d.color, opacity: d.fillOpacity ?? 0.55, borderColor: d.color }}
    />
  );
};

// ─────────────────────────────────────────────
// ELEMENT CONTENT
// ─────────────────────────────────────────────
const ElementContent: React.FC<{
  el: ComposerElement;
  mapSnapshot?: string;
  syncSnapshot?: MapSyncSnapshot | null;
  displayZoom?: number;
}> = ({ el, mapSnapshot, syncSnapshot, displayZoom }) => {
  const realBounds = syncSnapshot ? (syncSnapshot.viewportBounds || (() => {
    const { lat, lng } = syncSnapshot.mapCenter;
    const zoom = displayZoom ?? syncSnapshot.mapCenter.zoom;
    const degPerPx = 360 / Math.pow(2, zoom + 8);
    const W = el.width, H = el.height;
    return {
      north: lat + degPerPx * H / 2,
      south: lat - degPerPx * H / 2,
      east:  lng + degPerPx * W / 2,
      west:  lng - degPerPx * W / 2,
    };
  })()) : undefined;

  switch (el.type) {
    case "mapFrame":
      return (
        <div className="el-mapframe">
          {mapSnapshot
            ? <img src={mapSnapshot} alt="map" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", background: "#ffffff" }}/>
            : (
              <div className="el-mapframe-placeholder">
                <span>🗺️</span>
                <p>Khung bản đồ</p>
                {syncSnapshot
                  ? <small style={{ color: "#52b788" }}>
                      {syncSnapshot.selectedProvince || "Toàn vùng"} · {getMapScaleString(syncSnapshot.mapCenter.lat, syncSnapshot.mapCenter.zoom)}
                    </small>
                  : <small>Kết nối với Leaflet</small>
                }
              </div>
            )
          }
          {(el.props.showGraticule as boolean) && (
            <GraticuleOverlay
              width={el.width} height={el.height}
              interval={el.props.graticuleInterval as number}
              showLabels={el.props.showGraticuleLabels as boolean}
              color={el.props.graticuleColor as string}
              opacity={el.props.graticuleOpacity as number}
              lineStyle={el.props.graticuleLineStyle as string}
              realBounds={realBounds}
            />
          )}
        </div>
      );

    case "scalebar":
      return <ScalebarContent el={el} snapshot={syncSnapshot} displayZoom={displayZoom}/>;

    case "northArrow": {
      const style = (el.props.style as string) || "classic";
      const declination = Number(el.props.declinationAngle ?? 0);
      if (style === "simple") {
        return (
          <div className="el-north">
            <svg viewBox="0 0 40 50"><polygon points="20,2 28,40 20,32 12,40" fill="#1a1a2e"/><text x="20" y="48" textAnchor="middle" fontSize="10" fontWeight="bold">N</text></svg>
          </div>
        );
      }
      if (style === "compass8") {
        return (
          <div className="el-north">
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="#1a1a2e" strokeWidth="2" fill="none"/>
              <line x1="24" y1="4" x2="24" y2="44" stroke="#1a1a2e" strokeWidth="2"/>
              <line x1="4" y1="24" x2="44" y2="24" stroke="#1a1a2e" strokeWidth="2"/>
              <line x1="10" y1="10" x2="38" y2="38" stroke="#1a1a2e" strokeWidth="2"/>
              <line x1="38" y1="10" x2="10" y2="38" stroke="#1a1a2e" strokeWidth="2"/>
              <text x="24" y="12" textAnchor="middle" fontSize="6">B</text>
              <text x="24" y="44" textAnchor="middle" fontSize="6">N</text>
              <text x="44" y="25" textAnchor="middle" fontSize="6">Đ</text>
              <text x="4" y="25" textAnchor="middle" fontSize="6">T</text>
            </svg>
          </div>
        );
      }
      if (style === "declination") {
        return (
          <div className="el-north">
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="18" stroke="#1a1a2e" strokeWidth="2" fill="none"/>
              <g transform={`rotate(${declination} 24 24)`}>
                <line x1="24" y1="6" x2="24" y2="42" stroke="#1a1a2e" strokeWidth="2"/>
                <line x1="24" y1="24" x2="10" y2="12" stroke="#1a1a2e" strokeWidth="2"/>
                <line x1="24" y1="24" x2="38" y2="12" stroke="#1a1a2e" strokeWidth="2"/>
                <text x="24" y="18" textAnchor="middle" fontSize="5">B</text>
                <text x="24" y="42" textAnchor="middle" fontSize="5">N</text>
              </g>
            </svg>
          </div>
        );
      }
      return (
        <div className="el-north">
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <polygon points="24,2 30,22 24,18 18,22" fill="#1a1a2e"/>
            <polygon points="24,46 30,26 24,30 18,26" fill="#c0c0c0"/>
            <circle cx="24" cy="24" r="3" fill="#1a1a2e"/>
            <text x="24" y="10" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1a1a2e">N</text>
          </svg>
        </div>
      );
    }

    case "legend": {
      // Thứ tự theo QCVN 80:2024/BTNMT: yếu tố chuyên môn (địa giới, phân lớp số liệu, đồ thị)
      // đứng trước, yếu tố nền địa lý (thủy văn) đứng cuối.
      const ids = Array.from(syncSnapshot ? (syncSnapshot.legendLayerIds ?? syncSnapshot.activeLayers) : []);
      const isBoundaryId = (id: string) => id === "province_boundaries" || id === "ward_boundaries";
      const boundaryIds = ids.filter(isBoundaryId);
      const riverIds = ids.filter(id => id === "rivers");
      const otherIds = ids.filter(id => !isBoundaryId(id) && id !== "rivers");
      const legendText = (el.props.textColor as string) || "#333333";
      const ethnicEntries = syncSnapshot
        ? (syncSnapshot.ethnicLegend?.length
            ? syncSnapshot.ethnicLegend
            : syncSnapshot.ethnicComposition?.map(item => ({ label: item.label, color: item.color })))
        : undefined;
      const renderLayerItem = (id: string) => {
        const d = syncSnapshot?.layerDisplayAll[id] ?? BUILTIN_LAYER_FALLBACK[id];
        if (!d) return null;
        return (
          <div key={id} className="legend-item" style={{ fontSize: (el.props.fontSize as number) || 10, color: legendText }}>
            <LegendSwatch d={d}/>
            <span>{d.name}</span>
          </div>
        );
      };
      // Ký hiệu theo đúng mẫu chú giải giao diện chính
      const renderRichRow = (row: ComposerLegendRow, key: React.Key) => {
        const baseStyle: React.CSSProperties = { fontSize: (el.props.fontSize as number) || 10, color: legendText, opacity: row.dimmed ? 0.4 : 1 };
        return (
          <div key={key} className="legend-item" style={baseStyle} title={row.dimTitle}>
            {row.type === "line" && (
              <svg width="18" height="14" viewBox="0 0 18 14" className="legend-swatch-line" style={{ width: 18, height: 14 }}>
                <line x1="1" y1="7" x2="17" y2="7" stroke={row.color || "#333333"} strokeWidth={Math.max(1.5, row.lineWeight ?? 1.5)} strokeDasharray={row.lineDash || undefined} strokeLinecap="round"/>
              </svg>
            )}
            {row.type === "swatch" && <span className="legend-ethnic-color" style={{ background: row.color, opacity: row.fillOpacity ?? 1 }}/>}
            {row.type === "emoji" && <span className="legend-symbol">{row.emoji || "●"}</span>}
            {row.type === "forest" && (
              <svg width="18" height="14" viewBox="0 0 18 14" className="legend-swatch-line" style={{ width: 18, height: 14 }}>
                <rect x="1" y="1" width="16" height="12" rx="2" fill="#ffffff" fillOpacity="0.88"/>
                <rect x="1" y="1" width="16" height="12" rx="2" fill={row.color} fillOpacity="0.75" stroke={row.color} strokeWidth="1.5"/>
              </svg>
            )}
            {row.type === "river" && (
              <svg width="18" height="14" viewBox="0 0 18 14" className="legend-swatch-line" style={{ width: 18, height: 14 }}>
                <path d="M1,10 C5,4 8,12 12,6 S16,3 17,4" fill="none" stroke="#f8fcff" strokeWidth="4.8" strokeLinecap="round" opacity="0.95"/>
                <path d="M1,10 C5,4 8,12 12,6 S16,3 17,4" fill="none" stroke={row.color || "#2589c7"} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
            {row.type === "custom" && (
              <div className="legend-swatch-point" style={{ borderColor: row.color || "#94a3b8" }}>
                {row.bieu_tuong && isImageSymbol(row.bieu_tuong)
                  ? <img src={row.bieu_tuong} alt="" className="legend-symbol-img"/>
                  : <span style={{ color: row.color || "#94a3b8" }}>{row.bieu_tuong || "●"}</span>}
              </div>
            )}
            <span>{row.label}{row.osm && <span style={{ opacity: 0.6, fontStyle: "italic" }}> (OSM)</span>}</span>
          </div>
        );
      };
      return (
        <div className="el-legend" style={{ background: `rgba(${hexToRgb(el.props.bgColor as string || "#ffffff")}, ${(el.props.bgOpacity as number) ?? 0.92})`, color: legendText, fontFamily: (el.props.fontFamily as string) || "Arial", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
          <div className="legend-title" style={{ fontSize: (el.props.titleFontSize as number) || 11, color: legendText }}>{el.props.title as string}</div>
          <div className="legend-items">
            {syncSnapshot
              ? (syncSnapshot.legendSections && syncSnapshot.legendSections.length > 0 ? <>
                {syncSnapshot.legendSections.map((section, sectionIndex) => (
                  <React.Fragment key={`legend-section-${sectionIndex}`}>
                    {section.title && <div className="legend-subtitle" style={{ color: legendText }}>{section.title}</div>}
                    {section.rows.map((row, rowIndex) => renderRichRow(row, `legend-section-${sectionIndex}-row-${rowIndex}`))}
                  </React.Fragment>
                ))}
              </> : <>
                {boundaryIds.map(renderLayerItem)}
                {syncSnapshot.densityLegend && syncSnapshot.densityLegend.length > 0 && <div className="legend-subtitle" style={{ color: legendText }}>Mật độ dân số (người/km²)</div>}
                {syncSnapshot.densityLegend?.map(item => (
                  <div key={`density-${item.label}`} className="legend-item" style={{ fontSize: (el.props.fontSize as number) || 10, color: legendText, opacity: item.present === false ? 0.4 : 1 }} title={item.present === false ? "Chưa có xã nào ở bậc này" : undefined}>
                    <span className="legend-ethnic-color" style={{ background: item.color, opacity: item.fillOpacity ?? 1 }} />
                    <span>{item.label}</span>
                  </div>
                ))}
                {ethnicEntries && ethnicEntries.length > 0 && <>
                  <div className="legend-subtitle" style={{ color: legendText }}>Cơ cấu dân tộc</div>
                  {ethnicEntries.map(item => (
                    <div key={`ethnic-${item.label}`} className="legend-item" style={{ fontSize: (el.props.fontSize as number) || 10, color: legendText }}>
                      <span className="legend-ethnic-color" style={{ background: item.color }} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </>}
                {otherIds.map(renderLayerItem)}
                {riverIds.map(renderLayerItem)}
              </>)
              : (
                <div className="legend-empty" style={{ color: (el.props.textColor as string) || "#666666" }}>
                  Chưa có lớp nào đang bật — bấm 🔄 Đồng bộ để lấy chú giải đúng từ bản đồ chính
                </div>
              )
            }
          </div>
        </div>
      );
    }

    case "graticule":
      return (
        <div className="el-graticule-bg">
          <GraticuleOverlay
            width={el.width} height={el.height}
            interval={el.props.interval as number}
            showLabels={el.props.showLabels as boolean}
            realBounds={realBounds}
          />
        </div>
      );

    case "title":
      return (
        <div className="el-title" style={{
          textAlign: el.props.align as React.CSSProperties["textAlign"],
          fontSize: el.props.fontSize as number,
          fontFamily: el.props.fontFamily as string,
          color: el.props.textColor as string,
        }}>
          {el.props.text as string}
        </div>
      );

    case "chart":
      return (
        <div className="el-chart">
          <div className="chart-title">{el.props.title as string}</div>
          <EthnicChart
            type={(el.props.chartType as "pie" | "bar" | "line") || "pie"}
            data={syncSnapshot?.ethnicComposition}
            showPercent={el.props.showPercent !== false}
            scale={Number(el.props.chartScale ?? 1)}
          />
        </div>
      );

    case "image":
      return (
        <div className="el-image">
          {el.props.src
            ? <img src={el.props.src as string} alt={el.props.alt as string}/>
            : <div className="image-placeholder"><span>🖼️</span><p>Click để chọn ảnh</p></div>
          }
        </div>
      );

    case "textbox":
      return (
        <div className="el-textbox" style={{ fontSize: el.props.fontSize as number, fontFamily: el.props.fontFamily as string, color: el.props.textColor as string }}>
          {el.props.text as string}
        </div>
      );

    default:
      return <div className="el-unknown">?</div>;
  }
};

// ─────────────────────────────────────────────
// ELEMENT PREVIEW (drag/resize wrapper)
// ─────────────────────────────────────────────
const ElementPreview: React.FC<{
  el: ComposerElement;
  selected: boolean;
  mapSnapshot?: string;
  syncSnapshot?: MapSyncSnapshot | null;
  displayZoom?: number;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}> = ({ el, selected, mapSnapshot, syncSnapshot, displayZoom, onClick, onDragStart, onResizeStart }) => {
  if (!el.visible) return null;
  const handles = ["nw","n","ne","e","se","s","sw","w"];
  return (
    <div
      className={`composer-element ${selected ? "selected" : ""} type-${el.type}`}
      style={{ left: el.x, top: el.y, width: el.width, height: el.height, zIndex: el.zIndex, cursor: el.locked ? "not-allowed" : "move" }}
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseDown={e => { if (!el.locked && e.button === 0) { e.stopPropagation(); onDragStart(e); } }}
    >
      <ElementContent el={el} mapSnapshot={mapSnapshot} syncSnapshot={syncSnapshot} displayZoom={displayZoom}/>
      {selected && !el.locked && (
        <>
          {handles.map(h => (
            <div key={h} className={`resize-handle handle-${h}`} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, h); }}/>
          ))}
          <div className="element-badge">{TOOLS.find(t => t.type === el.type)?.icon} {el.type}</div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MINI BAR CHART
// ─────────────────────────────────────────────
const EthnicChart: React.FC<{ type: "pie" | "bar" | "line"; data?: { label: string; value: number; color: string }[]; showPercent: boolean; scale: number }> = ({ type, data: source, showPercent, scale }) => {
  const data = source?.filter(item => Number.isFinite(item.value) && item.value > 0) ?? [];
  if (data.length === 0) return <div className="chart-empty">Chưa có số liệu dân tộc. Hãy đồng bộ bản đồ sau khi chọn xã.</div>;
  if (type === "pie") {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 27 * Math.max(0.6, Math.min(1.6, scale));
    const center = 50;
    let angle = -Math.PI / 2;
    const describeArc = (start: number, end: number) => {
      const startPoint = [center + radius * Math.cos(start), center + radius * Math.sin(start)];
      const endPoint = [center + radius * Math.cos(end), center + radius * Math.sin(end)];
      const largeArc = end - start > Math.PI ? 1 : 0;
      return `M ${center} ${center} L ${startPoint[0]} ${startPoint[1]} A ${radius} ${radius} 0 ${largeArc} 1 ${endPoint[0]} ${endPoint[1]} Z`;
    };
    return <div className="ethnic-pie-layout">
      <svg viewBox="0 0 100 100" className="ethnic-pie-svg" role="img" aria-label="Biểu đồ cơ cấu dân tộc">
        {data.map(item => {
          const startAngle = angle;
          const nextAngle = angle + (item.value / total) * Math.PI * 2;
          const path = describeArc(angle, nextAngle);
          const midAngle = (startAngle + nextAngle) / 2;
          const labelRadius = radius * 0.62;
          const labelX = center + labelRadius * Math.cos(midAngle);
          const labelY = center + labelRadius * Math.sin(midAngle);
          const result = <g key={item.label}>
            <path d={path} fill={item.color} stroke="#fff" strokeWidth="1"/>
            {showPercent && item.value >= 3 && <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize="6" fontWeight="700" fill="#fff" stroke="#333" strokeWidth="0.6" paintOrder="stroke">{item.value}%</text>}
          </g>;
          angle = nextAngle;
          return result;
        })}
      </svg>
      <div className="ethnic-pie-legend">
        {data.map(item => <div className="ethnic-pie-legend-row" key={item.label}>
          <span className="ethnic-pie-color" style={{ background: item.color }}/>
          <span className="ethnic-pie-label">{item.label}</span>
          {showPercent && <strong>{item.value}%</strong>}
        </div>)}
      </div>
    </div>;
  }
  const max = Math.max(...data.map(item => item.value));
  if (type === "line") {
    const w = Math.max(120, data.length * 28);
    const h = 78;
    const padL = 10, padR = 8, padT = 10, padB = 22;
    const xs = data.map((_, i) => data.length === 1 ? w / 2 : padL + (i * (w - padL - padR)) / (data.length - 1));
    const ys = data.map(v => h - padB - (v.value / max) * (h - padT - padB));
    const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "80%" }}>
        <line x1={padL - 4} y1={h - padB} x2={w - 4} y2={h - padB} stroke="#666" strokeWidth="0.8"/>
        <path d={path} fill="none" stroke="#2a9d8f" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
        {data.map((v, i) => (
          <g key={v.label}>
            <circle cx={xs[i]} cy={ys[i]} r="3" fill={v.color} stroke="#fff" strokeWidth="1"/>
            <text x={xs[i]} y={Math.max(6, ys[i] - 5)} textAnchor="middle" fontSize="5" fill="#333">{v.value}%</text>
            <text x={xs[i]} y={h - 8} textAnchor="middle" fontSize="5" fill="#333">{v.label.slice(0, 5)}</text>
          </g>
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 ${Math.max(120, data.length * 28)} 78`} style={{ width: "100%", height: "80%" }}>
      {data.map((v, i) => {
        const barH = (v.value / max) * 45;
        const x = 10 + i * 28;
        return <g key={v.label}>
          <text x={x + 6} y={Math.max(8, 51 - barH)} textAnchor="middle" fontSize="5" fill="#333">{v.value}%</text>
          <rect x={x} y={55 - barH} width="12" height={barH} fill={v.color} rx="2" opacity="0.85"/>
          <text x={x + 6} y="64" textAnchor="middle" fontSize="5" fill="#333">{v.label.slice(0, 5)}</text>
        </g>;
      })}
      <line x1="8" y1="55" x2={Math.max(118, data.length * 28)} y2="55" stroke="#666" strokeWidth="0.8"/>
    </svg>
  );
};

// ─────────────────────────────────────────────
// PROPERTIES PANEL
// ─────────────────────────────────────────────
const PropertiesPanel: React.FC<{
  el: ComposerElement | null;
  onChange: (id: string, patch: Partial<ComposerElement>) => void;
}> = ({ el, onChange }) => {
  if (!el) return (
    <div className="props-panel empty">
      <div className="props-hint"><span>👆</span><p>Chọn một phần tử để chỉnh sửa thuộc tính</p></div>
    </div>
  );
  const set = (patch: Partial<ComposerElement>) => onChange(el.id, patch);
  const setProp = (key: string, val: unknown) => set({ props: { ...el.props, [key]: val } });
  return (
    <div className="props-panel">
      <div className="props-header">
        <span>{TOOLS.find(t => t.type === el.type)?.icon}</span>
        <span>{TOOLS.find(t => t.type === el.type)?.label}</span>
        <span className="props-id">#{el.id}</span>
      </div>
      <div className="props-section">
        <label>Vị trí & Kích thước</label>
        <div className="props-grid4">
          {[["X","x"],["Y","y"],["W","width"],["H","height"]].map(([l,k]) => (
            <div key={k} className="prop-field">
              <span>{l}</span>
              <input type="number" value={Math.round((el as any)[k])} onChange={e => set({ [k]: +e.target.value } as any)}/>
            </div>
          ))}
        </div>
      </div>
      <div className="props-section">
        <label>Trạng thái</label>
        <div className="props-toggles">
          <label className="toggle-label"><input type="checkbox" checked={el.visible} onChange={e => set({ visible: e.target.checked })}/>Hiển thị</label>
          <label className="toggle-label"><input type="checkbox" checked={el.locked} onChange={e => set({ locked: e.target.checked })}/>Khóa</label>
        </div>
      </div>
      {el.type === "mapFrame" && (
        <div className="props-section">
          <label>Kinh vĩ tuyến</label>
          <label className="toggle-label"><input type="checkbox" checked={!!el.props.showGraticule} onChange={e => setProp("showGraticule", e.target.checked)}/>Hiển thị lưới</label>
          <label className="toggle-label"><input type="checkbox" checked={!!el.props.showGraticuleLabels} onChange={e => setProp("showGraticuleLabels", e.target.checked)}/>Hiển thị nhãn độ</label>
          <div className="prop-field">
            <span>Khoảng cách (°)</span>
            <input type="number" min="0.25" max="10" step="0.25" value={el.props.graticuleInterval as number} onChange={e => setProp("graticuleInterval", +e.target.value)}/>
          </div>
          <div className="prop-field"><span>Màu lưới</span><input type="color" value={(el.props.graticuleColor as string) || "#4a6fa1"} onChange={e => setProp("graticuleColor", e.target.value)}/></div>
          <div className="prop-field"><span>Độ trong suốt</span><input type="range" min="0.15" max="1" step="0.05" value={(el.props.graticuleOpacity as number) ?? 0.65} onChange={e => setProp("graticuleOpacity", +e.target.value)}/></div>
          <div className="prop-field">
            <span>Kiểu nét</span>
            <select value={(el.props.graticuleLineStyle as string) || "dashed"} onChange={e => setProp("graticuleLineStyle", e.target.value)}>
              <option value="solid">Liền</option>
              <option value="dashed">Gạch</option>
              <option value="dotted">Chấm</option>
            </select>
          </div>
        </div>
      )}
      {el.type === "title" && (
        <div className="props-section">
          <label>Tiêu đề</label>
          <input className="prop-input-full" value={el.props.text as string} onChange={e => setProp("text", e.target.value)}/>
          <div className="prop-field"><span>Cỡ chữ</span><input type="number" value={el.props.fontSize as number} onChange={e => setProp("fontSize", +e.target.value)}/></div>
          <div className="prop-field"><span>Màu chữ</span><input type="color" value={(el.props.textColor as string) || "#111111"} onChange={e => setProp("textColor", e.target.value)}/></div>
          <div className="prop-field"><span>Kiểu chữ</span><select value={(el.props.fontFamily as string) || "Arial"} onChange={e => setProp("fontFamily", e.target.value)}><option>Arial</option><option>Georgia</option><option>Verdana</option><option>"Times New Roman", serif</option></select></div>
          <div className="prop-field">
            <span>Canh lề</span>
            <select value={el.props.align as string} onChange={e => setProp("align", e.target.value)}>
              <option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option>
            </select>
          </div>
        </div>
      )}
      {el.type === "textbox" && (
        <div className="props-section">
          <label>Văn bản</label>
          <textarea className="prop-textarea" value={el.props.text as string} onChange={e => setProp("text", e.target.value)} rows={3}/>
          <div className="prop-field"><span>Cỡ chữ</span><input type="number" value={el.props.fontSize as number} onChange={e => setProp("fontSize", +e.target.value)}/></div>
          <div className="prop-field"><span>Màu chữ</span><input type="color" value={(el.props.textColor as string) || "#333333"} onChange={e => setProp("textColor", e.target.value)}/></div>
          <div className="prop-field"><span>Kiểu chữ</span><select value={(el.props.fontFamily as string) || "Arial"} onChange={e => setProp("fontFamily", e.target.value)}><option>Arial</option><option>Georgia</option><option>Verdana</option><option>"Times New Roman", serif</option></select></div>
        </div>
      )}
      {el.type === "scalebar" && (
        <div className="props-section">
          <label>Thước đo</label>
          <div className="prop-field">
            <span>Đơn vị</span>
            <select value={el.props.unit as string} onChange={e => setProp("unit", e.target.value)}>
              <option value="km">Kilômét (km)</option>
              <option value="m">Mét (m)</option>
              <option value="mi">Dặm (mi)</option>
            </select>
          </div>
          <div className="prop-field">
            <span>Kiểu</span>
            <select value={el.props.style as string} onChange={e => setProp("style", e.target.value)}>
              <option value="line">Đường thẳng</option>
              <option value="alternating">Đổi màu xen kẽ</option>
              <option value="stepped">Bậc thang</option>
              <option value="text_ratio">Tỷ lệ số/chữ</option>
            </select>
          </div>
        </div>
      )}
      {el.type === "northArrow" && (
        <div className="props-section">
          <label>Hướng Bắc</label>
          <div className="prop-field">
            <span>Kiểu</span>
            <select value={el.props.style as string} onChange={e => setProp("style", e.target.value)}>
              <option value="classic">La bàn cổ điển</option>
              <option value="simple">Mũi tên đơn giản</option>
              <option value="compass8">La bàn 8 hướng</option>
              <option value="declination">Góc lệch 3 hướng Bắc</option>
            </select>
          </div>
          <div className="prop-field">
            <span>Góc lệch (°)</span>
            <input type="number" value={Number(el.props.declinationAngle ?? 0)} onChange={e => setProp("declinationAngle", Number(e.target.value) || 0)}/>
          </div>
        </div>
      )}
      {el.type === "legend" && (
        <div className="props-section">
          <label>Chú giải</label>
          <div className="prop-field"><span>Tiêu đề</span><input value={el.props.title as string} onChange={e => setProp("title", e.target.value)}/></div>
          <div className="prop-field"><span>Màu nền</span><input type="color" value={el.props.bgColor as string} onChange={e => setProp("bgColor", e.target.value)}/></div>
          <div className="prop-field"><span>Độ trong suốt</span><input type="range" min="0.3" max="1" step="0.05" value={el.props.bgOpacity as number} onChange={e => setProp("bgOpacity", +e.target.value)}/></div>
          <div className="prop-field"><span>Màu chữ</span><input type="color" value={el.props.textColor as string} onChange={e => setProp("textColor", e.target.value)}/></div>
          <div className="prop-field"><span>Cỡ chữ mục</span><input type="number" min="8" max="18" value={el.props.fontSize as number} onChange={e => setProp("fontSize", +e.target.value)}/></div>
          <div className="prop-field"><span>Cỡ chữ tiêu đề</span><input type="number" min="9" max="24" value={el.props.titleFontSize as number} onChange={e => setProp("titleFontSize", +e.target.value)}/></div>
          <div className="prop-field">
            <span>Kiểu chữ</span>
            <select value={el.props.fontFamily as string} onChange={e => setProp("fontFamily", e.target.value)}>
              <option value="Arial">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="var(--font-mono)">Mono (kỹ thuật)</option>
            </select>
          </div>
        </div>
      )}
      {el.type === "image" && (
        <div className="props-section">
          <label>Hình ảnh</label>
          <div className="prop-field"><span>Chọn ảnh</span><input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProp("src", String(reader.result || "")); reader.readAsDataURL(file); }}/></div>
          <div className="prop-field"><span>URL</span><input placeholder="https://..." value={el.props.src as string} onChange={e => setProp("src", e.target.value)}/></div>
          <div className="prop-field"><span>Mô tả</span><input value={el.props.alt as string} onChange={e => setProp("alt", e.target.value)}/></div>
        </div>
      )}
      {el.type === "chart" && (
        <div className="props-section">
          <label>Biểu đồ</label>
          <div className="prop-field"><span>Tiêu đề</span><input value={el.props.title as string} onChange={e => setProp("title", e.target.value)}/></div>
          <div className="prop-field">
            <span>Loại</span>
            <select value={el.props.chartType as string} onChange={e => setProp("chartType", e.target.value)}>
              <option value="bar">Cột</option><option value="pie">Tròn</option><option value="line">Đường</option>
            </select>
          </div>
          <label className="toggle-label"><input type="checkbox" checked={el.props.showPercent !== false} onChange={e => setProp("showPercent", e.target.checked)}/>Hiển thị phần trăm</label>
          <div className="prop-field"><span>Kích thước biểu đồ</span><input type="range" min="0.6" max="1.6" step="0.05" value={Number(el.props.chartScale ?? 1)} onChange={e => setProp("chartScale", +e.target.value)}/></div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// LAYERS PANEL
// ─────────────────────────────────────────────
const LayersPanel: React.FC<{
  elements: ComposerElement[]; selectedId: string | null;
  onSelect: (id: string) => void; onToggleVisible: (id: string) => void;
  onToggleLock: (id: string) => void; onDelete: (id: string) => void;
  onReorder: (id: string, dir: 1 | -1) => void;
}> = ({ elements, selectedId, onSelect, onToggleVisible, onToggleLock, onDelete, onReorder }) => {
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
  return (
    <div className="layers-panel">
      <div className="layers-header">Layers</div>
      <div className="layers-list">
        {sorted.map(el => (
          <div key={el.id} className={`layer-item ${selectedId === el.id ? "active" : ""}`} onClick={() => onSelect(el.id)}>
            <span className="layer-icon">{TOOLS.find(t => t.type === el.type)?.icon}</span>
            <span className="layer-name">{TOOLS.find(t => t.type === el.type)?.label}</span>
            <div className="layer-actions">
              <button title="Lên" onClick={e => { e.stopPropagation(); onReorder(el.id, 1); }}>↑</button>
              <button title="Xuống" onClick={e => { e.stopPropagation(); onReorder(el.id, -1); }}>↓</button>
              <button title={el.visible ? "Ẩn" : "Hiện"} onClick={e => { e.stopPropagation(); onToggleVisible(el.id); }}>{el.visible ? "👁" : "🚫"}</button>
              <button title={el.locked ? "Mở khóa" : "Khóa"} onClick={e => { e.stopPropagation(); onToggleLock(el.id); }}>{el.locked ? "🔒" : "🔓"}</button>
              <button title="Xóa" className="layer-delete" onClick={e => { e.stopPropagation(); onDelete(el.id); }}>🗑</button>
            </div>
          </div>
        ))}
        {elements.length === 0 && <div className="layers-empty">Chưa có phần tử nào.<br/>Thêm từ toolbar bên trái.</div>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SYNC INFO PANEL
// ─────────────────────────────────────────────
const SyncPanel: React.FC<{
  snapshot: MapSyncSnapshot | null;
  syncPending: boolean;
  onRequestSync: () => void;
}> = ({ snapshot, syncPending, onRequestSync }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "auto" }}>
      <div style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          onClick={onRequestSync}
          style={{
            width: "100%", padding: "10px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: syncPending ? "rgba(244,162,97,0.15)" : "rgba(82,183,136,0.12)",
            border: `1.5px solid ${syncPending ? "rgba(244,162,97,0.5)" : "rgba(82,183,136,0.3)"}`,
            borderRadius: 8, fontSize: 13, fontWeight: 700,
            color: syncPending ? "#f4a261" : "#74c69d",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          title={syncPending ? "Có thay đổi chưa cập nhật" : "Lấy trạng thái bản đồ hiện tại"}
        >
          <span style={{ fontSize: 16 }}>🔄</span>
          {syncPending ? "Cập nhật từ bản đồ chính" : "Đồng bộ lại"}
          {syncPending && (
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#f4a261",
              animation: "pulse 1.2s ease-in-out infinite", flexShrink: 0,
            }}/>
          )}
        </button>
        {!snapshot && (
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textAlign: "center", marginTop: 10, marginBottom: 0 }}>
            Nhấn nút trên để lấy thông tin từ bản đồ chính
          </p>
        )}
      </div>

      {snapshot && (
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 8 }}>
              THÔNG TIN BẢN ĐỒ
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>📍 Khu vực</span>
                <span style={{ color: "#d8f3dc", fontWeight: 600, fontSize: 11, textAlign: "right", maxWidth: 140 }}>
                  {snapshot.selectedProvince || "Toàn vùng Tây Bắc"}
                  {snapshot.selectedWard && <><br/><span style={{ color: "#74c69d", fontSize: 10 }}>{snapshot.selectedWard.ten_xa}</span></>}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>🗺️ Tỉ lệ</span>
                <span style={{ color: "#52b788", fontWeight: 700, fontFamily: "monospace", fontSize: 12 }}>
                  {getMapScaleString(snapshot.mapCenter.lat, snapshot.mapCenter.zoom)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>🔍 Zoom</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>
                  {snapshot.mapCenter.zoom.toFixed(1)}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>📐 Tọa độ trung tâm</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace", fontSize: 11 }}>
                  {snapshot.mapCenter.lat.toFixed(5)}°N · {snapshot.mapCenter.lng.toFixed(5)}°E
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>🕐 Cập nhật</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>
                  {new Date(snapshot.capturedAt).toLocaleTimeString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {snapshot.activeLayers.size > 0 && (
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 8 }}>
                LỚP ĐANG BẬT ({snapshot.activeLayers.size})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {Array.from(snapshot.activeLayers).map(id => {
                  const d = snapshot.layerDisplayAll[id];
                  if (!d) return null;
                  return (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }}/>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{d.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// EXPORT MODAL
// ─────────────────────────────────────────────
const ExportModal: React.FC<{ onClose: () => void; onExport: (format: "jpg" | "png" | "pdf") => void }> = ({ onClose, onExport }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <div className="modal-title">📤 Xuất bản đồ</div>
      <p className="modal-desc">Chọn định dạng xuất file:</p>
      <div className="modal-actions">
        <button className="btn-export jpg" onClick={() => { onExport("jpg"); onClose(); }}><span>🖼️</span> Xuất JPG</button>
        <button className="btn-export png" onClick={() => { onExport("png"); onClose(); }}><span>🧩</span> Xuất PNG</button>
        <button className="btn-export pdf" onClick={() => { onExport("pdf"); onClose(); }}><span>📄</span> Xuất PDF</button>
        <button className="btn-cancel" onClick={onClose}>Hủy</button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// MAIN MAP COMPOSER
// ─────────────────────────────────────────────
interface MapComposerProps {
  onClose: () => void;
  mapSnapshot?: string;
  syncSnapshot?: MapSyncSnapshot | null;
  onRequestSync?: () => void;
  syncPending?: boolean;
  hidden?: boolean;
  onOpenLayerEditor?: () => void;
  onFrameAspect?: (aspect: number | null) => void;
}

const MapComposer: React.FC<MapComposerProps> = ({
  onClose, mapSnapshot,
  syncSnapshot, onRequestSync, syncPending = false, hidden = false, onOpenLayerEditor, onFrameAspect,
}) => {
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZES[0]);
  const [elements, setElements] = useState<ComposerElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [zoom, setZoom] = useState(0.75);
  const [activeTab, setActiveTab] = useState<"layers" | "props" | "sync">("layers");
  const [displayZoom, setDisplayZoom] = useState<number | null>(null);

  const dragRef = useRef<{ elId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ elId: string; handle: string; startX: number; startY: number; orig: ComposerElement } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayZoom === null && syncSnapshot?.mapCenter) {
      setDisplayZoom(syncSnapshot.mapCenter.zoom);
    }
  }, [displayZoom, syncSnapshot?.mapCenter.zoom]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("webgis-composer-draft");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.pageSize) setPageSize(parsed.pageSize);
      if (parsed.zoom) setZoom(Math.max(0.3, Math.min(2, Math.round(parsed.zoom * 10) / 10)));
      if (Array.isArray(parsed.elements)) {
        // Cập nhật bố cục bản nháp cũ (khung 90% ngang, chú giải lọt vào trong khung)
        // sang chuẩn hiện tại: khung 62% — chú giải đặt NGOÀI khung (QCVN 80:2024/BTNMT).
        const dp: PageSize = parsed.pageSize && typeof parsed.pageSize.width === "number" ? parsed.pageSize : pageSize;
        const pw = dp.width * DPI;
        const ph = dp.height * DPI;
        const near = (a: unknown, b: number) => typeof a === "number" && Math.abs(a - b) < 2;
        const elements: ComposerElement[] = parsed.elements.map((el: ComposerElement) => {
          if (!el || typeof el.x !== "number") return el;
          if (el.type === "mapFrame" && near(el.x, pw * 0.05) && near(el.y, ph * 0.08) && near(el.width, pw * 0.9)) {
            return { ...el, width: Math.round(pw * 0.62) };
          }
          if (el.type === "legend" && near(el.x, pw * 0.72) && near(el.width, pw * 0.22)) {
            return { ...el, x: Math.round(pw * 0.7), width: Math.round(pw * 0.25), height: Math.round(ph * 0.55) };
          }
          return el;
        });
        setElements(elements);
      }
      if (parsed.selectedId) setSelectedId(parsed.selectedId);
    } catch {
      // ignore invalid draft
    }
  }, []);

  // Báo tỉ lệ khung bản đồ về trang WebGIS để ảnh chụp được cắt đúng tỉ lệ (khung lấp đầy, không cắt mất vùng chọn)
  const frameAspect = (() => {
    const frame = elements.find(el => el.type === "mapFrame" && el.visible);
    return frame && frame.height > 0 ? frame.width / frame.height : null;
  })();
  useEffect(() => { onFrameAspect?.(frameAspect); }, [frameAspect, onFrameAspect]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem("webgis-composer-draft", JSON.stringify({ pageSize, zoom, elements, selectedId }));
      } catch {
        // ignore storage errors
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [pageSize, zoom, elements, selectedId]);

  const pageW = pageSize.width * DPI * zoom;
  const pageH = pageSize.height * DPI * zoom;

  const addElement = (type: ElementType) => {
    const el = makeElement(type, pageSize, elements);
    setElements(prev => [...prev, el]);
    setSelectedId(el.id);
    setActiveTab("props");
  };

  const updateElement = (id: string, patch: Partial<ComposerElement>) =>
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...patch } : el));

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const reorderElement = (id: string, dir: 1 | -1) =>
    setElements(prev => prev.map(e => e.id === id ? { ...e, zIndex: Math.max(1, e.zIndex + dir) } : e));

  const onDragStart = useCallback((e: React.MouseEvent, elId: string) => {
    const el = elements.find(x => x.id === elId)!;
    dragRef.current = { elId, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y };
  }, [elements]);

  const onResizeStart = useCallback((e: React.MouseEvent, elId: string, handle: string) => {
    const el = elements.find(x => x.id === elId)!;
    resizeRef.current = { elId, handle, startX: e.clientX, startY: e.clientY, orig: { ...el } };
  }, [elements]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const { elId, startX, startY, origX, origY } = dragRef.current;
        const dx = (e.clientX - startX) / zoom, dy = (e.clientY - startY) / zoom;
        setElements(prev => prev.map(el => el.id === elId ? { ...el, x: origX + dx, y: origY + dy } : el));
      }
      if (resizeRef.current) {
        const { elId, handle, startX, startY, orig } = resizeRef.current;
        const dx = (e.clientX - startX) / zoom, dy = (e.clientY - startY) / zoom;
        setElements(prev => prev.map(el => {
          if (el.id !== elId) return el;
          let { x, y, width, height } = orig;
          if (handle.includes("e")) width = Math.max(40, orig.width + dx);
          if (handle.includes("s")) height = Math.max(20, orig.height + dy);
          if (handle.includes("w")) { x = orig.x + dx; width = Math.max(40, orig.width - dx); }
          if (handle.includes("n")) { y = orig.y + dy; height = Math.max(20, orig.height - dy); }
          return { ...el, x, y, width, height };
        }));
      }
    };
    const onMouseUp = () => { dragRef.current = null; resizeRef.current = null; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [zoom]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId
        && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        deleteElement(selectedId);
      }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const saveBlobWithPicker = async (blob: Blob, suggestedName: string) => {
    if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
      try {
        const handle = await (window as Window & typeof globalThis & { showSaveFilePicker: (opts: any) => Promise<any> }).showSaveFilePicker({
          suggestedName,
          types: [{ description: "Bản đồ", accept: { [blob.type || "application/octet-stream"]: [suggestedName.match(/\.\w+$/)?.[0] || ".png"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch {
        // fall back to download
      }
    }
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = suggestedName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: "jpg" | "png" | "pdf") => {
const target = canvasRef.current;    if (!target) return;
    const waitForImages = () => Promise.all(Array.from(target.querySelectorAll("img")).filter(img => !img.complete).map(img => new Promise<void>(resolve => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    })));
    await waitForImages();
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: format === "png" ? null : "#ffffff" });
    if (format === "jpg") {
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.95));
      await saveBlobWithPicker(blob, `webgis-map-${Date.now()}.jpg`);
      return;
    }
    if (format === "png") {
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/png"));
      await saveBlobWithPicker(blob, `webgis-map-${Date.now()}.png`);
      return;
    }
    const pdf = new jsPDF({ orientation: pageSize.width > pageSize.height ? "landscape" : "portrait", unit: "mm", format: [pageSize.width, pageSize.height] });
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output("blob");
    await saveBlobWithPicker(pdfBlob, `webgis-map-${Date.now()}.pdf`);
  };

  const selectedEl = elements.find(e => e.id === selectedId) ?? null;

  return (
    <div className="map-composer" style={hidden ? { display: "none" } : undefined}>
      {/* ── TOP BAR ── */}
      <div className="composer-topbar">
        <div className="topbar-left">
          <button className="btn-close" onClick={onClose}>✕ Đóng</button>
          <span className="topbar-title">🗺️ Biên tập bản đồ</span>
        </div>
        
        {/* ĐÃ CẬP NHẬT TOPBAR-CENTER THEO YÊU CẦU */}
        <div className="topbar-center">
          <select className="page-select" value={pageSize.label} onChange={e => setPageSize(PAGE_SIZES.find(p => p.label === e.target.value)!)}>
            {PAGE_SIZES.map(p => <option key={p.label}>{p.label}</option>)}
          </select>
          <div className="zoom-control">
            <button onClick={() => setZoom(z => Math.max(0.3, Math.round((z - 0.1) * 10) / 10))}>−</button>
            <span>{Math.round(zoom * 10) * 10}%</span>
            <button onClick={() => setZoom(z => Math.min(2, Math.round((z + 0.1) * 10) / 10))}>+</button>
          </div>
        </div>
        
        <div className="topbar-right">
          {onRequestSync && (
            <button
              onClick={() => { onRequestSync(); setActiveTab("sync"); }}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                cursor: "pointer", borderRadius: 6, fontSize: 12, fontWeight: 700,
                fontFamily: "inherit", border: "1.5px solid",
                background: syncPending ? "rgba(244,162,97,0.15)" : "rgba(82,183,136,0.1)",
                borderColor: syncPending ? "rgba(244,162,97,0.55)" : "rgba(82,183,136,0.35)",
                color: syncPending ? "#f4a261" : "#74c69d",
                transition: "all 0.15s",
              }}
              title={syncPending ? "Có thay đổi chưa đồng bộ — Click để cập nhật" : "Đồng bộ từ bản đồ chính"}
            >
              <span>🔄</span>
              <span>{syncPending ? "Cập nhật" : "Đồng bộ"}</span>
              {syncPending && (
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#f4a261",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}/>
              )}
            </button>
          )}
          {selectedId && (
            <button className="btn-delete-el" onClick={() => deleteElement(selectedId)}>🗑 Xóa</button>
          )}
          {onOpenLayerEditor && (
            <button className="btn-export-main" onClick={onOpenLayerEditor} style={{ background: "#0ea5e9" }}>✏️ Sửa dữ liệu lớp</button>
          )}
          <button className="btn-export-main" onClick={() => setShowExport(true)}>📤 Xuất file</button>
        </div>
      </div>

      <div className="composer-body">
        {/* ── LEFT TOOLBAR ── */}
        <div className="composer-toolbar">
          <div className="toolbar-label">Thêm phần tử</div>
          {TOOLS.map(tool => (
            <button key={tool.type} className="tool-btn" onClick={() => addElement(tool.type)} title={tool.label}>
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>

        {/* ── CANVAS AREA ── */}
        <div className="composer-canvas-wrap" onClick={() => setSelectedId(null)}>
          <div className="canvas-scroll">
            <div ref={canvasRef} className="composer-page" style={{ width: pageW, height: pageH }}>
              <div className="page-margin-guide"/>
              {elements.map(el => (
                <ElementPreview
                  key={el.id}
                  el={{ ...el, x: el.x * zoom, y: el.y * zoom, width: el.width * zoom, height: el.height * zoom }}
                  selected={selectedId === el.id}
                  mapSnapshot={el.type === "mapFrame" ? mapSnapshot : undefined}
                  syncSnapshot={syncSnapshot}
                  displayZoom={displayZoom ?? syncSnapshot?.mapCenter.zoom}
                  onClick={() => { setSelectedId(el.id); setActiveTab("props"); }}
                  onDragStart={e => onDragStart(e, el.id)}
                  onResizeStart={(e, h) => onResizeStart(e, el.id, h)}
                />
              ))}
              {elements.length === 0 && (
                <div className="canvas-empty-hint">
                  <div className="hint-icon">🗺️</div>
                  <div className="hint-text">Thêm phần tử từ toolbar bên trái</div>
                  <div className="hint-sub">Bắt đầu với "Khung bản đồ" để kết nối bản đồ Leaflet</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="composer-right">
          <div className="right-tabs">
            <button className={`tab-btn ${activeTab === "layers" ? "active" : ""}`} onClick={() => setActiveTab("layers")}>📚 Layers</button>
            <button className={`tab-btn ${activeTab === "props" ? "active" : ""}`} onClick={() => setActiveTab("props")}>⚙️ Thuộc tính</button>
            <button
              className={`tab-btn ${activeTab === "sync" ? "active" : ""}`}
              onClick={() => setActiveTab("sync")}
              style={{ position: "relative" }}
            >
              🔄 Đồng bộ
              {syncPending && (
                <span style={{
                  position: "absolute", top: 4, right: 4,
                  width: 6, height: 6, borderRadius: "50%", background: "#f4a261",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}/>
              )}
            </button>
          </div>
          {activeTab === "layers" && (
            <LayersPanel
              elements={elements} selectedId={selectedId}
              onSelect={id => { setSelectedId(id); setActiveTab("props"); }}
              onToggleVisible={id => updateElement(id, { visible: !elements.find(e => e.id === id)!.visible })}
              onToggleLock={id => updateElement(id, { locked: !elements.find(e => e.id === id)!.locked })}
              onDelete={deleteElement} onReorder={reorderElement}
            />
          )}
          {activeTab === "props" && <PropertiesPanel el={selectedEl} onChange={updateElement}/>}
          {activeTab === "sync" && (
            <SyncPanel
              snapshot={syncSnapshot ?? null}
              syncPending={syncPending}
              onRequestSync={onRequestSync || (() => {})}
            />
          )}
        </div>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} onExport={handleExport}/>}

      {/* CSS animation cho dot pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default MapComposer;