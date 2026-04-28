import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  NavHeader,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../lib/store/session';

const colorFor = (v: number) => {
  if (v >= 7) return colors.primary;
  if (v >= 5) return colors.primaryMid;
  if (v >= 3) return colors.primaryLight;
  return colors.primarySoft;
};

interface ZoneRow {
  zone_id: string;
  slug: string;
  name: string;
}

interface PainEntry {
  body_zone_id: string;
  pain_level: number;
  recorded_date: string; // YYYY-MM-DD
}

export default function PainHistoryScreen() {
  const insets = useSafeAreaInsets();
  const userId = useUserId();
  const [entries, setEntries] = useState<PainEntry[] | null>(null);
  const [zoneMap, setZoneMap] = useState<Record<string, string>>({}); // zone_id → display name
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const since = new Date();
    since.setDate(since.getDate() - 13);
    const sinceIso = since.toISOString().slice(0, 10);

    Promise.all([
      supabase
        .from('pain_entries')
        .select('body_zone_id, pain_level, recorded_date')
        .eq('user_id', userId)
        .gte('recorded_date', sinceIso)
        .order('recorded_date'),
      supabase.from('body_zones').select('id, slug, name'),
    ]).then(([eRes, zRes]) => {
      if (cancelled) return;
      setEntries((eRes.data as PainEntry[]) ?? []);
      const map: Record<string, string> = {};
      ((zRes.data as ZoneRow[] | null) ?? []).forEach((z) => {
        map[z.zone_id || (z as unknown as { id: string }).id] = z.name;
      });
      setZoneMap(map);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Build the 14-day strip: max pain_level recorded across zones per day.
  // Empty user → empty array → screen renders empty-state copy.
  const history14 = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    const buckets = new Map<string, number>();
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    entries.forEach((e) => {
      if (buckets.has(e.recorded_date)) {
        buckets.set(e.recorded_date, Math.max(buckets.get(e.recorded_date) ?? 0, e.pain_level));
      }
    });
    return Array.from(buckets.values());
  }, [entries]);

  const perZone = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    const byZone = new Map<string, number[]>();
    entries.forEach((e) => {
      if (!byZone.has(e.body_zone_id)) byZone.set(e.body_zone_id, []);
      byZone.get(e.body_zone_id)!.push(e.pain_level);
    });
    const rows: { zone: string; avg: number; trend: 'down' | 'flat' }[] = [];
    byZone.forEach((vals, zoneId) => {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const half = Math.floor(vals.length / 2);
      const firstHalfAvg = vals.slice(0, half).reduce((a, b) => a + b, 0) / Math.max(1, half);
      const secondHalfAvg = vals.slice(half).reduce((a, b) => a + b, 0) / Math.max(1, vals.length - half);
      const trend: 'down' | 'flat' = firstHalfAvg - secondHalfAvg >= 0.7 ? 'down' : 'flat';
      rows.push({
        zone: zoneMap[zoneId] ?? '—',
        avg: Math.round(avg * 10) / 10,
        trend,
      });
    });
    return rows;
  }, [entries, zoneMap]);

  const isEmpty = history14.length === 0;

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  const avg = isEmpty
    ? '—'
    : (history14.reduce((a, b) => a + b, 0) / history14.length).toFixed(1);
  const delta = isEmpty ? 0 : history14[history14.length - 1] - history14[0];

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={240} opacity={0.20} />

      <NavHeader title="Pain history" onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.xxxl,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <GlassCard tint="cream" radius="xl" padding={spacing.xl}>
              <Text style={styles.emptyTitle}>No pain ratings yet</Text>
              <Text style={styles.emptyBody}>
                Tap the daily check-in on Home and rate your zones — the trend
                line, 14-day shift and per-zone breakdown all show up here once
                you have a few days of data.
              </Text>
            </GlassCard>
          </View>
        ) : (
        <>
        <View style={styles.summary}>
          <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryBig}>{avg}</Text>
                <Text style={styles.summaryLabel}>AVG /10</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryBig}>{delta <= 0 ? `↓ ${Math.abs(delta)}` : `↑ ${delta}`}</Text>
                <Text style={styles.summaryLabel}>14-DAY SHIFT</Text>
              </View>
            </View>
            <Text style={styles.summaryBlurb}>
              {delta <= -1
                ? 'Gentle downward trend — stretching is showing up in the data.'
                : delta >= 1
                ? 'Trending up. Try a symptom check-in tomorrow.'
                : 'Hovering steady. Consistency is doing its job.'}
            </Text>
          </GlassCard>
        </View>

        <Eyebrow>LAST 14 DAYS</Eyebrow>
        <View style={styles.stripWrap}>
          <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
            <View style={styles.strip}>
              {history14.map((v, i) => (
                <View
                  key={i}
                  style={[
                    styles.stripCell,
                    {
                      backgroundColor: colorFor(v),
                      height: 22 + v * 4,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.stripLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primarySoft }]} />
                <Text style={styles.legendText}>Low</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primaryMid }]} />
                <Text style={styles.legendText}>Moderate</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Sharp</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        <Eyebrow>BY ZONE</Eyebrow>
        <View style={styles.zones}>
          {perZone.map((z, i) => (
            <React.Fragment key={z.zone}>
              <View style={styles.zoneRow}>
                <View style={[styles.zoneBadge, { backgroundColor: colorFor(z.avg * 2) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.zoneName}>{z.zone}</Text>
                  <Text style={styles.zoneMeta}>Average {z.avg}/10</Text>
                </View>
                <Text style={[styles.zoneTrend, z.trend === 'down' ? styles.zoneTrendDown : styles.zoneTrendFlat]}>
                  {z.trend === 'down' ? '↓ Easing' : '→ Steady'}
                </Text>
              </View>
              {i < perZone.length - 1 && <View style={styles.zoneDivider} />}
            </React.Fragment>
          ))}
        </View>
        </>
        )}
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryBig: {
    fontSize: 48,
    lineHeight: 52,
    color: colors.primary,
    fontFamily: typeScale.display.fontFamily,
    letterSpacing: -1,
  },
  summaryLabel: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  sep: {
    width: 1,
    height: 36,
    backgroundColor: colors.inkHairline,
  },
  summaryBlurb: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  stripWrap: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    height: 72,
  },
  stripCell: {
    flex: 1,
    borderRadius: 6,
  },
  stripLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  zones: {
    marginTop: spacing.md,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  zoneBadge: {
    width: 10,
    height: 40,
    borderRadius: 5,
  },
  zoneName: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  zoneMeta: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  zoneTrend: {
    ...typeScale.label,
    textTransform: 'uppercase',
  },
  zoneTrendDown: {
    color: colors.primaryDeep,
  },
  zoneTrendFlat: {
    color: colors.inkSubtle,
  },
  zoneDivider: {
    height: 1,
    backgroundColor: colors.inkHairline,
  },
  emptyWrap: {
    marginTop: spacing.xl,
  },
  emptyTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyBody: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
