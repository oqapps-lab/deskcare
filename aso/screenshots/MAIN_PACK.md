---
pack: MAIN
version: v3 (final)
generated: 2026-05-10
target_locale: en-US
total_frames: 6
device_baseline: 6.7" (1290×2796)
---

# DeskCare — ASO Main Pack (v3, locked)

This is the canonical 6-frame screenshot pack for App Store submission.
Approved by user 2026-05-10 after 3 iterations (raw v1 → adjusted v2 →
final v3 with strong-positive USPs, no negation, no competitor framing).

## Frame copy (locked)

| # | Slot | Headline | Caption |
|---|---|---|---|
| 1 | HOOK | `Stiff? Sore? Slumped?` (21) | `Sitting takes a toll.` (21) |
| 2 | PROBLEM | `Tap where it hurts.` (19) | `Neck. Back. Eyes. Wrists.` (25) |
| 3 | SOLUTION | `Relief in 2 minutes.` (20) | `No mat. No changing.` (20) |
| 4 | TRUST | `Programs for real conditions.` (29) | `Sciatica. Eye strain. Wrists.` (28) |
| 5 | PERSONAL | `Your pain. Your time.` (20) | `Routines ready when you tap.` (28) |
| 6 | OUTCOME | `Real change. 14 days.` (21) | `Better posture. No mat.` (23) |

## Visual identity (from frames.md, retained)

- Plus Jakarta Sans ExtraBold 88pt at 1290 width for headlines
- Plus Jakarta Sans Regular 28pt for captions
- Background system: brand-locked vertical gradients
  - Frames 1-2 (pain phase): `#9D431A` burnt-orange → `#1F1A14` warm near-black
  - Frames 3-4 (intervention): `#FFDBCE` peach → `#FBF9F5` cream
  - Frames 5-6 (outcome): `#FBF9F5` cream → `#FFDBCE` peach with subtle `#7A8B6F` sage halo
- Phone scale: 88%, no device frame, drop shadow 0y 30px-blur 15% black
- Headline position: top third
- Screen: middle 60%
- Caption position: bottom

## USP rationale (why each frame works on its own merit)

1. **Stiff? Sore? Slumped?** — universal recognition. No body-part anchor, no time-of-day. Three S-words alliterate, cover Marina (stiff neck), Alexey (sore back), Jennifer (slumped posture). Every persona reads it and nods.

2. **Tap where it hurts.** — signature mechanism phrase from product context §4. Direct, imperative, tells the user exactly what the app does without abstraction.

3. **Relief in 2 minutes.** — promise + concrete timebox. 2 minutes is short enough to feel real, long enough to feel substantial. "No mat. No changing." removes friction objection.

4. **Programs for real conditions.** — clear positive value (we have specialized programs) without needing to explain abbreviations or credibility flags. "Sciatica. Eye strain. Wrists." names three legitimate medical concerns the app targets.

5. **Your pain. Your time.** — bidirectional personalization claim. User specifies pain zones + reminder times → app delivers matched routines. Stands as USP without competitor comparison.

6. **Real change. 14 days.** — outcome promise with timebox (matches our 14-day program duration). "Better posture. No mat." pays off Frame 1 hook (slouched/slumped → posture corrected).

## Localization

13 locales generated in `aso/metadata/<locale>.md`. Key transcreations
documented under each locale's "Headlines for screenshots" section.
Universal phrases (`Stiff? Sore? Slumped?`, `Tap where it hurts.`)
translate to native idioms; numerical anchors (`2 minutes`, `14 days`)
keep digits per Apple consistency rule.

## Acceptance gates (per Apple Review)

- ✅ No "#1" / "best" / "doctor-approved" / "treats X" claims
- ✅ No fake urgency / countdown
- ✅ "Programs for real conditions" — descriptive, not medical claim
- ✅ "Real change. 14 days." — timebox refers to in-app program
   duration, not promised cure
- ✅ "Better posture" — directional improvement, not absolute
- ✅ "30% less pain" REMOVED from earlier draft (avoided medical claim)
