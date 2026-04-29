interface Props { onClose: () => void; }

const ZONES = [
  { label: "Đỉnh núi\n>1500m", color: "#2d6a4f", textColor: "#d8f3dc", items: ["Rừng già nguyên sinh", "Rừng thiêng (đông mường)", "Mây, địa y", "Nguồn nước đầu suối"], symbol: "🌲" },
  { label: "Sườn trên\n900-1500m", color: "#52b788", textColor: "#d8f3dc", items: ["Rừng thứ sinh", "Thảo quả, Sơn tra", "Chè Shan tuyết", "Nương lúa Mông"], symbol: "🌿" },
  { label: "Sườn giữa\n500-900m", color: "#b7e4c7", textColor: "#1b4332", items: ["Cây ăn quả xen canh", "Nương ngô, sắn", "Ruộng bậc thang", "Hệ thống mương-phai"], symbol: "🌾" },
  { label: "Sườn thấp\n200-500m", color: "#f4a261", textColor: "#1b4332", items: ["Vườn (V): Cây ăn quả", "Ao (A): Cá chép, trắm", "Chuồng (C): Lợn, gà", "Rừng (R): Keo, bạch đàn"], symbol: "🏡" },
  { label: "Thung lũng\n<200m", color: "#74c69d", textColor: "#1b4332", items: ["Lúa nước 2-3 vụ", "Lúa-cá-vịt kết hợp", "Bản làng ven sông", "Hệ thống phai-lịn"], symbol: "💧" },
];

const ETHNIC_ZONES: { dan_toc: string; mau: string; vi_tri: string }[] = [
  { dan_toc: "Người Mông", mau: "#b5179e", vi_tri: "Đỉnh & Sườn trên" },
  { dan_toc: "Người Dao", mau: "#f4a261", vi_tri: "Sườn trên & giữa" },
  { dan_toc: "Người Thái", mau: "#2d6a4f", vi_tri: "Sườn thấp & thung lũng" },
  { dan_toc: "Người Khơ Mú", mau: "#6d6875", vi_tri: "Sườn thấp & ven suối" },
  { dan_toc: "Người Kinh", mau: "#e63946", vi_tri: "Trung tâm thị trấn" },
];

export default function TransectDiagram({ onClose }: Props) {
  return (
    <div className="transect-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="transect-modal">
        <div className="transect-header">
          <div className="transect-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Lược đồ mặt cắt độ cao — Vùng Tây Bắc
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="transect-body">
          <p className="transect-desc">Phân bố tài nguyên và hoạt động sinh kế theo đai độ cao từ thung lũng lên đỉnh núi</p>

          {/* Mountain silhouette + zones */}
          <div className="transect-mountain">
            {/* SVG mountain shape */}
            <svg viewBox="0 0 800 200" className="mountain-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f1f0f"/>
                  <stop offset="100%" stopColor="#1a2a1a"/>
                </linearGradient>
              </defs>
              {/* Mountain silhouette */}
              <polygon points="0,200 150,200 400,20 650,200 800,200" fill="#2d6a4f" opacity="0.3"/>
              {/* Contour lines */}
              <polyline points="40,200 400,60 760,200" fill="none" stroke="#52b788" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
              <polyline points="80,200 400,100 720,200" fill="none" stroke="#74c69d" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
              <polyline points="130,200 400,140 670,200" fill="none" stroke="#b7e4c7" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
              {/* Peak label */}
              <text x="400" y="15" textAnchor="middle" fill="#74c69d" fontSize="10" fontFamily="sans-serif">Đỉnh</text>
              {/* Valley labels */}
              <text x="20" y="195" fill="#74c69d" fontSize="9" fontFamily="sans-serif">Thung lũng</text>
              <text x="680" y="195" fill="#74c69d" fontSize="9" fontFamily="sans-serif">Thung lũng</text>
              {/* River at bottom */}
              <path d="M0,198 Q200,192 400,195 Q600,198 800,193" fill="none" stroke="#4895ef" strokeWidth="2"/>
              <text x="400" y="208" textAnchor="middle" fill="#4895ef" fontSize="9" fontFamily="sans-serif">Sông / suối</text>
            </svg>
          </div>

          {/* Zone cards */}
          <div className="zone-cards">
            {[...ZONES].reverse().map((zone, i) => (
              <div key={i} className="zone-card" style={{ borderLeftColor: zone.color }}>
                <div className="zone-header" style={{ background: zone.color }}>
                  <span className="zone-symbol">{zone.symbol}</span>
                  <span className="zone-label" style={{ color: zone.textColor }}>{zone.label.replace("\n", " — ")}</span>
                </div>
                <ul className="zone-items">
                  {zone.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Ethnic distribution */}
          <div className="ethnic-elevation-section">
            <div className="ethnic-elev-title">Phân bố dân tộc theo đai độ cao</div>
            <div className="ethnic-elev-bars">
              {ETHNIC_ZONES.map((e, i) => (
                <div key={i} className="ethnic-elev-row">
                  <div className="ethnic-elev-dot" style={{ background: e.mau }}/>
                  <span className="ethnic-elev-name">{e.dan_toc}</span>
                  <span className="ethnic-elev-pos">{e.vi_tri}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
