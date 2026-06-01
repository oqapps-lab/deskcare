/**
 * Daily free-play meter (tester P5). Tracks how many free routine sessions a
 * non-premium user has started today, resetting at LOCAL midnight (consistent
 * with the app's local-date convention — see [[toYmdLocal]], the UTC-slice
 * bugs we already killed). Persisted in AsyncStorage so it survives app
 * restarts but is intentionally device-local + best-effort (a reinstall resets
 * it — acceptable for a soft gate; the real lock is useIsPremium).
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayLocal } from '../lib/dates';
import { DAILY_FREE_PLAYS } from '../constants/freeTier';

const KEY = 'deskcare_daily_meter_v1';

interface MeterRow {
  date: string;
  count: number;
}

export const useDailyMeter = () => {
  const [playsToday, setPlaysToday] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (cancelled) return;
        const today = todayLocal();
        let count = 0;
        try {
          const parsed = raw ? (JSON.parse(raw) as MeterRow) : null;
          if (parsed && parsed.date === today) count = parsed.count || 0;
        } catch {
          count = 0;
        }
        setPlaysToday(count);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const recordPlay = useCallback(async () => {
    const today = todayLocal();
    setPlaysToday((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(KEY, JSON.stringify({ date: today, count: next } as MeterRow)).catch(
        () => {},
      );
      return next;
    });
  }, []);

  // Optimistic before load (count starts at 0) so a fast tap is never wrongly
  // blocked; once loaded it reflects the real persisted count.
  return {
    playsToday,
    loaded,
    canPlayFree: playsToday < DAILY_FREE_PLAYS,
    recordPlay,
  };
};
