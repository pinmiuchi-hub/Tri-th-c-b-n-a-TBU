import { useEffect, useState } from "react";

export interface LayerSymbologyConfig {
  title: string;
  symbolType: "line" | "polygon" | "ramp" | "point";
  color: string;
  fillColor: string;
  lineWeight: number;
  opacity: number;
  fillOpacity: number;
  dashArray: string;
  classes: Array<{ label: string; color: string }>;
}

interface Props {
  open: boolean;
  layerId: string;
  layerName?: string;
  initialValue: LayerSymbologyConfig;
  onClose: () => void;
  onSave: (layerId: string, value: LayerSymbologyConfig) => void;
}

export default function LayerSymbologyEditorModal({ open, layerId, layerName, initialValue, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<LayerSymbologyConfig>(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
  }, [open, initialValue]);

  if (!open) return null;

  const updateClass = (idx: number, patch: Partial<LayerSymbologyConfig["classes"][number]>) => {
    setDraft(prev => ({
      ...prev,
      classes: prev.classes.map((item, i) => i === idx ? { ...item, ...patch } : item),
    }));
  };

  const addClass = () => {
    setDraft(prev => ({
      ...prev,
      classes: [...prev.classes, { label: `Lớp ${prev.classes.length + 1}`, color: "#4c6ef5" }],
    }));
  };

  const removeClass = (idx: number) => {
    setDraft(prev => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(14, 23, 42, 0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000, padding: 16 }} onClick={onClose}>
      <div style={{ width: "min(640px, 100%)", maxHeight: "88vh", overflowY: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.24)", padding: 20, color: "#0f172a" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Chỉnh sửa ký hiệu & chú giải</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{layerName || (layerId === "ward_boundaries" ? "Ranh giới hành chính xã/phường" : layerId === "population_density" ? "Lớp mật độ dân số" : layerId)}</div>
          </div>
          <button type="button" onClick={onClose} style={{ border: "none", background: "#e2e8f0", borderRadius: 999, width: 36, height: 36, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Tên chú giải</span>
            <input value={draft.title} onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px" }} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Dạng kí hiệu</span>
            <select value={draft.symbolType} onChange={e => setDraft(prev => ({ ...prev, symbolType: e.target.value as LayerSymbologyConfig["symbolType"] }))} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px" }}>
              <option value="line">Đường</option>
              <option value="polygon">Vùng</option>
              <option value="ramp">Bậc màu</option>
              <option value="point">Điểm</option>
            </select>
          </label>

          {(draft.symbolType === "line" || draft.symbolType === "polygon" || draft.symbolType === "point") && (
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Màu đường</span>
                <input type="color" value={draft.color} onChange={e => setDraft(prev => ({ ...prev, color: e.target.value }))} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 4, width: "100%", height: 42 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Màu nền</span>
                <input type="color" value={draft.fillColor} onChange={e => setDraft(prev => ({ ...prev, fillColor: e.target.value }))} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 4, width: "100%", height: 42 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Độ dày</span>
                <input type="number" min={0.5} max={6} step={0.5} value={draft.lineWeight} onChange={e => setDraft(prev => ({ ...prev, lineWeight: Number(e.target.value) || 1 }))} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px" }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Độ trong suốt</span>
                <input type="range" min={0.1} max={1} step={0.05} value={draft.opacity} onChange={e => setDraft(prev => ({ ...prev, opacity: Number(e.target.value) }))} />
              </label>
              <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
                <span style={{ fontWeight: 600 }}>Mẫu nét</span>
                <input value={draft.dashArray} onChange={e => setDraft(prev => ({ ...prev, dashArray: e.target.value }))} placeholder="Ví dụ: 4,4" style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px" }} />
              </label>
            </div>
          )}

          {draft.symbolType === "ramp" && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>Bậc màu chú giải</span>
                <button type="button" onClick={addClass} style={{ border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: 999, padding: "6px 10px", cursor: "pointer" }}>+ Thêm bậc</button>
              </div>
              {draft.classes.map((item, idx) => (
                <div key={`${item.label}-${idx}`} style={{ display: "grid", gap: 8, gridTemplateColumns: "1.4fr 80px auto", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 12, padding: 10 }}>
                  <input value={item.label} onChange={e => updateClass(idx, { label: e.target.value })} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 10px" }} />
                  <input type="color" value={item.color} onChange={e => updateClass(idx, { color: e.target.value })} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 4, width: "100%", height: 38 }} />
                  <button type="button" onClick={() => removeClass(idx)} style={{ border: "none", background: "#fee2e2", color: "#b91c1c", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}>Xóa</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>Hủy</button>
          <button type="button" onClick={() => { onSave(layerId, draft); onClose(); }} style={{ border: "none", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>Áp dụng</button>
        </div>
      </div>
    </div>
  );
}
