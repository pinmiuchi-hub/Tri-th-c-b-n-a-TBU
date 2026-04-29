import { useState, useRef } from "react";

/* ─── Types ─── */
export interface DanTocTyLe { dan_toc: string; ty_le: number; }
export interface WardOverrides {
  ten_xa?: string; loai?: string; dtich_km2?: number; dan_so?: number; matdo_km2?: number;
  ghi_chu?: string; san_pham?: string; tinh_trang?: string;
  dan_toc?: DanTocTyLe[];
  [key: string]: unknown;
}
export interface EthnicOverride { dan_so_ca_nuoc?: number; ngon_ngu?: string; mo_ta?: string; anh?: string; }
export interface PdfFile { name: string; url: string; size: string; }

interface Props {
  onClose: () => void;
  wardOverrides: Map<string, WardOverrides>;
  onApplyWardCSV: (data: Map<string, WardOverrides>) => void;
  onClearWardData: () => void;
  ethnicOverrides: Map<string, EthnicOverride>;
  onApplyEthnicCSV: (data: Map<string, EthnicOverride>) => void;
  onClearEthnicData: () => void;
  pdfFiles: Map<string, PdfFile[]>;
  onAddPdf: (key: string, files: PdfFile[]) => void;
  onRemovePdf: (key: string, idx: number) => void;
  onViewPdf: (pdf: PdfFile) => void;
  currentWard?: { ma_xa: string; ten_xa: string } | null;
  wardList: { ma_xa: string; ten_xa: string }[];
}

const ETHNIC_COLS = ["thai","mong","dao","kho_mu","muong","kinh","la_hu","lu","mang"];
const ETHNIC_LABELS: Record<string,string> = {
  thai:"Thái",mong:"Mông",dao:"Dao",kho_mu:"Khơ Mú",muong:"Mường",kinh:"Kinh",la_hu:"La Hủ",lu:"Lự",mang:"Mảng"
};
const ETHNIC_IDS = ["thai","mong","muong","dao","kho_mu","la_hu","lu","mang","kinh"];

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024*1024) return (b/1024).toFixed(1)+" KB";
  return (b/(1024*1024)).toFixed(1)+" MB";
}

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  const parse = (line: string) => line.split(",").map(c => c.trim().replace(/^"|"$/g,""));
  return { headers: parse(lines[0]||""), rows: lines.slice(1).map(parse) };
}

export default function ImportModal({
  onClose, wardOverrides, onApplyWardCSV, onClearWardData,
  ethnicOverrides, onApplyEthnicCSV, onClearEthnicData,
  pdfFiles, onAddPdf, onRemovePdf, onViewPdf,
  currentWard, wardList
}: Props) {
  const [tab, setTab] = useState<"ward-csv"|"ethnic-csv"|"pdf">("ward-csv");
  const [msg, setMsg] = useState<{ type:"ok"|"err"; text:string }|null>(null);

  /* ward CSV state */
  const [wardCsvRaw, setWardCsvRaw] = useState<{headers:string[];rows:string[][]}|null>(null);
  const [wardPreview, setWardPreview] = useState<{headers:string[];rows:string[][];matched:number;total:number}|null>(null);

  /* ethnic CSV state */
  const [ethCsvRaw, setEthCsvRaw] = useState<{headers:string[];rows:string[][]}|null>(null);
  const [ethPreview, setEthPreview] = useState<{headers:string[];rows:string[][];matched:number;total:number}|null>(null);

  /* pdf state */
  const [pdfKey, setPdfKey] = useState("");
  const [pdfMode, setPdfMode] = useState<"ward"|"ethnic">("ward");
  const wardInputRef = useRef<HTMLInputElement>(null);
  const ethInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  /* ─── Ward CSV ─── */
  const handleWardCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const { headers, rows } = parseCSV(e.target?.result as string);
      const maIdx = headers.indexOf("ma_xa");
      if (maIdx === -1) { setMsg({ type:"err", text:"Thiếu cột 'ma_xa' trong file CSV." }); return; }
      const known = new Set(wardList.map(w => w.ma_xa));
      setWardCsvRaw({ headers, rows });
      setWardPreview({ headers, rows: rows.slice(0,6), matched: rows.filter(r => known.has(r[maIdx])).length, total: rows.length });
      setMsg(null);
    };
    reader.readAsText(file, "utf-8");
  };

  const applyWardCSV = () => {
    if (!wardCsvRaw) return;
    const { headers, rows } = wardCsvRaw;
    const maIdx = headers.indexOf("ma_xa");
    const newMap = new Map(wardOverrides);
    let count = 0;
    for (const row of rows) {
      const ma = row[maIdx]; if (!ma) continue;
      const prev = newMap.get(ma) || {};
      const entry: WardOverrides = { ...prev };
      const danTocArr: DanTocTyLe[] = [];
      let totalPct = 0;
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i]; const v = row[i]?.trim() || "";
        if (!v || h === "ma_xa") continue;
        if (h === "ten_xa") { entry.ten_xa = v; continue; }
        if (h === "loai") { entry.loai = v; continue; }
        if (h === "dtich_km2") { entry.dtich_km2 = parseFloat(v) || undefined; continue; }
        if (h === "dan_so") { entry.dan_so = parseInt(v) || undefined; continue; }
        if (h === "matdo_km2") { entry.matdo_km2 = parseFloat(v) || undefined; continue; }
        if (h === "ghi_chu") { entry.ghi_chu = v; continue; }
        if (h === "san_pham") { entry.san_pham = v; continue; }
        if (h === "tinh_trang") { entry.tinh_trang = v; continue; }
        if (ETHNIC_COLS.includes(h)) {
          const pct = parseFloat(v) || 0;
          if (pct > 0) { danTocArr.push({ dan_toc: h, ty_le: pct }); totalPct += pct; }
          continue;
        }
        entry[h] = v;
      }
      if (danTocArr.length > 0) {
        const sorted = danTocArr.sort((a,b) => b.ty_le - a.ty_le);
        if (Math.abs(totalPct - 100) > 0.5) sorted.forEach(d => { d.ty_le = Math.round(d.ty_le * 100 / totalPct); });
        entry.dan_toc = sorted;
      }
      newMap.set(ma, entry); count++;
    }
    onApplyWardCSV(newMap);
    setWardCsvRaw(null); setWardPreview(null);
    setMsg({ type:"ok", text:`Đã cập nhật ${count} xã thành công.` });
  };

  const downloadWardTemplate = () => {
    const header = ["ma_xa","ten_xa","loai","dtich_km2","dan_so","matdo_km2","ghi_chu","san_pham","tinh_trang",...ETHNIC_COLS].join(",");
    const rows = wardList.slice(0,5).map(w => [w.ma_xa, w.ten_xa, "", "", "", "", "", "", "", ...ETHNIC_COLS.map(()=>"0")].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "template_xa.csv"; a.click();
  };

  /* ─── Ethnic CSV ─── */
  const handleEthCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const { headers, rows } = parseCSV(e.target?.result as string);
      const idIdx = headers.indexOf("dan_toc_id");
      if (idIdx === -1) { setMsg({ type:"err", text:"Thiếu cột 'dan_toc_id' trong file CSV." }); return; }
      setEthCsvRaw({ headers, rows });
      setEthPreview({ headers, rows: rows.slice(0,6), matched: rows.filter(r => ETHNIC_IDS.includes(r[idIdx])).length, total: rows.length });
      setMsg(null);
    };
    reader.readAsText(file, "utf-8");
  };

  const applyEthCSV = () => {
    if (!ethCsvRaw) return;
    const { headers, rows } = ethCsvRaw;
    const idIdx = headers.indexOf("dan_toc_id");
    const newMap = new Map(ethnicOverrides);
    let count = 0;
    for (const row of rows) {
      const id = row[idIdx]; if (!id) continue;
      const entry: EthnicOverride = { ...newMap.get(id) };
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i]; const v = row[i]?.trim()||"";
        if (!v || h === "dan_toc_id") continue;
        if (h === "dan_so_ca_nuoc") { entry.dan_so_ca_nuoc = parseInt(v)||undefined; continue; }
        if (h === "ngon_ngu") { entry.ngon_ngu = v; continue; }
        if (h === "mo_ta") { entry.mo_ta = v; continue; }
      }
      newMap.set(id, entry); count++;
    }
    onApplyEthnicCSV(newMap);
    setEthCsvRaw(null); setEthPreview(null);
    setMsg({ type:"ok", text:`Đã cập nhật ${count} dân tộc thành công.` });
  };

  const downloadEthTemplate = () => {
    const header = "dan_toc_id,dan_so_ca_nuoc,ngon_ngu,mo_ta";
    const rows = ETHNIC_IDS.map(id => `${id},,,`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "template_dan_toc.csv"; a.click();
  };

  /* ─── PDF upload ─── */
  const handlePDFUpload = (files: FileList|null) => {
    const key = pdfKey.trim();
    if (!key) { setMsg({ type:"err", text:"Vui lòng nhập mã xã hoặc chọn dân tộc trước." }); return; }
    if (!files || files.length === 0) return;
    const newFiles: PdfFile[] = Array.from(files)
      .filter(f => f.type === "application/pdf")
      .map(f => ({ name: f.name, url: URL.createObjectURL(f), size: formatBytes(f.size) }));
    if (newFiles.length === 0) { setMsg({ type:"err", text:"Chỉ hỗ trợ file PDF." }); return; }
    onAddPdf(key, newFiles);
    setMsg({ type:"ok", text:`Đã đính kèm ${newFiles.length} file PDF cho ${pdfMode === "ward" ? "xã "+key : "dân tộc "+key}.` });
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const allPdfEntries = Array.from(pdfFiles.entries());

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="import-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Nhập & quản lý dữ liệu
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button className={`modal-tab ${tab==="ward-csv"?"active":""}`} onClick={()=>{setTab("ward-csv");setMsg(null);}}>📊 CSV Xã/Phường</button>
          <button className={`modal-tab ${tab==="ethnic-csv"?"active":""}`} onClick={()=>{setTab("ethnic-csv");setMsg(null);}}>🏷️ CSV Dân tộc</button>
          <button className={`modal-tab ${tab==="pdf"?"active":""}`} onClick={()=>{setTab("pdf");setMsg(null);}}>📄 Tài liệu PDF</button>
        </div>

        <div className="modal-body">
          {msg && <div className={`import-message ${msg.type}`}>{msg.type==="ok"?"✓":"⚠"} {msg.text}</div>}

          {/* ── Ward CSV tab ── */}
          {tab === "ward-csv" && (
            <div className="csv-tab">
              <div className="import-info">
                <strong>Cập nhật thông tin xã/phường:</strong>
                <p>Cột bắt buộc: <code>ma_xa</code>. Cột tuỳ chọn: <code>ten_xa</code>, <code>loai</code>, <code>dtich_km2</code>, <code>dan_so</code>, <code>matdo_km2</code>, <code>ghi_chu</code>, <code>san_pham</code>, <code>tinh_trang</code>.</p>
                <p>Tỷ lệ dân tộc (0–100): <code>{ETHNIC_COLS.map(c=>ETHNIC_LABELS[c]).join(", ")}</code>. Bất kỳ cột bổ sung nào đều được lưu tự động.</p>
              </div>
              <div className="btn-row">
                <button className="action-btn secondary" onClick={downloadWardTemplate}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Tải template xã CSV
                </button>
              </div>
              <label className="file-drop-zone">
                <input ref={wardInputRef} type="file" accept=".csv" hidden onChange={e=>{if(e.target.files?.[0]) handleWardCSVFile(e.target.files[0]);}}/>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Click hoặc kéo thả file CSV vào đây</span>
                <span className="drop-sub">Hỗ trợ encoding UTF-8</span>
              </label>
              {wardPreview && (
                <div className="csv-preview">
                  <div className="preview-stats">
                    Đọc <strong>{wardPreview.total}</strong> dòng · Khớp <strong className="match-ok">{wardPreview.matched}</strong> xã
                  </div>
                  <div className="preview-table-wrap">
                    <table className="preview-table">
                      <thead><tr>{wardPreview.headers.map(h=><th key={h}>{h}</th>)}</tr></thead>
                      <tbody>{wardPreview.rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c||"—"}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                  <div className="btn-row">
                    <button className="action-btn primary" onClick={applyWardCSV}>✓ Áp dụng</button>
                    <button className="action-btn ghost" onClick={()=>{setWardPreview(null);setWardCsvRaw(null);}}>Huỷ</button>
                  </div>
                </div>
              )}
              {wardOverrides.size > 0 && (
                <div className="applied-info">
                  <span>✓ Đang có dữ liệu tùy chỉnh cho <strong>{wardOverrides.size}</strong> xã</span>
                  <button className="clear-btn" onClick={()=>{onClearWardData();setMsg({type:"ok",text:"Đã xóa toàn bộ dữ liệu xã."});}}>Xóa tất cả</button>
                </div>
              )}
            </div>
          )}

          {/* ── Ethnic CSV tab ── */}
          {tab === "ethnic-csv" && (
            <div className="csv-tab">
              <div className="import-info">
                <strong>Cập nhật thông tin dân tộc:</strong>
                <p>Cột bắt buộc: <code>dan_toc_id</code> (giá trị: <code>{ETHNIC_IDS.join(", ")}</code>).</p>
                <p>Cột tuỳ chọn: <code>dan_so_ca_nuoc</code>, <code>ngon_ngu</code>, <code>mo_ta</code>.</p>
              </div>
              <div className="btn-row">
                <button className="action-btn secondary" onClick={downloadEthTemplate}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Tải template dân tộc CSV
                </button>
              </div>
              <label className="file-drop-zone">
                <input ref={ethInputRef} type="file" accept=".csv" hidden onChange={e=>{if(e.target.files?.[0]) handleEthCSVFile(e.target.files[0]);}}/>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Click hoặc kéo thả file CSV dân tộc</span>
                <span className="drop-sub">Hỗ trợ encoding UTF-8</span>
              </label>
              {ethPreview && (
                <div className="csv-preview">
                  <div className="preview-stats">Đọc <strong>{ethPreview.total}</strong> dòng · Khớp <strong className="match-ok">{ethPreview.matched}</strong> dân tộc</div>
                  <div className="preview-table-wrap">
                    <table className="preview-table">
                      <thead><tr>{ethPreview.headers.map(h=><th key={h}>{h}</th>)}</tr></thead>
                      <tbody>{ethPreview.rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c||"—"}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                  <div className="btn-row">
                    <button className="action-btn primary" onClick={applyEthCSV}>✓ Áp dụng</button>
                    <button className="action-btn ghost" onClick={()=>{setEthPreview(null);setEthCsvRaw(null);}}>Huỷ</button>
                  </div>
                </div>
              )}
              {ethnicOverrides.size > 0 && (
                <div className="applied-info">
                  <span>✓ Đang có dữ liệu tùy chỉnh cho <strong>{ethnicOverrides.size}</strong> dân tộc</span>
                  <button className="clear-btn" onClick={()=>{onClearEthnicData();setMsg({type:"ok",text:"Đã xóa toàn bộ dữ liệu dân tộc."});}}>Xóa tất cả</button>
                </div>
              )}
            </div>
          )}

          {/* ── PDF tab ── */}
          {tab === "pdf" && (
            <div className="pdf-tab">
              <div className="import-info">
                <strong>Đính kèm tài liệu PDF:</strong>
                <p>Chọn loại, nhập mã tương ứng rồi tải file PDF. Tài liệu sẽ xuất hiện trong bảng thông tin khi click vào xã hoặc dân tộc đó.</p>
              </div>
              <div className="pdf-mode-toggle">
                <button className={`mode-btn ${pdfMode==="ward"?"active":""}`} onClick={()=>{setPdfMode("ward");setPdfKey("");}}>📍 Cho xã/phường</button>
                <button className={`mode-btn ${pdfMode==="ethnic"?"active":""}`} onClick={()=>{setPdfMode("ethnic");setPdfKey("");}}>👥 Cho dân tộc</button>
              </div>
              <div className="pdf-upload-form">
                {pdfMode === "ward" ? (
                  <>
                    <label className="form-label">Mã xã (ma_xa)</label>
                    <div className="pdf-input-row">
                      <input type="text" className="code-input" placeholder="VD: 03856" value={pdfKey} onChange={e=>setPdfKey(e.target.value)}/>
                      {currentWard && <button className="fill-btn" onClick={()=>setPdfKey(currentWard.ma_xa)}>Dùng xã đang chọn ({currentWard.ten_xa})</button>}
                    </div>
                  </>
                ) : (
                  <>
                    <label className="form-label">Chọn dân tộc</label>
                    <div className="ethnic-select-row">
                      {ETHNIC_IDS.map(id => (
                        <button key={id} className={`ethnic-pick-btn ${pdfKey===id?"active":""}`} onClick={()=>setPdfKey(id)}>{ETHNIC_LABELS[id]||id}</button>
                      ))}
                    </div>
                  </>
                )}
                <label className="file-drop-zone" style={{marginTop:"8px"}}>
                  <input ref={pdfInputRef} type="file" accept=".pdf" multiple hidden onChange={e=>handlePDFUpload(e.target.files)}/>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>Click hoặc kéo thả file PDF</span>
                  <span className="drop-sub">Có thể chọn nhiều file cùng lúc</span>
                </label>
              </div>
              {allPdfEntries.length > 0 && (
                <div className="pdf-list-section">
                  <div className="pdf-list-title">Tài liệu đã đính kèm ({allPdfEntries.reduce((s,[,l])=>s+l.length,0)} file)</div>
                  {allPdfEntries.map(([key, list]) => (
                    <div key={key} className="pdf-ward-group">
                      <div className="pdf-ward-code">{key.startsWith("ethnic_") ? "🏷️ Dân tộc: "+key.replace("ethnic_","") : "📍 Mã xã: "+key}</div>
                      {list.map((pdf,i) => (
                        <div key={i} className="pdf-item">
                          <div className="pdf-info"><span className="pdf-name">{pdf.name}</span><span className="pdf-size">{pdf.size}</span></div>
                          <div className="pdf-actions">
                            <button className="pdf-btn view" onClick={()=>onViewPdf(pdf)}>Xem</button>
                            <button className="pdf-btn remove" onClick={()=>onRemovePdf(key,i)}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
