import { useEffect, useState } from "react";

export interface WardStyleValue {
  mau_vung?: string;
  do_dam_vung?: number;
  mau_vien?: string;
  do_day_vien?: number;
  do_dam_vien?: number;
}

interface Props {
  ward: { ma_xa: string; ten_xa: string } | null;
  initialValue: WardStyleValue;
  defaultStyle: { fillColor: string; fillOpacity: number; color: string; lineWeight: number; opacity: number };
  onClose: () => void;
  onSave: (ma_xa: string, value: WardStyleValue) => void;
  onReset: (ma_xa: string) => void;
}

export default function WardStyleEditorModal({ ward, initialValue, defaultStyle, onClose, onSave, onReset }: Props) {
  const [draft, setDraft] = useState<WardStyleValue>(initialValue);

  useEffect(() => { if (ward) setDraft(initialValue); }, [ward, initialValue]);
  if (!ward) return null;

  const fillColor = draft.mau_vung ?? defaultStyle.fillColor;
  const fillOpacity = draft.do_dam_vung ?? defaultStyle.fillOpacity;
  const lineColor = draft.mau_vien ?? defaultStyle.color;
  const lineWeight = draft.do_day_vien ?? defaultStyle.lineWeight;
  const lineOpacity = draft.do_dam_vien ?? defaultStyle.opacity;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(14,23,42,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4100, padding: 16 }} onClick={onClose}>
      <div style={{ width: "min(480px,100%)", background: "#fff", borderRadius: 16, padding: 20, color: "#0f172a" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Tùy chỉnh giao diện xã</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{ward.ten_xa}</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#e2e8f0", borderRadius: 999, width: 36, height: 36, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Màu nền (vùng xã)</span>
            <input type="color" value={fillColor} onChange={e => setDraft(d => ({ ...d, mau_vung: e.target.value }))} style={{ height: 42 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Độ đậm nền: {(fillOpacity * 100).toFixed(0)}%</span>
            <input type="range" min={0} max={1} step={0.05} value={fillOpacity} onChange={e => setDraft(d => ({ ...d, do_dam_vung: Number(e.target.value) }))} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Màu đường ranh giới</span>
            <input type="color" value={lineColor} onChange={e => setDraft(d => ({ ...d, mau_vien: e.target.value }))} style={{ height: 42 }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Độ đậm đường viền: {(lineOpacity * 100).toFixed(0)}%</span>
            <input type="range" min={0.1} max={1} step={0.05} value={lineOpacity} onChange={e => setDraft(d => ({ ...d, do_dam_vien: Number(e.target.value) }))} />
          </label>
          <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
            <span style={{ fontWeight: 600 }}>Độ dày đường viền: {lineWeight}px</span>
            <input type="range" min={0.5} max={6} step={0.5} value={lineWeight} onChange={e => setDraft(d => ({ ...d, do_day_vien: Number(e.target.value) }))} />
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <button onClick={() => { onReset(ward.ma_xa); onClose(); }} style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>↺ Về mặc định</button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>Hủy</button>
            <button onClick={() => { onSave(ward.ma_xa, draft); onClose(); }} style={{ border: "none", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>Áp dụng</button>
          </div>
        </div>
      </div>
    </div>
  );
}