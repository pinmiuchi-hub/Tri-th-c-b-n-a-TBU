import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import auditDocRaw from "../../RA_SOAT_DU_LIEU_VA_NGUON_THAM_KHAO.md?raw";
import readmeRaw from "../../README.md?raw";

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Mở tài liệu markdown nhúng từ kho mã nguồn trong tab mới (không phụ thuộc cấu hình static server). */
const openTextDoc = (name: string, text: string): void => {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noreferrer";
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
};

type SourceList = Record<string, string[]>;

interface LayerEntry {
  id?: string;
  ten?: string;
  nguon?: string | string[];
  trang_thai?: string;
}

interface RasterLayer {
  file?: string;
  unit?: string;
  label?: string;
  source?: string;
  stops?: unknown;
}

interface DanTocInfo {
  id: string;
  ten: string;
  mau?: string;
  nguon?: string[];
  ghi_chu_nguon?: string;
}

const COLLECTION_LABELS: Record<string, string> = {
  rivers: "Sông suối",
  irrigation: "Thủy lợi",
  villages: "Bản làng tiêu biểu",
  forests: "Phân vùng rừng & khu bảo tồn",
  vac_models: "Mô hình VAC",
  medicinal_plants: "Khu vực cây thuốc quý",
  customary_zones: "Vùng tập quán / luật tục",
};

const COLLECTION_ORDER = [
  "rivers",
  "irrigation",
  "forests",
  "vac_models",
  "medicinal_plants",
  "villages",
  "customary_zones",
];

const CORE_SOURCES: { ten: string; nguon: string; dung: string; link?: string; linkLabel?: string }[] = [
  {
    ten: "Ranh giới hành chính tỉnh & xã",
    nguon: "Bộ Tài nguyên và Môi trường Việt Nam · GADM 4.1 (tham chiếu)",
    dung:
      "tinh.geojson, xa_sonla/xa_dienbien/xa_laichau/xa_laocai.geojson — đơn vị hành chính sau sắp xếp 01/7/2025 theo Nghị quyết 202/2025/QH15 và nghị quyết của Ủy ban Thường vụ Quốc hội.",
  },
  {
    ten: "Dân số & cơ cấu dân tộc",
    nguon: "Tổng cục Thống kê · Cổng dữ liệu mở tỉnh Sơn La",
    dung:
      "Tổng điều tra dân số và nhà ở 01/4/2019 (Kết quả TĐTDS&NO 2019); Đặc trưng cơ bản của 53 dân tộc thiểu số năm 2019; số liệu dân tộc cấp xã của Sơn La tra cứu theo cổng dữ liệu mở tỉnh.",
    link: "https://www.nso.gov.vn/",
    linkLabel: "nso.gov.vn",
  },
  {
    ten: "Nền bản đồ & bản đồ đường",
    nguon: "OpenStreetMap contributors (ODbL) · Esri · EOX Sentinel-2 cloudless",
    dung:
      "Lớp nền vệ tinh Esri; lớp vệ tinh không mây ghép Sentinel-2 năm 2019 do EOX cung cấp. Đường sá, đường thủy và các đối tượng nền dùng dữ liệu OpenStreetMap theo giấy phép ODbL.",
    link: "https://s2maps.eu/",
    linkLabel: "s2maps.eu",
  },
  {
    ten: "Địa hình, độ cao & mô phỏng",
    nguon: "NASA SRTM · Open-Meteo · AWS Terrain Tiles",
    dung:
      "Raster độ cao, dốc, nhiệt độ, lượng mưa, loại đất và pH đất lấy từ NASA SRTM qua Open-Meteo; chế độ 3D dùng AWS Terrain Tiles (SRTM/ETOPO).",
    link: "https://www.open-meteo.com/",
    linkLabel: "open-meteo.com",
  },
  {
    ten: "Khu bảo tồn & rừng đặc dụng",
    nguon: "UNEP-WCMC / WCMC — World Database on Protected Areas (WDPA/WDPCA)",
    dung:
      "Hình học 11 khu bảo tồn thuộc 4 tỉnh lấy từ protectedplanet.net, truy vấn 10/2026.",
    link: "https://www.protectedplanet.net/",
    linkLabel: "protectedplanet.net",
  },
  {
    ten: "Ảnh minh họa dân tộc",
    nguon: "Wikimedia Commons (CC BY-SA / CC0)",
    dung:
      "17 ảnh tải từ Wikimedia Commons; giấy phép và tác giả ghi chi tiết trong file NGUON_ANH.md.",
    link: `${BASE_PATH}/data/images/NGUON_ANH.md`,
    linkLabel: "NGUON_ANH.md",
  },
  {
    ten: "Văn bản pháp lý & chính sách",
    nguon: "Chính phủ · Quốc hội · Bộ ngành",
    dung:
      "Nghị quyết 202/2025/QH15 và nghị quyết UBTVQH15 (sáp nhập đơn vị hành chính); Luật Đất đai 2024, Luật Lâm nghiệp 2017, Luật Tài nguyên nước 2019, Nghị định 61/2023/NĐ-CP (hương ước, quy ước).",
  },
];

const asArray = (v?: string | string[]): string[] =>
  !v ? [] : Array.isArray(v) ? v : [v];

export default function SourcesPage() {
  const [, navigate] = useLocation();
  const [vector, setVector] = useState<SourceList | null>(null);
  const [vectorCounts, setVectorCounts] = useState<Record<string, number>>({});
  const [rasters, setRasters] = useState<{ key: string; label: string; source: string; unit: string }[] | null>(null);
  const [ethnic, setEthnic] = useState<DanTocInfo[] | null>(null);
  const [auditNote, setAuditNote] = useState<string>("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    Promise.all([
      fetch(`${BASE_PATH}/data/layers.json`).then(r => r.json()).catch(() => null),
      fetch(`${BASE_PATH}/data/raster/meta.json`).then(r => r.json()).catch(() => null),
      fetch(`${BASE_PATH}/data/dan_toc.json`).then(r => r.json()).catch(() => null),
    ]).then(([layers, rasterMeta, danToc]) => {
      if (!alive) return;
      if (!layers && !rasterMeta && !danToc) { setFailed(true); return; }

      if (layers) {
        const src: SourceList = {};
        const counts: Record<string, number> = {};
        COLLECTION_ORDER.forEach(key => {
          const entries: LayerEntry[] = Array.isArray(layers[key]) ? layers[key] : [];
          counts[key] = entries.length;
          const uniq = new Set<string>();
          entries.forEach(e => asArray(e?.nguon).forEach(s => { if (s) uniq.add(s.trim()); }));
          src[key] = Array.from(uniq);
        });
        setVector(src);
        setVectorCounts(counts);
        setAuditNote(typeof layers._meta?.ghi_chu === "string" ? layers._meta.ghi_chu : "");
      }

      if (rasterMeta?.layers) {
        setRasters(
          Object.entries(rasterMeta.layers as Record<string, RasterLayer>).map(([key, v]) => ({
            key,
            label: v?.label || key,
            source: v?.source || "—",
            unit: v?.unit || "",
          })),
        );
      }

      if (danToc?.dan_toc) setEthnic(danToc.dan_toc as DanTocInfo[]);
    }).catch(() => { if (alive) setFailed(true); });

    return () => { alive = false; };
  }, []);

  const loading = vector === null && rasters === null && ethnic === null && !failed;

  return (
    <div className="ethnic-detail-page">
      <div className="ed-topbar">
        <button className="ed-back" onClick={() => navigate("/")}>← Quay lại bản đồ</button>
        <div className="ed-topbar-title">
          <span className="ed-dot" style={{ background: "#52b788" }} />
          <span>Nguồn dữ liệu</span>
        </div>
      </div>

      <div className="ed-scroll">
        <div className="src-wrap">
          <h1 className="src-h1">Nguồn dữ liệu & tra cứu</h1>
          <p className="src-lead">
            Trang này tổng hợp nguồn của mọi lớp dữ liệu đang hiển thị trên bản đồ: ranh giới hành chính,
            số liệu dân số – dân tộc, bản đồ nền, dữ liệu địa hình, khu bảo tồn, lớp tri thức bản địa và ảnh minh họa.
            Mỗi mục ghi rõ cơ quan/đơn vị cung cấp và giấy phép (nếu có).
          </p>

          {loading && <div className="ed-loading">Đang tải danh mục nguồn…</div>}

          {failed && (
            <div className="ed-empty">
              <p>Không đọc được danh mục nguồn dữ liệu.</p>
              <button className="ed-back" onClick={() => navigate("/")}>← Quay lại bản đồ</button>
            </div>
          )}

          {/* ── 1. Nguồn lõi ── */}
          {!failed && (
            <section className="src-sec">
              <h2 className="src-sec-title">1. Nguồn lõi của hệ thống</h2>
              <div className="src-grid">
                {CORE_SOURCES.map(s => (
                  <article className="src-card" key={s.ten}>
                    <h3 className="src-card-title">{s.ten}</h3>
                    <div className="src-card-nguon">{s.nguon}</div>
                    <p className="src-card-desc">{s.dung}</p>
                    {s.link && (
                      <a className="src-link" href={s.link} target="_blank" rel="noreferrer">
                        {s.linkLabel || s.link} ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ── 2. Lớp vector theo nhóm ── */}
          {vector && (
            <section className="src-sec">
              <h2 className="src-sec-title">2. Lớp tri thức bản địa (vector)</h2>
              <p className="src-note">
                Nguồn được ghi theo từng đối tượng trong <code>public/data/layers.json</code> (trường <code>nguon</code>).
                Bấm vào từng lớp để xem danh sách nguồn chi tiết.
              </p>
              <div className="src-list">
                {COLLECTION_ORDER.filter(k => vector[k] !== undefined).map(key => (
                  <details className="src-details" key={key}>
                    <summary className="src-summary">
                      <span className="src-summary-name">{COLLECTION_LABELS[key] || key}</span>
                      <span className="src-badge">{vectorCounts[key] ?? 0} đối tượng</span>
                      <span className="src-badge src-badge-soft">{vector[key].length} nguồn</span>
                    </summary>
                    {vector[key].length === 0 ? (
                      <div className="src-empty-item">Chưa ghi nhận nguồn riêng cho lớp này.</div>
                    ) : (
                      <ul className="src-ul">
                        {vector[key].map((s, i) => (
                          <li className="src-li" key={`${key}-${i}`}>
                            {/^https?:\/\//i.test(s)
                              ? <a className="src-link" href={s} target="_blank" rel="noreferrer">{s} ↗</a>
                              : <span>{s}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* ── 3. Raster ── */}
          {rasters && (
            <section className="src-sec">
              <h2 className="src-sec-title">3. Lớp bản đồ chuyên đề (raster)</h2>
              <div className="src-table-wrap">
                <table className="src-table">
                  <thead>
                    <tr><th>Lớp</th><th>Đơn vị</th><th>Nguồn</th></tr>
                  </thead>
                  <tbody>
                    {rasters.map(r => (
                      <tr key={r.key}>
                        <td>{r.label}</td>
                        <td className="src-mono">{r.unit || "—"}</td>
                        <td>{r.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── 4. Dân tộc ── */}
          {ethnic && (
            <section className="src-sec">
              <h2 className="src-sec-title">4. Số liệu dân tộc</h2>
              <p className="src-note">
                Danh mục <code>public/data/dan_toc.json</code> — mỗi dân tộc có mảng <code>nguon</code> (số dân, ngôn ngữ,
                địa bàn sống chủ yếu). Màu nền trên bản đồ lấy theo trường <code>mau</code> của mục này.
              </p>
              <div className="src-list">
                {ethnic.map(e => (
                  <details className="src-details" key={e.id}>
                    <summary className="src-summary">
                      <span className="src-dot" style={{ background: e.mau || "#94a3b8" }} />
                      <span className="src-summary-name">{e.ten}</span>
                      <span className="src-badge src-badge-soft">{(e.nguon ?? []).length} nguồn</span>
                    </summary>
                    {(e.nguon ?? []).length === 0 ? (
                      <div className="src-empty-item">Chưa ghi nhận nguồn riêng.</div>
                    ) : (
                      <ul className="src-ul">
                        {(e.nguon ?? []).map((s, i) => (
                          <li className="src-li" key={`${e.id}-${i}`}>
                            {/^https?:\/\//i.test(s)
                              ? <a className="src-link" href={s} target="_blank" rel="noreferrer">{s} ↗</a>
                              : <span>{s}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {e.ghi_chu_nguon && <div className="src-empty-item">{e.ghi_chu_nguon}</div>}
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* ── 5. Tài liệu đối chiếu ── */}
          <section className="src-sec">
            <h2 className="src-sec-title">5. Tài liệu đối chiếu & hồ sơ ảnh</h2>
            <ul className="src-ul src-ul-fixed">
              <li className="src-li">
                <button className="src-link src-link-btn" onClick={() => openTextDoc("RA_SOAT_DU_LIEU_VA_NGUON_THAM_KHAO.md", auditDocRaw)}>
                  RA_SOAT_DU_LIEU_VA_NGUON_THAM_KHAO.md ↗
                </button>
                <span className="src-li-sub">Bảng tra cứu 20+ nguồn (Tổng cục Thống kê, báo chí, UNEP-WCMC, OSM…), ghi rõ nguồn nào đã đọc toàn văn.</span>
              </li>
              <li className="src-li">
                <a className="src-link" href={`${BASE_PATH}/data/images/NGUON_ANH.md`} target="_blank" rel="noreferrer">
                  NGUON_ANH.md ↗
                </a>
                <span className="src-li-sub">Giấy phép và tác giả của 17 ảnh minh họa Wikimedia Commons.</span>
              </li>
              <li className="src-li">
                <button className="src-link src-link-btn" onClick={() => openTextDoc("README.md", readmeRaw)}>
                  README.md ↗
                </button>
                <span className="src-li-sub">Mục “Lưu ý về dữ liệu” — mô tả ngắn từng lớp dữ liệu.</span>
              </li>
            </ul>
            {auditNote && (
              <details className="src-details">
                <summary className="src-summary">
                  <span className="src-summary-name">Ghi chú rà soát dữ liệu (lần cập nhật gần nhất)</span>
                </summary>
                <div className="src-empty-item">{auditNote}</div>
              </details>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
