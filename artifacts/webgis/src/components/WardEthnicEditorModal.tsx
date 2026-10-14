import { useEffect, useMemo, useState } from "react";
import type { DanTocTyLe } from "./ImportModal";
import "./WardEthnicEditorModal.css";

interface WardLike { ma_xa: string; ten_xa: string; dan_toc?: DanTocTyLe[]; }
interface EthnicOption { id: string; ten: string; mau: string; }

interface Props {
  ward: WardLike | null;
  ethnicGroups: EthnicOption[];
  initialColors: Record<string, string>;
  onSave: (nextComposition: DanTocTyLe[], nextColors: Record<string, string>) => void;
  onClose: () => void;
}

interface EditorItem extends DanTocTyLe {}

export default function WardEthnicEditorModal({ ward, ethnicGroups, initialColors, onSave, onClose }: Props) {
  const [items, setItems] = useState<EditorItem[]>([]);
  const [colors, setColors] = useState<Record<string, string>>({});
  const [selectedGroup, setSelectedGroup] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ward) return;
    const nextItems = (ward.dan_toc || []).map(item => ({ ...item }));
    setItems(nextItems);
    setColors(initialColors);
    setSelectedGroup(ethnicGroups[0]?.id || "");
  }, [ward, ethnicGroups, initialColors]);

  const availableGroups = useMemo(() => ethnicGroups.filter(group => !items.some(item => item.dan_toc === group.id)), [ethnicGroups, items]);
  const totalPct = items.reduce((sum, item) => sum + item.ty_le, 0);

  const updatePercent = (id: string, value: string) => {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    setItems(prev => prev.map(item => item.dan_toc === id ? { ...item, ty_le: pct } : item));
  };

  const addGroup = () => {
    if (!selectedGroup) return;
    setItems(prev => prev.some(item => item.dan_toc === selectedGroup) ? prev : [...prev, { dan_toc: selectedGroup, ty_le: 0 }]);
    setSelectedGroup("");
  };

  const removeGroup = (id: string) => {
    setItems(prev => prev.filter(item => item.dan_toc !== id));
  };

  const normalize = () => {
    if (items.length === 0) return;
    const total = items.reduce((sum, item) => sum + item.ty_le, 0);
    if (total <= 0) {
      setMessage("Không thể chuẩn hóa vì tổng tỷ lệ bằng 0.");
      return;
    }
    const scaledValues = items.map(item => Math.round(item.ty_le * 10000 / total) / 100);
    const scaledTotal = scaledValues.reduce((sum, value) => sum + value, 0);
    const scaled = items.map((item, index) => ({ ...item, ty_le: index === items.length - 1 ? Math.max(0, Math.round((scaledValues[index] + 100 - scaledTotal) * 100) / 100) : scaledValues[index] }));
    setItems(scaled);
    setMessage("Đã chuẩn hóa về tổng 100%.");
  };

  const save = () => {
    const normalized = items.filter(item => item.ty_le > 0).sort((a, b) => b.ty_le - a.ty_le);
    onSave(normalized, colors);
    onClose();
  };

  if (!ward) return null;

  return (
    <div className="wen-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="wen-modal">
        <div className="wen-header">
          <div>
            <div className="wen-title">🧭 Chỉnh sửa thành phần dân tộc</div>
            <div className="wen-subtitle">{ward.ten_xa}</div>
          </div>
          <button className="wen-close" onClick={onClose}>✕</button>
        </div>

        <div className="wen-body">
          {message && <div className="wen-message">{message}</div>}
          <div className="wen-actions">
            <select className="wen-select" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
              <option value="">Chọn dân tộc thêm mới…</option>
              {availableGroups.map(group => (
                <option key={group.id} value={group.id}>{group.ten}</option>
              ))}
            </select>
            <button className="wen-btn secondary" onClick={addGroup}>+ Thêm nhóm</button>
            <button className="wen-btn" onClick={normalize}>Chuẩn hóa</button>
          </div>

          <div className="wen-list">
            {items.map(item => {
              const group = ethnicGroups.find(entry => entry.id === item.dan_toc);
              return (
                <div key={item.dan_toc} className="wen-row">
                  <div className="wen-row-main">
                    <div className="wen-name-wrap">
                      <span className="wen-dot" style={{ background: colors[item.dan_toc] || group?.mau || "#94a3b8" }} />
                      <span className="wen-name">{group?.ten || item.dan_toc}</span>
                    </div>
                    <div className="wen-controls">
                      <input className="wen-input" type="number" min="0" max="100" value={item.ty_le} onChange={e => updatePercent(item.dan_toc, e.target.value)} />
                      <span className="wen-unit">%</span>
                      <input className="wen-color" type="color" value={colors[item.dan_toc] || group?.mau || "#94a3b8"} onChange={e => setColors(prev => ({ ...prev, [item.dan_toc]: e.target.value }))} />
                      <button className="wen-remove" onClick={() => removeGroup(item.dan_toc)}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="wen-summary">Tổng: <strong>{totalPct.toFixed(2).replace(/\.00$/, "")} %</strong></div>
        </div>

        <div className="wen-footer">
          <button className="wen-btn secondary" onClick={onClose}>Hủy</button>
          <button className="wen-btn primary" onClick={save}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
