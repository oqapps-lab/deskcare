import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArticleCover } from '../../components/ArticleCover';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  NavHeader,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useArticle, i18nField, markArticleRead } from '../../hooks/useArticles';
import { useUserId } from '../../lib/store/session';
import { t } from '../../lib/i18n';

/**
 * Minimal markdown renderer for the editorial format we use:
 *   ### heading
 *   plain paragraph
 *   - bullet item
 *   1. numbered item
 *   **bold inline**
 *
 * No external dependency — keeps bundle small.
 */
const renderMarkdown = (md: string): React.ReactNode[] => {
  const blocks: React.ReactNode[] = [];
  const lines = md.split('\n');
  let listBuffer: string[] = [];
  let listOrdered = false;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <View key={`list-${blocks.length}`} style={styles.list}>
        {listBuffer.map((item, i) => (
          <View key={i} style={styles.listItemRow}>
            <Text style={styles.listMarker}>
              {listOrdered ? `${i + 1}.` : '•'}
            </Text>
            <Text style={styles.listItem}>{renderInline(item)}</Text>
          </View>
        ))}
      </View>,
    );
    listBuffer = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith('### ')) {
      flushList();
      blocks.push(
        <Text key={`h-${blocks.length}`} style={styles.h3}>
          {line.slice(4)}
        </Text>,
      );
      continue;
    }
    const bulletMatch = line.match(/^[-•]\s+(.*)$/);
    if (bulletMatch) {
      if (listOrdered && listBuffer.length > 0) flushList();
      listOrdered = false;
      listBuffer.push(bulletMatch[1]);
      continue;
    }
    const numMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      if (!listOrdered && listBuffer.length > 0) flushList();
      listOrdered = true;
      listBuffer.push(numMatch[1]);
      continue;
    }
    flushList();
    blocks.push(
      <Text key={`p-${blocks.length}`} style={styles.paragraph}>
        {renderInline(line)}
      </Text>,
    );
  }
  flushList();
  return blocks;
};

const renderInline = (text: string): React.ReactNode => {
  // Split on **bold** boundaries.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
};

export default function ArticleReaderScreen() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { article, loading, error } = useArticle(slug);
  const userId = useUserId();

  useEffect(() => {
    if (article && userId) {
      markArticleRead(userId, article.id).catch(() => { /* non-critical */ });
    }
  }, [article, userId]);

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />

      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <NavHeader showBack onBack={() => router.back()} title="" />

        {loading && (
          <View style={styles.statusWrap}>
            <ActivityIndicator color={colors.primaryMid} />
          </View>
        )}

        {error && (
          <View style={styles.statusWrap}>
            <Text style={styles.statusError}>{t('kw_article_error')} {error}</Text>
          </View>
        )}

        {!loading && article && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.huge }}
            style={{ flex: 1 }}
          >
            <ArticleCover tags={article.tags as string[] | null | undefined} />

            <Text style={styles.eyebrow}>
              {t('kw_min_read', { n: article.reading_minutes })}
              {article.tags?.[0] ? ` · ${article.tags[0].replace(/_/g, ' ').toUpperCase()}` : ''}
            </Text>

            <Text style={styles.title}>{i18nField(article as never, 'title')}</Text>

            <Text style={styles.excerpt}>{i18nField(article as never, 'excerpt')}</Text>

            <View style={styles.divider} />

            <View style={styles.bodyWrap}>
              {renderMarkdown(i18nField(article as never, 'body_markdown'))}
            </View>
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
  statusWrap: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  statusError: {
    ...typeScale.bodySm,
    color: colors.error,
    textAlign: 'center',
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 18,
    backgroundColor: colors.surfaceLow,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  coverPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 18,
    backgroundColor: colors.secondarySoft,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typeScale.label,
    color: colors.primaryMid,
    marginBottom: spacing.sm,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  excerpt: {
    ...typeScale.body,
    color: colors.inkMuted,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inkHairline,
    marginBottom: spacing.lg,
  },
  bodyWrap: {
    gap: spacing.md,
  },
  paragraph: {
    ...typeScale.body,
    color: colors.ink,
    lineHeight: 25,
  },
  h3: {
    ...typeScale.titleLg,
    color: colors.inkDeep,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  bold: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: colors.ink,
  },
  list: {
    paddingLeft: spacing.sm,
    gap: spacing.sm,
  },
  listItemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listMarker: {
    ...typeScale.body,
    color: colors.primaryMid,
    minWidth: 20,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  listItem: {
    ...typeScale.body,
    color: colors.ink,
    flex: 1,
    lineHeight: 25,
  },
});
