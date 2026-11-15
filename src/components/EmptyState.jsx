import React from 'react';

export default function EmptyState() {
  return (
    <div className="py-12 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">Belum Ada Jadwal Kuliah</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">
        Tidak ditemukan jadwal kuliah yang sesuai. Silakan tambahkan jadwal baru atau sesuaikan filter pencarian Anda.
      </p>
    </div>
  );
}
