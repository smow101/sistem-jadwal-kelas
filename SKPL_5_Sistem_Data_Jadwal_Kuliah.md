# SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SKPL)

## SISTEM DATA JADWAL KULIAH

---

## 1. Deskripsi Pekerjaan

Pengembangan aplikasi Class Schedule berbasis web untuk mencatat dan mengelola jadwal perkuliahan secara terstruktur. Sistem menyimpan informasi mata kuliah, dosen, kelas, ruang, dan waktu, serta dilengkapi fitur deteksi bentrok jadwal sederhana.

## 2. Capaian Utama (Main Achievement)

Terbangunnya sistem jadwal kuliah berbasis web yang fungsional, mencakup manajemen jadwal (CRUD), pencarian/filter interaktif, serta validasi bentrok jadwal pada hari, ruang, atau kelas yang sama.

## 3. Tujuan Aplikasi

1. Mempermudah pencatatan dan pencarian jadwal kuliah.
2. Mengurangi risiko jadwal ganda melalui validasi dasar bentrok waktu.
3. Melatih implementasi filter data kompleks dan validasi jam perkuliahan.

## 4. Teknologi yang Digunakan (Tech Stack)

- **Frontend:** HTML5, CSS3, JavaScript.
- **Backend:** PHP / Node.js.
- **Database:** MySQL / MariaDB.
- **Testing:** Black Box Testing.

## 5. Alur Utama Sistem

Buka Aplikasi → Dashboard → Daftar Jadwal → Tambah Jadwal → Validasi Bentrok → Simpan → Edit/Update → Search/Filter → Hapus.

## 6. Format Narasumber (NARSUM)

> **PENTING:** Apabila terdapat format penyampaian laporan, struktur pengumpulan dokumen, atau spesifikasi khusus yang diberikan secara langsung oleh Narasumber (Narsum) / Dosen / Pembimbing, maka format dari narsum tersebut bersifat mutlak dan harus menjadi acuan utama, mengesampingkan template dasar yang ada pada dokumen ini.

## 7. Batasan Scope

- Tidak mencakup presensi mahasiswa/dosen.
- Tidak mencakup Kartu Rencana Studi (KRS) atau penilaian.
- Tidak mencakup integrasi SIAKAD kampus.

*Halaman 1 dari 2*

---

## 8. MODUL, SCOPE OF WORK, DAN TEMPLATE PENGERJAAN

### Modul 1 — Analisis Kebutuhan

- **Cakupan:** Identifikasi data jadwal (mata kuliah, dosen, kelas, ruang, hari, jam) dan pembatasan scope.
- **Output:** Dokumen spesifikasi kebutuhan sistem jadwal kuliah.

| ID Kebutuhan | Nama Fitur | Deskripsi Fungsionalitas |
|--------------|------------|--------------------------|
| REQ-01 | Olah Jadwal | Sistem memfasilitasi pengolahan data jadwal perkuliahan. |
| REQ-02 | Cek Bentrok | Sistem memvalidasi dan memberi peringatan jika terdapat bentrok ruang/jam. |

### Modul 2 — Database & Struktur Aplikasi

- **Cakupan:** Perancangan tabel `schedules`, penentuan field, dan konfigurasi koneksi database.
- **Output:** Database dan tabel jadwal kuliah siap pakai.

| Nama Tabel | Field Utama | Tipe Data | Keterangan / Relasi |
|------------|-------------|-----------|---------------------|
| schedules | id | INT (PK) | Menyimpan seluruh entri jadwal perkuliahan. |
| | matakuliah | VARCHAR(100) | Nama mata kuliah. |
| | dosen | VARCHAR(100) | Nama dosen pengampu. |
| | kelas | VARCHAR(20) | Kelas perkuliahan. |
| | ruang | VARCHAR(20) | Ruang perkuliahan. |
| | hari | VARCHAR(15) | Hari pelaksanaan perkuliahan. |
| | jam_mulai | TIME | Waktu mulai perkuliahan. |
| | jam_selesai | TIME | Waktu selesai perkuliahan. |

### Modul 3, 4 & 5 — UI/UX, CRUD & Validasi Bentrok

- **Cakupan:** Dashboard jadwal, form input, filter hari/kelas, dan modul pengecekan bentrok jadwal.
- **Output:** Antarmuka (Interface) dan fitur CRUD jadwal beserta validasi bentrok.

### Modul 6 — Testing & Basic Security

- **Cakupan:** Pengujian fungsionalitas CRUD, validasi bentrok jadwal, dan identifikasi kerentanan input dasar.

| ID Test | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Status |
|---------|--------------------|------------|-----------------------|--------|
| TC-01 | Input Jadwal Bentrok | Hari: Senin, Ruang: GKB-201, Jam: 08.00 - 10.00 (Sudah terisi) | Sistem menampilkan peringatan "Ruang sudah digunakan pada jam tersebut". | PASS |

*Halaman 2 dari 2*
