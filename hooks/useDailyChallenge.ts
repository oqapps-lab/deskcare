import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserId } from '../lib/store/session';

const DEFAULT_TARGET = 2; // routines per day

export interface DailyChallenge {
  target: number;
  completed: number;
  /** True once completed >= target. */
  done: boolean;
  /** 0..1 progress. */
  progress: number;
  loading: boolean;
}

/** Today's local-date sessions count vs the daily target. */
export const useDailyChallenge = (target = DEFAULT_TARGET): DailyChallenge => {
  const userId = useUserId();
  const [completed, setCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      // Start-of-day local — use device tz by subtracting hours/minutes from now.
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const { data, error } = await supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .not('completed_at', 'is', null)
        .gte('completed_at', startOfDay.toISOString());
      if (cancelled) return;
      if (!error && typeof (data as unknown as { length: number })?.length === 'number') {
        // Should be from `count`; supabase-js returns the count via the
        // response when head:true + count:'exact' — fall back to 0 on shape mismatch.
        setCompleted(0);
      }
      // The real value is on the response itself; re-issue without head:true
      // to get a number reliably.
      const res = await supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .not('completed_at', 'is', null)
        .gte('completed_at', startOfDay.toISOString());
      if (cancelled) return;
      setCompleted(res.count ?? 0);
      setLoading(false);
    };
    run().catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const done = completed >= target;
  const progress = Math.min(1, completed / target);
  return { target, completed, done, progress, loading };
};
