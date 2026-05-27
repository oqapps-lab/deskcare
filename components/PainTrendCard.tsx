import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { colors, spacing, typeScale } from '../constants/tokens';
import { GlassCard } from './ui';
import type { PainTrend } from '../hooks/usePainTrend';
import { t } from '../lib/i18n';

const WIDTH = 200;
const HEIGHT = 60;
const PAD_Y = 6;

/**
 * Build SVG path for a 14-day sparkline. Points sorted oldest→newest;
 * y-axis inverted (high pain = high on screen). Smooth quadratic curve.
 */
const buildSparkline = (levels: number[]): string => {
  if (levels.length < 2) return '';
  const xs = levels.map((_, i) => (i / (levels.length - 1)) * WIDTH);
  const minLvl = 1;
  const maxLvl = 10;
  const ys = levels.map((v) => {
    const norm = (v - minLvl) / (maxLvl - minLvl); // 0..1
    return PAD_Y + (1 - norm) * (HEIGHT - PAD_Y * 2);
  });
  let d = `M ${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`;
  for (let i = 1; i < xs.length; i++) {
    const midX = (xs[i - 1] + xs[i]) / 2;
    d += ` Q ${midX.toFixed(1)} ${ys[i - 1].toFixed(1)} ${xs[i].toFixed(1)} ${ys[i].toFixed(1)}`;
  }
  return d;
};

const buildArea = (levels: number[]): string => {
  if (levels.length < 2) return '';
  const xs = levels.map((_, i) => (i / (levels.length - 1)) * WIDTH);
  const minLvl = 1;
  const maxLvl = 10;
  const ys = levels.map((v) => {
    const norm = (v - minLvl) / (maxLvl - minLvl);
    return PAD_Y + (1 - norm) * (HEIGHT - PAD_Y * 2);
  });
  let d = `M ${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`;
  for (let i = 1; i < xs.length; i++) {
    const midX = (xs[i - 1] + xs[i]) / 2;
    d += ` Q ${midX.toFixed(1)} ${ys[i - 1].toFixed(1)} ${xs[i].toFixed(1)} ${ys[i].toFixed(1)}`;
  }
  d += ` L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;
  return d;
};

export const PainTrendCard: React.FC<{ trend: PainTrend }> = ({ trend }) => {
  if (!trend.zoneSlug || !trend.hasAnyEntry) return null;

  // Sparkline: last 14 days, oldest→newest. Pad with last-known value if sparse.
  const recent14 = [...trend.points]
    .filter((p) => {
      const today = new Date();
      const cutoff = new Date();
      cutoff.setDate(today.getDate() - 14);
      return p.date > cutoff.toISOString().split('T')[0];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  const levels = recent14.map((p) => p.level);
  const pathD = buildSparkline(levels);
  const areaD = buildArea(levels);

  const delta = trend.deltaPct;
  let deltaLabel: string;
  let deltaColor: string;
  if (delta === null) {
    deltaLabel = t('pt_delta_none');
    deltaColor = colors.inkSubtle;
  } else if (delta < -5) {
    deltaLabel = t('pt_delta_down', { pct: Math.abs(delta) });
    deltaColor = colors.mintMid;
  } else if (delta > 5) {
    deltaLabel = t('pt_delta_up', { pct: delta });
    deltaColor = colors.error;
  } else {
    deltaLabel = t('pt_delta_steady');
    deltaColor = colors.inkSubtle;
  }

  const zoneLabel = trend.zoneName ? trend.zoneName.toUpperCase() : '';
  const avgLabel = trend.recentAvg !== null ? trend.recentAvg.toFixed(1) : '—';

  return (
    <View style={styles.wrap}>
      <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
        <Text style={styles.eyebrow}>{t('pt_eyebrow', { zone: zoneLabel })}</Text>
        <View style={styles.row}>
          <View style={styles.numCol}>
            <Text style={styles.avgValue}>{avgLabel}</Text>
            <Text style={styles.avgUnit}>{t('pt_avg_unit')}</Text>
          </View>
          <View style={styles.sparkWrap}>
            {levels.length >= 2 ? (
              <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
                <Defs>
                  <SvgLinearGradient id="pt-area" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={colors.primaryMid} stopOpacity="0.32" />
                    <Stop offset="1" stopColor={colors.primaryMid} stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>
                <Path d={areaD} fill="url(#pt-area)" />
                <Path
                  d={pathD}
                  stroke={colors.primary}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            ) : (
              <Text style={styles.sparkPlaceholder}>{t('pt_sparkline_placeholder')}</Text>
            )}
          </View>
        </View>
        <Text style={[styles.deltaText, { color: deltaColor }]}>{deltaLabel}</Text>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
  },
  eyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  numCol: {
    minWidth: 70,
  },
  avgValue: {
    ...typeScale.displayXl,
    fontSize: 48,
    lineHeight: 52,
    color: colors.ink,
  },
  avgUnit: {
    ...typeScale.label,
    color: colors.inkSubtle,
    marginTop: 2,
  },
  sparkWrap: {
    flex: 1,
    height: HEIGHT,
    justifyContent: 'center',
  },
  sparkPlaceholder: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    textAlign: 'center',
  },
  deltaText: {
    ...typeScale.bodySm,
    marginTop: spacing.sm,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
