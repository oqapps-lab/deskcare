import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  GlassCard,
  PillChip,
  TabBar,
  VideoPlaceholder,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useExercises } from '../../hooks/useContent';
import type { BodyZoneSlug } from '../../lib/types/db';

interface Filter {
  label: string;
  zone?: BodyZoneSlug | 'all';
}

const FILTERS: ReadonlyArray<Filter> = [
  { label: 'All',       zone: 'all' },
  { label: 'Neck',      zone: 'neck' },
  { label: 'Back',      zone: 'back' },
  { label: 'Eyes',      zone: 'eyes' },
  { label: 'Wrists',    zone: 'wrists' },
  { label: 'Full body', zone: 'full_body' },
];

const poseFor = (code: string): 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch' => {
  if (code.startsWith('N')) return 'neck-roll';
  if (code.startsWith('B') || code.startsWith('S') || code.startsWith('F')) return 'back-arch';
  if (code.startsWith('W')) return 'wrist-stretch';
  if (code.startsWith('E')) return 'eye-rest';
  return 'neck-roll';
};

const formatDuration = (s: number): string => (s < 60 ? `${s} SEC` : `${Math.round(s / 60)} MIN`);

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTERS[0]);
  const { exercises, loading, error } = useExercises(activeFilter.zone);

  const list = useMemo(() => {
    if (!exercises) return [];
    if (!query) return exercises;
    const q = query.toLowerCase();
    return exercises.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.title_en?.toLowerCase().includes(q) ?? false) ||
        e.code.toLowerCase().includes(q),
    );
  }, [exercises, query]);

  const open = (slug: string, locked: boolean) => {
    Haptics.selectionAsync();
    router.push({ pathname: `/library/${slug}` as never, params: locked ? { locked: '1' } : {} } as never);
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
        <Text style={styles.sub}>Short exercises by zone — {exercises?.length ?? '…'} atoms.</Text>

        <View style={styles.searchRow}>
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path
              d="M7.5 2 a5.5 5.5 0 1 1 0 11 a5.5 5.5 0 1 1 0 -11 M12 12 L16 16"
              stroke={colors.inkSubtle}
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, code, or zone"
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
            <PillChip
              key={f.label}
              active={activeFilter.label === f.label}
              onPress={() => setActiveFilter(f)}
              size="sm"
            >
              {f.label}
            </PillChip>
          ))}
        </ScrollView>

        {error && (
          <View style={styles.statusWrap}>
            <Text style={styles.statusError}>Could not load exercises: {error}</Text>
          </View>
        )}

        {!error && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing.xxxl }}
            style={{ flex: 1 }}
          >
            {loading && !exercises ? (
              <View style={styles.statusWrap}>
                <ActivityIndicator color={colors.primaryMid} />
              </View>
            ) : list.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>Nothing matches that.</Text>
                <Text style={styles.emptySub}>Try another zone or clear filters.</Text>
              </View>
            ) : (
              list.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => open(e.slug, !!e.is_premium)}
                  accessibilityRole="button"
                  accessibilityLabel={`${e.title_en ?? e.title}, ${formatDuration(e.duration_seconds)}, ${e.code}${e.is_premium ? ', premium' : ''}`}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <View style={styles.rowWrap}>
                    <GlassCard tint={e.is_premium ? 'peach' : 'cream'} radius="xl" padding={spacing.md}>
                      <View style={styles.row}>
                        <VideoPlaceholder pose={poseFor(e.code)} compact />
                        <View style={styles.rowText}>
                          <View style={styles.rowTitleRow}>
                            <Text style={styles.rowName} numberOfLines={1}>
                              {e.title_en ?? e.title}
                            </Text>
                            {e.is_premium && <KeyGlyph />}
                          </View>
                          <Text style={styles.rowMeta}>
                            {e.code} · {formatDuration(e.duration_seconds)} · {e.exercise_type}
                          </Text>
                        </View>
                      </View>
                    </GlassCard>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <TabBar current="library" />
    </AtmosphericBackground>
  );
}

const KeyGlyph = () => (
  <Svg width={14} height={14} viewBox="0 0 14 14">
    <Path
      d="M5 9 a3 3 0 1 1 4 0 L9 9 L12 12 L10 14 L9 13 L8 14 L7 13"
      stroke={colors.primaryMid}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
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
  statusWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  statusError: {
    ...typeScale.bodySm,
    color: colors.error,
    textAlign: 'center',
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
