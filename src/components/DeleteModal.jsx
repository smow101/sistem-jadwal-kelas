import React, { useEffect } from 'react';

export default function DeleteModal({
  isOpen,
  targetSchedule,
  onClose,
  onConfirm,
  isDeleting
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !targetSchedule) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deleteModalTitle"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 id="deleteModalTitle" className="text-lg font-semibold text-slate-900 mb-2">
          Konfirmasi Hapus Jadwal
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Apakah Anda yakin ingin menghapus jadwal perkuliahan{' '}
          <span className="font-semibold text-slate-900">
            "{targetSchedule.matakuliah}" ({targetSchedule.kelas})
          </span>
          ? Data yang sudah dihapus tidak dapat dipulihkan kembali.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg text-sm transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition shadow-sm"
          >
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Jadwal'}
          </button>
        </div>
      </div>
    </div>
  );
}
