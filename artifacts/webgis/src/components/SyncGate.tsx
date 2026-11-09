import { useEffect, useRef, useState } from "react";
import { bootSync, getSyncState, pullOnFocus, subscribeSync, syncEnabled, dismissRemoteNewer, retrySync } from "@/utils/sync";

const BOOT_TIMEOUT_MS = 6000;

/**
 * Cổng đồng bộ: KHÔNG render app cho tới khi đã kéo dữ liệu cloud về
 * (hoặc quá 6s → coi như offline, dùng cache local, app vẫn chạy).
 * Sau boot: kéo lại khi người dùng quay lại tab; nếu remote có bản mới
 * hơn → hiện banner "Tải lại".
 */
function SyncGate({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(!syncEnabled);
  const [sync, setSync] = useState(getSyncState());
  const seenRef = useRef(false);

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || seenRef.current) return;
      // Quá 6s → không chặn người dùng nữa, chạy tiếp với local cache
      setBooted(true);
    }, BOOT_TIMEOUT_MS);

    bootSync()
      .catch(() => undefined)
      .finally(() => {
        if (cancelled || seenRef.current) return;
        seenRef.current = true;
        window.clearTimeout(timer);
        setBooted(true);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  // Đăng ký listener trạng thái + pull khi quay lại tab
  useEffect(() => {
    if (!syncEnabled) return;
    const unsub = subscribeSync(() => setSync(getSyncState()));
    const onFocus = () => {
      void pullOnFocus();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void pullOnFocus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      unsub();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!booted) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          background: "#0f172a",
          color: "#e2e8f0",
          zIndex: 9999,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #334155",
            borderTopColor: "#38bdf8",
            borderRadius: "50%",
            animation: "webgis-spin 0.9s linear infinite",
          }}
        />
        <div style={{ fontSize: 14 }}>Đang đồng bộ dữ liệu…</div>
        <style>{`@keyframes webgis-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const showRemoteBanner = sync.remoteNewer;
  const showOffline = sync.phase === "error";

  return (
    <>
      {showRemoteBanner && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10000,
            background: "#1d4ed8",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 4px 14px rgba(0,0,0,.3)",
          }}
        >
          Có dữ liệu mới từ máy khác.
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#fff",
              color: "#1d4ed8",
              border: "none",
              borderRadius: 6,
              padding: "4px 10px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Tải lại
          </button>
          <button
            onClick={() => dismissRemoteNewer()}
            style={{ background: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 14 }}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
      )}
      {showOffline && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10000,
            background: "#7f1d1d",
            color: "#fecaca",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Không kết nối được máy chủ{sync.error ? ` (${sync.error})` : ""} — đang dùng dữ liệu trên máy.
          <button
            onClick={() => retrySync()}
            style={{ background: "transparent", border: "none", color: "#fff", textDecoration: "underline", cursor: "pointer", fontSize: 12 }}
          >
            Thử lại
          </button>
        </div>
      )}
      {children}
    </>
  );
}

export default SyncGate;
