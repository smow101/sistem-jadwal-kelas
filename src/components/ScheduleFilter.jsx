import React from 'react';
import { VALID_DAYS } from '../lib/utils';

export default function ScheduleFilter({
  searchKeyword,
  onSearchChange,
  filterHari,
  onHariChange,
  filterRuang,
  onRuangChange,
  uniqueRooms,
  onReset
}) {
  return (
    <div className="p-5 border-b border-slate-200 bg-slate-50/50">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Live Search */}
        <div className="sm:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari matakuliah, dosen, kelas..."
            className="w-full pl-9 pr-3 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* Filter Hari */}
        <div className="sm:col-span-3">
          <select
            value={filterHari}
            onChange={(e) => onHariChange(e.target.value)}
            className="w-full py-2 px-3 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          >
            <option value="">Semua Hari</option>
            {VALID_DAYS.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        {/* Filter Ruang */}
        <div className="sm:col-span-2">
          <select
            value={filterRuang}
            onChange={(e) => onRuangChange(e.target.value)}
            className="w-full py-2 px-3 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          >
            <option value="">Semua Ruang</option>
            {uniqueRooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2 px-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition text-center shadow-sm"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
}
