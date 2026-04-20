import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { BrandMark } from '../components/ui/BrandMark';
import { Eyebrow } from '../components/ui/Eyebrow';
import { GlassCard } from '../components/ui/GlassCard';
import { Glyph } from '../components/ui/Glyph';
import { colors, spacing, typeScale } from '../constants/tokens';

/**
 * Design-review hub. Lists all 7 screens from this batch. Taps route to the
 * corresponding screen. Not a production home — remove before release.
 */
const SCREENS = [
  { href: '/settings/notifications', title: 'Notification Settings', sub: 'Time pills, toggles, premium row' },
  { href: '/eye/break', title: '30-Second Eye Break', sub: 'Hero number, play CTA, ghost watermark' },
  { href: '/onboarding/permission', title: 'Permission Prompt', sub: 'Bell icon, benefit card, gradient CTA' },
  { href: '/eye/session', title: 'Eye Exercise Session', sub: 'Timer, pulse circle, transport bar' },
  { href: '/errors/no-connection', title: 'Нет подключения', sub: 'Clay illustration, outlined CTA' },
  { href: '/pain/check-in', title: 'Pain Location + Severity', sub: 'Animated body map, gradient slider' },
  { href: '/sync', title: 'Синхронизация', sub: 'Concentric pulse rings, loading state' },
] as const;

export default function DesignHub() {
  const insets = useSafeAreaInsets();

  return (
    <AtmosphericBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.huge,
          paddingBottom: insets.bottom + spacing.huge,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <BrandMark />
          <View style={{ height: spacing.sm }} />
          <Eyebrow>DESIGN REVIEW · BATCH 1 OF 6</Eyebrow>
          <View style={{ height: spacing.md }} />
          <Text style={styles.title}>The Radiant Sanctuary — 7 screens</Text>
          <Text style={styles.subtitle}>
            Tap a row to walk through. Back-chevron returns here. See
            docs/06-design/DESIGN-GUIDE.md for the system.
          </Text>
        </View>
        <View style={styles.list}>
          {SCREENS.map((s, i) => (
            <Link key={s.href} href={s.href as any} asChild>
              <GlassCard radius="xl" padding={spacing.xl}>
                <View style={styles.row}>
                  <View style={styles.numChip}>
                    <Text style={styles.num}>{String(i + 1).padStart(2, '0')}</Text>
                  </View>
                  <View style={styles.textCol}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {s.title}
                    </Text>
                    <Text style={styles.rowSub} numberOfLines={2}>
                      {s.sub}
                    </Text>
                  </View>
                  <Glyph name="chevron-right" size={20} color={colors.inkSubtle} />
                </View>
              </GlassCard>
            </Link>
          ))}
        </View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
  },
  subtitle: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  numChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    ...typeScale.label,
    color: colors.primaryMid,
    fontSize: 13,
  },
  textCol: { flex: 1 },
  rowTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  rowSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
});
