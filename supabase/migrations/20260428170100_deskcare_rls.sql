-- DeskCare RLS — public read for content, owner-only for user data.

ALTER TABLE body_zones                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_body_zones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_phases             ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements               ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE deskcare_subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_entries               ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_schedules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_program_progress      ENABLE ROW LEVEL SECURITY;

-- CONTENT TABLES — public read
CREATE POLICY "content_public_read_body_zones"          ON body_zones          FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content_public_read_exercises"           ON exercises           FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content_public_read_exercise_body_zones" ON exercise_body_zones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content_public_read_routines"            ON routines            FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content_public_read_routine_exercises"   ON routine_exercises   FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content_public_read_programs"            ON programs            FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content_public_read_program_phases"      ON program_phases      FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content_public_read_program_exercises"   ON program_exercises   FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content_public_read_achievements"        ON achievements        FOR SELECT TO anon, authenticated USING (true);

-- USER TABLES — owner only
CREATE POLICY "profiles_owner_read"    ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_owner_insert"  ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_owner_update"  ON profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "user_settings_owner_read"   ON user_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_settings_owner_insert" ON user_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_settings_owner_update" ON user_settings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "deskcare_subscriptions_owner_read" ON deskcare_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "sessions_owner_read"    ON sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "sessions_owner_insert"  ON sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "sessions_owner_update"  ON sessions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "sessions_owner_delete"  ON sessions FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "session_exercises_owner_read"   ON session_exercises FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_exercises.session_id AND s.user_id = auth.uid()));
CREATE POLICY "session_exercises_owner_write"  ON session_exercises FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_exercises.session_id AND s.user_id = auth.uid()));
CREATE POLICY "session_exercises_owner_update" ON session_exercises FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_exercises.session_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_exercises.session_id AND s.user_id = auth.uid()));

CREATE POLICY "streaks_owner_read"   ON streaks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "streaks_owner_insert" ON streaks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "streaks_owner_update" ON streaks FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_achievements_owner_read"   ON user_achievements FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_achievements_owner_insert" ON user_achievements FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "pain_entries_owner_read"   ON pain_entries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pain_entries_owner_insert" ON pain_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pain_entries_owner_update" ON pain_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "pain_entries_owner_delete" ON pain_entries FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "favorites_owner_read"   ON favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "favorites_owner_insert" ON favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "favorites_owner_delete" ON favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "reminder_schedules_owner_read"   ON reminder_schedules FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "reminder_schedules_owner_insert" ON reminder_schedules FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reminder_schedules_owner_update" ON reminder_schedules FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "reminder_schedules_owner_delete" ON reminder_schedules FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_program_progress_owner_read"   ON user_program_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_program_progress_owner_insert" ON user_program_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_program_progress_owner_update" ON user_program_progress FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
