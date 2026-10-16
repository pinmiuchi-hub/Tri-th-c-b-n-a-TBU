import { useState } from "react";

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  options?: string[];
  optionLabels?: Record<string, string>;
  required?: boolean;
}

interface Props {
  layerId: string;
  layerName: string;
  layerColor: string;
  onRenameLayer: (name: string) => void;
  features: any[];
  geomType: "point" | "line" | "polygon";
  dragMode: boolean;
  onToggleDrag: () => void;
  onAdd: (feature: any) => void;
  onUpdate: (idx: number, feature: any) => void;
  onDelete: (idx: number) => void;
  onClose: () => void;
  mapCenter: [number, number];
  onFlyTo: (lat: number, lng: number) => void;
  /** Activate map-pick mode: parent listens for next map click and calls cb with the coords. */
  onPickPoint: (cb: (lat: number, lng: number) => void) => void;
  /** Activate draw mode: parent delivers completed geometry coords ([[lng, lat], ...]) via cb. */
  onDrawGeom: (geom: "duong" | "vung", cb: (coords: [number, number][]) => void) => void;
  /** When true, the editor visually hides itself (still mounted) so the map is clickable. */
  hidden?: boolean;
}

const FOREST_LABELS: Record<string, string> = { rung_thieng: "Rừng thiêng", rung_ma: "Rừng ma", rung_dau_nguon: "Rừng đầu nguồn", rung_trong: "Rừng trồng", rung_tu_nhien: "Rừng tự nhiên", rung_dac_san: "Rừng đặc sản" };
const IRRIGATION_LABELS: Record<string, string> = { phai: "Phai (đập)", muong: "Mương (kênh)", lin: "Lịn (máng)", lai: "Lái (kênh phụ)" };
const ZONE_LABELS: Record<string, string> = { cam_san_ban: "Cấm săn bắt", bao_ve_nuoc: "Bảo vệ nguồn nước", luat_tuc_rung: "Luật tục rừng", luan_canh: "Luân canh", cam_rung: "Cấm chặt phá rừng", bao_ve_dac_san: "Bảo vệ sản vật đặc sản" };

const FIELD_CONFIG: Record<string, FieldDef[]> = {
  rivers: [
    { key: "ten", label: "Tên sông", type: "text", required: true },
    { key: "ten_dia_phuong", label: "Tên địa phương", type: "text" },
  ],
  irrigation: [
    { key: "ten", label: "Tên công trình", type: "text", required: true },
    { key: "ten_dia_phuong", label: "Tên địa phương", type: "text" },
    { key: "loai", label: "Loại", type: "select", options: ["phai", "muong", "lin", "lai"], optionLabels: IRRIGATION_LABELS },
    { key: "lat", label: "Vĩ độ", type: "number" },
    { key: "lng", label: "Kinh độ", type: "number" },
    { key: "mo_ta", label: "Mô tả", type: "textarea" },
  ],
  forests: [
    { key: "ten", label: "Tên khu rừng", type: "text", required: true },
    { key: "ten_dia_phuong", label: "Tên địa phương", type: "text" },
    { key: "loai", label: "Loại", type: "select", options: ["rung_thieng", "rung_ma", "rung_dau_nguon", "rung_trong", "rung_tu_nhien", "rung_dac_san"], optionLabels: FOREST_LABELS },
    { key: "lat", label: "Vĩ độ", type: "number" },
    { key: "lng", label: "Kinh độ", type: "number" },
    { key: "mo_ta", label: "Mô tả & luật tục", type: "textarea" },
  ],
  vac_models: [
    { key: "ten", label: "Tên mô hình", type: "text", required: true },
    { key: "loai", label: "Loại", type: "select", options: ["VAC", "VACR", "vac", "vacr", "lua_ca_vit"], optionLabels: { vac: "VAC (viết thường)", vacr: "VACR (viết thường)", lua_ca_vit: "Lúa – Cá – Vịt" } },
    { key: "lat", label: "Vĩ độ", type: "number" },
    { key: "lng", label: "Kinh độ", type: "number" },
    { key: "thanh_phan", label: "Thành phần (cách nhau dấu phẩy)", type: "text" },
    { key: "mo_ta", label: "Mô tả", type: "textarea" },
  ],
  medicinal_plants: [
    { key: "ten", label: "Tên cây thuốc", type: "text", required: true },
    { key: "ten_khoa_hoc", label: "Tên khoa học", type: "text" },
    { key: "lat", label: "Vĩ độ", type: "number" },
    { key: "lng", label: "Kinh độ", type: "number" },
    { key: "cong_dung", label: "Công dụng", type: "textarea" },
    { key: "tinh_trang", label: "Tình trạng", type: "select", options: ["Chưa xác minh", "Đã xác minh"], optionLabels: { "Chưa xác minh": "Chưa xác minh (chưa đối chiếu nguồn)", "Đã xác minh": "Đã xác minh" } },
    { key: "dan_toc_dung", label: "Dân tộc sử dụng (cách nhau dấu phẩy)", type: "text" },
  ],
  customary_zones: [
    { key: "ten", label: "Tên khu vực", type: "text", required: true },
    { key: "loai", label: "Loại", type: "select", options: ["cam_san_ban", "bao_ve_nuoc", "luat_tuc_rung", "luan_canh", "cam_rung", "bao_ve_dac_san"], optionLabels: ZONE_LABELS },
    { key: "mo_ta", label: "Mô tả", type: "textarea" },
  ],
};

function getFields(layerId: string, geomType: "point" | "line" | "polygon"): FieldDef[] {
  if (FIELD_CONFIG[layerId]) return FIELD_CONFIG[layerId];
  // Generic fallback for custom layers
  const base: FieldDef[] = [
    { key: "ten", label: "Tên", type: "text", required: true },
    { key: "mo_ta", label: "Mô tả", type: "textarea" },
  ];
  if (geomType === "point") {
    base.push({ key: "lat", label: "Vĩ độ", type: "number" });
    base.push({ key: "lng", label: "Kinh độ", type: "number" });
  }
  return base;
}

function emptyFeature(layerId: string, mapCenter: [number, number], geomType: "point" | "line" | "polygon"): any {
  const fields = getFields(layerId, geomType);
  const obj: any = {};
  fields.forEach(f => {
    if (f.type === "number") obj[f.key] = 0;
    else obj[f.key] = "";
  });
  const cLat = mapCenter[0];
  const cLng = mapCenter[1];
  if (geomType === "point") {
    obj.lat = cLat;
    obj.lng = cLng;
  } else if (geomType === "line") {
    // Quy ước toàn app: coords là mảng [lng, lat]
    obj.coords = [[cLng, cLat], [cLng + 0.05, cLat + 0.05]];
  } else if (geomType === "polygon") {
    obj.coords = [[
      [cLng, cLat],
      [cLng + 0.05, cLat],
      [cLng + 0.05, cLat + 0.05],
      [cLng, cLat + 0.05],
    ]];
  }
  return obj;
}

export default function LayerDataEditor(props: Props) {
  const { layerId, layerName, layerColor, onRenameLayer, features, geomType, dragMode, onToggleDrag, onAdd, onUpdate, onDelete, onClose, mapCenter, onFlyTo, onPickPoint, onDrawGeom, hidden } = props;
  const fields = getFields(layerId, geomType);
  const [showAdd, setShowAdd] = useState(false);
  const [newFeat, setNewFeat] = useState<any>(() => emptyFeature(layerId, mapCenter, geomType));
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const handleAddSubmit = () => {
    if (!newFeat.ten || !newFeat.ten.trim()) {
      alert("Vui lòng nhập tên đối tượng");
      return;
    }
    onAdd(newFeat);
    setNewFeat(emptyFeature(layerId, mapCenter, geomType));
    setShowAdd(false);
  };

  const renderField = (field: FieldDef, value: any, onChange: (v: any) => void) => {
    if (field.type === "select") {
      return (
        <select className="lde-input" value={value || ""} onChange={e => onChange(e.target.value)}>
          <option value="">-- chọn --</option>
          {field.options?.map(opt => <option key={opt} value={opt}>{field.optionLabels?.[opt] || opt}</option>)}
        </select>
      );
    }
    if (field.type === "textarea") {
      return <textarea className="lde-input lde-textarea" value={value || ""} onChange={e => onChange(e.target.value)} rows={2}/>;
    }
    if (field.type === "number") {
      return <input className="lde-input" type="number" step="0.000001" value={value ?? ""} onChange={e => onChange(parseFloat(e.target.value) || 0)}/>;
    }
    return <input className="lde-input" type="text" value={value || ""} onChange={e => onChange(e.target.value)}/>;
  };

  return (
    <div className="lde-overlay" style={hidden ? { display: "none" } : undefined} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lde-modal">
        <div className="lde-header">
          <div className="lde-header-left">
            <div className="lde-color-dot" style={{ background: layerColor }}/>
            <div>
              <div className="lde-title">Sửa dữ liệu lớp</div>
              <div className="lde-layer-name"><input value={layerName} onChange={e => onRenameLayer(e.target.value)} aria-label="Tên lớp" /></div>
            </div>
          </div>
          <button className="lde-close" onClick={onClose}>✕</button>
        </div>

        <div className="lde-toolbar">
          <button className={`lde-btn lde-btn-add ${showAdd ? "active" : ""}`} onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? "✕ Hủy" : "+ Thêm đối tượng"}
          </button>
          {geomType === "point" && (
            <button className={`lde-btn lde-btn-drag ${dragMode ? "active" : ""}`} onClick={onToggleDrag}>
              {dragMode ? "🔒 Tắt kéo thả" : "✋ Bật kéo thả trên bản đồ"}
            </button>
          )}
          <span className="lde-count">{features.length} đối tượng</span>
        </div>

        {showAdd && (
          <div className="lde-add-form">
            <div className="lde-form-title">Thêm đối tượng mới</div>
            {fields.map(f => (
              <div key={f.key} className="lde-field">
                <label className="lde-label">{f.label}{f.required && " *"}</label>
                {renderField(f, newFeat[f.key], v => setNewFeat({ ...newFeat, [f.key]: v }))}
              </div>
            ))}
            {geomType === "point" && (
              <button
                type="button"
                className="lde-btn lde-btn-pick"
                onClick={() => onPickPoint((lat, lng) => setNewFeat((prev: any) => ({ ...prev, lat, lng })))}
                title="Click vào vị trí trên bản đồ để lấy tọa độ"
              >
                📍 Chọn vị trí trên bản đồ
              </button>
            )}
            {geomType !== "point" && (
              <button
                type="button"
                className="lde-btn lde-btn-pick"
                onClick={() => onDrawGeom(geomType === "line" ? "duong" : "vung", coords => setNewFeat((prev: any) => ({ ...prev, coords: geomType === "polygon" ? [coords] : coords })))}
                title="Vẽ hình trên bản đồ: click để thêm điểm, double-click để kết thúc"
              >
                ✏️ Vẽ hình trên bản đồ
              </button>
            )}
            {geomType !== "point" && (
              <div className="lde-hint">
                💡 Click để thêm đỉnh, double-click để kết thúc. Nếu chưa vẽ, đối tượng sẽ được tạo với hình mặc định nhỏ tại trung tâm bản đồ.
              </div>
            )}
            <button className="lde-btn lde-btn-primary" onClick={handleAddSubmit}>Lưu đối tượng</button>
          </div>
        )}

        <div className="lde-list">
          {features.length === 0 && (
            <div className="lde-empty">Chưa có đối tượng nào. Click "+ Thêm đối tượng" để bắt đầu.</div>
          )}
          {features.map((feat, idx) => {
            const expanded = expandedIdx === idx;
            return (
              <div key={idx} className={`lde-item ${expanded ? "expanded" : ""}`}>
                <div className="lde-item-row">
                  <div className="lde-item-name" onClick={() => setExpandedIdx(expanded ? null : idx)}>
                    <span className="lde-item-arrow">{expanded ? "▼" : "▶"}</span>
                    <span>{feat.ten || "(chưa đặt tên)"}</span>
                    {feat.ten_dia_phuong && <span className="lde-item-sub">— {feat.ten_dia_phuong}</span>}
                  </div>
                  <div className="lde-item-actions">
                    {geomType === "point" && feat.lat && feat.lng && (
                      <button className="lde-icon-btn" onClick={() => onFlyTo(feat.lat, feat.lng)} title="Bay đến vị trí">
                        🎯
                      </button>
                    )}
                    <button className="lde-icon-btn lde-icon-delete" onClick={() => {
                      if (confirm(`Xóa "${feat.ten || "đối tượng này"}"?`)) onDelete(idx);
                    }} title="Xóa">
                      🗑️
                    </button>
                  </div>
                </div>
                {expanded && (
                  <div className="lde-item-detail">
                    {fields.map(f => (
                      <div key={f.key} className="lde-field">
                        <label className="lde-label">{f.label}</label>
                        {renderField(f, feat[f.key], v => onUpdate(idx, { ...feat, [f.key]: v }))}
                      </div>
                    ))}
                    {geomType === "point" && (
                      <div className="lde-coord-info">
                        📍 Vị trí: {feat.lat?.toFixed(6)}, {feat.lng?.toFixed(6)}
                        <button
                          type="button"
                          className="lde-btn lde-btn-pick lde-btn-pick-sm"
                          onClick={() => onPickPoint((lat, lng) => onUpdate(idx, { ...feat, lat, lng }))}
                          title="Click vào vị trí mới trên bản đồ"
                        >
                          📍 Đổi vị trí trên bản đồ
                        </button>
                        {dragMode && <div className="lde-drag-hint">✋ Đang ở chế độ kéo thả — kéo điểm trên bản đồ để di chuyển</div>}
                      </div>
                    )}
                    {geomType !== "point" && feat.coords && (
                      <div className="lde-coord-info">
                        📐 {geomType === "line" ? "Đường gồm" : "Vùng gồm"} {Array.isArray(feat.coords[0][0]) ? feat.coords[0].length : feat.coords.length} điểm
                        <button
                          type="button"
                          className="lde-btn lde-btn-pick lde-btn-pick-sm"
                          onClick={() => onDrawGeom(geomType === "line" ? "duong" : "vung", coords => onUpdate(idx, { ...feat, coords: geomType === "polygon" ? [coords] : coords }))}
                          title="Vẽ lại hình trên bản đồ"
                        >
                          ✏️ Vẽ lại trên bản đồ
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
