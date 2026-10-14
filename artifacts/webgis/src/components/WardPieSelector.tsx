import { useMemo, useState } from "react";
import "./WardPieSelector.css";

interface WardItem { ma_xa: string; ten_xa: string; ten_tinh: string; }

interface Props {
  wards: WardItem[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  onClose: () => void;
}

const PROVINCE_ORDER = ["Điện Biên", "Lai Châu", "Sơn La", "Lào Cai"];

export default function WardPieSelector({ wards, selected, onChange, onClose }: Props) {
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const map: Record<string, WardItem[]> = {};
    for (const w of wards) {
      const match = !q || w.ten_xa.toLowerCase().includes(q) || w.ten_tinh.toLowerCase().includes(q);
      if (!match) continue;
      if (!map[w.ten_tinh]) map[w.ten_tinh] = [];
      map[w.ten_tinh].push(w);
    }
    const keys = Object.keys(map).sort((a, b) => {
      const ia = PROVINCE_ORDER.indexOf(a), ib = PROVINCE_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b, "vi");
    });
    return keys.map(k => ({ province: k, wards: map[k].sort((a, b) => a.ten_xa.localeCompare(b.ten_xa, "vi")) }));
  }, [wards, search]);

  const toggle = (ma_xa: string) => {
    const next = new Set(selected);
    if (next.has(ma_xa)) next.delete(ma_xa);
    else next.add(ma_xa);
    onChange(next);
  };

  const toggleProvince = (pWards: WardItem[]) => {
    const ids = pWards.map(w => w.ma_xa);
    const allOn = ids.every(id => selected.has(id));
    const next = new Set(selected);
    if (allOn) ids.forEach(id => next.delete(id));
    else ids.forEach(id => next.add(id));
    onChange(next);
  };

  const selectAll = () => onChange(new Set(wards.map(w => w.ma_xa)));
  const clearAll = () => onChange(new Set());

  return (
    <div className="wps-panel">
      <div className="wps-header">
        <span className="wps-title">🥧 Chọn xã hiển thị biểu đồ</span>
        <button className="wps-close" onClick={onClose}>✕</button>
      </div>
      <div className="wps-search-row">
        <input className="wps-search" placeholder="🔍 Tìm xã hoặc tỉnh…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="wps-actions">
        <button className="wps-act-btn" onClick={selectAll}>Chọn tất cả</button>
        <button className="wps-act-btn" onClick={clearAll}>Bỏ chọn tất cả</button>
        <span className="wps-count">{selected.size > 0 ? <><b>{selected.size}</b> xã đang bật</> : "Chưa chọn xã nào"}</span>
      </div>
      <div className="wps-body">
        {grouped.length === 0 && <div className="wps-empty">Không tìm thấy xã nào phù hợp</div>}
        {grouped.map(({ province, wards: pWards }) => {
          const ids = pWards.map(w => w.ma_xa);
          const checkedCount = ids.filter(id => selected.has(id)).length;
          const allChecked = checkedCount === ids.length;
          const someChecked = checkedCount > 0 && !allChecked;
          return (
            <div key={province} className="wps-province">
              <div className="wps-province-header">
                <label className="wps-province-label">
                  <input type="checkbox" checked={allChecked} ref={el => { if (el) el.indeterminate = someChecked; }} onChange={() => toggleProvince(pWards)} className="wps-checkbox" />
                  <span className="wps-province-name">{province}</span>
                  <span className="wps-province-count">{checkedCount}/{ids.length}</span>
                </label>
              </div>
              <div className="wps-ward-list">
                {pWards.map(w => (
                  <label key={w.ma_xa} className={`wps-ward-item ${selected.has(w.ma_xa) ? "checked" : ""}`}>
                    <input type="checkbox" checked={selected.has(w.ma_xa)} onChange={() => toggle(w.ma_xa)} className="wps-checkbox" />
                    <span className="wps-ward-name">{w.ten_xa}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="wps-footer">
        <div className="wps-hint">💡 Biểu đồ tròn chỉ hiện ở các xã đã tick</div>
        <button className="wps-done" onClick={onClose}>✓ Xong</button>
      </div>
    </div>
  );
}
