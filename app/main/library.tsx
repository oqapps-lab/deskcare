import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  PillChip,
  TabBar,
  VideoPlaceholder,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

const FILTERS = ['All', 'Neck', 'Back', 'Eyes', 'Wrists', '30 SEC', '2 MIN', '5 MIN'] as const;

interface Exercise {
  id: string;
  name: string;
  zone: 'Neck' | 'Back' | 'Eyes' | 'Wrists';
  duration: '30 SEC' | '2 MIN' | '3 MIN' | '5 MIN';
  pose: 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch';
  premium?: boolean;
  favorite?: boolean;
}

const ALL: ReadonlyArray<Exercise> = [
  { id: 'chin-tuck',      name: 'Chin Tuck',              zone: 'Neck',   duration: '2 MIN',  pose: 'neck-roll',     favorite: true },
  { id: 'upper-trap',     name: 'Upper Trap Stretch',     zone: 'Neck',   duration: '2 MIN',  pose: 'neck-roll' },
  { id: 'eye-figure-8',   name: 'Eye Figure-8',           zone: 'Eyes',   duration: '30 SEC', pose: 'eye-rest' },
  { id: 'cat-cow',        name: 'Seated Cat-Cow',         zone: 'Back',   duration: '3 MIN',  pose: 'back-arch' },
  { id: 'wrist-flex',     name: 'Wrist Flex & Extend',    zone: 'Wrists', duration: '2 MIN',  pose: 'wrist-stretch' },
  { id: 'thoracic-open',  name: 'Thoracic Opener',        zone: 'Back',   duration: '3 MIN',  pose: 'back-arch',    premium: true },
  { id: 'palming',        name: 'Palming Reset',          zone: 'Eyes',   duration: '30 SEC', pose: 'eye-rest' },
  { id: 'levator',        name: 'Levator Scapulae Release', zone: 'Neck', duration: '5 MIN',  pose: 'neck-roll',    premium: true },
  { id: 'median-glide',   name: 'Median Nerve Glide',     zone: 'Wrists', duration: '2 MIN',  pose: 'wrist-stretch', premium: true },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');

  const list = useMemo(() => {
    return ALL.filter((e) => {
      if (query && !e.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === 'All') return true;
      if (['Neck', 'Back', 'Eyes', 'Wrists'].includes(filter)) return e.zone === filter;
      return e.duration === filter;
    });
  }, [query, filter]);

  const open = (id: string, locked: boolean) => {
    Haptics.selectionAsync();
    router.push({ pathname: `/library/${id}` as never, params: locked ? { locked: '1' } : {} } as never);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.16} />

      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + 120,
          },
        ]}
      >
        <Text style={styles.title}>Library</Text>
        <Text style={styles.sub}>Short exercises by zone and duration.</Text>

        <View style={styles.searchRow}>
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path d="M7.5 2 a5.5 5.5 0 1 1 0 11 a5.5 5.5 0 1 1 0 -11 M12 12 L16 16" stroke={colors.inkSubtle} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or zone"
            placeholderTextColor={colors.inkSubtle}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterStripContent}
          style={styles.filterStrip}
        >
          {FILTERS.map((f) => (
            <PillChip key={f} active={filter === f} onPress={() => setFilter(f)} size="sm">
              {f}
            </PillChip>
          ))}
        </ScrollView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          style={{ flex: 1 }}
        >
          {list.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>Nothing matches that.</Text>
              <Text style={styles.emptySub}>Try another zone or clear filters.</Text>
            </View>
          ) : (
            list.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => open(e.id, !!e.premium)}
                accessibilityRole="button"
                accessibilityLabel={`${e.name}, ${e.duration}, ${e.zone}${e.premium ? ', premium' : ''}`}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <View style={styles.rowWrap}>
                  <GlassCard tint={e.premium ? 'peach' : 'cream'} radius="xl" padding={spacing.md}>
                    <View style={styles.row}>
                      <VideoPlaceholder pose={e.pose} compact />
                      <View style={styles.rowText}>
                        <View style={styles.rowTitleRow}>
                          <Text style={styles.rowName} numberOfLines={1}>
                            {e.name}
                          </Text>
                          {e.premium && <KeyGlyph />}
                        </View>
                        <Text style={styles.rowMeta}>
                          {e.duration} · {e.zone}
                        </Text>
                      </View>
                      <HeartGlyph filled={!!e.favorite} />
                    </View>
                  </GlassCard>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>

      <TabBar current="library" />
    </AtmosphericBackground>
  );
}

const KeyGlyph = () => (
  <Svg width={14} height={14} viewBox="0 0 14 14">
    <Path d="M5 9 a3 3 0 1 1 4 0 L9 9 L12 12 L10 14 L9 13 L8 14 L7 13" stroke={colors.primaryMid} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);

const HeartGlyph: React.FC<{ filled: boolean }> = ({ filled }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path
      d="M10 17 C 3 12 1 9 3 6 C 5 3 8.5 4 10 7 C 11.5 4 15 3 17 6 C 19 9 17 12 10 17 Z"
      stroke={filled ? colors.primaryMid : colors.inkSubtle}
      strokeWidth="1.6"
      fill={filled ? colors.primaryMid : 'none'}
      strokeLinejoin="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkHairline,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typeScale.body,
    color: colors.ink,
    paddingVertical: 0,
  },
  filterStrip: {
    marginHorizontal: -spacing.xxl,
    maxHeight: 48,
  },
  filterStripContent: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  rowWrap: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowName: {
    ...typeScale.titleLg,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  rowMeta: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  emptySub: {
    ...typeScale.body,
    color: colors.inkMuted,
  },
});
