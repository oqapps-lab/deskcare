-- 2026-05-12 — add per-locale JSONB columns for translatable content.
-- Schema: { "de-DE": "Translated", "ja": "翻訳", ... }
-- Lookup pattern in RN: i18nField(row, 'title') reads title_i18n[locale] ?? title_en ?? title.

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS title_i18n       jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE routines
  ADD COLUMN IF NOT EXISTS title_i18n       jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Optional indexes — only worthwhile if filter/sort by translated text becomes a hot path.
-- CREATE INDEX IF NOT EXISTS idx_exercises_title_i18n ON exercises USING gin (title_i18n);
