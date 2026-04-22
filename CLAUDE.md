# DeskCare

## Metro / Simulator — правила для Claude

- **НЕ запускай `npx expo start` автоматически**. Никогда не в начале сессии, никогда по собственной инициативе. Metro поднимает пользователь вручную в своём терминале.
- Если Metro нужен для выполнения задачи и его нет на порту 8083 → **спроси пользователя** «Metro не запущен, запустить?» и дождись явного OK. Без OK — ничего не запускай.
- Если пользователь явно сказал «запусти Metro / протестируй экран / прогони QA» — тогда запуск разрешён.
- При завершении сессии хук `SessionEnd` из [`.claude/settings.json`](./.claude/settings.json) автоматически убивает `expo start.*8083`. Не копится.

## iOS Simulator
- **UDID**: `D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C`
- **Device**: iPhone 16e — deskcare
- **Metro port**: 8083
- **How to open (когда Metro уже запущен пользователем)**: `xcrun simctl openurl D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C "exp://127.0.0.1:8083"`
- **Screenshot**: `~/.claude/bin/ios-shot D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C`

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
