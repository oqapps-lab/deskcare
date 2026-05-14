# DeskCare

Micro-stretching app for remote/office workers. Short 2-5 min exercises for neck, back, eyes, and wrists — done right at the desk, no mat, no changing clothes. Smart reminders, body-part targeting, habit tracking.

## Stack

- Expo SDK 55, React Native, TypeScript (strict)
- expo-router (file-based routing)
- Supabase (auth, database, storage)
- Adapty (subscriptions)

## Getting started

```bash
npm install --legacy-peer-deps
npm start
```

Scan the QR code with Expo Go, or press `w` to open in browser. Full instructions: [`docs/07-development/RUN-LOCAL.md`](docs/07-development/RUN-LOCAL.md)

## Screens

| Screen | Route | Status |
|--------|-------|--------|
| Welcome | `/` | Done |
| Onboarding | `/onboarding` | Done |
| Quiz | `/quiz` | Done |
| Home | `/home` | Done |
| Routine Preview | `/routine` | Done |
| Exercise Player | `/player` | Done |
| Progress | `/progress` | Done |
| Profile | `/profile` | Done |
| Settings | `/settings` | Done |

## Development

- **Run locally:** [`docs/07-development/RUN-LOCAL.md`](docs/07-development/RUN-LOCAL.md)
- **Design guide:** [`docs/06-design/DESIGN-GUIDE.md`](docs/06-design/DESIGN-GUIDE.md)
- **Architecture rules:** [`CLAUDE.md`](CLAUDE.md)

## Project structure

```
app/              # Screens (expo-router)
components/
  primitives/     # Shared design-system components
constants/
  tokens.ts       # Colors, spacing, radii, typography
mock/
  data.ts         # All prototype data (no API yet)
docs/
  01-research/    # Market research, personas
  06-design/      # Design guide, Stitch references
  07-development/ # Local setup, contribution notes
```

## Current stage

Design complete — all 9 prototype screens built and verified.
