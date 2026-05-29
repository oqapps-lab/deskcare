import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useUserId } from '../lib/store/session';
import type { BodyZoneSlug } from '../lib/types/db';
import { toYmdLocal } from '../lib/dates';

export interface PainTrendPoint {
  date: string; // YYYY-MM-DD
  level: number; // 1..10
}

export interface PainTrend {
  zoneSlug: BodyZoneSlug | null;
  zoneName: string | null;
  /** Last N days (default 14). Most recent first. */
  points: PainTrendPoint[];
  /** Mean of last 14 days. */
  recentAvg: number | null;
  /** Mean of the 14 days before that. */
  priorAvg: number | null;
  /** Recent vs prior delta in percent (negative = improvement). null when not enough data. */
  deltaPct: number | null;
  hasAnyEntry: boolean;
}

/**
 * Compute a sparkline + delta % for the user's primary pain zone over the
 * last 14 days vs the 14 days before. Returns the latest pain entry per day
 * (UNIQUE constraint guarantees one per zone+day, so any aggregation just
 * takes the level directly).
 */
export const usePainTrend = (primaryZoneSlug?: BodyZoneSlug): PainTrend => {
  const userId = useUserId();
  const [trend, setTrend] = useState<PainTrend>({
    zoneSlug: primaryZoneSlug || null,
    zoneName: null,
    points: [],
    recentAvg: null,
    priorAvg: null,
    deltaPct: null,
    hasAnyEntry: false,
  });
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!userId || !primaryZoneSlug) return;
    let cancelled = false;

    const run = async () => {
      const zone = await supabase
        .from('body_zones')
        .select('id, slug, name')
        .eq('slug', primaryZoneSlug)
        .maybeSingle();
      if (cancelled || !zone.data) return;

      // Fetch last 28 days of entries for this zone. pain_entries.recorded_date
      // is stored in local YYYY-MM-DD by check-in, so the filter must be local.
      const since = new Date();
      since.setDate(since.getDate() - 28);
      const sinceStr = toYmdLocal(since);

      const { data } = await supabase
        .from('pain_entries')
        .select('recorded_date, pain_level')
        .eq('user_id', userId)
        .eq('body_zone_id', zone.data.id)
        .is('deleted_at', null)
        .gte('recorded_date', sinceStr)
        .order('recorded_date', { ascending: false });

      if (cancelled) return;
      const points: PainTrendPoint[] = (data || []).map((r) => ({
        date: r.recorded_date,
        level: r.pain_level,
      }));

      // Split last-14 vs prior-14 by date threshold.
      const today = new Date();
      const cutoff = new Date();
      cutoff.setDate(today.getDate() - 14);
      const cutoffStr = toYmdLocal(cutoff);
      const recent = points.filter((p) => p.date > cutoffStr).map((p) => p.level);
      const prior = points.filter((p) => p.date <= cutoffStr).map((p) => p.level);

      const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : null;
      const priorAvg  = prior.length  > 0 ? prior.reduce((a, b) => a + b, 0) / prior.length  : null;

      let deltaPct: number | null = null;
      if (recentAvg !== null && priorAvg !== null && priorAvg > 0) {
        deltaPct = Math.round(((recentAvg - priorAvg) / priorAvg) * 100);
      }

      setTrend({
        zoneSlug: zone.data.slug as BodyZoneSlug,
        zoneName: zone.data.name,
        points,
        recentAvg,
        priorAvg,
        deltaPct,
        hasAnyEntry: points.length > 0,
      });
    };

    run().catch(() => { /* best-effort */ });
    return () => {
      cancelled = true;
    };
  }, [userId, primaryZoneSlug, refreshTick]);

  // Refetch on focus so the pain-trend sparkline reflects a freshly-added
  // pain check-in entry when the user comes back to home.
  useFocusEffect(
    useCallback(() => {
      setRefreshTick((t) => t + 1);
    }, [])
  );

  return trend;
};
