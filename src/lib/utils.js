/**
 * Urutan hari baku perkuliahan
 */
export const DAY_ORDER = {
  'Senin': 1,
  'Selasa': 2,
  'Rabu': 3,
  'Kamis': 4,
  'Jumat': 5,
  'Sabtu': 6,
  'Minggu': 7
};

/**
 * Whitelist nama hari yang valid
 */
export const VALID_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/**
 * Normalisasi format waktu ke format HH:MM:SS
 */
export function normalizeTime(timeStr) {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
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
 * Format tampilan rentang jam "08:00 - 10:00 WIB"
 */
export function formatTimeDisplay(start, end) {
  const s = String(start || '').substring(0, 5);
  const e = String(end || '').substring(0, 5);
  return `${s} - ${e} WIB`;
}

/**
 * Format tanggal pembuatan ke format "15 November 2026"
 */
export function formatDateDisplay(dateStr) {
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
 * Sanitasi HTML karakter entitas
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
