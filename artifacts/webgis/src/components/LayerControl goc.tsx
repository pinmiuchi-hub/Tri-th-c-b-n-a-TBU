import { useRef, useState } from "react";
import { isImageSymbol, fileToDataUrl, resizeDataUrl } from "../utils/imageUtils";

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
  onEditSymbology?: (layerId: string) => void;
  onAddCustomLayer: (categoryId: string, input: NewLayerInput) => void;
  onImportLayerFile: (categoryId: string, file: File, color: string, symbol: string) => void;
  onDeleteCustomLayer: (layerId: string) => void;
  onRenameCustomLayer: (layerId: string, name: string) => void;
  onRenameLayer: (layerId: string, name: string) => void;
  onExportLayer: (layerId: string, format: "geojson" | "kml") => void;
  featureCounts: Record<string, number>;
  editableLayers: Set<string>;
  exportableLayers: Set<string>;
  onClose: () => void;
  showTransect?: boolean;
  onToggleTransect?: () => void;
  showCalendar?: boolean;
  onToggleCalendar?: () => void;
  showKnowledge: boolean;
  onToggleKnowledge: () => void;
  showEthnicPie: boolean;
  onToggleEthnicPie: () => void;
  onOpenPieSelector: () => void;
  onAddCategory: (ten: string, icon: string) => void;
onDeleteCategory: (categoryId: string) => void;
onRenameCategory: (categoryId: string, name: string) => void;
onRemoveBuiltinLayer: (categoryId: string, layerId: string) => void;
}

const PALETTE = ["#4895ef", "#2d6a4f", "#e63946", "#f4a261", "#9b5de5", "#52b788", "#74c69d", "#ffd166", "#6b4226", "#8338ec", "#e76f51", "#457b9d"];

export default function LayerControl({
  categories, onToggle, onEditLayer, onEditSymbology, onAddCustomLayer, onImportLayerFile,
  onDeleteCustomLayer, onRenameCustomLayer, onRenameLayer, onAddCategory, onDeleteCategory, onRenameCategory, onRemoveBuiltinLayer, onExportLayer,
  featureCounts, editableLayers, exportableLayers, onClose, showTransect, onToggleTransect,
  showCalendar, onToggleCalendar, showKnowledge, onToggleKnowledge, showEthnicPie, onToggleEthnicPie, onOpenPieSelector
}: Props) {  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [draft, setDraft] = useState<NewLayerInput>({ ten: "", mau: PALETTE[0], bieu_tuong: "📌", geomType: "point" });
  const [exportMenuFor, setExportMenuFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);
  const [importingFor, setImportingFor] = useState<string | null>(null);

  const pickSymbolImage = () => symbolInputRef.current?.click();
  const handleSymbolFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Vui lòng chọn tệp ảnh (PNG, JPG, SVG, WebP)"); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Ảnh quá lớn (tối đa 2 MB)"); return; }
    try {
      const dataUrl = await fileToDataUrl(file);
      const small = await resizeDataUrl(dataUrl, 256);
      setDraft(d => ({ ...d, bieu_tuong: small }));
    } catch { alert("Không đọc được tệp ảnh"); }
  };
  const clearSymbolImage = () => setDraft(d => ({ ...d, bieu_tuong: "📌" }));

  const startAdd = (catId: string) => {
    setAddingFor(catId);
    setDraft({ ten: "", mau: PALETTE[Math.floor(Math.random() * PALETTE.length)], bieu_tuong: "📌", geomType: "point" });
  };
  const [addingGroup, setAddingGroup] = useState(false);
const [newGroupName, setNewGroupName] = useState("");
const [newGroupIcon, setNewGroupIcon] = useState("📁");
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
<div className="layer-cat-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <span>{cat.icon} {cat.ten}</span>
    <button className="layer-edit-btn" onClick={() => { const name = prompt("Tên nhóm lớp mới", cat.ten); if (name?.trim()) onRenameCategory(cat.id, name.trim()); }} title="Đổi tên nhóm lớp">✎</button>
  <button
    className="layer-delete-btn"
    onClick={() => { if (confirm(`Xóa nhóm "${cat.ten}"? Các lớp bên trong sẽ bị ẩn khỏi bảng điều khiển.`)) onDeleteCategory(cat.id); }}
    title="Xóa nhóm lớp bản đồ"
  >
    🗑️
  </button>
</div>            {cat.layers.map(layer => (
              <div key={layer.id} className={`layer-item ${layer.active ? "active" : ""}`}>
                <div className="layer-item-left">
                  <div className="layer-dot" style={{ background: layer.mau }}/>
                  <span className="layer-symbol">
                    {isImageSymbol(layer.bieu_tuong)
                      ? <img src={layer.bieu_tuong} alt="" className="layer-symbol-img"/>
                      : layer.bieu_tuong}
                  </span>
                  <span className="layer-name" title={layer.ten}>{layer.ten}</span>
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
                  {onEditSymbology && (layer.id === "ward_boundaries" || layer.id === "population_density") && (
 <button className="layer-edit-btn" onClick={() => onEditSymbology(layer.id)} title="Chỉnh sửa ký hiệu & chú giải">                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3h7a2 2 0 0 1 2 2v7"/><path d="M12 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M14.7 7.3l2 2"/><path d="M15.2 4.8l4 4"/><path d="M8 16l2-2 4 4-2 2z"/></svg>
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
                  <button
  className="layer-delete-btn"
  onClick={() => {
    if (layer.isCustom) {
      if (confirm(`Xóa lớp "${layer.ten}" và toàn bộ dữ liệu?`)) onDeleteCustomLayer(layer.id);
    } else {
      if (confirm(`Ẩn lớp "${layer.ten}" khỏi bảng điều khiển?`)) onRemoveBuiltinLayer(cat.id, layer.id);
    }
  }}
  title={layer.isCustom ? "Xóa lớp tự tạo" : "Ẩn lớp khỏi bảng điều khiển"}
>
  ✕
</button>
                  <div className={`layer-toggle ${layer.active ? "on" : ""}`} onClick={() => onToggle(layer.id)}>
                    <div className="layer-toggle-thumb"/>
                  </div>
                </div>
              </div>
            ))}

            {addingFor === cat.id ? (
              <div className="layer-add-form">
                <div className="laf-row">
                  <div className="laf-symbol-cell" title="Biểu tượng (emoji hoặc ảnh)">
                    {isImageSymbol(draft.bieu_tuong) ? (
                      <div className="laf-symbol-preview" style={{ background: draft.mau }}>
                        <img src={draft.bieu_tuong} alt=""/>
                        <button type="button" className="laf-symbol-clear" onClick={clearSymbolImage} title="Xóa ảnh, dùng emoji">✕</button>
                      </div>
                    ) : (
                      <input className="laf-input laf-symbol" maxLength={2} value={draft.bieu_tuong} onChange={e => setDraft(d => ({ ...d, bieu_tuong: e.target.value }))} placeholder="📌"/>
                    )}
                    <button type="button" className="laf-symbol-upload" onClick={pickSymbolImage} title="Tải ảnh ký hiệu (PNG, JPG, SVG)">📷</button>
                  </div>
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
        <input ref={symbolInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif" style={{ display: "none" }} onChange={handleSymbolFileChosen}/>

        <div className="layer-category">
          <div className="layer-cat-title">📊 Biểu đồ · Lịch · Tri thức</div>
          <div className={`layer-item ${showEthnicPie ? "active" : ""}`}>
  <div className="layer-item-left">
    <div className="layer-dot" style={{ background: "#f4a261" }}/>
    <span className="layer-symbol">🥧</span>
    <span className="layer-name">Biểu đồ cơ cấu dân tộc</span>
  </div>
  <div className="layer-item-actions">
    {/* Thêm nút mở bảng chọn thủ công */}
    <button className="layer-edit-btn" onClick={onOpenPieSelector} title="Chọn thủ công các xã hiển thị">
      ⚙️
    </button>
    <div className={`layer-toggle ${showEthnicPie ? "on" : ""}`} onClick={onToggleEthnicPie}>
      <div className="layer-toggle-thumb"/>
    </div>
  </div>
</div>
          {onToggleTransect && (
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
          )}
          {onToggleCalendar && (
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
          )}
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

        {/* ← CHÈN KHỐI "+ Thêm nhóm lớp mới" TẠI ĐÂY */}
        <div className="layer-category">
          {addingGroup ? (
            <div className="layer-add-form">
              <div className="laf-row">
                <input className="laf-input laf-symbol" maxLength={2} value={newGroupIcon} onChange={e => setNewGroupIcon(e.target.value)} placeholder="📁"/>
                <input className="laf-input laf-name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Tên nhóm lớp mới..."/>
              </div>
              <div className="laf-row">
                <button className="laf-cancel" onClick={() => setAddingGroup(false)}>Hủy</button>
                <button className="laf-save" onClick={() => {
                  if (!newGroupName.trim()) { alert("Nhập tên nhóm"); return; }
                  onAddCategory(newGroupName.trim(), newGroupIcon || "📁");
                  setNewGroupName(""); setNewGroupIcon("📁"); setAddingGroup(false);
                }}>Tạo nhóm</button>
              </div>
            </div>
          ) : (
            <button className="layer-add-btn" onClick={() => setAddingGroup(true)}>+ Thêm nhóm lớp mới</button>
          )}
        </div>

      </div>
    </div>
  );
}
export type { LayerCategory, LayerToggle };
