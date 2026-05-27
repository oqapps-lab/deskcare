import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  NavHeader,
  PillChip,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useArticles, i18nField as articleI18n } from '../../hooks/useArticles';
import type { BodyZoneSlug } from '../../lib/types/db';
import { t } from '../../lib/i18n';

interface ZoneFilter {
  label: string;
  zone?: BodyZoneSlug;
}

const FILTERS: ReadonlyArray<ZoneFilter> = [
  { label: t('kw_filter_all') },
  { label: t('kw_filter_neck'),     zone: 'neck' },
  { label: t('kw_filter_back'),     zone: 'back' },
  { label: t('kw_filter_eyes'),     zone: 'eyes' },
  { label: t('kw_filter_wrists'),   zone: 'wrists' },
  { label: t('kw_filter_sciatica'), zone: 'sciatica' },
];

export default function KnowledgeScreen() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<ZoneFilter>(FILTERS[0]);
  const { articles, loading, error } = useArticles({ zoneSlug: active.zone });

  const list = useMemo(() => articles || [], [articles]);

  const openArticle = (slug: string) => {
    Haptics.selectionAsync();
    router.push(`/knowledge/${slug}` as never);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="lavender" size={220} opacity={0.16} />

      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <NavHeader showBack onBack={() => router.back()} title="" />

        <Text style={styles.title}>{t('kw_title')}</Text>
        <Text style={styles.sub}>
          {list.length > 0
            ? t(list.length === 1 ? 'kw_sub_count' : 'kw_sub_count_plural', { count: list.length })
            : loading
            ? t('kw_sub_loading')
            : t('kw_sub_empty')}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterStripContent}
          style={styles.filterStrip}
        >
          {FILTERS.map((f) => (
            <PillChip
              key={f.label}
              active={active.label === f.label}
              onPress={() => setActive(f)}
              size="sm"
            >
              {f.label}
            </PillChip>
          ))}
        </ScrollView>

        {error && (
          <View style={styles.statusWrap}>
            <Text style={styles.statusError}>{t('kw_error_prefix')} {error}</Text>
          </View>
        )}

        {!error && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.huge }}
            style={{ flex: 1 }}
          >
            {loading && !articles ? (
              <View style={styles.statusWrap}>
                <ActivityIndicator color={colors.primaryMid} />
              </View>
            ) : list.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>{t('kw_empty_title')}</Text>
                <Text style={styles.emptySub}>{t('kw_empty_sub')}</Text>
              </View>
            ) : (
              list.map((a, i) => (
                <Pressable
                  key={a.id}
                  onPress={() => openArticle(a.slug)}
                  accessibilityRole="button"
                  accessibilityLabel={articleI18n(a as never, 'title')}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <View style={[styles.card, i > 0 && { marginTop: spacing.md }]}>
                    {a.cover_image_url ? (
                      <ExpoImage
                        source={{ uri: a.cover_image_url }}
                        style={styles.cover}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                      />
                    ) : (
                      <View style={styles.coverPlaceholder} />
                    )}
                    <View style={styles.cardBody}>
                      <Text style={styles.cardEyebrow}>
                        {t('kw_min_read', { n: a.reading_minutes })}
                        {a.tags?.[0] ? ` · ${a.tags[0].replace(/_/g, ' ').toUpperCase()}` : ''}
                      </Text>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {articleI18n(a as never, 'title')}
                      </Text>
                      <Text style={styles.cardExcerpt} numberOfLines={3}>
                        {articleI18n(a as never, 'excerpt')}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        )}
      </View>
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
    marginTop: spacing.sm,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  filterStrip: {
    marginHorizontal: -spacing.xxl,
    maxHeight: 48,
    marginBottom: spacing.md,
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
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  emptyTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  emptySub: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
  },
  pressed: {
    opacity: 0.85,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.inkHairline,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceLow,
  },
  coverPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.secondarySoft,
  },
  cardBody: {
    padding: spacing.lg,
  },
  cardEyebrow: {
    ...typeScale.label,
    color: colors.primaryMid,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  cardExcerpt: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    lineHeight: 20,
  },
});
