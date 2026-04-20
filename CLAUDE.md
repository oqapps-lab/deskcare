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
Design (Stage 5) — Research, Product, UX завершены. Сейчас: Stitch-промпты → генерация экранов → MCP-конверсия в RN код.

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

## 3-Layer Layout System
Each screen has three layers:
1. **Background** — absolute, gradients/images, NOT inside ScrollView
2. **Content** — flex/scroll, text, cards, interactive
3. **Floating UI** — absolute, bottom buttons/top header

## File Structure
- /app/ — screens (expo-router)
- /components/ui/ — shared UI components
- /components/[feature]/ — feature-specific components
- /constants/ — colors, fonts, layout
- /docs/ — all documentation
- /docs/01-research/ — market research (DeskStretch + SciatiCare combined)
