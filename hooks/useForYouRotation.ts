import { useMemo } from 'react';
import { toYmdLocal } from '../lib/dates';

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
  /**
   * Looping exercise clip shown as the card visual (replaces drawn poses).
   * LOCAL require() source — bundled so the carousel paints instantly with
   * zero network buffering. (Streaming these from Supabase showed empty
   * tinted cards on cold open — the exact lag the tester flagged.)
   */
  videoSource: number;
}

// Real exercise clips bundled locally — one representative motion per pose,
// all calm + non-hunching. Pre-bundled = no network, instant first frame.
const POSE_VIDEO: Record<Pose, number> = {
  'neck-roll': require('../assets/fy-neck.mp4'),
  'back-arch': require('../assets/fy-back.mp4'),
  'eye-rest': require('../assets/fy-eyes.mp4'),
  'wrist-stretch': require('../assets/fy-wrist.mp4'),
};

type PoolCard = Omit<ForYouCard, 'videoSource'>;
const POOL: ReadonlyArray<PoolCard> = [
  { id: 'neck-2',   pose: 'neck-roll',     title: 'Neck reset',         minutes: 2, routineSlug: 'neck-quick-2min',   tone: 'coral' },
  { id: 'neck-3',   pose: 'neck-roll',     title: 'Shoulder release',   minutes: 3, routineSlug: 'neck-full-3min',  tone: 'peach' },
  { id: 'back-3',   pose: 'back-arch',     title: 'Back reset',         minutes: 3, routineSlug: 'back-quick-3min',   tone: 'peach' },
  { id: 'back-3b',  pose: 'back-arch',     title: 'Lower-back relief',  minutes: 3, routineSlug: 'back-full-5min',  tone: 'coral' },
  { id: 'eyes-2',   pose: 'eye-rest',      title: 'Eye softener',       minutes: 2, routineSlug: 'eye-full-3min',   tone: 'lavender' },
  { id: 'eyes-1',   pose: 'eye-rest',      title: '20-20-20 reset',     minutes: 1, routineSlug: 'break-eyes-60s',     tone: 'lavender' },
  { id: 'wrists-2', pose: 'wrist-stretch', title: 'Wrist mobility',     minutes: 2, routineSlug: 'wrists-quick-2min', tone: 'mint' },
  { id: 'wrists-r', pose: 'wrist-stretch', title: 'Wrist relief',       minutes: 2, routineSlug: 'wrists-full-3min', tone: 'mint' },
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
/** Map an onboarding pain-zone slug → the For You pose that serves it. */
const ZONE_POSE: Record<string, Pose> = {
  neck: 'neck-roll',
  back: 'back-arch',
  eyes: 'eye-rest',
  wrists: 'wrist-stretch',
};

export const useForYouRotation = (
  flaggedZones?: string[],
): ForYouCard[] => {
  // Stable key for the memo + seed — order-independent join of flagged zones.
  const zonesKey = (flaggedZones ?? []).slice().sort().join(',');
  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const dayKey = toYmdLocal(now);

    // Poses the user explicitly flagged — these are GUARANTEED a card (S8).
    const flaggedPoses = (flaggedZones ?? [])
      .map((z) => ZONE_POSE[z])
      .filter((p): p is Pose => !!p);
    const flaggedPoseSet = new Set<Pose>(flaggedPoses);

    // Deterministic seed from day + flagged zones — stable until midnight.
    const seedSrc = dayKey + (zonesKey || 'all');
    let seed = 0;
    for (let i = 0; i < seedSrc.length; i++) seed = (seed * 31 + seedSrc.charCodeAt(i)) % 100000;
    const rand = (n: number) => {
      seed = (seed * 16807) % 2147483647;
      return seed % n;
    };

    // Score each candidate by time-of-day + zone match (any flagged zone).
    type Scored = { card: PoolCard; score: number };
    const scored: Scored[] = POOL.map((c) => {
      let s = 0;
      if (flaggedPoseSet.has(c.pose)) s += 30;
      if (hour < 11 && (c.pose === 'back-arch' || c.pose === 'neck-roll')) s += 10;
      if (hour >= 11 && hour < 16 && c.pose === 'eye-rest') s += 10;
      if (hour >= 16 && (c.pose === 'wrist-stretch' || c.pose === 'neck-roll')) s += 10;
      s += rand(15);
      return { card: c, score: s };
    });
    scored.sort((a, b) => b.score - a.score);

    const picked: PoolCard[] = [];
    const usedPoses = new Set<Pose>();

    // 1) GUARANTEE one card per flagged zone first (in the user's zone order),
    //    so a wrist-pain user always sees a wrist routine, etc. (S8).
    for (const pose of flaggedPoses) {
      if (picked.length >= 3 || usedPoses.has(pose)) continue;
      const best = scored.find((s) => s.card.pose === pose && !usedPoses.has(s.card.pose));
      if (best) {
        picked.push(best.card);
        usedPoses.add(pose);
      }
    }

    // 2) Fill remaining slots by score, keeping pose diversity.
    for (const s of scored) {
      if (picked.length >= 3) break;
      if (usedPoses.has(s.card.pose)) continue;
      picked.push(s.card);
      usedPoses.add(s.card.pose);
    }
    // 3) Backfill if still short (few poses available).
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
      videoSource: POSE_VIDEO[c.pose],
    }));
  }, [zonesKey]);
};
