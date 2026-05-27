# Apply Sprint 1 migrations (manual)

Direct DB connection from this Mac doesn't resolve (Supabase host IPv6-only),
session-pooler hangs on TLS handshake mid-batch, Management API DB query
endpoint requires elevated PAT. So the cleanest path is dashboard SQL Editor.

## Steps (~2 min total)

1. Open https://supabase.com/dashboard/project/wnmjdxmrpmucfoluxhly/sql/new
2. Paste **`supabase/migrations/20260527_articles.sql`** → Run
3. Paste **`supabase/seeds/20260527_articles_initial.sql`** → Run
4. Paste **`supabase/migrations/20260527_achievements_rpc.sql`** → Run
5. Paste **`supabase/seeds/20260527_achievements_initial.sql`** → Run

Each `Run` should report `Success. No rows returned` (migrations) or
`Success. <N> rows affected` (seeds: 8 articles, 16 achievements).

## Verify

In the SQL Editor:
```sql
SELECT COUNT(*) FROM articles;          -- expect 8
SELECT COUNT(*) FROM achievements;      -- expect 16
SELECT proname FROM pg_proc WHERE proname = 'check_and_unlock_achievements';
                                        -- expect 1 row
```

## Rollback (only if needed)

```sql
DROP TABLE article_reads CASCADE;
DROP TABLE articles CASCADE;
DROP FUNCTION check_and_unlock_achievements(uuid);
DELETE FROM achievements WHERE slug LIKE 'streak_%' OR slug LIKE 'sessions_%'
  OR slug LIKE 'minutes_%' OR slug LIKE 'pain_logs_%'
  OR slug LIKE 'eye_breaks_%' OR slug = 'first_session';
```

Without these applied, the Knowledge tab + Achievements grid show empty
state and unlock celebration never fires — code degrades gracefully.
