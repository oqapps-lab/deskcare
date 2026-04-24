# Primitives

Base components that use `constants/tokens.ts` only — no hardcoded values.
Import via `@/components/primitives`.

## Components

| Component | Description |
|---|---|
| `Screen` | Root screen wrapper. Applies `SafeAreaView`, `StatusBar`, canvas background, optional horizontal padding. Prop `noPadding` for full-bleed screens (Exercise Player). |
| `Card` | White surface card with `borderRadius: 24`. Prop `elevated` adds ambient primary shadow. Prop `bg` overrides background color. |
| `Text` | Typography component with `variant` prop (`display`, `h1`–`h3`, `body`, `bodyMd`, `label`, `caption`). Convenience exports: `Display`, `H1`, `H2`, `BodyText`, `Caption`. |
| `PillCTA` | Full-width primary CTA. Gradient fill (primary → primaryLight), height 56, `borderRadius: 9999`. Fires `Haptics.Light` on press. Prop `loading` shows spinner. |
| `GhostButton` | Secondary action button. `surfaceHighest` background, no gradient. Same shape as PillCTA. |
| `IconButton` | Round icon-only button. Variants: `surface` (white), `primary` (teal), `ghost` (transparent). Size defaults to 44pt touch target. |
| `HeroNumber` | Large metric display (`display` size). Props: `value`, `label` (below), `unit` (inline after number). Used for streak count, score, total minutes. |
| `Eyebrow` | Small uppercase label above a section or card. Prop `badge` wraps in a `surfaceLow` pill — used for zone tags (NECK, BACK, EYES, WRISTS). |
| `Stat` | Stat card: optional icon + large value + label. Used in a horizontal pair on Profile (Day Streak / Active Time). |
| `Divider` | Spacer-only. No line, no border. Sizes: `sm` 8pt, `md` 12pt, `lg` 16pt, `xl` 24pt. Separation through whitespace per design rules. |
| `TopBar` | Screen header. Left slot (back/close), center title, right slot (bookmark/gear). Prop `transparent` for use over hero images. Includes safe area top inset. |
| `BottomNav` | 4-tab navigation bar. Active tab renders as primary pill with label; inactive shows icon + small label. Includes safe area bottom inset. |
| `Badge` | Inline tag/chip. Variants: `zone` (teal text on light bg), `free` (green), `premium` (teal fill), `neutral` (grey). |
| `ProgressBar` | Horizontal fill bar, value 0–1. Used for onboarding quiz steps. `trackHeight` prop. |
| `Toggle` | Labeled switch row with optional description. Uses `Colors.primary` track when ON. |
