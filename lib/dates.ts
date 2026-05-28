/**
 * Local-time date helpers — never use UTC `toISOString().slice(0, 10)`.
 *
 * Background: code that mixed `toISOString().slice(0, 10)` (UTC) with
 * Dates constructed from `new Date(year, month, day)` (local) was off by
 * one day in UTC+N regions between local 00:00 and 0N:00. Shipped in the
 * F14 Challenges TickGrid + Eye Calendar + Pain History bins; surfaced as
 * DC4 in the 2026-05-28 code-review. Centralising the helpers here means
 * the bug class is killed at the call-site level, not patched per screen.
 */

/** Return `YYYY-MM-DD` for the given Date interpreted in LOCAL time. */
export const toYmdLocal = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Parse `YYYY-MM-DD` into a local midnight Date. */
export const fromYmdLocal = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** Today's date as `YYYY-MM-DD` in local time. */
export const todayLocal = (): string => toYmdLocal(new Date());

/** Number of whole days `b` minus `a`, both interpreted at local midnight. */
export const daysBetween = (aYmd: string, bYmd: string): number => {
  const a = fromYmdLocal(aYmd).getTime();
  const b = fromYmdLocal(bYmd).getTime();
  return Math.round((b - a) / 86400000);
};
