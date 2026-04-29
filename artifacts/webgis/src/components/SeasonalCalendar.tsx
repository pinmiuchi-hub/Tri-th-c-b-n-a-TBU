interface Props { onClose: () => void; }

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

const ACTIVITIES = [
  {
    nhom: "🌾 Lúa nước (Thái, Kinh)",
    mau: "#52b788",
    activities: [
      { ten: "Làm đất, tu sửa mương-phai", months: [1,2], color: "#74c69d" },
      { ten: "Gieo mạ, cấy lúa vụ chiêm", months: [2,3,4], color: "#40916c" },
      { ten: "Chăm sóc, làm cỏ", months: [4,5,6,7], color: "#52b788" },
      { ten: "Thu hoạch lúa chiêm", months: [6,7], color: "#b7e4c7" },
      { ten: "Cấy lúa mùa", months: [6,7], color: "#40916c" },
      { ten: "Thu hoạch lúa mùa + Ủ phân hữu cơ", months: [10,11], color: "#b7e4c7" },
      { ten: "Lễ cúng cơm mới, xuống đồng", months: [11,12], color: "#d8f3dc" },
    ]
  },
  {
    nhom: "⛰️ Nương rẫy (Mông, Dao)",
    mau: "#b5179e",
    activities: [
      { ten: "Phát nương, đốt rẫy", months: [2,3], color: "#e9c46a" },
      { ten: "Trồng ngô lần 1", months: [3,4], color: "#f4a261" },
      { ten: "Thu hoạch ngô đợt 1", months: [7,8], color: "#e76f51" },
      { ten: "Trồng ngô lần 2 + Đậu tương", months: [8,9], color: "#f4a261" },
      { ten: "Thu hoạch ngô + Sắn", months: [11,12,1], color: "#e76f51" },
      { ten: "Tết Mông (Nào Pê Chầu)", months: [11,12], color: "#9b5de5" },
    ]
  },
  {
    nhom: "🌲 Lâm sản & Rừng",
    mau: "#2d6a4f",
    activities: [
      { ten: "Thu hái lâm sản phụ (măng, rau)", months: [4,5,6,7,8], color: "#52b788" },
      { ten: "Thu hoạch thảo quả", months: [9,10,11], color: "#1b4332" },
      { ten: "Thu hái chè Shan tuyết", months: [3,4,5,9,10], color: "#40916c" },
      { ten: "Trồng rừng, tu bổ", months: [2,3,7,8], color: "#74c69d" },
      { ten: "Khai thác gỗ (luật tục)", months: [12,1,2], color: "#6b4226" },
    ]
  },
  {
    nhom: "🐟 Thủy sản & Chăn nuôi",
    mau: "#4895ef",
    activities: [
      { ten: "Thả cá (ruộng, ao)", months: [4,5,6], color: "#4895ef" },
      { ten: "Đánh bắt cá suối (mùa khô)", months: [12,1,2,3], color: "#023e8a" },
      { ten: "Thu hoạch cá ao-ruộng", months: [10,11], color: "#4895ef" },
      { ten: "Mổ lợn, trữ thịt dịp Tết", months: [12,1], color: "#e07070" },
    ]
  },
  {
    nhom: "🌿 Cây thuốc & Thu hái",
    mau: "#e63946",
    activities: [
      { ten: "Thu hái lá cây thuốc tươi", months: [5,6,7,8,9], color: "#52b788" },
      { ten: "Thu hoạch củ, rễ cây thuốc", months: [10,11,12], color: "#e63946" },
      { ten: "Sơ chế, phơi sấy thuốc", months: [10,11,12,1], color: "#f4a261" },
      { ten: "Tắm lá sau sinh (quanh năm)", months: [1,2,3,4,5,6,7,8,9,10,11,12], color: "#74c69d" },
    ]
  },
  {
    nhom: "🎊 Lễ hội & Văn hóa",
    mau: "#ffd166",
    activities: [
      { ten: "Tết Nguyên Đán / Tết Mông", months: [1,2], color: "#ffd166" },
      { ten: "Lễ Xên Bản (cúng bản Thái)", months: [1,2,3], color: "#f4a261" },
      { ten: "Lễ hội Hoa Ban", months: [2,3], color: "#ff9ef5" },
      { ten: "Lễ xuống đồng (cầu mùa)", months: [2,3], color: "#b7e4c7" },
      { ten: "Lễ Gầu Tào (Mông)", months: [1,2], color: "#9b5de5" },
      { ten: "Lễ Cấp Sắc (Dao)", months: [11,12,1], color: "#f4a261" },
      { ten: "Lễ cúng rừng thiêng", months: [3,4], color: "#2d6a4f" },
    ]
  }
];

export default function SeasonalCalendar({ onClose }: Props) {
  return (
    <div className="transect-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="transect-modal calendar-modal">
        <div className="transect-header">
          <div className="transect-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Nông lịch bản địa — Vùng Tây Bắc
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="transect-body">
          <p className="transect-desc">Lịch hoạt động nông nghiệp, lâm nghiệp, lễ hội theo tháng âm lịch của các dân tộc vùng Tây Bắc</p>
          <div className="calendar-table-wrap">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th className="act-col">Hoạt động</th>
                  {MONTHS.map(m => <th key={m} className="month-col">{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {ACTIVITIES.map((group, gi) => (
                  <>
                    <tr key={`g${gi}`} className="group-row">
                      <td colSpan={13} style={{ color: group.mau }}>{group.nhom}</td>
                    </tr>
                    {group.activities.map((act, ai) => (
                      <tr key={`${gi}-${ai}`} className="act-row">
                        <td className="act-name">{act.ten}</td>
                        {Array.from({length:12},(_,m)=>{
                          const monthNum = m + 1;
                          const active = act.months.includes(monthNum) || (act.months.includes(12) && monthNum === 12);
                          return (
                            <td key={m} className="month-cell">
                              {active && <div className="month-dot" style={{ background: act.color }}/>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
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
