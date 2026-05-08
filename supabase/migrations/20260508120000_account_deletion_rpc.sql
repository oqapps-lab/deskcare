-- ============================================================================
-- Account deletion RPC (App Store §5.1.1(v) compliance)
-- Apple requires every app with sign-up to expose an in-app delete-account
-- option. Exposes a single SECURITY DEFINER RPC that the authenticated user
-- can call. It cascades through every owned table and finally removes the
-- auth row.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  -- Explicit deletes for tables NOT covered by the auth.users CASCADE chain
  -- (defensive — every project-table has ON DELETE CASCADE, but we belt-
  -- and-braces it here for tables that might be added later without that
  -- constraint).
  DELETE FROM pain_entries           WHERE user_id = uid;
  DELETE FROM sessions               WHERE user_id = uid;
  DELETE FROM streaks                WHERE user_id = uid;
  DELETE FROM reminder_schedules     WHERE user_id = uid;
  DELETE FROM user_program_progress  WHERE user_id = uid;
  DELETE FROM deskcare_subscriptions WHERE user_id = uid;
  DELETE FROM user_settings          WHERE user_id = uid;
  DELETE FROM profiles               WHERE id      = uid;

  -- Finally, delete the auth user row. Invalidates every refresh token and
  -- effectively signs the user out across all devices.
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_account() TO authenticated;

COMMENT ON FUNCTION public.delete_account() IS
  'In-app account deletion. App Store 5.1.1(v) compliance. Cascades through all owned tables and removes the auth.users row. Authenticated callers only.';
