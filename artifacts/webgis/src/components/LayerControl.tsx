interface LayerToggle {
  id: string;
  ten: string;
  mau: string;
  bieu_tuong: string;
  active: boolean;
}

interface LayerCategory {
  id: string;
  ten: string;
  icon: string;
  layers: LayerToggle[];
}

interface Props {
  categories: LayerCategory[];
  onToggle: (layerId: string) => void;
  onClose: () => void;
  showTransect: boolean;
  onToggleTransect: () => void;
  showCalendar: boolean;
  onToggleCalendar: () => void;
}

export default function LayerControl({ categories, onToggle, onClose, showTransect, onToggleTransect, showCalendar, onToggleCalendar }: Props) {
  return (
    <div className="layer-panel">
      <div className="layer-panel-header">
        <span className="layer-panel-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          Lớp bản đồ
        </span>
        <button className="layer-panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="layer-panel-body">
        {categories.map(cat => (
          <div key={cat.id} className="layer-category">
            <div className="layer-cat-title">{cat.icon} {cat.ten}</div>
            {cat.layers.map(layer => (
              <label key={layer.id} className={`layer-item ${layer.active ? "active" : ""}`}>
                <div className="layer-item-left">
                  <div className="layer-dot" style={{ background: layer.mau }}/>
                  <span className="layer-symbol">{layer.bieu_tuong}</span>
                  <span className="layer-name">{layer.ten}</span>
                </div>
                <div className={`layer-toggle ${layer.active ? "on" : ""}`} onClick={() => onToggle(layer.id)}>
                  <div className="layer-toggle-thumb"/>
                </div>
              </label>
            ))}
          </div>
        ))}

        {/* Extra panels */}
        <div className="layer-category">
          <div className="layer-cat-title">📊 Biểu đồ & Lịch</div>
          <label className={`layer-item ${showTransect ? "active" : ""}`}>
            <div className="layer-item-left">
              <div className="layer-dot" style={{ background: "#8ecae6" }}/>
              <span className="layer-symbol">⛰️</span>
              <span className="layer-name">Lược đồ mặt cắt độ cao</span>
            </div>
            <div className={`layer-toggle ${showTransect ? "on" : ""}`} onClick={onToggleTransect}>
              <div className="layer-toggle-thumb"/>
            </div>
          </label>
          <label className={`layer-item ${showCalendar ? "active" : ""}`}>
            <div className="layer-item-left">
              <div className="layer-dot" style={{ background: "#ffd166" }}/>
              <span className="layer-symbol">📅</span>
              <span className="layer-name">Nông lịch bản địa</span>
            </div>
            <div className={`layer-toggle ${showCalendar ? "on" : ""}`} onClick={onToggleCalendar}>
              <div className="layer-toggle-thumb"/>
            </div>
          </label>
        </div>

        <div className="layer-legend-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Click vào ký hiệu trên bản đồ để xem thông tin chi tiết
        </div>
      </div>
    </div>
  );
}

export type { LayerCategory, LayerToggle };
