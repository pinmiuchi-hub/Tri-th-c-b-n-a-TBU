// Lớp tri thức bản địa (Đất · Nước · Rừng) — khung dữ liệu đọc từ public/data/tri_thuc_ban_dia.json.
// Danh sách id được đồng bộ vào module này khi app tải JSON để các component con
// (LayerDataEditor, popup…) nhận ra lớp mà không cần prop drilling.
export interface KnowledgeLayerDef {
  id: string;
  ten: string;
  category: string;
  icon: string;
  mau: string;
  features: any[];
}

let knowledgeIds = new Set<string>();

export const syncKnowledgeLayerIds = (defs: KnowledgeLayerDef[]): void => {
  knowledgeIds = new Set(defs.map(d => d.id));
};

export const isKnowledgeLayer = (layerId: string): boolean => knowledgeIds.has(layerId);
