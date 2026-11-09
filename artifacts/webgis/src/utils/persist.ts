/**
 * Tầng lưu trữ local (localStorage) — ĐIỂM DUY NHẤT mọi thay đổi của người dùng
 * phải đi qua. Sau khi ghi local, module phát sự kiện để sync.ts đẩy lên Supabase.
 *
 * Quy ước:
 * - `readJson` không bao giờ ném lỗi (parse hỏng → null).
 * - `writeJson` trả về false khi vượt quota / trình duyệt chặn storage →
 *   caller hiện toast thay vì nuốt im lặng.
 * - Mỗi key có timestamp riêng trong SYNC_META_KEY → merge theo key từng cái
 *   (mới hơn thắng) khi đồng bộ cloud.
 */

export const STORAGE = {
  layerConfig: "webgis-layer-config",
  layersData: "webgis-layers-data",
  annotations: "webgis-annotations-v1",
  overrides: "webgis-overrides-v1",
  knowledge: "webgis-knowledge-v1",
  wardLabels: "webgis-ward-labels",
  ethnicData: "webgis-ethnic-data-v1",
  composer: "webgis-composer-draft",
} as const;

/** Meta timestamp cho từng key (đồng bộ cloud theo key). */
export const SYNC_META_KEY = "webgis-sync-meta";

/** Mọi key WebGIS (local + meta) — dùng cho backup/restore. */
export const ALL_KEYS: string[] = [...Object.values(STORAGE), SYNC_META_KEY];

export function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

type Listener = (key: string) => void;
const listeners = new Set<Listener>();

/** sync.ts đăng ký tại đây để nhận thông báo mỗi khi có thay đổi local. */
export function onLocalWrite(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** UI đăng ký để hiện cảnh báo khi vượt quota bộ nhớ trình duyệt. */
let quotaHandler: ((key: string) => void) | null = null;
export function registerQuotaHandler(fn: (key: string) => void): () => void {
  quotaHandler = fn;
  return () => {
    if (quotaHandler === fn) quotaHandler = null;
  };
}

function stampMeta(key: string): void {
  try {
    const meta = readJson<Record<string, number>>(SYNC_META_KEY) ?? {};
    meta[key] = Date.now();
    window.localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    /* meta hỏng không được chặn ghi data */
  }
}

function notify(key: string): void {
  listeners.forEach(fn => {
    try {
      fn(key);
    } catch {
      /* listener lỗi không được phá luồng ghi */
    }
  });
}

/** Ghi một key local. Trả false nếu quota / storage bị chặn. */
export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    quotaHandler?.(key);
    return false;
  }
  stampMeta(key);
  notify(key);
  return true;
}

/**
 * Chỉ ghi khi nội dung THỰC SỰ đổi so với bản đang lưu.
 * Quan trọng: mỗi lần mount, các useEffect tự lưu lại → nếu cứ ghi mù quáng
 * thì timestamp bị đẩy lên "now" → ghi đè dữ liệu mới hơn trên máy khác.
 */
export function writeJsonIfChanged(key: string, value: unknown): boolean {
  let next: string;
  try {
    next = JSON.stringify(value);
  } catch {
    return false;
  }
  let prev: string | null = null;
  try {
    prev = window.localStorage.getItem(key);
  } catch {
    quotaHandler?.(key);
    return false;
  }
  if (prev === next) return true;
  try {
    window.localStorage.setItem(key, next);
  } catch {
    quotaHandler?.(key);
    return false;
  }
  stampMeta(key);
  notify(key);
  return true;
}

/** Ghi local MÀ KHÔNG phát sự kiện push (dùng khi áp dữ liệu cloud về). */
export function writeLocalSilent(key: string, value: unknown, timestamp?: number): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    const meta = readJson<Record<string, number>>(SYNC_META_KEY) ?? {};
    meta[key] = timestamp ?? Date.now();
    window.localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
    return true;
  } catch {
    return false;
  }
}

export const mapToRec = <T,>(m: Map<string, T>): Record<string, T> => Object.fromEntries(m);

export const recToMap = <T,>(r: Record<string, T> | null | undefined): Map<string, T> =>
  new Map(Object.entries(r ?? {}));

/** Toàn bộ key WebGIS hiện có trong localStorage (dạng chuỗi JSON thô). */
export function collectRaw(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("webgis-")) {
        const v = window.localStorage.getItem(k);
        if (v !== null) out[k] = v;
      }
    }
  } catch {
    /* bỏ qua */
  }
  return out;
}

export interface WebgisBackup {
  app: "webgis";
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

export function collectBackup(): WebgisBackup {
  return {
    app: "webgis",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: collectRaw(),
  };
}

export function applyBackup(backup: unknown): { ok: boolean; count: number; error?: string } {
  if (!backup || typeof backup !== "object") return { ok: false, count: 0, error: "File không hợp lệ." };
  const b = backup as Partial<WebgisBackup>;
  if (b.app !== "webgis" || !b.data || typeof b.data !== "object") {
    return { ok: false, count: 0, error: "Không phải file Sao lưu của WebGIS." };
  }
  const written: string[] = [];
  for (const [k, v] of Object.entries(b.data)) {
    if (!k.startsWith("webgis-") || k === SYNC_META_KEY || typeof v !== "string") continue;
    try {
      JSON.parse(v); // chỉ nhận chuỗi JSON hợp lệ
    } catch {
      continue;
    }
    try {
      window.localStorage.setItem(k, v);
      written.push(k);
    } catch {
      return { ok: false, count: written.length, error: "Vượt quota bộ nhớ trình duyệt — một phần chưa được khôi phục." };
    }
  }
  if (written.length === 0) return { ok: false, count: 0, error: "Không có dữ liệu hợp lệ trong file." };
  // Đặt lại timestamp = now cho các key vừa khôi phục: dữ liệu khôi phục phải thắng
  // bản trên cloud khi mở lại trang (đúng ý "khôi phục = ghi đè"), rồi đẩy lên ngay.
  try {
    const meta = readJson<Record<string, number>>(SYNC_META_KEY) ?? {};
    const now = Date.now();
    written.forEach(k => { meta[k] = now; });
    window.localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    /* meta không chặn được việc khôi phục */
  }
  written.forEach(k => notify(k));
  return { ok: true, count: written.length };
}

/** Dung lượng các key WebGIS đã chiếm (bytes, ước tính theo UTF-16). */
export function backupUsageBytes(): number {
  const raw = collectRaw();
  return Object.entries(raw).reduce((sum, [k, v]) => sum + k.length * 2 + v.length * 2, 0);
}

export const formatBytes = (n: number): string =>
  n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;
