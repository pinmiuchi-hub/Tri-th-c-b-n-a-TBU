import { useState } from "react";
import { ETHNIC_KEYS, ETHNIC_META, ethnicTabStyle, TRANSECT_SOURCES, TRANSECT_NOTE, type EthnicKey } from "./ethnicConfig";

export interface TransectZone { label: string; color: string; textColor: string; items: string[]; symbol: string; }
export interface EthnicZone { dan_toc: string; mau: string; vi_tri: string; }

export const DEFAULT_ZONES_BY_ETHNIC: Record<EthnicKey, TransectZone[]> = {
  thai: [
    { label: "Đỉnh núi", color: "#2d6a4f", textColor: "#d8f3dc", symbol: "🌲", items: ["Rừng đầu nguồn", "Rừng thiêng (đông mường)", "Nguồn nước đầu suối"] },
    { label: "Sườn trên", color: "#52b788", textColor: "#d8f3dc", symbol: "🌿", items: ["Rừng ma, rừng cấm bản", "Lâm sản phụ (măng, rau rừng)", "Cây thuốc quý"] },
    { label: "Sườn giữa", color: "#b7e4c7", textColor: "#1b4332", symbol: "🌾", items: ["Nương ngô, sắn", "Cây ăn quả xen canh", "Đầu hệ thống mương-phai"] },
    { label: "Sườn thấp", color: "#f4a261", textColor: "#1b4332", symbol: "🏡", items: ["Bản làng nhà sàn", "Vườn (V): Cây ăn quả", "Ao (A): Cá chép, trắm", "Chuồng (C): Lợn, gà, trâu"] },
    { label: "Thung lũng", color: "#74c69d", textColor: "#1b4332", symbol: "💧", items: ["Lúa nước 2-3 vụ", "Lúa-cá-vịt kết hợp", "Mương - phai - lái - lìn, cọn nước", "Bản làng ven sông"] },
  ],
  mong: [
    { label: "Đỉnh núi", color: "#2d6a4f", textColor: "#d8f3dc", symbol: "🌲", items: ["Rừng già nguyên sinh", "Rừng thiêng", "Nguồn nước đầu suối"] },
    { label: "Sườn trên", color: "#52b788", textColor: "#d8f3dc", symbol: "🏔️", items: ["Bản làng người Mông", "Nương ngô, lúa nương", "Thảo quả, Sơn tra", "Chè Shan tuyết"] },
    { label: "Sườn giữa", color: "#b7e4c7", textColor: "#1b4332", symbol: "🌽", items: ["Nương ngô, sắn, đậu tương", "Ruộng bậc thang", "Hàng rào xanh chống xói mòn"] },
    { label: "Sườn thấp", color: "#f4a261", textColor: "#1b4332", symbol: "🐎", items: ["Chăn nuôi (ngựa, dê, lợn)", "Vườn cây ăn quả"] },
  ],
  // Dữ liệu khởi tạo — cần xác minh với cộng đồng người Mường tại địa phương rồi chỉnh sửa trực tiếp trong modal
  muong: [
    { label: "Núi cao", color: "#2d6a4f", textColor: "#d8f3dc", symbol: "🌲", items: ["Rừng đầu nguồn", "Rừng cấm / rừng thiêng"] },
    { label: "Sườn đồi", color: "#b7e4c7", textColor: "#1b4332", symbol: "🌾", items: ["Nương rẫy", "Cây ăn quả, cây lâm sản phụ"] },
    { label: "Chân núi", color: "#f4a261", textColor: "#1b4332", symbol: "🏡", items: ["Bản làng nhà sàn", "Vườn - Ao - Chuồng"] },
    { label: "Thung lũng", color: "#74c69d", textColor: "#1b4332", symbol: "💧", items: ["Lúa nước", "Hệ thống mương dẫn nước"] },
  ],
};

export const DEFAULT_ETHNIC_ZONES: EthnicZone[] = [
  { dan_toc: "Người Mông", mau: "#b5179e", vi_tri: "Đỉnh & Sườn trên" },
  { dan_toc: "Người Dao", mau: "#f4a261", vi_tri: "Sườn trên & giữa" },
  { dan_toc: "Người Thái", mau: "#2d6a4f", vi_tri: "Sườn thấp & thung lũng" },
  { dan_toc: "Người Mường", mau: "#e76f51", vi_tri: "Chân núi & thung lũng" },
  { dan_toc: "Người Khơ Mú", mau: "#6d6875", vi_tri: "Sườn thấp & ven suối" },
  { dan_toc: "Người Kinh", mau: "#e63946", vi_tri: "Trung tâm thị trấn" },
];

interface Props {
  onClose: () => void;
  /** Dân tộc được chọn sẵn khi mở modal (từ bảng thông tin dân tộc) */
  initialEthnic: EthnicKey;
  zonesByEthnic: Record<EthnicKey, TransectZone[]>;
  ethnicZones: EthnicZone[];
  onChangeZones: (ethnic: EthnicKey, zones: TransectZone[]) => void;
  onChangeEthnicZones: (z: EthnicZone[]) => void;
}

export default function TransectDiagram({ onClose, initialEthnic, zonesByEthnic, ethnicZones, onChangeZones, onChangeEthnicZones }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [ethnic, setEthnic] = useState<EthnicKey>(initialEthnic);
  const zones = zonesByEthnic[ethnic] ?? [];
  const meta = ETHNIC_META[ethnic];

  const setZones = (z: TransectZone[]) => onChangeZones(ethnic, z);
  const updateZone = (i: number, patch: Partial<TransectZone>) => setZones(zones.map((z, j) => j === i ? { ...z, ...patch } : z));
  const updateZoneItem = (i: number, j: number, val: string) => setZones(zones.map((z, zi) => zi === i ? { ...z, items: z.items.map((it, ii) => ii === j ? val : it) } : z));
  const addZoneItem = (i: number) => setZones(zones.map((z, j) => j === i ? { ...z, items: [...z.items, "Tài nguyên mới"] } : z));
  const removeZoneItem = (i: number, j: number) => setZones(zones.map((z, zi) => zi === i ? { ...z, items: z.items.filter((_, ii) => ii !== j) } : z));
  const addZone = () => setZones([...zones, { label: "Đai mới", color: "#74c69d", textColor: "#1b4332", items: [], symbol: "📍" }]);
  const removeZone = (i: number) => { if (confirm(`Xóa đai "${zones[i].label}"?`)) setZones(zones.filter((_, j) => j !== i)); };

  const updateEthnic = (i: number, patch: Partial<EthnicZone>) => onChangeEthnicZones(ethnicZones.map((e, j) => j === i ? { ...e, ...patch } : e));
  const addEthnic = () => onChangeEthnicZones([...ethnicZones, { dan_toc: "Dân tộc mới", mau: "#74c69d", vi_tri: "Vị trí phân bố" }]);
  const removeEthnic = (i: number) => onChangeEthnicZones(ethnicZones.filter((_, j) => j !== i));

  return (
    <div className="transect-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="transect-modal">
        <div className="transect-header">
          <div className="transect-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Lược đồ mặt cắt độ cao — Người {meta.ten}
          </div>
          <div className="transect-header-actions">
            <button className={`edit-mode-btn ${editMode ? "active" : ""}`} onClick={() => setEditMode(!editMode)}>
              {editMode ? "✓ Xong" : "✏️ Chỉnh sửa"}
            </button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="transect-body">
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {ETHNIC_KEYS.map(k => (
              <button key={k} style={ethnicTabStyle(k === ethnic, ETHNIC_META[k].mau)} onClick={() => setEthnic(k)}>{ETHNIC_META[k].ten}</button>
            ))}
          </div>
          <p className="transect-desc">
            Phân bố tài nguyên và hoạt động sinh kế của người {meta.ten} theo đai độ cao
            {editMode && <span className="edit-hint-inline"> · Click vào tên/mục để chỉnh sửa</span>}
          </p>
          {ethnic === "muong" && (
            <p className="transect-desc" style={{ color: "#f4a261" }}>
              ⚠ Dữ liệu khởi tạo, cần xác minh với cộng đồng người Mường tại địa phương — bấm “Chỉnh sửa” để cập nhật.
            </p>
          )}

          <div className="transect-mountain">
            <svg viewBox="0 0 800 200" className="mountain-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f1f0f"/>
                  <stop offset="100%" stopColor="#1a2a1a"/>
                </linearGradient>
              </defs>
              <polygon points="0,200 150,200 400,20 650,200 800,200" fill={meta.mau} opacity="0.3"/>
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

          <p className="transect-desc" style={{ fontSize: 11, opacity: 0.8 }}>{TRANSECT_NOTE}</p>
          <div className="ethnic-elevation-section">
            <div className="ethnic-elev-title">
              Phân bố các dân tộc theo đai độ cao (so sánh)
              {editMode && <button className="add-ethnic-btn" onClick={addEthnic}>+ Thêm dân tộc</button>}
            </div>
            <div className="ethnic-elev-bars">
              {ethnicZones.map((e, i) => {
                const isCurrent = e.dan_toc.toLowerCase().includes(meta.ten.toLowerCase());
                return (
                  <div key={i} className="ethnic-elev-row" style={isCurrent && !editMode ? { outline: `1.5px solid ${e.mau}`, borderRadius: 6 } : undefined}>
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
                );
              })}
            </div>
          </div>
          <details style={{ marginTop: 10, fontSize: 11, opacity: 0.85 }}>
            <summary style={{ cursor: "pointer" }}>📚 Nguồn tham khảo ({TRANSECT_SOURCES.length})</summary>
            <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
              {TRANSECT_SOURCES.map(r => <li key={r.url}><a href={r.url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>{r.text}</a></li>)}
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
