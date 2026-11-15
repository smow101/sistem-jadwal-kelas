import React, { useMemo } from 'react';

export default function KpiCards({ schedules }) {
  const formatter = useMemo(() => new Intl.NumberFormat('id-ID'), []);

  const totalJadwal = schedules.length;

  const totalRuang = useMemo(() => {
    const unique = new Set();
    schedules.forEach(item => {
      if (item.ruang && item.ruang.trim()) {
        unique.add(item.ruang.trim().toLowerCase());
      }
    });
    return unique.size;
  }, [schedules]);

  const totalDosen = useMemo(() => {
    const unique = new Set();
    schedules.forEach(item => {
      if (item.dosen && item.dosen.trim()) {
        unique.add(item.dosen.trim().toLowerCase());
      }
    });
    return unique.size;
  }, [schedules]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label="Ringkasan Metrik">
      {/* Total Jadwal Kuliah */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">Total Jadwal Kuliah</p>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{formatter.format(totalJadwal)}</h2>
          <p className="text-xs text-slate-400 mt-1">Keseluruhan baris jadwal</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>

      {/* Total Ruang Aktif */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">Total Ruang Aktif</p>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{formatter.format(totalRuang)}</h2>
          <p className="text-xs text-slate-400 mt-1">Ruangan unik terpakai</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>

      {/* Total Dosen Terdaftar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">Total Dosen Terdaftar</p>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{formatter.format(totalDosen)}</h2>
          <p className="text-xs text-amber-700 font-medium mt-1">Dosen unik pengampu</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
    </section>
  );
}
