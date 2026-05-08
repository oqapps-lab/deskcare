# DeskCare — Icon Candidates

Four MidJourney clay-render concepts. All resized to 1024×1024 RGB (no
transparency, no rounding) per Apple HIG. Primary chosen as `icon-A.png`;
the other three become alternate-icons / PPO challengers once App Store
listing is live.

| Slot | File | Concept | Source MJ ID |
|---|---|---|---|
| Primary (in `assets/icon.png`) | `icon-A.png` | abstract smooth arc — soft 3D clay | `635ab309` |
| Challenger 1 | `icon-B.png` | side profile minimal | `5ae5d932` |
| Challenger 2 | `icon-C.png` | side profile view | `09f97601` |
| Challenger 3 | `icon-D.png` | single vertical gentle | `25b25284` |

## How the test runs

1. **First TF / first App Store submission** ships with `icon-A.png` only.
2. Once the app is approved and in `READY_FOR_SALE`, run a PPO test via App Store Connect:
   - Treatment 1: `icon-B.png`
   - Treatment 2: `icon-C.png`
   - Treatment 3: `icon-D.png`
3. Apple PPO splits storefront traffic, measures install conversion vs control (`icon-A`).
4. After ≥500 installs per arm and ≥90% confidence, apply winner.

PPO does NOT work in TestFlight — only in the live App Store. Until launch,
all four icons live in `icons/candidates/` for review.

## Why A is primary

`icon-A` is the most diverse from clinical incumbents (Kaia Health blue,
Hinge Health enterprise gray) AND from gym-bro accents (Wakeout orange
exclamation), per `aso/icons/archetype-brief.md`. Soft warm-cream with a
single arc reads as a posture/relief metaphor without medical-device
visual baggage.

## Update history

- 2026-05-08 — first set: A, B, C, D from MJ run u7799383528.
