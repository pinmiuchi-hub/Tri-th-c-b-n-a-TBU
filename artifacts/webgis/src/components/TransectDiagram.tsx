import { useState } from "react";

export interface TransectZone { label: string; color: string; textColor: string; items: string[]; symbol: string; }
export interface EthnicZone { dan_toc: string; mau: string; vi_tri: string; }

export const DEFAULT_ZONES: TransectZone[] = [
  { label: "Đỉnh núi >1500m", color: "#2d6a4f", textColor: "#d8f3dc", items: ["Rừng già nguyên sinh", "Rừng thiêng (đông mường)", "Mây, địa y", "Nguồn nước đầu suối"], symbol: "🌲" },
  { label: "Sườn trên 900-1500m", color: "#52b788", textColor: "#d8f3dc", items: ["Rừng thứ sinh", "Thảo quả, Sơn tra", "Chè Shan tuyết", "Nương lúa Mông"], symbol: "🌿" },
  { label: "Sườn giữa 500-900m", color: "#b7e4c7", textColor: "#1b4332", items: ["Cây ăn quả xen canh", "Nương ngô, sắn", "Ruộng bậc thang", "Hệ thống mương-phai"], symbol: "🌾" },
  { label: "Sườn thấp 200-500m", color: "#f4a261", textColor: "#1b4332", items: ["Vườn (V): Cây ăn quả", "Ao (A): Cá chép, trắm", "Chuồng (C): Lợn, gà", "Rừng (R): Keo, bạch đàn"], symbol: "🏡" },
  { label: "Thung lũng <200m", color: "#74c69d", textColor: "#1b4332", items: ["Lúa nước 2-3 vụ", "Lúa-cá-vịt kết hợp", "Bản làng ven sông", "Hệ thống phai-lịn"], symbol: "💧" },
];

export const DEFAULT_ETHNIC_ZONES: EthnicZone[] = [
  { dan_toc: "Người Mông", mau: "#b5179e", vi_tri: "Đỉnh & Sườn trên" },
  { dan_toc: "Người Dao", mau: "#f4a261", vi_tri: "Sườn trên & giữa" },
  { dan_toc: "Người Thái", mau: "#2d6a4f", vi_tri: "Sườn thấp & thung lũng" },
  { dan_toc: "Người Khơ Mú", mau: "#6d6875", vi_tri: "Sườn thấp & ven suối" },
  { dan_toc: "Người Kinh", mau: "#e63946", vi_tri: "Trung tâm thị trấn" },
];

interface Props {
  onClose: () => void;
  zones: TransectZone[];
  ethnicZones: EthnicZone[];
  onChangeZones: (z: TransectZone[]) => void;
  onChangeEthnicZones: (z: EthnicZone[]) => void;
}

export default function TransectDiagram({ onClose, zones, ethnicZones, onChangeZones, onChangeEthnicZones }: Props) {
  const [editMode, setEditMode] = useState(false);

  const updateZone = (i: number, patch: Partial<TransectZone>) => onChangeZones(zones.map((z, j) => j === i ? { ...z, ...patch } : z));
  const updateZoneItem = (i: number, j: number, val: string) => onChangeZones(zones.map((z, zi) => zi === i ? { ...z, items: z.items.map((it, ii) => ii === j ? val : it) } : z));
  const addZoneItem = (i: number) => onChangeZones(zones.map((z, j) => j === i ? { ...z, items: [...z.items, "Tài nguyên mới"] } : z));
  const removeZoneItem = (i: number, j: number) => onChangeZones(zones.map((z, zi) => zi === i ? { ...z, items: z.items.filter((_, ii) => ii !== j) } : z));
  const addZone = () => onChangeZones([...zones, { label: "Đai mới", color: "#74c69d", textColor: "#1b4332", items: [], symbol: "📍" }]);
  const removeZone = (i: number) => { if (confirm(`Xóa đai "${zones[i].label}"?`)) onChangeZones(zones.filter((_, j) => j !== i)); };

  const updateEthnic = (i: number, patch: Partial<EthnicZone>) => onChangeEthnicZones(ethnicZones.map((e, j) => j === i ? { ...e, ...patch } : e));
  const addEthnic = () => onChangeEthnicZones([...ethnicZones, { dan_toc: "Dân tộc mới", mau: "#74c69d", vi_tri: "Vị trí phân bố" }]);
  const removeEthnic = (i: number) => onChangeEthnicZones(ethnicZones.filter((_, j) => j !== i));

  return (
    <div className="transect-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="transect-modal">
        <div className="transect-header">
          <div className="transect-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Lược đồ mặt cắt độ cao — Vùng Tây Bắc
          </div>
          <div className="transect-header-actions">
            <button className={`edit-mode-btn ${editMode ? "active" : ""}`} onClick={() => setEditMode(!editMode)}>
              {editMode ? "✓ Xong" : "✏️ Chỉnh sửa"}
            </button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="transect-body">
          <p className="transect-desc">
            Phân bố tài nguyên và hoạt động sinh kế theo đai độ cao từ thung lũng lên đỉnh núi
            {editMode && <span className="edit-hint-inline"> · Click vào tên/mục để chỉnh sửa</span>}
          </p>

          <div className="transect-mountain">
            <svg viewBox="0 0 800 200" className="mountain-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f1f0f"/>
                  <stop offset="100%" stopColor="#1a2a1a"/>
                </linearGradient>
              </defs>
              <polygon points="0,200 150,200 400,20 650,200 800,200" fill="#2d6a4f" opacity="0.3"/>
              <polyline points="40,200 400,60 760,200" fill="none" stroke="#52b788" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
              <polyline points="80,200 400,100 720,200" fill="none" stroke="#74c69d" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
              <polyline points="130,200 400,140 670,200" fill="none" stroke="#b7e4c7" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
              <text x="400" y="15" textAnchor="middle" fill="#74c69d" fontSize="10" fontFamily="sans-serif">Đỉnh</text>
              <text x="20" y="195" fill="#74c69d" fontSize="9" fontFamily="sans-serif">Thung lũng</text>
              <text x="680" y="195" fill="#74c69d" fontSize="9" fontFamily="sans-serif">Thung lũng</text>
              <path d="M0,198 Q200,192 400,195 Q600,198 800,193" fill="none" stroke="#4895ef" strokeWidth="2"/>
              <text x="400" y="208" textAnchor="middle" fill="#4895ef" fontSize="9" fontFamily="sans-serif">Sông / suối</text>
            </svg>
          </div>

          <div className="zone-cards">
            {[...zones].reverse().map((zone, ri) => {
              const i = zones.length - 1 - ri;
              return (
                <div key={i} className="zone-card" style={{ borderLeftColor: zone.color }}>
                  <div className="zone-header" style={{ background: zone.color }}>
                    {editMode ? (
                      <>
                        <input className="zone-symbol-input" value={zone.symbol} onChange={e => updateZone(i, { symbol: e.target.value })} maxLength={2}/>
                        <input className="zone-label-input" value={zone.label} onChange={e => updateZone(i, { label: e.target.value })} style={{ color: zone.textColor }}/>
                        <input type="color" className="zone-color-input" value={zone.color} onChange={e => updateZone(i, { color: e.target.value })} title="Màu nền"/>
                        <button className="zone-remove-btn" onClick={() => removeZone(i)}>🗑️</button>
                      </>
                    ) : (
                      <>
                        <span className="zone-symbol">{zone.symbol}</span>
                        <span className="zone-label" style={{ color: zone.textColor }}>{zone.label}</span>
                      </>
                    )}
                  </div>
                  <ul className="zone-items">
                    {zone.items.map((item, j) => (
                      <li key={j}>
                        {editMode ? (
                          <div className="zone-item-edit">
                            <input className="zone-item-input" value={item} onChange={e => updateZoneItem(i, j, e.target.value)}/>
                            <button className="zone-item-remove" onClick={() => removeZoneItem(i, j)}>✕</button>
                          </div>
                        ) : item}
                      </li>
                    ))}
                    {editMode && (
                      <li><button className="zone-item-add" onClick={() => addZoneItem(i)}>+ Thêm tài nguyên</button></li>
                    )}
                  </ul>
                </div>
              );
            })}
            {editMode && (
              <div className="zone-card zone-add-card" onClick={addZone}>+ Thêm đai độ cao mới</div>
            )}
          </div>

          <div className="ethnic-elevation-section">
            <div className="ethnic-elev-title">
              Phân bố dân tộc theo đai độ cao
              {editMode && <button className="add-ethnic-btn" onClick={addEthnic}>+ Thêm dân tộc</button>}
            </div>
            <div className="ethnic-elev-bars">
              {ethnicZones.map((e, i) => (
                <div key={i} className="ethnic-elev-row">
                  {editMode ? (
                    <>
                      <input type="color" className="ethnic-color-input" value={e.mau} onChange={ev => updateEthnic(i, { mau: ev.target.value })}/>
                      <input className="ethnic-elev-input" value={e.dan_toc} onChange={ev => updateEthnic(i, { dan_toc: ev.target.value })} style={{ width: 130 }}/>
                      <input className="ethnic-elev-input" value={e.vi_tri} onChange={ev => updateEthnic(i, { vi_tri: ev.target.value })} style={{ flex: 1 }}/>
                      <button className="zone-item-remove" onClick={() => removeEthnic(i)}>✕</button>
                    </>
                  ) : (
                    <>
                      <div className="ethnic-elev-dot" style={{ background: e.mau }}/>
                      <span className="ethnic-elev-name">{e.dan_toc}</span>
                      <span className="ethnic-elev-pos">{e.vi_tri}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
