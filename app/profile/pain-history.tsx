import React from 'react';
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

/**
 * 14-day pain rating trend — higher = more pain. Shown as a warmth strip
 * where each cell fades from sage-ish to coral based on value 0..10.
 */
const HISTORY_14 = [5, 6, 6, 7, 5, 4, 4, 3, 3, 4, 3, 2, 3, 2];

const PER_ZONE = [
  { zone: 'Neck',    avg: 4.2, trend: 'down' as const },
  { zone: 'Back',    avg: 3.1, trend: 'flat' as const },
  { zone: 'Eyes',    avg: 2.4, trend: 'down' as const },
  { zone: 'Wrists',  avg: 1.5, trend: 'flat' as const },
];

const colorFor = (v: number) => {
  if (v >= 7) return colors.primary;
  if (v >= 5) return colors.primaryMid;
  if (v >= 3) return colors.primaryLight;
  return colors.primarySoft;
};

export default function PainHistoryScreen() {
  const insets = useSafeAreaInsets();

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  const avg = (HISTORY_14.reduce((a, b) => a + b, 0) / HISTORY_14.length).toFixed(1);
  const delta = HISTORY_14[HISTORY_14.length - 1] - HISTORY_14[0];

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
              {HISTORY_14.map((v, i) => (
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
          {PER_ZONE.map((z, i) => (
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
              {i < PER_ZONE.length - 1 && <View style={styles.zoneDivider} />}
            </React.Fragment>
          ))}
        </View>
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
});
