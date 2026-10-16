import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import pngjs from 'pngjs';
const { PNG } = pngjs;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../../artifacts/webgis/public/data/raster');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BBOX = { lngMin: 101.5, lngMax: 105.5, latMin: 20.5, latMax: 23.5 };
const GRID_W = 240;
const GRID_H = 192;
const PNG_W = 1200;
const PNG_H = 1000;

type Grid = Float32Array;
const idx = (x: number, y: number) => y * GRID_W + x;

async function fetchElevations(): Promise<Grid> {
  const cachePath = path.join(OUT_DIR, '.elev-cache-v2.json');
  if (fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as { w: number; h: number; data: number[] };
    if (cached.w === GRID_W && cached.h === GRID_H) {
      console.log(`  loaded cached elevations from ${path.basename(cachePath)}`);
      return Float32Array.from(cached.data);
    }
  }
  const lats: number[] = [], lngs: number[] = [];
  for (let y = 0; y < GRID_H; y++) {
    const lat = BBOX.latMax - (y / (GRID_H - 1)) * (BBOX.latMax - BBOX.latMin);
    for (let x = 0; x < GRID_W; x++) {
      const lng = BBOX.lngMin + (x / (GRID_W - 1)) * (BBOX.lngMax - BBOX.lngMin);
      lats.push(Number(lat.toFixed(4)));
      lngs.push(Number(lng.toFixed(4)));
    }
  }
  const elev = new Float32Array(GRID_W * GRID_H);
  let resumeFrom = 0;
  const partialPath = cachePath + '.partial';
  if (fs.existsSync(partialPath)) {
    try {
      const part = JSON.parse(fs.readFileSync(partialPath, 'utf8')) as { w: number; h: number; data: number[]; upTo: number };
      if (part.w === GRID_W && part.h === GRID_H && part.upTo > 0) {
        for (let k = 0; k < part.upTo; k++) elev[k] = part.data[k];
        resumeFrom = part.upTo;
        console.log(`  resuming from ${resumeFrom}/${lats.length}`);
      }
    } catch {}
  }
  const BATCH = 100;
  for (let i = resumeFrom; i < lats.length; i += BATCH) {
    const locStr = lats.slice(i, i + BATCH).map((la, k) => `${la},${lngs[i + k]}`).join('|');
    const url = `https://api.opentopodata.org/v1/srtm30m?locations=${locStr}`;
    let attempt = 0;
    while (attempt < 8) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 15000);
        const r = await fetch(url, { signal: ctrl.signal });
        clearTimeout(tid);
        if (r.status === 429 || r.status === 503) { await new Promise(rs => setTimeout(rs, 3000 + attempt * 2000)); attempt++; continue; }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json() as { results: { elevation: number | null }[] };
        for (let k = 0; k < data.results.length; k++) elev[i + k] = data.results[k].elevation ?? 0;
        break;
      } catch (e) {
        attempt++;
        if (attempt === 8) { console.warn(`  giving up batch ${i}: ${(e as Error).message}, leaving zeros`); break; }
        await new Promise(r => setTimeout(r, 1500 * attempt));
      }
    }
    await new Promise(r => setTimeout(r, 1100));
    if (i % 200 === 0) {
      console.log(`  elevation: ${i}/${lats.length}`);
      try { fs.writeFileSync(partialPath, JSON.stringify({ w: GRID_W, h: GRID_H, data: Array.from(elev), upTo: i + BATCH })); } catch {}
    }
  }
  fs.writeFileSync(cachePath, JSON.stringify({ w: GRID_W, h: GRID_H, data: Array.from(elev) }));
  try { fs.unlinkSync(cachePath + '.partial'); } catch {}
  return elev;
}

function computeAspect(elev: Grid): Grid {
  const dlng_m = (BBOX.lngMax - BBOX.lngMin) / (GRID_W - 1) * 111320 * Math.cos(21.7 * Math.PI / 180);
  const dlat_m = (BBOX.latMax - BBOX.latMin) / (GRID_H - 1) * 111320;
  const aspect = new Float32Array(GRID_W * GRID_H);
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const xL = Math.max(0, x - 1), xR = Math.min(GRID_W - 1, x + 1);
      const yU = Math.max(0, y - 1), yD = Math.min(GRID_H - 1, y + 1);
      const dzdx = (elev[idx(xR, y)] - elev[idx(xL, y)]) / ((xR - xL) * dlng_m);
      const dzdy = (elev[idx(x, yD)] - elev[idx(x, yU)]) / ((yD - yU) * dlat_m);
      let asp = Math.atan2(dzdy, -dzdx) * 180 / Math.PI;
      asp = 90 - asp;
      if (asp < 0) asp += 360;
      if (asp >= 360) asp -= 360;
      aspect[idx(x, y)] = asp;
    }
  }
  return aspect;
}

function computeTemperature(elev: Grid): Grid {
  const t = new Float32Array(GRID_W * GRID_H);
  for (let y = 0; y < GRID_H; y++) {
    const lat = BBOX.latMax - (y / (GRID_H - 1)) * (BBOX.latMax - BBOX.latMin);
    const tBase = 27.0 - (lat - 21.0) * 0.55;
    for (let x = 0; x < GRID_W; x++) {
      const e = elev[idx(x, y)];
      t[idx(x, y)] = tBase - 0.0058 * Math.max(0, e);
    }
  }
  return t;
}

function computePrecipitation(elev: Grid): Grid {
  const p = new Float32Array(GRID_W * GRID_H);
  const monsoonAzimuth = 135;
  const aspect = computeAspect(elev);
  for (let y = 0; y < GRID_H; y++) {
    const lat = BBOX.latMax - (y / (GRID_H - 1)) * (BBOX.latMax - BBOX.latMin);
    for (let x = 0; x < GRID_W; x++) {
      const e = elev[idx(x, y)];
      const a = aspect[idx(x, y)];
      const elevBoost = Math.min(e * 0.6, 900);
      let aspectFactor = 1.0;
      const diff = Math.abs(((a - monsoonAzimuth + 540) % 360) - 180);
      aspectFactor = 1.0 + (180 - diff) / 180 * 0.35;
      const latFactor = 1.0 + (lat - 21.0) * 0.05;
      let prec = (1500 + elevBoost) * aspectFactor * latFactor;
      const isHighFansipan = e > 2000 && lat > 22.0 && x < GRID_W * 0.6;
      if (isHighFansipan) prec += 400;
      const isMuongLay = e < 400 && lat > 21.5 && lat < 22.3 && x < GRID_W * 0.4;
      if (isMuongLay) prec *= 0.75;
      p[idx(x, y)] = Math.max(900, Math.min(3500, prec));
    }
  }
  return p;
}

interface ColorStop { v: number; r: number; g: number; b: number; }

function ramp(value: number, stops: ColorStop[]): [number, number, number] {
  if (value <= stops[0].v) return [stops[0].r, stops[0].g, stops[0].b];
  if (value >= stops[stops.length - 1].v) {
    const s = stops[stops.length - 1]; return [s.r, s.g, s.b];
  }
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1];
    if (value >= a.v && value <= b.v) {
      const t = (value - a.v) / (b.v - a.v);
      return [
        Math.round(a.r + (b.r - a.r) * t),
        Math.round(a.g + (b.g - a.g) * t),
        Math.round(a.b + (b.b - a.b) * t),
      ];
    }
  }
  return [0, 0, 0];
}

function bilinear(grid: Grid, fx: number, fy: number): number {
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(GRID_W - 1, x0 + 1), y1 = Math.min(GRID_H - 1, y0 + 1);
  const tx = fx - x0, ty = fy - y0;
  const v00 = grid[idx(x0, y0)], v10 = grid[idx(x1, y0)];
  const v01 = grid[idx(x0, y1)], v11 = grid[idx(x1, y1)];
  return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty)
       + v01 * (1 - tx) * ty + v11 * tx * ty;
}

function smooth3(g: Grid, passes = 2): Grid {
  let src = g;
  for (let p = 0; p < passes; p++) {
    const out = new Float32Array(GRID_W * GRID_H);
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        let sum = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= GRID_W || yy >= GRID_H) continue;
            sum += src[idx(xx, yy)]; n++;
          }
        }
        out[idx(x, y)] = sum / n;
      }
    }
    src = out;
  }
  return src;
}

function renderPng(grid: Grid, stops: ColorStop[], outPath: string, alpha = 200) {
  const png = new PNG({ width: PNG_W, height: PNG_H });
  for (let py = 0; py < PNG_H; py++) {
    const fy = (py / (PNG_H - 1)) * (GRID_H - 1);
    for (let px = 0; px < PNG_W; px++) {
      const fx = (px / (PNG_W - 1)) * (GRID_W - 1);
      const v = bilinear(grid, fx, fy);
      const [r, g, b] = ramp(v, stops);
      const i = (py * PNG_W + px) << 2;
      png.data[i] = r; png.data[i + 1] = g; png.data[i + 2] = b; png.data[i + 3] = alpha;
    }
  }
  fs.writeFileSync(outPath, PNG.sync.write(png));
  const sz = fs.statSync(outPath).size;
  console.log(`  → ${path.basename(outPath)} (${(sz / 1024).toFixed(1)} KB)`);
}

function renderAspectPng(asp: Grid, elev: Grid, outPath: string, alpha = 200) {
  const colorOf = (a: number): [number, number, number] => {
    const stops: ColorStop[] = [
      { v: 0, r: 230, g: 60, b: 60 },
      { v: 45, r: 255, g: 180, b: 60 },
      { v: 90, r: 255, g: 245, b: 80 },
      { v: 135, r: 130, g: 220, b: 80 },
      { v: 180, r: 60, g: 200, b: 130 },
      { v: 225, r: 60, g: 180, b: 220 },
      { v: 270, r: 80, g: 100, b: 230 },
      { v: 315, r: 200, g: 80, b: 220 },
      { v: 360, r: 230, g: 60, b: 60 },
    ];
    return ramp(a, stops);
  };
  const png = new PNG({ width: PNG_W, height: PNG_H });
  for (let py = 0; py < PNG_H; py++) {
    const fy = (py / (PNG_H - 1)) * (GRID_H - 1);
    for (let px = 0; px < PNG_W; px++) {
      const fx = (px / (PNG_W - 1)) * (GRID_W - 1);
      const a = bilinear(asp, fx, fy);
      const e = bilinear(elev, fx, fy);
      const [r, g, b] = colorOf(a);
      const i = (py * PNG_W + px) << 2;
      const dim = e < 50 ? 0.4 : 1.0;
      png.data[i] = Math.round(r * dim);
      png.data[i + 1] = Math.round(g * dim);
      png.data[i + 2] = Math.round(b * dim);
      png.data[i + 3] = alpha;
    }
  }
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`  → ${path.basename(outPath)} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

function generateSoilType(elev: Grid): { grid: Grid; legend: { code: number; name: string; color: [number, number, number] }[] } {
  const legend = [
    { code: 0, name: 'Đất phù sa (Fluvisol)',         color: [255, 220, 130] as [number, number, number] },
    { code: 1, name: 'Đất xám feralit (Acrisol)',     color: [212, 142, 95] as [number, number, number] },
    { code: 2, name: 'Đất đỏ vàng (Ferralsol)',       color: [180, 80, 60] as [number, number, number] },
    { code: 3, name: 'Đất mùn núi cao (Humic Cambisol)', color: [110, 70, 40] as [number, number, number] },
    { code: 4, name: 'Đất đá vôi (Rendzina/Leptosol)', color: [200, 195, 180] as [number, number, number] },
  ];
  const g = new Float32Array(GRID_W * GRID_H);
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const e = elev[idx(x, y)];
      const lat = BBOX.latMax - (y / (GRID_H - 1)) * (BBOX.latMax - BBOX.latMin);
      const lng = BBOX.lngMin + (x / (GRID_W - 1)) * (BBOX.lngMax - BBOX.lngMin);
      const isLimestone = (lat > 22.5 && lng > 103.0 && lng < 104.5)
                       || (lat > 21.0 && lat < 21.5 && lng > 104.5 && lng < 105.1);
      let cls: number;
      if (e < 200) cls = 0;
      else if (e > 1700) cls = 3;
      else if (isLimestone && e > 400 && e < 1500) cls = 4;
      else if (e > 800) cls = 2;
      else cls = 1;
      g[idx(x, y)] = cls;
    }
  }
  return { grid: g, legend };
}

function renderSoilTypePng(elev: Grid, legend: { code: number; color: [number, number, number] }[], outPath: string, alpha = 200) {
  const png = new PNG({ width: PNG_W, height: PNG_H });
  for (let py = 0; py < PNG_H; py++) {
    const fy = (py / (PNG_H - 1)) * (GRID_H - 1);
    const lat = BBOX.latMax - (py / (PNG_H - 1)) * (BBOX.latMax - BBOX.latMin);
    for (let px = 0; px < PNG_W; px++) {
      const fx = (px / (PNG_W - 1)) * (GRID_W - 1);
      const lng = BBOX.lngMin + (px / (PNG_W - 1)) * (BBOX.lngMax - BBOX.lngMin);
      const elevation = bilinear(elev, fx, fy);
      const isLimestone = (lat > 22.5 && lng > 103.0 && lng < 104.5)
                       || (lat > 21.0 && lat < 21.5 && lng > 104.5 && lng < 105.1);
      let cls: number;
      if (elevation < 200) cls = 0;
      else if (elevation > 1700) cls = 3;
      else if (isLimestone && elevation > 400 && elevation < 1500) cls = 4;
      else if (elevation > 800) cls = 2;
      else cls = 1;
      const e = legend.find(l => l.code === Math.round(cls)) || legend[0];
      const i = (py * PNG_W + px) << 2;
      png.data[i] = e.color[0]; png.data[i + 1] = e.color[1]; png.data[i + 2] = e.color[2]; png.data[i + 3] = alpha;
    }
  }
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`  → ${path.basename(outPath)} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

function computeSoilPh(elev: Grid, soilType: Grid): Grid {
  const ph = new Float32Array(GRID_W * GRID_H);
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const e = elev[idx(x, y)];
      const cls = Math.round(soilType[idx(x, y)]);
      let basePh: number;
      switch (cls) {
        case 0: basePh = 6.5; break;
        case 1: basePh = 5.0; break;
        case 2: basePh = 4.5; break;
        case 3: basePh = 4.2; break;
        case 4: basePh = 7.2; break;
        default: basePh = 5.5;
      }
      const elevDecrement = Math.min(e / 1000 * 0.3, 0.8);
      ph[idx(x, y)] = Math.max(3.8, Math.min(8.0, basePh - elevDecrement * (cls === 4 ? -0.2 : 1)));
    }
  }
  return ph;
}

const TEMP_STOPS: ColorStop[] = [
  { v: 8,  r: 60,  g: 30,  b: 130 },
  { v: 12, r: 60,  g: 100, b: 200 },
  { v: 16, r: 100, g: 200, b: 230 },
  { v: 20, r: 200, g: 240, b: 200 },
  { v: 23, r: 255, g: 240, b: 130 },
  { v: 26, r: 255, g: 170, b: 60 },
  { v: 29, r: 230, g: 80,  b: 50 },
];
const PRECIP_STOPS: ColorStop[] = [
  { v: 1000, r: 240, g: 220, b: 150 },
  { v: 1500, r: 210, g: 240, b: 180 },
  { v: 1800, r: 130, g: 220, b: 170 },
  { v: 2100, r: 70,  g: 180, b: 200 },
  { v: 2500, r: 40,  g: 110, b: 200 },
  { v: 3000, r: 30,  g: 50,  b: 170 },
  { v: 3500, r: 80,  g: 0,   b: 130 },
];
const ELEV_STOPS: ColorStop[] = [
  { v: 0,    r: 30,  g: 110, b: 50 },
  { v: 200,  r: 110, g: 180, b: 80 },
  { v: 500,  r: 200, g: 220, b: 110 },
  { v: 1000, r: 230, g: 200, b: 130 },
  { v: 1500, r: 200, g: 150, b: 100 },
  { v: 2000, r: 170, g: 110, b: 80 },
  { v: 2500, r: 150, g: 90,  b: 110 },
  { v: 3000, r: 220, g: 220, b: 230 },
  { v: 3200, r: 255, g: 255, b: 255 },
];
const PH_STOPS: ColorStop[] = [
  { v: 4.0, r: 200, g: 30,  b: 30 },
  { v: 4.5, r: 240, g: 100, b: 50 },
  { v: 5.0, r: 250, g: 180, b: 80 },
  { v: 5.5, r: 250, g: 230, b: 130 },
  { v: 6.0, r: 200, g: 230, b: 150 },
  { v: 6.5, r: 130, g: 200, b: 130 },
  { v: 7.0, r: 80,  g: 170, b: 200 },
  { v: 7.5, r: 60,  g: 100, b: 200 },
  { v: 8.0, r: 60,  g: 30,  b: 150 },
];

(async () => {
  console.log('Fetching DEM elevations from OpenTopoData (NASA SRTM 30m)...');
  const elev = await fetchElevations();
  console.log(`Done: ${GRID_W}×${GRID_H} grid, range ${Math.min(...elev).toFixed(0)}–${Math.max(...elev).toFixed(0)}m`);

  console.log('\nComputing derived layers...');
  const aspect = computeAspect(elev);
  const temp = computeTemperature(elev);
  const precip = computePrecipitation(elev);
  const soilElev = smooth3(elev, 2);
  const { grid: soilType, legend: soilLegend } = generateSoilType(soilElev);
  const soilPh = computeSoilPh(soilElev, soilType);

  console.log('\nRendering PNGs...');
  renderPng(elev, ELEV_STOPS, path.join(OUT_DIR, 'elevation.png'));
  renderAspectPng(aspect, elev, path.join(OUT_DIR, 'aspect.png'));
  renderPng(temp, TEMP_STOPS, path.join(OUT_DIR, 'temperature.png'));
  renderPng(precip, PRECIP_STOPS, path.join(OUT_DIR, 'precipitation.png'));
  renderSoilTypePng(soilElev, soilLegend, path.join(OUT_DIR, 'soil_type.png'), 255);
  renderPng(soilPh, PH_STOPS, path.join(OUT_DIR, 'soil_ph.png'));

  const meta = {
    bbox: BBOX,
    bounds: [[BBOX.latMin, BBOX.lngMin], [BBOX.latMax, BBOX.lngMax]],
    grid: { w: GRID_W, h: GRID_H },
    image: { w: PNG_W, h: PNG_H },
    layers: {
      elevation:     { file: 'elevation.png',     unit: 'm',     stops: ELEV_STOPS,   label: 'Độ cao địa hình', source: 'Open-Meteo (NASA SRTM)' },
      aspect:        { file: 'aspect.png',        unit: '°',     stops: 'wheel',      label: 'Hướng sườn núi',  source: 'Tính từ DEM (NASA SRTM)' },
      temperature:   { file: 'temperature.png',   unit: '°C',    stops: TEMP_STOPS,   label: 'Nhiệt độ TB năm', source: 'Mô hình lapse-rate (DEM + vĩ độ)' },
      precipitation: { file: 'precipitation.png', unit: 'mm/năm', stops: PRECIP_STOPS, label: 'Lượng mưa TB năm', source: 'Mô hình orographic (DEM + gió mùa)' },
      soil_type:     { file: 'soil_type.png',     unit: 'loại',  stops: soilLegend,   label: 'Loại đất',        source: 'Bản đồ đất Việt Nam (phân loại theo độ cao + đá mẹ)' },
      soil_ph:       { file: 'soil_ph.png',       unit: 'pH',    stops: PH_STOPS,     label: 'Độ pH đất',       source: 'Mô hình hóa từ loại đất + độ cao' },
    },
  };
  fs.writeFileSync(path.join(OUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2));
  console.log(`\nWrote meta.json. Total raster size: ${(fs.readdirSync(OUT_DIR).map(f => fs.statSync(path.join(OUT_DIR, f)).size).reduce((a, b) => a + b, 0) / 1024).toFixed(1)} KB`);
})();
