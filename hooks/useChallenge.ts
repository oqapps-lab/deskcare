import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@deskcare/challenge/v1';

export type ChallengeDuration = 7 | 14 | 30;

export interface Challenge {
  id: string;
  duration: ChallengeDuration;
  /** YYYY-MM-DD of day 1. */
  startedOn: string;
  /** YYYY-MM-DD set of dates user logged a session. */
  completedDates: string[];
}

let cache: Challenge | null = null;
const subs = new Set<() => void>();
const notify = () => subs.forEach((s) => s());

// ymd() in LOCAL time — not UTC. toISOString().slice(0,10) returned UTC,
// which in UTC+N regions between 00:00 and 0N:00 local time gave the
// previous day's date and broke dayNumber + done/missed cells. Reported
// as DC4 in 2026-05-28 code-review.
const ymd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const today = (): string => ymd(new Date());

/** Convert YYYY-MM-DD to local midnight Date. */
const fromYmd = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** 1-based day number within a challenge: same day as startedOn = day 1. */
const dayOf = (startedOn: string, when: Date): number => {
  const startD = fromYmd(startedOn);
  const whenD = new Date(when.getFullYear(), when.getMonth(), when.getDate());
  return Math.floor((whenD.getTime() - startD.getTime()) / 86400000) + 1;
};

const persist = async (c: Challenge | null) => {
  try {
    if (c) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* swallow */
  }
};

const load = async (): Promise<Challenge | null> => {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Challenge) : null;
  } catch {
    cache = null;
  }
  return cache;
};

export interface ChallengeSnapshot {
  challenge: Challenge | null;
  loading: boolean;
  /** Days elapsed since start (1-based). */
  dayNumber: number;
  /** Count of unique session-days within the active challenge window. */
  doneCount: number;
  /** Set of 1-based day numbers where the user logged a session — feeds
   *  the TickGrid so missed days in the middle are coloured 'missed', not
   *  'done', regardless of total count. */
  loggedDayNumbers: Set<number>;
  /** True when challenge has been completed (all days hit) or window expired. */
  finished: boolean;
  /** Progress 0..1 toward duration. */
  progress: number;
  /** Days remaining. */
  daysLeft: number;
}

const compute = (c: Challenge | null): ChallengeSnapshot => {
  if (!c) {
    return { challenge: null, loading: false, dayNumber: 0, doneCount: 0, loggedDayNumbers: new Set(), finished: false, progress: 0, daysLeft: 0 };
  }
  const startD = fromYmd(c.startedOn);
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayNumber = Math.max(1, Math.floor((todayLocal.getTime() - startD.getTime()) / 86400000) + 1);
  const endD = new Date(startD);
  endD.setDate(endD.getDate() + c.duration - 1);
  const endStr = ymd(endD);
  const inWindow = c.completedDates.filter((d) => d >= c.startedOn && d <= endStr);
  // Map each logged date → 1-based day number. Out-of-window are already
  // filtered. Use a Set so duplicate logs don't double-count.
  const loggedDayNumbers = new Set(
    inWindow.map((d) => dayOf(c.startedOn, fromYmd(d))).filter((n) => n >= 1 && n <= c.duration),
  );
  const doneCount = loggedDayNumbers.size;
  const finished = dayNumber > c.duration || doneCount >= c.duration;
  const progress = Math.min(1, doneCount / c.duration);
  const daysLeft = Math.max(0, c.duration - dayNumber + 1);
  return {
    challenge: c,
    loading: false,
    dayNumber: Math.min(dayNumber, c.duration),
    doneCount,
    loggedDayNumbers,
    finished,
    progress,
    daysLeft,
  };
};

export const useChallenge = () => {
  const [snap, setSnap] = useState<ChallengeSnapshot>({ challenge: null, loading: true, dayNumber: 0, doneCount: 0, loggedDayNumbers: new Set(), finished: false, progress: 0, daysLeft: 0 });

  useEffect(() => {
    let cancelled = false;
    load().then(() => {
      if (!cancelled) setSnap(compute(cache));
    });
    const sub = () => setSnap(compute(cache));
    subs.add(sub);
    return () => {
      cancelled = true;
      subs.delete(sub);
    };
  }, []);

  const start = useCallback(async (duration: ChallengeDuration) => {
    cache = {
      id: `ch_${Date.now().toString(36)}`,
      duration,
      startedOn: today(),
      completedDates: [],
    };
    await persist(cache);
    notify();
  }, []);

  const logToday = useCallback(async () => {
    if (!cache) return;
    const t = today();
    if (!cache.completedDates.includes(t)) {
      cache = { ...cache, completedDates: [...cache.completedDates, t] };
      await persist(cache);
      notify();
    }
  }, []);

  const cancel = useCallback(async () => {
    cache = null;
    await persist(null);
    notify();
  }, []);

  return { ...snap, start, logToday, cancel };
};
