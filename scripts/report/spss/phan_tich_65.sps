* Phân tích SPSS thật — 65 phiếu khảo sát tri thức bản địa Sơn La (Phù Yên cũ).
* Nguồn dữ liệu: khao_sat_sonla_65.csv (trích từ Nhap_lieu_phieu_khao_sat_TTBD_SonLa.xlsx).
* Chạy batch: pspp phan_tich_65.sps -o ket_qua.html --syntax-encoding=UTF-8 -b

GET DATA /TYPE=TXT
  /FILE='khao_sat_sonla_65.csv'
  /ARRANGEMENT=DELIMITED
  /FIRSTCASE=2
  /DELIMITERS=','
  /QUALIFIER='"'
  /DELCASE=LINE
  /VARIABLES=
  MAPHIEU A20
  GIOITINH F1 NAMSINH F4 DANTOC F1 NAMSONG F1 TRINHDO F1 THUNHAP F1
  THAMGIA_DAT F1 NGUNG_NAM F4 LYDO_NGUNG F1 DAT6 F1
  NUOC22 F1 NUOC5 F1 NUOC7 F1
  RUNG1 F1 RUNG2 F1 RUNG3 F1 RUNG41 F1 RUNG51 F1 RUNG7 F1
  BD3 F1 BD5 F1
  DAT2_bonphan F1 DAT2_phanchuong F1 DAT2_vatnuoi F1 DAT2_checover F1 DAT2_luancanh F1
  DAT2_ruongbat F1 DAT2_dongmuc F1 DAT2_nghialand F1 DAT2_khongcaitao F1 DAT2_khac F1
  DAT3_trithuc F1 DAT3_nhanNuoc F1 DAT3_tuHoc F1 DAT3_hocDanToc F1 DAT3_chuaUNG F1 DAT3_khac F1
  DAT4_bonphan F1 DAT4_phanchuong F1 DAT4_vatnuoi F1 DAT4_checover F1 DAT4_luancanh F1
  DAT4_ruongbat F1 DAT4_dongmuc F1 DAT4_nghialand F1 DAT4_khongcaitao F1 DAT4_khac F1
  DAT5_khongGhichep F1 DAT5_LopTre F1 DAT5_NguoiGia F1 DAT5_PhanBonHoa F1 DAT5_khac F1
  NUOC1_thuongnguon F1 NUOC1_hamnguon F1 NUOC1_mo F1 NUOC1_songsuoi F1 NUOC1_ngum F1 NUOC1_mua F1 NUOC1_khac F1
  NUOC21_tttn F1 NUOC21_tlTruyenThong F1 NUOC21_tlHienDai F1 NUOC21_khac F1
  NUOC23_ngaycong F1 NUOC23_tusua F1 NUOC23_tuantra F1 NUOC23_trongcay F1 NUOC23_nghiLy F1 NUOC23_khongco F1 NUOC23_khac F1
  NUOC3_nhaNuoc F1 NUOC3_huongUoc F1 NUOC3_LuatTuc F1 NUOC3_khac F1
  NUOC4_dauNguon F1 NUOC4_congDong F1 NUOC4_phanChia F1 NUOC4_taiSD F1 NUOC4_khong F1 NUOC4_khac F1
  NUOC6_phuThuoc F1 NUOC6_BDKH F1 NUOC6_yLi F1 NUOC6_BienDong F1 NUOC6_khac F1
  RUNG6_truyenMieng F1 RUNG6_LopTre F1 RUNG6_NguoiGia F1 RUNG6_NhaTruong F1 RUNG6_khac F1
  BD1_giay F1 BD1_app F1 BD1_sodo F1 BD1_chuabiet F1 BD1_khac F1
  BD2_hientriatDat F1 BD2_diahinh F1 BD2_songsuoi F1 BD2_hanhChinh F1 BD2_giaoThong F1
  BD2_danCu F1 BD2_nongLich F1 BD2_quyDinh F1 BD2_khac F1
  BD4_truongBan F1 BD4_canBo F1 BD4_nghienCuu F1 BD4_hoGiaDinh F1.
DATASET NAME t WINDOW=FRONT.

VARIABLE LABELS
  MAPHIEU 'Ma phieu'
  GIOITINH 'Gioi tinh'
  NAMSINH 'Nam sinh'
  DANTOC 'Dan toc'
  NAMSONG 'So nam sinh song tai dia phuong'
  TRINHDO 'Trinh do hoc van'
  THUNHAP 'Hoat dong tao thu nhap chinh'
  THAMGIA_DAT 'C1.1 Tham gia quan ly dat'
  NGUNG_NAM 'C1.3 So nam ngung su dung dat'
  LYDO_NGUNG 'C1.4 Ly do ngung su dung dat'
  DAT6 'C6 muc do can so hoa DAT'
  NUOC22 'C2.2 Tan suat su dung TL truyen thong'
  NUOC5 'C5 Tan suat bao ve nuoc'
  NUOC7 'C7 muc do can so hoa NUOC'
  RUNG1 'C1 Phan loai rung theo phong tuc'
  RUNG2 'C2 Ghi huong uoc'
  RUNG3 'C3 Trung giao khoan vs rung thieng'
  RUNG41 'C4.1 Thu hai san pham rung'
  RUNG51 'C5.1 Giup cay rung tu phuc hoi'
  RUNG7 'C7 muc do can so hoa RUNG'
  BD3 'C3 Hinh thuc ban do mong muon'
  BD5 'C5 Muc do san sang su dung ban do'.

VALUE LABELS
  /GIOITINH 1 'Nam' 2 'Nu'
  /DANTOC 1 'Thai' 2 'Mong' 3 'Muong'
  /NAMSONG 1 'Duoi 5 nam' 2 '5-15 nam' 3 'Tren 15 nam'
  /TRINHDO 1 'Chua qua dao tao' 2 'Tieu hoc' 3 'THCS' 4 'THPT' 5 'Trung cap/Cao dang/Dai hoc tro len'
  /THUNHAP 1 'Nong nghiep' 2 'Chan nuoi' 3 'Lam nghiep' 4 'Cong nhan/vien chuc Nha nuoc' 5 'Khac' 6 'Dich vu' 7 'Tieu thu cong nghiep'
  /THAMGIA_DAT 1 'Dang tham gia thuong xuyen' 2 'Da tung tham gia nhung hien da ngung'
  /LYDO_NGUNG 1 'Thieu nhan luc' 2 'Chuyen doi muc dich theo quy hoach' 3 'Dat bac mau xoi mon nang' 4 'Khac'
  /DAT6 1 'Binh thuong' 2 'Can thiet' 3 'Rat can thiet'
  /NUOC22 1 'Thuong xuyen' 2 'Rat hiem khi' 3 'Thinh thoang' 4 'It khi' 5 'Rat thuong xuyen'
  /NUOC5 1 'Thinh thoang' 2 'Thuong xuyen' 3 'Khong bao gio' 4 'Luon luon' 5 'Hiep khi'
  /NUOC7 1 'Hoan toan khong can thiet' 2 'Binh thuong' 3 'Can thiet' 4 'Rat can thiet'
  /RUNG1 TO RUNG51 1 'Co' 2 'Khong'
  /RUNG7 1 'Hoan toan khong can thiet' 2 'Khong can thiet' 3 'Binh thuong' 4 'Can thiet' 5 'Rat can thiet'
  /BD3 1 'Ban do giay treo NVB' 2 'Ca hai' 3 'Khong co nhu cau' 4 'App/website dien thoai'
  /BD5 1 'San sang dung thuong xuyen' 2 'Dung khi can' 3 'Khong co nhu cau'.

FREQUENCIES VARIABLES=GIOITINH DANTOC NAMSONG TRINHDO THUNHAP
  THAMGIA_DAT LYDO_NGUNG DAT6
  NUOC22 NUOC5 NUOC7
  RUNG1 RUNG2 RUNG3 RUNG41 RUNG51 RUNG7
  BD3 BD5
  /ORDER=ANALYSIS.

DESCRIPTIVES VARIABLES=NGUNG_NAM DAT6 NUOC7 RUNG7
  /STATISTICS=MEAN STDDEV MIN MAX.

* Multiple response sets (chon nhieu) — ty le tinh tren 65 phieu.
MRSETS
  /MDGROUP NAME=$DAT2 VARIABLES=DAT2_bonphan DAT2_phanchuong DAT2_vatnuoi DAT2_checover DAT2_luancanh DAT2_ruongbat DAT2_dongmuc DAT2_nghialand DAT2_khongcaitao DAT2_khac VALUE=1 LABEL='C2 Cach quan ly dat'
  /MDGROUP NAME=$DAT3 VARIABLES=DAT3_trithuc DAT3_nhanNuoc DAT3_tuHoc DAT3_hocDanToc DAT3_chuaUNG DAT3_khac VALUE=1 LABEL='C3 Nguon bien phap dat'
  /MDGROUP NAME=$DAT4 VARIABLES=DAT4_bonphan DAT4_phanchuong DAT4_vatnuoi DAT4_checover DAT4_luancanh DAT4_ruongbat DAT4_dongmuc DAT4_nghialand DAT4_khongcaitao DAT4_khac VALUE=1 LABEL='C4 Bien phap hieu qua nhat'
  /MDGROUP NAME=$DAT5 VARIABLES=DAT5_khongGhichep DAT5_LopTre DAT5_NguoiGia DAT5_PhanBonHoa DAT5_khac VALUE=1 LABEL='C5 Nguyen hien tai mai mot dat'
  /MDGROUP NAME=$NUOC1 VARIABLES=NUOC1_thuongnguon NUOC1_hamnguon NUOC1_mo NUOC1_songsuoi NUOC1_ngum NUOC1_mua NUOC1_khac VALUE=1 LABEL='C1 Nguon nuoc'
  /MDGROUP NAME=$NUOC21 VARIABLES=NUOC21_tttn NUOC21_tlTruyenThong NUOC21_tlHienDai NUOC21_khac VALUE=1 LABEL='C2.1 Cach khai thac nuoc'
  /MDGROUP NAME=$NUOC23 VARIABLES=NUOC23_ngaycong NUOC23_tusua NUOC23_tuantra NUOC23_trongcay NUOC23_nghiLy NUOC23_khongco NUOC23_khac VALUE=1 LABEL='C2.3 Bao ve TL truyen thong'
  /MDGROUP NAME=$NUOC3 VARIABLES=NUOC3_nhaNuoc NUOC3_huongUoc NUOC3_LuatTuc NUOC3_khac VALUE=1 LABEL='C3 Hinh thuc quy dinh nuoc'
  /MDGROUP NAME=$NUOC4 VARIABLES=NUOC4_dauNguon NUOC4_congDong NUOC4_phanChia NUOC4_taiSD NUOC4_khong NUOC4_khac VALUE=1 LABEL='C4 Bien phap cong dong nuoc'
  /MDGROUP NAME=$NUOC6 VARIABLES=NUOC6_phuThuoc NUOC6_BDKH NUOC6_yLi NUOC6_BienDong NUOC6_khac VALUE=1 LABEL='C6 Nguyen hien tai mai mot nuoc'
  /MDGROUP NAME=$RUNG6 VARIABLES=RUNG6_truyenMieng RUNG6_LopTre RUNG6_NguoiGia RUNG6_NhaTruong RUNG6_khac VALUE=1 LABEL='C6 Nguyen hien tai mai mot rung'
  /MDGROUP NAME=$BD1 VARIABLES=BD1_giay BD1_app BD1_sodo BD1_chuabiet BD1_khac VALUE=1 LABEL='C1 Loai ban do da biet'
  /MDGROUP NAME=$BD2 VARIABLES=BD2_hientriatDat BD2_diahinh BD2_songsuoi BD2_hanhChinh BD2_giaoThong BD2_danCu BD2_nongLich BD2_quyDinh BD2_khac VALUE=1 LABEL='C2 Thong tin tren ban do'
  /MDGROUP NAME=$BD4 VARIABLES=BD4_truongBan BD4_canBo BD4_nghienCuu BD4_hoGiaDinh VALUE=1 LABEL='C4 Ai quan ly ban do'.

CROSSTABS
  /TABLES=DANTOC BY BD3
  /FORMAT=AVALUE TABLES
  /CELLS=COUNT ROW COLUMN EXPECTED
  /COUNT ROUND CELL
  /STATISTICS=CHISQ PHI.

CROSSTABS
  /TABLES=GIOITINH BY DANTOC
  /FORMAT=AVALUE TABLES
  /CELLS=COUNT ROW COLUMN
  /STATISTICS=CHISQ.

CROSSTABS
  /TABLES=DANTOC BY RUNG3
  /FORMAT=AVALUE TABLES
  /CELLS=COUNT ROW COLUMN
  /STATISTICS=CHISQ.

EXAMINE VARIABLES=NGUNG_NAM
  /PLOT=NONE
  /STATISTICS=DESCRIPTIVES
  /MISSING=LISTWISE
  /NOTOTAL.

SAVE OUTFILE='khao_sat_65_clean.sav'
  /COMPRESSED.
