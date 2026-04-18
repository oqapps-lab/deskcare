# DeskCare

Micro-stretching app for remote/office workers. Short 2-5 min video exercises for neck, back, eyes, wrists — done right at the desk. Specialized programs (sciatica, carpal tunnel). Smart reminders, body-part targeting, habit tracking.

## Stack
- Expo SDK 55, React Native, TypeScript (strict)
- expo-router (file-based routing)
- Supabase (auth, database, storage)
- Adapty (subscriptions)


## Getting started
```bash
npm install
cp .env.example .env  # fill in real keys
npm start
```

## Project structure
See `CLAUDE.md` for the full architectural rules and the 3-layer layout system.

Documentation lives in `/docs/`:
- `01-research/` — market research, competitors, personas, domain research, research brief
- `02-product/` — product vision, features, problem-solution fit, audience, monetization
- `03-practices/` — onboarding/paywall/retention/ASO research + practices brief
- `04-ux/` — screen map, user flows, wireframes, UX spec, funnel
- `05-database/` — DB schema, migrations, RLS policies
- `06-design/` — Stitch outputs, design system, screenshots
- `07-development/` — implementation notes, guides
- `08-deployment/` — store listings, release notes

## Current stage
Research (Stage 3)
