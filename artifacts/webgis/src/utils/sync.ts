/**
 * Đồng bộ cloud (Supabase) — dữ liệu CHUNG 1 bộ cho mọi máy.
 *
 * Nguồn chân lý khi mở trang = bản trên Supabase (merge theo timestamp TỪNG KEY:
 * key nào mới hơn thắng; thiếu thì bên có thắng). localStorage vẫn là cache
 * để app chạy được cả khi offline.
 *
 * Không dùng SDK — chỉ fetch PostgREST (2 endpoint: select + upsert), 0 dependency mới.
 * Thiếu env → tắt sync, app chạy local-only (không crash).
 */

import { ALL_KEYS, SYNC_META_KEY, onLocalWrite, readJson, writeLocalSilent } from "./persist";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const syncEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);
const TABLE = "webgis_state";
const ROW_ID = "global";
const PUSH_DEBOUNCE_MS = 1500;
const FETCH_TIMEOUT_MS = 8000;

/* ─── Trạng thái (observable cho UI chip ☁️) ─── */
export type SyncPhase = "idle" | "syncing" | "ok" | "error";
export interface SyncState {
  phase: SyncPhase;
  lastSyncAt: number | null;
  error: string | null;
  /** Remote có key mới hơn local (sau pull mid-session) → UI gợi ý tải lại */
  remoteNewer: boolean;
}

let state: SyncState = { phase: "idle", lastSyncAt: null, error: null, remoteNewer: false };
const subscribers = new Set<() => void>();

const setState = (patch: Partial<SyncState>) => {
  state = { ...state, ...patch };
  subscribers.forEach(fn => fn());
};

export const getSyncState = (): SyncState => state;

export function subscribeSync(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/* ─── Giao tiếp Supabase REST ─── */
const headers = (): Record<string, string> => ({
  apikey: SUPABASE_KEY!,
  Authorization: `Bearer ${SUPABASE_KEY!}`,
  "Content-Type": "application/json",
});

const withTimeout = (ms: number): AbortController => {
  const ctrl = new AbortController();
  window.setTimeout(() => ctrl.abort(), ms);
  return ctrl;
};

/** payload trên cloud: { [key]: { t: epochMs, v: giá trị JSON } } */
type CloudPayload = Record<string, { t: number; v: unknown }>;

async function fetchRemote(): Promise<{ payload: CloudPayload; updatedAt: string } | null> {
  const ctrl = withTimeout(FETCH_TIMEOUT_MS);
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=payload,updated_at`,
    { headers: headers(), signal: ctrl.signal },
  );
  if (!res.ok) throw new Error(`Supabase GET ${res.status}`);
  const rows = (await res.json()) as { payload: CloudPayload | null; updated_at: string }[];
  const row = rows[0];
  if (!row || !row.payload || typeof row.payload !== "object") return null;
  return { payload: row.payload, updatedAt: row.updated_at };
}

async function pushRemote(payload: CloudPayload, keepalive = false): Promise<void> {
  const ctrl = keepalive ? null : withTimeout(FETCH_TIMEOUT_MS);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: "POST",
    headers: { ...headers(), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ id: ROW_ID, payload, updated_at: new Date().toISOString() }),
    signal: ctrl?.signal,
    keepalive,
  });
  if (!res.ok) throw new Error(`Supabase POST ${res.status}`);
}

/* ─── Snapshot local → CloudPayload ─── */
const DATA_KEYS = ALL_KEYS.filter(k => k !== SYNC_META_KEY);

function localSnapshot(): CloudPayload {
  const meta = readJson<Record<string, number>>(SYNC_META_KEY) ?? {};
  const out: CloudPayload = {};
  for (const key of DATA_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw === null) continue;
    try {
      out[key] = { t: meta[key] ?? 0, v: JSON.parse(raw) };
    } catch {
      /* key hỏng — bỏ qua */
    }
  }
  return out;
}

/**
 * Merge: với từng key, bên nào timestamp mới hơn thắng.
 * Trả về payload đã merge + cờ có áp dữ liệu remote về local không.
 */
function merge(
  local: CloudPayload,
  remote: CloudPayload,
): { merged: CloudPayload; appliedRemote: boolean; needPush: boolean } {
  const merged: CloudPayload = { ...remote };
  let appliedRemote = false;
  let needPush = false;
  for (const key of DATA_KEYS) {
    const l = local[key];
    const r = remote[key];
    if (l && (!r || l.t > r.t)) {
      merged[key] = l; // local mới hơn (hoặc remote thiếu) → giữ local, sẽ push
      needPush = true;
    } else if (r && (!l || r.t > l.t)) {
      // remote mới hơn → áp về local
      writeLocalSilent(key, r.v, r.t);
      appliedRemote = true;
    }
  }
  return { merged, appliedRemote, needPush };
}

/* ─── Pull + merge + push (1 vòng) ─── */
let lastRemote: CloudPayload | null = null;
let running: Promise<{ appliedRemote: boolean }> | null = null;

async function syncNow(): Promise<{ appliedRemote: boolean }> {
  if (!syncEnabled) return { appliedRemote: false };
  if (running) return running;
  setState({ phase: "syncing", error: null, remoteNewer: false });
  running = (async () => {
    try {
      const remote = await fetchRemote();
      lastRemote = remote?.payload ?? {};
      const local = localSnapshot();
      const { merged, appliedRemote, needPush } = merge(local, lastRemote);
      if (needPush || Object.keys(lastRemote).length === 0) {
        await pushRemote(merged);
      }
      setState({
        phase: "ok",
        lastSyncAt: Date.now(),
        error: null,
        // Áp dữ liệu remote về local giữa phiên (không phải lúc boot) → gợi ý tải lại
        remoteNewer: appliedRemote && booted,
      });
      return { appliedRemote };
    } catch (e) {
      setState({ phase: "error", error: e instanceof Error ? e.message : String(e) });
      return { appliedRemote: false };
    } finally {
      running = null;
    }
  })();
  return running;
}

/* ─── Push bị trì hoãn (debounce) ─── */
let pushTimer: number | null = null;

export function schedulePush(): void {
  if (!syncEnabled) return;
  if (pushTimer !== null) window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => {
    pushTimer = null;
    void syncNow();
  }, PUSH_DEBOUNCE_MS);
}

/** Flush ngay khi đóng tab — best effort, không chặn đóng trang. */
function flushOnUnload(): void {
  if (!syncEnabled || pushTimer === null) return;
  // Chưa pull được lần nào → không biết bản trên cloud, không được ghi đè (tránh mất dữ liệu máy khác)
  if (lastRemote === null) return;
  window.clearTimeout(pushTimer);
  pushTimer = null;
  const merged = { ...lastRemote, ...localSnapshot() };
  void pushRemote(merged, true).catch(() => {
    /* keepalive best-effort */
  });
}

/* ─── Khuếch đại thay đổi local → push ─── */
let booted = false;

/** Gọi sau khi boot pull xong: bắt đầu lắng nghe thay đổi local. */
export function startWatching(): void {
  if (!syncEnabled || booted) return;
  booted = true;
  onLocalWrite(() => schedulePush());
  window.addEventListener("beforeunload", flushOnUnload);
  window.addEventListener("pagehide", flushOnUnload);
}

/** Pull khi người dùng quay lại tab (máy khác có thể đã sửa). */
export async function pullOnFocus(): Promise<void> {
  const { appliedRemote } = await syncNow();
  if (appliedRemote) setState({ remoteNewer: true });
}

export function dismissRemoteNewer(): void {
  setState({ remoteNewer: false });
}

export function retrySync(): void {
  void syncNow();
}

/**
 * Di trú dữ liệu phiên cũ (trước khi có đồng bộ): key đã có trong localStorage
 * nhưng chưa có timestamp → gán timestamp = now để dữ liệu trên MÁY NÀY không bị
 * bản trên cloud ghi đè vô cớ ở lần đồng bộ đầu tiên.
 */
function stampLegacyLocal(): void {
  try {
    const meta = readJson<Record<string, number>>(SYNC_META_KEY) ?? {};
    const now = Date.now();
    let changed = false;
    for (const key of DATA_KEYS) {
      if (meta[key] !== undefined) continue;
      if (window.localStorage.getItem(key) === null) continue;
      meta[key] = now;
      changed = true;
    }
    if (changed) window.localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    /* bỏ qua — không chặn đồng bộ */
  }
}

/** Boot: pull → merge → (nếu cần) push. Gọi TRƯỚC khi render app. */
export async function bootSync(): Promise<void> {
  if (!syncEnabled) return;
  stampLegacyLocal();
  await syncNow();
  startWatching();
  // Vòng cuối: bắt thay đổi phát sinh TrONG LÚC chờ boot (trình duyệt cho
  // người dùng thao tác sớm ở nhánh "quá 6s" → listener chưa kịp đăng ký)
  void syncNow();
}
