-- 2026-05-27 — knowledge base ("articles") for desk-worker education.
-- Per-zone editorial content (3-5 min reads): "Why your neck hurts at 5pm",
-- "20-20-20 explained", carpal tunnel signs, sciatica vs back pain, etc.
-- Localized via the same JSONB pattern as exercises/routines (see
-- 20260512_i18n_content.sql).

CREATE TABLE IF NOT EXISTS articles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  body_zone_id    uuid REFERENCES body_zones(id) ON DELETE SET NULL,
  -- Base (English) — always set, used as fallback when locale missing.
  title           text NOT NULL,
  excerpt         text NOT NULL,
  body_markdown   text NOT NULL,
  -- Localized variants (lookup via i18nField helper).
  title_i18n          jsonb NOT NULL DEFAULT '{}'::jsonb,
  excerpt_i18n        jsonb NOT NULL DEFAULT '{}'::jsonb,
  body_markdown_i18n  jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Editorial metadata.
  cover_image_url     text,
  reading_minutes     int  NOT NULL DEFAULT 3 CHECK (reading_minutes BETWEEN 1 AND 30),
  is_premium          boolean NOT NULL DEFAULT false,
  -- Free-text tags ("eye_strain", "posture", "ergonomics") — used to surface
  -- contextual articles from routine-detail / pain-checkin / search.
  tags                text[] NOT NULL DEFAULT '{}',
  sort_order          int NOT NULL DEFAULT 0,
  published_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_body_zone ON articles(body_zone_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING gin(tags);

-- Per-user "read" log — keeps user_progress out of articles table (clean RLS).
CREATE TABLE IF NOT EXISTS article_reads (
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id  uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);
CREATE INDEX IF NOT EXISTS idx_article_reads_user ON article_reads(user_id, read_at DESC);

-- RLS — articles are public-read for anon + auth. Writes via service_role only
-- (content team / admin scripts).
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY articles_public_read ON articles
  FOR SELECT TO anon, authenticated USING (published_at IS NOT NULL);

ALTER TABLE article_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY article_reads_owner_rw ON article_reads
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Trigger to bump updated_at on row update.
CREATE OR REPLACE FUNCTION touch_articles_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION touch_articles_updated_at();
