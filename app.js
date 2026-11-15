const SUPABASE_URL = 'https://vhvaltwcaeyxnugazpis.supabase.co/';
const SUPABASE_ANON_KEY = 'sb_publishable_1xt5fIzBGp6_TD7pKcXe7A_eYsmiJjS';

/**
 * Fungsi sanitasi HTML entitas untuk proteksi XSS.
 * Wajib disalin persis sesuai RULES.md.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Logika algoritma deteksi bentrok jadwal (TC-01).
 * Wajib disalin persis sesuai RULES.md tanpa modifikasi logika.
 */
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

// Inisialisasi Supabase Client jika kredensial telah diset
let supabase = null;
const isCredentialsConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL !== 'ISI_SUPABASE_URL_DISINI' &&
  SUPABASE_ANON_KEY !== 'ISI_SUPABASE_ANON_KEY_DISINI'
);

if (isCredentialsConfigured && typeof window.supabase !== 'undefined') {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Inisialisasi Supabase gagal:', err);
  }
}

// ==================== KONSTANTA & STATE APLIKASI ====================
const SIMULATION_WINDOW_START = '07:00:00';
const SIMULATION_WINDOW_END = '21:00:00';

const DAY_ORDER = {
  'Senin': 1,
  'Selasa': 2,
  'Rabu': 3,
  'Kamis': 4,
  'Jumat': 5,
  'Sabtu': 6,
  'Minggu': 7
};

const VALID_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

// State Utama
let allSchedules = [];
let currentView = 'dashboard'; // 'dashboard' | 'jadwal' | 'tambah'
let currentEditId = null;
let deleteTargetId = null;
let newlySavedId = null;
let toastTimeout = null;
let liveCheckDebounceTimer = null;

// State Filter Tabel (View 2)
let tableFilterState = {
  keyword: '',
  hari: '',
  ruang: ''
};

// State Kalender Dashboard (View 1)
let calendarCurrentMonth = new Date();
let calendarSelectedDate = new Date();

// ==================== REFERENSI ELEMEN DOM ====================
// Navigasi & Header
const navDashboard = document.getElementById('navDashboard');
const navJadwal = document.getElementById('navJadwal');
const sidebarStatusDot = document.getElementById('sidebarStatusDot');
const sidebarStatusText = document.getElementById('sidebarStatusText');
const topbarLeft = document.getElementById('topbarLeft');
const topbarStatusBadge = document.getElementById('topbarStatusBadge');

// Views
const viewDashboard = document.getElementById('viewDashboard');
const viewJadwal = document.getElementById('viewJadwal');
const viewTambah = document.getElementById('viewTambah');

// View 1 Elements
const heroStatusPill = document.getElementById('heroStatusPill');
const heroDateText = document.getElementById('heroDateText');
const dashboardKpiGrid = document.getElementById('dashboardKpiGrid');
const selectedDatePill = document.getElementById('selectedDatePill');
const calendarMonthTitle = document.getElementById('calendarMonthTitle');
const btnPrevMonth = document.getElementById('btnPrevMonth');
const btnNextMonth = document.getElementById('btnNextMonth');
const calendarDatesGrid = document.getElementById('calendarDatesGrid');
const calendarSesiStatusText = document.getElementById('calendarSesiStatusText');
const calendarSessionsList = document.getElementById('calendarSessionsList');
const dosenHariCountBadge = document.getElementById('dosenHariCountBadge');
const dosenPengajarList = document.getElementById('dosenPengajarList');

// View 2 Elements
const tableSearchInput = document.getElementById('tableSearchInput');
const dayPillsContainer = document.getElementById('dayPillsContainer');
const tableRoomFilter = document.getElementById('tableRoomFilter');
const btnResetTableFilter = document.getElementById('btnResetTableFilter');
const tableShowingCountText = document.getElementById('tableShowingCountText');
const mainSchedulesTable = document.getElementById('mainSchedulesTable');
const mainSchedulesTableBody = document.getElementById('mainSchedulesTableBody');
const tableEmptyState = document.getElementById('tableEmptyState');

// View 3 Elements
const formPageHeading = document.getElementById('formPageHeading');
const formPageSubheading = document.getElementById('formPageSubheading');
const conflictBadgeHeader = document.getElementById('conflictBadgeHeader');
const mainScheduleForm = document.getElementById('mainScheduleForm');
const formMatakuliah = document.getElementById('formMatakuliah');
const formKelas = document.getElementById('formKelas');
const formDosen = document.getElementById('formDosen');
const formHari = document.getElementById('formHari');
const formRuang = document.getElementById('formRuang');
const formJamMulai = document.getElementById('formJamMulai');
const formJamSelesai = document.getElementById('formJamSelesai');
const conflictSectionPill = document.getElementById('conflictSectionPill');
const sectionTimeTitle = document.getElementById('sectionTimeTitle');

const iconWarnHari = document.getElementById('iconWarnHari');
const iconWarnRuang = document.getElementById('iconWarnRuang');
const iconWarnJamMulai = document.getElementById('iconWarnJamMulai');
const iconWarnJamSelesai = document.getElementById('iconWarnJamSelesai');

const formAlertBanner = document.getElementById('formAlertBanner');
const errorMessage = document.getElementById('errorMessage');
const errorDetailMessage = document.getElementById('errorDetailMessage');
const btnSubmitSchedule = document.getElementById('btnSubmitSchedule');
const btnCancelForm = document.getElementById('btnCancelForm');
const conflictHelperText = document.getElementById('conflictHelperText');

const simulasiContent = document.getElementById('simulasiContent');
const okupansiCardTitle = document.getElementById('okupansiCardTitle');
const okupansiList = document.getElementById('okupansiList');

// Modal Delete
const deleteModal = document.getElementById('deleteModal');
const deleteItemName = document.getElementById('deleteItemName');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');

// Toast Success
const toastSuccess = document.getElementById('toastSuccess');
const toastTitle = document.getElementById('toastTitle');
const toastDetail = document.getElementById('toastDetail');
const btnCloseToast = document.getElementById('btnCloseToast');

// ==================== HELPER DOM & FORMATTING ====================

/**
 * Membuat elemen SVG dengan namespace murni DOM
 */
function createSvg(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }
  return el;
}

/**
 * Normalisasi jam ke HH:MM:SS
 */
function normalizeTime(timeStr) {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  const parts = trimmed.split(':');
  if (parts.length === 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  }
  if (parts.length === 3) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
  }
  return trimmed;
}

/**
 * Format jam untuk tabel, form, dan okupansi: 08.00-10.00 (format titik, tanpa WIB)
 */
function formatTimeDot(start, end) {
  const s = String(start || '').substring(0, 5).replace(':', '.');
  const e = String(end || '').substring(0, 5).replace(':', '.');
  return `${s}-${e}`;
}

/**
 * Format jam untuk Dashboard: jam mulai 08:00, jam selesai 09:40 WIB
 */
function formatTimeDashboard(start, end) {
  const s = String(start || '').substring(0, 5);
  const e = String(end || '').substring(0, 5);
  return { start: s, end: `${e} WIB` };
}

/**
 * Pemetaan getDay() ke nama hari Indonesia
 */
function getDayNameIndonesia(date) {
  const dayIndex = date.getDay(); // 0 = Minggu, 1 = Senin, ...
  const map = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return map[dayIndex];
}

/**
 * Cek apakah dua objek Date menunjuk ke tanggal, bulan, tahun yang sama
 */
function isSameDate(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

/**
 * Konversi time string HH:MM:SS ke total menit dari jam 00:00
 */
function timeToMinutes(tStr) {
  const parts = normalizeTime(tStr).split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/**
 * Konversi total menit ke string HH:MM:SS
 */
function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/**
 * Mengambil inisial 1-2 huruf dari nama dosen
 */
function getLecturerInitials(name) {
  if (!name) return 'DS';
  const clean = name.replace(/^(Dr\.|Prof\.|Drs\.|Ir\.)\s*/i, '').trim();
  const words = clean.split(/\s+/).filter(w => w.length > 0 && !w.includes('.'));
  if (words.length === 0) return name.substring(0, 2).toUpperCase();
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// ==================== NAVIGASI VIEW & ROUTER HASH ====================

function setView(viewName) {
  const validViews = ['dashboard', 'jadwal', 'tambah'];
  if (!validViews.includes(viewName)) {
    viewName = 'dashboard';
  }
  currentView = viewName;

  // Sembunyikan semua view
  viewDashboard.classList.add('hidden');
  viewJadwal.classList.add('hidden');
  viewTambah.classList.add('hidden');

  // Bersihkan highlight baru tersimpan bila pindah view
  if (viewName !== 'jadwal') {
    newlySavedId = null;
  }

  // Update style navigasi sidebar
  if (viewName === 'dashboard') {
    navDashboard.className = 'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition duration-150 bg-indigo-600 text-white shadow-sm';
    navJadwal.className = 'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition duration-150 text-indigo-200 hover:bg-indigo-900/50 hover:text-white';
    viewDashboard.classList.remove('hidden');
    renderTopbarForDashboard();
    renderDashboardView();
  } else if (viewName === 'jadwal') {
    navDashboard.className = 'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition duration-150 text-indigo-200 hover:bg-indigo-900/50 hover:text-white';
    navJadwal.className = 'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition duration-150 bg-indigo-600 text-white shadow-sm';
    viewJadwal.classList.remove('hidden');
    renderTopbarForSIA();
    renderTableView();
  } else if (viewName === 'tambah') {
    navDashboard.className = 'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition duration-150 text-indigo-200 hover:bg-indigo-900/50 hover:text-white';
    navJadwal.className = 'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition duration-150 bg-indigo-600 text-white shadow-sm';
    viewTambah.classList.remove('hidden');
    renderTopbarForSIA();
    renderFormView();
  }

  // Sinkronkan hash URL tanpa memicu reload
  if (window.location.hash !== `#${viewName}`) {
    window.location.hash = `#${viewName}`;
  }
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'jadwal' || hash === 'tambah' || hash === 'dashboard') {
    setView(hash);
  } else {
    setView('dashboard');
  }
}

// Render Header Kiri untuk Dashboard (Kolom Pencarian)
function renderTopbarForDashboard() {
  while (topbarLeft.firstChild) {
    topbarLeft.removeChild(topbarLeft.firstChild);
  }

  const searchContainer = document.createElement('div');
  searchContainer.className = 'relative w-64 sm:w-80';

  const iconContainer = document.createElement('div');
  iconContainer.className = 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400';
  const searchSvg = createSvg('svg', {
    class: 'w-4 h-4',
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24'
  });
  const path = createSvg('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  });
  searchSvg.appendChild(path);
  iconContainer.appendChild(searchSvg);
  searchContainer.appendChild(iconContainer);

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'dashboardTopSearch';
  input.placeholder = 'Cari mata kuliah, dosen, atau ruangan...';
  input.className = 'w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 outline-none';

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.value.trim();
      tableFilterState.keyword = val;
      setView('jadwal');
    }
  });

  searchContainer.appendChild(input);
  topbarLeft.appendChild(searchContainer);
}

// Render Header Kiri untuk Jadwal & Form (Sistem Informasi Akademik)
function renderTopbarForSIA() {
  while (topbarLeft.firstChild) {
    topbarLeft.removeChild(topbarLeft.firstChild);
  }

  const container = document.createElement('div');
  container.className = 'flex items-center gap-2.5 text-slate-700';

  const icon = createSvg('svg', {
    class: 'w-4 h-4 text-indigo-600',
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24'
  });
  const path = createSvg('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
  });
  icon.appendChild(path);
  container.appendChild(icon);

  const text = document.createElement('span');
  text.className = 'text-xs font-bold uppercase tracking-wider text-slate-700';
  text.textContent = 'SISTEM INFORMASI AKADEMIK';
  container.appendChild(text);

  topbarLeft.appendChild(container);
}

// ==================== SUPABASE FETCH & STATUS ====================

function updateConnectionDisplay(status) {
  if (status === 'connected') {
    sidebarStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
    sidebarStatusText.textContent = 'Database Terhubung';
    topbarStatusBadge.className = 'bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold';
    topbarStatusBadge.textContent = 'AKTIF';
    heroStatusPill.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700';
    heroStatusPill.textContent = 'AKTIF';
  } else if (status === 'error') {
    sidebarStatusDot.className = 'w-2 h-2 rounded-full bg-rose-400';
    sidebarStatusText.textContent = 'Koneksi Gagal';
    topbarStatusBadge.className = 'bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-semibold';
    topbarStatusBadge.textContent = 'TIDAK TERHUBUNG';
    heroStatusPill.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700';
    heroStatusPill.textContent = 'TIDAK TERHUBUNG';
  } else {
    sidebarStatusDot.className = 'w-2 h-2 rounded-full bg-amber-400';
    sidebarStatusText.textContent = 'Kredensial Belum Diisi';
    topbarStatusBadge.className = 'bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-semibold';
    topbarStatusBadge.textContent = 'TIDAK TERHUBUNG';
    heroStatusPill.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700';
    heroStatusPill.textContent = 'TIDAK TERHUBUNG';
  }
}

async function loadSchedulesFromSupabase() {
  if (!supabase) {
    updateConnectionDisplay('unconfigured');
    allSchedules = [];
    refreshActiveView();
    return;
  }

  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('id, matakuliah, dosen, kelas, ruang, hari, jam_mulai, jam_selesai, created_at');

    if (error) {
      console.error('Fetch error:', error);
      updateConnectionDisplay('error');
      return;
    }

    updateConnectionDisplay('connected');
    allSchedules = Array.isArray(data) ? data : [];
    refreshActiveView();
  } catch (err) {
    console.error('Fetch exception:', err);
    updateConnectionDisplay('error');
  }
}

function refreshActiveView() {
  if (currentView === 'dashboard') {
    renderDashboardView();
  } else if (currentView === 'jadwal') {
    renderTableView();
  } else if (currentView === 'tambah') {
    renderFormView();
  }
}

// ==================== VIEW 1: DASHBOARD IMPLEMENTATION ====================

function renderDashboardView() {
  // Update Tanggal Hero
  const now = new Date();
  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);
  heroDateText.textContent = dateFormatted;

  // Render 4 Kartu KPI
  renderDashboardKpis();

  // Render Kalender & Sesi Terpilih
  renderCalendarComponent();
  renderSelectedDateSessions();
  renderDosenHariComponent();
}

/**
 * Cincin Progres SVG Helper
 */
function createProgressRingSvg(percent, strokeColor = '#4f46e5', showCheckIcon = false) {
  const size = 52;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(Math.max(percent, 0), 100);
  const offset = circumference - (safePercent / 100) * circumference;

  const svg = createSvg('svg', {
    width: String(size),
    height: String(size),
    class: 'transform -rotate-90 flex-shrink-0'
  });

  // Track Circle
  const bgCircle = createSvg('circle', {
    cx: String(size / 2),
    cy: String(size / 2),
    r: String(radius),
    stroke: '#e2e8f0',
    'stroke-width': String(stroke),
    fill: 'none'
  });
  svg.appendChild(bgCircle);

  // Progress Circle
  const progressCircle = createSvg('circle', {
    cx: String(size / 2),
    cy: String(size / 2),
    r: String(radius),
    stroke: strokeColor,
    'stroke-width': String(stroke),
    fill: 'none',
    'stroke-linecap': 'round',
    'stroke-dasharray': String(circumference),
    'stroke-dashoffset': String(offset)
  });
  svg.appendChild(progressCircle);

  // Wrapper Container
  const wrapper = document.createElement('div');
  wrapper.className = 'relative flex items-center justify-center';
  wrapper.appendChild(svg);

  const label = document.createElement('span');
  label.className = 'absolute text-[11px] font-bold text-slate-700';

  if (showCheckIcon && safePercent === 100) {
    label.textContent = '✓';
    label.className = 'absolute text-xs font-black text-emerald-600';
  } else {
    label.textContent = `${Math.round(safePercent)}%`;
  }
  wrapper.appendChild(label);

  return wrapper;
}

function renderDashboardKpis() {
  while (dashboardKpiGrid.firstChild) {
    dashboardKpiGrid.removeChild(dashboardKpiGrid.firstChild);
  }

  const totalJadwal = allSchedules.length;
  const todayName = getDayNameIndonesia(new Date());

  // 1. Total Jadwal Kuliah
  const todaySchedules = allSchedules.filter(s => s.hari.trim().toLowerCase() === todayName.toLowerCase());
  const percentToday = totalJadwal > 0 ? (todaySchedules.length / totalJadwal) * 100 : 0;

  // 2. Total Ruang Aktif
  const allRooms = new Set();
  const todayRooms = new Set();
  allSchedules.forEach(s => {
    if (s.ruang && s.ruang.trim()) {
      const r = s.ruang.trim().toLowerCase();
      allRooms.add(r);
      if (s.hari.trim().toLowerCase() === todayName.toLowerCase()) {
        todayRooms.add(r);
      }
    }
  });
  const percentRuang = allRooms.size > 0 ? (todayRooms.size / allRooms.size) * 100 : 0;

  // 3. Total Dosen Terdaftar
  const allLecturers = new Set();
  const todayLecturers = new Set();
  allSchedules.forEach(s => {
    if (s.dosen && s.dosen.trim()) {
      const d = s.dosen.trim().toLowerCase();
      allLecturers.add(d);
      if (s.hari.trim().toLowerCase() === todayName.toLowerCase()) {
        todayLecturers.add(d);
      }
    }
  });
  const percentDosen = allLecturers.size > 0 ? (todayLecturers.size / allLecturers.size) * 100 : 0;

  // 4. Bebas Bentrok
  let nonConflictingCount = 0;
  allSchedules.forEach(item => {
    const isConflict = isScheduleConflicting(item, allSchedules, item.id);
    if (!isConflict) {
      nonConflictingCount++;
    }
  });
  const percentBebasBentrok = totalJadwal > 0 ? Math.round((nonConflictingCount / totalJadwal) * 100) : 100;

  const kpis = [
    {
      label: 'TOTAL JADWAL KULIAH',
      number: totalJadwal,
      unit: 'Jadwal',
      caption: `${todaySchedules.length} jadwal hari ini`,
      captionColor: 'text-indigo-600',
      percent: percentToday,
      ringColor: '#4f46e5',
      isSafeCard: false
    },
    {
      label: 'TOTAL RUANG AKTIF',
      number: allRooms.size,
      unit: 'Ruang',
      caption: `${todayRooms.size} ruang terpakai hari ini`,
      captionColor: 'text-indigo-600',
      percent: percentRuang,
      ringColor: '#4f46e5',
      isSafeCard: false
    },
    {
      label: 'TOTAL DOSEN TERDAFTAR',
      number: allLecturers.size,
      unit: 'Dosen',
      caption: `${todayLecturers.size} dosen mengajar hari ini`,
      captionColor: 'text-amber-600',
      percent: percentDosen,
      ringColor: '#4f46e5',
      isSafeCard: false
    },
    {
      label: 'BEBAS BENTROK',
      number: `${percentBebasBentrok}%`,
      unit: percentBebasBentrok === 100 ? 'Aman' : '',
      caption: percentBebasBentrok === 100 ? 'Semua teratasi' : 'Periksa bentrok',
      captionColor: percentBebasBentrok === 100 ? 'text-emerald-600' : 'text-rose-600',
      percent: percentBebasBentrok,
      ringColor: percentBebasBentrok === 100 ? '#059669' : '#e11d48',
      isSafeCard: percentBebasBentrok === 100
    }
  ];

  kpis.forEach(k => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4';

    const infoDiv = document.createElement('div');

    const labelP = document.createElement('p');
    labelP.className = 'text-[11px] font-bold uppercase tracking-wider text-slate-500';
    labelP.textContent = k.label;
    infoDiv.appendChild(labelP);

    const valDiv = document.createElement('div');
    valDiv.className = 'flex items-baseline gap-1.5 mt-1';

    const numSpan = document.createElement('span');
    numSpan.className = 'text-2xl lg:text-3xl font-extrabold text-slate-900';
    numSpan.textContent = typeof k.number === 'number' ? new Intl.NumberFormat('id-ID').format(k.number) : k.number;
    valDiv.appendChild(numSpan);

    if (k.unit) {
      const unitSpan = document.createElement('span');
      unitSpan.className = 'text-xs text-slate-400 font-semibold';
      unitSpan.textContent = k.unit;
      valDiv.appendChild(unitSpan);
    }
    infoDiv.appendChild(valDiv);

    const capP = document.createElement('p');
    capP.className = `text-xs font-semibold mt-1.5 ${k.captionColor}`;
    capP.textContent = k.caption;
    infoDiv.appendChild(capP);

    card.appendChild(infoDiv);

    // Cincin Progres
    const ring = createProgressRingSvg(k.percent, k.ringColor, k.isSafeCard);
    card.appendChild(ring);

    dashboardKpiGrid.appendChild(card);
  });
}

function renderCalendarComponent() {
  const year = calendarCurrentMonth.getFullYear();
  const month = calendarCurrentMonth.getMonth();

  // Judul Bulan
  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(calendarCurrentMonth);
  calendarMonthTitle.textContent = monthName;

  while (calendarDatesGrid.firstChild) {
    calendarDatesGrid.removeChild(calendarDatesGrid.firstChild);
  }

  // Hitung hari awal dan jumlah hari
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Minggu
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Hari dari bulan sebelumnya
  for (let i = firstDay - 1; i >= 0; i--) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'p-1.5 text-slate-300 cursor-default rounded-lg';
    btn.textContent = String(daysInPrevMonth - i);
    calendarDatesGrid.appendChild(btn);
  }

  // Hari bulan ini
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    const thisDate = new Date(year, month, day);

    const isToday = isSameDate(thisDate, today);
    const isSelected = isSameDate(thisDate, calendarSelectedDate);

    if (isSelected) {
      btn.className = 'p-1.5 font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition';
    } else if (isToday) {
      btn.className = 'p-1.5 font-bold rounded-lg border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition';
    } else {
      btn.className = 'p-1.5 text-slate-700 hover:bg-indigo-50 rounded-lg transition';
    }

    btn.textContent = String(day);
    btn.addEventListener('click', () => {
      calendarSelectedDate = new Date(year, month, day);
      renderCalendarComponent();
      renderSelectedDateSessions();
      renderDosenHariComponent();
    });

    calendarDatesGrid.appendChild(btn);
  }
}

function renderSelectedDateSessions() {
  while (calendarSessionsList.firstChild) {
    calendarSessionsList.removeChild(calendarSessionsList.firstChild);
  }

  const selectedDayName = getDayNameIndonesia(calendarSelectedDate);
  const isToday = isSameDate(calendarSelectedDate, new Date());

  // Update Pill Tanggal
  const dayStr = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }).format(calendarSelectedDate);
  selectedDatePill.textContent = dayStr;

  // Filter jadwal berdasarkan hari yang terpilih
  const matchingSchedules = allSchedules.filter(s => s.hari.trim().toLowerCase() === selectedDayName.toLowerCase());

  // Urutkan berdasarkan jam mulai
  matchingSchedules.sort((a, b) => normalizeTime(a.jam_mulai).localeCompare(normalizeTime(b.jam_mulai)));

  // Hitung sesi berjalan jika hari ini
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let activeCount = 0;
  matchingSchedules.forEach(s => {
    const startM = timeToMinutes(s.jam_mulai);
    const endM = timeToMinutes(s.jam_selesai);
    if (isToday && currentMinutes >= startM && currentMinutes <= endM) {
      activeCount++;
    }
  });

  if (isToday) {
    calendarSesiStatusText.textContent = `${activeCount} Sesi Sedang Berjalan`;
  } else {
    calendarSesiStatusText.textContent = `${matchingSchedules.length} Sesi Terjadwal`;
  }

  // Tampilkan Empty State bila tidak ada jadwal
  if (matchingSchedules.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'bg-white border border-slate-200 rounded-2xl p-8 text-center';

    const iconCircle = document.createElement('div');
    iconCircle.className = 'w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3';
    const calSvg = createSvg('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' });
    const p1 = createSvg('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.5', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' });
    calSvg.appendChild(p1);
    iconCircle.appendChild(calSvg);
    emptyCard.appendChild(iconCircle);

    const titleH = document.createElement('h4');
    titleH.className = 'text-sm font-semibold text-slate-800 mb-1';
    titleH.textContent = 'Belum Ada Jadwal Kuliah';
    emptyCard.appendChild(titleH);

    const descP = document.createElement('p');
    descP.className = 'text-xs text-slate-500';
    descP.textContent = `Tidak ada perkuliahan pada hari ${selectedDayName}.`;
    emptyCard.appendChild(descP);

    calendarSessionsList.appendChild(emptyCard);
    return;
  }

  const monthShort = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(calendarSelectedDate).toUpperCase();
  const dayNumber = String(calendarSelectedDate.getDate()).padStart(2, '0');

  // Render Sesi
  matchingSchedules.forEach(schedule => {
    const startM = timeToMinutes(schedule.jam_mulai);
    const endM = timeToMinutes(schedule.jam_selesai);
    const isOngoing = isToday && currentMinutes >= startM && currentMinutes <= endM;

    const card = document.createElement('div');
    card.className = isOngoing
      ? 'bg-indigo-600 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 transition'
      : 'bg-white border border-slate-200 hover:border-indigo-200 text-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 transition';

    // Left: Date Mini Box
    const leftBox = document.createElement('div');
    leftBox.className = 'flex items-center gap-3.5 flex-1 min-w-0';

    const dateBox = document.createElement('div');
    dateBox.className = isOngoing
      ? 'w-11 h-11 rounded-xl bg-white/20 flex flex-col items-center justify-center flex-shrink-0'
      : 'w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center flex-shrink-0';

    const dNum = document.createElement('span');
    dNum.className = 'text-xs font-bold leading-none';
    dNum.textContent = dayNumber;
    dateBox.appendChild(dNum);

    const dMonth = document.createElement('span');
    dMonth.className = 'text-[9px] font-extrabold uppercase leading-none mt-0.5';
    dMonth.textContent = monthShort;
    dateBox.appendChild(dMonth);

    leftBox.appendChild(dateBox);

    // Detail Jadwal
    const detailDiv = document.createElement('div');
    detailDiv.className = 'min-w-0';

    const titleRow = document.createElement('div');
    titleRow.className = 'flex items-center gap-2 flex-wrap';

    const titleH = document.createElement('h5');
    titleH.className = 'text-sm font-bold truncate';
    titleH.textContent = schedule.matakuliah;
    titleRow.appendChild(titleH);

    // Badge Status Sesi
    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'text-[10px] font-extrabold px-2 py-0.5 rounded uppercase';

    if (isToday) {
      if (isOngoing) {
        badgeSpan.className += ' bg-white/25 text-white';
        badgeSpan.textContent = 'SEDANG KULIAH';
      } else if (currentMinutes < startM) {
        badgeSpan.className += ' bg-indigo-100 text-indigo-700';
        badgeSpan.textContent = 'MENDATANG';
      } else {
        badgeSpan.className += ' bg-slate-100 text-slate-600';
        badgeSpan.textContent = 'SELESAI';
      }
    } else {
      badgeSpan.className += ' bg-indigo-50 text-indigo-700';
      badgeSpan.textContent = 'TERJADWAL';
    }
    titleRow.appendChild(badgeSpan);
    detailDiv.appendChild(titleRow);

    const metaP = document.createElement('p');
    metaP.className = isOngoing ? 'text-xs text-indigo-100 mt-1 truncate' : 'text-xs text-slate-500 mt-1 truncate';
    metaP.textContent = `${schedule.kelas} • Ruang ${schedule.ruang} • ${schedule.dosen}`;
    detailDiv.appendChild(metaP);

    leftBox.appendChild(detailDiv);
    card.appendChild(leftBox);

    // Right: Time Box (08:00 & 09:40 WIB)
    const timeObj = formatTimeDashboard(schedule.jam_mulai, schedule.jam_selesai);
    const rightBox = document.createElement('div');
    rightBox.className = 'text-right flex-shrink-0';

    const startH = document.createElement('div');
    startH.className = 'text-base font-extrabold leading-none';
    startH.textContent = timeObj.start;
    rightBox.appendChild(startH);

    const endP = document.createElement('div');
    endP.className = isOngoing ? 'text-[11px] text-indigo-100 mt-1 font-medium' : 'text-[11px] text-slate-400 mt-1 font-medium';
    endP.textContent = timeObj.end;
    rightBox.appendChild(endP);

    card.appendChild(rightBox);
    calendarSessionsList.appendChild(card);
  });
}

function renderDosenHariComponent() {
  while (dosenPengajarList.firstChild) {
    dosenPengajarList.removeChild(dosenPengajarList.firstChild);
  }

  const selectedDayName = getDayNameIndonesia(calendarSelectedDate);
  const matchingSchedules = allSchedules.filter(s => s.hari.trim().toLowerCase() === selectedDayName.toLowerCase());

  // Kumpulkan dosen unik
  const dosenMap = new Map();
  matchingSchedules.forEach(s => {
    if (s.dosen && s.dosen.trim()) {
      const key = s.dosen.trim().toLowerCase();
      if (!dosenMap.has(key)) {
        dosenMap.set(key, {
          nama: s.dosen.trim(),
          matakuliah: s.matakuliah,
          ruang: s.ruang
        });
      }
    }
  });

  const uniqueDosenList = Array.from(dosenMap.values());
  dosenHariCountBadge.textContent = `${uniqueDosenList.length} Dosen`;

  if (uniqueDosenList.length === 0) {
    const emptyP = document.createElement('p');
    emptyP.className = 'text-xs text-slate-400 py-4 text-center';
    emptyP.textContent = 'Tidak ada dosen mengajar pada tanggal ini.';
    dosenPengajarList.appendChild(emptyP);
    return;
  }

  uniqueDosenList.forEach(d => {
    const item = document.createElement('div');
    item.className = 'flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition';

    // Avatar inisial
    const avatar = document.createElement('div');
    avatar.className = 'w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0';
    avatar.textContent = getLecturerInitials(d.nama);
    item.appendChild(avatar);

    // Info dosen
    const info = document.createElement('div');
    info.className = 'min-w-0 flex-1';

    const nameP = document.createElement('h6');
    nameP.className = 'text-xs font-bold text-slate-900 truncate';
    nameP.textContent = d.nama;
    info.appendChild(nameP);

    const subP = document.createElement('p');
    subP.className = 'text-[11px] text-slate-500 truncate mt-0.5';
    subP.textContent = `${d.matakuliah} • ${d.ruang}`;
    info.appendChild(subP);

    item.appendChild(info);
    dosenPengajarList.appendChild(item);
  });
}

// ==================== VIEW 2: DAFTAR JADWAL IMPLEMENTATION ====================

function renderTableView() {
  renderDayFilterPills();
  updateTableRoomFilterOptions();
  renderTableDataRows();
}

function renderDayFilterPills() {
  while (dayPillsContainer.firstChild) {
    dayPillsContainer.removeChild(dayPillsContainer.firstChild);
  }

  const daysList = ['Semua', ...VALID_DAYS];
  daysList.forEach(day => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isSelected = (day === 'Semua' && tableFilterState.hari === '') || (tableFilterState.hari === day);

    btn.className = isSelected
      ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm transition'
      : 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-slate-700 hover:bg-indigo-100 transition';
    btn.textContent = day;

    btn.addEventListener('click', () => {
      tableFilterState.hari = day === 'Semua' ? '' : day;
      newlySavedId = null; // Bersihkan highlight saat filter diganti
      renderDayFilterPills();
      renderTableDataRows();
    });

    dayPillsContainer.appendChild(btn);
  });
}

function updateTableRoomFilterOptions() {
  const currentSelected = tableRoomFilter.value;
  while (tableRoomFilter.children.length > 1) {
    tableRoomFilter.removeChild(tableRoomFilter.lastChild);
  }

  const roomSet = new Set();
  allSchedules.forEach(s => {
    if (s.ruang && s.ruang.trim()) {
      roomSet.add(s.ruang.trim());
    }
  });

  const sortedRooms = Array.from(roomSet).sort((a, b) => a.localeCompare(b));
  sortedRooms.forEach(room => {
    const opt = document.createElement('option');
    opt.value = room;
    opt.textContent = room;
    if (room === currentSelected) {
      opt.selected = true;
    }
    tableRoomFilter.appendChild(opt);
  });
}

function renderTableDataRows() {
  const kw = tableFilterState.keyword.trim().toLowerCase();
  const selHari = tableFilterState.hari;
  const selRuang = tableRoomFilter.value.trim().toLowerCase();

  const filtered = allSchedules.filter(item => {
    // 1. Keyword search mencakup matakuliah, dosen, kelas, ruang (PRD + Referensi 2)
    if (kw) {
      const matchMatkul = item.matakuliah && item.matakuliah.toLowerCase().includes(kw);
      const matchDosen = item.dosen && item.dosen.toLowerCase().includes(kw);
      const matchKelas = item.kelas && item.kelas.toLowerCase().includes(kw);
      const matchRuang = item.ruang && item.ruang.toLowerCase().includes(kw);
      if (!matchMatkul && !matchDosen && !matchKelas && !matchRuang) {
        return false;
      }
    }

    // 2. Filter Hari
    if (selHari && item.hari !== selHari) {
      return false;
    }

    // 3. Filter Ruang
    if (selRuang && item.ruang.trim().toLowerCase() !== selRuang) {
      return false;
    }

    return true;
  });

  // Urutkan jadwal: Hari (Senin -> Minggu), lalu jam_mulai
  filtered.sort((a, b) => {
    const orderA = DAY_ORDER[a.hari] || 99;
    const orderB = DAY_ORDER[b.hari] || 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return normalizeTime(a.jam_mulai).localeCompare(normalizeTime(b.jam_mulai));
  });

  // Update text counter
  tableShowingCountText.textContent = `Menampilkan ${filtered.length} jadwal`;

  // Kosongkan baris tabel
  while (mainSchedulesTableBody.firstChild) {
    mainSchedulesTableBody.removeChild(mainSchedulesTableBody.firstChild);
  }

  if (filtered.length === 0) {
    mainSchedulesTable.classList.add('hidden');
    tableEmptyState.classList.remove('hidden');
    return;
  }

  mainSchedulesTable.classList.remove('hidden');
  tableEmptyState.classList.add('hidden');

  filtered.forEach(schedule => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition border-b border-slate-100';

    const isNewlySaved = newlySavedId !== null && String(newlySavedId) === String(schedule.id);

    // 1. Kolom Mata Kuliah
    const tdMatkul = document.createElement('td');
    tdMatkul.className = 'py-4 px-6';

    const matkulWrap = document.createElement('div');
    matkulWrap.className = 'flex items-center gap-2 flex-wrap';

    const titleSpan = document.createElement('span');
    titleSpan.className = isNewlySaved ? 'font-bold text-indigo-600' : 'font-semibold text-slate-900';
    titleSpan.textContent = schedule.matakuliah;
    matkulWrap.appendChild(titleSpan);

    if (isNewlySaved) {
      const badgeBaru = document.createElement('span');
      badgeBaru.className = 'bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-semibold';
      badgeBaru.textContent = 'Baru Tersimpan';
      matkulWrap.appendChild(badgeBaru);
    }
    tdMatkul.appendChild(matkulWrap);
    tr.appendChild(tdMatkul);

    // 2. Kolom Dosen
    const tdDosen = document.createElement('td');
    tdDosen.className = 'py-4 px-6 text-slate-600 font-medium';
    tdDosen.textContent = schedule.dosen;
    tr.appendChild(tdDosen);

    // 3. Kolom Kelas (Badge)
    const tdKelas = document.createElement('td');
    tdKelas.className = 'py-4 px-6';
    const badgeKelas = document.createElement('span');
    badgeKelas.className = 'inline-block bg-indigo-50 text-slate-700 rounded-md px-2 py-1 text-xs font-semibold';
    badgeKelas.textContent = schedule.kelas;
    tdKelas.appendChild(badgeKelas);
    tr.appendChild(tdKelas);

    // 4. Kolom Ruang
    const tdRuang = document.createElement('td');
    tdRuang.className = 'py-4 px-6 font-semibold text-slate-900';
    tdRuang.textContent = schedule.ruang;
    tr.appendChild(tdRuang);

    // 5. Kolom Hari
    const tdHari = document.createElement('td');
    tdHari.className = 'py-4 px-6 text-slate-700 font-medium';
    tdHari.textContent = schedule.hari;
    tr.appendChild(tdHari);

    // 6. Kolom Jam (Format 08.00-10.00)
    const tdJam = document.createElement('td');
    tdJam.className = isNewlySaved
      ? 'py-4 px-6 text-indigo-600 font-semibold whitespace-nowrap text-xs'
      : 'py-4 px-6 text-slate-700 font-medium whitespace-nowrap text-xs';
    tdJam.textContent = formatTimeDot(schedule.jam_mulai, schedule.jam_selesai);
    tr.appendChild(tdJam);

    // 7. Kolom Aksi (Edit & Hapus dengan icon SVG)
    const tdAksi = document.createElement('td');
    tdAksi.className = 'py-4 px-6 text-right whitespace-nowrap';

    // Tombol Edit
    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'p-1.5 text-slate-400 hover:text-indigo-600 transition rounded-lg mr-2';
    btnEdit.title = 'Edit Jadwal';

    const editSvg = createSvg('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' });
    const pEdit = createSvg('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' });
    editSvg.appendChild(pEdit);
    btnEdit.appendChild(editSvg);

    btnEdit.addEventListener('click', () => {
      startEditSchedule(schedule);
    });
    tdAksi.appendChild(btnEdit);

    // Tombol Hapus
    const btnHapus = document.createElement('button');
    btnHapus.type = 'button';
    btnHapus.className = 'p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg';
    btnHapus.title = 'Hapus Jadwal';

    const trashSvg = createSvg('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' });
    const pTrash = createSvg('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' });
    trashSvg.appendChild(pTrash);
    btnHapus.appendChild(trashSvg);

    btnHapus.addEventListener('click', () => {
      openDeleteModal(schedule);
    });
    tdAksi.appendChild(btnHapus);

    tr.appendChild(tdAksi);
    mainSchedulesTableBody.appendChild(tr);
  });
}

// ==================== VIEW 3: TAMBAH / EDIT IMPLEMENTATION ====================

function renderFormView() {
  if (currentEditId !== null) {
    formPageHeading.textContent = 'Edit Jadwal';
    formPageSubheading.textContent = 'Perbarui data jadwal perkuliahan';
    btnSubmitSchedule.textContent = 'Perbarui Jadwal';
  } else {
    formPageHeading.textContent = 'Tambah Jadwal';
    formPageSubheading.textContent = 'Lengkapi data jadwal perkuliahan baru';
    btnSubmitSchedule.textContent = 'Simpan Jadwal';
  }

  // Trigger live check awal
  triggerLiveConflictCheck();
}

function startEditSchedule(schedule) {
  currentEditId = schedule.id;

  formMatakuliah.value = schedule.matakuliah || '';
  formKelas.value = schedule.kelas || '';
  formDosen.value = schedule.dosen || '';
  formHari.value = schedule.hari || '';
  formRuang.value = schedule.ruang || '';
  formJamMulai.value = String(schedule.jam_mulai || '').substring(0, 5);
  formJamSelesai.value = String(schedule.jam_selesai || '').substring(0, 5);

  setView('tambah');
}

function cancelForm() {
  currentEditId = null;
  mainScheduleForm.reset();
  hideFormAlert();
  clearConflictStyles();
  setView('jadwal');
}

function showFormAlert(title, detail = '') {
  errorMessage.textContent = title;
  errorDetailMessage.textContent = detail;
  formAlertBanner.classList.remove('hidden');
}

function hideFormAlert() {
  formAlertBanner.classList.add('hidden');
  errorMessage.textContent = '';
  errorDetailMessage.textContent = '';
}

function applyConflictStyles() {
  conflictBadgeHeader.classList.remove('hidden');
  conflictSectionPill.classList.remove('hidden');
  sectionTimeTitle.classList.add('text-amber-800');

  // Input border amber
  [formHari, formRuang, formJamMulai, formJamSelesai].forEach(el => {
    el.classList.add('border-2', 'border-amber-500');
  });

  // Warning icons
  iconWarnHari.classList.remove('hidden');
  iconWarnRuang.classList.remove('hidden');
  iconWarnJamMulai.classList.remove('hidden');
  iconWarnJamSelesai.classList.remove('hidden');

  // Disable button
  btnSubmitSchedule.disabled = true;
  btnSubmitSchedule.className = 'bg-slate-200 text-slate-400 cursor-not-allowed font-semibold py-3 px-6 rounded-xl transition text-sm';
  conflictHelperText.classList.remove('hidden');
}

function clearConflictStyles() {
  conflictBadgeHeader.classList.add('hidden');
  conflictSectionPill.classList.add('hidden');
  sectionTimeTitle.classList.remove('text-amber-800');

  [formHari, formRuang, formJamMulai, formJamSelesai].forEach(el => {
    el.classList.remove('border-2', 'border-amber-500');
  });

  iconWarnHari.classList.add('hidden');
  iconWarnRuang.classList.add('hidden');
  iconWarnJamMulai.classList.add('hidden');
  iconWarnJamSelesai.classList.add('hidden');

  btnSubmitSchedule.disabled = false;
  btnSubmitSchedule.className = 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition shadow-sm text-sm';
  conflictHelperText.classList.add('hidden');
}

/**
 * Mencari jadwal spesifik yang bertabrakan untuk detail pesan
 */
function findConflictingSchedule(newSchedule, existingSchedules, editId) {
  return existingSchedules.find(item => {
    if (editId && item.id === editId) return false;
    const isSameDay = item.hari.trim().toLowerCase() === newSchedule.hari.trim().toLowerCase();
    const isSameRoom = item.ruang.trim().toLowerCase() === newSchedule.ruang.trim().toLowerCase();
    if (isSameDay && isSameRoom) {
      const itemStart = item.jam_mulai;
      const itemEnd = item.jam_selesai;
      const newStart = newSchedule.jam_mulai;
      const newEnd = newSchedule.jam_selesai;
      return (itemStart < newEnd && itemEnd > newStart);
    }
    return false;
  });
}

/**
 * Algoritma Deterministik Rekomendasi Slot Waktu (07:00 - 21:00)
 */
function findRecommendedSlot(hari, ruang, durationMinutes, editId, existingSchedules) {
  const windowStartMin = timeToMinutes(SIMULATION_WINDOW_START);
  const windowEndMin = timeToMinutes(SIMULATION_WINDOW_END);

  // Ambil seluruh jadwal di hari dan ruang tersebut
  const roomSchedules = existingSchedules.filter(item => {
    if (editId && item.id === editId) return false;
    return item.hari.trim().toLowerCase() === hari.trim().toLowerCase() &&
      item.ruang.trim().toLowerCase() === ruang.trim().toLowerCase();
  });

  // Kandidat waktu mulai: windowStartMin, dan setiap jam_selesai jadwal
  const candidatesSet = new Set();
  candidatesSet.add(windowStartMin);
  roomSchedules.forEach(s => {
    candidatesSet.add(timeToMinutes(s.jam_selesai));
  });

  const candidates = Array.from(candidatesSet).sort((a, b) => a - b);

  // Cari kandidat yang tidak bertabrakan dengan jadwal manapun
  for (const startCand of candidates) {
    const endCand = startCand + durationMinutes;
    if (endCand <= windowEndMin) {
      const candStartStr = minutesToTime(startCand);
      const candEndStr = minutesToTime(endCand);

      const testPayload = {
        hari,
        ruang,
        jam_mulai: candStartStr,
        jam_selesai: candEndStr
      };

      if (!isScheduleConflicting(testPayload, existingSchedules, editId)) {
        return {
          start: candStartStr,
          end: candEndStr,
          startDisplay: formatTimeDot(candStartStr, candEndStr).split('-')[0],
          endDisplay: formatTimeDot(candStartStr, candEndStr).split('-')[1]
        };
      }
    }
  }

  return null;
}

/**
 * Live Conflict Detection & Render Simulasi + Okupansi
 */
function triggerLiveConflictCheck() {
  const hari = formHari.value.trim();
  const ruang = formRuang.value.trim();
  const rawJamMulai = formJamMulai.value;
  const rawJamSelesai = formJamSelesai.value;

  // Render Okupansi Ruang Terpilih
  renderOkupansiPanel(hari, ruang, null);

  // Jika parameter belum lengkap
  if (!hari || !ruang || !rawJamMulai || !rawJamSelesai) {
    clearConflictStyles();
    hideFormAlert();
    renderSimulasiIncomplete();
    return;
  }

  const jam_mulai = normalizeTime(rawJamMulai);
  const jam_selesai = normalizeTime(rawJamSelesai);

  // Validasi Kronologi Jam
  if (jam_selesai <= jam_mulai) {
    applyConflictStyles();
    showFormAlert('Jam selesai perkuliahan harus lebih akhir dari jam mulai');
    renderSimulasiError('Jam selesai perkuliahan harus lebih akhir dari jam mulai');
    return;
  }

  // Data ternormalisasi
  const normalizedExisting = allSchedules.map(item => ({
    ...item,
    jam_mulai: normalizeTime(item.jam_mulai),
    jam_selesai: normalizeTime(item.jam_selesai)
  }));

  let targetEditId = currentEditId;
  if (targetEditId !== null && normalizedExisting.length > 0) {
    if (typeof normalizedExisting[0].id === 'number') {
      targetEditId = Number(targetEditId);
    }
  }

  const payload = { hari, ruang, jam_mulai, jam_selesai };
  const isConflict = isScheduleConflicting(payload, normalizedExisting, targetEditId);

  const durationMin = Math.max(timeToMinutes(jam_selesai) - timeToMinutes(jam_mulai), 30);
  const recommendedSlot = findRecommendedSlot(hari, ruang, durationMin, targetEditId, normalizedExisting);

  if (isConflict) {
    const conflictingItem = findConflictingSchedule(payload, normalizedExisting, targetEditId);
    applyConflictStyles();

    let detailStr = '';
    if (conflictingItem) {
      detailStr = `${ruang} — ${hari}, ${formatTimeDot(conflictingItem.jam_mulai, conflictingItem.jam_selesai)} sudah terisi oleh mata kuliah ${conflictingItem.matakuliah} (${conflictingItem.kelas}).`;
    }

    showFormAlert('Ruang sudah digunakan pada jam tersebut', detailStr);
    renderSimulasiConflict(hari, ruang, recommendedSlot);
    renderOkupansiPanel(hari, ruang, conflictingItem, recommendedSlot);
  } else {
    clearConflictStyles();
    hideFormAlert();
    renderSimulasiValid(hari, ruang, jam_mulai, jam_selesai);
    renderOkupansiPanel(hari, ruang, null);
  }
}

// Render Simulasi jika input belum lengkap
function renderSimulasiIncomplete() {
  while (simulasiContent.firstChild) {
    simulasiContent.removeChild(simulasiContent.firstChild);
  }
  const p = document.createElement('p');
  p.className = 'text-xs text-slate-400 py-3 text-center leading-relaxed';
  p.textContent = 'Lengkapi Hari, Ruang, dan Jam untuk melihat simulasi ketersediaan.';
  simulasiContent.appendChild(p);
}

// Render Simulasi jika format jam salah
function renderSimulasiError(msg) {
  while (simulasiContent.firstChild) {
    simulasiContent.removeChild(simulasiContent.firstChild);
  }
  const p = document.createElement('p');
  p.className = 'text-xs text-rose-600 font-semibold py-3 text-center';
  p.textContent = msg;
  simulasiContent.appendChild(p);
}

// Render Simulasi jika terjadi bentrok
function renderSimulasiConflict(hari, ruang, recommendedSlot) {
  while (simulasiContent.firstChild) {
    simulasiContent.removeChild(simulasiContent.firstChild);
  }

  if (!recommendedSlot) {
    const p = document.createElement('p');
    p.className = 'text-xs text-slate-500 py-3 text-center';
    p.textContent = 'Tidak ada slot kosong pada hari dan ruang ini. Coba hari atau ruang lain.';
    simulasiContent.appendChild(p);
    return;
  }

  // 3 Baris Info
  const infoTable = document.createElement('div');
  infoTable.className = 'space-y-2 text-xs text-slate-700 py-1';

  const r1 = document.createElement('div');
  r1.className = 'flex justify-between';
  const r1L = document.createElement('span');
  r1L.className = 'text-slate-500';
  r1L.textContent = 'Hari Rekomendasi';
  const r1V = document.createElement('span');
  r1V.className = 'font-bold text-slate-900';
  r1V.textContent = hari;
  r1.appendChild(r1L);
  r1.appendChild(r1V);
  infoTable.appendChild(r1);

  const r2 = document.createElement('div');
  r2.className = 'flex justify-between';
  const r2L = document.createElement('span');
  r2L.className = 'text-slate-500';
  r2L.textContent = 'Ruang Sasaran';
  const r2V = document.createElement('span');
  r2V.className = 'font-bold text-slate-900';
  r2V.textContent = ruang;
  r2.appendChild(r2L);
  r2.appendChild(r2V);
  infoTable.appendChild(r2);

  const r3 = document.createElement('div');
  r3.className = 'flex justify-between';
  const r3L = document.createElement('span');
  r3L.className = 'text-slate-500';
  r3L.textContent = 'Jam Tersedia';
  const r3V = document.createElement('span');
  r3V.className = 'font-bold text-indigo-600';
  r3V.textContent = `${recommendedSlot.startDisplay}-${recommendedSlot.endDisplay}`;
  r3.appendChild(r3L);
  r3.appendChild(r3V);
  infoTable.appendChild(r3);

  simulasiContent.appendChild(infoTable);

  // Kotak Hijau Tersedia
  const greenBox = document.createElement('div');
  greenBox.className = 'bg-emerald-50 border border-emerald-200 rounded-xl p-3.5';

  const greenHead = document.createElement('div');
  greenHead.className = 'flex items-center gap-2 text-emerald-800 text-xs font-bold';
  const checkSvg = createSvg('svg', { class: 'w-4 h-4 text-emerald-600', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' });
  const pCheck = createSvg('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 13l4 4L19 7' });
  checkSvg.appendChild(pCheck);
  greenHead.appendChild(checkSvg);

  const headTitle = document.createElement('span');
  headTitle.textContent = 'Jadwal tersedia — tidak ada bentrok.';
  greenHead.appendChild(headTitle);
  greenBox.appendChild(greenHead);

  const greenDesc = document.createElement('p');
  greenDesc.className = 'text-[11px] text-emerald-700 mt-1 pl-6';
  greenDesc.textContent = `Ruangan ${ruang} kosong pada slot waktu tersebut.`;
  greenBox.appendChild(greenDesc);

  simulasiContent.appendChild(greenBox);

  // Kotak Analisis Ketersediaan
  const analysisBox = document.createElement('div');
  analysisBox.className = 'bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 leading-relaxed';

  const anaHead = document.createElement('h6');
  anaHead.className = 'text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1';
  anaHead.textContent = 'ANALISIS KETERSEDIAAN:';
  analysisBox.appendChild(anaHead);

  const anaP = document.createElement('p');
  anaP.textContent = `Mengubah rentang waktu ke ${recommendedSlot.startDisplay}-${recommendedSlot.endDisplay} di ${ruang} menyelesaikan masalah bentrok. Tombol Simpan Jadwal akan otomatis aktif dalam warna ungu.`;
  analysisBox.appendChild(anaP);

  simulasiContent.appendChild(analysisBox);

  // Tombol Terapkan Parameter Valid Ini
  const btnApply = document.createElement('button');
  btnApply.type = 'button';
  btnApply.className = 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-2.5 px-4 rounded-xl text-xs w-full transition flex items-center justify-center gap-2 shadow-sm';

  const sparkSvg = createSvg('svg', { class: 'w-4 h-4 text-indigo-600', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' });
  const pSpark = createSvg('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' });
  sparkSvg.appendChild(pSpark);
  btnApply.appendChild(sparkSvg);

  const btnText = document.createElement('span');
  btnText.textContent = 'Terapkan Parameter Valid Ini';
  btnApply.appendChild(btnText);

  btnApply.addEventListener('click', () => {
    formJamMulai.value = recommendedSlot.start.substring(0, 5);
    formJamSelesai.value = recommendedSlot.end.substring(0, 5);
    triggerLiveConflictCheck();
  });

  simulasiContent.appendChild(btnApply);
}

// Render Simulasi jika input valid tanpa bentrok
function renderSimulasiValid(hari, ruang, jamMulai, jamSelesai) {
  while (simulasiContent.firstChild) {
    simulasiContent.removeChild(simulasiContent.firstChild);
  }

  const greenBox = document.createElement('div');
  greenBox.className = 'bg-emerald-50 border border-emerald-200 rounded-xl p-3.5';

  const greenHead = document.createElement('div');
  greenHead.className = 'flex items-center gap-2 text-emerald-800 text-xs font-bold';
  const checkSvg = createSvg('svg', { class: 'w-4 h-4 text-emerald-600', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' });
  const pCheck = createSvg('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 13l4 4L19 7' });
  checkSvg.appendChild(pCheck);
  greenHead.appendChild(checkSvg);

  const headTitle = document.createElement('span');
  headTitle.textContent = 'Jadwal tersedia — tidak ada bentrok.';
  greenHead.appendChild(headTitle);
  greenBox.appendChild(greenHead);

  const greenDesc = document.createElement('p');
  greenDesc.className = 'text-[11px] text-emerald-700 mt-1 pl-6';
  greenDesc.textContent = `Ruangan ${ruang} kosong pada slot waktu ${formatTimeDot(jamMulai, jamSelesai)}.`;
  greenBox.appendChild(greenDesc);

  simulasiContent.appendChild(greenBox);
}

// Render Panel Okupansi Ruang
function renderOkupansiPanel(hari, ruang, conflictingItem = null, recommendedSlot = null) {
  while (okupansiList.firstChild) {
    okupansiList.removeChild(okupansiList.firstChild);
  }

  if (!hari || !ruang) {
    okupansiCardTitle.textContent = 'OKUPANSI RUANG';
    const p = document.createElement('p');
    p.className = 'text-xs text-slate-400 py-3 text-center';
    p.textContent = 'Pilih Hari dan Ruang untuk melihat okupansi ruangan.';
    okupansiList.appendChild(p);
    return;
  }

  okupansiCardTitle.textContent = `OKUPANSI RUANG ${ruang.toUpperCase()} (${hari.toUpperCase()})`;

  // Filter jadwal di ruang & hari tersebut
  const roomSchedules = allSchedules.filter(s => {
    if (currentEditId !== null && s.id === currentEditId) return false;
    return s.hari.trim().toLowerCase() === hari.toLowerCase() &&
      s.ruang.trim().toLowerCase() === ruang.toLowerCase();
  });

  roomSchedules.sort((a, b) => normalizeTime(a.jam_mulai).localeCompare(normalizeTime(b.jam_mulai)));

  if (roomSchedules.length === 0 && !recommendedSlot) {
    const p = document.createElement('p');
    p.className = 'text-xs text-slate-400 py-3 text-center';
    p.textContent = 'Belum ada jadwal pada ruang ini.';
    okupansiList.appendChild(p);
    return;
  }

  // Render Sesi Terdaftar
  roomSchedules.forEach(s => {
    const isThisConflict = conflictingItem && s.id === conflictingItem.id;

    const box = document.createElement('div');
    box.className = isThisConflict
      ? 'bg-amber-50 border border-amber-300 rounded-xl p-3 shadow-sm transition'
      : 'bg-slate-50 border border-slate-100 rounded-xl p-3 transition';

    const topRow = document.createElement('div');
    topRow.className = 'flex items-center justify-between text-xs';

    const pillTime = document.createElement('span');
    pillTime.className = isThisConflict
      ? 'font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded'
      : 'font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded';
    pillTime.textContent = formatTimeDot(s.jam_mulai, s.jam_selesai);
    topRow.appendChild(pillTime);

    const statusSpan = document.createElement('span');
    statusSpan.className = isThisConflict
      ? 'text-[11px] font-bold text-amber-800'
      : 'text-[11px] font-semibold text-slate-500';
    statusSpan.textContent = isThisConflict ? 'Sedang Terpakai' : 'Terjadwal';
    topRow.appendChild(statusSpan);
    box.appendChild(topRow);

    const titleH = document.createElement('h6');
    titleH.className = 'text-xs font-bold text-slate-900 mt-2 truncate';
    titleH.textContent = s.matakuliah;
    box.appendChild(titleH);

    const metaP = document.createElement('p');
    metaP.className = 'text-[11px] text-slate-500 mt-0.5 truncate';
    metaP.textContent = `Kelas ${s.kelas} • ${s.dosen}`;
    box.appendChild(metaP);

    okupansiList.appendChild(box);
  });

  // Render Slot Rekomendasi Bebas jika ada
  if (recommendedSlot) {
    const freeBox = document.createElement('div');
    freeBox.className = 'bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-sm';

    const topRow = document.createElement('div');
    topRow.className = 'flex items-center justify-between text-xs';

    const pillTime = document.createElement('span');
    pillTime.className = 'font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded';
    pillTime.textContent = `${recommendedSlot.startDisplay}-${recommendedSlot.endDisplay}`;
    topRow.appendChild(pillTime);

    const statusSpan = document.createElement('span');
    statusSpan.className = 'text-[11px] font-bold text-emerald-700';
    statusSpan.textContent = 'Tersedia Bebas';
    topRow.appendChild(statusSpan);
    freeBox.appendChild(topRow);

    const titleH = document.createElement('h6');
    titleH.className = 'text-xs font-bold text-emerald-950 mt-2';
    titleH.textContent = 'Slot Kosong';
    freeBox.appendChild(titleH);

    const metaP = document.createElement('p');
    metaP.className = 'text-[11px] text-emerald-700 mt-0.5';
    metaP.textContent = 'Dapat dialokasikan tanpa bentrok ruang.';
    freeBox.appendChild(metaP);

    okupansiList.appendChild(freeBox);
  }
}

// Handler Submit Form Tambah & Edit
async function handleScheduleSubmit(e) {
  e.preventDefault();

  const matakuliah = formMatakuliah.value.trim();
  const kelas = formKelas.value.trim();
  const dosen = formDosen.value.trim();
  const hari = formHari.value.trim();
  const ruang = formRuang.value.trim();
  const rawJamMulai = formJamMulai.value;
  const rawJamSelesai = formJamSelesai.value;

  // 1. Validasi Kelengkapan Field
  if (!matakuliah || !kelas || !dosen || !hari || !ruang || !rawJamMulai || !rawJamSelesai) {
    showFormAlert('Validasi Form:', 'Seluruh field wajib diisi dan tidak boleh hanya berisi spasi.');
    return;
  }

  // 2. Validasi Batas Panjang
  if (matakuliah.length > 100) {
    showFormAlert('Validasi Form:', 'Mata kuliah maksimal 100 karakter.');
    return;
  }
  if (dosen.length > 100) {
    showFormAlert('Validasi Form:', 'Nama dosen maksimal 100 karakter.');
    return;
  }
  if (kelas.length > 20) {
    showFormAlert('Validasi Form:', 'Kelas maksimal 20 karakter.');
    return;
  }
  if (ruang.length > 20) {
    showFormAlert('Validasi Form:', 'Ruang kuliah maksimal 20 karakter.');
    return;
  }

  // 3. Validasi Whitelist Hari
  if (!VALID_DAYS.includes(hari)) {
    showFormAlert('Validasi Form:', 'Hari pelaksanaan harus dipilih antara Senin hingga Minggu.');
    return;
  }

  // 4. Normalisasi Jam
  const jam_mulai = normalizeTime(rawJamMulai);
  const jam_selesai = normalizeTime(rawJamSelesai);

  // 5. Validasi Kronologi Jam
  if (jam_selesai <= jam_mulai) {
    showFormAlert('Jam selesai perkuliahan harus lebih akhir dari jam mulai');
    return;
  }

  if (!supabase) {
    showFormAlert('Konfigurasi Supabase:', 'Kredensial Supabase belum terpasang.');
    return;
  }

  // Set Loading State
  btnSubmitSchedule.disabled = true;
  btnSubmitSchedule.className = 'bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl opacity-70 cursor-not-allowed flex items-center justify-center gap-2 text-sm';

  // Kosongkan dan buat isi loading
  while (btnSubmitSchedule.firstChild) {
    btnSubmitSchedule.removeChild(btnSubmitSchedule.firstChild);
  }
  const spinSvg = createSvg('svg', { class: 'animate-spin h-4 w-4 text-white', fill: 'none', viewBox: '0 0 24 24' });
  const circle = createSvg('circle', { class: 'opacity-25', cx: '12', cy: '12', r: '10', stroke: 'currentColor', 'stroke-width': '4' });
  const pSpin = createSvg('path', { class: 'opacity-75', fill: 'currentColor', d: 'M4 12a8 8 0 018-8v8H4z' });
  spinSvg.appendChild(circle);
  spinSvg.appendChild(pSpin);
  btnSubmitSchedule.appendChild(spinSvg);
  const loadText = document.createElement('span');
  loadText.textContent = 'Memvalidasi & Menyimpan...';
  btnSubmitSchedule.appendChild(loadText);

  try {
    // 6. SELECT data terbaru dari Supabase untuk verifikasi bentrok final
    const { data: latestSchedules, error: fetchErr } = await supabase
      .from('schedules')
      .select('id, matakuliah, dosen, kelas, ruang, hari, jam_mulai, jam_selesai');

    if (fetchErr) {
      console.error('Fetch check error:', fetchErr);
      showFormAlert('Gagal Validasi:', 'Tidak dapat memeriksa jadwal bentrok ke database.');
      return;
    }

    const currentList = Array.isArray(latestSchedules) ? latestSchedules : [];
    const normalizedExisting = currentList.map(item => ({
      ...item,
      jam_mulai: normalizeTime(item.jam_mulai),
      jam_selesai: normalizeTime(item.jam_selesai)
    }));

    const newSchedulePayload = {
      matakuliah,
      dosen,
      kelas,
      ruang,
      hari,
      jam_mulai,
      jam_selesai
    };

    let targetEditId = currentEditId;
    if (targetEditId !== null && normalizedExisting.length > 0) {
      if (typeof normalizedExisting[0].id === 'number') {
        targetEditId = Number(targetEditId);
      }
    }

    // 7. Cek Bentrok Baku
    const isConflict = isScheduleConflicting(newSchedulePayload, normalizedExisting, targetEditId);

    if (isConflict) {
      // JANGAN panggil Supabase mutasi, pertahankan isi form
      const conflictingItem = findConflictingSchedule(newSchedulePayload, normalizedExisting, targetEditId);
      let detailStr = '';
      if (conflictingItem) {
        detailStr = `${ruang} — ${hari}, ${formatTimeDot(conflictingItem.jam_mulai, conflictingItem.jam_selesai)} sudah terisi oleh mata kuliah ${conflictingItem.matakuliah} (${conflictingItem.kelas}).`;
      }
      applyConflictStyles();
      showFormAlert('Ruang sudah digunakan pada jam tersebut', detailStr);
      formAlertBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 8. Eksekusi Mutasi ke Supabase
    let savedRecordId = null;

    if (currentEditId === null) {
      // Insert
      const { data: inserted, error: insertErr } = await supabase
        .from('schedules')
        .insert([newSchedulePayload])
        .select('id');

      if (insertErr) {
        console.error('Insert error:', insertErr);
        showFormAlert('Gagal Menyimpan:', 'Terjadi kesalahan saat menyimpan jadwal.');
        return;
      }

      if (inserted && inserted.length > 0) {
        savedRecordId = inserted[0].id;
      }

      showToastNotification(
        'Jadwal berhasil disimpan',
        `${matakuliah} — ${hari}, ${formatTimeDot(jam_mulai, jam_selesai)}, ${ruang}.`
      );
    } else {
      // Update
      const { error: updateErr } = await supabase
        .from('schedules')
        .update(newSchedulePayload)
        .eq('id', currentEditId);

      if (updateErr) {
        console.error('Update error:', updateErr);
        showFormAlert('Gagal Memperbarui:', 'Terjadi kesalahan saat memperbarui jadwal.');
        return;
      }

      savedRecordId = currentEditId;
      showToastNotification(
        'Jadwal berhasil diperbarui',
        `${matakuliah} — ${hari}, ${formatTimeDot(jam_mulai, jam_selesai)}, ${ruang}.`
      );
    }

    // Reset Form & Mode
    currentEditId = null;
    mainScheduleForm.reset();
    clearConflictStyles();
    hideFormAlert();

    // Set highlight baris baru tersimpan
    newlySavedId = savedRecordId;

    // Refresh Data & Kembali ke View Daftar
    await loadSchedulesFromSupabase();
    setView('jadwal');
  } catch (err) {
    console.error('Submit exception:', err);
    showFormAlert('Kesalahan Sistem:', 'Terjadi kesalahan tidak terduga saat memproses jadwal.');
  } finally {
    clearConflictStyles();
  }
}

// ==================== TOAST & MODAL HAPUS ====================

function showToastNotification(title, detail) {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTitle.textContent = title;
  toastDetail.textContent = detail;
  toastSuccess.classList.remove('hidden');

  toastTimeout = setTimeout(() => {
    hideToastNotification();
  }, 6000);
}

function hideToastNotification() {
  toastSuccess.classList.add('hidden');
}

function openDeleteModal(schedule) {
  deleteTargetId = schedule.id;
  deleteItemName.textContent = `"${schedule.matakuliah}" (${schedule.kelas})`;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteTargetId = null;
  deleteModal.classList.add('hidden');
}

async function executeDelete() {
  if (!deleteTargetId || !supabase) {
    closeDeleteModal();
    return;
  }

  const idToDelete = deleteTargetId;
  const targetObj = allSchedules.find(s => s.id === idToDelete);
  const targetName = targetObj ? targetObj.matakuliah : 'Jadwal';

  btnConfirmDelete.disabled = true;
  btnConfirmDelete.textContent = 'Menghapus...';

  try {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', idToDelete);

    if (error) {
      console.error('Delete error:', error);
    } else {
      showToastNotification('Jadwal berhasil dihapus', targetName);
      if (currentEditId !== null && currentEditId === idToDelete) {
        currentEditId = null;
        mainScheduleForm.reset();
      }
      await loadSchedulesFromSupabase();
    }
  } catch (err) {
    console.error('Delete exception:', err);
  } finally {
    btnConfirmDelete.disabled = false;
    btnConfirmDelete.textContent = 'Ya, Hapus Jadwal';
    closeDeleteModal();
  }
}

// ==================== EVENT LISTENERS & BOOTSTRAP ====================

document.addEventListener('DOMContentLoaded', () => {
  // Hashchange Router
  window.addEventListener('hashchange', handleHashChange);

  // Inisialisasi View awal berdasar hash
  handleHashChange();

  // Load Data
  loadSchedulesFromSupabase();

  // Kalender Bulan Navigasi
  btnPrevMonth.addEventListener('click', () => {
    calendarCurrentMonth = new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth() - 1, 1);
    renderCalendarComponent();
  });

  btnNextMonth.addEventListener('click', () => {
    calendarCurrentMonth = new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth() + 1, 1);
    renderCalendarComponent();
  });

  // Table Filters (View 2)
  tableSearchInput.addEventListener('input', (e) => {
    tableFilterState.keyword = e.target.value;
    newlySavedId = null;
    renderTableDataRows();
  });

  tableRoomFilter.addEventListener('change', () => {
    newlySavedId = null;
    renderTableDataRows();
  });

  btnResetTableFilter.addEventListener('click', () => {
    tableSearchInput.value = '';
    tableFilterState.keyword = '';
    tableFilterState.hari = '';
    tableRoomFilter.value = '';
    newlySavedId = null;
    renderDayFilterPills();
    renderTableDataRows();
  });

  // Live Conflict Check Debounce (View 3)
  const inputsToWatch = [formHari, formRuang, formJamMulai, formJamSelesai];
  inputsToWatch.forEach(input => {
    input.addEventListener('input', () => {
      if (liveCheckDebounceTimer) clearTimeout(liveCheckDebounceTimer);
      liveCheckDebounceTimer = setTimeout(triggerLiveConflictCheck, 200);
    });
    input.addEventListener('change', () => {
      if (liveCheckDebounceTimer) clearTimeout(liveCheckDebounceTimer);
      liveCheckDebounceTimer = setTimeout(triggerLiveConflictCheck, 200);
    });
  });

  // Form Submit & Cancel (View 3)
  mainScheduleForm.addEventListener('submit', handleScheduleSubmit);
  btnCancelForm.addEventListener('click', cancelForm);

  // Modal Delete Actions
  btnCancelDelete.addEventListener('click', closeDeleteModal);
  btnConfirmDelete.addEventListener('click', executeDelete);

  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !deleteModal.classList.contains('hidden')) {
      closeDeleteModal();
    }
  });

  // Toast Close
  btnCloseToast.addEventListener('click', hideToastNotification);
});
