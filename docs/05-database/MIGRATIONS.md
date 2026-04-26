# DeskCare — SQL Migrations

**Дата:** 13 апреля 2026
**Основа:** [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md), [RLS-POLICIES.md](./RLS-POLICIES.md)
**Среда:** Supabase (PostgreSQL 15+)
**Порядок:** Выполнять миграции строго последовательно (001 → 006).

---

## Миграция 001: Базовые таблицы и триггеры

```sql
-- 001_base_tables.sql
-- Profiles, user_settings + auto-create trigger

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- PROFILES
-- ===================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  onboarding_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
  ON public.profiles (onboarding_completed);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);

  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================
-- USER_SETTINGS
-- ===================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'system'
    CHECK (theme IN ('light', 'dark', 'system')),
  language text NOT NULL DEFAULT 'en',
  audio_enabled boolean NOT NULL DEFAULT true,
  haptics_enabled boolean NOT NULL DEFAULT true,
  notifications_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_settings_user_unique UNIQUE (user_id)
);

CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================
-- STREAKS
-- ===================
CREATE TABLE IF NOT EXISTS public.streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0
    CHECK (current_streak >= 0),
  longest_streak integer NOT NULL DEFAULT 0
    CHECK (longest_streak >= 0),
  last_activity_date date,
  grace_day_used boolean NOT NULL DEFAULT false,
  grace_day_date date,
  total_sessions integer NOT NULL DEFAULT 0,
  total_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT streaks_user_unique UNIQUE (user_id)
);

CREATE TRIGGER set_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## Миграция 002: Контентные таблицы

```sql
-- 002_content_tables.sql
-- body_zones, exercises, exercise_body_zones, routines, routine_exercises

-- ===================
-- BODY_ZONES
-- ===================
CREATE TABLE IF NOT EXISTS public.body_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  icon_url text,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_body_zones_slug
  ON public.body_zones (slug);

CREATE TRIGGER set_body_zones_updated_at
  BEFORE UPDATE ON public.body_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed данные
INSERT INTO public.body_zones (slug, name, sort_order) VALUES
  ('neck', 'Neck', 1),
  ('back', 'Back & Lower Back', 2),
  ('eyes', 'Eyes', 3),
  ('wrists', 'Wrists', 4),
  ('full_body', 'Full Body', 5)
ON CONFLICT (slug) DO NOTHING;

-- ===================
-- EXERCISES
-- ===================
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  video_url text,
  thumbnail_url text,
  duration_seconds smallint NOT NULL DEFAULT 60
    CHECK (duration_seconds > 0),
  difficulty text NOT NULL DEFAULT 'easy'
    CHECK (difficulty IN ('easy', 'medium')),
  exercise_type text NOT NULL DEFAULT 'stretch'
    CHECK (exercise_type IN ('stretch', 'eye', 'nerve_glide', 'tendon_glide')),
  is_premium boolean NOT NULL DEFAULT false,
  target_muscles text[],
  contraindications text[],
  modifications text,
  audio_url text,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercises_slug ON public.exercises (slug);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON public.exercises (exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercises_is_premium ON public.exercises (is_premium);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON public.exercises (difficulty);

CREATE TRIGGER set_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================
-- EXERCISE_BODY_ZONES (M:N)
-- ===================
CREATE TABLE IF NOT EXISTS public.exercise_body_zones (
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  body_zone_id uuid NOT NULL REFERENCES public.body_zones(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, body_zone_id)
);

CREATE INDEX IF NOT EXISTS idx_exercise_body_zones_zone
  ON public.exercise_body_zones (body_zone_id);

-- ===================
-- ROUTINES
-- ===================
CREATE TABLE IF NOT EXISTS public.routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  body_zone_id uuid NOT NULL REFERENCES public.body_zones(id),
  duration_seconds smallint NOT NULL DEFAULT 180
    CHECK (duration_seconds > 0),
  is_premium boolean NOT NULL DEFAULT false,
  routine_type text NOT NULL DEFAULT 'zone_based'
    CHECK (routine_type IN ('zone_based', 'morning', 'evening', 'quick_relief')),
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routines_slug ON public.routines (slug);
CREATE INDEX IF NOT EXISTS idx_routines_body_zone ON public.routines (body_zone_id);
CREATE INDEX IF NOT EXISTS idx_routines_type ON public.routines (routine_type);

CREATE TRIGGER set_routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================
-- ROUTINE_EXERCISES
-- ===================
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT routine_exercises_order_unique UNIQUE (routine_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine
  ON public.routine_exercises (routine_id);
```

---

## Миграция 003: Программы

```sql
-- 003_programs.sql
-- programs, program_phases, program_exercises

-- ===================
-- PROGRAMS
-- ===================
CREATE TABLE IF NOT EXISTS public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  duration_weeks smallint,
  is_premium boolean NOT NULL DEFAULT false,
  disclaimer text,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_programs_slug ON public.programs (slug);

CREATE TRIGGER set_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed: программы MVP
INSERT INTO public.programs (slug, title, description, is_premium, disclaimer, sort_order) VALUES
  ('sciatica', 'Sciatica Relief Program',
   'Structured desk-friendly exercises for sciatica relief with acute and maintenance phases.',
   true,
   'This program does not replace medical consultation. If you experience severe symptoms (loss of bladder/bowel control, progressive weakness), seek immediate medical attention.',
   1),
  ('eye_program', 'Eye Care Program',
   '20-20-20 rule timer and eye yoga exercises to reduce digital eye strain.',
   false, NULL, 2)
ON CONFLICT (slug) DO NOTHING;

-- ===================
-- PROGRAM_PHASES
-- ===================
CREATE TABLE IF NOT EXISTS public.program_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  phase_type text NOT NULL DEFAULT 'gentle'
    CHECK (phase_type IN ('gentle', 'progressive')),
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT program_phases_order_unique UNIQUE (program_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_program_phases_program
  ON public.program_phases (program_id);

CREATE TRIGGER set_program_phases_updated_at
  BEFORE UPDATE ON public.program_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================
-- PROGRAM_EXERCISES
-- ===================
CREATE TABLE IF NOT EXISTS public.program_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES public.program_phases(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  day_number smallint NOT NULL DEFAULT 1,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT program_exercises_order_unique UNIQUE (phase_id, day_number, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_program_exercises_phase
  ON public.program_exercises (phase_id);
CREATE INDEX IF NOT EXISTS idx_program_exercises_day
  ON public.program_exercises (phase_id, day_number);
```

---

## Миграция 004: Подписки

```sql
-- 004_subscriptions.sql

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  adapty_profile_id text,
  status text NOT NULL DEFAULT 'free'
    CHECK (status IN ('free', 'trialing', 'active', 'expired', 'cancelled', 'paused', 'billing_issue')),
  plan text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro_monthly', 'pro_annual', 'sciatica_addon', 'lifetime')),
  is_active boolean NOT NULL DEFAULT false,
  store text CHECK (store IN ('app_store', 'play_store') OR store IS NULL),
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  cancellation_reason text,
  original_transaction_id text,
  raw_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_adapty
  ON public.subscriptions (adapty_profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active
  ON public.subscriptions (is_active);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Вспомогательная функция для RLS (проверка подписки)
CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid()
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## Миграция 005: Пользовательская активность

```sql
-- 005_user_activity.sql
-- sessions, session_exercises, user_achievements, pain_entries,
-- favorites, reminder_schedules, user_program_progress, achievements

-- ===================
-- ACHIEVEMENTS (справочник)
-- ===================
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  icon_url text,
  criteria_type text NOT NULL,
  criteria_value integer NOT NULL,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_achievements_slug ON public.achievements (slug);

-- Seed: бейджи MVP
INSERT INTO public.achievements (slug, title, description, criteria_type, criteria_value, sort_order) VALUES
  ('first_session', 'First Step', 'Complete your first exercise session', 'total_sessions', 1, 1),
  ('streak_3', '3-Day Streak', 'Exercise 3 days in a row', 'streak_days', 3, 2),
  ('streak_7', 'Week Warrior', 'Exercise 7 days in a row', 'streak_days', 7, 3),
  ('streak_14', 'Two-Week Champion', 'Exercise 14 days in a row', 'streak_days', 14, 4),
  ('streak_30', 'Monthly Master', 'Exercise 30 days in a row', 'streak_days', 30, 5),
  ('neck_10', 'Neck Relief Pro', 'Complete 10 neck sessions', 'zone_sessions', 10, 6),
  ('back_10', 'Back Care Expert', 'Complete 10 back sessions', 'zone_sessions', 10, 7),
  ('eye_20', 'Eye Guardian', 'Complete 20 eye exercises', 'zone_sessions', 20, 8),
  ('pain_tracker_7', 'Pain Diary', 'Log pain for 7 days', 'pain_logs', 7, 9),
  ('total_50', 'Half Century', 'Complete 50 exercise sessions', 'total_sessions', 50, 10)
ON CONFLICT (slug) DO NOTHING;

-- ===================
-- SESSIONS
-- ===================
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL DEFAULT 'routine'
    CHECK (session_type IN ('routine', 'single', 'eye_break', 'program')),
  routine_id uuid REFERENCES public.routines(id),
  program_phase_id uuid REFERENCES public.program_phases(id),
  body_zone_id uuid REFERENCES public.body_zones(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_seconds smallint NOT NULL DEFAULT 0,
  exercises_total smallint NOT NULL DEFAULT 0,
  exercises_completed smallint NOT NULL DEFAULT 0,
  exercises_skipped smallint NOT NULL DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON public.sessions (session_type);
CREATE INDEX IF NOT EXISTS idx_sessions_completed
  ON public.sessions (user_id, completed_at)
  WHERE completed_at IS NOT NULL;

CREATE TRIGGER set_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================
-- SESSION_EXERCISES
-- ===================
CREATE TABLE IF NOT EXISTS public.session_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id),
  sort_order smallint NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  was_skipped boolean NOT NULL DEFAULT false,
  was_repeated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_exercises_session
  ON public.session_exercises (session_id);

-- ===================
-- USER_ACHIEVEMENTS
-- ===================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_achievements_unique UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user
  ON public.user_achievements (user_id);

-- ===================
-- PAIN_ENTRIES
-- ===================
CREATE TABLE IF NOT EXISTS public.pain_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body_zone_id uuid NOT NULL REFERENCES public.body_zones(id),
  pain_level smallint NOT NULL CHECK (pain_level BETWEEN 1 AND 10),
  notes text,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pain_entries_daily_unique UNIQUE (user_id, body_zone_id, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_pain_entries_user ON public.pain_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_pain_entries_user_date
  ON public.pain_entries (user_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_pain_entries_zone
  ON public.pain_entries (user_id, body_zone_id, recorded_date DESC);

CREATE TRIGGER set_pain_entries_updated_at
  BEFORE UPDATE ON public.pain_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================
-- FAVORITES
-- ===================
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favorites_unique UNIQUE (user_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites (user_id);

-- ===================
-- REMINDER_SCHEDULES
-- ===================
CREATE TABLE IF NOT EXISTS public.reminder_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type text NOT NULL DEFAULT 'stretch'
    CHECK (reminder_type IN ('stretch', 'eye')),
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '18:00',
  interval_minutes smallint NOT NULL DEFAULT 60
    CHECK (interval_minutes > 0),
  days_of_week smallint[] NOT NULL DEFAULT '{1,2,3,4,5}',
  tone text NOT NULL DEFAULT 'neutral'
    CHECK (tone IN ('soft', 'neutral', 'motivating')),
  is_active boolean NOT NULL DEFAULT true,
  dnd_start time,
  dnd_end time,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminder_schedules_user
  ON public.reminder_schedules (user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_schedules_active
  ON public.reminder_schedules (user_id, is_active)
  WHERE is_active = true;

CREATE TRIGGER set_reminder_schedules_updated_at
  BEFORE UPDATE ON public.reminder_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================
-- USER_PROGRAM_PROGRESS
-- ===================
CREATE TABLE IF NOT EXISTS public.user_program_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  current_phase_id uuid REFERENCES public.program_phases(id),
  current_day smallint NOT NULL DEFAULT 1
    CHECK (current_day > 0),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed')),
  last_symptom_check jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_session_at timestamptz,
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_program_progress_unique UNIQUE (user_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_user_program_progress_user
  ON public.user_program_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_program_progress_program
  ON public.user_program_progress (user_id, program_id);

CREATE TRIGGER set_user_program_progress_updated_at
  BEFORE UPDATE ON public.user_program_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## Миграция 006: RLS Policies

```sql
-- 006_rls_policies.sql
-- Включение RLS и создание политик для всех таблиц

-- ===================
-- CONTENT TABLES — публичное чтение
-- ===================

ALTER TABLE public.body_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read body zones"
  ON public.body_zones FOR SELECT USING (true);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read free exercises"
  ON public.exercises FOR SELECT
  USING (is_premium = false OR public.has_active_subscription());

ALTER TABLE public.exercise_body_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read exercise-zone mappings"
  ON public.exercise_body_zones FOR SELECT USING (true);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read free routines"
  ON public.routines FOR SELECT
  USING (is_premium = false OR public.has_active_subscription());

ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read routine exercises"
  ON public.routine_exercises FOR SELECT USING (true);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read programs"
  ON public.programs FOR SELECT USING (true);

ALTER TABLE public.program_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read program phases"
  ON public.program_phases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_phases.program_id
      AND (p.is_premium = false OR public.has_active_subscription())
    )
  );

ALTER TABLE public.program_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read program exercises"
  ON public.program_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.program_phases ph
      JOIN public.programs p ON p.id = ph.program_id
      WHERE ph.id = program_exercises.phase_id
      AND (p.is_premium = false OR public.has_active_subscription())
    )
  );

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read achievements"
  ON public.achievements FOR SELECT USING (true);

-- ===================
-- PROFILES
-- ===================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ===================
-- USER_SETTINGS
-- ===================

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings"
  ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===================
-- SUBSCRIPTIONS
-- ===================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- INSERT/UPDATE — only via service role (Adapty webhook Edge Function)

-- ===================
-- SESSIONS
-- ===================

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own sessions"
  ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===================
-- SESSION_EXERCISES
-- ===================

ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session exercises"
  ON public.session_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_exercises.session_id
      AND s.user_id = auth.uid() AND s.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can create own session exercises"
  ON public.session_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_exercises.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own session exercises"
  ON public.session_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_exercises.session_id
      AND s.user_id = auth.uid()
    )
  );

-- ===================
-- STREAKS
-- ===================

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON public.streaks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own streak"
  ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===================
-- USER_ACHIEVEMENTS
-- ===================

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements"
  ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================
-- PAIN_ENTRIES
-- ===================

ALTER TABLE public.pain_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pain entries"
  ON public.pain_entries FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own pain entries"
  ON public.pain_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pain entries"
  ON public.pain_entries FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===================
-- FAVORITES
-- ===================

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ===================
-- REMINDER_SCHEDULES
-- ===================

ALTER TABLE public.reminder_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON public.reminder_schedules FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own reminders"
  ON public.reminder_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.reminder_schedules FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===================
-- USER_PROGRAM_PROGRESS
-- ===================

ALTER TABLE public.user_program_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own program progress"
  ON public.user_program_progress FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can start programs"
  ON public.user_program_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own program progress"
  ON public.user_program_progress FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## Порядок выполнения

| # | Файл | Зависимости | Что создаёт |
|---|------|-------------|------------|
| 1 | 001_base_tables.sql | auth.users | profiles, user_settings, streaks + triggers |
| 2 | 002_content_tables.sql | — | body_zones, exercises, exercise_body_zones, routines, routine_exercises + seed |
| 3 | 003_programs.sql | body_zones, exercises | programs, program_phases, program_exercises + seed |
| 4 | 004_subscriptions.sql | auth.users | subscriptions + has_active_subscription() |
| 5 | 005_user_activity.sql | все предыдущие | sessions, session_exercises, achievements, user_achievements, pain_entries, favorites, reminder_schedules, user_program_progress + seed |
| 6 | 006_rls_policies.sql | все таблицы | RLS + все политики |

**Важно:**
- Все миграции идемпотентны (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
- `handle_new_user()` в миграции 001 зависит от таблиц `user_settings`, `streaks`, `subscriptions` — при первом запуске эти таблицы ещё не существуют. В production запускать все миграции в одной транзакции, либо создать trigger после всех таблиц
- Для production: разнести создание trigger `on_auth_user_created` в отдельную миграцию после 004

---

## 007_log_completed_session.sql (Stage 7 prep)

`SECURITY DEFINER` RPC. Заменяет клиентский read-modify-write streak-update в
`app/exercise/complete.tsx` — гонок при двух одновременных завершениях больше
нет, всё одной транзакцией.

Контракт:
- input: `p_session_type`, `p_duration_sec`, `p_exercises_total`, `p_exercises_completed`, `p_exercises_skipped`
- output: снимок `streaks` после апдейта (current/longest/last_activity_date/total_sessions/total_minutes)
- raises if `auth.uid() is null` (анонимный вызов запрещён)

Логика стрика:
- never active before → streak = 1
- last = today → streak держится (но `total_sessions` всё равно +1)
- last = today − 1 → streak +1
- last < today − 1 → streak = 1 (gap reset)

Проверено rollback-сессией на 4 ветках: new user / same-day repeat / day cross /
3-day gap. Все ветки сошлись.

```sql
create or replace function public.log_completed_session(
  p_session_type   text,
  p_duration_sec   integer,
  p_exercises_total integer,
  p_exercises_completed integer,
  p_exercises_skipped integer default 0
) returns table (
  o_current_streak integer,
  o_longest_streak integer,
  o_last_activity_date date,
  o_total_sessions   integer,
  o_total_minutes    integer
) language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_today   date := (now() at time zone 'utc')::date;
  v_minutes integer := greatest(0, round(p_duration_sec / 60.0));
  v_started timestamptz := now() - make_interval(secs => p_duration_sec);
begin
  if v_user_id is null then
    raise exception 'log_completed_session: anonymous calls not allowed';
  end if;

  insert into public.sessions (
    user_id, session_type, started_at, completed_at, duration_seconds,
    exercises_total, exercises_completed, exercises_skipped
  ) values (
    v_user_id, p_session_type, v_started, now(), p_duration_sec,
    p_exercises_total, p_exercises_completed, p_exercises_skipped
  );

  return query
  with prev as (
    select s.current_streak as p_curr, s.longest_streak as p_long,
           s.last_activity_date as p_last, s.total_sessions as p_sessions,
           s.total_minutes as p_minutes
    from public.streaks s where s.user_id = v_user_id for update
  ),
  next_streak as (
    select case
      when (select p_last from prev) is null then 1
      when (select p_last from prev) = v_today then (select p_curr from prev)
      when (select p_last from prev) = v_today - 1 then (select p_curr from prev) + 1
      else 1
    end::integer as ns
  ),
  upsert as (
    insert into public.streaks (
      user_id, current_streak, longest_streak, last_activity_date,
      total_sessions, total_minutes
    )
    values (
      v_user_id,
      coalesce((select ns from next_streak), 1),
      coalesce((select ns from next_streak), 1),
      v_today, 1, v_minutes
    )
    on conflict (user_id) do update set
      current_streak     = (select ns from next_streak),
      longest_streak     = greatest(public.streaks.longest_streak, (select ns from next_streak)),
      last_activity_date = v_today,
      total_sessions     = public.streaks.total_sessions + 1,
      total_minutes      = public.streaks.total_minutes + v_minutes,
      updated_at         = now()
    returning streaks.current_streak, streaks.longest_streak,
              streaks.last_activity_date, streaks.total_sessions, streaks.total_minutes
  )
  select * from upsert;
end;
$$;

revoke all on function public.log_completed_session(text, integer, integer, integer, integer) from public;
grant execute on function public.log_completed_session(text, integer, integer, integer, integer) to authenticated;
```

---

## 008_reminder_schedules_unique_user_type.sql (Stage 7 prep)

`app/settings/notifications.tsx` использует `upsert(..., { onConflict:
'user_id,reminder_type' })` для одной строки на тип напоминания на юзера.
Без unique constraint upsert падал.

```sql
alter table public.reminder_schedules
  add constraint reminder_schedules_user_type_uq unique (user_id, reminder_type);
```

---

## Источники

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) — структура таблиц
- [RLS-POLICIES.md](./RLS-POLICIES.md) — политики безопасности
