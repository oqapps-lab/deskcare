import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Article, BodyZoneSlug } from '../lib/types/db';
import { getLocale } from '../lib/i18n';

const BASE_SELECT =
  'id, slug, body_zone_id, title, excerpt, body_markdown, title_i18n, excerpt_i18n, body_markdown_i18n, cover_image_url, reading_minutes, is_premium, tags, sort_order, published_at';

/** Pick the localized field from a row, falling back to the base column. */
export const i18nField = (
  row: { [key: string]: unknown } | null | undefined,
  key: 'title' | 'excerpt' | 'body_markdown',
): string => {
  if (!row) return '';
  const locale = getLocale();
  const i18n = row[`${key}_i18n`] as Record<string, string> | null | undefined;
  if (i18n && locale in i18n && i18n[locale]) return i18n[locale];
  return (row[key] as string) || '';
};

/**
 * All published articles, sorted by sort_order then published_at desc.
 * Optionally filter by body zone or tag.
 */
export const useArticles = (opts?: { zoneSlug?: BodyZoneSlug; tag?: string }) => {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      let zoneId: string | null = null;
      if (opts?.zoneSlug) {
        const zone = await supabase
          .from('body_zones')
          .select('id')
          .eq('slug', opts.zoneSlug)
          .maybeSingle();
        if (zone.data) zoneId = zone.data.id;
      }

      let q = supabase
        .from('articles')
        .select(BASE_SELECT)
        .not('published_at', 'is', null)
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false });

      if (zoneId) q = q.eq('body_zone_id', zoneId);
      if (opts?.tag) q = q.contains('tags', [opts.tag]);

      const { data, error: err } = await q;
      if (cancelled) return;
      if (err) setError(err.message);
      else setArticles((data || []) as Article[]);
      setLoading(false);
    };

    run().catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [opts?.zoneSlug, opts?.tag]);

  return { articles, error, loading };
};

/** Single article by slug. */
export const useArticle = (slug: string | undefined) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from('articles')
      .select(BASE_SELECT)
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError(err.message);
        else setArticle((data as Article) || null);
        setLoading(false);
      }, () => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { article, error, loading };
};

/** Mark an article as read for the current user. Idempotent (UPSERT). */
export const markArticleRead = async (userId: string, articleId: string): Promise<void> => {
  await supabase
    .from('article_reads')
    .upsert({ user_id: userId, article_id: articleId, read_at: new Date().toISOString() });
};
