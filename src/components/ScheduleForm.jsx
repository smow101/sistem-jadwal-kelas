import React from 'react';
import { VALID_DAYS } from '../lib/utils';

export default function ScheduleForm({
  formData,
  onChange,
  onSubmit,
  isEditing,
  onCancelEdit,
  isLoading
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          {isEditing ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
        </h2>
        {isEditing && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
            Mode Edit
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {/* Mata Kuliah */}
        <div>
          <label htmlFor="matakuliah" className="text-sm font-medium text-slate-700 mb-1.5 block">
            Mata Kuliah <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="matakuliah"
            name="matakuliah"
            maxLength={100}
            value={formData.matakuliah}
            onChange={onChange}
            placeholder="Contoh: Pemrograman Web"
            className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* Dosen Pengampu */}
        <div>
          <label htmlFor="dosen" className="text-sm font-medium text-slate-700 mb-1.5 block">
            Dosen Pengampu <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="dosen"
            name="dosen"
            maxLength={100}
            value={formData.dosen}
            onChange={onChange}
            placeholder="Contoh: Dr. Budi Santoso, M.Kom."
            className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* Kelas & Ruang */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="kelas" className="text-sm font-medium text-slate-700 mb-1.5 block">
              Kelas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="kelas"
              name="kelas"
              maxLength={20}
              value={formData.kelas}
              onChange={onChange}
              placeholder="TI-3A"
              className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="ruang" className="text-sm font-medium text-slate-700 mb-1.5 block">
              Ruang Kuliah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="ruang"
              name="ruang"
              maxLength={20}
              value={formData.ruang}
              onChange={onChange}
              placeholder="GKB-201"
              className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Hari */}
        <div>
          <label htmlFor="hari" className="text-sm font-medium text-slate-700 mb-1.5 block">
            Hari Pelaksanaan <span className="text-rose-500">*</span>
          </label>
          <select
            id="hari"
            name="hari"
            value={formData.hari}
            onChange={onChange}
            className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          >
            <option value="">Pilih Hari</option>
            {VALID_DAYS.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        {/* Jam Mulai & Jam Selesai */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="jam_mulai" className="text-sm font-medium text-slate-700 mb-1.5 block">
              Jam Mulai <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              id="jam_mulai"
              name="jam_mulai"
              value={formData.jam_mulai}
              onChange={onChange}
              className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="jam_selesai" className="text-sm font-medium text-slate-700 mb-1.5 block">
              Jam Selesai <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              id="jam_selesai"
              name="jam_selesai"
              value={formData.jam_selesai}
              onChange={onChange}
              className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          {isLoading ? (
            <button
              type="button"
              disabled
              className="bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg opacity-70 cursor-not-allowed flex items-center justify-center gap-2 w-full"
            >
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Memvalidasi & Menyimpan...</span>
            </button>
          ) : (
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg w-full shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>{isEditing ? 'Perbarui Jadwal' : 'Simpan Jadwal'}</span>
            </button>
          )}
        </div>

        {/* Cancel Edit Button */}
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg text-sm w-full transition"
          >
            Batal Edit
          </button>
        )}
      </form>
    </div>
  );
}
