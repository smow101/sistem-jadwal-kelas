import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import ScheduleForm from './components/ScheduleForm';
import ScheduleTable from './components/ScheduleTable';
import ScheduleFilter from './components/ScheduleFilter';
import DeleteModal from './components/DeleteModal';
import AlertBanner from './components/AlertBanner';
import SuccessBanner from './components/SuccessBanner';

import { supabase, isConfigured } from './lib/supabase';
import { isScheduleConflicting } from './lib/conflictDetection';
import { normalizeTime, DAY_ORDER, VALID_DAYS } from './lib/utils';

const INITIAL_FORM = {
  matakuliah: '',
  dosen: '',
  kelas: '',
  ruang: '',
  hari: '',
  jam_mulai: '',
  jam_selesai: ''
};

export default function App() {
  const [schedules, setSchedules] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking | connected | error | unconfigured
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form & Edit State
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Alert & Notification State
  const [errorBanner, setErrorBanner] = useState({ title: '', message: '' });
  const [successMessage, setSuccessMessage] = useState('');

  // Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterHari, setFilterHari] = useState('');
  const [filterRuang, setFilterRuang] = useState('');

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch Schedules from Supabase
  const fetchSchedules = useCallback(async () => {
    if (!isConfigured || !supabase) {
      setConnectionStatus('unconfigured');
      setErrorBanner({
        title: 'Konfigurasi Supabase:',
        message: 'Silakan isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di berkas .env.'
      });
      setSchedules([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('id, matakuliah, dosen, kelas, ruang, hari, jam_mulai, jam_selesai, created_at');

      if (error) {
        console.error('Fetch error:', error);
        setConnectionStatus('error');
        setErrorBanner({
          title: 'Gagal Mengambil Data:',
          message: 'Terjadi kesalahan saat memuat jadwal perkuliahan.'
        });
        return;
      }

      setConnectionStatus('connected');
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch exception:', err);
      setConnectionStatus('error');
      setErrorBanner({
        title: 'Koneksi Terputus:',
        message: 'Tidak dapat menghubungi server Supabase.'
      });
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Form Field Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Start Edit Schedule
  const handleStartEdit = (schedule) => {
    setCurrentEditId(schedule.id);
    setFormData({
      matakuliah: schedule.matakuliah || '',
      dosen: schedule.dosen || '',
      kelas: schedule.kelas || '',
      ruang: schedule.ruang || '',
      hari: schedule.hari || '',
      jam_mulai: String(schedule.jam_mulai || '').substring(0, 5),
      jam_selesai: String(schedule.jam_selesai || '').substring(0, 5)
    });
    setErrorBanner({ title: '', message: '' });
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Edit Schedule
  const handleCancelEdit = () => {
    setCurrentEditId(null);
    setFormData(INITIAL_FORM);
    setErrorBanner({ title: '', message: '' });
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner({ title: '', message: '' });

    const matakuliah = formData.matakuliah.trim();
    const dosen = formData.dosen.trim();
    const kelas = formData.kelas.trim();
    const ruang = formData.ruang.trim();
    const hari = formData.hari.trim();
    const rawJamMulai = formData.jam_mulai;
    const rawJamSelesai = formData.jam_selesai;

    // 1. Validasi Kelengkapan Field
    if (!matakuliah || !dosen || !kelas || !ruang || !hari || !rawJamMulai || !rawJamSelesai) {
      setErrorBanner({
        title: 'Validasi Form:',
        message: 'Seluruh field wajib diisi dan tidak boleh hanya berisi spasi.'
      });
      return;
    }

    // 2. Validasi Batas Panjang Karakter
    if (matakuliah.length > 100) {
      setErrorBanner({ title: 'Validasi Form:', message: 'Mata kuliah maksimal 100 karakter.' });
      return;
    }
    if (dosen.length > 100) {
      setErrorBanner({ title: 'Validasi Form:', message: 'Nama dosen maksimal 100 karakter.' });
      return;
    }
    if (kelas.length > 20) {
      setErrorBanner({ title: 'Validasi Form:', message: 'Kelas maksimal 20 karakter.' });
      return;
    }
    if (ruang.length > 20) {
      setErrorBanner({ title: 'Validasi Form:', message: 'Ruang kuliah maksimal 20 karakter.' });
      return;
    }

    // 3. Validasi Whitelist Hari
    if (!VALID_DAYS.includes(hari)) {
      setErrorBanner({
        title: 'Validasi Form:',
        message: 'Hari pelaksanaan harus dipilih antara Senin hingga Minggu.'
      });
      return;
    }

    // 4. Normalisasi Format Jam
    const jam_mulai = normalizeTime(rawJamMulai);
    const jam_selesai = normalizeTime(rawJamSelesai);

    // 5. Validasi Kronologi Jam (Pesan harfiah sesuai spesifikasi rules.md)
    if (jam_selesai <= jam_mulai) {
      setErrorBanner({
        title: 'Validasi Form:',
        message: 'Jam selesai perkuliahan harus lebih akhir dari jam mulai'
      });
      return;
    }

    if (!isConfigured || !supabase) {
      setErrorBanner({
        title: 'Konfigurasi Supabase:',
        message: 'Kredensial Supabase belum terpasang.'
      });
      return;
    }

    setIsLoading(true);

    try {
      // 6. Ambil data jadwal TERBARU dari Supabase untuk verifikasi bentrok
      const { data: latestSchedules, error: fetchErr } = await supabase
        .from('schedules')
        .select('id, matakuliah, dosen, kelas, ruang, hari, jam_mulai, jam_selesai');

      if (fetchErr) {
        console.error('Fetch check error:', fetchErr);
        setErrorBanner({
          title: 'Gagal Validasi:',
          message: 'Tidak dapat memeriksa jadwal bentrok ke database.'
        });
        setIsLoading(false);
        return;
      }

      const currentList = Array.isArray(latestSchedules) ? latestSchedules : [];
      const normalizedExisting = currentList.map(item => ({
        ...item,
        jam_mulai: normalizeTime(item.jam_mulai),
        jam_selesai: normalizeTime(item.jam_selesai)
      }));

      const payload = {
        matakuliah,
        dosen,
        kelas,
        ruang,
        hari,
        jam_mulai,
        jam_selesai
      };

      // Tipe ID
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
      const isConflict = isScheduleConflicting(payload, normalizedExisting, targetEditId);

      if (isConflict) {
        // JANGAN panggil insert/update, pertahankan isi form
        setErrorBanner({
          title: 'Validasi Bentrok Jadwal:',
          message: 'Ruang sudah digunakan pada jam tersebut'
        });
        setIsLoading(false);
        return;
      }

      // 8. Eksekusi Simpan (Insert / Update) ke Supabase
      if (currentEditId === null) {
        const { error: insertErr } = await supabase
          .from('schedules')
          .insert([payload]);

        if (insertErr) {
          console.error('Insert error:', insertErr);
          setErrorBanner({
            title: 'Gagal Menyimpan:',
            message: 'Terjadi kesalahan saat menyimpan jadwal baru.'
          });
          setIsLoading(false);
          return;
        }

        setSuccessMessage('Jadwal kuliah berhasil disimpan');
        setFormData(INITIAL_FORM);
      } else {
        const { error: updateErr } = await supabase
          .from('schedules')
          .update(payload)
          .eq('id', currentEditId);

        if (updateErr) {
          console.error('Update error:', updateErr);
          setErrorBanner({
            title: 'Gagal Memperbarui:',
            message: 'Terjadi kesalahan saat memperbarui jadwal.'
          });
          setIsLoading(false);
          return;
        }

        setSuccessMessage('Jadwal kuliah berhasil diperbarui');
        handleCancelEdit();
      }

      await fetchSchedules();
    } catch (err) {
      console.error('Submit exception:', err);
      setErrorBanner({
        title: 'Kesalahan Sistem:',
        message: 'Terjadi kesalahan tidak terduga saat memproses jadwal.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !supabase) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) {
        console.error('Delete error:', error);
        setErrorBanner({
          title: 'Gagal Menghapus:',
          message: 'Terjadi kesalahan saat menghapus jadwal dari database.'
        });
      } else {
        setSuccessMessage('Jadwal kuliah berhasil dihapus');
        if (currentEditId !== null && String(currentEditId) === String(deleteTarget.id)) {
          handleCancelEdit();
        }
        await fetchSchedules();
      }
    } catch (err) {
      console.error('Delete exception:', err);
      setErrorBanner({
        title: 'Gagal Menghapus:',
        message: 'Tidak dapat memproses penghapusan jadwal.'
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setFilterHari('');
    setFilterRuang('');
  };

  // Unique Rooms for Filter Dropdown
  const uniqueRooms = useMemo(() => {
    const roomMap = new Map();
    schedules.forEach(item => {
      if (item.ruang && item.ruang.trim()) {
        const key = item.ruang.trim().toLowerCase();
        if (!roomMap.has(key)) {
          roomMap.set(key, item.ruang.trim());
        }
      }
    });
    return Array.from(roomMap.values()).sort((a, b) => a.localeCompare(b));
  }, [schedules]);

  // Filtered & Sorted Schedules for Table
  const filteredSchedules = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    const selHari = filterHari;
    const selRuang = filterRuang.trim().toLowerCase();

    const filtered = schedules.filter(item => {
      if (kw) {
        const matkulMatch = item.matakuliah && item.matakuliah.toLowerCase().includes(kw);
        const dosenMatch = item.dosen && item.dosen.toLowerCase().includes(kw);
        const kelasMatch = item.kelas && item.kelas.toLowerCase().includes(kw);
        if (!matkulMatch && !dosenMatch && !kelasMatch) return false;
      }

      if (selHari && item.hari !== selHari) return false;

      if (selRuang && item.ruang.trim().toLowerCase() !== selRuang) return false;

      return true;
    });

    filtered.sort((a, b) => {
      const orderA = DAY_ORDER[a.hari] || 99;
      const orderB = DAY_ORDER[b.hari] || 99;
      if (orderA !== orderB) return orderA - orderB;

      const startA = normalizeTime(a.jam_mulai);
      const startB = normalizeTime(b.jam_mulai);
      return startA.localeCompare(startB);
    });

    return filtered;
  }, [schedules, searchKeyword, filterHari, filterRuang]);

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* Top Header */}
      <Header connectionStatus={connectionStatus} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Summary Cards */}
        <KpiCards schedules={schedules} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form (4 cols) */}
          <div className="lg:col-span-4">
            <AlertBanner
              title={errorBanner.title}
              message={errorBanner.message}
            />
            <SuccessBanner message={successMessage} />

            <ScheduleForm
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleFormSubmit}
              isEditing={currentEditId !== null}
              onCancelEdit={handleCancelEdit}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Table & Filters (8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <ScheduleFilter
                searchKeyword={searchKeyword}
                onSearchChange={setSearchKeyword}
                filterHari={filterHari}
                onHariChange={setFilterHari}
                filterRuang={filterRuang}
                onRuangChange={setFilterRuang}
                uniqueRooms={uniqueRooms}
                onReset={handleResetFilters}
              />

              <ScheduleTable
                schedules={filteredSchedules}
                currentEditId={currentEditId}
                onEdit={handleStartEdit}
                onOpenDelete={(item) => setDeleteTarget(item)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Delete Modal */}
      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        targetSchedule={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
