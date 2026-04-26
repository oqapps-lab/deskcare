import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserId } from '../lib/store/session';
import type { Profile, Routine, Streak } from '../lib/types/db';

interface OnboardingData {
  pain_zones?: string[];
  goal?: string | null;
  desk_hours?: string | null;
  pain_frequency?: string | null;
  work_type?: string | null;
}

export interface HomeUserSnapshot {
  profile: Profile | null;
  onboardingData: OnboardingData;
  streak: Streak | null;
  recommendedRoutine: Routine | null;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * One-shot fetch of everything Home needs for a signed-in user:
 * profile (incl. onboarding_data jsonb), streak, recommended routine
 * for the user's primary pain zone, and active subscription flag.
 *
 * Returns blank but loading=false for anonymous users — Home falls back
 * to the legacy demo states (?state=first|active|premium|reengage).
 */
export const useHomeSnapshot = (): HomeUserSnapshot => {
  const userId = useUserId();
  const [snap, setSnap] = useState<HomeUserSnapshot>({
    profile: null,
    onboardingData: {},
    streak: null,
    recommendedRoutine: null,
    isPremium: false,
    loading: !!userId,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setSnap((s) => ({ ...s, loading: false }));
      return;
    }
    let cancelled = false;
    setSnap((s) => ({ ...s, loading: true, error: null }));

    const run = async () => {
      const [profileRes, streakRes, subRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, avatar_url, onboarding_completed, onboarding_data')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('streaks')
          .select('user_id, current_streak, longest_streak, last_activity_date, total_sessions, total_minutes')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('deskcare_subscriptions')
          .select('is_active')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      if (profileRes.error) {
        setSnap({
          profile: null,
          onboardingData: {},
          streak: null,
          recommendedRoutine: null,
          isPremium: false,
          loading: false,
          error: profileRes.error.message,
        });
        return;
      }

      const profile = profileRes.data as Profile | null;
      const onboardingData = (profile?.onboarding_data as OnboardingData | null) ?? {};
      const streak = streakRes.data as Streak | null;
      const isPremium = !!subRes.data?.is_active;

      // Recommended routine: pick the user's first pain zone, find a non-premium
      // zone-based routine for that zone (preferring '*-quick-2min' / '-3min').
      const primaryZoneSlug = (onboardingData.pain_zones?.[0] || 'neck').toLowerCase();
      const slugMap: Record<string, string> = {
        neck: 'neck',
        back: 'back',
        eyes: 'eyes',
        wrists: 'wrists',
        full_body: 'full_body',
        everything: 'full_body',
      };
      const dbZoneSlug = slugMap[primaryZoneSlug] ?? 'neck';

      let recommendedRoutine: Routine | null = null;
      const zoneLookup = await supabase
        .from('body_zones')
        .select('id')
        .eq('slug', dbZoneSlug)
        .maybeSingle();
      if (zoneLookup.data?.id) {
        const routineLookup = await supabase
          .from('routines')
          .select(
            'id, slug, title, description, body_zone_id, duration_seconds, is_premium, routine_type, sort_order',
          )
          .eq('body_zone_id', zoneLookup.data.id)
          .eq('routine_type', 'zone_based')
          .order('duration_seconds')
          .limit(1)
          .maybeSingle();
        if (routineLookup.data) recommendedRoutine = routineLookup.data as Routine;
      }

      if (cancelled) return;
      setSnap({
        profile,
        onboardingData,
        streak,
        recommendedRoutine,
        isPremium,
        loading: false,
        error: null,
      });
    };

    run().catch((e) => {
      if (!cancelled) setSnap((s) => ({ ...s, loading: false, error: String(e) }));
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return snap;
};
