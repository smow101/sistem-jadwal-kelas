# AI Coding & Security Guardrails
## Standar Implementasi Sistem Data Jadwal Kuliah

File ini berisi instruksi dan batasan hukum teknis yang **WAJIB DIPATUHI** oleh AI Coding Assistant maupun Software Engineer saat mengimplementasikan kode pada IDE (VS Code).

---

### 1. Kepatuhan Skema & Spesifikasi (Schema Strictness)
1. **Nama Tabel Database:** Wajib menggunakan nama tabel `schedules` (huruf kecil, jamak).
2. **Nama Kolom:** Dilarang mengubah, menambah singkatan, atau menerjemahkan field. Wajib 100% identik dengan SKPL Modul 2:
   * `id`
   * `matakuliah`
   * `dosen`
   * `kelas`
   * `ruang`
   * `hari`
   * `jam_mulai`
   * `jam_selesai`
3. **Pesan Validasi Error:** Kalimat error untuk kasus jadwal bentrok harus persis sesuai Modul 6 SKPL (`TC-01`):
   $$\text{"Ruang sudah digunakan pada jam tersebut"}$$
   Dilarang memparafrase pesan ini menjadi kalimat lain.

---

### 2. Aturan Mutlak Anti-XSS (`SEC-01`)
1. **Larangan Penggunaan `.innerHTML`:**
   * DILARANG KERAS merender data yang berasal dari input pengguna maupun database Supabase menggunakan properti `.innerHTML`, `.outerHTML`, atau `document.write()`.
2. **Kewajiban Penggunaan `.textContent` & DOM API Aman:**
   * Setiap teks dinamis wajib dimasukkan menggunakan properti `.textContent` pada elemen yang dibentuk via `document.createElement()`.
3. **Fungsi Sanitasi HTML Entitas:**
   * Jika rendering berbasis template string terpaksa digunakan, seluruh variabel string WAJIB melewati fungsi `escapeHtml()` berikut:
   ```javascript
   function escapeHtml(str) {
     if (str === null || str === undefined) return '';
     return String(str)
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;');
   }
   ```
4. **Verifikasi Pengujian `SEC-01`:**
   * Apabila field `matakuliah`, `dosen`, `kelas`, atau `ruang` diisi dengan payload `<img src=x onerror=alert(1)>`, browser harus menampilkannya sebagai teks murni dan alert TIDAK BOLEH dieksekusi.

---

### 3. Aturan Mutlak Validasi Input & Deteksi Bentrok (`TC-01` & `TC-02`)
1. **Larangan Mengandalkan Validasi Frontend HTML Saja:**
   * Atribut HTML seperti `required`, `pattern`, atau `min`/`max` mudah dimanipulasi melalui *Inspect Element*. Seluruh validasi wajib dijalankan di level logika fungsi JavaScript sebelum mengirim mutasi ke Supabase.
2. **Validasi Kelengkapan Field:**
   * Pastikan `matakuliah`, `dosen`, `kelas`, `ruang`, `hari`, `jam_mulai`, dan `jam_selesai` tidak kosong dan bukan hanya spasi kosong (`.trim() !== ''`).
3. **Validasi Kronologi Jam:**
   * Wajib memastikan `jam_selesai > jam_mulai`. Jika pengguna menginput jam selesai lebih awal atau sama dengan jam mulai, proses simpan harus dihentikan dengan pesan peringatan: *"Jam selesai perkuliahan harus lebih akhir dari jam mulai"*.
4. **Logika Algoritma Deteksi Bentrok (`TC-01`):**
   * Sebelum memanggil `supabase.from('schedules').insert()` atau `.update()`, sistem wajib memeriksa daftar jadwal:
   ```javascript
   function isScheduleConflicting(newSchedule, existingSchedules, currentEditId = null) {
     return existingSchedules.some(item => {
       // Abaikan jadwal yang sedang diedit
       if (currentEditId && item.id === currentEditId) {
         return false;
       }

       // Pengecekan Hari dan Ruang yang Sama
       const isSameDay = item.hari.trim().toLowerCase() === newSchedule.hari.trim().toLowerCase();
       const isSameRoom = item.ruang.trim().toLowerCase() === newSchedule.ruang.trim().toLowerCase();

       if (isSameDay && isSameRoom) {
         // Logika Overlap Jam: (StartA < EndB) && (EndA > StartB)
         const itemStart = item.jam_mulai;
         const itemEnd = item.jam_selesai;
         const newStart = newSchedule.jam_mulai;
         const newEnd = newSchedule.jam_selesai;

         return (itemStart < newEnd && itemEnd > newStart);
       }

       return false;
     });
   }
   ```
   * Jika fungsi bernilai `true`, batalkan operasi simpan, jangan panggil Supabase API, dan munculkan alert *"Ruang sudah digunakan pada jam tersebut"*.

---

### 4. Aturan Keamanan Kredensial (`SEC-02`)
1. **Public Anon Key Only:**
   * Pada file `index.html` dan skrip frontend klien, HANYA diperbolehkan menuliskan konfigurasi publik Supabase:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
2. **Larangan Keras Rahasia Server:**
   * DILARANG KERAS mencantumkan `SUPABASE_SERVICE_ROLE_KEY`, `STITCH_API_KEY`, atau kredensial database langsung (`postgres://...`) di dalam kode frontend.
   * `SERVICE_ROLE_KEY` dapat membypass Row Level Security (RLS) dan membahayakan seluruh database jika bocor ke sisi klien.