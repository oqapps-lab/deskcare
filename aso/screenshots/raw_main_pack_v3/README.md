# DeskCare ASO Main Pack v3 — Raw Screenshots

24 candidate screenshots for the 6-frame ASO main pack. 4 options per frame.
Captured on iPhone 16e simulator (D4C009F7-…), Expo Go SDK 55, with
`EXPO_PUBLIC_PREMIUM_BYPASS=1` so premium gates open. Marina test user
seeded in Supabase but visible only via demo `?state=` params (sign-in
flow blocked by iOS 26 sim text-input quirks).

Naming: `f<frame>_<option>_<screen>.png`. Frame copy locked in
`aso/screenshots/MAIN_PACK.md`.

## Frame 1 · `Stiff? Sore? Slumped?` / `Sitting takes a toll.`

| File | What it shows | Notes |
|---|---|---|
| `f1_a_welcome.png` ⭐ | DeskPersonIllustration silhouette of person mid-shoulder-roll at desk + DESKCARE eyebrow + "Two minutes a day" headline + "Begin" CTA | Cleanest universal silhouette. Best for hook. |
| `f1_b_paincheck.png` | Body silhouette (front view) + zone chips (Neck/Shoulders/Upper back) | Clinical body-map vibe; works if want literal "where it hurts" preview |
| `f1_c_labor.png` | "BUILDING YOUR PROGRAM · 91% COMPLETE" loading ring | Conveys "we're working on you" — optional, less impactful |
| `f1_d_paywall.png` | "YOUR 14-DAY PROGRAM · Your program is waiting" timeline card | Has price/CTA — less neutral as hook |

## Frame 2 · `Tap where it hurts.` / `Neck. Back. Eyes. Wrists.`

| File | What it shows | Notes |
|---|---|---|
| `f2_a_quizzone.png` ⭐ | "Where does it hurt most?" + 4-card grid (Neck / Back & lower / Eyes / Wrists) + "Everything, honestly" pill | BEST. Card grid reads instantly as "tap to choose zone". |
| `f2_b_paincheckmap.png` | Body map silhouette + zone chips horizontal scroll | Same content as f1_b — duplicate option |
| `f2_c_library.png` | "Library — 64 atoms" + filter pills + 4 exercise cards w/ video thumbs | Shows depth (64 exercises) but less "tap where it hurts" |
| `f2_d_quizgoal.png` | "What are you hoping for?" + 3 options + hours-at-desk row | Different quiz step — less direct match |

## Frame 3 · `Relief in 2 minutes.` / `No mat. No changing.`

| File | What it shows | Notes |
|---|---|---|
| `f3_a_preview.png` ⭐ | TODAY'S ROUTINE Neck Quick + REAL VIDEO hero (woman at desk in sweater) + stats (2 MIN / 7 MOVES / ZONE BASED) + WHAT YOU'LL DO list + "Begin · 2 min" pill | BEST. Real video + "2 min" CTA visible in one frame. |
| `f3_b_player.png` | STEP 1 OF 7 · Shoulder Rolls + circular ring with video center + 00:16 REMAINING timer + transport | Mid-routine — "you're already doing it" feel |
| `f3_c_plan.png` | "Your program is ready" + 3 routines + stats card (14 EXERCISES · 2 MINUTES A DAY · 14 DAYS TO RESULTS) | Shows the "2 minutes a day" promise as stat |
| `f3_d_complete.png` | WELL DONE + "That's two minutes your neck didn't hold" + 2:15 / 3 / 7 stats | Outcome flavor — good for outcome frame too |

## Frame 4 · `Programs for real conditions.` / `Sciatica. Eye strain. Wrists.`

| File | What it shows | Notes |
|---|---|---|
| `f4_a_programs.png` ⭐ | 3 program cards Sciatica Relief (peach) / Eye Program (lavender) / Carpal Tunnel Care (mint) — "CLINICIAN-REVIEWED" labels visible | BEST. Three cards reads as "three programs", colors differentiate. |
| `f4_b_sciatica.png` | Sciatica detail — "A calm 21-day return to standing without wincing" + "How is it today?" check-in + Phase 1 Acute / Phase 2 Maintenance | Deep dive on one program; medical tone |
| `f4_c_eye.png` | "Eye Program" + 20-20-20 timer ring "17 SECONDS" + THE 20-20-20 RULE card | Specific to eye strain |
| `f4_d_symptom.png` | "Symptom check-in · How is it today?" + 6 medical checkboxes (Sharp shooting down my leg / Numb in foot etc.) | Most medical-looking; nuanced |

## Frame 5 · `Your pain. Your time.` / `Routines ready when you tap.`

| File | What it shows | Notes |
|---|---|---|
| `f5_a_home_premium.png` ⭐ | "PRO · TODAY · Welcome back, Marina." + 6-day StreakArc + "Day 6 · all zones unlocked" + Shoulder Release recommendation + Eyes tired? + zones row + Tab Bar | BEST. PRO badge, populated state, personalized greeting. |
| `f5_b_notif.png` | "Reminders · When should we nudge you?" + DAILY SCHEDULE chips 09:00 / 12:00 / 15:00 / 18:00 + 20-20-20 toggle + Premium card | Shows "Your time" axis explicitly via timeslots |
| `f5_c_home_active.png` | Same as f5_a but no PRO badge ("Day 6 of a quiet 14-day program") | Slightly softer copy |
| `f5_d_pushprimer.png` | "ONE MORE THING · Gentle nudges keep the streak" + bullet list + Enable reminders | Modal-style sheet |

## Frame 6 · `Real change. 14 days.` / `Better posture. No mat.`

| File | What it shows | Notes |
|---|---|---|
| `f6_b_milestone.png` ⭐ | "7 DAYS · MILESTONE UNLOCKED · A week of small releases · You've spent 14 minutes this week undoing desk tension" + stats (7 DAYS · 14 MINUTES · 21 MOVES) + "Share this" | BEST. Concrete numbers for outcome — no medical claim. |
| `f6_a_complete.png` | WELL DONE + 2:15 TIME · 3 MOVES · 7 DAY STREAK | Single-session outcome (smaller scale) |
| `f6_c_home_premium.png` | Same as f5_a — Marina home | Could overlay "Day 7" achievement |
| `f6_d_lib_detail.png` | NOT FOUND state (test slug) — skip this for ASO | ❌ Not usable |

---

## Recommended pick (1 per frame)

```
f1_a_welcome.png     →  Stiff? Sore? Slumped?
f2_a_quizzone.png    →  Tap where it hurts.
f3_a_preview.png     →  Relief in 2 minutes.
f4_a_programs.png    →  Programs for real conditions.
f5_a_home_premium.png →  Your pain. Your time.
f6_b_milestone.png   →  Real change. 14 days.
```

After approval, these 6 PNGs feed the design tool (Figma / Photoshop)
where typography overlay + brand-locked gradients are applied per the
visual identity in `MAIN_PACK.md`. Final output: 6 × 1290×2796 PNG for
App Store Connect upload.

## Tweaks if needed

- For Frame 6 outcome chart (preferred but blocked): once sign-in flow
  works (dev build / typing reliable), navigate to `/profile/progress`
  with Marina logged in. Her seeded data: 7 sessions over 7 days, 14
  pain entries showing improvement → real bar chart Mon-Sun.
- For Frame 1 alternate dark-mood version: re-shoot welcome with
  `BgPattern variant="waves"` darker tone — needs UI tweak.
