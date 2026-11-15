import React from 'react';

export default function Header({ connectionStatus }) {
  let badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
  let dotStyle = 'bg-slate-400';
  let statusText = 'Memeriksa Koneksi...';

  if (connectionStatus === 'connected') {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotStyle = 'bg-emerald-500';
    statusText = 'Terhubung ke Supabase';
  } else if (connectionStatus === 'error') {
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
    dotStyle = 'bg-rose-500';
    statusText = 'Gagal Terhubung';
  } else if (connectionStatus === 'unconfigured') {
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
    dotStyle = 'bg-rose-500';
    statusText = 'Kredensial Belum Diisi';
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sistem Data Jadwal Kuliah</h1>
            <p className="text-xs text-slate-500">Class Schedule Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`border px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${badgeStyle}`}>
            <span className={`w-2 h-2 rounded-full ${dotStyle}`}></span>
            <span>{statusText}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
