import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const POSTURE_KEY = 'deskcare.posture.lastCheckTs';

/**
 * Time-decayed "posture score" 0..10. Tracks when the user last
 * acknowledged a posture self-check (Home tile tap or notif-action).
 *
 *   <  45 min → 9.5  (great)
 *   45-90 min → 7.5  (good)
 *   90-180 min → 5.5 (drifting)
 *   180-360 min → 3.5 (poor)
 *   > 360 min  → 2.0 (no recent check)
 *   never      → null (first run — show prompt instead of score)
 */
export interface PostureScore {
  score: number | null;
  minutesSinceCheck: number | null;
  label: 'great' | 'good' | 'drifting' | 'poor' | 'unknown';
  /** Mark the current moment as a successful posture check. */
  markChecked: () => Promise<void>;
  loading: boolean;
}

const labelFor = (m: number | null): PostureScore['label'] => {
  if (m === null) return 'unknown';
  if (m < 45) return 'great';
  if (m < 90) return 'good';
  if (m < 180) return 'drifting';
  return 'poor';
};

const scoreFor = (m: number | null): number | null => {
  if (m === null) return null;
  if (m < 45) return 9.5;
  if (m < 90) return 7.5;
  if (m < 180) return 5.5;
  if (m < 360) return 3.5;
  return 2.0;
};

export const usePostureScore = (): PostureScore => {
  const [minutesSinceCheck, setM] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const v = await AsyncStorage.getItem(POSTURE_KEY);
    if (!v) {
      setM(null);
      setLoading(false);
      return;
    }
    const ts = parseInt(v, 10);
    if (!Number.isFinite(ts)) {
      setM(null);
      setLoading(false);
      return;
    }
    const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
    setM(mins);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    refresh().catch(() => !cancelled && setLoading(false));
    // Re-tick every minute so the score doesn't go stale while user lingers
    // on Home. Cheap (single AsyncStorage read).
    const t = setInterval(() => {
      if (!cancelled) refresh();
    }, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [refresh]);

  const markChecked = useCallback(async () => {
    await AsyncStorage.setItem(POSTURE_KEY, String(Date.now()));
    setM(0);
  }, []);

  return {
    score: scoreFor(minutesSinceCheck),
    minutesSinceCheck,
    label: labelFor(minutesSinceCheck),
    markChecked,
    loading,
  };
};
