Create a modern, clean, and responsive single-page web application UI for "Sistem Data Jadwal Kuliah" (University Class Schedule & Conflict Detection System) using Tailwind CSS and modern semantic HTML. The visual tone must be professional, accessible, and follow modern enterprise SaaS aesthetics (similar to Linear or Vercel dashboard).

Key layout and component specifications required:

1. TOP HEADER BAR:
   - Clean top navigation bar with white background (bg-white border-b border-slate-200 px-6 py-4).
   - Left side: An indigo calendar/academic icon, application title "Sistem Data Jadwal Kuliah", and a concise subtitle "Manajemen Jadwal Perkuliahan & Deteksi Bentrok Ruangan Real-Time".
   - Right side: A real-time system status pill badge displaying a pulsing green dot with text "Supabase Connected" (bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2).

2. SUMMARY / KPI CARDS (3 Dynamic Cards Grid at the Top):
   - A 3-column responsive grid (grid grid-cols-1 md:grid-cols-3 gap-5 mb-8).
   - Card 1: "Total Jadwal Kuliah" - Metric number displaying total scheduled lectures, an indigo calendar icon badge, and helper text "Jadwal aktif terdaftar".
   - Card 2: "Ruangan Terpakai" - Metric number showing unique active classrooms, an emerald building/door icon badge, and helper text "Ruang perkuliahan digunakan".
   - Card 3: "Dosen Pengampu" - Metric number showing registered lecturers, an amber user-group icon badge, and helper text "Tenaga pengajar aktif".
   - Card styling: bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between.

3. MAIN SPLIT CONTENT LAYOUT (2 Columns Responsive):
   Use a responsive layout with `grid grid-cols-1 lg:grid-cols-12 gap-8 items-start`.

   A. LEFT COLUMN (lg:col-span-4) - Form Input & Conflict Alert:
      - Sticky container styled with bg-white rounded-xl border border-slate-200 shadow-sm p-6.
      - Form header: Title "Tambah Jadwal Kuliah" (with dynamic badge "Mode Tambah" or "Mode Edit"), and an explanatory caption.
      - Conflict Error Alert Box (Crucial for TC-01): An alert container (bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3.5 mb-4 flex items-start gap-2.5) displaying an exclamation triangle icon and the exact text: "Ruang sudah digunakan pada jam tersebut".
      - Form Fields:
        * Mata Kuliah (Input text with placeholder "Contoh: Pemrograman Web").
        * Dosen Pengampu (Input text with placeholder "Contoh: Dr. Budi Santoso, M.Kom.").
        * Two-column subgrid:
          - Kelas (Input text with placeholder "TI-3A").
          - Ruang (Input text with placeholder "GKB-201").
        * Hari (Select dropdown: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu).
        * Two-column subgrid for time:
          - Jam Mulai (Input type="time", step="60").
          - Jam Selesai (Input type="time", step="60").
      - Action Buttons:
        * Primary button: "Simpan Jadwal" (bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm w-full flex justify-center items-center gap-2).
        * Secondary/Reset button: "Batal / Reset Form" (bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-lg w-full mt-2 font-medium).

   B. RIGHT COLUMN (lg:col-span-8) - Interactive Search, Filter & Schedule Table:
      - Container styled with bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden.
      - Filter Toolbar (p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-center justify-between):
        * Search input with magnifying glass icon: "Cari mata kuliah, dosen, atau kelas..." (flex-1).
        * Filter dropdown for Hari ("Semua Hari", "Senin", "Selasa", dst.).
        * Filter dropdown for Ruangan ("Semua Ruangan").
        * "Reset Filter" button.
      - Schedule Data Table:
        * Clean headers: MATA KULIAH, DOSEN, KELAS, RUANG, HARI & JAM, AKSI.
        * Data rows with subtle hover effect (hover:bg-slate-50/80 transition-colors).
        * Colorful badges:
          - Hari & Jam: Pill badge with clock icon (e.g., "Senin, 08:00 - 10:00 WIB").
          - Ruang: Distinct slate badge (e.g., "GKB-201").
          - Kelas: Indigo subtle badge (e.g., "TI-3A").
        * Row Actions:
          - "Edit" icon button (text-indigo-600 hover:text-indigo-800 p-1.5 rounded hover:bg-indigo-50).
          - "Hapus" icon button (text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50).
      - Empty State UI (shown when search/filter returns 0 results):
        * Centered empty calendar illustration, heading "Tidak ada jadwal ditemukan", and subtitle "Coba ubah kata kunci pencarian atau filter hari Anda".

4. DESIGN POLISH:
   - Use Tailwind CSS slate scale (slate-50 for body background, slate-900 for dark headings, slate-600 for body text).
   - Crisp focus rings on all inputs (focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500).
   - Ensure the layout is 100% fluid, responsive across mobile, tablet, and wide desktop screens.