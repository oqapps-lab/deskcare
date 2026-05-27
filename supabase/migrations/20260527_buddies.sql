-- 2026-05-27 — buddy system (soft accountability, no leaderboard).
-- Symmetric pair: when A invites B, accept_buddy_invite() inserts TWO rows
-- (one each direction) so the read path is a single eq() on user_id.

CREATE TABLE IF NOT EXISTS buddies (
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paired_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, buddy_user_id),
  CHECK (user_id <> buddy_user_id)
);
CREATE INDEX IF NOT EXISTS idx_buddies_user ON buddies(user_id);

CREATE TABLE IF NOT EXISTS buddy_invites (
  code        text PRIMARY KEY,             -- 6-char alphanumeric (uppercase)
  inviter_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_buddy_invites_inviter ON buddy_invites(inviter_id, expires_at);

ALTER TABLE buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_invites ENABLE ROW LEVEL SECURITY;

-- Owner-row-only access: a user reads / deletes only their own buddy edges.
CREATE POLICY buddies_self ON buddies FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Invites: inviter reads + creates; accept goes through RPC (security definer).
CREATE POLICY invites_inviter ON buddy_invites FOR SELECT TO authenticated
  USING (inviter_id = auth.uid());

-- RPC: create_buddy_invite — 6-char code, 7-day TTL.
CREATE OR REPLACE FUNCTION create_buddy_invite() RETURNS TABLE(code text, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_attempt int := 0;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- exclude I, O, 0, 1 (look-alikes)
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  LOOP
    v_code := '';
    FOR i IN 1..6 LOOP
      v_code := v_code || substr(v_chars, 1 + (random() * 31)::int, 1);
    END LOOP;
    BEGIN
      INSERT INTO buddy_invites (code, inviter_id) VALUES (v_code, v_user);
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      v_attempt := v_attempt + 1;
      IF v_attempt > 8 THEN
        RAISE EXCEPTION 'could not generate unique invite code';
      END IF;
    END;
  END LOOP;
  RETURN QUERY SELECT v_code, (now() + interval '7 days');
END;
$$;
GRANT EXECUTE ON FUNCTION create_buddy_invite() TO authenticated;

-- RPC: accept_buddy_invite — pair both users symmetrically.
CREATE OR REPLACE FUNCTION accept_buddy_invite(p_code text)
RETURNS TABLE(buddy_user_id uuid, display_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_inviter uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  SELECT inviter_id INTO v_inviter
    FROM buddy_invites
    WHERE code = upper(p_code) AND used_by IS NULL AND expires_at > now();
  IF v_inviter IS NULL THEN
    RAISE EXCEPTION 'invite not found, expired, or already used';
  END IF;
  IF v_inviter = v_user THEN
    RAISE EXCEPTION 'cannot accept your own invite';
  END IF;
  -- Pair both directions (ON CONFLICT is fine — already-paired is a no-op).
  INSERT INTO buddies (user_id, buddy_user_id) VALUES (v_user, v_inviter)
    ON CONFLICT DO NOTHING;
  INSERT INTO buddies (user_id, buddy_user_id) VALUES (v_inviter, v_user)
    ON CONFLICT DO NOTHING;
  UPDATE buddy_invites SET used_by = v_user, used_at = now() WHERE code = upper(p_code);
  RETURN QUERY
    SELECT v_inviter, COALESCE(p.display_name, 'Your buddy')
    FROM profiles p WHERE p.id = v_inviter;
END;
$$;
GRANT EXECUTE ON FUNCTION accept_buddy_invite(text) TO authenticated;

-- RPC: get_buddy_snapshot — buddy id + display name + streak (single round-trip).
CREATE OR REPLACE FUNCTION get_buddy_snapshot()
RETURNS TABLE(
  buddy_user_id uuid,
  display_name text,
  current_streak int,
  longest_streak int,
  last_activity_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT
      b.buddy_user_id,
      COALESCE(p.display_name, 'Your buddy'),
      COALESCE(s.current_streak, 0),
      COALESCE(s.longest_streak, 0),
      s.last_activity_date
    FROM buddies b
    LEFT JOIN profiles p ON p.id = b.buddy_user_id
    LEFT JOIN streaks  s ON s.user_id = b.buddy_user_id
    WHERE b.user_id = v_user
    ORDER BY b.paired_at DESC
    LIMIT 1;
END;
$$;
GRANT EXECUTE ON FUNCTION get_buddy_snapshot() TO authenticated;
