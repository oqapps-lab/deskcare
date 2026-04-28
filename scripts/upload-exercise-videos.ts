#!/usr/bin/env -S npx tsx
/**
 * upload-exercise-videos.ts
 *
 * Walks a local directory of exercise videos (and optional thumbnails),
 * uploads each to the matching Supabase Storage bucket, and updates
 * exercises.video_url / thumbnail_url for the matching slug.
 *
 * Filename convention (case-insensitive). The stem is matched against
 * either `exercises.slug` OR `exercises.code` — whichever hits first:
 *   <slug>.mp4 / <code>.mp4          → exercise-videos/<slug>/video.mp4
 *   <slug>.mov / <code>.mov          → exercise-videos/<slug>/video.mov
 *   <slug>.jpg|png|webp              → exercise-thumbnails/<slug>/thumb.<ext>
 *
 * Cross-reference codes (B12-B14, F11-F15, S12) that don't have their own
 * row in `exercises` (they're M:N links to other atoms) are skipped — the
 * underlying atom is uploaded under its primary code, so the cross-ref
 * file is a dupe.
 *
 * Slugs / codes come from the exercises table — see the printed mapping
 * in docs/07-development/VIDEO-UPLOAD.md, or run `npm run video:list-slugs`.
 *
 * Usage:
 *   SUPABASE_URL=https://...supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   npx tsx scripts/upload-exercise-videos.ts ./videos
 *
 * Flags:
 *   --dry-run     parse files + print plan, don't upload anything
 *   --no-update   upload files but skip the exercises table update
 *   --only=<slug> upload only a specific slug (comma-separate for multiple)
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createClient } from '@supabase/supabase-js';

interface Args {
  dir: string;
  dryRun: boolean;
  noUpdate: boolean;
  only: Set<string> | null;
}

const VIDEO_EXTS = new Set(['.mp4', '.mov']);
const THUMB_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const parseArgs = (): Args => {
  const argv = process.argv.slice(2);
  let dir = '';
  let dryRun = false;
  let noUpdate = false;
  let only: Set<string> | null = null;
  for (const a of argv) {
    if (a === '--dry-run') dryRun = true;
    else if (a === '--no-update') noUpdate = true;
    else if (a.startsWith('--only=')) only = new Set(a.slice(7).split(',').map((s) => s.trim()).filter(Boolean));
    else if (!a.startsWith('--') && !dir) dir = path.resolve(a);
  }
  if (!dir) {
    console.error('Usage: upload-exercise-videos.ts <dir> [--dry-run] [--no-update] [--only=slug1,slug2]');
    process.exit(2);
  }
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Not a directory: ${dir}`);
    process.exit(2);
  }
  return { dir, dryRun, noUpdate, only };
};

const env = (k: string): string => {
  const v = process.env[k];
  if (!v) {
    console.error(`Missing env: ${k}`);
    process.exit(2);
  }
  return v;
};

const main = async () => {
  const args = parseArgs();
  const url = env('SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const sb = createClient(url, key, { auth: { persistSession: false } });

  // 1. Pull current slug list from DB so we can validate filenames.
  const { data: exercises, error: exErr } = await sb
    .from('exercises')
    .select('id, slug, code, video_url, thumbnail_url');
  if (exErr) {
    console.error('Failed to load exercises:', exErr.message);
    process.exit(1);
  }
  const bySlug = new Map(exercises!.map((e) => [e.slug.toLowerCase(), e]));
  const byCode = new Map(exercises!.map((e) => [e.code.toLowerCase(), e]));
  console.log(`Loaded ${exercises!.length} exercises from DB.`);
  // Walk inputs recursively so subdirectories (B/, N/, etc.) are picked up.
  const walk = (root: string): string[] => {
    const out: string[] = [];
    for (const name of fs.readdirSync(root)) {
      if (name.startsWith('.')) continue;
      const full = path.join(root, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) out.push(...walk(full));
      else out.push(full);
    }
    return out;
  };

  // 2. Walk the input directory recursively.
  const entries = walk(args.dir).map((full) => ({
    name: path.basename(full),
    full,
    stat: fs.statSync(full),
  }));

  const plan: Array<{
    kind: 'video' | 'thumb';
    file: string;
    slug: string;
    bucket: string;
    objectPath: string;
    contentType: string;
  }> = [];
  const skipped: string[] = [];

  for (const e of entries) {
    const ext = path.extname(e.name).toLowerCase();
    const stem = path.basename(e.name, ext).toLowerCase();
    // Match by slug first (canonical), fall back to code (e.g. "n5" → N5 row).
    const row = bySlug.get(stem) ?? byCode.get(stem);
    if (!row) {
      skipped.push(`${e.name} (no exercise with slug or code "${stem}")`);
      continue;
    }
    const slug = row.slug.toLowerCase();
    if (args.only && !args.only.has(slug) && !args.only.has(stem)) {
      skipped.push(`${e.name} (filtered out by --only)`);
      continue;
    }
    if (VIDEO_EXTS.has(ext)) {
      plan.push({
        kind: 'video',
        file: e.full,
        slug,
        bucket: 'exercise-videos',
        objectPath: `${slug}/video${ext}`,
        contentType: ext === '.mov' ? 'video/quicktime' : 'video/mp4',
      });
    } else if (THUMB_EXTS.has(ext)) {
      plan.push({
        kind: 'thumb',
        file: e.full,
        slug,
        bucket: 'exercise-thumbnails',
        objectPath: `${slug}/thumb${ext}`,
        contentType: ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.png' ? 'image/png' : 'image/webp',
      });
    } else {
      skipped.push(`${e.name} (unsupported extension ${ext})`);
    }
  }

  console.log(`\nPlan: ${plan.length} files to upload (${plan.filter((p) => p.kind === 'video').length} videos, ${plan.filter((p) => p.kind === 'thumb').length} thumbs).`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length}:`);
    skipped.forEach((s) => console.log(`  · ${s}`));
  }
  if (args.dryRun) {
    plan.forEach((p) => console.log(`  → ${p.bucket}/${p.objectPath}  (${(fs.statSync(p.file).size / 1024 / 1024).toFixed(1)} MB)`));
    console.log('\n--dry-run set, exiting.');
    return;
  }

  // 3. Upload + collect public URLs.
  const updates = new Map<string, { video_url?: string; thumbnail_url?: string }>();
  let ok = 0;
  let fail = 0;
  for (const p of plan) {
    const buf = fs.readFileSync(p.file);
    const mb = (buf.length / 1024 / 1024).toFixed(1);
    process.stdout.write(`  ${p.kind.padEnd(5)} ${p.slug.padEnd(28)} ${mb.padStart(5)} MB  …`);
    const { error: upErr } = await sb.storage
      .from(p.bucket)
      .upload(p.objectPath, buf, {
        upsert: true,
        contentType: p.contentType,
        cacheControl: '604800',
      });
    if (upErr) {
      console.log(` FAIL: ${upErr.message}`);
      fail++;
      continue;
    }
    const { data: pub } = sb.storage.from(p.bucket).getPublicUrl(p.objectPath);
    if (!updates.has(p.slug)) updates.set(p.slug, {});
    if (p.kind === 'video') updates.get(p.slug)!.video_url = pub.publicUrl;
    else updates.get(p.slug)!.thumbnail_url = pub.publicUrl;
    console.log(' ok');
    ok++;
  }

  console.log(`\nUpload: ${ok} ok, ${fail} failed.`);

  // 4. Update exercises rows.
  if (args.noUpdate) {
    console.log('--no-update set, skipping exercises table update.');
    return;
  }
  let updated = 0;
  for (const [slug, fields] of updates) {
    const { error: updErr } = await sb.from('exercises').update(fields).eq('slug', slug);
    if (updErr) {
      console.log(`  ! ${slug}: ${updErr.message}`);
      continue;
    }
    updated++;
  }
  console.log(`Updated ${updated}/${updates.size} exercises rows.`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
