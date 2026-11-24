## Phụ lục J — Cấu trúc nội dung giao diện WebGIS, bộ tri thức bản địa và hình ảnh sử dụng trên hệ thống

Phụ lục này trình bày đầy đủ các nội dung mà chương trình WebGIS hiển thị cho người dùng, gồm ba phần: (i) toàn bộ khối thông tin của bảng “Thông tin địa bàn” hiển thị khi chọn một xã/phường; (ii) bộ tri thức bản địa theo từng dân tộc, gồm chủ đề, nội dung, bài thuốc, nông lịch và lược đồ mặt cắt; (iii) toàn bộ hình ảnh được dùng trực tiếp trên hệ thống, kèm nguồn tác giả và giấy phép. Phụ lục đối chiếu với các đoạn mã nguồn chung tại Phụ lục H và hướng dẫn vận hành tại Phụ lục D.

### J.1. Cấu trúc bảng “Thông tin địa bàn”

Khi người dùng chuyển sang chế độ xem cấp xã và bấm chọn một đơn vị hành chính trên bản đồ, cột phải của giao diện hiển thị bảng “Thông tin địa bàn”. Bảng được dựng tự động theo mã hành chính (`ma_xa`) từ nhiều nguồn dữ liệu khác nhau, mỗi khối chỉ hiển thị khi có dữ liệu tương ứng (Bảng J.1).

**Bảng J.1. Các khối nội dung của bảng “Thông tin địa bàn”**

| STT | Khối nội dung | Nội dung hiển thị | Nguồn dữ liệu | Điều kiện hiển thị |
|---|---|---|---|---|
| 1 | Tiêu đề bảng | Tên bảng, tên tỉnh đang xem, nút đóng | Trạng thái ứng dụng | Luôn hiển thị ở chế độ xem cấp xã |
| 2 | Tên và loại đơn vị | Tên xã/phường (chỉnh sửa trực tiếp), chip loại đơn vị, nút “Tùy chỉnh giao diện xã này” | `layers.json` → `ten_xa`, `loai` | Đã chọn xã |
| 3 | Ảnh banner dân tộc chủ đạo | Ảnh của dân tộc có tỷ lệ cao nhất; chú thích nêu tỷ lệ phần trăm và trạng thái nguồn (“theo nguồn đã đối chiếu” hoặc “ước tính — cần đối chiếu”); dòng ghi nguồn ảnh; bấm để xem ảnh lớn | `dan_toc.json` → `anh`, `anh_ghichu` + cơ cấu dân tộc của xã | Xã có ít nhất một dân tộc đã gắn ảnh |
| 4 | Lưới thông tin cơ bản | Mã đơn vị, Diện tích (km²), Dân số (người), Mật độ (người/km²); cả bốn trường chỉnh sửa trực tiếp | `layers.json` → `ma_xa`, `dtich_km2`, `dan_so`, `matdo_km2` | Luôn hiển thị khi đã chọn xã |
| 5 | Dòng nguồn dân số | Kỳ số liệu, liên kết “Cổng dữ liệu mở tỉnh Sơn La”, số lượng đồng bào dân tộc thiểu số (người) | `dan_so_nguon`, `dan_so_ky`, `dtts_so` | Có đủ trường trong dữ liệu |
| 6 | Đặc điểm địa bàn | Đoạn mô tả đặc trưng tự nhiên — kinh tế — xã hội của xã | `dac_diem` | Có nội dung mô tả |
| 7 | Tài liệu đính kèm | Danh sách tệp PDF của xã (tên, dung lượng), nút Xem và nút Xóa | Bộ nhớ phiên làm việc (`pdfFiles`) | Có tệp đã đính kèm |
| 8 | Các dân tộc sinh sống | Thẻ tên từng dân tộc kèm tỷ lệ %, thanh cơ cấu màu; bấm tên → mở khối tri thức bản địa; bấm vào tỷ lệ → chỉnh tỷ lệ; nút “+” để thêm dân tộc | `dan_toc.json` / layerOverrides → `dan_toc[]` | Cơ cấu dân tộc có dữ liệu |
| 9 | Bản làng tiêu biểu | Mỗi bản một thẻ: chấm màu dân tộc chủ đạo, tên bản, mô tả, ảnh (nếu có) kèm ghi nguồn ảnh; bấm ảnh để xem lớn | `layers.json` → `villages[]` ghép theo `ma_xa` | Xã có bản được gán mã hành chính |
| 10 | Luật tục cộng đồng | Mỗi vùng luật tục một thẻ: tên, loại luật tục, địa bàn hiện tại, mô tả | `layers.json` → `customary_zones[]` ghép theo `ma_xa` | Xã có vùng luật tục |
| 11 | Khối tri thức bản địa | Khi bấm tên một dân tộc: ảnh dân tộc (đổi hoặc xóa), tên, ngôn ngữ, dân số cả nước, mô tả; mục “Nguồn tham khảo” (thu gọn); nút “Lược đồ mặt cắt” và “Nông lịch” (dành cho Thái, Mông, Mường); thanh tab từng chủ đề tri thức; nội dung chủ đề; thẻ bài thuốc (nguyên liệu — công dụng); biểu mẫu thêm chủ đề và thêm bài thuốc | `dan_toc.json` → từng mục trong `dan_toc[]` + dữ liệu nông lịch, mặt cắt | Đã bấm tên một dân tộc tại khối số 8 |
| 12 | Trạng thái chưa chọn xã | Mờ chờ kèm hướng dẫn “Click vào một xã/phường trên bản đồ để xem và chỉnh sửa thông tin” | Trạng thái ứng dụng | Chưa chọn xã |
| 13 | Thống kê tỉnh | Diện tích, dân số, số xã/phường của tỉnh (chỉnh sửa trực tiếp) + ghi chú nguồn số liệu | Thống kê cấp tỉnh | Luôn hiển thị dưới bảng |

### J.2. Mã nguồn dựng bảng “Thông tin địa bàn”

Các đoạn mã dưới đây trích từ trang chính `src/pages/WebGIS goc.tsx`, là phần dựng các khối chủ đạo của bảng theo đúng thứ tự hiển thị.

**Đoạn mã J.1. Khối banner ảnh dân tộc chủ đạo, lưới thông tin và dòng nguồn dân số**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 3107–3170.

```tsx
{selectedWard ? (
                  <div className="ward-info">
                    <div className="ward-name-wrap">
                      <EditableValue
                        value={(getWardValue(selectedWard, "ten_xa") as string) || selectedWard.ten_xa}
                        className="ward-name-editable"
                        onSave={v => updateWardField(selectedWard.ma_xa, "ten_xa", v)}
                      />
                    </div>
                    <div className="ward-badge-row"><button
  className="ward-style-edit-btn"
  onClick={() => setEditingWardStyle(selectedWard)}
  title="Tùy chỉnh màu sắc / đường viền riêng cho xã này"
>
  🎨 Tùy chỉnh giao diện xã này
</button>
                      <EditableValue
                        value={(getWardValue(selectedWard, "loai") as string) || selectedWard.loai || ""}
                        placeholder="Loại đơn vị"
                        className="ward-badge-editable"
                        onSave={v => updateWardField(selectedWard.ma_xa, "loai", v)}
                      />
                    </div>
                    {(() => {
                      const dom = (wardDanToc || []).filter(d => (d.ty_le || 0) > 0).slice().sort((a, b) => (b.ty_le || 0) - (a.ty_le || 0))[0];
                      const info = dom ? getDanTocInfo(dom.dan_toc) : undefined;
                      if (!info?.anh) return null;
                      const ten = info.ten.replace("Dân tộc ", "").replace("Người ", "");
                      const tt = selectedWard.dan_toc_trang_thai;
                      const mucDo = tt === "co_nguon" ? "theo nguồn đã đối chiếu" : "ước tính — cần đối chiếu";
                      return (
                        <div className="ward-banner" onClick={() => setEthnicPhotoLightbox(assetUrl(info.anh))} title="Xem ảnh lớn">
                          <img src={assetUrl(info.anh)} alt={info.ten} loading="lazy" />
                          <div className="ward-banner-caption">
                            <div className="ward-banner-title">Ảnh minh họa · {ten} — dân tộc chủ đạo của {selectedWard.ten_xa} ({dom.ty_le}%, {mucDo})</div>
                            {info.anh_ghichu && <div className="ward-banner-credit">Nguồn ảnh: {info.anh_ghichu}</div>}
                          </div>
                        </div>
                      );
                    })()}

                   <div className="info-grid">
  <div className="info-row"><div className="info-label">Mã đơn vị</div><div className="info-value">{selectedWard.ma_xa}</div></div>
  <div className="info-row"><div className="info-label">Diện tích</div><div className="info-value">{renderEditWard({ field: "dtich_km2", suffix: " km²", type: "number", decimals: 2 })}</div></div>
  <div className="info-row"><div className="info-label">Dân số</div><div className="info-value">{renderEditWard({ field: "dan_so", suffix: " người", type: "number" })}</div></div>
  <div className="info-row"><div className="info-label">Mật độ</div><div className="info-value">{renderEditWard({ field: "matdo_km2", suffix: " ng/km²", type: "number", decimals: 1 })}</div></div>
  </div>
  {selectedWard.dan_so_nguon && (
    <div className="ward-data-src">
      Dân số, mật độ: {selectedWard.dan_so_ky || "Số liệu chính thống"} ·{" "}
      <a href={selectedWard.dan_so_nguon} target="_blank" rel="noopener noreferrer">Cổng dữ liệu mở tỉnh Sơn La</a>
      {typeof selectedWard.dtts_so === "number" && <span> · DTTS: {selectedWard.dtts_so.toLocaleString("vi-VN")} người</span>}
    </div>
  )}

                    {selectedWard.dac_diem && (
                      <div className="ward-dacdiem">
                        <div className="ethnic-section-title">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          Đặc điểm địa bàn
                        </div>
                        <p className="ward-dacdiem-text">{selectedWard.dac_diem}</p>
                      </div>
                    )}
```

**Đoạn mã J.2. Khối bản làng tiêu biểu và luật tục cộng đồng (ghép theo mã hành chính)**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 3215–3262.

```tsx
{(() => {
                      const wardVillages = (layersData?.villages || []).filter(v => v.ma_xa === selectedWard.ma_xa);
                      if (!wardVillages.length) return null;
                      return (
                        <div className="ward-place-section">
                          <div className="ward-place-title">🏘️ Bản làng tiêu biểu ({wardVillages.length})</div>
                          {wardVillages.map((v, i) => {
                            const info = getDanTocInfo(v.dan_toc);
                            return (
                              <div className="ward-place-card" key={v.id || `vil-${i}`}>
                                <div className="ward-place-head">
                                  <span className="ward-place-dot" style={{ background: info?.mau || "#6d4c41" }} />
                                  <span className="ward-place-name">{v.ten}</span>
                                  {info && <span className="ward-place-ethnic">{info.ten.replace("Dân tộc ", "").replace("Người ", "")}</span>}
                                </div>
                                {v.mo_ta && <p className="ward-place-desc">{v.mo_ta}</p>}
                                {v.anh && (
                                  <div className="ward-place-photo">
                                    <img src={assetUrl(v.anh)} alt={v.ten} loading="lazy" onClick={() => setEthnicPhotoLightbox(assetUrl(v.anh))} />
                                    {v.anh_ghichu && <div className="ward-place-credit">Nguồn ảnh: {v.anh_ghichu}</div>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    {(() => {
                      const wardLaw = (layersData?.customary_zones || []).filter(z => z.ma_xa === selectedWard.ma_xa);
                      if (!wardLaw.length) return null;
                      return (
                        <div className="ward-place-section">
                          <div className="ward-place-title">⚖️ Luật tục cộng đồng ({wardLaw.length})</div>
                          {wardLaw.map((z, i) => (
                            <div className="ward-place-card" key={z.id || `law-${i}`}>
                              <div className="ward-place-head">
                                <span className="ward-place-dot law" />
                                <span className="ward-place-name">{z.ten}</span>
                                <span className="ward-place-ethnic">{(z.loai || "").replace(/_/g, " ")}</span>
                              </div>
                              {z.dia_ban_hien_tai && <div className="ward-place-dia-ban">📍 {z.dia_ban_hien_tai}</div>}
                              {z.mo_ta && <p className="ward-place-desc">{z.mo_ta}</p>}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
```

**Đoạn mã J.3. Khối tri thức bản địa khi chọn một dân tộc**

*Trích từ* `src/pages/WebGIS goc.tsx`, dòng 3264–3342.

```tsx
{selectedDanToc&&(()=>{
                      const info=getDanTocInfo(selectedDanToc.id)!;
                      const ethnicPdfs=pdfFiles.get("ethnic_"+info.id)||[];
                      const triThuc=getTriThuc(info.id);
                      return(<div className="knowledge-panel">
                        {info.anh ? (
                          <div className="ethnic-photo-wrap" style={{borderColor:info.mau+"55"}}>
                            <img src={assetUrl(info.anh)} alt={info.ten} className="ethnic-photo" onClick={()=>setEthnicPhotoLightbox(assetUrl(info.anh!))} loading="lazy"/>
                            {info.anh_ghichu&&<div className="ethnic-photo-credit" style={{color:info.mau}}>Nguồn ảnh: {info.anh_ghichu}</div>}
                            <div className="ethnic-photo-actions">
                              <button className="ethnic-photo-btn" onClick={()=>pickEthnicPhoto(info.id)} title="Đổi ảnh">🔄</button>
                              <button className="ethnic-photo-btn delete" onClick={()=>{ if (confirm("Xóa ảnh dân tộc này?")) setEthnicPhoto(info.id, undefined); }} title="Xóa ảnh">🗑️</button>
                            </div>
                          </div>
                        ) : (
                          <button className="ethnic-photo-add" onClick={()=>pickEthnicPhoto(info.id)} style={{borderColor:info.mau,color:info.mau}}>
                            📷 Thêm ảnh minh họa cho {info.ten.replace("Dân tộc ", "").replace("Người ", "")}
                          </button>
                        )}
                        <div className="knowledge-header" style={{borderLeftColor:info.mau}}>
                          <div className="knowledge-name" style={{color:info.mau}}>{info.ten}</div>
                          <div className="knowledge-meta-row">
                            <EditableValue value={info.ngon_ngu} className="editable-meta" onSave={v=>updateEthnicField(info.id,"ngon_ngu",v)}/>
                            <span> · </span>
                            <EditableValue value={info.dan_so_ca_nuoc} suffix=" người" type="number" className="editable-meta" onSave={v=>updateEthnicField(info.id,"dan_so_ca_nuoc",parseInt(v)||0)}/>
                          </div>
                          <EditableValue value={info.mo_ta} className="knowledge-desc-editable" onSave={v=>updateEthnicField(info.id,"mo_ta",v)}/>
                          {(info as any).nguon?.length>0&&(<details style={{marginTop:6,fontSize:11,opacity:.85}}><summary style={{cursor:"pointer"}}>📚 Nguồn tham khảo ({(info as any).nguon.length})</summary><ul style={{margin:"4px 0 0 16px",padding:0}}>{(info as any).nguon.map((n:string,i:number)=>(<li key={i}>{n}</li>))}</ul><div style={{marginTop:4,color:"#f4a261"}}>{(info as any).ghi_chu_nguon}</div></details>)}
                        </div>
                        {toEthnicKey(info.id)&&(<div style={{display:"flex",gap:8,margin:"8px 0",flexWrap:"wrap"}}>
                          <button className="edit-mode-btn" onClick={()=>setTransectFor(toEthnicKey(info.id))}>⛰️ Lược đồ mặt cắt</button>
                          <button className="edit-mode-btn" onClick={()=>setCalendarFor(toEthnicKey(info.id))}>📅 Nông lịch</button>
                        </div>)}
                        {ethnicPdfs.length>0&&<div className="ethnic-pdf-list">{ethnicPdfs.map((pdf,i)=>(<div key={i} className="pdf-item"><div className="pdf-info"><span className="pdf-name">{pdf.name}</span></div><div className="pdf-actions"><button className="pdf-btn view" onClick={()=>setPdfViewer(pdf)}>Xem</button><button className="pdf-btn remove" onClick={()=>removePdf("ethnic_"+info.id,i)}>✕</button></div></div>))}</div>}
                        <div className="knowledge-tabs">
                          {triThuc.map((tt,i)=>(
                            <button key={i} className={`knowledge-tab ${activeTriThuc===i?"active":""}`} style={{"--tab-color":info.mau} as React.CSSProperties} onClick={()=>setActiveTriThuc(i)}>
                              <span>{tt.bieu_tuong}</span><span>{tt.chu_de}</span>
                            </button>
                          ))}
                          <button className="knowledge-tab add-tab" onClick={()=>setNewTopicForm({ethId:info.id,chu_de:"",bieu_tuong:"📌",noi_dung:""})} title="Thêm chủ đề mới">+</button>
                        </div>
                        {newTopicForm?.ethId===info.id&&(
                          <div className="new-topic-form">
                            <div className="ntf-row"><input className="ntf-input small" value={newTopicForm.bieu_tuong} onChange={e=>setNewTopicForm(f=>f?{...f,bieu_tuong:e.target.value}:f)} placeholder="🏺" maxLength={2}/><input className="ntf-input" value={newTopicForm.chu_de} onChange={e=>setNewTopicForm(f=>f?{...f,chu_de:e.target.value}:f)} placeholder="Tên chủ đề tri thức..."/></div>
                            <textarea className="ntf-textarea" value={newTopicForm.noi_dung} onChange={e=>setNewTopicForm(f=>f?{...f,noi_dung:e.target.value}:f)} placeholder="Mô tả tri thức bản địa về chủ đề này..." rows={3}/>
                            <div className="ntf-actions"><button className="ntf-cancel" onClick={()=>setNewTopicForm(null)}>Hủy</button><button className="ntf-save" disabled={!newTopicForm.chu_de.trim()} onClick={()=>addTriThucTopic(info.id,newTopicForm.chu_de,newTopicForm.bieu_tuong,newTopicForm.noi_dung)}>Thêm chủ đề</button></div>
                          </div>
                        )}
                        {triThuc[activeTriThuc]&&(
                          <div className="knowledge-content">
                            <div className="knowledge-topic-header">
                              <div className="knowledge-topic">
                                <EditableValue value={triThuc[activeTriThuc].bieu_tuong} className="editable-symbol" onSave={v=>updateTriThucField(info.id,activeTriThuc,"bieu_tuong",v)}/>
                                <EditableValue value={triThuc[activeTriThuc].chu_de} className="editable-topic-name" onSave={v=>updateTriThucField(info.id,activeTriThuc,"chu_de",v)}/>
                              </div>
                              <button className="topic-delete-btn" onClick={()=>removeTriThucTopic(info.id,activeTriThuc)} title="Xóa chủ đề này">🗑️</button>
                            </div>
                            <EditableValue value={triThuc[activeTriThuc].noi_dung} className="knowledge-text-editable" onSave={v=>updateTriThucField(info.id,activeTriThuc,"noi_dung",v)} multiline/>
                            <div className="recipes">
                              <div className="recipes-title-row">
                                <button className="add-recipe-btn" onClick={()=>setEditingRecipe({ethId:info.id,topicIdx:activeTriThuc,recipeIdx:null,data:{ten:"",nguyen_lieu:"",cong_dung:""}})}>+ Thêm</button>
                              </div>
                              {triThuc[activeTriThuc].bai_thuoc.map((bt,i)=>(
                                <div key={i} className="recipe-card" style={{borderColor:info.mau+"50"}}>
                                  <div className="recipe-name-row">
                                    <EditableValue value={bt.ten} className="recipe-name" onSave={v=>{const recs=[...triThuc[activeTriThuc].bai_thuoc];recs[i]={...recs[i],ten:v};updateBaiThuoc(info.id,activeTriThuc,recs);}}/>
                                    <button className="recipe-delete-btn" onClick={()=>{const recs=triThuc[activeTriThuc].bai_thuoc.filter((_,ri)=>ri!==i);updateBaiThuoc(info.id,activeTriThuc,recs);}}>✕</button>
                                  </div>
                                  <div className="recipe-row"><span className="recipe-label">Nguyên liệu:</span><EditableValue value={bt.nguyen_lieu} className="recipe-val-edit" onSave={v=>{const recs=[...triThuc[activeTriThuc].bai_thuoc];recs[i]={...recs[i],nguyen_lieu:v};updateBaiThuoc(info.id,activeTriThuc,recs);}}/></div>
                                  <div className="recipe-row"><span className="recipe-label">Công dụng:</span><EditableValue value={bt.cong_dung} className="recipe-val-edit highlight" style={{color:info.mau}} onSave={v=>{const recs=[...triThuc[activeTriThuc].bai_thuoc];recs[i]={...recs[i],cong_dung:v};updateBaiThuoc(info.id,activeTriThuc,recs);}}/></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <button className="knowledge-close" onClick={()=>setSelectedDanToc(null)}>Đóng thông tin dân tộc</button>
                      </div>);
                    })()}
```

### J.3. Bộ tri thức bản địa trên hệ thống

Bộ tri thức bản địa là nội dung đặc thù nhất của hệ thống: hiện có 18 dân tộc được khai báo trong tệp `dan_toc.json`, mỗi dân tộc có từ 1 đến 6 chủ đề tri thức (nông nghiệp, y học dân gian, lễ hội — tín ngưỡng, kiến trúc nhà sàn, nghề truyền thống, chữ viết cổ…) kèm bài thuốc hoặc thông tin mẫu có trường nguyên liệu — công dụng. Nội dung hiển thị theo tab trong khối tri thức, chỉnh sửa trực tiếp trên giao diện và lưu theo phiên làm việc. Danh mục tổng hợp số lượng xem Bảng J.2; toàn bộ nội dung chi tiết, nguyên văn theo dữ liệu hệ thống, được trình bày tại mục J.4. Nông lịch và lược đồ mặt cắt mặc định đi kèm hệ thống được trình bày tại mục J.5.
