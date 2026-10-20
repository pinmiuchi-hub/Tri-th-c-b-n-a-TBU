GET DATA /TYPE=TXT /FILE="khao_sat_sonla_65.csv" /DELCASE=LINE /DELIMITERS="," /QUALIFIER='"' /VARIABLES=MAPHIEU A20 D6 A30.
DATASET NAME t WINDOW=FRONT.
VALUE LABELS
  D6
    1 'Rat can thiet'
    2 'Can thiet'
    3 'Binh thuong'
    4 'Khong can thiet'
    5 'Hoan toan khong can thiet'.
FREQUENCIES VARIABLES=D6.