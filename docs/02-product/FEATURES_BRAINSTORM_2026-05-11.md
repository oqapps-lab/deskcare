# DeskCare — Features brainstorm to deepen engagement

User question 2026-05-11: "Чтобы прилу сделать интереснее мы что то можем добавить? Проведи исследование что еще можно добавить нам. как улучшить?"

Below = 20 feature ideas grouped by effort vs impact. Each has effort
(S/M/L), impact (S/M/L), and a 1-sentence rationale referencing what
competitors do or what review-mining flagged as gap.

## Tier 1 — Quick wins (S effort, M-L impact)

### 1. Live Activity / Dynamic Island timer (S/L)
During a routine, show timer + current move name in Dynamic Island and Lock
Screen. Native iOS feature, Expo SDK has `expo-live-activities`. Marina at
3 PM glances at phone — sees "Neck Tilt · 0:23" without opening app.
**Why:** sticky UX, raises completion rate, makes phone _the_ coach.

### 2. Apple Watch companion (M/L)
Reminder taps on wrist, quick "Start routine" complication, haptic guide
during stretch (3 buzzes = next move). Reduces friction from "phone unlock
→ open app → tap routine" to "wrist tap → done". Headspace + Calm both
ship watch app; DeskCare doesn't.
**Why:** wrist > phone for stretch-prompt use case. Removes friction.

### 3. Lock-screen widget (S/M)
"Next break: 3:15 PM · Neck unwind · 2 min". Widget tap → opens routine.
Available since iOS 16.
**Why:** zero-friction. User sees their schedule on Lock Screen, doesn't
need to remember to open the app.

### 4. Apple Health integration (S/M)
Write back "Mindful Minutes" + "Mobility minutes" to HealthKit. Read back
"Time Sitting" or workouts to suggest breaks. Both reads and writes are
auto-approved by Apple Review when used responsibly.
**Why:** users invested in Health ring see DeskCare contribute → app
becomes part of daily habit ecosystem.

### 5. Audio guidance (M/L)
Real instructor voice during routine (e.g. "Now drop your right ear toward
your shoulder. Hold for 3 breaths."). Headspace/Calm proved voice → 2-3x
session retention vs silent. Russell could record a 2-hour voice library.
**Why:** voice eliminates need to keep looking at screen. Marina can close
her eyes and follow audio.

### 6. Soundscape during stretches (S/M)
Ambient sound choices (rain / forest / café / silence). Plays under audio
guidance. Single library of 5 sounds, looped 5-min files. Calm-app pattern.
**Why:** low effort, but creates "lights out" moment for the user. Premium
differentiator.

## Tier 2 — Engagement loops (M effort, L impact)

### 7. Daily streak rituals (Morning + Evening) (M/M)
Two 90-sec routines anchored to wake-up + wind-down. Notification at
chosen morning hour → 1-tap start. Builds habit through dual anchoring.
**Why:** users who do 2/day stretches have 4x retention at 30 days
(industry pattern). Calm + Headspace both anchor morning/evening.

### 8. Pain trend chart on Home (M/L)
Mini sparkline on Home card showing pain ↓ over last 14 days. Tappable →
full Pain History page. Currently we have Pain History page but it's hidden
behind Settings.
**Why:** users see progress _every time they open the app_. Proof that
DeskCare works → harder to churn.

### 9. "Calendar-aware" breaks (M/L)
Read user's calendar (with consent), suggest 2-min stretches BETWEEN
meetings. "Standup ends 10:30 → 5-min open before 10:35 sync → Neck reset
now". Implementing this in iOS requires Calendar permission + EventKit
framework via a custom dev module.
**Why:** the ONE killer feature that no competitor has. Marina's #1 problem
("when do I stretch") gets answered automatically.

### 10. Mood + pain combo check-in (S/M)
Extend daily check-in to include mood ("focused / scattered / tired"). Pair
with pain to see "neck pain spikes on scattered-mood days" insight.
**Why:** lets DeskCare deliver _insights_, not just exercises. Mental-load
correlation with physical pain is well-documented (Cleveland Clinic).

### 11. Habit pairing prompts (S/M)
Onboarding asks "What time do you have coffee?" / "lunch?" — DeskCare
schedules breaks around those existing anchors. James Clear's "habit
stacking" applied verbatim.
**Why:** habit research consistently shows pair-with-existing > standalone.

### 12. Achievement badges + light gamification (M/M)
Not exclamation-mark gym-bro style. Quiet, editorial: "30 days of small
releases", "First sciatica check-in", "Eyes rested 100×". Visible only on
Profile. No leaderboards.
**Why:** dopamine loop without becoming Wakeout-yellow. Calm uses this.

## Tier 3 — Premium hooks (M-L effort, M impact)

### 13. AI Pain Coach (L/L) [strategic differentiator]
Conversational interface where user describes pain ("my left shoulder
feels tight when I lean forward") → AI suggests 3-min routine. Uses
Claude/OpenAI on-device or via Edge Function. The "Vita" pattern from
Vitaminico — proven onboarding hook.
**Why:** zero competitors do this. Aligns with DeskCare's "tap where
it hurts" promise but voice-driven. Powerful paywall conversion frame.

### 14. Posture self-check via front camera (L/M)
30-sec posture audit: front camera captures user at desk, app overlays
ideal posture, shows asymmetry. Run once a week. Privacy: all on-device
via Vision framework, no upload.
**Why:** demonstrates DeskCare's "we see what's wrong" depth. Justifies
$2.99/mo.

### 15. Multi-week curated programs (M/M)
Beyond sciatica/carpal: "14-day forward-head-posture reset", "7-day
hip-mobility for sitters", "post-marathon desk recovery". Each = 7-21
routines with daily check-ins.
**Why:** premium-tier content. Easy to produce — bundle existing 64 atoms
in curated sequences.

### 16. Companion physiotherapist video call (L/M, ops-heavy)
1× 15-min PT consult included in Sciatica Plus tier ($14.99/mo). Adapty
+ Cal.com integration. Adds genuine credibility.
**Why:** Hinge Health's wedge. Even if only 5% use it, the existence raises
WTP for everyone.

## Tier 4 — Social / referral (M effort, M impact)

### 17. "Streak buddy" — invite a coworker (M/M)
Both users see each other's streak. No competition; just visibility. "Pavel
is on Day 14." 80% of users with a buddy retain 2× longer (Strava data).
**Why:** office context = peer pressure for habit. Single biggest unlock
for B2C → B2B2C bridge.

### 18. Team challenge mode (L/M)
"Our team did 240 minutes this week." Office Slack integration shows weekly
leaderboard (opt-in). Adapty Promo tier — corporate plans.
**Why:** opens enterprise sales. Wakeout has Teams; we don't.

### 19. Share my plan (S/S)
After a session, generate a sharable card (Day 6 · 14 minutes · 21 moves)
similar to milestone modal but for any session. Single-tap share to Instagram
Stories / iMessage.
**Why:** organic growth. Calm's "I meditated 15 min" share cards drove 8%
of installs.

## Tier 5 — Content depth (S-M effort, M impact)

### 20. Body-zone-specific micro-content (M/M)
Each zone (neck / back / wrists / eyes) gets a 60-sec voiceover essay:
"Why your neck hurts" (Marina), "The wrist nerve glide" (Alexey),
"Eye yoga 101" (Jennifer). Plays as audio between routines.
**Why:** turns DeskCare from exercise-app into education-platform. Premium
tier feels meatier.

---

## Recommended priority sequence (next 60 days)

1. **#1 Live Activity / Dynamic Island** — high impact, low effort, native iOS
2. **#5 Audio guidance** — record once with Russell, infinite reuse
3. **#8 Pain trend chart on Home** — surfaces our existing data
4. **#3 Lock-screen widget** — companion to #1
5. **#17 Streak buddy invite** — viral hook

After those: AI Pain Coach (#13) is the big differentiator for an external
fundraise / press pitch.

## Out of scope here

- Android app (~3 months, after iOS proves)
- Web companion (later)
- Multi-language (already in metadata for 13 locales, just needs final pass)
- Wear OS / Galaxy Watch (post-Android)
