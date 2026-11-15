import React from 'react';
import { formatTimeDisplay, formatDateDisplay } from '../lib/utils';
import EmptyState from './EmptyState';

export default function ScheduleTable({
  schedules,
  currentEditId,
  onEdit,
  onOpenDelete
}) {
  if (schedules.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75">
            <th scope="col" className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Mata Kuliah</th>
            <th scope="col" className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Dosen Pengampu</th>
            <th scope="col" className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Kelas</th>
            <th scope="col" className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ruang</th>
            <th scope="col" className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Hari</th>
            <th scope="col" className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Waktu</th>
            <th scope="col" className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {schedules.map(schedule => {
            const isEditingRow = currentEditId !== null && String(currentEditId) === String(schedule.id);

            return (
              <tr
                key={schedule.id}
                className={`hover:bg-slate-50 transition border-b border-slate-200 ${isEditingRow ? 'bg-indigo-50' : ''}`}
              >
                {/* Mata Kuliah & Tanggal */}
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">{schedule.matakuliah}</div>
                  {schedule.created_at && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      {formatDateDisplay(schedule.created_at)}
                    </div>
                  )}
                </td>

                {/* Dosen */}
                <td className="py-3.5 px-4 text-slate-600">
                  {schedule.dosen}
                </td>

                {/* Kelas */}
                <td className="py-3.5 px-4">
                  <span className="inline-block bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded text-xs font-medium">
                    {schedule.kelas}
                  </span>
                </td>

                {/* Ruang */}
                <td className="py-3.5 px-4">
                  <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded text-xs font-medium">
                    {schedule.ruang}
                  </span>
                </td>

                {/* Hari */}
                <td className="py-3.5 px-4">
                  <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded text-xs font-medium">
                    {schedule.hari}
                  </span>
                </td>

                {/* Waktu */}
                <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap text-xs font-medium">
                  {formatTimeDisplay(schedule.jam_mulai, schedule.jam_selesai)}
                </td>

                {/* Aksi */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onEdit(schedule)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDelete(schedule)}
                    className="text-rose-600 hover:text-rose-800 text-sm font-medium transition"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
