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
  IconHalo,
  PillChip,
  PremiumLock,
  TabBar,
  VideoPlaceholder,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useExercises } from '../../hooks/useContent';
import { useCustomRoutines } from '../../hooks/useCustomRoutines';
import { useIsPremium } from '../../lib/premium';
import type { BodyZoneSlug } from '../../lib/types/db';
import { t, i18nField } from '../../lib/i18n';

interface Filter {
  label: string;
  zone?: BodyZoneSlug | 'all';
}

const FILTERS: ReadonlyArray<Filter> = [
  { label: t('mlib_filter_all'),  zone: 'all' },
  { label: t('zone_neck'),        zone: 'neck' },
  { label: t('zone_back'),        zone: 'back' },
  { label: t('zone_eyes'),        zone: 'eyes' },
  { label: t('zone_wrists'),      zone: 'wrists' },
  { label: t('mlib_filter_full'), zone: 'full_body' },
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
  const isPremium = useIsPremium();
  const { routines: customRoutines } = useCustomRoutines();

  const list = useMemo(() => {
    if (!exercises) return [];
    if (!query) return exercises;
    const q = query.toLowerCase();
    return exercises.filter(
      (e) =>
        i18nField(e, 'title').toLowerCase().includes(q) ||
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
          },
        ]}
      >
        <Text style={styles.title}>{t('mlib_title')}</Text>
        <Text style={styles.sub}>{t('mlib_sub_count', { count: String(exercises?.length ?? '…') })}</Text>

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
            placeholder={t('mlib_search_placeholder')}
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
            <Text style={styles.statusError}>{t('mlib_error_prefix')} {error}</Text>
          </View>
        )}

        {!error && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
            style={{ flex: 1 }}
          >
            {/* Custom Routines — F13. Builder entry + user's saved routines. */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/library/create-routine' as never);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('cr_builder_title')}
              style={({ pressed }) => [pressed && styles.pressed, { marginBottom: spacing.md }]}
            >
              <GlassCard tint="lavender" radius="xl" padding={spacing.lg}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <IconHalo icon="plus" size="md" tone="lavender" variant="tinted" />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.rowName}>{t('cr_builder_title')}</Text>
                    <Text style={styles.rowMeta}>{t('cr_builder_sub')}</Text>
                  </View>
                </View>
              </GlassCard>
            </Pressable>

            {customRoutines.length > 0 && (
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={styles.sectionEyebrow}>{t('cr_saved_eyebrow')}</Text>
                {customRoutines.map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      router.push({ pathname: '/library/saved-routine', params: { id: r.id } } as never);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={r.name}
                    style={({ pressed }) => [pressed && styles.pressed]}
                  >
                    <View style={[styles.row]}>
                      <View style={styles.savedAvatar}>
                        <Text style={styles.savedAvatarText}>{r.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowName} numberOfLines={1}>{r.name}</Text>
                        <Text style={styles.rowMeta}>
                          {t('cr_count_exercises', { n: r.exerciseSlugs.length })}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {loading && !exercises ? (
              <View style={styles.statusWrap}>
                <ActivityIndicator color={colors.primaryMid} />
              </View>
            ) : list.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>{t('mlib_empty_title')}</Text>
                <Text style={styles.emptySub}>{t('mlib_empty_sub')}</Text>
              </View>
            ) : (
              list.map((e, i) => (
                <Pressable
                  key={e.id}
                  onPress={() => open(e.slug, !!e.is_premium && !isPremium)}
                  accessibilityRole="button"
                  accessibilityLabel={`${i18nField(e, 'title')}, ${formatDuration(e.duration_seconds)}, ${e.code}${e.is_premium ? ', premium' : ''}`}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <View style={[styles.row, i > 0 && styles.rowDivider]}>
                    <VideoPlaceholder pose={poseFor(e.code)} circle />
                    <View style={styles.rowText}>
                      <View style={styles.rowTitleRow}>
                        <Text
                          style={styles.rowName}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                          adjustsFontSizeToFit
                          minimumFontScale={0.85}
                        >
                          {i18nField(e, 'title')}
                        </Text>
                        {e.is_premium && !isPremium && <PremiumLock size="sm" />}
                      </View>
                      <Text style={styles.rowMeta}>
                        {e.code} · {formatDuration(e.duration_seconds)} · {e.exercise_type}
                      </Text>
                    </View>
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.inkHairline,
  },
  sectionEyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    marginBottom: spacing.xs,
  },
  savedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedAvatarText: {
    ...typeScale.titleLg,
    color: colors.primaryDeep,
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
