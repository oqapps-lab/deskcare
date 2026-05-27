import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserId } from '../lib/store/session';

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon_url: string | null;
  criteria_type: string;
  criteria_value: number;
  sort_order: number;
}

export interface AchievementWithProgress extends Achievement {
  /** ISO timestamp when the current user unlocked this, or null if locked. */
  earned_at: string | null;
}

/**
 * All achievements + per-user earned timestamps. Single Supabase round-trip
 * via left-join when authenticated, otherwise returns the achievements list
 * with `earned_at: null` everywhere.
 */
export const useAchievements = () => {
  const userId = useUserId();
  const [achievements, setAchievements] = useState<AchievementWithProgress[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      const all = await supabase
        .from('achievements')
        .select('id, slug, title, description, icon_url, criteria_type, criteria_value, sort_order')
        .order('sort_order');
      if (cancelled) return;
      if (all.error) {
        setError(all.error.message);
        setLoading(false);
        return;
      }

      let earnedMap: Record<string, string> = {};
      if (userId) {
        const earned = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', userId);
        if (!cancelled && !earned.error && earned.data) {
          earnedMap = Object.fromEntries(earned.data.map((r) => [r.achievement_id, r.earned_at]));
        }
      }

      if (!cancelled) {
        const merged: AchievementWithProgress[] = (all.data || []).map((a) => ({
          ...(a as Achievement),
          earned_at: earnedMap[(a as Achievement).id] || null,
        }));
        setAchievements(merged);
        setLoading(false);
      }
    };

    run().catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { achievements, error, loading };
};

/** Newly-unlocked achievement (returned from check_and_unlock RPC). */
export interface UnlockedAchievement {
  slug: string;
  title: string;
  description: string | null;
  icon_url: string | null;
}

/**
 * Call after a session completes. Returns the achievements newly unlocked
 * by this session (often [], sometimes 1, rarely 2+ on milestones).
 */
export const checkAndUnlockAchievements = async (): Promise<UnlockedAchievement[]> => {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes?.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase.rpc('check_and_unlock_achievements', { p_user_id: uid });
  if (error || !data) return [];
  return data as UnlockedAchievement[];
};
