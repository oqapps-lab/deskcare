# DeskCare — Pre-TestFlight UI-QA Matrix

_42 screens · TF-internal mode (`EXPO_PUBLIC_PREMIUM_BYPASS=1`) · sim **D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C** (iPhone 16e)_

## How to run

1. Pull the latest `main`.
2. Verify `.env.local` contains:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://wnmjdxmrpmucfoluxhly.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_6_…
   EXPO_PUBLIC_PREMIUM_BYPASS=1
   ```
3. From the **Mac** terminal, in the project root: `npm install` (Apple/Google Sign-In + Adapty SDK are new deps).
4. Start Metro: `npm start` (port 8083).
5. Boot the sim and open the app: `xcrun simctl openurl D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C "exp://127.0.0.1:8083"`.
6. Walk every section below and tick the boxes. Capture screenshots on regressions with `~/.claude/bin/ios-shot D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C`.

> **Critical caveat:** Apple Sign-In, Google Sign-In, Adapty purchases and push tokens DO NOT WORK IN EXPO GO. They need a dev build (`eas build --profile development`). For Expo-Go QA, treat those as visual-only checks (button renders correctly) and do the functional sign-in via email/password.

---

## A. Cold start + auth (5 min)

### A1. First run (clean install)
- [ ] Erase sim data (`xcrun simctl erase D4C009F7-…`) before this section.
- [ ] App opens to Splash → quickly transitions to Welcome onboarding (no flash of content).
- [ ] No red Metro error overlay anywhere.

### A2. Splash routing
- [ ] Signed-out user → routes to `/onboarding/welcome` (not `/main/home`).
- [ ] Signed-in user with `onboarding_completed=true` → routes straight to `/main/home`.
- [ ] Signed-in user with `onboarding_completed=false` → routes to onboarding.

### A3. Sign-in screen (`/auth/sign-in`)
- [ ] Email + password fields visible, "Show/Hide" password toggle works.
- [ ] "Forgot password?" tap gives haptic (still a stub — known).
- [ ] Email/password sign-in success → routes to `/main/home`.
- [ ] Email/password failure → red error text under primary CTA.
- [ ] **Apple button** renders as the official black Apple sheet (HIG-compliant). Tap shows iOS sheet (or "Apple Sign-In requires a dev build" note in Expo Go).
- [ ] **Google button** renders custom (white, "G" glyph). Tap → if env vars unset, surfaces a friendly error toast.

### A4. Sign-up screen (`/auth/sign-up`)
- [ ] Email + password + confirm fields. Mismatch shows "Passwords don't match yet."
- [ ] "Gentle updates" toggle is interactive.
- [ ] OR divider + Apple button (iOS only) + Google button visible BELOW the "Create account" CTA.
- [ ] Successful sign-up → routes to `/onboarding/welcome`.

---

## B. Onboarding (8 min)

### B1. Welcome (`/onboarding/welcome`)
- [ ] Hero, breath-animated CTA, "Already have an account?" link.
- [ ] CTA tap → quiz/zone.

### B2. Quiz × 4 (`/onboarding/quiz/{zone,frequency,work,goal}`)
- [ ] Each step slides in from right (200 ms).
- [ ] Progress dots advance (4 dots).
- [ ] Multi-select (zone) and single-select (frequency/work/goal) feel distinct.
- [ ] Back button returns to previous step without losing selection.

### B3. Plan (`/onboarding/plan`)
- [ ] Personalized program preview card.
- [ ] CTA → labor-illusion.

### B4. Labor-illusion (`/onboarding/labor-illusion`)
- [ ] 4-step "we're customizing…" sequence with progress.
- [ ] Auto-advances to permission after final step.

### B5. Permission (`/onboarding/permission`)
- [ ] Pre-prompt copy.
- [ ] "Enable" → triggers iOS notification permission sheet.
- [ ] "Maybe later" → routes forward without permission.

### B6. Paywall (`/onboarding/paywall`)
- [ ] Eyebrow "YOUR 14-DAY PROGRAM", title, sub.
- [ ] Timeline card with 3 steps (Today / Day 5 / Day 7).
- [ ] Benefits list (4 bullets with checkmarks).
- [ ] Plan picker — yearly default, monthly toggle works.
- [ ] **Trust row** — 4.8 stars + "2,400+ reviews".
- [ ] **Legal row** — Restore / Terms / Privacy. Restore tap fires a Success haptic (TF-internal stub).
- [ ] **× close** is hidden for first 3 s, then fades in. Tap → routes to `/main/home`.
- [ ] **"Begin 7 days free" CTA** → with `PREMIUM_BYPASS=1`, instantly routes to home; premium content app-wide is unlocked.

---

## C. Main tabs (10 min)

### C1. Home (`/main/home`)
- [ ] Atmospheric background renders without banding.
- [ ] StreakArc (280° SVG) animates on mount; displays current streak number.
- [ ] Recommended routine card with title, duration, "Begin" CTA.
- [ ] CTA → `/exercise/preview`.
- [ ] Greet hour: shows "GOOD MORNING/AFTERNOON/EVENING" based on local time.
- [ ] Pain check-in pill visible; tap → `/pain/check-in`.
- [ ] Demo states accessible via `?state=first|active|premium|reengage` (helpful for visual QA).

### C2. Library (`/main/library`)
- [ ] Loads 64 atoms (count visible: "Short exercises by zone — 64 atoms.").
- [ ] Filter pills work: All / Neck / Back / Eyes / Wrists / Full body.
- [ ] Search by name, code (e.g. "N1"), zone — incremental filter.
- [ ] Premium-flagged exercises: with `PREMIUM_BYPASS=1` should NOT show lock icon.
- [ ] Tap atom card → `/library/<slug>` detail.

### C3. Programs (`/main/programs`)
- [ ] Three program cards: Sciatica, Eye, Carpal Tunnel.
- [ ] With `PREMIUM_BYPASS=1`, no lock icons; all programs route to their detail screens.
- [ ] Eye program tap → `/programs/eye`. Sciatica → `/programs/sciatica`. Carpal → currently routes to paywall (no detail screen yet).

### C4. Profile (`/main/profile`)
- [ ] Header: avatar (initials), display name, tier badge ("PRO" if premium).
- [ ] Stats row: current streak, longest, total sessions, total minutes.
- [ ] Last 7 days bar chart Mon-Sun based on real `sessions` data.
- [ ] Recent sessions list (up to 20).
- [ ] "Sign out" tap (in settings) → `supabase.auth.signOut()` → routes to `/onboarding/welcome`.

---

## D. Exercise flow (10 min) — videos critical here

> **Atom × video status as of 2026-05-04:** 57/64 atoms have real video. Without-video: **S2, W3, W6, W7, W8, W9, W10**. These should fall back to the SVG `VideoPlaceholder` automatically.

### D1. Routine Preview (`/exercise/preview?routine=neck-quick-2min`)
- [ ] Hero `<ExerciseVideo>` plays the first atom's video, looped + muted, no controls.
- [ ] Stats row: minutes, moves, type.
- [ ] "What you'll do" list with `<VideoPlaceholder>` thumbs (compact mode).
- [ ] "Before you start" tip card.
- [ ] "Begin" CTA → `/exercise/player`.

### D2. Routine Player (`/exercise/player`)
- [ ] Eyebrow "STEP X OF N" updates as steps advance.
- [ ] Step name + meta (`code · Ns × M`).
- [ ] **Video center** plays inside the progress ring (220×220).
- [ ] Progress ring fills smoothly over `atom.duration_seconds × reps` (worklet animation).
- [ ] `overlay_text` shown when present.
- [ ] mm:ss timer counts down.
- [ ] Pause/Play toggle stops the tick + freezes video state appropriately.
- [ ] Skip-back disabled at step 0; check button advances or routes to `/exercise/complete` on last step.
- [ ] Step-advance haptic = selection. Final step = Success notification haptic.

### D3. Routine Complete (`/exercise/complete`)
- [ ] Insert into `sessions` table happens (verify via Supabase query if possible).
- [ ] Streak bumped: `current_streak`, `longest_streak`, `total_sessions`, `total_minutes` updated.
- [ ] CTA → home or share screen.

### D4. Exercise Detail (`/library/<slug>`)
- [ ] Real video plays (or `<VideoPlaceholder>` for the 7 atoms without video).
- [ ] Title, code, duration, type, difficulty.
- [ ] Description + sections (cautions, modifications, reps_inside_atom).
- [ ] If atom has `video_url=null`, "Coming soon" GlassCard appears.
- [ ] Premium-flagged + `PREMIUM_BYPASS=1` → no lock overlay, video plays normally.
- [ ] Free + premium-flagged + `PREMIUM_BYPASS=0` → lock overlay over video, "Unlock with 7-day free trial" CTA replaces "Begin".
- [ ] Heart slot (favorite) visible next to "Begin" pill.

### D5. Without-video atoms (S2, W3, W6, W7, W8, W9, W10)
- [ ] Each renders the SVG stick-figure `VideoPlaceholder` instead of a black/blank video frame.
- [ ] No console warnings about failed video URL fetches.

---

## E. Pain + programs (5 min)

### E1. Pain Check-in (`/pain/check-in`)
- [ ] All 6 zones show as cards.
- [ ] Slider 0-10 per zone with haptic.
- [ ] Save → upserts `pain_entries` (1 row/zone/day).

### E2. Pain History (`/profile/pain-history`)
- [ ] Last 14 days, aggregated per zone.
- [ ] Empty state when no entries yet.

### E3. Sciatica program (`/programs/sciatica`)
- [ ] Phase 1 + Phase 2 cards with R14-R17 routines from DB.
- [ ] Active phase derived from `user_program_progress`.
- [ ] Tap routine → `/exercise/preview?routine=...`.

### E4. Eye program (`/programs/eye`)
- [ ] 5 routines listed.
- [ ] 20-20-20 timer block.
- [ ] CTA → `/exercise/preview?routine=eye-full-3min`.

### E5. Symptom Checker (`/programs/symptom-checker`)
- [ ] 6 yes/no questions.
- [ ] Result writes to `user_program_progress.last_symptom_check` jsonb.

---

## F. Modals (4 min)

### F1. Push primer (`/modals/push-primer`) — sheet presentation
- [ ] Slides up as iOS sheet.
- [ ] "Enable" triggers iOS permission prompt (or no-op if already granted/denied).
- [ ] Backdrop tap dismisses.

### F2. Milestone (`/modals/milestone`)
- [ ] Confetti animation, milestone number.
- [ ] CTA dismisses.

### F3. Share (`/modals/share`)
- [ ] Tappable share content; share sheet (iOS native) opens on real device — in sim it may stub.

### F4. Streak Freeze (`/modals/streak-freeze`)
- [ ] Visual + CTA copy intact.

### F5. Mini-paywall (`/modals/mini-paywall`)
- [ ] Compact paywall variant.
- [ ] Same "Begin 7 days free" stub behavior as full paywall.

### F6. Rate app (`/modals/rate-app`)
- [ ] Star UI, "later" dismiss.

---

## G. Settings + system (3 min)

### G1. Settings root (`/profile/settings`)
- [ ] List of options renders.
- [ ] Sign out works.

### G2. Notification settings (`/settings/notifications`)
- [ ] Reminder time picker.
- [ ] Days-of-week selector.
- [ ] "Save" calls `cancelAllScheduledReminders` then `scheduleDailyReminder`.
- [ ] **Local notification smoke**: set reminder for 1 minute from now, lock the sim, wait → banner should appear. (Expo Go works for local notifications; push tokens need a dev build.)

### G3. No-connection screen (`/errors/no-connection`)
- [ ] Static error UI; CTA retry.

### G4. Force-update (`/system/force-update`) and Maintenance (`/system/maintenance`)
- [ ] Static screens render correctly when navigated directly.

---

## H. Edge cases (5 min)

### H1. Offline
- [ ] Toggle Mac wifi off (or use Network Link Conditioner: 100% Loss).
- [ ] App still loads from cache where it can.
- [ ] New fetches show error states (not white screens).

### H2. Slow connection
- [ ] Network Link Conditioner → "Edge" or "3G".
- [ ] Loading states are visible; no jank.
- [ ] Videos buffer rather than crash.

### H3. Large text
- [ ] Settings → Accessibility → Larger Text → max.
- [ ] Headline/title text scales without truncating critical info.
- [ ] No double-overflow ellipsis.

### H4. Reduced motion
- [ ] Settings → Accessibility → Reduce Motion → On.
- [ ] Paywall close (×) appears immediately rather than after 3 s delay.
- [ ] Onboarding step animations skip / shorten.

### H5. Background → foreground
- [ ] During a routine player session, hit Home button (cmd+shift+h). Reopen.
- [ ] Player state preserved or gracefully resumes; no NaN timer.

### H6. Cold-start hydration
- [ ] Force-quit Expo Go app. Reopen.
- [ ] No flash of "signed-out" state for already-signed-in users (was a regression risk).

---

## I. Visual regression sweep (3 min)

For each main screen, scan:

- [ ] No 3-stop coral gradients (closed in `d3566c9`, `ec0100b`).
- [ ] All matte coral-glass CTAs render with BlurView (not flat).
- [ ] Card shadows look right (no "crooked shadow" — closed in `c67e17b`).
- [ ] StreakArc 280° gradient renders (not flat circle, no trailing dot).

---

## Total time estimate

- A: 5 min
- B: 8 min
- C: 10 min
- D: 10 min  ← _critical, video-heavy_
- E: 5 min
- F: 4 min
- G: 3 min
- H: 5 min
- I: 3 min

**~ 53 minutes for a full pass.**

---

## Sign-off

If all sections pass, the build is TF-internal-ready. File `eas.json` is wired with the `preview` profile that sets `EXPO_PUBLIC_PREMIUM_BYPASS=1` automatically — see `docs/07-development/TESTFLIGHT-RELEASE.md`.

Regressions found this pass: _(fill in)_

Tested on: _(date / iOS version / sim model)_

---

_Generated 2026-05-04 alongside the Apple Sign-In + Google Sign-In + Adapty wiring (commit pending)._
