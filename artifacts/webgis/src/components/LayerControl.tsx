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
  onEditLayer: (layerId: string) => void;
  featureCounts: Record<string, number>;
  editableLayers: Set<string>;
  onClose: () => void;
  showTransect: boolean;
  onToggleTransect: () => void;
  showCalendar: boolean;
  onToggleCalendar: () => void;
}

export default function LayerControl({ categories, onToggle, onEditLayer, featureCounts, editableLayers, onClose, showTransect, onToggleTransect, showCalendar, onToggleCalendar }: Props) {
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
              <div key={layer.id} className={`layer-item ${layer.active ? "active" : ""}`}>
                <div className="layer-item-left">
                  <div className="layer-dot" style={{ background: layer.mau }}/>
                  <span className="layer-symbol">{layer.bieu_tuong}</span>
                  <span className="layer-name">{layer.ten}</span>
                  {featureCounts[layer.id] != null && featureCounts[layer.id] > 0 && (
                    <span className="layer-feature-count">{featureCounts[layer.id]}</span>
                  )}
                </div>
                <div className="layer-item-actions">
                  {editableLayers.has(layer.id) && (
                    <button className="layer-edit-btn" onClick={() => onEditLayer(layer.id)} title="Sửa dữ liệu lớp">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  )}
                  <div className={`layer-toggle ${layer.active ? "on" : ""}`} onClick={() => onToggle(layer.id)}>
                    <div className="layer-toggle-thumb"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="layer-category">
          <div className="layer-cat-title">📊 Biểu đồ & Lịch</div>
          <div className={`layer-item ${showTransect ? "active" : ""}`}>
            <div className="layer-item-left">
              <div className="layer-dot" style={{ background: "#8ecae6" }}/>
              <span className="layer-symbol">⛰️</span>
              <span className="layer-name">Lược đồ mặt cắt độ cao</span>
            </div>
            <div className="layer-item-actions">
              <div className={`layer-toggle ${showTransect ? "on" : ""}`} onClick={onToggleTransect}>
                <div className="layer-toggle-thumb"/>
              </div>
            </div>
          </div>
          <div className={`layer-item ${showCalendar ? "active" : ""}`}>
            <div className="layer-item-left">
              <div className="layer-dot" style={{ background: "#ffd166" }}/>
              <span className="layer-symbol">📅</span>
              <span className="layer-name">Nông lịch bản địa</span>
            </div>
            <div className="layer-item-actions">
              <div className={`layer-toggle ${showCalendar ? "on" : ""}`} onClick={onToggleCalendar}>
                <div className="layer-toggle-thumb"/>
              </div>
            </div>
          </div>
        </div>

        <div className="layer-legend-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Click ✏️ bên cạnh lớp để thêm/sửa/xóa dữ liệu của lớp đó
        </div>
      </div>
    </div>
  );
}

export type { LayerCategory, LayerToggle };
