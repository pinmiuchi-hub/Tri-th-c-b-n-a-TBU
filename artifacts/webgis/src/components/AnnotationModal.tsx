import { useState } from "react";

export interface Annotation {
  id: string;
  loai: "diem" | "duong" | "vung";
  ten: string;
  mo_ta: string;
  nhom: string;
  mau: string;
  coords: [number, number][];
  ngay: string;
}

interface Props {
  coords: [number, number][];
  loai: "diem" | "duong" | "vung";
  onSave: (ann: Annotation) => void;
  onCancel: () => void;
}

const NHOM_OPTIONS = [
  { value: "tai_nguyen_nuoc", label: "💧 Tài nguyên nước" },
  { value: "rung", label: "🌲 Rừng & Thực vật" },
  { value: "canh_tac", label: "🌾 Khu vực canh tác" },
  { value: "ban_lang", label: "🏘️ Bản làng & Dân cư" },
  { value: "van_hoa", label: "🏺 Văn hóa & Tâm linh" },
  { value: "cay_thuoc", label: "🌿 Cây thuốc quý" },
  { value: "luat_tuc", label: "⚖️ Ranh giới luật tục" },
  { value: "vac_vacr", label: "♻️ Mô hình VAC/VACR" },
  { value: "khac", label: "📍 Khác" },
];

const MAU_OPTIONS = ["#e63946","#f4a261","#2a9d8f","#4895ef","#52b788","#b5179e","#e9c46a","#264653","#6d6875"];

export default function AnnotationModal({ coords, loai, onSave, onCancel }: Props) {
  const [ten, setTen] = useState("");
  const [mo_ta, setMo_ta] = useState("");
  const [nhom, setNhom] = useState("khac");
  const [mau, setMau] = useState("#e63946");

  const loaiLabel = { diem: "Điểm", duong: "Đường/Tuyến", vung: "Vùng/Khu vực" }[loai];

  return (
    <div className="annotation-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="annotation-modal">
        <div className="ann-modal-header">
          <span>Thêm đối tượng — {loaiLabel}</span>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="ann-modal-body">
          <div className="ann-coord-badge">
            {loai === "diem" && coords[0] && `📍 ${coords[0][0].toFixed(5)}°N, ${coords[0][1].toFixed(5)}°E`}
            {loai !== "diem" && `${coords.length} điểm`}
          </div>

          <div className="ann-field">
            <label>Tên đối tượng *</label>
            <input className="ann-input" value={ten} onChange={e=>setTen(e.target.value)} placeholder="VD: Rừng thiêng Bản Phiêng, Suối Nậm Na..." autoFocus/>
          </div>

          <div className="ann-field">
            <label>Nhóm đối tượng</label>
            <select className="ann-select" value={nhom} onChange={e=>setNhom(e.target.value)}>
              {NHOM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="ann-field">
            <label>Màu hiển thị</label>
            <div className="ann-colors">
              {MAU_OPTIONS.map(c => (
                <div key={c} className={`ann-color-dot ${mau===c?"selected":""}`} style={{background:c}} onClick={()=>setMau(c)}/>
              ))}
            </div>
          </div>

          <div className="ann-field">
            <label>Mô tả / Tri thức bản địa</label>
            <textarea className="ann-textarea" value={mo_ta} onChange={e=>setMo_ta(e.target.value)} placeholder="Thông tin về đối tượng, tri thức bản địa, luật tục liên quan..." rows={3}/>
          </div>

          <div className="ann-actions">
            <button className="ann-btn-cancel" onClick={onCancel}>Hủy</button>
            <button className="ann-btn-save" disabled={!ten.trim()} onClick={() => onSave({
              id: `ann_${Date.now()}`, loai, ten: ten.trim(), mo_ta, nhom, mau, coords, ngay: new Date().toLocaleDateString("vi-VN")
            })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Lưu đối tượng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
