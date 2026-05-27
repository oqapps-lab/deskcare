# Apply Sprint 4 migration (manual)

## Step

Open https://supabase.com/dashboard/project/wnmjdxmrpmucfoluxhly/sql/new
and paste **`supabase/migrations/20260527_buddies.sql`** → Run.

This creates: `buddies` table + `buddy_invites` table + 3 RPC functions
(`create_buddy_invite`, `accept_buddy_invite`, `get_buddy_snapshot`).

## Verify

```sql
SELECT proname FROM pg_proc WHERE proname IN
  ('create_buddy_invite', 'accept_buddy_invite', 'get_buddy_snapshot');
-- expect 3 rows
```

Without this applied, the Buddy screen shows the unpaired state forever
(RPC fails silently → useBuddy returns null).
