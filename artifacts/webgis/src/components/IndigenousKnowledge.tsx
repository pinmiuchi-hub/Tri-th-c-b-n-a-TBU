import { useRef, useState } from "react";
import { fileToDataUrl, resizeDataUrl } from "../utils/imageUtils";

export interface KnowledgeItem { id: string; title: string; text: string; image?: string; }
export interface KnowledgeSection { id: string; title: string; icon: string; color: string; items: KnowledgeItem[]; }

export const DEFAULT_KNOWLEDGE: KnowledgeSection[] = [
  {
    id: "tam_linh",
    title: "Văn hóa & Tâm linh",
    icon: "🏺",
    color: "#9b5de5",
    items: [
      { id: "tl1", title: "Quan niệm về thế giới tâm linh", text: "Người Dao và người Thái tin các nguồn tài nguyên (rừng, đất, nước) đều có thần (ma) cai quản — thần sông, thần rừng. Bất kỳ hành vi vi phạm nào cũng bị trừng phạt bởi đấng linh thiêng, từ đó hình thành sự kiêng nể tự nhiên." },
      { id: "tl2", title: "Hệ thống rừng thiêng, rừng ma", text: "Người Thái và Mông có truyền thống bảo vệ rừng ma (rừng nghĩa địa), rừng thiêng, rừng đầu nguồn. Việc xâm phạm là điều cấm kỵ (taboo), giúp bảo tồn đa dạng sinh học và giữ nguồn nước mà không cần can thiệp hành chính phức tạp." },
      { id: "tl3", title: "Luật tục & Hương ước bản", text: "Cộng đồng tự xây dựng quy tắc ứng xử với thiên nhiên, được truyền miệng hoặc cụ thể hóa trong hương ước bản. Hình thức xử phạt truyền thống (nộp trâu, bò, rượu, buộc rời bản) có tính răn đe cao." }
    ]
  },
  {
    id: "tai_nguyen",
    title: "Quản lý Tài nguyên Thiên nhiên",
    icon: "💧",
    color: "#4895ef",
    items: [
      { id: "tn1", title: "Quản lý nước — Mương · Phai · Lái · Lìn", text: "Người Thái sở hữu tri thức bậc thầy với hệ thống thủy lợi mương–phai–lái–lìn và cọn nước để dẫn nước vào ruộng lúa thung lũng. Có quy ước nghiêm ngặt về việc chia nước công bằng và bảo vệ nguồn nước sinh hoạt khỏi ô nhiễm." },
      { id: "tn2", title: "Quản lý đất theo cây chỉ thị", text: "Phân loại đất dựa trên màu sắc, độ dốc và các loài cây chỉ thị để quyết định cây trồng phù hợp. Chống xói mòn bằng ruộng bậc thang, trồng cây theo đường bình độ, và 'hàng rào xanh' từ cây địa phương." },
      { id: "tn3", title: "Dự báo thời tiết & Nông lịch", text: "Quyết định gieo trồng, thu hoạch dựa vào quan sát mây, sao, sự nở hoa của hoa đào rừng, quả vối chín, hoặc hành vi động vật (cóc kêu, mối đùn hố)." }
    ]
  },
  {
    id: "kinh_te_tuan_hoan",
    title: "Kinh tế Tuần hoàn & Sinh kế Bền vững",
    icon: "♻️",
    color: "#52b788",
    items: [
      { id: "kt1", title: "Mô hình tích hợp VAC / VACR", text: "Vườn – Ao – Chuồng – Rừng là điển hình kinh tế tuần hoàn: phân gia súc làm phân bón cho cây hoặc nuôi cá; phụ phẩm nông nghiệp làm thức ăn gia súc. Chất thải khâu này thành đầu vào khâu khác." },
      { id: "kt2", title: "Tái chế & Xử lý chất thải", text: "Sử dụng biogas từ chất thải chăn nuôi cung cấp năng lượng. Ủ phân hữu cơ (compost) bằng vi sinh vật từ rơm rạ, thân ngô, vỏ cà phê để bón ngược lại cho đất dốc — giảm chi phí và bảo vệ môi trường." },
      { id: "kt3", title: "Canh tác xen canh & luân canh", text: "Trồng xen cây họ đậu (đỗ nho nhe, lạc) với ngô, sắn hoặc cà phê để cố định đạm, cải thiện độ phì của đất và đa dạng hóa thu nhập." },
      { id: "kt4", title: "Khai thác lâm sản phụ dưới tán rừng", text: "Mô hình nuôi ong quy mô lớn tại Thuận Châu, Sông Mã; trồng cây dược liệu dưới tán rừng — vừa bảo vệ rừng vừa tạo sinh kế bền vững." }
    ]
  },
  {
    id: "to_chuc_cong_dong",
    title: "Tổ chức & Ra quyết định Cộng đồng",
    icon: "👥",
    color: "#f4a261",
    items: [
      { id: "td1", title: "Vai trò người đứng đầu", text: "Già làng, trưởng bản, người có uy tín giữ tri thức và đóng vai trò trọng tài trong việc phân chia đất đai, giải quyết tranh chấp và duy trì các nghi lễ liên quan đến tài nguyên." },
      { id: "td2", title: "Hợp tác xã & nhóm cùng sở thích", text: "Mô hình HTX nông nghiệp (như HTX 19/5 tại Mộc Châu) tập hợp các hộ gia đình để cùng quyết định quy trình sản xuất an toàn (VietGAP, GlobalGAP) và kết nối chuỗi giá trị." },
      { id: "td3", title: "Phát triển du lịch cộng đồng", text: "Lồng ghép tri thức bản địa vào du lịch (hái quả, dệt thổ cẩm) để cộng đồng có thêm nguồn thu tái đầu tư vào việc bảo tồn văn hóa và tài nguyên thiên nhiên." }
    ]
  }
];

interface Props {
  onClose: () => void;
  data: KnowledgeSection[];
  onChange: (data: KnowledgeSection[]) => void;
}

const newId = () => Math.random().toString(36).slice(2, 9);

export default function IndigenousKnowledge({ onClose, data, onChange }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const pendingTarget = useRef<{ si: number; ii: number } | null>(null);

  const updateSection = (si: number, patch: Partial<KnowledgeSection>) => {
    onChange(data.map((s, i) => i === si ? { ...s, ...patch } : s));
  };
  const updateItem = (si: number, ii: number, patch: Partial<KnowledgeItem>) => {
    onChange(data.map((s, i) => i === si ? { ...s, items: s.items.map((it, j) => j === ii ? { ...it, ...patch } : it) } : s));
  };
  const pickItemImage = (si: number, ii: number) => {
    pendingTarget.current = { si, ii };
    imgInputRef.current?.click();
  };
  const handleImgChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const target = pendingTarget.current;
    pendingTarget.current = null;
    if (!file || !target) return;
    if (!file.type.startsWith("image/")) { alert("Vui lòng chọn tệp ảnh"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Ảnh quá lớn (tối đa 5 MB)"); return; }
    try {
      const dataUrl = await fileToDataUrl(file);
      const small = await resizeDataUrl(dataUrl, 1024);
      updateItem(target.si, target.ii, { image: small });
    } catch { alert("Không đọc được tệp ảnh"); }
  };
  const removeItemImage = (si: number, ii: number) => updateItem(si, ii, { image: undefined });
  const addItem = (si: number) => {
    onChange(data.map((s, i) => i === si ? { ...s, items: [...s.items, { id: newId(), title: "Tiêu đề mới", text: "Mô tả nội dung..." }] } : s));
  };
  const removeItem = (si: number, ii: number) => {
    onChange(data.map((s, i) => i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s));
  };
  const addSection = () => {
    onChange([...data, { id: newId(), title: "Khía cạnh mới", icon: "📌", color: "#74c69d", items: [] }]);
  };
  const removeSection = (si: number) => {
    if (!confirm(`Xóa khía cạnh "${data[si].title}"?`)) return;
    onChange(data.filter((_, i) => i !== si));
  };

  return (
    <div className="transect-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="transect-modal knowledge-modal">
        <div className="transect-header">
          <div className="transect-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Tri thức & văn hóa bản địa — Sơn La & Tây Bắc
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
            Các khía cạnh của tri thức và văn hóa bản địa trong việc ra quyết định quản lý tài nguyên và phát triển kinh tế tuần hoàn
            {editMode && <span className="edit-hint-inline"> · Click vào tiêu đề/nội dung để chỉnh sửa</span>}
          </p>

          <div className="ik-grid">
            {data.map((section, si) => (
              <div key={section.id} className="ik-section" style={{ borderTopColor: section.color }}>
                <div className="ik-section-header" style={{ background: section.color + "12" }}>
                  {editMode ? (
                    <div className="ik-section-edit">
                      <input className="ik-icon-input" maxLength={2} value={section.icon} onChange={e => updateSection(si, { icon: e.target.value })}/>
                      <input className="ik-section-title-input" value={section.title} onChange={e => updateSection(si, { title: e.target.value })} style={{ color: section.color }}/>
                      <input type="color" className="ik-color-input" value={section.color} onChange={e => updateSection(si, { color: e.target.value })}/>
                      <button className="remove-group-btn" onClick={() => removeSection(si)} title="Xóa khía cạnh">🗑️</button>
                    </div>
                  ) : (
                    <div className="ik-section-head-view">
                      <span className="ik-section-icon" style={{ background: section.color }}>{section.icon}</span>
                      <span className="ik-section-title" style={{ color: section.color }}>{section.title}</span>
                    </div>
                  )}
                </div>
                <div className="ik-items">
                  {section.items.length === 0 && !editMode && (
                    <div className="ik-empty">Chưa có nội dung.</div>
                  )}
                  {section.items.map((it, ii) => (
                    <div key={it.id} className="ik-item">
                      {editMode ? (
                        <>
                          <div className="ik-item-head">
                            <input className="ik-item-title-input" value={it.title} onChange={e => updateItem(si, ii, { title: e.target.value })}/>
                            <button className="ik-item-del" onClick={() => removeItem(si, ii)} title="Xóa mục">✕</button>
                          </div>
                          <textarea className="ik-item-text-input" value={it.text} onChange={e => updateItem(si, ii, { text: e.target.value })} rows={3}/>
                          <div className="ik-item-image-edit">
                            {it.image ? (
                              <div className="ik-item-image-preview">
                                <img src={it.image} alt=""/>
                                <div className="ik-item-image-actions">
                                  <button type="button" onClick={() => pickItemImage(si, ii)} title="Đổi ảnh">🔄 Đổi</button>
                                  <button type="button" onClick={() => removeItemImage(si, ii)} title="Xóa ảnh">🗑️ Xóa</button>
                                </div>
                              </div>
                            ) : (
                              <button type="button" className="ik-item-add-image" onClick={() => pickItemImage(si, ii)} style={{ borderColor: section.color, color: section.color }}>
                                📷 Thêm ảnh minh họa
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {it.image && (
                            <img className="ik-item-image" src={it.image} alt={it.title} onClick={() => setLightbox(it.image!)} loading="lazy"/>
                          )}
                          <div className="ik-item-title" style={{ color: section.color }}>{it.title}</div>
                          <div className="ik-item-text">{it.text}</div>
                        </>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <button className="ik-add-item-btn" onClick={() => addItem(si)} style={{ borderColor: section.color, color: section.color }}>
                      + Thêm nội dung
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editMode && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <button className="add-group-btn" onClick={addSection}>+ Thêm khía cạnh mới</button>
            </div>
          )}
        </div>
      </div>
      <input ref={imgInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" style={{ display: "none" }} onChange={handleImgChosen}/>
      {lightbox && (
        <div className="ik-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt=""/>
          <button className="ik-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
