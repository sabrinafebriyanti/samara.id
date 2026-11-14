# SAMARA (Versi Statis)

SAMARA adalah aplikasi pelaporan fasilitas publik untuk Bandar Lampung. Versi ini telah dikonversi menjadi **web statis** (tanpa backend Python/database) sehingga dapat dijalankan langsung dari file HTML atau di-hosting sebagai situs statis.

## Struktur Proyek

```text
SAMARA/
├─ frontend/
│  ├─ index.html
│  ├─ assets/img/
│  ├─ css/
│  ├─ js/
│  └─ pages/
│     ├─ admin.html
│     ├─ petugas.html
│     ├─ login.html
│     └─ ...
├─ docs/
│  ├─ README.md
│  └─ CARA_MENJALANKAN.txt
├─ backend/                # (arsip) versi server lama, tidak dipakai di mode statis
└─ scripts/                # (arsip) script server lama
```

## Cara Menjalankan

- **Paling mudah:** buka `frontend/index.html` di browser.
- **Disarankan:** jalankan server statis dari folder `frontend`:
  - `python -m http.server 8000` lalu buka `http://127.0.0.1:8000`

## Fitur (Mode Statis)

- Form laporan, pelacakan, statistik, dan peta menggunakan data **localStorage** browser.
- Leaflet/OpenStreetMap, pencarian alamat (Nominatim), dan cuaca (Open-Meteo) memerlukan koneksi internet.
- Login admin/petugas demo lokal:
  - Admin: `admin@samara.com` / `petugas123`
  - Petugas: `petugas@samara.com` / `petugas123`

## Catatan

- Data hanya tersimpan di perangkat/browser yang sama dan tidak tersinkron ke server.
- Cocok untuk demo/prototipe/hosting statis. Untuk penggunaan produksi multi-pengguna, diperlukan backend dan penyimpanan terpusat.
