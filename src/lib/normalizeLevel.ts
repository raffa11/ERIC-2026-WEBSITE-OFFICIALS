/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Normalisasi Level / Sub-Kategori.
 *
 * Vocabulary level Creative Innovation (creative-innovation) pernah berubah:
 *   LAMA  : 'Elementary (SD)', 'SMP/Junior High School', 'Senior High / Vocational (SMA / SMK)'
 *   BARU  : 'Junior (SD)', 'Senior (SMP & SMA)'
 * (lihat commit 5c8ee51)
 *
 * Baris lama di Google Sheets masih menyimpan nilai lama. Agar tampilan + PDF
 * selalu konsisten dengan dropdown saat ini, nilai lama dipetakan ke nilai baru
 * di titik baca data (flatToRegistration), bukan ditulis ulang ke sheet.
 */

type NormalizeMap = Record<string, string>;

// Petakan nilai level LAMA ke BARU khusus division creative-innovation.
const CREATIVE_INNOVATION_LEVEL_MAP: NormalizeMap = {
  'Elementary (SD)': 'Junior (SD)',
  'SMP/Junior High School': 'Senior (SMP & SMA)',
  'Senior High / Vocational (SMA / SMK)': 'Senior (SMP & SMA)',
};

/**
 * Normalisasi level untuk sebuah registrasi.
 * Divisions lain (University Student, High School Student, dst.) tidak berubah.
 */
export function normalizeLevel(divisionId: string | undefined, level?: string): string {
  if (!level) return level || '';
  if (!divisionId) return level;
  if (divisionId.toLowerCase() !== 'creative-innovation') return level;
  return CREATIVE_INNOVATION_LEVEL_MAP[level] ?? level;
}
