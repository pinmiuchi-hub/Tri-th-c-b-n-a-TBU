export type GeomType = "point" | "line" | "polygon";

export interface InternalFeature {
  ten?: string;
  mo_ta?: string;
  lat?: number;
  lng?: number;
  coords?: number[][] | number[][][];
  [k: string]: unknown;
}

export interface ParsedLayer {
  features: InternalFeature[];
  geomType: GeomType;
  suggestedName?: string;
}

const escXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const stripFn = (s: string) => s.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();

const pickName = (props: Record<string, unknown>): string =>
  (props.ten as string) || (props.name as string) || (props.NAME as string) || (props.Name as string) || (props.title as string) || "";

const pickDesc = (props: Record<string, unknown>): string =>
  (props.mo_ta as string) || (props.description as string) || (props.Description as string) || "";

/* ─── GeoJSON → InternalFeature[] ─── */
export function parseGeoJSON(text: string, fallbackName?: string): ParsedLayer | null {
  let json: any;
  try { json = JSON.parse(text); } catch { return null; }

  const rawFeatures: any[] = json.type === "FeatureCollection" ? (json.features || [])
    : json.type === "Feature" ? [json]
    : json.type && json.coordinates ? [{ type: "Feature", properties: {}, geometry: json }]
    : [];

  if (rawFeatures.length === 0) return null;

  const out: InternalFeature[] = [];
  let geomType: GeomType | null = null;

  for (const f of rawFeatures) {
    if (!f.geometry) continue;
    const props = f.properties || {};
    const ten = pickName(props);
    const mo_ta = pickDesc(props);
    const g = f.geometry;
    const t = g.type;

    if (t === "Point") {
      const [lng, lat] = g.coordinates;
      if (typeof lat !== "number" || typeof lng !== "number") continue;
      out.push({ ten, mo_ta, lat, lng, ...props });
      geomType = geomType ?? "point";
    } else if (t === "MultiPoint") {
      for (const [lng, lat] of g.coordinates) {
        out.push({ ten, mo_ta, lat, lng, ...props });
      }
      geomType = geomType ?? "point";
    } else if (t === "LineString") {
      out.push({ ten, mo_ta, coords: g.coordinates, ...props });
      geomType = geomType ?? "line";
    } else if (t === "MultiLineString") {
      for (const line of g.coordinates) {
        out.push({ ten, mo_ta, coords: line, ...props });
      }
      geomType = geomType ?? "line";
    } else if (t === "Polygon") {
      out.push({ ten, mo_ta, coords: g.coordinates[0], ...props });
      geomType = geomType ?? "polygon";
    } else if (t === "MultiPolygon") {
      for (const poly of g.coordinates) {
        out.push({ ten, mo_ta, coords: poly[0], ...props });
      }
      geomType = geomType ?? "polygon";
    }
  }

  if (out.length === 0 || !geomType) return null;
  return { features: out, geomType, suggestedName: fallbackName };
}

/* ─── KML → InternalFeature[] ─── */
function parseCoords(text: string): number[][] {
  return text.trim().split(/\s+/).map(p => {
    const parts = p.split(",").map(Number);
    return [parts[0], parts[1]]; // [lng, lat]
  }).filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat));
}

export function parseKML(text: string, fallbackName?: string): ParsedLayer | null {
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(text, "text/xml");
  } catch { return null; }
  if (doc.querySelector("parsererror")) return null;

  const placemarks = Array.from(doc.querySelectorAll("Placemark"));
  if (placemarks.length === 0) return null;

  const out: InternalFeature[] = [];
  let geomType: GeomType | null = null;

  for (const pm of placemarks) {
    const ten = pm.querySelector(":scope > name")?.textContent?.trim() || "";
    const mo_ta = pm.querySelector(":scope > description")?.textContent?.trim() || "";

    // Point
    const pointCoords = pm.querySelector("Point > coordinates")?.textContent;
    if (pointCoords) {
      const c = parseCoords(pointCoords);
      if (c.length > 0) {
        out.push({ ten, mo_ta, lat: c[0][1], lng: c[0][0] });
        geomType = geomType ?? "point";
      }
      continue;
    }

    // LineString
    const lineCoords = pm.querySelector("LineString > coordinates")?.textContent;
    if (lineCoords) {
      const c = parseCoords(lineCoords);
      if (c.length >= 2) {
        out.push({ ten, mo_ta, coords: c });
        geomType = geomType ?? "line";
      }
      continue;
    }

    // Polygon (outer boundary only)
    const polyCoords = pm.querySelector("Polygon outerBoundaryIs LinearRing coordinates")?.textContent;
    if (polyCoords) {
      const c = parseCoords(polyCoords);
      if (c.length >= 3) {
        out.push({ ten, mo_ta, coords: c });
        geomType = geomType ?? "polygon";
      }
      continue;
    }

    // MultiGeometry: flatten
    const multi = pm.querySelector("MultiGeometry");
    if (multi) {
      multi.querySelectorAll("Point > coordinates").forEach(node => {
        const c = parseCoords(node.textContent || "");
        if (c.length > 0) { out.push({ ten, mo_ta, lat: c[0][1], lng: c[0][0] }); geomType = geomType ?? "point"; }
      });
      multi.querySelectorAll("LineString > coordinates").forEach(node => {
        const c = parseCoords(node.textContent || "");
        if (c.length >= 2) { out.push({ ten, mo_ta, coords: c }); geomType = geomType ?? "line"; }
      });
      multi.querySelectorAll("Polygon outerBoundaryIs LinearRing coordinates").forEach(node => {
        const c = parseCoords(node.textContent || "");
        if (c.length >= 3) { out.push({ ten, mo_ta, coords: c }); geomType = geomType ?? "polygon"; }
      });
    }
  }

  if (out.length === 0 || !geomType) return null;

  // Try to get document name
  const docName = doc.querySelector("Document > name")?.textContent?.trim() || fallbackName;
  return { features: out, geomType, suggestedName: docName };
}

/* ─── Auto-parse by extension/content ─── */
export async function parseGeoFile(file: File): Promise<ParsedLayer | null> {
  const text = await file.text();
  const name = stripFn(file.name);
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".kml") || text.trimStart().startsWith("<?xml") || text.includes("<kml")) {
    return parseKML(text, name) || parseGeoJSON(text, name);
  }
  return parseGeoJSON(text, name) || parseKML(text, name);
}

/* ─── InternalFeature[] → GeoJSON ─── */
function featureGeometry(f: InternalFeature, geomType: GeomType): any | null {
  if (geomType === "point") {
    if (typeof f.lat !== "number" || typeof f.lng !== "number") return null;
    return { type: "Point", coordinates: [f.lng, f.lat] };
  }
  const raw = f.coords as any;
  if (!raw) return null;
  if (geomType === "line") {
    const coords = (Array.isArray(raw[0]) && Array.isArray(raw[0][0])) ? raw[0] : raw;
    if (!coords || coords.length < 2) return null;
    return { type: "LineString", coordinates: coords };
  }
  if (geomType === "polygon") {
    const ring = (Array.isArray(raw[0]) && Array.isArray(raw[0][0])) ? raw[0] : raw;
    if (!ring || ring.length < 3) return null;
    const closed = ring[0][0] === ring[ring.length-1][0] && ring[0][1] === ring[ring.length-1][1] ? ring : [...ring, ring[0]];
    return { type: "Polygon", coordinates: [closed] };
  }
  return null;
}

export function featuresToGeoJSON(features: InternalFeature[], geomType: GeomType): any {
  return {
    type: "FeatureCollection",
    features: features.map(f => {
      const geom = featureGeometry(f, geomType);
      if (!geom) return null;
      const { lat, lng, coords, ...props } = f;
      void lat; void lng; void coords;
      return { type: "Feature", properties: props, geometry: geom };
    }).filter(Boolean)
  };
}

/* ─── InternalFeature[] → KML ─── */
function geometryKML(f: InternalFeature, geomType: GeomType): string {
  if (geomType === "point") {
    if (typeof f.lat !== "number" || typeof f.lng !== "number") return "";
    return `<Point><coordinates>${f.lng},${f.lat},0</coordinates></Point>`;
  }
  const raw = f.coords as any;
  if (!raw) return "";
  if (geomType === "line") {
    const coords = (Array.isArray(raw[0]) && Array.isArray(raw[0][0])) ? raw[0] : raw;
    if (!coords || coords.length < 2) return "";
    const cs = coords.map(([lng, lat]: number[]) => `${lng},${lat},0`).join(" ");
    return `<LineString><coordinates>${cs}</coordinates></LineString>`;
  }
  if (geomType === "polygon") {
    const ring = (Array.isArray(raw[0]) && Array.isArray(raw[0][0])) ? raw[0] : raw;
    if (!ring || ring.length < 3) return "";
    const closed = ring[0][0] === ring[ring.length-1][0] && ring[0][1] === ring[ring.length-1][1] ? ring : [...ring, ring[0]];
    const cs = closed.map(([lng, lat]: number[]) => `${lng},${lat},0`).join(" ");
    return `<Polygon><outerBoundaryIs><LinearRing><coordinates>${cs}</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
  }
  return "";
}

/** Convert "#rrggbb" → KML "aabbggrr" (alpha + reversed-RGB). */
function hexToKmlColor(hex: string, alphaPct = 1): string {
  const c = (hex || "#888888").replace("#", "");
  const r = c.slice(0, 2) || "88";
  const g = c.slice(2, 4) || "88";
  const b = c.slice(4, 6) || "88";
  const a = Math.max(0, Math.min(255, Math.round(alphaPct * 255))).toString(16).padStart(2, "0");
  return `${a}${b}${g}${r}`.toLowerCase();
}

export interface KmlStyle {
  /** Hex color "#rrggbb" used for line/poly stroke and as fallback fill. */
  color?: string;
  /** Optional PNG/JPEG/SVG data URL or http(s) URL used as point icon image. */
  iconHref?: string;
  /** Icon scale (1.0 default). */
  iconScale?: number;
  /** Stroke width for lines and polygon outlines. */
  lineWidth?: number;
  /** Fill alpha (0–1) for polygons. Default 0.35. */
  fillAlpha?: number;
}

export function featuresToKML(
  layerName: string,
  features: InternalFeature[],
  geomType: GeomType,
  style?: KmlStyle,
): string {
  const color = style?.color || "#4895ef";
  const lineColor = hexToKmlColor(color, 1);
  const fillColor = hexToKmlColor(color, style?.fillAlpha ?? 0.35);
  const lineWidth = style?.lineWidth ?? 3;
  const iconScale = style?.iconScale ?? 1.1;
  const iconHref = style?.iconHref || "";

  const styleId = "layer_style";
  const styleBlock = `<Style id="${styleId}">
  <IconStyle>
    <color>${lineColor}</color>
    <scale>${iconScale}</scale>
    ${iconHref ? `<Icon><href>${escXml(iconHref)}</href></Icon>` : `<Icon><href>https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon>`}
    <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
  </IconStyle>
  <LabelStyle>
    <color>ffffffff</color>
    <scale>0.9</scale>
  </LabelStyle>
  <LineStyle>
    <color>${lineColor}</color>
    <width>${lineWidth}</width>
  </LineStyle>
  <PolyStyle>
    <color>${fillColor}</color>
    <outline>1</outline>
    <fill>1</fill>
  </PolyStyle>
</Style>`;

  const placemarks = features.map(f => {
    const geom = geometryKML(f, geomType);
    if (!geom) return "";
    const name = escXml(String(f.ten || ""));
    const desc = escXml(String(f.mo_ta || ""));
    return `<Placemark><name>${name}</name>${desc ? `<description>${desc}</description>` : ""}<styleUrl>#${styleId}</styleUrl>${geom}</Placemark>`;
  }).filter(Boolean).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document><name>${escXml(layerName)}</name>
${styleBlock}
${placemarks}
</Document></kml>`;
}

/* ─── Download helper ─── */
export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
