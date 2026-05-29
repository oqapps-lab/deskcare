import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserId } from '../lib/store/session';
import { toYmdLocal } from '../lib/dates';

export interface AnalyticsSnapshot {
  loading: boolean;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  /** Sessions per day for the last 14 days (oldest → newest). */
  daily: { date: string; sessions: number; minutes: number }[];
  /** Minutes by body-zone slug, last 30 days. */
  zoneBreakdown: { slug: string; name: string; minutes: number }[];
  /** Last 14d vs prior 14d delta for primary pain zone (%). */
  painDelta: number | null;
  painZoneName: string | null;
}

const empty: AnalyticsSnapshot = {
  loading: true,
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  daily: [],
  zoneBreakdown: [],
  painDelta: null,
  painZoneName: null,
};

const startOfDayISO = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

// LOCAL-time YYYY-MM-DD bucketing — was previously slicing ISO (UTC) which in
// UTC+N regions dropped "today" from the 14-day chart in the early morning.
// Reuses lib/dates.ts so the bug class is killed at the call-site level.

export const useAnalytics = (): AnalyticsSnapshot => {
  const userId = useUserId();
  const [snap, setSnap] = useState<AnalyticsSnapshot>(empty);

  useEffect(() => {
    if (!userId) {
      setSnap({ ...empty, loading: false });
      return;
    }
    let cancelled = false;

    const run = async () => {
      const since14 = startOfDayISO(-14);
      const since30 = startOfDayISO(-30);
      // pain_entries.recorded_date is stored as local YYYY-MM-DD by the
      // check-in upsert; the query filter must be local too, otherwise
      // we drop the most recent day in negative-UTC regions.
      const since30Local = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return toYmdLocal(d);
      })();

      const [streakRes, sessions14, sessionsZones30, painRes] = await Promise.all([
        supabase
          .from('streaks')
          .select('current_streak, longest_streak, total_sessions, total_minutes')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('sessions')
          .select('completed_at, duration_seconds')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .not('completed_at', 'is', null)
          .gte('completed_at', since14)
          .order('completed_at', { ascending: true }),
        supabase
          .from('sessions')
          .select('duration_seconds, routine:routines(body_zone:body_zones(slug, name))')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .not('completed_at', 'is', null)
          .gte('completed_at', since30),
        supabase
          .from('pain_entries')
          .select('recorded_date, pain_level, body_zone:body_zones(name)')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .gte('recorded_date', since30Local)
          .order('recorded_date', { ascending: false })
          .limit(500),
      ]);

      if (cancelled) return;

      // Daily bins for last 14d — LOCAL time. Bucketing on UTC dates would
      // drop today's bar before local UTC offset hours had elapsed.
      const dailyMap = new Map<string, { sessions: number; minutes: number }>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyMap.set(toYmdLocal(d), { sessions: 0, minutes: 0 });
      }
      for (const s of (sessions14.data || []) as Array<{ completed_at: string | null; duration_seconds: number | null }>) {
        if (!s.completed_at) continue;
        // completed_at is full timestamp; bucket by LOCAL date so the
        // chart matches the user's idea of which day they trained.
        const k = toYmdLocal(new Date(s.completed_at));
        const v = dailyMap.get(k);
        if (v) {
          v.sessions += 1;
          v.minutes += Math.round((s.duration_seconds || 0) / 60);
        }
      }
      const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

      // Zone breakdown last 30d. Supabase nests inner-join rows as arrays
      // even when the FK is single-valued — flatten defensively.
      const zoneMap = new Map<string, { slug: string; name: string; minutes: number }>();
      for (const s of (sessionsZones30.data || []) as unknown as Array<{
        duration_seconds: number | null;
        routine: { body_zone: { slug: string; name: string } | { slug: string; name: string }[] | null } | { body_zone: { slug: string; name: string } | { slug: string; name: string }[] | null }[] | null;
      }>) {
        const r = Array.isArray(s.routine) ? s.routine[0] : s.routine;
        const bz = r?.body_zone;
        const z = Array.isArray(bz) ? bz[0] : bz;
        if (!z?.slug) continue;
        const cur = zoneMap.get(z.slug) || { slug: z.slug, name: z.name, minutes: 0 };
        cur.minutes += Math.round((s.duration_seconds || 0) / 60);
        zoneMap.set(z.slug, cur);
      }
      const zoneBreakdown = Array.from(zoneMap.values()).sort((a, b) => b.minutes - a.minutes);

      // Pain delta — top-zone last 14d vs prior 14d.
      const painRows = (painRes.data || []) as unknown as Array<{
        recorded_date: string;
        pain_level: number;
        body_zone: { name: string } | { name: string }[] | null;
      }>;
      const counts = new Map<string, { name: string; entries: { d: string; lvl: number }[] }>();
      for (const r of painRows) {
        const bz = Array.isArray(r.body_zone) ? r.body_zone[0] : r.body_zone;
        if (!bz?.name) continue;
        const c = counts.get(bz.name) || { name: bz.name, entries: [] };
        c.entries.push({ d: r.recorded_date, lvl: r.pain_level });
        counts.set(bz.name, c);
      }
      let painDelta: number | null = null;
      let painZoneName: string | null = null;
      let topCount = 0;
      const cutoff = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 14);
        return toYmdLocal(d);
      })();
      for (const c of counts.values()) {
        if (c.entries.length > topCount) {
          const recent = c.entries.filter((e) => e.d > cutoff).map((e) => e.lvl);
          const prior  = c.entries.filter((e) => e.d <= cutoff).map((e) => e.lvl);
          if (recent.length >= 2 && prior.length >= 2) {
            const r = recent.reduce((a, b) => a + b, 0) / recent.length;
            const p = prior.reduce((a, b) => a + b, 0) / prior.length;
            if (p > 0) {
              painDelta = Math.round(((r - p) / p) * 100);
              painZoneName = c.name;
              topCount = c.entries.length;
            }
          }
        }
      }

      const streak = streakRes.data as
        | { current_streak: number; longest_streak: number; total_sessions: number; total_minutes: number }
        | null;

      setSnap({
        loading: false,
        totalSessions: streak?.total_sessions ?? 0,
        totalMinutes: streak?.total_minutes ?? 0,
        currentStreak: streak?.current_streak ?? 0,
        longestStreak: streak?.longest_streak ?? 0,
        daily,
        zoneBreakdown,
        painDelta,
        painZoneName,
      });
    };

    run().catch(() => !cancelled && setSnap((s) => ({ ...s, loading: false })));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return snap;
};
