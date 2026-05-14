# DeskCare

## Stack
- Expo SDK 55, React Native, TypeScript strict
- expo-router (file-based routing)
- Supabase (auth, database, storage)
- Adapty (subscriptions)

## About
Micro-stretching app for remote/office workers. Short 2-5 min video exercises for neck, back, eyes, wrists — done right at the desk, no mat, no changing clothes. Includes specialized programs (sciatica, carpal tunnel). Smart reminders, body-part targeting, habit tracking.

## Target Audience
- Remote workers 25-45 with neck/back pain (primary)
- Office workers in open offices (need discreet exercises)
- People with sciatica/specific conditions (premium programs)

## Current Stage
Design (pilot batch: Welcome + Home + Routine Preview built)

## Rules
- useWindowDimensions() for responsive
- useSafeAreaInsets() for safe areas
- Haptics.impactAsync() on buttons
- aspectRatio for images
- Mock data from /mock/ (NO real API until Stage 6)
- Functional components + TypeScript strict
- StyleSheet.create (no inline styles)
- No class components
- No any types

## Design Rules
- Backgrounds: `Colors.canvas` (#F8F9FA) for screens, `Colors.surface` (#fff) for cards
- Cards: `Card elevated` (white + tinted shadow) — NO glassmorphism on regular cards
- Shadows: tinted only — `Colors.primary`, `Colors.primaryLight`, or `#72b8f8` (pebble glow)
- No `shadowColor: '#000'`, no decorative `borderWidth`
- Fonts: CormorantGaramond (display/headlines) + Inter (body/labels)
- No background color blobs or decorative gradients on Home screen
- Glassmorphism allowed only: BottomNav island, Welcome screen light leaks
- Body zones: Neck / Back / Eyes / Wrists only (no Shoulders)
- No sci-fi language, no Mindfulness, no v2.0 features in UI

## 3-Layer Layout System
Each screen has three layers:
1. **Background** — absolute, gradients/images, NOT inside ScrollView
2. **Content** — flex/scroll, text, cards, interactive
3. **Floating UI** — absolute, bottom buttons/top header

## File Structure
- /app/ — screens (expo-router)
- /components/primitives/ — shared primitive components
- /components/[feature]/ — feature-specific components
- /constants/tokens.ts — colors, fonts, spacing, radii, shadows
- /mock/ — mock data (user, routines, zones)
- /docs/ — all documentation
- /docs/06-design/DESIGN-GUIDE.md — full design reference
