import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  FloatingScrim,
  GlassCard,
  NavHeader,
  PillCTA,
  PillChip,
  VideoPlaceholder,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useExercises } from '../../hooks/useContent';
import { useCustomRoutines } from '../../hooks/useCustomRoutines';
import { useIsPremium } from '../../lib/premium';
import type { BodyZoneSlug } from '../../lib/types/db';
import { t, i18nField } from '../../lib/i18n';

const FILTERS: ReadonlyArray<{ label: string; zone: BodyZoneSlug | 'all' }> = [
  { label: 'All',     zone: 'all' },
  { label: 'Neck',    zone: 'neck' },
  { label: 'Back',    zone: 'back' },
  { label: 'Eyes',    zone: 'eyes' },
  { label: 'Wrists',  zone: 'wrists' },
];

const poseFor = (code: string): 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch' => {
  if (code.startsWith('N')) return 'neck-roll';
  if (code.startsWith('B') || code.startsWith('S') || code.startsWith('F')) return 'back-arch';
  if (code.startsWith('W')) return 'wrist-stretch';
  if (code.startsWith('E')) return 'eye-rest';
  return 'neck-roll';
};

export default function CreateRoutineScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { exercises, loading } = useExercises(activeFilter.zone);
  const { add } = useCustomRoutines();
  const isPremium = useIsPremium();

  const list = useMemo(() => exercises || [], [exercises]);

  const toggle = (slug: string) => {
    Haptics.selectionAsync();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const totalSeconds = useMemo(
    () => list.filter((e) => selected.has(e.slug)).reduce((acc, e) => acc + (e.duration_seconds || 0), 0),
    [list, selected],
  );

  const save = async () => {
    if (selected.size < 2) {
      Alert.alert(t('cr_err_min_title'), t('cr_err_min_body'));
      return;
    }
    const trimmed = name.trim() || t('cr_default_name');
    await add(trimmed, Array.from(selected));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  if (!isPremium) {
    return (
      <AtmosphericBackground>
        <BgPattern variant="dots" opacity={0.05} tone="coral" />
        <NavHeader title={t('cr_title')} onBack={() => router.back()} />
        <View style={[styles.lockWrap, { paddingTop: insets.top + 100 }]}>
          <GlassCard tint="coral" radius="xl" padding={spacing.xl} innerGradient>
            <Text style={styles.lockEyebrow}>{t('cr_lock_eyebrow')}</Text>
            <Text style={styles.lockTitle}>{t('cr_lock_title')}</Text>
            <Text style={styles.lockBody}>{t('cr_lock_body')}</Text>
          </GlassCard>
          <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
            <PillCTA variant="primary" size="lg" onPress={() => router.push('/onboarding/paywall' as never)}>
              {t('libd_cta_unlock')}
            </PillCTA>
          </View>
        </View>
      </AtmosphericBackground>
    );
  }

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="lavender" />
      <DecorativeArc position="top-right" tone="lavender" size={220} opacity={0.18} />

      <NavHeader title={t('cr_title')} onBack={() => router.back()} />

      <View style={[styles.root, { paddingTop: spacing.md }]}>
        <View style={{ paddingHorizontal: spacing.xxl }}>
          <Text style={styles.eyebrow}>{t('cr_eyebrow')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('cr_name_placeholder')}
            placeholderTextColor={colors.inkSubtle}
            style={styles.nameInput}
            maxLength={48}
          />
          <Text style={styles.meta}>
            {t('cr_meta', {
              count: selected.size,
              min: Math.max(1, Math.round(totalSeconds / 60)),
            })}
          </Text>
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 140, paddingHorizontal: spacing.xxl }}
          style={{ flex: 1 }}
        >
          {loading && list.length === 0 ? (
            <ActivityIndicator color={colors.primaryMid} style={{ marginTop: spacing.huge }} />
          ) : (
            list.map((e, i) => {
              const on = selected.has(e.slug);
              return (
                <Animated.View key={e.id} entering={FadeInDown.delay(i * 24).duration(220)}>
                  <Pressable
                    onPress={() => toggle(e.slug)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={i18nField(e, 'title')}
                    style={({ pressed }) => [pressed && styles.pressed]}
                  >
                    <View style={[styles.row, on && styles.rowOn]}>
                      <VideoPlaceholder pose={poseFor(e.code)} circle />
                      <View style={styles.rowText}>
                        <Text style={styles.rowName} numberOfLines={2}>{i18nField(e, 'title')}</Text>
                        <Text style={styles.rowMeta}>
                          {e.code} · {Math.max(1, Math.round((e.duration_seconds || 0) / 60))} MIN
                        </Text>
                      </View>
                      <View style={[styles.checkBox, on && styles.checkBoxOn]}>
                        {on && (
                          <Svg width={14} height={14} viewBox="0 0 14 14">
                            <Path d="M3 7 L6 10 L11 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </Svg>
                        )}
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })
          )}
        </ScrollView>
      </View>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <FloatingScrim />
        <PillCTA variant="primary" size="lg" onPress={save} disabled={selected.size < 2}>
          {t('cr_cta_save')}
        </PillCTA>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  eyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    marginBottom: spacing.xs,
  },
  nameInput: {
    ...typeScale.headlineSm,
    color: colors.ink,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkHairline,
  },
  meta: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  filterStrip: {
    marginTop: spacing.md,
    maxHeight: 48,
  },
  filterStripContent: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  pressed: { opacity: 0.86 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkHairline,
  },
  rowOn: {
    backgroundColor: 'rgba(232,123,78,0.06)',
  },
  rowText: { flex: 1, minWidth: 0 },
  rowName: { ...typeScale.titleLg, color: colors.ink },
  rowMeta: { ...typeScale.bodySm, color: colors.inkSubtle, marginTop: 2 },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.inkHairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: {
    backgroundColor: colors.primaryMid,
    borderColor: colors.primaryMid,
  },
  ctaFloating: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  lockWrap: {
    paddingHorizontal: spacing.xxl,
  },
  lockEyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
  },
  lockTitle: {
    ...typeScale.headlineSm,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  lockBody: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
