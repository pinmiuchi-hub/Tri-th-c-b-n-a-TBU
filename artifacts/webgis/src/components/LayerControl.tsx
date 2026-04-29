import { useRef, useState } from "react";

interface LayerToggle {
  id: string;
  ten: string;
  mau: string;
  bieu_tuong: string;
  active: boolean;
  isCustom?: boolean;
}

interface LayerCategory {
  id: string;
  ten: string;
  icon: string;
  layers: LayerToggle[];
}

export interface NewLayerInput {
  ten: string;
  mau: string;
  bieu_tuong: string;
  geomType: "point" | "line" | "polygon";
}

interface Props {
  categories: LayerCategory[];
  onToggle: (layerId: string) => void;
  onEditLayer: (layerId: string) => void;
  onAddCustomLayer: (categoryId: string, input: NewLayerInput) => void;
  onImportLayerFile: (categoryId: string, file: File, color: string, symbol: string) => void;
  onDeleteCustomLayer: (layerId: string) => void;
  onExportLayer: (layerId: string, format: "geojson" | "kml") => void;
  featureCounts: Record<string, number>;
  editableLayers: Set<string>;
  exportableLayers: Set<string>;
  onClose: () => void;
  showTransect: boolean;
  onToggleTransect: () => void;
  showCalendar: boolean;
  onToggleCalendar: () => void;
  showKnowledge: boolean;
  onToggleKnowledge: () => void;
}

const PALETTE = ["#4895ef", "#2d6a4f", "#e63946", "#f4a261", "#9b5de5", "#52b788", "#74c69d", "#ffd166", "#6b4226", "#8338ec", "#e76f51", "#457b9d"];

export default function LayerControl({ categories, onToggle, onEditLayer, onAddCustomLayer, onImportLayerFile, onDeleteCustomLayer, onExportLayer, featureCounts, editableLayers, exportableLayers, onClose, showTransect, onToggleTransect, showCalendar, onToggleCalendar, showKnowledge, onToggleKnowledge }: Props) {
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [draft, setDraft] = useState<NewLayerInput>({ ten: "", mau: PALETTE[0], bieu_tuong: "📌", geomType: "point" });
  const [exportMenuFor, setExportMenuFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importingFor, setImportingFor] = useState<string | null>(null);

  const startAdd = (catId: string) => {
    setAddingFor(catId);
    setDraft({ ten: "", mau: PALETTE[Math.floor(Math.random() * PALETTE.length)], bieu_tuong: "📌", geomType: "point" });
  };
  const submitAdd = (catId: string) => {
    if (!draft.ten.trim()) { alert("Nhập tên lớp"); return; }
    onAddCustomLayer(catId, { ...draft, ten: draft.ten.trim() });
    setAddingFor(null);
  };
  const startImport = (catId: string) => {
    setImportingFor(catId);
    setDraft(d => ({ ...d, mau: PALETTE[Math.floor(Math.random() * PALETTE.length)], bieu_tuong: "📌" }));
    fileInputRef.current?.click();
  };
  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const cat = importingFor;
    e.target.value = "";
    setImportingFor(null);
    if (!file || !cat) return;
    onImportLayerFile(cat, file, draft.mau, draft.bieu_tuong || "📌");
  };

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
                  {layer.isCustom && <span className="layer-custom-badge" title="Lớp tự tạo">tự tạo</span>}
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
                  {exportableLayers.has(layer.id) && (
                    <div className="layer-export-wrap">
                      <button className="layer-export-btn" onClick={() => setExportMenuFor(exportMenuFor === layer.id ? null : layer.id)} title="Tải xuống lớp này">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </button>
                      {exportMenuFor === layer.id && (
                        <div className="layer-export-menu" onMouseLeave={() => setExportMenuFor(null)}>
                          <button onClick={() => { onExportLayer(layer.id, "geojson"); setExportMenuFor(null); }}>📄 GeoJSON (.geojson)</button>
                          <button onClick={() => { onExportLayer(layer.id, "kml"); setExportMenuFor(null); }}>🌍 KML (.kml)</button>
                        </div>
                      )}
                    </div>
                  )}
                  {layer.isCustom && (
                    <button className="layer-delete-btn" onClick={() => { if (confirm(`Xóa lớp "${layer.ten}" và toàn bộ dữ liệu?`)) onDeleteCustomLayer(layer.id); }} title="Xóa lớp tự tạo">✕</button>
                  )}
                  <div className={`layer-toggle ${layer.active ? "on" : ""}`} onClick={() => onToggle(layer.id)}>
                    <div className="layer-toggle-thumb"/>
                  </div>
                </div>
              </div>
            ))}

            {addingFor === cat.id ? (
              <div className="layer-add-form">
                <div className="laf-row">
                  <input className="laf-input laf-symbol" maxLength={2} value={draft.bieu_tuong} onChange={e => setDraft(d => ({ ...d, bieu_tuong: e.target.value }))} placeholder="📌" title="Biểu tượng (emoji)"/>
                  <input className="laf-input laf-name" value={draft.ten} onChange={e => setDraft(d => ({ ...d, ten: e.target.value }))} placeholder="Tên lớp..."/>
                  <input type="color" className="laf-color" value={draft.mau} onChange={e => setDraft(d => ({ ...d, mau: e.target.value }))} title="Màu sắc"/>
                </div>
                <div className="laf-row">
                  <select className="laf-input" value={draft.geomType} onChange={e => setDraft(d => ({ ...d, geomType: e.target.value as NewLayerInput["geomType"] }))}>
                    <option value="point">📍 Điểm</option>
                    <option value="line">〰️ Đường</option>
                    <option value="polygon">⬡ Vùng</option>
                  </select>
                  <button className="laf-cancel" onClick={() => setAddingFor(null)}>Hủy</button>
                  <button className="laf-save" onClick={() => submitAdd(cat.id)}>Tạo lớp</button>
                </div>
              </div>
            ) : (
              <div className="layer-add-row">
                <button className="layer-add-btn" onClick={() => startAdd(cat.id)}>+ Thêm lớp trống</button>
                <button className="layer-import-btn" onClick={() => startImport(cat.id)} title="Nhập lớp từ file GeoJSON hoặc KML">📁 Nhập GeoJSON / KML</button>
              </div>
            )}
          </div>
        ))}
        <input ref={fileInputRef} type="file" accept=".geojson,.json,.kml,application/geo+json,application/vnd.google-earth.kml+xml" style={{ display: "none" }} onChange={handleFileChosen}/>

        <div className="layer-category">
          <div className="layer-cat-title">📊 Biểu đồ · Lịch · Tri thức</div>
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
          <div className={`layer-item ${showKnowledge ? "active" : ""}`}>
            <div className="layer-item-left">
              <div className="layer-dot" style={{ background: "#9b5de5" }}/>
              <span className="layer-symbol">📖</span>
              <span className="layer-name">Tri thức & văn hóa bản địa</span>
            </div>
            <div className="layer-item-actions">
              <div className={`layer-toggle ${showKnowledge ? "on" : ""}`} onClick={onToggleKnowledge}>
                <div className="layer-toggle-thumb"/>
              </div>
            </div>
          </div>
        </div>

        <div className="layer-legend-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Click ✏️ bên cạnh lớp để thêm/sửa/xóa dữ liệu · Dùng "+ Thêm lớp" để tạo lớp tùy chỉnh
        </div>
      </div>
    </div>
  );
}

export type { LayerCategory, LayerToggle };
