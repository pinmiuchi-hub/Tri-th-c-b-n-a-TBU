import { useState } from "react";
import { ETHNIC_KEYS, ETHNIC_META, ethnicTabStyle, CALENDAR_SOURCES, CALENDAR_NOTE, type EthnicKey } from "./ethnicConfig";

const N_MUONG_LAICHAU = "Báo Nông nghiệp & Môi trường: Lai Châu vệ sinh đồng, nạo vét mương từ đầu tháng 1";
const N_LUA_XUAN = "Báo Lào Cai / Báo Nông nghiệp & Môi trường: gieo cấy lúa xuân quanh Lập xuân, hoàn thành trong tháng 3";
const N_XEN = "Báo Văn hóa (Pắc Ngà), VOV: Xên bản/Xên mường vào khoảng tháng Giêng âm lịch, tháng 2–3 dương lịch";
const N_HOABAN = "Báo Pháp luật: hoa ban nở, lễ hội Mùa hoa ban Sơn La tháng 3";
const N_NAOPE = "Viet Nam News / SGGP: Tết Mông cuối tháng 11–đầu tháng 12 âm lịch";
const N_GAUTAO = "Báo Văn hóa: Gầu Tào tổ chức từ mùng 1 đến rằm tháng Giêng âm lịch";
const N_THAOQUA = "Báo Pháp luật: thảo quả thu hái khoảng tháng 11–12";
const N_TET = "Lịch âm–dương: Tết Nguyên Đán rơi vào cuối tháng 1 đến giữa tháng 2 dương lịch";

export interface CalendarActivity { ten: string; months: number[]; color: string; nguon?: string; }
export interface CalendarGroup { nhom: string; mau: string; activities: CalendarActivity[]; }

export const DEFAULT_ACTIVITIES_BY_ETHNIC: Record<EthnicKey, CalendarGroup[]> = {
  thai: [
    { nhom: "🌾 Lúa nước", mau: "#52b788", activities: [
      { ten: "Làm đất, tu sửa mương-phai", months: [1,2], color: "#74c69d", nguon: N_MUONG_LAICHAU },
      { ten: "Gieo mạ, cấy lúa vụ xuân", months: [2,3], color: "#40916c", nguon: N_LUA_XUAN },
      { ten: "Chăm sóc, làm cỏ", months: [4,5,6,7], color: "#52b788" },
      { ten: "Thu hoạch lúa xuân", months: [6,7], color: "#b7e4c7" },
      { ten: "Cấy lúa mùa", months: [6,7], color: "#40916c" },
      { ten: "Thu hoạch lúa mùa + Ủ phân hữu cơ", months: [10,11], color: "#b7e4c7" },
      { ten: "Lễ cúng cơm mới, xuống đồng", months: [11,12], color: "#d8f3dc" },
    ]},
    { nhom: "🌲 Lâm sản & Rừng", mau: "#2d6a4f", activities: [
      { ten: "Thu hái lâm sản phụ (măng, rau)", months: [4,5,6,7,8], color: "#52b788" },
      { ten: "Thu hái chè Shan tuyết", months: [3,4,5,9,10], color: "#40916c" },
      { ten: "Trồng rừng, tu bổ", months: [2,3,7,8], color: "#74c69d" },
    ]},
    { nhom: "🐟 Thủy sản & Chăn nuôi", mau: "#4895ef", activities: [
      { ten: "Thả cá (ruộng, ao)", months: [4,5,6], color: "#4895ef" },
      { ten: "Đánh bắt cá suối (mùa khô)", months: [12,1,2,3], color: "#023e8a" },
      { ten: "Thu hoạch cá ao-ruộng", months: [10,11], color: "#4895ef" },
      { ten: "Mổ lợn, trữ thịt dịp Tết", months: [12,1], color: "#e07070" },
    ]},
    { nhom: "🌿 Cây thuốc & Thu hái", mau: "#e63946", activities: [
      { ten: "Thu hái lá cây thuốc tươi", months: [5,6,7,8,9], color: "#52b788" },
      { ten: "Thu hoạch củ, rễ cây thuốc", months: [10,11,12], color: "#e63946" },
      { ten: "Sơ chế, phơi sấy thuốc", months: [10,11,12,1], color: "#f4a261" },
      { ten: "Tắm lá sau sinh (quanh năm)", months: [1,2,3,4,5,6,7,8,9,10,11,12], color: "#74c69d" },
    ]},
    { nhom: "🎊 Lễ hội & Văn hóa", mau: "#ffd166", activities: [
      { ten: "Tết Nguyên Đán", months: [1,2], color: "#ffd166", nguon: N_TET },
      { ten: "Lễ Xên Bản, Xên Mường (cúng bản, cúng mường)", months: [2,3], color: "#f4a261", nguon: N_XEN },
      { ten: "Lễ hội Hoa Ban", months: [2,3], color: "#ff9ef5", nguon: N_HOABAN },
      { ten: "Lễ xuống đồng (cầu mùa)", months: [2,3], color: "#b7e4c7" },
      { ten: "Lễ cúng rừng thiêng", months: [3,4], color: "#2d6a4f" },
    ]},
  ],
  mong: [
    { nhom: "⛰️ Nương rẫy", mau: "#b5179e", activities: [
      { ten: "Phát nương, đốt rẫy", months: [2,3], color: "#e9c46a" },
      { ten: "Trồng ngô lần 1", months: [3,4], color: "#f4a261" },
      { ten: "Thu hoạch ngô đợt 1", months: [7,8], color: "#e76f51" },
      { ten: "Trồng ngô lần 2 + Đậu tương", months: [8,9], color: "#f4a261" },
      { ten: "Thu hoạch ngô + Sắn", months: [11,12,1], color: "#e76f51" },
    ]},
    { nhom: "🌲 Lâm sản & Rừng", mau: "#2d6a4f", activities: [
      { ten: "Thu hái lâm sản phụ (măng, rau)", months: [4,5,6,7,8], color: "#52b788" },
      { ten: "Thu hoạch thảo quả", months: [11,12], color: "#1b4332", nguon: N_THAOQUA },
      { ten: "Thu hái chè Shan tuyết", months: [3,4,5,9,10], color: "#40916c" },
      { ten: "Trồng rừng, tu bổ", months: [2,3,7,8], color: "#74c69d" },
    ]},
    { nhom: "🌿 Cây thuốc & Thu hái", mau: "#e63946", activities: [
      { ten: "Thu hái lá cây thuốc tươi", months: [5,6,7,8,9], color: "#52b788" },
      { ten: "Thu hoạch củ, rễ cây thuốc", months: [10,11,12], color: "#e63946" },
      { ten: "Sơ chế, phơi sấy thuốc", months: [10,11,12,1], color: "#f4a261" },
    ]},
    { nhom: "🎊 Lễ hội & Văn hóa", mau: "#ffd166", activities: [
      { ten: "Tết Mông (Nào Pê Chầu)", months: [12,1], color: "#9b5de5", nguon: N_NAOPE },
      { ten: "Lễ Gầu Tào", months: [2,3], color: "#9b5de5", nguon: N_GAUTAO },
      { ten: "Lễ cúng rừng thiêng", months: [3,4], color: "#2d6a4f" },
    ]},
  ],
  // Dữ liệu khởi tạo — cần xác minh với cộng đồng người Mường tại địa phương rồi chỉnh sửa trực tiếp trong modal
  muong: [
    { nhom: "🌾 Lúa nước", mau: "#52b788", activities: [
      { ten: "Làm đất, tu sửa mương", months: [1,2], color: "#74c69d", nguon: N_MUONG_LAICHAU },
      { ten: "Gieo mạ, cấy lúa vụ xuân", months: [2,3], color: "#40916c", nguon: N_LUA_XUAN },
      { ten: "Chăm sóc, làm cỏ", months: [4,5,6,7], color: "#52b788" },
      { ten: "Thu hoạch lúa", months: [6,7,10,11], color: "#b7e4c7" },
    ]},
    { nhom: "🌲 Lâm sản & Rừng", mau: "#2d6a4f", activities: [
      { ten: "Thu hái lâm sản phụ (măng, rau)", months: [4,5,6,7,8], color: "#52b788" },
    ]},
    { nhom: "🎊 Lễ hội & Văn hóa", mau: "#ffd166", activities: [
      { ten: "Tết Nguyên Đán", months: [1,2], color: "#ffd166", nguon: N_TET },
      { ten: "Lễ xuống đồng (cầu mùa)", months: [2,3], color: "#b7e4c7" },
    ]},
  ],
};

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

interface Props {
  onClose: () => void;
  /** Dân tộc được chọn sẵn khi mở modal (từ bảng thông tin dân tộc) */
  initialEthnic: EthnicKey;
  dataByEthnic: Record<EthnicKey, CalendarGroup[]>;
  onChange: (ethnic: EthnicKey, data: CalendarGroup[]) => void;
}

export default function SeasonalCalendar({ onClose, initialEthnic, dataByEthnic, onChange: onChangeEthnic }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [ethnic, setEthnic] = useState<EthnicKey>(initialEthnic);
  const data = dataByEthnic[ethnic] ?? [];
  const meta = ETHNIC_META[ethnic];
  const onChange = (d: CalendarGroup[]) => onChangeEthnic(ethnic, d);

  const updateGroup = (gi: number, patch: Partial<CalendarGroup>) => onChange(data.map((g, i) => i === gi ? { ...g, ...patch } : g));
  const updateActivity = (gi: number, ai: number, patch: Partial<CalendarActivity>) =>
    onChange(data.map((g, i) => i === gi ? { ...g, activities: g.activities.map((a, j) => j === ai ? { ...a, ...patch } : a) } : g));
  const toggleMonth = (gi: number, ai: number, month: number) => {
    const act = data[gi].activities[ai];
    const months = act.months.includes(month) ? act.months.filter(m => m !== month) : [...act.months, month].sort((a, b) => a - b);
    updateActivity(gi, ai, { months });
  };
  const addActivity = (gi: number) => onChange(data.map((g, i) => i === gi ? { ...g, activities: [...g.activities, { ten: "Hoạt động mới", months: [], color: g.mau }] } : g));
  const removeActivity = (gi: number, ai: number) => onChange(data.map((g, i) => i === gi ? { ...g, activities: g.activities.filter((_, j) => j !== ai) } : g));
  const addGroup = () => onChange([...data, { nhom: "📌 Nhóm hoạt động mới", mau: "#74c69d", activities: [] }]);
  const removeGroup = (gi: number) => {
    if (!confirm(`Xóa nhóm "${data[gi].nhom}"?`)) return;
    onChange(data.filter((_, i) => i !== gi));
  };

  return (
    <div className="transect-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="transect-modal calendar-modal">
        <div className="transect-header">
          <div className="transect-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Nông lịch bản địa — Người {meta.ten}
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
            Lịch hoạt động nông nghiệp, lâm nghiệp, lễ hội theo tháng dương lịch của người {meta.ten}
            {editMode && <span className="edit-hint-inline"> · Click ô tháng để bật/tắt · Sửa tên trực tiếp</span>}
          </p>
          {ethnic === "muong" && (
            <p className="transect-desc" style={{ color: "#f4a261" }}>
              ⚠ Dữ liệu khởi tạo, cần xác minh với cộng đồng người Mường tại địa phương — bấm “Chỉnh sửa” để cập nhật.
            </p>
          )}
          <div className="calendar-table-wrap">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th className="act-col">Hoạt động</th>
                  {MONTHS.map(m => <th key={m} className="month-col">{m}</th>)}
                  {editMode && <th className="act-col" style={{ width: 60 }}></th>}
                </tr>
              </thead>
              <tbody>
                {data.flatMap((group, gi) => [
                  <tr key={`g${gi}`} className="group-row">
                    <td colSpan={13} style={{ color: group.mau }}>
                      {editMode ? (
                        <div className="group-edit-row">
                          <input className="group-name-input" value={group.nhom} onChange={e => updateGroup(gi, { nhom: e.target.value })} style={{ color: group.mau }}/>
                          <input type="color" className="group-color-input" value={group.mau} onChange={e => updateGroup(gi, { mau: e.target.value })}/>
                          <button className="add-activity-btn" onClick={() => addActivity(gi)}>+ Hoạt động</button>
                          <button className="remove-group-btn" onClick={() => removeGroup(gi)}>🗑️</button>
                        </div>
                      ) : group.nhom}
                    </td>
                    {editMode && <td/>}
                  </tr>,
                  ...group.activities.map((act, ai) => (
                    <tr key={`${gi}-${ai}`} className="act-row">
                      <td className="act-name">
                        {editMode ? (
                          <div className="act-edit-row">
                            <input className="act-name-input" value={act.ten} onChange={e => updateActivity(gi, ai, { ten: e.target.value })}/>
                            <input type="color" className="act-color-input" value={act.color} onChange={e => updateActivity(gi, ai, { color: e.target.value })}/>
                          </div>
                        ) : (<>{act.ten} <span title={act.nguon ? "Nguồn: " + act.nguon : "Chưa có nguồn xác minh"} style={{ opacity: 0.6, fontSize: 10, cursor: "help" }}>{act.nguon ? "✓" : "⚠"}</span></>)}
                      </td>
                      {Array.from({ length: 12 }, (_, m) => {
                        const monthNum = m + 1;
                        const active = act.months.includes(monthNum);
                        return (
                          <td key={m} className={`month-cell ${editMode ? "editable" : ""}`} onClick={editMode ? () => toggleMonth(gi, ai, monthNum) : undefined}>
                            {active && <div className="month-dot" style={{ background: act.color }}/>}
                          </td>
                        );
                      })}
                      {editMode && (
                        <td className="month-cell">
                          <button className="remove-activity-btn" onClick={() => removeActivity(gi, ai)}>✕</button>
                        </td>
                      )}
                    </tr>
                  ))
                ])}
                {editMode && (
                  <tr className="group-row"><td colSpan={14}><button className="add-group-btn" onClick={addGroup}>+ Thêm nhóm hoạt động mới</button></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="calendar-note" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
            <div>{CALENDAR_NOTE}</div>
            <details><summary style={{ cursor: "pointer" }}>📚 Nguồn tham khảo ({CALENDAR_SOURCES.length})</summary>
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {CALENDAR_SOURCES.map(r => <li key={r.url}><a href={r.url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>{r.text}</a></li>)}
              </ul>
            </details>
          </div>
          <div className="calendar-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Lịch theo tháng dương lịch tương đối. Thực tế có thể lệch 1-2 tháng tùy vùng và điều kiện thời tiết.
          </div>
        </div>
      </div>
    </div>
  );
}
