import { useMemo } from 'react';

export type Pose = 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch';

export interface ForYouCard {
  id: string;
  pose: Pose;
  title: string;
  minutes: number;
  /** Routine slug to deep-link into preview. */
  routineSlug: string;
  /** Subtle tone for the card. */
  tone: 'coral' | 'lavender' | 'mint' | 'peach' | 'cream';
}

const POOL: ReadonlyArray<ForYouCard> = [
  { id: 'neck-2',   pose: 'neck-roll',     title: 'Neck reset',         minutes: 2, routineSlug: 'neck-quick-2min',   tone: 'coral' },
  { id: 'neck-3',   pose: 'neck-roll',     title: 'Shoulder release',   minutes: 3, routineSlug: 'neck-relief-3min',  tone: 'peach' },
  { id: 'back-3',   pose: 'back-arch',     title: 'Back reset',         minutes: 3, routineSlug: 'back-quick-3min',   tone: 'peach' },
  { id: 'back-3b',  pose: 'back-arch',     title: 'Lower-back relief',  minutes: 3, routineSlug: 'back-relief-3min',  tone: 'coral' },
  { id: 'eyes-2',   pose: 'eye-rest',      title: 'Eye softener',       minutes: 2, routineSlug: 'eye-relief-2min',   tone: 'lavender' },
  { id: 'eyes-1',   pose: 'eye-rest',      title: '20-20-20 reset',     minutes: 1, routineSlug: 'eye-quick-60s',     tone: 'lavender' },
  { id: 'wrists-2', pose: 'wrist-stretch', title: 'Wrist mobility',     minutes: 2, routineSlug: 'wrists-quick-2min', tone: 'mint' },
  { id: 'wrists-r', pose: 'wrist-stretch', title: 'Wrist relief',       minutes: 2, routineSlug: 'wrists-relief-2min', tone: 'mint' },
];

/**
 * Pick 3 routines for "For You Today". Selection logic:
 *   - Bias toward user's primary pain zone (always include 1 card for that zone).
 *   - Time-of-day awareness: morning → mobility (back/neck), afternoon → eyes,
 *     evening → wrists + relief.
 *   - Rotation: include a daily-stable shuffle so the user sees different
 *     cards across days but same set across same-day reopens (no flicker).
 *
 * Returns a stable list per (date, primaryZone) — `useMemo`-safe.
 */
export const useForYouRotation = (
  primaryZoneSlug?: 'neck' | 'back' | 'eyes' | 'wrists' | 'full_body' | 'sciatica',
): ForYouCard[] => {
  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const dayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD — same all day

    // Deterministic seed from day + primary zone — same selection until midnight.
    const seedSrc = dayKey + (primaryZoneSlug || 'all');
    let seed = 0;
    for (let i = 0; i < seedSrc.length; i++) seed = (seed * 31 + seedSrc.charCodeAt(i)) % 100000;
    const rand = (n: number) => {
      seed = (seed * 16807) % 2147483647;
      return seed % n;
    };

    // Score each candidate by time-of-day + zone match.
    type Scored = { card: ForYouCard; score: number };
    const scored: Scored[] = POOL.map((c) => {
      let s = 0;
      // Zone match boost
      if (primaryZoneSlug === 'neck' && c.pose === 'neck-roll') s += 30;
      if (primaryZoneSlug === 'back' && c.pose === 'back-arch') s += 30;
      if (primaryZoneSlug === 'eyes' && c.pose === 'eye-rest') s += 30;
      if (primaryZoneSlug === 'wrists' && c.pose === 'wrist-stretch') s += 30;
      // Time-of-day affinity
      if (hour < 11 && (c.pose === 'back-arch' || c.pose === 'neck-roll')) s += 10;
      if (hour >= 11 && hour < 16 && c.pose === 'eye-rest') s += 10;
      if (hour >= 16 && (c.pose === 'wrist-stretch' || c.pose === 'neck-roll')) s += 10;
      // Daily jitter
      s += rand(15);
      return { card: c, score: s };
    });
    scored.sort((a, b) => b.score - a.score);

    // Pick top 3 with pose+tone diversity — no two cards share the same pose,
    // and tones are reassigned cyclically so the row looks visually varied.
    const picked: ForYouCard[] = [];
    const usedPoses = new Set<Pose>();
    for (const s of scored) {
      if (picked.length >= 3) break;
      if (usedPoses.has(s.card.pose) && picked.length < 3) continue;
      picked.push(s.card);
      usedPoses.add(s.card.pose);
    }
    // Backfill if not enough pose diversity
    for (const s of scored) {
      if (picked.length >= 3) break;
      if (!picked.find((p) => p.id === s.card.id)) picked.push(s.card);
    }

    // Force tone variety — daily-rotating tone permutation so cards stand apart visually.
    const tonePalette: ForYouCard['tone'][] = ['coral', 'mint', 'lavender', 'peach', 'cream'];
    const toneOffset = rand(tonePalette.length);
    return picked.map((c, i) => ({
      ...c,
      tone: tonePalette[(toneOffset + i * 2) % tonePalette.length],
    }));
  }, [primaryZoneSlug]);
};
