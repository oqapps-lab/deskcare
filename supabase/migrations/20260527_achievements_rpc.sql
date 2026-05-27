-- 2026-05-27 — RPC to check and unlock achievements after a session.
-- Returns the newly-unlocked achievement slugs so the client can render
-- a celebration modal. Idempotent: re-run safely (ON CONFLICT DO NOTHING).
--
-- Criteria types:
--   'streak_days'      → streaks.current_streak >= criteria_value
--   'total_sessions'   → streaks.total_sessions >= criteria_value
--   'total_minutes'    → streaks.total_minutes  >= criteria_value
--   'first_session'    → streaks.total_sessions >= 1 (criteria_value = 1)
--   'pain_logs'        → COUNT(pain_entries by user) >= criteria_value
--   'eye_breaks'       → COUNT(sessions WHERE session_type='eye_break') >= value

CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id uuid)
RETURNS TABLE(slug text, title text, description text, icon_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak     integer := 0;
  v_sessions   integer := 0;
  v_minutes    integer := 0;
  v_pain_logs  integer := 0;
  v_eye_breaks integer := 0;
BEGIN
  -- Snapshot user stats.
  SELECT COALESCE(current_streak, 0), COALESCE(total_sessions, 0), COALESCE(total_minutes, 0)
    INTO v_streak, v_sessions, v_minutes
    FROM streaks
    WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_pain_logs FROM pain_entries WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_eye_breaks FROM sessions WHERE user_id = p_user_id AND session_type = 'eye_break';

  -- Insert newly-met achievements (idempotent via UNIQUE constraint).
  RETURN QUERY
  WITH newly_unlocked AS (
    INSERT INTO user_achievements (user_id, achievement_id)
      SELECT p_user_id, a.id
      FROM achievements a
      WHERE
        (a.criteria_type = 'streak_days'    AND v_streak     >= a.criteria_value)
     OR (a.criteria_type = 'total_sessions' AND v_sessions   >= a.criteria_value)
     OR (a.criteria_type = 'total_minutes'  AND v_minutes    >= a.criteria_value)
     OR (a.criteria_type = 'first_session'  AND v_sessions   >= 1)
     OR (a.criteria_type = 'pain_logs'      AND v_pain_logs  >= a.criteria_value)
     OR (a.criteria_type = 'eye_breaks'     AND v_eye_breaks >= a.criteria_value)
    ON CONFLICT (user_id, achievement_id) DO NOTHING
    RETURNING achievement_id
  )
  SELECT a.slug, a.title, a.description, a.icon_url
    FROM newly_unlocked nu
    JOIN achievements a ON a.id = nu.achievement_id
    ORDER BY a.sort_order;
END;
$$;

GRANT EXECUTE ON FUNCTION check_and_unlock_achievements(uuid) TO authenticated;
