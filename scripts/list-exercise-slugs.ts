#!/usr/bin/env -S npx tsx
/**
 * list-exercise-slugs.ts
 *
 * Prints the current code → slug → title mapping from the exercises table.
 * Useful for verifying which filenames upload-exercise-videos.ts expects.
 *
 * Usage:
 *   SUPABASE_URL=https://...supabase.co \
 *   SUPABASE_ANON_KEY=eyJ... \
 *   npx tsx scripts/list-exercise-slugs.ts
 */
import { createClient } from '@supabase/supabase-js';

const env = (k: string): string => {
  const v = process.env[k];
  if (!v) {
    console.error(`Missing env: ${k}`);
    process.exit(2);
  }
  return v;
};

const main = async () => {
  // anon key is enough — exercises is anon-readable.
  const sb = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    auth: { persistSession: false },
  });
  const { data, error } = await sb
    .from('exercises')
    .select('code, slug, title')
    .order('code');
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log('code\tslug\ttitle');
  data!.forEach((r) => console.log(`${r.code}\t${r.slug}\t${r.title}`));
  console.log(`\n${data!.length} exercises.`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
