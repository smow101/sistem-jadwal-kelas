# Design System & UI Guidelines
## Sistem Data Jadwal Kuliah (Class Schedule System)

Dokumen ini mendefinisikan aturan visual, hierarki antarmuka, dan standarisasi komponen UI untuk diimplementasikan oleh AI Coding Assistant pada aplikasi web berbasis Tailwind CSS.

---

### 1. Palet Warna (Tailwind CSS Palette)

Aplikasi mengadopsi tema modern berbasis **Tailwind Slate & Indigo Palette** dengan kontras warna yang memenuhi standar WCAG 2.1 AA.

| Token Visual | Tailwind Class | Hex Code | Penggunaan |
|---|---|---|---|
| **Canvas Background** | `bg-slate-50` | `#F8FAFC` | Latar belakang seluruh halaman aplikasi. |
| **Surface / Card** | `bg-white border-slate-200` | `#FFFFFF` / `#E2E8F0` | Kartu KPI, kontainer form, kontainer tabel. |
| **Primary Brand** | `bg-indigo-600` / `hover:bg-indigo-700` | `#4F46E5` / `#4338CA` | Tombol simpan utama, active state, ikon brand. |
| **Primary Surface** | `bg-indigo-50 text-indigo-700` | `#EEF2FF` / `#4338CA` | Badge kelas, link aktif, highlight baris yang diedit. |
| **Success / Connected** | `bg-emerald-50 text-emerald-700 border-emerald-200` | `#ECFDF5` / `#047857` | Badge koneksi Supabase, notifikasi sukses simpan. |
| **Danger / Conflict** | `bg-rose-50 text-rose-700 border-rose-200` | `#FFF1F2` / `#BE123C` | Banner peringatan bentrok `TC-01`, tombol hapus. |
| **Warning / Notice** | `bg-amber-50 text-amber-700 border-amber-200` | `#FFFBEB` / `#B45309` | Kartu metrik dosen, konfirmasi hapus data. |
| **Text Dark (Headings)** | `text-slate-900` | `#0F172A` | Judul aplikasi, judul modul, nama mata kuliah. |
| **Text Muted (Body)** | `text-slate-600` | `#475569` | Label form, nama dosen, teks deskripsi. |
| **Text Subtle** | `text-slate-400` | `#94A3B8` | Placeholder input, ikon pelengkap, timestamp. |

---

### 2. Tipografi & Hierarki Teks

* **Font Family Utama:** `Inter`, `Plus Jakarta Sans`, atau sistem font sans-serif modern (`font-sans`).
* **Hierarki Tipografi:**
  * **App Title:** `text-2xl font-bold tracking-tight text-slate-900`
  * **Section / Card Title:** `text-lg font-semibold text-slate-800`
  * **KPI Metric Number:** `text-3xl font-extrabold text-slate-900`
  * **Table Header:** `text-xs font-semibold uppercase tracking-wider text-slate-500`
  * **Form Label:** `text-sm font-medium text-slate-700 mb-1.5 block`
  * **Input & Table Body:** `text-sm text-slate-800`
  * **Badge & Helper Text:** `text-xs font-medium`

* **Konvensi Format Bahasa Indonesia (`id-ID`):**
  * Format Hari: `Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu`, `Minggu`.
  * Format Jam: `HH:mm` diikuti zona waktu (Contoh: `08:00 - 10:00 WIB`).
  * Format Tanggal Pembuatan: `DD MMMM YYYY` (Contoh: `15 November 2026`).

---

### 3. Aturan Standar Komponen Interaktif

#### A. Alert Banner Validasi Bentrok (`TC-01`)
* Ditampilkan di bagian atas form ketika validasi mendeteksi bentrok jadwal.
* Menggunakan kontainer:
  ```html
  <div class="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3 mb-4 shadow-sm" role="alert">
    <svg class="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>
    <div>
      <span class="font-semibold block">Validasi Bentrok Jadwal:</span>
      <span id="errorMessage">Ruang sudah digunakan pada jam tersebut</span>
    </div>
  </div>
  ```

#### B. Loading State pada Tombol Simpan
* Saat data sedang dikirim ke Supabase, tombol wajib dinonaktifkan (`disabled`) dan menampilkan animasi spinner:
  ```html
  <button disabled class="bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg opacity-70 cursor-not-allowed flex items-center justify-center gap-2 w-full">
    <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <span>Memvalidasi & Menyimpan...</span>
  </button>
  ```

#### C. Empty State Tabel Data
* Saat tidak ada data jadwal yang terdaftar atau hasil filter pencarian kosong:
  ```html
  <div class="py-12 px-4 text-center">
    <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    </div>
    <h3 class="text-base font-semibold text-slate-800 mb-1">Belum Ada Jadwal Kuliah</h3>
    <p class="text-sm text-slate-500 max-w-sm mx-auto">Tidak ditemukan jadwal kuliah yang sesuai. Silakan tambahkan jadwal baru atau sesuaikan filter pencarian Anda.</p>
  </div>
  ```

#### D. Modal Dialog Konfirmasi Hapus Data
* Dialog konfirmasi sebelum menghapus baris jadwal untuk mencegah *accidental deletion*:
  * Latar belakang: *Backdrop blur* (`bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center`).
  * Kotak modal: `bg-white rounded-xl shadow-xl max-w-md w-full p-6`.
  * Tombol aksi: "Ya, Hapus Jadwal" (`bg-rose-600 hover:bg-rose-700 text-white`) dan "Batal" (`bg-slate-100 hover:bg-slate-200 text-slate-700`).