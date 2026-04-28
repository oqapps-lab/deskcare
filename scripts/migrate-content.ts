#!/usr/bin/env -S npx tsx
/**
 * migrate-content.ts
 *
 * One-shot script to copy DeskCare content tables from the legacy aiChatting
 * Supabase (anon-readable, content tables public) into a freshly-bootstrapped
 * dedicated DeskCare project. After this runs, the new project has all
 * 6 body_zones / 64 exercises / 77 M:N / 20 routines / 190 routine_exercises
 * / 2 programs / 3 phases — ready for app to switch over.
 *
 * Preserves UUIDs so any seeded foreign keys stay valid.
 *
 * Usage:
 *   OLD_SUPABASE_URL=https://rwgpvmnuuarhcnpgibtm.supabase.co \
 *   OLD_SUPABASE_ANON_KEY=eyJ... \
 *   NEW_SUPABASE_URL=https://<new>.supabase.co \
 *   NEW_SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   npx tsx scripts/migrate-content.ts
 *
 * Run AFTER the new project's migrations
 *   (20260428170000_deskcare_initial_schema.sql,
 *    20260428170100_deskcare_rls.sql,
 *    20260428170200_deskcare_rpc_and_buckets.sql)
 * have been applied. The script will fail-fast if a target table is missing
 * or if there's already data in `body_zones` (to avoid double-seeding).
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (k: string): string => {
  const v = process.env[k];
  if (!v) {
    console.error(`Missing env: ${k}`);
    process.exit(2);
  }
  return v;
};

interface Spec {
  table: string;
  // FK ordering — children after parents.
  // Use anon-readable; if RLS blocks, grant `content_public_read_*` policies first.
}

// Order matters — parents before children.
const TABLES: Spec[] = [
  { table: 'body_zones' },
  { table: 'exercises' },
  { table: 'exercise_body_zones' },
  { table: 'routines' },
  { table: 'routine_exercises' },
  { table: 'programs' },
  { table: 'program_phases' },
  { table: 'program_exercises' },
  { table: 'achievements' },
];

const copyTable = async (
  src: SupabaseClient,
  dst: SupabaseClient,
  spec: Spec,
): Promise<{ inserted: number; skipped: number }> => {
  // Pull every row from source.
  const { data, error } = await src.from(spec.table).select('*');
  if (error) {
    throw new Error(`read ${spec.table} failed: ${error.message}`);
  }
  if (!data || data.length === 0) {
    console.log(`  ${spec.table.padEnd(24)} 0 rows in source — skipping`);
    return { inserted: 0, skipped: 0 };
  }
  // Bulk insert into destination (split into chunks of 200 to be safe).
  let inserted = 0;
  for (let i = 0; i < data.length; i += 200) {
    const chunk = data.slice(i, i + 200);
    const { error: insErr } = await dst.from(spec.table).insert(chunk);
    if (insErr) {
      throw new Error(`insert ${spec.table} chunk ${i}: ${insErr.message}`);
    }
    inserted += chunk.length;
  }
  console.log(`  ${spec.table.padEnd(24)} ${inserted} rows copied`);
  return { inserted, skipped: 0 };
};

const main = async () => {
  const src = createClient(env('OLD_SUPABASE_URL'), env('OLD_SUPABASE_ANON_KEY'), {
    auth: { persistSession: false },
  });
  const dst = createClient(env('NEW_SUPABASE_URL'), env('NEW_SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });

  // Sanity check destination is empty.
  const { count: bzCount } = await dst.from('body_zones').select('*', { count: 'exact', head: true });
  if ((bzCount ?? 0) > 0) {
    console.error(`Destination already has ${bzCount} body_zones rows. Refusing to seed twice.`);
    console.error('TRUNCATE the destination tables manually if you really want to re-seed.');
    process.exit(1);
  }

  console.log('Migrating content from old → new project...\n');
  let total = 0;
  for (const spec of TABLES) {
    const { inserted } = await copyTable(src, dst, spec);
    total += inserted;
  }
  console.log(`\nDone. ${total} content rows migrated.`);
};

main().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
