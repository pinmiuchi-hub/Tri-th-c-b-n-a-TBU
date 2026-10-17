import { useEffect, useRef, useState } from "react";
import { isImageSymbol, fileToDataUrl, resizeDataUrl } from "../utils/imageUtils";

interface LayerToggle {
  id: string;
  ten: string;
  mau: string;
  bieu_tuong: string;
  active: boolean;
  isCustom?: boolean;
  isThematic?: boolean;
}

interface LayerCategory {
  id: string;
  ten: string;
  icon: string;
  layers: LayerToggle[];
  collapsed?: boolean;
  isThematic?: boolean;
}

export interface NewLayerInput {
  ten: string;
  mau: string;
  bieu_tuong: string;
  geomType: "point" | "line" | "polygon";
}

interface Props {
  categories: LayerCategory[];
  thematicCategory?: LayerCategory | null;
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
  onToggleFolderCollapse?: (categoryId: string) => void;
  onMoveLayer?: (layerId: string, targetCategoryId: string, index: number) => void;
  rasterOpacity?: number;
  onRasterOpacity?: (value: number) => void;
  thematicSource?: string;
  onClearThematic?: () => void;
  showWardLabels?: boolean;
  onToggleWardLabels?: () => void;
  wardLabelColor?: string;
  onWardLabelColor?: (value: string) => void;
  wardLabelSize?: number;
  onWardLabelSize?: (value: number) => void;
}

const PALETTE = ["#4895ef", "#2d6a4f", "#e63946", "#f4a261", "#9b5de5", "#52b788", "#74c69d", "#ffd166", "#6b4226", "#8338ec", "#e76f51", "#457b9d"];
const HINT_CLASSES = ["drop-before", "drop-after", "drop-into"];
const PRESS_DELAY_MS = 320;
const PRESS_SLOP_PX = 10;

export default function LayerControl({
  categories, thematicCategory, onToggle, onEditLayer, onEditSymbology, onAddCustomLayer, onImportLayerFile,
  onDeleteCustomLayer, onRenameCustomLayer, onRenameLayer, onAddCategory, onDeleteCategory, onRenameCategory, onRemoveBuiltinLayer, onExportLayer,
  featureCounts, editableLayers, exportableLayers, onClose, showTransect, onToggleTransect,
  showCalendar, onToggleCalendar, showKnowledge, onToggleKnowledge, showEthnicPie, onToggleEthnicPie, onOpenPieSelector,
  onToggleFolderCollapse, onMoveLayer, rasterOpacity = 0.8, onRasterOpacity, thematicSource, onClearThematic,
  showWardLabels, onToggleWardLabels, wardLabelColor = "#1b4332", onWardLabelColor, wardLabelSize = 11, onWardLabelSize
}: Props) {
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [draft, setDraft] = useState<NewLayerInput>({ ten: "", mau: PALETTE[0], bieu_tuong: "📌", geomType: "point" });
  const [exportMenuFor, setExportMenuFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);
  const [importingFor, setImportingFor] = useState<string | null>(null);
  const [labelStyleOpen, setLabelStyleOpen] = useState(false);
  const [renamingCatId, setRenamingCatId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [namingFolder, setNamingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [thematicOpen, setThematicOpen] = useState(true);

  const panelBodyRef = useRef<HTMLDivElement | null>(null);
  const pressRef = useRef<{ id: string; label: string; row: HTMLElement; x: number; y: number; timer: number; onMove: (e: PointerEvent) => void; onUp: () => void } | null>(null);
  const dragRef = useRef<{ id: string; label: string; row: HTMLElement; ghost: HTMLElement } | null>(null);
  const dropRef = useRef<{ catId: string; index: number } | null>(null);
  const hintRef = useRef<HTMLElement | null>(null);
  const moveRef = useRef<((e: PointerEvent) => void) | null>(null);
  const upRef = useRef<(() => void) | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const touchBlockRef = useRef<((e: TouchEvent) => void) | null>(null);
  const stopDragRef = useRef<(commit: boolean) => void>(() => {});

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

  const firstCatId = categories[0]?.id;
  const startAdd = (catId: string) => {
    setAddingFor(catId);
    setDraft({ ten: "", mau: PALETTE[Math.floor(Math.random() * PALETTE.length)], bieu_tuong: "📌", geomType: "point" });
  };
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

  const startRenameFolder = (cat: LayerCategory) => { setRenamingCatId(cat.id); setRenameDraft(cat.ten); };
  const commitRenameFolder = () => {
    const id = renamingCatId;
    const name = renameDraft.trim();
    setRenamingCatId(null);
    if (!id || !name) return;
    onRenameCategory(id, name);
  };
  const requestDeleteFolder = (cat: LayerCategory) => {
    const hasCustom = cat.layers.some(l => l.isCustom);
    const isUserFolder = cat.id.startsWith("group_");
    const msg = hasCustom
      ? `Xóa thư mục "${cat.ten}"? Lớp tự tạo bên trong sẽ bị xóa cùng toàn bộ dữ liệu.`
      : isUserFolder
        ? `Xóa thư mục "${cat.ten}"? Các lớp bên trong sẽ được trả về nhóm gốc.`
        : `Xóa nhóm "${cat.ten}"? Toàn bộ lớp bên trong sẽ bị ẩn khỏi bảng lớp.`;
    if (confirm(msg)) onDeleteCategory(cat.id);
  };
  const submitNewFolder = () => {
    const name = newFolderName.trim();
    if (!name) { alert("Nhập tên thư mục"); return; }
    onAddCategory(name, "📁");
    setNewFolderName("");
    setNamingFolder(false);
  };

  const combinedIds = (catId: string) => categories.find(c => c.id === catId)?.layers.map(l => l.id) ?? [];

  const clearHint = () => {
    const el = hintRef.current;
    if (el) HINT_CLASSES.forEach(cls => el.classList.remove(cls));
    hintRef.current = null;
  };

  const cancelPress = () => {
    const p = pressRef.current;
    if (!p) return;
    window.clearTimeout(p.timer);
    window.removeEventListener("pointermove", p.onMove);
    window.removeEventListener("pointerup", p.onUp);
    window.removeEventListener("pointercancel", p.onUp);
    pressRef.current = null;
  };

  const stopDrag = (commit: boolean) => {
    cancelPress();
    if (moveRef.current) { window.removeEventListener("pointermove", moveRef.current); moveRef.current = null; }
    if (upRef.current) { window.removeEventListener("pointerup", upRef.current); upRef.current = null; }
    if (cancelRef.current) { window.removeEventListener("pointercancel", cancelRef.current); cancelRef.current = null; }
    if (touchBlockRef.current) { document.removeEventListener("touchmove", touchBlockRef.current); touchBlockRef.current = null; }
    document.body.classList.remove("layer-dnd-active");
    clearHint();
    const drag = dragRef.current;
    const drop = dropRef.current;
    dragRef.current = null;
    dropRef.current = null;
    if (!drag) return;
    drag.ghost.remove();
    drag.row.classList.remove("is-dragging");
    if (commit && drop && onMoveLayer) {
      const without = combinedIds(drop.catId).filter(id => id !== drag.id);
      const index = Math.max(0, Math.min(drop.index, without.length));
      const next = [...without];
      next.splice(index, 0, drag.id);
      const cur = combinedIds(drop.catId);
      const changed = next.length !== cur.length || next.some((id, i) => id !== cur[i]);
      if (changed) onMoveLayer(drag.id, drop.catId, index);
    }
  };

  useEffect(() => { stopDragRef.current = stopDrag; });
  useEffect(() => () => { stopDragRef.current(false); }, []);

  const scrollBox = (from: HTMLElement | null): HTMLElement | null => {
    let node: HTMLElement | null = from;
    while (node && node.scrollHeight <= node.clientHeight + 1) node = node.parentElement;
    return node;
  };

  const autoScroll = (clientY: number) => {
    const box = scrollBox(panelBodyRef.current);
    if (!box) return;
    const rect = box.getBoundingClientRect();
    if (clientY < rect.top - 8 || clientY > rect.bottom + 8) return;
    if (clientY < rect.top + 44) box.scrollTop -= 8;
    else if (clientY > rect.bottom - 44) box.scrollTop += 8;
  };

  const updateDropTarget = (x: number, y: number) => {
    const drag = dragRef.current;
    if (!drag) return;
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) { clearHint(); dropRef.current = null; return; }
    const rowEl = el.closest(".layer-item") as HTMLElement | null;
    if (rowEl) {
      const targetId = rowEl.dataset.layer;
      if (!targetId || targetId === drag.id || rowEl.dataset.droppable === "0") { clearHint(); dropRef.current = null; return; }
      const catId = rowEl.dataset.cat || "";
      const ids = combinedIds(catId).filter(id => id !== drag.id);
      const pos = ids.indexOf(targetId);
      if (pos < 0) { clearHint(); dropRef.current = null; return; }
      const rect = rowEl.getBoundingClientRect();
      const before = y < rect.top + rect.height / 2;
      clearHint();
      rowEl.classList.add(before ? "drop-before" : "drop-after");
      hintRef.current = rowEl;
      dropRef.current = { catId, index: before ? pos : pos + 1 };
      return;
    }
    const folderEl = el.closest(".layer-folder-body, .layer-folder-head") as HTMLElement | null;
    if (!folderEl || folderEl.dataset.droppable === "0") { clearHint(); dropRef.current = null; return; }
    const folder = folderEl.closest(".layer-folder") as HTMLElement | null;
    if (!folder) { clearHint(); dropRef.current = null; return; }
    const catId = folderEl.dataset.cat || "";
    clearHint();
    folder.classList.add("drop-into");
    hintRef.current = folder;
    dropRef.current = { catId, index: combinedIds(catId).filter(id => id !== drag.id).length };
  };

  const beginDrag = () => {
    const p = pressRef.current;
    if (!p || dragRef.current) return;
    window.clearTimeout(p.timer);
    window.removeEventListener("pointermove", p.onMove);
    window.removeEventListener("pointerup", p.onUp);
    window.removeEventListener("pointercancel", p.onUp);
    pressRef.current = null;
    const ghost = document.createElement("div");
    ghost.className = "layer-drag-ghost";
    ghost.textContent = p.label;
    document.body.appendChild(ghost);
    ghost.style.left = `${p.x + 14}px`;
    ghost.style.top = `${p.y - 8}px`;
    p.row.classList.add("is-dragging");
    dragRef.current = { id: p.id, label: p.label, row: p.row, ghost };
    document.body.classList.add("layer-dnd-active");
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      dragRef.current.ghost.style.left = `${e.clientX + 14}px`;
      dragRef.current.ghost.style.top = `${e.clientY - 8}px`;
      updateDropTarget(e.clientX, e.clientY);
      autoScroll(e.clientY);
    };
    const onUp = () => stopDragRef.current(true);
    const onCancel = () => stopDragRef.current(false);
    moveRef.current = onMove;
    upRef.current = onUp;
    cancelRef.current = onCancel;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    const block = (ev: TouchEvent) => { if (dragRef.current && ev.cancelable) ev.preventDefault(); };
    touchBlockRef.current = block;
    document.addEventListener("touchmove", block, { passive: false });
  };

  const onRowPointerDown = (e: React.PointerEvent<HTMLElement>, layer: LayerToggle) => {
    if (!onMoveLayer || layer.isThematic) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (pressRef.current || dragRef.current) return;
    const t = e.target as HTMLElement;
    if (t.closest("button, input, select, textarea, a, .layer-toggle, .layer-export-menu")) return;
    const row = e.currentTarget;
    const x = e.clientX;
    const y = e.clientY;
    const onMove = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - x, ev.clientY - y) > PRESS_SLOP_PX) cancelPress();
    };
    const onUp = () => cancelPress();
    const timer = window.setTimeout(beginDrag, PRESS_DELAY_MS);
    pressRef.current = { id: layer.id, label: layer.ten, row, x, y, timer, onMove, onUp };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const renderRow = (layer: LayerToggle, catId: string, draggable: boolean) => (
    <div
      key={layer.id}
      className={`layer-item ${layer.active ? "active" : ""}`}
      data-layer={layer.id}
      data-cat={catId}
      data-droppable={draggable ? "1" : "0"}
      onPointerDown={draggable ? (e) => onRowPointerDown(e, layer) : undefined}
    >
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
        {!layer.isThematic && editableLayers.has(layer.id) && (
          <button className="layer-edit-btn" onClick={() => onEditLayer(layer.id)} title="Sửa dữ liệu lớp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        )}
        {!layer.isThematic && onEditSymbology && (
          <button className="layer-edit-btn" onClick={() => onEditSymbology(layer.id)} title="Chỉnh sửa ký hiệu & chú giải">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3h7a2 2 0 0 1 2 2v7"/><path d="M12 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M14.7 7.3l2 2"/><path d="M15.2 4.8l4 4"/><path d="M8 16l2-2 4 4-2 2z"/></svg>
          </button>
        )}
        {!layer.isThematic && exportableLayers.has(layer.id) && (
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
        {!layer.isThematic && (
          <button
            className="layer-delete-btn"
            onClick={() => {
              if (layer.isCustom) {
                if (confirm(`Xóa lớp "${layer.ten}" và toàn bộ dữ liệu?`)) onDeleteCustomLayer(layer.id);
              } else {
                if (confirm(`Ẩn lớp "${layer.ten}" khỏi bảng điều khiển?`)) onRemoveBuiltinLayer(catId, layer.id);
              }
            }}
            title={layer.isCustom ? "Xóa lớp tự tạo" : "Ẩn lớp khỏi bảng điều khiển"}
          >
            ✕
          </button>
        )}
        <div
          className={`layer-toggle ${layer.active ? "on" : ""}`}
          onClick={() => onToggle(layer.id)}
          title={layer.isThematic ? (layer.active ? "Đang bật — click để tắt" : "Bật bản đồ chuyên đề này") : undefined}
        >
          <div className="layer-toggle-thumb"/>
        </div>
      </div>
    </div>
  );

  const renderFolder = (cat: LayerCategory) => {
    const droppable = !cat.isThematic;
    const collapsed = cat.isThematic ? !thematicOpen : !!cat.collapsed;
    return (
      <div className={`layer-folder${collapsed ? " is-collapsed" : ""}${cat.isThematic ? " is-thematic" : ""}`} key={cat.id}>
        <div className="layer-folder-head" data-cat={cat.id} data-droppable={droppable ? "1" : "0"}>
          <button
            className="lf-caret"
            title={collapsed ? "Mở thư mục" : "Thu nhỏ thư mục"}
            onClick={() => { if (cat.isThematic) setThematicOpen(o => !o); else onToggleFolderCollapse?.(cat.id); }}
          >
            {collapsed ? "▸" : "▾"}
          </button>
          <span className="lf-icon">{cat.icon}</span>
          {renamingCatId === cat.id ? (
            <input
              className="lf-rename"
              autoFocus
              value={renameDraft}
              onChange={e => setRenameDraft(e.target.value)}
              onBlur={commitRenameFolder}
              onKeyDown={e => { if (e.key === "Enter") commitRenameFolder(); else if (e.key === "Escape") setRenamingCatId(null); }}
            />
          ) : (
            <span
              className="lf-name"
              title={droppable ? "Nhấn đúp để đổi tên" : cat.ten}
              onDoubleClick={() => { if (droppable) startRenameFolder(cat); }}
            >
              {cat.ten}
            </span>
          )}
          <span className="lf-count" title={`${cat.layers.length} lớp`}>{cat.layers.length}</span>
          {droppable && (
            <>
              <button className="lf-btn" title="Đổi tên thư mục" onClick={() => startRenameFolder(cat)}>✎</button>
              <button className="lf-btn lf-btn-danger" title="Xóa thư mục" onClick={() => requestDeleteFolder(cat)}>🗑</button>
            </>
          )}
        </div>
        {!collapsed && (
          <div className="layer-folder-body" data-cat={cat.id} data-droppable={droppable ? "1" : "0"}>
            {cat.layers.map(layer => renderRow(layer, cat.id, droppable))}
            {droppable && cat.layers.length === 0 && <div className="lf-empty">Kéo lớp vào đây</div>}
            {cat.isThematic && cat.layers.some(l => l.active) && (
              <div className="lf-thematic-tools">
                <div className="thematic-opacity">
                  <label>Độ trong suốt: {Math.round(rasterOpacity * 100)}%</label>
                  <input type="range" min={0.2} max={1} step={0.05} value={rasterOpacity} onChange={e => onRasterOpacity?.(parseFloat(e.target.value))} />
                </div>
                {thematicSource && <div className="thematic-source">Nguồn: <em>{thematicSource}</em></div>}
                <button className="thematic-clear" onClick={() => onClearThematic?.()}>Tắt lớp chuyên đề</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
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

      <div className="layer-panel-body" ref={panelBodyRef}>
        {thematicCategory && thematicCategory.layers.length > 0 && renderFolder({ ...thematicCategory, collapsed: !thematicOpen })}
        {categories.map(cat => renderFolder(cat))}

        <div className="layer-folder-new">
          {namingFolder ? (
            <div className="lf-new-form">
              <input
                className="lf-rename"
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Tên thư mục..."
                onKeyDown={e => { if (e.key === "Enter") submitNewFolder(); else if (e.key === "Escape") { setNamingFolder(false); setNewFolderName(""); } }}
              />
              <button className="laf-save" onClick={submitNewFolder}>Tạo</button>
              <button className="laf-cancel" onClick={() => { setNamingFolder(false); setNewFolderName(""); }}>Hủy</button>
            </div>
          ) : (
            <button className="lf-new-btn" onClick={() => setNamingFolder(true)}>＋ Tạo thư mục</button>
          )}
        </div>

        {firstCatId ? (
          addingFor === firstCatId ? (
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
              <button className="laf-save" onClick={() => submitAdd(firstCatId)}>Tạo lớp</button>
            </div>
          </div>
        ) : (
          <div className="layer-add-row">
            <button className="layer-add-btn" onClick={() => startAdd(firstCatId)}>+ Thêm lớp trống</button>
            <button className="layer-import-btn" onClick={() => startImport(firstCatId)} title="Nhập lớp từ file GeoJSON hoặc KML">📁 Nhập GeoJSON / KML</button>
          </div>
        )
        ) : null}
        <input ref={fileInputRef} type="file" accept=".geojson,.json,.kml,application/geo+json,application/vnd.google-earth.kml+xml" style={{ display: "none" }} onChange={handleFileChosen}/>
        <input ref={symbolInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif" style={{ display: "none" }} onChange={handleSymbolFileChosen}/>

        <div className="layer-category">
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
          {onToggleWardLabels && (
          <div className={`layer-item ${showWardLabels ? "active" : ""}`}>
            <div className="layer-item-left">
              <div className="layer-dot" style={{ background: "#b7e4c7" }}/>
              <span className="layer-symbol">🏷️</span>
              <span className="layer-name">Tên xã trên bản đồ</span>
            </div>
            <div className="layer-item-actions">
              <button className="layer-edit-btn" onClick={() => setLabelStyleOpen(o => !o)} title="Đổi màu chữ & cỡ chữ tên xã">🎨</button>
              <div className={`layer-toggle ${showWardLabels ? "on" : ""}`} onClick={onToggleWardLabels}>
                <div className="layer-toggle-thumb"/>
              </div>
            </div>
          </div>
          )}
          {labelStyleOpen && (
            <div className="ward-label-style">
              <div className="ward-label-row">
                <label>Màu chữ</label>
                <input type="color" value={wardLabelColor} onChange={e => onWardLabelColor?.(e.target.value)} title="Chọn màu chữ tên xã"/>
                <span className="ward-label-preview" style={{ color: wardLabelColor, fontSize: `${wardLabelSize}px` }}>Xã Mường Lay</span>
              </div>
              <div className="ward-label-row">
                <label>Cỡ chữ: {wardLabelSize}px</label>
                <input type="range" min={8} max={22} value={wardLabelSize} onChange={e => onWardLabelSize?.(Number(e.target.value))} title="Kích cỡ chữ tên xã"/>
              </div>
            </div>
          )}
        </div>

        <div className="layer-legend-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Nhấn giữ rồi kéo để sắp xếp lớp · Kéo lớp vào thư mục để gộp nhóm · "+ Tạo thư mục" để tạo nhóm mới
        </div>

      </div>
    </div>
  );
}
export type { LayerCategory, LayerToggle };
