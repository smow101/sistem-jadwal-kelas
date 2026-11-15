/**
 * Logika algoritma deteksi bentrok jadwal (TC-01).
 * Wajib disalin persis sesuai RULES.md tanpa modifikasi logika.
 */
export function isScheduleConflicting(newSchedule, existingSchedules, currentEditId = null) {
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
