# Sistem Data Jadwal Kuliah (Class Schedule System)

Aplikasi web modern untuk manajemen dan pemantauan jadwal perkuliahan terstruktur dengan tampilan baru berbasis **Referensi UI Dashboard, Tabel Jadwal, dan Formulir Penjadwalan Interaktif**. Sistem dilengkapi dengan mesin deteksi bentrok ruang dan waktu (*conflict detection engine*) secara *real-time*, panel simulasi ketersediaan cerdas, dan visualisasi okupansi ruangan.

Aplikasi terhubung langsung ke Supabase (PostgreSQL) menggunakan `@supabase/supabase-js` dan dibangun dengan HTML5, Tailwind CSS, serta Vanilla JavaScript aman tanpa dependensi eksternal.

---

## 🎨 Arsitektur & Layar Antarmuka Baru

Aplikasi menggunakan arsitektur Single Page Application (SPA) multi-view yang terbagi ke dalam 3 tampilan utama:

1. **View 1: Dashboard (`#dashboard` - Referensi 1)**
   - Sambutan personal dengan status koneksi Supabase (`AKTIF` / `TIDAK TERHUBUNG`) dan tanggal hari ini lengkap.
   - **4 Kartu Metrik Ringkasan (KPI)** dilengkapi cincin progres SVG dinamis:
     - *TOTAL JADWAL KULIAH:* Total baris perkuliahan terdaftar beserta jumlah sesi hari ini.
     - *TOTAL RUANG AKTIF:* Jumlah ruangan unik terpakai beserta okupansi hari ini.
     - *TOTAL DOSEN TERDAFTAR:* Jumlah dosen unik pengampu beserta dosen yang aktif mengajar hari ini.
     - *BEBAS BENTROK:* Persentase jadwal tanpa tumpang tindih waktu pada hari dan ruang yang sama (100% Aman / Semua teratasi).
   - **Kalender Akademik Bulanan:** Kalender navigasi tanggal interaktif. Memilih tanggal akan langsung menampilkan daftar sesi perkuliahan pada hari yang bersangkutan.
   - **Daftar Sesi Perkuliahan:** Kartu jadwal perkuliahan lengkap dengan penanda status dinamis (*SEDANG KULIAH*, *MENDATANG*, *SELESAI*, *TERJADWAL*) serta jam perkuliahan (`08:00` - `09:40 WIB`).
   - **Daftar Dosen Pengajar Hari Ini:** Daftar dosen aktif pada tanggal terpilih dengan avatar inisial otomatis.

2. **View 2: Daftar Jadwal (`#jadwal` - Referensi 2)**
   - **Filter Multi-Kriteria Interaktif:**
     - Kolom live search mencari secara instan pada `matakuliah`, `dosen`, `kelas`, dan `ruang`.
     - Deretan pill filter hari: *Semua, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu*.
     - Dropdown filter *Ruang Kuliah* dinamis berdasarkan data aktual di database.
     - Tombol *Reset Filter* sekali klik.
   - **Tabel Jadwal Responsif:** Kolom *MATA KULIAH*, *DOSEN*, *KELAS* (badge), *RUANG*, *HARI*, *JAM* (`08.00-10.00`), dan *AKSI* (Ikon edit pensil & ikon hapus tempat sampah).
   - **Baris Baru Tersimpan:** Menyorot baris yang baru saja ditambah/diperbarui dengan teks ungu dan label *"Baru Tersimpan"*.
   - **Toast Notifikasi Sukses:** Notifikasi mengambang di pojok kanan bawah dengan detail mata kuliah, hari, jam, dan ruangan.

3. **View 3: Tambah / Edit Jadwal (`#tambah` - Referensi 3)**
   - Formulir 7 field: *Mata Kuliah*, *Kelas*, *Dosen Pengampu*, *Hari*, *Ruang Kuliah*, *Jam Mulai*, dan *Jam Selesai*.
   - **Deteksi Bentrok Live (Real-Time UX):**
     - Memeriksa irisan waktu seketika saat pengguna mengisi/mengubah hari, ruang, atau jam.
     - Menampilkan badge *TERDETEKSI KONFLIK*, penanda input berborder amber ganda, dan ikon peringatan ⚠️.
     - Banner peringatan bentrok dengan pesan baku:
       `Ruang sudah digunakan pada jam tersebut`
       dilengkapi rincian mata kuliah dan waktu yang bertabrakan.
   - **Panel Simulasi Kondisi Valid:**
     - Menganalisis ketersediaan ruangan dalam jendela operasional (`07:00` - `21:00`).
     - Menghasilkan rekomendasi slot jam alternatif tanpa bentrok secara deterministik.
     - Tombol *"Terapkan Parameter Valid Ini"* untuk menerapkan slot rekomendasi ke form sekali klik.
   - **Panel Okupansi Ruang:**
     - Menampilkan visualisasi kronologis seluruh perkuliahan di ruangan dan hari terpilih.
     - Membedakan slot yang sedang terpakai (amber), slot rekomendasi bebas (emerald), dan jadwal lainnya.
   - **Proteksi Mutasi Ganda:** Pengecekan final tetap dilakukan di handler submit sebelum request dikirim ke Supabase.

---

## 🚀 Panduan Setup & Menjalankan

### 1. Persiapan Database Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor**.
3. Salin seluruh isi berkas `schema.sql`, tempelkan ke SQL Editor, lalu klik tombol **Run**.

> [!WARNING]
> **Peringatan Seed Data:**
> Eksekusi skrip `schema.sql` **SEKALI SAJA**. Menjalankan skrip berulang kali akan menggandakan 3 baris data seed contoh karena tidak memiliki klausa `ON CONFLICT`.

### 2. Konfigurasi Kredensial
Buka berkas `app.js` dan isi kredensial publik Supabase Anda pada baris 1-2:
```javascript
const SUPABASE_URL = 'ISI_SUPABASE_URL_DISINI';
const SUPABASE_ANON_KEY = 'ISI_SUPABASE_ANON_KEY_DISINI';
```

### 3. Membuka Aplikasi
Buka berkas `index.html` langsung menggunakan peramban web modern (Google Chrome, Mozilla Firefox, Microsoft Edge) atau jalankan melalui web server lokal.

---

## 🔒 Kepatuhan Standar Keamanan & Aturan Mutlak

1. **Anti-XSS (SEC-01):**
   - Bebas 100% dari `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write()`, `eval()`, `new Function()`, atribut inline handler (`onclick=`, `onerror=`), serta dialog bawaan browser (`alert()`, `confirm()`, `prompt()`).
   - Seluruh elemen dinamis (kalender, sesi, tabel, avatar inisial, ring SVG, modal, toast, dan okupansi) dibuat dengan `document.createElement`/`createElementNS` dan diisi teks murni via `.textContent`.
2. **Keamanan Kredensial (SEC-02):**
   - Hanya memuat `SUPABASE_URL` dan `SUPABASE_ANON_KEY`. Tidak ada kunci rahasia backend, token privat, maupun kredensial basis data langsung.
3. **Pesan Validasi Baku:**
   - Bentrok: `Ruang sudah digunakan pada jam tersebut`
   - Kronologi jam: `Jam selesai perkuliahan harus lebih akhir dari jam mulai`

---

## ⚠️ Keterbatasan Sistem (Known Limitations)

1. **Validasi Bentrok di Sisi Klien (*Client-Side Collision Engine*):**
   Deteksi bentrok dijalankan pada logika JavaScript dengan mengambil data jadwal terbaru sebelum mutasi. Karena skema database tidak memiliki *exclusion constraint* atau *trigger* tumpang tindih waktu, terdapat potensi *race condition* jika dua pengguna menyimpan jadwal di ruang dan jam yang sama pada detik yang persis bersamaan.
2. **Koneksi Supabase:**
   Jika kredensial belum diisi, indikator status akan menampilkan *"TIDAK TERHUBUNG"* secara aman tanpa menghentikan jalannya UI aplikasi.
