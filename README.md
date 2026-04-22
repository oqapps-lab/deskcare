# DeskCare

Micro-stretching app for remote / office workers. 2-5 minute video exercises
for neck, back, eyes, wrists — done right at the desk, no mat, no changing
clothes. Specialized programs (sciatica, carpal tunnel). Smart reminders,
body-part targeting, pain tracking.

Currently in **Stage 5 — Design**. All 6 batches shipped: **41 screens** from
the "Radiant Sanctuary" mood, all built from a shared primitive library (25
primitives). Next stage: wire Supabase + Adapty and replace placeholder video
tiles with the real shoots.

## Stack

- Expo SDK 55 · React Native 0.83 · TypeScript strict
- expo-router (file-based routing)
- react-native-reanimated 4 + react-native-worklets
- react-native-svg
- expo-blur (iOS glassmorphism)
- expo-haptics
- Plus Jakarta Sans (Google Fonts)
- Supabase (planned, Stage 6)
- Adapty (planned, Stage 6)

## Run locally

See [docs/07-development/RUN-LOCAL.md](./docs/07-development/RUN-LOCAL.md).

TL;DR:

```bash
npm install --legacy-peer-deps
npx expo install --fix
npm start
# open in Expo Go via QR or i/a hotkey
```

## Project structure

```
deskcare/
├── app/                                expo-router screens
│   ├── _layout.tsx                     root: fonts + gesture handler + Stack
│   ├── index.tsx                       animated splash → /onboarding/permission (~1.8s)
│   ├── settings/notifications.tsx      01 — Notification Settings
│   ├── eye/break.tsx                   02 — 30-Second Eye Break
│   ├── eye/session.tsx                 04 — Eye Exercise Session
│   ├── onboarding/permission.tsx       03 — Permission Prompt
│   ├── errors/no-connection.tsx        05 — No Connection
│   ├── pain/check-in.tsx               06 — Pain Location + Severity
│   └── sync.tsx                        07 — Sync
│
├── components/ui/                      20 primitives (see DESIGN-GUIDE §4)
│   ├── AtmosphericBackground.tsx       5-stop gradient + 3 orbs
│   ├── OrbField.tsx                    3 radial SVG orbs
│   ├── Screen.tsx                      SafeArea + scroll wrapper
│   ├── NavHeader.tsx                   back + title + optional action
│   ├── BrandMark.tsx                   "DeskCare" wordmark
│   ├── Eyebrow.tsx                     UPPERCASE TRACKED label
│   ├── GlassCard.tsx                   BlurView + 72% cream tint + warm shadow
│   ├── PillCTA.tsx                     3-stop gradient + highlight + glow
│   ├── PillChip.tsx                    select chip (gradient active)
│   ├── GlassIconChip.tsx               peach chip + coral icon + optional glow
│   ├── ToggleSwitch.tsx                custom glass toggle
│   ├── HeroNumber.tsx                  big display number + ghost watermark + halo
│   ├── PulseRings.tsx                  4 concentric animated rings
│   ├── BodyPainMap.tsx                 SVG torso + animated coral pain dots
│   ├── ProgressDots.tsx                horizontal progress indicator
│   ├── ClayIllustration.tsx            3D-look tile (wifi-cloud offline)
│   ├── SettingsRow.tsx                 composed row (icon + title + toggle/chevron)
│   ├── BulletRow.tsx                   coral check + benefit line
│   ├── SeveritySlider.tsx              warm-gradient pan-slider
│   ├── Glyph.tsx                       inline SVG icon set
│   └── index.ts                        barrel export
│
├── constants/
│   └── tokens.ts                       colors / gradients / radii / spacing / typeScale / shadows
│
├── hooks/
│   └── useAppFonts.ts                  Plus Jakarta Sans loader
│
├── mock/
│   └── index.ts                        mock data (Stage 5 only)
│
├── docs/
│   ├── 01-research/                    market research (DeskStretch + SciatiCare combined)
│   ├── 02-product/                     vision, features, audience, monetization
│   ├── 03-practices/                   onboarding / paywall / retention / ASO research
│   ├── 04-ux/                          screen map, user flows, wireframes, UX spec
│   ├── 05-database/                    schema, migrations, RLS
│   ├── 06-design/
│   │   ├── DESIGN-GUIDE.md             authoritative design spec (this batch + future)
│   │   ├── STITCH-PROMPTS.md           prompts for the remaining 5 batches
│   │   └── stitch-raw/
│   │       ├── design-theme.json       Stitch project metadata
│   │       └── screenshots/            7 reference PNGs
│   └── 07-development/
│       └── RUN-LOCAL.md                launch instructions + troubleshooting
│
├── assets/images/                      app icon / splash (TBD)
├── app.json                            Expo config
├── babel.config.js                     includes react-native-worklets/plugin
├── expo-env.d.ts                       at ROOT (never inside app/)
├── package.json
├── tsconfig.json
└── CLAUDE.md                           agent instructions
```

## Design system

See [docs/06-design/DESIGN-GUIDE.md](./docs/06-design/DESIGN-GUIDE.md) for:

- The Radiant Sanctuary mood (warm cream + coral + peach)
- Full color / gradient / typography / shadow tokens
- 20-primitive catalog with contracts
- 3-layer layout rule
- Per-screen recipes (composition diagrams)
- Motion + haptics specs
- Anti-patterns graveyard
- Pre-commit checklist

## Pipeline

This batch was built following the
[`stitch-to-native-ui` skill](~/.claude/skills/stitch-to-native-ui/SKILL.md)
(v2.1, Apr 2026). 8-phase pipeline — the same one used on FixIt (Noir mood)
and Sugar Quit (Sanctuary mood).

Phases:
0. Confirm exact `projectId` + `screenId[]` + canonical brand name
1. Fetch screens via Stitch MCP → save to `docs/06-design/stitch-raw/`
2. Screenshot-first visual inspection (mandatory)
3. Read designer prompts / briefs
4. Write DESIGN-GUIDE.md
5. Build `tokens.ts` + primitives
6. Compose screens from primitives
7. Run locally + verify on simulator
8. RUN-LOCAL.md + README + commit + push

## Roadmap

From [docs/04-ux/SCREEN-MAP.md](./docs/04-ux/SCREEN-MAP.md) — 39 screens in the
spec; **41 routes shipped** (some screens cover multiple states via query params).

- **Batch 1** ✓ Settings + Eye flow + Permission + Pain + Sync + Offline — 7 screens
- **Batch 2** ✓ Onboarding (Welcome + 4 Quiz + Labor Illusion + Plan + Paywall) — 8 screens
- **Batch 3** ✓ Main Tabs — Home (4 states) + Library + Programs + Profile + Exercise Detail (free/locked) — 6 screens
- **Batch 4** ✓ Sciatica (locked/active) + Symptom Checker + Eye Program — 3 screens
- **Batch 5** ✓ Exercise Flow (Routine Preview + Player + Complete) + Profile detail (Progress + Pain History + Settings) — 6 screens
- **Batch 6** ✓ Auth (Sign In + Sign Up) + Modals (Milestone · Streak Freeze · Rate · Mini-Paywall · Share · Push Primer) + System (Force Update · Maintenance) — 10 screens
- **QA Pass 1** ✓ 4 HIGH / 3 MEDIUM / 6 LOW bugs closed + polish audit on 16e — see [docs/07-development/QA-BATCH-1.md](./docs/07-development/QA-BATCH-1.md)

### What comes next (Stage 6)

- **Real video shoots** replace `<VideoPlaceholder>` on exercise cards, player, routine previews.
- **Supabase** — auth, plan sync, pain-rating history, streak persistence.
- **Adapty** — paywall purchase flow, trial enforcement, entitlement gates on locked zones / programs.
- **Proper Tabs navigator** — swap the current `/main/*` + fake `<TabBar>` pattern for expo-router `(tabs)` group with tab-preserved scroll.
- **Cold-start hydration** + deep-link fallbacks for the onboarding re-entry edge cases.

Each batch runs the same pipeline; DESIGN-GUIDE is appended (never replaced)
and the primitive library grows only when a screen needs something it doesn't
have.

## License

Private — © OQApps Lab, 2026.
