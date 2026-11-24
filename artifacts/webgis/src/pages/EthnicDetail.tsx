import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { STORAGE, readJson } from "@/utils/persist";

interface BaiThuoc { ten: string; nguyen_lieu: string; cong_dung: string; }
interface TriThuc { chu_de: string; bieu_tuong: string; noi_dung: string; bai_thuoc: BaiThuoc[]; }
interface DanTocInfo {
  id: string; ten: string; mau: string; dan_so_ca_nuoc: number; ngon_ngu: string; mo_ta: string;
  tri_thuc: TriThuc[]; anh?: string; anh_ghichu?: string; nguon?: string[]; ghi_chu_nguon?: string;
}
interface EthnicOverride { dan_so_ca_nuoc?: number; ngon_ngu?: string; mo_ta?: string; anh?: string; mau?: string; }
interface OverridesFile { ethnic?: Record<string, EthnicOverride>; triThuc?: Record<string, TriThuc[]>; }

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
const assetUrl = (p?: string): string =>
  !p ? "" : /^(https?:|data:|blob:)/.test(p) ? p : `${BASE_PATH}/${p.replace(/^\//, "")}`;

const fmtNumber = (n: number): string => Number.isFinite(n) && n > 0 ? n.toLocaleString("vi-VN") : "—";

export default function EthnicDetail({ ethnicId }: { ethnicId: string }) {
  const [, navigate] = useLocation();
  const [catalog, setCatalog] = useState<DanTocInfo[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [activeTopic, setActiveTopic] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${BASE_PATH}/data/dan_toc.json`)
      .then(r => r.json())
      .then((data: { dan_toc?: DanTocInfo[] }) => { if (alive) setCatalog(data.dan_toc ?? []); })
      .catch(() => { if (alive) { setCatalog([]); setFailed(true); } });
    return () => { alive = false; };
  }, []);

  const overrides = useMemo(() => readJson<OverridesFile>(STORAGE.overrides) ?? {}, []);

  const info = useMemo(() => {
    if (!catalog) return null;
    const base = catalog.find(item => item.id === ethnicId);
    if (!base) return null;
    const ov = overrides.ethnic?.[ethnicId];
    const triOv = overrides.triThuc?.[ethnicId];
    return { ...base, ...(ov || {}), tri_thuc: triOv && triOv.length ? triOv : base.tri_thuc } as DanTocInfo;
  }, [catalog, ethnicId, overrides]);

  const color = info?.mau || "#c96a3d";
  const topics = info?.tri_thuc ?? [];

  return (
    <div className="ethnic-detail-page">
      <div className="ed-topbar">
        <button className="ed-back" onClick={() => navigate("/")}>
          ← Quay lại bản đồ
        </button>
        <div className="ed-topbar-title">
          <span className="ed-dot" style={{ background: color }} />
          <span>Chi tiết dân tộc</span>
        </div>
      </div>

      <div className="ed-scroll">
        {!catalog && !failed && <div className="ed-loading">Đang tải thông tin dân tộc…</div>}

        {failed && (
          <div className="ed-empty">
            <p>Không đọc được dữ liệu dân tộc.</p>
            <button className="ed-back" onClick={() => navigate("/")}>← Quay lại bản đồ</button>
          </div>
        )}

        {catalog && !info && (
          <div className="ed-empty">
            <p>Không tìm thấy dân tộc <b>{ethnicId}</b> trong cơ sở dữ liệu.</p>
            <button className="ed-back" onClick={() => navigate("/")}>← Quay lại bản đồ</button>
          </div>
        )}

        {info && (
          <div className="ed-card" style={{ borderColor: color + "66" }}>
            <div className="ed-hero">
              {info.anh ? (
                <div className="ed-photo-wrap" style={{ borderColor: color + "55" }}>
                  <img src={assetUrl(info.anh)} alt={info.ten} className="ed-photo" onClick={() => setLightbox(assetUrl(info.anh))} />
                  {info.anh_ghichu && <div className="ed-photo-credit">Nguồn ảnh: {info.anh_ghichu}</div>}
                </div>
              ) : (
                <div className="ed-photo-placeholder" style={{ background: color + "22", borderColor: color + "55", color }}>
                  🏞️ Chưa có ảnh minh họa
                </div>
              )}

              <div className="ed-head">
                <h1 className="ed-name" style={{ color }}>{info.ten}</h1>
                <div className="ed-meta">
                  <div className="ed-meta-item">
                    <span className="ed-meta-label">Dân số toàn quốc</span>
                    <span className="ed-meta-value">{fmtNumber(info.dan_so_ca_nuoc)} người</span>
                  </div>
                  <div className="ed-meta-item">
                    <span className="ed-meta-label">Ngôn ngữ</span>
                    <span className="ed-meta-value">{info.ngon_ngu || "—"}</span>
                  </div>
                  <div className="ed-meta-item">
                    <span className="ed-meta-label">Chủ đề tri thức</span>
                    <span className="ed-meta-value">{topics.length}</span>
                  </div>
                </div>
                {info.mo_ta && <p className="ed-desc">{info.mo_ta}</p>}
                {!!info.nguon?.length && (
                  <details className="ed-sources">
                    <summary>📚 Nguồn tham khảo ({info.nguon.length})</summary>
                    <ul>{info.nguon.map((n, i) => <li key={i}>{n}</li>)}</ul>
                    {info.ghi_chu_nguon && <div className="ed-source-note">{info.ghi_chu_nguon}</div>}
                  </details>
                )}
              </div>
            </div>

            {topics.length > 0 && (
              <div className="ed-knowledge">
                <div className="ed-tabs">
                  {topics.map((tt, i) => (
                    <button
                      key={i}
                      className={`ed-tab ${activeTopic === i ? "active" : ""}`}
                      style={{ "--tab-color": color } as React.CSSProperties}
                      onClick={() => setActiveTopic(i)}
                    >
                      <span>{tt.bieu_tuong}</span>
                      <span>{tt.chu_de}</span>
                    </button>
                  ))}
                </div>

                {topics[activeTopic] && (
                  <div className="ed-topic">
                    <div className="ed-topic-title" style={{ borderColor: color }}>
                      <span className="ed-topic-symbol">{topics[activeTopic].bieu_tuong}</span>
                      <h2>{topics[activeTopic].chu_de}</h2>
                    </div>
                    <p className="ed-topic-body">{topics[activeTopic].noi_dung || "Chưa có nội dung cho chủ đề này."}</p>

                    {!!topics[activeTopic].bai_thuoc?.length && (
                      <div className="ed-recipes">
                        <div className="ed-recipes-title">Bài thuốc / kỹ thuật bản địa</div>
                        <div className="ed-recipe-grid">
                          {topics[activeTopic].bai_thuoc.map((bt, i) => (
                            <div className="ed-recipe" key={i} style={{ borderColor: color + "50" }}>
                              <div className="ed-recipe-name" style={{ color }}>{bt.ten}</div>
                              <div className="ed-recipe-row"><span>Nguyên liệu</span><p>{bt.nguyen_lieu || "—"}</p></div>
                              <div className="ed-recipe-row"><span>Công dụng</span><p>{bt.cong_dung || "—"}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {topics.length === 0 && (
              <div className="ed-no-topic">Dân tộc này chưa có chủ đề tri thức bản địa nào được ghi nhận.</div>
            )}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="ed-lightbox" onClick={() => setLightbox(null)}>
          <button className="ed-lightbox-close" onClick={() => setLightbox(null)} aria-label="Đóng">✕</button>
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
