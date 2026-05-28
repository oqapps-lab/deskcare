import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserId } from '../lib/store/session';

export interface BuddySnapshot {
  buddy_user_id: string;
  display_name: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface BuddyState {
  buddy: BuddySnapshot | null;
  loading: boolean;
  refresh: () => void;
}

export const useBuddy = (): BuddyState => {
  const userId = useUserId();
  const [buddy, setBuddy] = useState<BuddySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .rpc('get_buddy_snapshot')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data || (data as unknown[]).length === 0) {
          setBuddy(null);
        } else {
          setBuddy((data as BuddySnapshot[])[0]);
        }
        setLoading(false);
      }, () => {
        if (!cancelled) {
          setBuddy(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId, tick]);

  return { buddy, loading, refresh };
};

export const createBuddyInvite = async (): Promise<{ code: string; expires_at: string } | null> => {
  const { data, error } = await supabase.rpc('create_buddy_invite');
  if (error || !data || (data as unknown[]).length === 0) return null;
  return (data as { code: string; expires_at: string }[])[0];
};

export const acceptBuddyInvite = async (
  code: string,
): Promise<{ display_name: string } | { error: string }> => {
  const { data, error } = await supabase.rpc('accept_buddy_invite', { p_code: code });
  if (error) return { error: error.message };
  if (!data || (data as unknown[]).length === 0) return { error: 'invite not found' };
  return { display_name: (data as { display_name: string }[])[0].display_name };
};
