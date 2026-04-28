-- DeskCare initial schema (per docs/05-database/DATABASE-SCHEMA.md, with Russell's atom×reps model)
-- All tables in `public` schema. Re-runnable via `apply_migration`.

-- ============================
-- CONTENT TABLES
-- ============================

CREATE TABLE body_zones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  icon_url    text,
  sort_order  smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_body_zones_slug ON body_zones(slug);

CREATE TABLE exercises (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code              text NOT NULL UNIQUE,
  slug              text NOT NULL UNIQUE,
  title             text NOT NULL,
  title_en          text,
  description       text,
  video_url         text,
  thumbnail_url     text,
  duration_seconds  smallint NOT NULL DEFAULT 5 CHECK (duration_seconds > 0 AND duration_seconds <= 60),
  reps_inside_atom  text,
  difficulty        smallint NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  exercise_type     text NOT NULL DEFAULT 'stretch' CHECK (exercise_type IN ('stretch','mobility','strength','nerve_glide','tendon_glide','breathing')),
  is_premium        boolean NOT NULL DEFAULT false,
  target_muscles    text[],
  contraindications text[],
  cautions          text,
  modifications     text,
  audio_url         text,
  sort_order        smallint NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_exercises_code ON exercises(code);
CREATE INDEX idx_exercises_slug ON exercises(slug);
CREATE INDEX idx_exercises_type ON exercises(exercise_type);
CREATE INDEX idx_exercises_is_premium ON exercises(is_premium);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);

CREATE TABLE exercise_body_zones (
  exercise_id  uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  body_zone_id uuid NOT NULL REFERENCES body_zones(id) ON DELETE CASCADE,
  is_primary   boolean NOT NULL DEFAULT false,
  PRIMARY KEY (exercise_id, body_zone_id)
);
CREATE INDEX idx_exercise_body_zones_zone ON exercise_body_zones(body_zone_id);

CREATE TABLE routines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE,
  title             text NOT NULL,
  description       text,
  body_zone_id      uuid NOT NULL REFERENCES body_zones(id),
  duration_seconds  smallint NOT NULL DEFAULT 180 CHECK (duration_seconds > 0),
  is_premium        boolean NOT NULL DEFAULT false,
  routine_type      text NOT NULL DEFAULT 'zone_based' CHECK (routine_type IN ('zone_based','morning','evening','quick_relief')),
  sort_order        smallint NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_routines_slug ON routines(slug);
CREATE INDEX idx_routines_body_zone ON routines(body_zone_id);
CREATE INDEX idx_routines_type ON routines(routine_type);

CREATE TABLE routine_exercises (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id    uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id   uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sort_order    smallint NOT NULL DEFAULT 0,
  reps          smallint NOT NULL DEFAULT 1 CHECK (reps > 0 AND reps <= 20),
  overlay_text  text,
  rest_seconds  smallint NOT NULL DEFAULT 0 CHECK (rest_seconds >= 0 AND rest_seconds <= 30),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (routine_id, sort_order)
);
CREATE INDEX idx_routine_exercises_routine ON routine_exercises(routine_id, sort_order);

CREATE TABLE programs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  description     text,
  thumbnail_url   text,
  duration_weeks  smallint,
  is_premium      boolean NOT NULL DEFAULT false,
  disclaimer      text,
  sort_order      smallint NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_programs_slug ON programs(slug);

CREATE TABLE program_phases (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id   uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  phase_type   text NOT NULL DEFAULT 'gentle' CHECK (phase_type IN ('gentle','progressive')),
  sort_order   smallint NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, sort_order)
);
CREATE INDEX idx_program_phases_program ON program_phases(program_id);

CREATE TABLE program_exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id     uuid NOT NULL REFERENCES program_phases(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  day_number   smallint NOT NULL DEFAULT 1,
  sort_order   smallint NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (phase_id, day_number, sort_order)
);
CREATE INDEX idx_program_exercises_phase ON program_exercises(phase_id);
CREATE INDEX idx_program_exercises_day ON program_exercises(phase_id, day_number);

CREATE TABLE achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  description     text,
  icon_url        text,
  criteria_type   text NOT NULL,
  criteria_value  integer NOT NULL,
  sort_order      smallint NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_achievements_slug ON achievements(slug);

-- ============================
-- USER TABLES
-- ============================

CREATE TABLE profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name          text,
  avatar_url            text,
  onboarding_completed  boolean NOT NULL DEFAULT false,
  onboarding_data       jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

CREATE TABLE user_settings (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme                  text NOT NULL DEFAULT 'system' CHECK (theme IN ('light','dark','system')),
  language               text NOT NULL DEFAULT 'en',
  audio_enabled          boolean NOT NULL DEFAULT true,
  haptics_enabled        boolean NOT NULL DEFAULT true,
  notifications_enabled  boolean NOT NULL DEFAULT true,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE deskcare_subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  adapty_profile_id        text,
  status                   text NOT NULL DEFAULT 'free' CHECK (status IN ('free','trialing','active','expired','cancelled','paused','billing_issue')),
  plan                     text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro_monthly','pro_annual','sciatica_addon','lifetime')),
  is_active                boolean NOT NULL DEFAULT false,
  store                    text CHECK (store IN ('app_store','play_store') OR store IS NULL),
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  trial_start              timestamptz,
  trial_end                timestamptz,
  cancellation_reason      text,
  original_transaction_id  text,
  raw_data                 jsonb,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_deskcare_subscriptions_adapty ON deskcare_subscriptions(adapty_profile_id);
CREATE INDEX idx_deskcare_subscriptions_status ON deskcare_subscriptions(status);
CREATE INDEX idx_deskcare_subscriptions_is_active ON deskcare_subscriptions(is_active);

CREATE TABLE sessions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type          text NOT NULL DEFAULT 'routine' CHECK (session_type IN ('routine','single','eye_break','program')),
  routine_id            uuid REFERENCES routines(id),
  program_phase_id      uuid REFERENCES program_phases(id),
  body_zone_id          uuid REFERENCES body_zones(id),
  started_at            timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  duration_seconds      smallint NOT NULL DEFAULT 0,
  exercises_total       smallint NOT NULL DEFAULT 0,
  exercises_completed   smallint NOT NULL DEFAULT 0,
  exercises_skipped     smallint NOT NULL DEFAULT 0,
  deleted_at            timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_type ON sessions(session_type);
CREATE INDEX idx_sessions_completed ON sessions(user_id, completed_at) WHERE completed_at IS NOT NULL;

CREATE TABLE session_exercises (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id   uuid NOT NULL REFERENCES exercises(id),
  sort_order    smallint NOT NULL DEFAULT 0,
  started_at    timestamptz,
  completed_at  timestamptz,
  was_skipped   boolean NOT NULL DEFAULT false,
  was_repeated  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);

CREATE TABLE streaks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak      integer NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak      integer NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date  date,
  grace_day_used      boolean NOT NULL DEFAULT false,
  grace_day_date      date,
  total_sessions      integer NOT NULL DEFAULT 0,
  total_minutes       integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id  uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

CREATE TABLE pain_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body_zone_id    uuid NOT NULL REFERENCES body_zones(id),
  pain_level      smallint NOT NULL CHECK (pain_level BETWEEN 1 AND 10),
  notes           text,
  recorded_date   date NOT NULL DEFAULT CURRENT_DATE,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, body_zone_id, recorded_date)
);
CREATE INDEX idx_pain_entries_user_date ON pain_entries(user_id, recorded_date DESC);
CREATE INDEX idx_pain_entries_zone ON pain_entries(user_id, body_zone_id, recorded_date DESC);

CREATE TABLE favorites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, exercise_id)
);
CREATE INDEX idx_favorites_user ON favorites(user_id);

CREATE TABLE reminder_schedules (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type     text NOT NULL DEFAULT 'stretch' CHECK (reminder_type IN ('stretch','eye')),
  start_time        time NOT NULL DEFAULT '09:00',
  end_time          time NOT NULL DEFAULT '18:00',
  interval_minutes  smallint NOT NULL DEFAULT 60 CHECK (interval_minutes > 0),
  days_of_week      smallint[] NOT NULL DEFAULT '{1,2,3,4,5}',
  tone              text NOT NULL DEFAULT 'neutral' CHECK (tone IN ('soft','neutral','motivating')),
  is_active         boolean NOT NULL DEFAULT true,
  dnd_start         time,
  dnd_end           time,
  deleted_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reminder_schedules_user_type_uq UNIQUE (user_id, reminder_type)
);
CREATE INDEX idx_reminder_schedules_user ON reminder_schedules(user_id);
CREATE INDEX idx_reminder_schedules_active ON reminder_schedules(user_id, is_active) WHERE is_active = true;

CREATE TABLE user_program_progress (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id          uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  current_phase_id    uuid REFERENCES program_phases(id),
  current_day         smallint NOT NULL DEFAULT 1 CHECK (current_day > 0),
  status              text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  last_symptom_check  jsonb,
  started_at          timestamptz NOT NULL DEFAULT now(),
  last_session_at     timestamptz,
  completed_at        timestamptz,
  deleted_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, program_id)
);
CREATE INDEX idx_user_program_progress_program ON user_program_progress(user_id, program_id);

-- ============================
-- updated_at TRIGGER
-- ============================

CREATE OR REPLACE FUNCTION dc_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'body_zones','exercises','routines','programs','program_phases',
    'profiles','user_settings','deskcare_subscriptions',
    'sessions','streaks','pain_entries','reminder_schedules','user_program_progress'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION dc_set_updated_at()',
      t, t
    );
  END LOOP;
END$$;

-- ============================
-- handle_new_user TRIGGER (auto-create profile + streak + free subscription)
-- ============================

CREATE OR REPLACE FUNCTION dc_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO user_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO streaks (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO deskcare_subscriptions (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_deskcare
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION dc_handle_new_user();
