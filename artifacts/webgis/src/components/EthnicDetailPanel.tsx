import { useEffect, type Dispatch, type SetStateAction } from "react";
import EditableValue from "./EditableValue";
import type { PdfFile } from "./ImportModal";
import { toEthnicKey } from "./ethnicConfig";
import "./EthnicDetailPanel.css";

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
const assetUrl = (p?: string): string => (!p ? "" : /^(https?:|data:|blob:)/.test(p) ? p : `${BASE_PATH}/${p.replace(/^\//, "")}`);

export interface EpBaiThuoc { ten: string; nguyen_lieu: string; cong_dung: string; }
export interface EpTriThuc { chu_de: string; bieu_tuong: string; noi_dung: string; bai_thuoc: EpBaiThuoc[]; }
export interface EpInfo {
  id: string; ten: string; mau: string; dan_so_ca_nuoc: number; ngon_ngu: string; mo_ta: string;
  tri_thuc: EpTriThuc[]; anh?: string; anh_ghichu?: string; nguon?: string[]; ghi_chu_nguon?: string;
}
export interface EpBar { id: string; label: string; full: string; color: string; value: number; }
export interface EpName { id: string; ten: string; color: string; value: number; }
export interface EpTopicForm { ethId: string; chu_de: string; bieu_tuong: string; noi_dung: string; }

interface Props {
  wardName: string | null;
  bars: EpBar[];
  names: EpName[];
  info: EpInfo;
  triThuc: EpTriThuc[];
  activeTopic: number;
  ethnicPdfs: PdfFile[];
  newTopicForm: EpTopicForm | null;
  onSelectEthnic: (id: string) => void;
  onClose: () => void;
  onEditComposition: (() => void) | null;
  onEthnicField: (id: string, field: "ngon_ngu" | "dan_so_ca_nuoc" | "mo_ta", value: string | number) => void;
  onPickPhoto: (id: string) => void;
  onDeletePhoto: (id: string) => void;
  onOpenPhoto: (url: string) => void;
  onOpenPage: (id: string) => void;
  onOpenTransect: () => void;
  onOpenCalendar: () => void;
  onOpenPdf: (pdf: PdfFile) => void;
  onRemovePdf: (idx: number) => void;
  setActiveTopic: (idx: number) => void;
  setNewTopicForm: Dispatch<SetStateAction<EpTopicForm | null>>;
  onAddTopic: (ethId: string, chu_de: string, bieu_tuong: string, noi_dung: string) => void;
  onUpdateTopicField: (ethId: string, topicIdx: number, field: "bieu_tuong" | "chu_de" | "noi_dung", value: string) => void;
  onRemoveTopic: (ethId: string, topicIdx: number) => void;
  onSetRecipes: (ethId: string, topicIdx: number, recipes: EpBaiThuoc[]) => void;
  onAddRecipe: (ethId: string, topicIdx: number) => void;
}

export default function EthnicDetailPanel(props: Props) {
  const {
    wardName, bars, names, info, triThuc, activeTopic, ethnicPdfs, newTopicForm,
    onSelectEthnic, onClose, onEditComposition, onEthnicField, onPickPhoto, onDeletePhoto,
    onOpenPhoto, onOpenPage, onOpenTransect, onOpenCalendar, onOpenPdf, onRemovePdf,
    setActiveTopic, setNewTopicForm, onAddTopic, onUpdateTopicField, onRemoveTopic, onSetRecipes, onAddRecipe,
  } = props;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const color = info.mau || "#52b788";
  const ethnicKey = toEthnicKey(info.id);
  const topic = triThuc[activeTopic];

  return (
    <div className="ep-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ep-modal">
        {/* ── Header ── */}
        <div className="ep-header" style={{ borderColor: color + "66" }}>
          <span className="ep-dot" style={{ background: color }} />
          <div className="ep-titles">
            <div className="ep-title" style={{ color }}>{info.ten}</div>
            <div className="ep-subtitle">
              {wardName ? `Cơ cấu dân tộc & tri thức bản địa · ${wardName}` : "Cơ cấu dân tộc & tri thức bản địa"}
            </div>
          </div>
          <div className="ep-header-actions">
            <button className="ep-page-link" onClick={() => onOpenPage(info.id)} title="Mở trang chi tiết dân tộc">Xem trang chi tiết →</button>
            <button className="ep-close" onClick={onClose} aria-label="Đóng">✕</button>
          </div>
        </div>

        <div className="ep-body">
          {/* ── Cột trái: Cơ cấu dân tộc ── */}
          <aside className="ep-left">
            <div className="ep-section-title">Cơ cấu dân tộc {wardName ? `· ${wardName}` : "· cả tỉnh"}</div>

            {bars.length > 0 && (
              <div className="ep-bars">
                {bars.map(bar => (
                  <div className="ep-bar" key={bar.id} title={`${bar.full}: ${bar.value}%`}>
                    <span className="ep-bar-value">{bar.value}%</span>
                    <div className="ep-bar-track">
                      <div className="ep-bar-fill" style={{ height: `${Math.max(2, bar.value)}%`, background: bar.color }} />
                    </div>
                    <span className="ep-bar-label">{bar.label}</span>
                  </div>
                ))}
              </div>
            )}

            {names.length > 0 && (
              <>
                <div className="ep-names-title">Danh sách dân tộc · bấm để xem tri thức</div>
                <div className="ep-names">
                  {names.map(item => {
                    if (item.id === "khac") return (
                      <span className="ethnic-name-chip is-static" key={item.id} title={`Dân tộc khác: ${item.value}%`}>
                        <span className="ethnic-name-dot" style={{ background: item.color }} />
                        {item.ten}<b>{item.value}%</b>
                      </span>
                    );
                    const isActive = info.id === item.id;
                    return (
                      <button
                        className={`ethnic-name-chip${isActive ? " is-active" : ""}`}
                        key={item.id}
                        onClick={() => onSelectEthnic(item.id)}
                        title={`Xem tri thức bản địa ${item.ten}`}
                      >
                        <span className="ethnic-name-dot" style={{ background: item.color }} />
                        {item.ten}<b>{item.value}%</b>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="ep-left-footer">
              {onEditComposition && (
                <button className="ep-edit-btn" onClick={onEditComposition} title="Thêm hoặc sửa dân tộc của xã này">
                  ✏️ Sửa cơ cấu dân tộc
                </button>
              )}
              <div className="ep-hint">Thay đổi % dân tộc được áp dụng riêng cho {wardName || "địa phương này"} và lưu tự động.</div>
            </div>
          </aside>

          {/* ── Cột phải: Tri thức của dân tộc này ── */}
          <section className="ep-right">
            <div className="ep-right-label">Tri thức bản địa · {info.ten}</div>

            {info.anh ? (
              <div className="ethnic-photo-wrap" style={{ borderColor: color + "55" }}>
                <img src={assetUrl(info.anh)} alt={info.ten} className="ethnic-photo" onClick={() => onOpenPhoto(assetUrl(info.anh))} loading="lazy" />
                {info.anh_ghichu && <div className="ethnic-photo-credit" style={{ color }}>Nguồn ảnh: {info.anh_ghichu}</div>}
                <div className="ethnic-photo-actions">
                  <button className="ethnic-photo-btn" onClick={() => onPickPhoto(info.id)} title="Đổi ảnh">🔄</button>
                  <button className="ethnic-photo-btn delete" onClick={() => { if (confirm("Xóa ảnh dân tộc này?")) onDeletePhoto(info.id); }} title="Xóa ảnh">🗑️</button>
                </div>
              </div>
            ) : (
              <button className="ethnic-photo-add" onClick={() => onPickPhoto(info.id)} style={{ borderColor: color, color }}>
                📷 Thêm ảnh minh họa cho {info.ten.replace("Dân tộc ", "").replace("Người ", "")}
              </button>
            )}

            <div className="knowledge-header" style={{ borderLeftColor: color }}>
              <div className="knowledge-name-row">
                <div className="knowledge-name" style={{ color }}>{info.ten}</div>
              </div>
              <div className="knowledge-meta-row">
                <EditableValue value={info.ngon_ngu} className="editable-meta" onSave={v => onEthnicField(info.id, "ngon_ngu", v)} />
                <span> · </span>
                <EditableValue value={info.dan_so_ca_nuoc} suffix=" người" type="number" className="editable-meta" onSave={v => onEthnicField(info.id, "dan_so_ca_nuoc", parseInt(v) || 0)} />
              </div>
              <EditableValue value={info.mo_ta} className="knowledge-desc-editable" onSave={v => onEthnicField(info.id, "mo_ta", v)} multiline />
              {!!info.nguon?.length && (
                <details style={{ marginTop: 6, fontSize: 11, opacity: 0.85 }}>
                  <summary style={{ cursor: "pointer" }}>📚 Nguồn tham khảo ({info.nguon.length})</summary>
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>{info.nguon.map((n, i) => (<li key={i}>{n}</li>))}</ul>
                  {info.ghi_chu_nguon && <div style={{ marginTop: 4, color: "#f4a261" }}>{info.ghi_chu_nguon}</div>}
                </details>
              )}
            </div>

            {ethnicKey && (
              <div style={{ display: "flex", gap: 8, margin: "8px 0", flexWrap: "wrap" }}>
                <button className="edit-mode-btn" onClick={onOpenTransect}>⛰️ Lược đồ mặt cắt</button>
                <button className="edit-mode-btn" onClick={onOpenCalendar}>📅 Nông lịch</button>
              </div>
            )}

            {ethnicPdfs.length > 0 && (
              <div className="ethnic-pdf-list">
                {ethnicPdfs.map((pdf, i) => (
                  <div key={i} className="pdf-item">
                    <div className="pdf-info"><span className="pdf-name">{pdf.name}</span></div>
                    <div className="pdf-actions">
                      <button className="pdf-btn view" onClick={() => onOpenPdf(pdf)}>Xem</button>
                      <button className="pdf-btn remove" onClick={() => onRemovePdf(i)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="knowledge-tabs">
              {triThuc.map((tt, i) => (
                <button key={i} className={`knowledge-tab ${activeTopic === i ? "active" : ""}`} style={{ "--tab-color": color } as React.CSSProperties} onClick={() => setActiveTopic(i)}>
                  <span>{tt.bieu_tuong}</span><span>{tt.chu_de}</span>
                </button>
              ))}
              <button className="knowledge-tab add-tab" onClick={() => setNewTopicForm({ ethId: info.id, chu_de: "", bieu_tuong: "📌", noi_dung: "" })} title="Thêm chủ đề mới">+</button>
            </div>

            {newTopicForm?.ethId === info.id && (
              <div className="new-topic-form">
                <div className="ntf-row">
                  <input className="ntf-input small" value={newTopicForm.bieu_tuong} onChange={e => setNewTopicForm(f => f ? { ...f, bieu_tuong: e.target.value } : f)} placeholder="🏺" maxLength={2} />
                  <input className="ntf-input" value={newTopicForm.chu_de} onChange={e => setNewTopicForm(f => f ? { ...f, chu_de: e.target.value } : f)} placeholder="Tên chủ đề tri thức..." />
                </div>
                <textarea className="ntf-textarea" value={newTopicForm.noi_dung} onChange={e => setNewTopicForm(f => f ? { ...f, noi_dung: e.target.value } : f)} placeholder="Mô tả tri thức bản địa về chủ đề này..." rows={3} />
                <div className="ntf-actions">
                  <button className="ntf-cancel" onClick={() => setNewTopicForm(null)}>Hủy</button>
                  <button className="ntf-save" disabled={!newTopicForm.chu_de.trim()} onClick={() => onAddTopic(info.id, newTopicForm.chu_de, newTopicForm.bieu_tuong, newTopicForm.noi_dung)}>Thêm chủ đề</button>
                </div>
              </div>
            )}

            {topic && (
              <div className="knowledge-content">
                <div className="knowledge-topic-header">
                  <div className="knowledge-topic">
                    <EditableValue value={topic.bieu_tuong} className="editable-symbol" onSave={v => onUpdateTopicField(info.id, activeTopic, "bieu_tuong", v)} />
                    <EditableValue value={topic.chu_de} className="editable-topic-name" onSave={v => onUpdateTopicField(info.id, activeTopic, "chu_de", v)} />
                  </div>
                  <button className="topic-delete-btn" onClick={() => onRemoveTopic(info.id, activeTopic)} title="Xóa chủ đề này">🗑️</button>
                </div>
                <EditableValue value={topic.noi_dung} className="knowledge-text-editable" onSave={v => onUpdateTopicField(info.id, activeTopic, "noi_dung", v)} multiline />
                <div className="recipes">
                  <div className="recipes-title-row">
                    <button className="add-recipe-btn" onClick={() => onAddRecipe(info.id, activeTopic)}>+ Thêm</button>
                  </div>
                  {topic.bai_thuoc.map((bt, i) => (
                    <div key={i} className="recipe-card" style={{ borderColor: color + "50" }}>
                      <div className="recipe-name-row">
                        <EditableValue value={bt.ten} className="recipe-name" onSave={v => { const recs = [...topic.bai_thuoc]; recs[i] = { ...recs[i], ten: v }; onSetRecipes(info.id, activeTopic, recs); }} />
                        <button className="recipe-delete-btn" onClick={() => { const recs = topic.bai_thuoc.filter((_, ri) => ri !== i); onSetRecipes(info.id, activeTopic, recs); }}>✕</button>
                      </div>
                      <div className="recipe-row"><span className="recipe-label">Nguyên liệu:</span><EditableValue value={bt.nguyen_lieu} className="recipe-val-edit" onSave={v => { const recs = [...topic.bai_thuoc]; recs[i] = { ...recs[i], nguyen_lieu: v }; onSetRecipes(info.id, activeTopic, recs); }} /></div>
                      <div className="recipe-row"><span className="recipe-label">Công dụng:</span><EditableValue value={bt.cong_dung} className="recipe-val-edit highlight" style={{ color }} onSave={v => { const recs = [...topic.bai_thuoc]; recs[i] = { ...recs[i], cong_dung: v }; onSetRecipes(info.id, activeTopic, recs); }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {triThuc.length === 0 && (
              <div className="ep-no-topic">Chưa có chủ đề tri thức nào — bấm <b>+</b> để thêm chủ đề đầu tiên.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
