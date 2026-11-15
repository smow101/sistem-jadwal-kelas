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
const isCredentialsConfigured = (
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

// State Aplikasi
let allSchedules = [];
let currentEditId = null;
let deleteTargetId = null;
let successToastTimeout = null;

// Urutan Hari Baku
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

// Referensi Elemen DOM
const connectionBadge = document.getElementById('connectionBadge');
const connectionDot = document.getElementById('connectionDot');
const connectionStatusText = document.getElementById('connectionStatusText');

const kpiTotalJadwal = document.getElementById('kpiTotalJadwal');
const kpiTotalRuang = document.getElementById('kpiTotalRuang');
const kpiTotalDosen = document.getElementById('kpiTotalDosen');

const scheduleForm = document.getElementById('scheduleForm');
const formTitle = document.getElementById('formTitle');
const formModeBadge = document.getElementById('formModeBadge');
const btnSubmit = document.getElementById('btnSubmit');
const btnSubmitText = document.getElementById('btnSubmitText');
const submitBtnContainer = document.getElementById('submitBtnContainer');
const loadingBtnContainer = document.getElementById('loadingBtnContainer');
const btnCancelEdit = document.getElementById('btnCancelEdit');

const alertBanner = document.getElementById('alertBanner');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');

const successBanner = document.getElementById('successBanner');
const successMessage = document.getElementById('successMessage');

const inputMatakuliah = document.getElementById('matakuliah');
const inputDosen = document.getElementById('dosen');
const inputKelas = document.getElementById('kelas');
const inputRuang = document.getElementById('ruang');
const inputHari = document.getElementById('hari');
const inputJamMulai = document.getElementById('jam_mulai');
const inputJamSelesai = document.getElementById('jam_selesai');

const searchKeyword = document.getElementById('searchKeyword');
const filterHari = document.getElementById('filterHari');
const filterRuang = document.getElementById('filterRuang');
const btnResetFilter = document.getElementById('btnResetFilter');

const schedulesTable = document.getElementById('schedulesTable');
const schedulesTableBody = document.getElementById('schedulesTableBody');
const emptyState = document.getElementById('emptyState');

const deleteModal = document.getElementById('deleteModal');
const deleteItemName = document.getElementById('deleteItemName');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');

/**
 * Normalisasi format jam ke HH:MM:SS
 */
function normalizeTime(timeStr) {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
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
 * Format tampilan jam ke format "08:00 - 10:00 WIB"
 */
function formatTimeDisplay(start, end) {
  const s = String(start || '').substring(0, 5);
  const e = String(end || '').substring(0, 5);
  return `${s} - ${e} WIB`;
}

/**
 * Format tanggal pembuatan ke format "15 November 2026"
 */
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Menampilkan banner error
 */
function showError(title, message) {
  errorTitle.textContent = title;
  errorMessage.textContent = message;
  alertBanner.classList.remove('hidden');
  hideSuccess();
  alertBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Menyembunyikan banner error
 */
function hideError() {
  alertBanner.classList.add('hidden');
}

/**
 * Menampilkan banner notifikasi sukses
 */
function showSuccess(message) {
  if (successToastTimeout) {
    clearTimeout(successToastTimeout);
  }
  successMessage.textContent = message;
  successBanner.classList.remove('hidden');
  hideError();

  successToastTimeout = setTimeout(() => {
    hideSuccess();
  }, 4000);
}

/**
 * Menyembunyikan banner notifikasi sukses
 */
function hideSuccess() {
  successBanner.classList.add('hidden');
}

/**
 * Memperbarui status koneksi badge
 */
function updateConnectionStatus(status, text) {
  connectionBadge.className = 'border px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5';
  connectionDot.className = 'w-2 h-2 rounded-full';

  if (status === 'connected') {
    connectionBadge.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
    connectionDot.classList.add('bg-emerald-500');
  } else if (status === 'error') {
    connectionBadge.classList.add('bg-rose-50', 'text-rose-700', 'border-rose-200');
    connectionDot.classList.add('bg-rose-500');
  } else {
    connectionBadge.classList.add('bg-slate-100', 'text-slate-600', 'border-slate-200');
    connectionDot.classList.add('bg-slate-400');
  }

  connectionStatusText.textContent = text;
}

/**
 * Mengatur tampilan loading pada tombol simpan
 */
function setLoadingState(isLoading) {
  if (isLoading) {
    submitBtnContainer.classList.add('hidden');
    loadingBtnContainer.classList.remove('hidden');
  } else {
    loadingBtnContainer.classList.add('hidden');
    submitBtnContainer.classList.remove('hidden');
  }
}

/**
 * Memperbarui kartu metrik ringkasan (KPI)
 * KPI selalu dihitung dari SELURUH data, bukan hasil filter.
 */
function updateKpiCards() {
  const numberFormatter = new Intl.NumberFormat('id-ID');

  // 1. Total Seluruh Jadwal
  kpiTotalJadwal.textContent = numberFormatter.format(allSchedules.length);

  // 2. Total Ruang Aktif (unik, case-insensitive & trimmed)
  const uniqueRooms = new Set();
  allSchedules.forEach(item => {
    if (item.ruang && item.ruang.trim()) {
      uniqueRooms.add(item.ruang.trim().toLowerCase());
    }
  });
  kpiTotalRuang.textContent = numberFormatter.format(uniqueRooms.size);

  // 3. Total Dosen Terdaftar (unik, case-insensitive & trimmed)
  const uniqueLecturers = new Set();
  allSchedules.forEach(item => {
    if (item.dosen && item.dosen.trim()) {
      uniqueLecturers.add(item.dosen.trim().toLowerCase());
    }
  });
  kpiTotalDosen.textContent = numberFormatter.format(uniqueLecturers.size);
}

/**
 * Memperbarui opsi pada dropdown Filter Ruang
 * Menggunakan createElement & textContent untuk keamanan XSS.
 */
function updateRoomFilterOptions() {
  const currentSelected = filterRuang.value;

  // Bersihkan opsi lama kecuali "Semua Ruang"
  while (filterRuang.children.length > 1) {
    filterRuang.removeChild(filterRuang.lastChild);
  }

  // Kumpulkan ruang unik berdasar data asli
  const roomMap = new Map();
  allSchedules.forEach(item => {
    if (item.ruang && item.ruang.trim()) {
      const key = item.ruang.trim().toLowerCase();
      if (!roomMap.has(key)) {
        roomMap.set(key, item.ruang.trim());
      }
    }
  });

  const sortedRooms = Array.from(roomMap.values()).sort((a, b) => a.localeCompare(b));

  sortedRooms.forEach(roomName => {
    const opt = document.createElement('option');
    opt.value = roomName;
    opt.textContent = roomName;
    if (roomName === currentSelected) {
      opt.selected = true;
    }
    filterRuang.appendChild(opt);
  });
}

/**
 * Merender baris tabel jadwal
 * Seluruh elemen DOM dan teks dibuat aman dengan createElement & textContent.
 */
function renderTable() {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const selectedHari = filterHari.value;
  const selectedRuang = filterRuang.value.trim().toLowerCase();

  // Filter Data
  const filtered = allSchedules.filter(item => {
    // 1. Pencarian Kata Kunci
    if (keyword) {
      const matkulMatch = item.matakuliah && item.matakuliah.toLowerCase().includes(keyword);
      const dosenMatch = item.dosen && item.dosen.toLowerCase().includes(keyword);
      const kelasMatch = item.kelas && item.kelas.toLowerCase().includes(keyword);
      if (!matkulMatch && !dosenMatch && !kelasMatch) {
        return false;
      }
    }

    // 2. Filter Hari
    if (selectedHari && item.hari !== selectedHari) {
      return false;
    }

    // 3. Filter Ruang
    if (selectedRuang && item.ruang.trim().toLowerCase() !== selectedRuang) {
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
    const startA = normalizeTime(a.jam_mulai);
    const startB = normalizeTime(b.jam_mulai);
    return startA.localeCompare(startB);
  });

  // Kosongkan isi tbody tabel
  while (schedulesTableBody.firstChild) {
    schedulesTableBody.removeChild(schedulesTableBody.firstChild);
  }

  // Tampilkan Empty State bila tidak ada data
  if (filtered.length === 0) {
    schedulesTable.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  schedulesTable.classList.remove('hidden');
  emptyState.classList.add('hidden');

  // Render baris data
  filtered.forEach(schedule => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-200';

    // Sorot baris jika sedang dalam mode edit
    if (currentEditId !== null && String(schedule.id) === String(currentEditId)) {
      tr.classList.add('bg-indigo-50');
    }

    // 1. Kolom Mata Kuliah & Tanggal Dibuat
    const tdMatkul = document.createElement('td');
    tdMatkul.className = 'py-3.5 px-4';
    const matkulTitle = document.createElement('div');
    matkulTitle.className = 'font-semibold text-slate-900';
    matkulTitle.textContent = schedule.matakuliah;
    tdMatkul.appendChild(matkulTitle);

    if (schedule.created_at) {
      const matkulDate = document.createElement('div');
      matkulDate.className = 'text-xs text-slate-400 mt-0.5';
      matkulDate.textContent = formatDateDisplay(schedule.created_at);
      tdMatkul.appendChild(matkulDate);
    }
    tr.appendChild(tdMatkul);

    // 2. Kolom Dosen Pengampu
    const tdDosen = document.createElement('td');
    tdDosen.className = 'py-3.5 px-4 text-slate-600';
    tdDosen.textContent = schedule.dosen;
    tr.appendChild(tdDosen);

    // 3. Kolom Kelas (Badge Primary Surface)
    const tdKelas = document.createElement('td');
    tdKelas.className = 'py-3.5 px-4';
    const badgeKelas = document.createElement('span');
    badgeKelas.className = 'inline-block bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded text-xs font-medium';
    badgeKelas.textContent = schedule.kelas;
    tdKelas.appendChild(badgeKelas);
    tr.appendChild(tdKelas);

    // 4. Kolom Ruang (Badge Netral)
    const tdRuang = document.createElement('td');
    tdRuang.className = 'py-3.5 px-4';
    const badgeRuang = document.createElement('span');
    badgeRuang.className = 'inline-block bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded text-xs font-medium';
    badgeRuang.textContent = schedule.ruang;
    tdRuang.appendChild(badgeRuang);
    tr.appendChild(tdRuang);

    // 5. Kolom Hari (Badge Netral)
    const tdHari = document.createElement('td');
    tdHari.className = 'py-3.5 px-4';
    const badgeHari = document.createElement('span');
    badgeHari.className = 'inline-block bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded text-xs font-medium';
    badgeHari.textContent = schedule.hari;
    tdHari.appendChild(badgeHari);
    tr.appendChild(tdHari);

    // 6. Kolom Waktu Pelaksanaan
    const tdWaktu = document.createElement('td');
    tdWaktu.className = 'py-3.5 px-4 text-slate-700 whitespace-nowrap text-xs font-medium';
    tdWaktu.textContent = formatTimeDisplay(schedule.jam_mulai, schedule.jam_selesai);
    tr.appendChild(tdWaktu);

    // 7. Kolom Aksi (Edit & Hapus)
    const tdAksi = document.createElement('td');
    tdAksi.className = 'py-3.5 px-4 text-right whitespace-nowrap';

    // Tombol Edit
    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3 transition';
    btnEdit.textContent = 'Edit';
    btnEdit.addEventListener('click', () => {
      startEdit(schedule);
    });
    tdAksi.appendChild(btnEdit);

    // Tombol Hapus
    const btnHapus = document.createElement('button');
    btnHapus.type = 'button';
    btnHapus.className = 'text-rose-600 hover:text-rose-800 text-sm font-medium transition';
    btnHapus.textContent = 'Hapus';
    btnHapus.addEventListener('click', () => {
      openDeleteModal(schedule);
    });
    tdAksi.appendChild(btnHapus);

    tr.appendChild(tdAksi);
    schedulesTableBody.appendChild(tr);
  });
}

/**
 * Mengambil data terbaru dari Supabase
 */
async function fetchSchedules() {
  if (!supabase) {
    updateConnectionStatus('error', 'Kredensial Belum Diisi');
    showError('Konfigurasi Supabase:', 'Silakan lengkapi SUPABASE_URL dan SUPABASE_ANON_KEY di app.js.');
    allSchedules = [];
    updateKpiCards();
    updateRoomFilterOptions();
    renderTable();
    return;
  }

  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('id, matakuliah, dosen, kelas, ruang, hari, jam_mulai, jam_selesai, created_at');

    if (error) {
      console.error('Error saat fetch schedules:', error);
      updateConnectionStatus('error', 'Gagal Terhubung');
      showError('Gagal Mengambil Data:', 'Terjadi kesalahan saat memuat jadwal perkuliahan.');
      return;
    }

    updateConnectionStatus('connected', 'Terhubung ke Supabase');
    allSchedules = Array.isArray(data) ? data : [];
    updateKpiCards();
    updateRoomFilterOptions();
    renderTable();
  } catch (err) {
    console.error('Fetch exception:', err);
    updateConnectionStatus('error', 'Koneksi Terputus');
    showError('Koneksi Terputus:', 'Tidak dapat menghubungi server Supabase.');
  }
}

/**
 * Memulai mode Edit jadwal
 */
function startEdit(schedule) {
  currentEditId = schedule.id;

  inputMatakuliah.value = schedule.matakuliah;
  inputDosen.value = schedule.dosen;
  inputKelas.value = schedule.kelas;
  inputRuang.value = schedule.ruang;
  inputHari.value = schedule.hari;
  inputJamMulai.value = String(schedule.jam_mulai || '').substring(0, 5);
  inputJamSelesai.value = String(schedule.jam_selesai || '').substring(0, 5);

  formTitle.textContent = 'Edit Jadwal Kuliah';
  formModeBadge.classList.remove('hidden');
  btnSubmitText.textContent = 'Perbarui Jadwal';
  btnCancelEdit.classList.remove('hidden');

  hideError();
  hideSuccess();
  renderTable(); // Refresh tabel untuk memunculkan highlight bg-indigo-50

  scheduleForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Membatalkan mode Edit
 */
function cancelEdit() {
  currentEditId = null;
  scheduleForm.reset();

  formTitle.textContent = 'Tambah Jadwal Kuliah';
  formModeBadge.classList.add('hidden');
  btnSubmitText.textContent = 'Simpan Jadwal';
  btnCancelEdit.classList.add('hidden');

  hideError();
  renderTable();
}

/**
 * Membuka modal konfirmasi hapus
 */
function openDeleteModal(schedule) {
  deleteTargetId = schedule.id;
  deleteItemName.textContent = `"${schedule.matakuliah}" (${schedule.kelas})`;
  deleteModal.classList.remove('hidden');
}

/**
 * Menutup modal konfirmasi hapus
 */
function closeDeleteModal() {
  deleteTargetId = null;
  deleteModal.classList.add('hidden');
}

/**
 * Eksekusi penghapusan jadwal ke Supabase
 */
async function executeDelete() {
  if (!deleteTargetId) return;

  if (!supabase) {
    showError('Konfigurasi Supabase:', 'Kredensial Supabase belum terpasang.');
    closeDeleteModal();
    return;
  }

  const idToDelete = deleteTargetId;
  btnConfirmDelete.disabled = true;
  btnConfirmDelete.textContent = 'Menghapus...';

  try {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', idToDelete);

    if (error) {
      console.error('Error delete:', error);
      showError('Gagal Menghapus:', 'Terjadi kesalahan saat menghapus jadwal dari database.');
    } else {
      showSuccess('Jadwal kuliah berhasil dihapus');
      if (currentEditId !== null && String(currentEditId) === String(idToDelete)) {
        cancelEdit();
      }
      await fetchSchedules();
    }
  } catch (err) {
    console.error('Delete exception:', err);
    showError('Gagal Menghapus:', 'Tidak dapat memproses penghapusan jadwal.');
  } finally {
    btnConfirmDelete.disabled = false;
    btnConfirmDelete.textContent = 'Ya, Hapus Jadwal';
    closeDeleteModal();
  }
}

/**
 * Penanganan pengiriman form (Tambah & Edit)
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  hideError();

  const matakuliah = inputMatakuliah.value.trim();
  const dosen = inputDosen.value.trim();
  const kelas = inputKelas.value.trim();
  const ruang = inputRuang.value.trim();
  const hari = inputHari.value.trim();
  const rawJamMulai = inputJamMulai.value;
  const rawJamSelesai = inputJamSelesai.value;

  // 1. Validasi Kelengkapan Field
  if (!matakuliah || !dosen || !kelas || !ruang || !hari || !rawJamMulai || !rawJamSelesai) {
    showError('Validasi Form:', 'Seluruh field wajib diisi dan tidak boleh hanya berisi spasi.');
    return;
  }

  // 2. Validasi Batas Panjang Karakter
  if (matakuliah.length > 100) {
    showError('Validasi Form:', 'Mata kuliah maksimal 100 karakter.');
    return;
  }
  if (dosen.length > 100) {
    showError('Validasi Form:', 'Nama dosen maksimal 100 karakter.');
    return;
  }
  if (kelas.length > 20) {
    showError('Validasi Form:', 'Kelas maksimal 20 karakter.');
    return;
  }
  if (ruang.length > 20) {
    showError('Validasi Form:', 'Ruang kuliah maksimal 20 karakter.');
    return;
  }

  // 3. Validasi Whitelist Hari
  if (!VALID_DAYS.includes(hari)) {
    showError('Validasi Form:', 'Hari pelaksanaan harus dipilih antara Senin hingga Minggu.');
    return;
  }

  // 4. Normalisasi Format Jam
  const jam_mulai = normalizeTime(rawJamMulai);
  const jam_selesai = normalizeTime(rawJamSelesai);

  // 5. Validasi Kronologi Jam (Pesan harfiah sesuai spesifikasi rules.md)
  if (jam_selesai <= jam_mulai) {
    showError('Validasi Form:', 'Jam selesai perkuliahan harus lebih akhir dari jam mulai');
    return;
  }

  if (!supabase) {
    showError('Konfigurasi Supabase:', 'Kredensial Supabase belum terpasang.');
    return;
  }

  setLoadingState(true);

  try {
    // 6. Ambil data jadwal TERBARU dari Supabase untuk verifikasi bentrok
    const { data: latestSchedules, error: fetchErr } = await supabase
      .from('schedules')
      .select('id, matakuliah, dosen, kelas, ruang, hari, jam_mulai, jam_selesai');

    if (fetchErr) {
      console.error('Fetch check error:', fetchErr);
      showError('Gagal Validasi:', 'Tidak dapat memeriksa jadwal bentrok ke database.');
      setLoadingState(false);
      return;
    }

    const currentScheduleList = Array.isArray(latestSchedules) ? latestSchedules : [];

    // Normalisasi jam pada data jadwal existing sebelum komparasi bentrok
    const normalizedExisting = currentScheduleList.map(item => ({
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

    // Samakan tipe ID saat mengirim ke isScheduleConflicting
    let targetEditId = currentEditId;
    if (targetEditId !== null && normalizedExisting.length > 0) {
      const sampleId = normalizedExisting[0].id;
      if (typeof sampleId === 'number') {
        targetEditId = Number(targetEditId);
      } else if (typeof sampleId === 'string') {
        targetEditId = String(targetEditId);
      }
    }

    // 7. Cek Bentrok menggunakan fungsi baku isScheduleConflicting
    const isConflict = isScheduleConflicting(newSchedulePayload, normalizedExisting, targetEditId);

    if (isConflict) {
      // JANGAN panggil insert/update, pertahankan isi form
      showError('Validasi Bentrok Jadwal:', 'Ruang sudah digunakan pada jam tersebut');
      setLoadingState(false);
      return;
    }

    // 8. Eksekusi Simpan (Insert / Update) ke Supabase
    if (currentEditId === null) {
      // Mode Tambah (Insert)
      const { error: insertErr } = await supabase
        .from('schedules')
        .insert([newSchedulePayload]);

      if (insertErr) {
        console.error('Insert error:', insertErr);
        showError('Gagal Menyimpan:', 'Terjadi kesalahan saat menyimpan jadwal baru.');
        setLoadingState(false);
        return;
      }

      showSuccess('Jadwal kuliah berhasil disimpan');
      scheduleForm.reset();
    } else {
      // Mode Perbarui (Update)
      const { error: updateErr } = await supabase
        .from('schedules')
        .update(newSchedulePayload)
        .eq('id', currentEditId);

      if (updateErr) {
        console.error('Update error:', updateErr);
        showError('Gagal Memperbarui:', 'Terjadi kesalahan saat memperbarui jadwal.');
        setLoadingState(false);
        return;
      }

      showSuccess('Jadwal kuliah berhasil diperbarui');
      cancelEdit();
    }

    // Perbarui data tabel & metrik KPI
    await fetchSchedules();
  } catch (err) {
    console.error('Submit exception:', err);
    showError('Kesalahan Sistem:', 'Terjadi kesalahan tidak terduga saat memproses jadwal.');
  } finally {
    setLoadingState(false);
  }
}

// Inisialisasi Event Listener
document.addEventListener('DOMContentLoaded', () => {
  // Submit Form
  scheduleForm.addEventListener('submit', handleFormSubmit);

  // Batal Edit
  btnCancelEdit.addEventListener('click', cancelEdit);

  // Search & Filter Events
  searchKeyword.addEventListener('input', renderTable);
  filterHari.addEventListener('change', renderTable);
  filterRuang.addEventListener('change', renderTable);

  btnResetFilter.addEventListener('click', () => {
    searchKeyword.value = '';
    filterHari.value = '';
    filterRuang.value = '';
    renderTable();
  });

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

  // Muat Data Jadwal Perdana
  fetchSchedules();
});
