# DeskCare — Design Guide

**Направление:** The Radiant Sanctuary (warm cream + coral, editorial, soft-touch)
**Основа:** Stitch-проект `Desk Wellness UI App` (ID `1515816731757921821`) + наши апгрейды
**Дата:** 20 апреля 2026

---

## Visual summary (что мы увидели в Stitch-скринах)

Тёплый кремовый холст (`#FBF9F5` / `#FDFBF7`), один оранжево-коралловый акцент (`#E87B4E` → тёмный `#9D431A`), мягкая peach-розовая поддержка (`#FFDBCE`), редкий лавандовый tertiary (`#9B8EB4`). Plus Jakarta Sans ExtraBold/Bold для заголовков, Regular для тела, Medium tracked для мелких лейблов. Полно-скруглённые пилюли (радиус FULL), белые плавающие карточки на cream-фоне с диффузной warm-tinted тенью, **никаких 1px бордеров**. Коралловые CTA как filled-пилюли. Маленькие иконки в круглых peach-чипах. Редкая 3D-клейм-иллюстрация (wifi-cloud на экране "Нет подключения"). Концентрические радиальные кольца как лоадер на экране синхронизации. Радиальное розовое свечение за hero-элементами (таймер "30", bell, упражнение-круг).

Mood one-liner: **sun-drenched editorial wellness — a high-end studio where the digital recedes and warmth does the talking.**

---

## TL;DR — что берём, что выбрасываем, что добавляем

### Принимаем от Stitch

- Палитра (cream/coral/peach/soft-lavender) — перенесено 1:1 в `tokens.ts`
- Типографика Plus Jakarta Sans (ExtraBold + Regular + Medium tracked labels)
- Полно-скруглённые пилюли (`roundness: ROUND_FULL`)
- Правило «no lines» — только тональные сдвиги, мягкие тени, негативное пространство
- Четырёхчиповой time-selector на экране настроек
- Концепция радиального glow за hero-элементами
- Концентрические кольца как паттерн загрузки

### Выбрасываем

- **Название "MicroMove"** на экране Permission Prompt — Stitch его выдумал. Канонический бренд: **DeskCare**.
- **3D-персонажа (auburn hair, white turtleneck)** из `designMd` — не ставим в MVP. Используем геометрические формы + легкую clay-иллюстрацию только для error-states.
- **Плоский фон** — Stitch кладёт монотонный cream. Заменяем на атмосферный 5-stop gradient + 3 радиальных orb.
- **Плоский CTA** — один `#E87B4E` фон. Заменяем на 3-stop vertical gradient с inner top-highlight + outer coral glow.
- **Белые карточки без блюра** — заменяем на `<GlassCard>` с `BlurView`+85% cream-tint.
- **Photo-based pain map** (тёмный торс JPG) — заменяем SVG-силуэтом с анимированными coral pulse-dots.

### Наши апгрейды (make it dorogo)

1. **AtmosphericBackground** везде — 5-stop cream → warm-peach vertical + 3 radial orbs в углах
2. **Glass-поверхности** на всех карточках (BlurView + cream-tint + warm shadow)
3. **Gradient CTA** с 3 стопами + inner highlight + warm glow — не flat fill
4. **Ghost hero numbers** для экранов типа "30 СЕК", "00:18" (полупрозрачный watermark-дублёр позади жирного числа)
5. **Concentric pulse-rings** на Sync — 4 анимированных кольца с staggered delay
6. **Glassy toggles** вместо Material toggle
7. **Subtle haptics** везде (expo-haptics) на CTA/chip/toggle
8. **Анимированные pulse-dots** на body map — coral glow pulsing на зонах боли

### Primitives библиотека

Полный каталог в [README.md](../../README.md) → Project structure → `components/ui/`. На момент Batch 1 — 20 примитивов. Все в `components/ui/*.tsx` + barrel-экспорт через `index.ts`. Base primitives: `<AtmosphericBackground>`, `<OrbField>`, `<BgPattern>`, `<DecorativeArc>`, `<Screen>`, `<NavHeader>`, `<BrandMark>`, `<Glyph>`. Content: `<GlassCard>`, `<PillCTA>`, `<PillChip>`, `<IconHalo>`, `<GlassIconChip>`, `<HeroNumber>`, `<Eyebrow>`, `<BulletRow>`. Interactive/animated: `<ToggleSwitch>`, `<PulseRings>`, `<BodyPainMap>`, `<ProgressDots>`, `<SeveritySlider>`, `<ClayIllustration>`.

---

## 1. Colors

### Tokens (source: Stitch designTheme `namedColors`, enriched)

```ts
canvas:           '#FBF9F5'   // surface — base app floor
canvasSoft:       '#FDFBF7'   // overrideNeutralColor — subtle variant
surfaceLow:       '#F5F3EF'   // surface_container_low
surfaceMid:       '#EFEEEA'   // surface_container
surfaceHigh:      '#EAE8E4'   // surface_container_high
surfaceHighest:   '#E4E2DE'   // surface_container_highest
surfaceCard:      '#FFFFFF'   // surface_container_lowest — floating cards
surfaceDim:       '#DBDAD6'   // surface_dim

primary:          '#9D431A'   // primary — deep burnt orange (text on cream)
primaryMid:       '#E87B4E'   // primary_container — coral (CTAs, active)
primarySoft:      '#FFDBCE'   // primary_fixed — peach chip background
primaryLight:     '#FFB599'   // primary_fixed_dim — softer peach glow
primaryDeep:      '#7E2C03'   // on_primary_fixed_variant — deep text
primaryInk:       '#5B1C00'   // on_primary_container — deep text on peach

secondary:        '#6A5C4D'   // warm brown-taupe for muted labels
secondarySoft:    '#FCE8D5'   // overrideSecondaryColor — cream-peach chip
secondaryMid:     '#F3DFCC'   // secondary_container
secondaryDim:     '#D6C3B1'   // secondary_fixed_dim

tertiary:         '#64597C'   // slate lavender (hints, rare accents)
tertiaryMid:      '#9B8EB4'   // overrideTertiaryColor
tertiarySoft:     '#EADDFF'   // tertiary_fixed — soft lavender chip
tertiaryDim:      '#CEC0E8'

ink:              '#1B1C1A'   // on_surface — primary text, never pure black
inkMuted:         '#56423B'   // on_surface_variant — secondary text
inkSubtle:        '#89726A'   // outline — tertiary/caption
inkHairline:      'rgba(138,114,106,0.12)'   // only for absolute necessity

error:            '#BA1A1A'
errorSoft:        '#FFDAD6'

white:            '#FFFFFF'
```

### Gradient library (named by mood)

```ts
// Атмосферный фон — вертикаль 5 stops
atmosphere:
  ['#FDFBF7', '#FBF9F5', '#FCEFE5', '#F9E2D2', '#F5D9C8']
                         //          peach-warm     deeper peach

// CTA — коралловая пилюля
ctaCoral:
  ['#FFC089', '#E87B4E', '#9D431A']       // vertical top→bottom

// CTA — glow (outer shadow color)
ctaGlow: 'rgba(232,123,78,0.35)'

// Hero radial — за главным числом / иконкой
haloPeach:
  ['rgba(255,181,153,0.55)', 'rgba(255,219,206,0.25)', 'rgba(255,219,206,0)']

// Orb field — 3 радиальных орба для фона
orbCoral:    'rgba(232,123,78,0.18)'   // top-right corner
orbPeach:    'rgba(255,181,153,0.25)'  // mid-left
orbLavender: 'rgba(155,142,180,0.14)'  // bottom-center

// Glass card fill (поверх атмосферы)
glassFill:   'rgba(255,255,255,0.72)'  // iOS blur tint
glassBorder: 'rgba(255,255,255,0.70)'  // hair-thin inner border
glassShadow: 'rgba(157,67,26,0.08)'    // warm-tinted, never neutral grey
```

### Правила применения

- **ЗАПРЕЩЕНО** использовать 1px `solid` бордеры для контейнеров (правило «no-line» из designMd). Разделение — через тональный сдвиг (например, `surfaceCard` на `canvas`), мягкую тень, или gutter.
- **ЗАПРЕЩЕНЫ** нейтрально-серые тени. Только warm-tinted (`primaryInk` ≤ 10% или `primarySoft` ≤ 20%).
- **ЗАПРЕЩЁН** `#000000` для текста. Используй `ink` (`#1B1C1A`).
- **Primary действия — всегда gradient**, никогда плоский fill.

---

## 2. Typography

### Family

**Plus Jakarta Sans** — единственная семья. Подключаем веса: `200 ExtraLight, 400 Regular, 500 Medium, 700 Bold, 800 ExtraBold`.

Fallback: system `-apple-system, SF Pro, Roboto`.

### Scale

| Token | Size / LH | Weight | Tracking | Use |
|---|---|---|---|---|
| `displayXl` | 80 / 84 | 800 ExtraBold | -2% | Hero numbers («30», «00:18») |
| `display` | 56 / 60 | 800 ExtraBold | -2% | Onboarding hero |
| `headline` | 28 / 34 | 700 Bold | -1% | Screen titles («Где именно болит?», «Мы поможем не забыть») |
| `headlineSm` | 22 / 28 | 700 Bold | -0.5% | Card titles |
| `titleLg` | 18 / 24 | 600 SemiBold | 0 | Settings row title («20-20-20 таймер для глаз») |
| `title` | 16 / 22 | 600 SemiBold | 0 | Chip label text |
| `body` | 15 / 24 | 400 Regular | 0 | Body text, card descriptions |
| `bodySm` | 13 / 20 | 400 Regular | 0 | Secondary body, subtitle |
| `label` | 12 / 16 | 500 Medium | +6% | Tracked UPPERCASE («НАПОМИНАНИЯ», «SEVERITY», «PREMIUM») |
| `labelSm` | 10 / 14 | 500 Medium | +8% | Smallest tracked («СЕК», «MIN») |

### Anti-patterns

❌ Не смешивать с другими шрифтами. Только Plus Jakarta.
❌ Не использовать `fontStyle: 'italic'` — Jakarta не даёт нужного italic. Для soft-лайнов — Regular + muted color.
❌ Не использовать Thin (200) для body. Только для декоративных watermarks.
❌ Не центрировать длинные заголовки. Центр — только короткие (≤5 слов).

---

## 3. Surfaces & depth

### 3-tier hierarchy (правило "no lines")

```
┌──────────────────────────────────────┐
│  Layer 0 (canvas)       #FBF9F5      │ ← app floor (+ atmosphere gradient)
│  ┌────────────────────────────────┐  │
│  │  Layer 1 (surfaceLow) #F5F3EF  │  │ ← subsection background
│  │  ┌──────────────────────────┐  │  │
│  │  │  Layer 2 (GlassCard)     │  │  │ ← floating card
│  │  │  blur 40 + white 72%     │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

Каждый вложенный слой — другой tier. Never один и тот же surface на подряд двух уровнях.

### Shadows — warm & diffused

| Variant | shadowColor | opacity | radius | offset | elevation |
|---|---|---|---|---|---|
| `shadowSoft` | `#9D431A` | 0.05 | 24 | (0, 8) | 4 |
| `shadowLift` | `#9D431A` | 0.08 | 32 | (0, 12) | 6 |
| `shadowCTA` | `#E87B4E` | 0.32 | 28 | (0, 14) | 8 |
| `shadowOrb` | `#E87B4E` | 0.25 | 60 | (0, 0) | 0 |

❌ Never use `shadowColor: '#000'` — выглядит мёртво на cream фоне.

### Radius

```ts
radii = {
  xs: 10,    // small chips
  sm: 14,    // input fields
  md: 20,    // cards (medium)
  lg: 28,    // cards (large)
  xl: 36,    // hero cards
  pill: 999, // all pills / CTA / chips / toggles
  icon: 24,  // icon chip circles
}
```

---

## 4. Primitives

Все в `components/ui/`. Каждый primitive — functional, TS-strict, memoized где надо, haptics где применимо.

### `<AtmosphericBackground>`

Full-bleed обёртка для каждого экрана. Кладёт `LinearGradient` 5-stop `atmosphere` как absolute фон + `<OrbField>` поверх.

```tsx
<AtmosphericBackground>
  {children}  // ScrollView или Content
</AtmosphericBackground>
```

Контракт: `children?: ReactNode`. Никогда не помещай внутрь ScrollView — backdrop должен быть фиксированным.

### `<OrbField>`

3 радиальных орба как absolute декорация: `orbCoral` в top-right, `orbPeach` в mid-left, `orbLavender` в bottom-center. Рендерится через `react-native-svg` с `RadialGradient`. Каждый орб — 360-480px, opacity 0.18-0.28.

### `<Screen>`

Shortcut: `<AtmosphericBackground>` + SafeArea. Принимает `scroll?: boolean`. Когда `scroll`, оборачивает детей в `ScrollView` с правильным `contentContainerStyle` (top inset + bottom 160 для tab-бара, если применимо).

### `<NavHeader>`

Header с back-arrow (chevron-left icon) + title (centered, `titleLg`) + опциональным right-icon. Transparent фон. Back вызывает `router.back()` или кастомный `onBack`.

```tsx
<NavHeader title="Настройки и напоминания" onBack={...} />
<NavHeader title="Упражнение для глаз" rightIcon="settings" onRightPress={...} />
```

### `<GlassCard>`

Floating card с glassmorphism:
- iOS: `BlurView intensity={40} tint="light"` + fill `glassFill` (rgba 255,255,255,0.72)
- Android: solid fill `rgba(255,255,255,0.85)` (blur noisy)
- Inner 1px hair-highlight `rgba(255,255,255,0.7)` на top-edge
- Warm `shadowSoft` (coral-tint)

Props: `children`, `radius?: keyof radii`, `padding?: number`, `tint?: 'cream' | 'peach'`.

### `<PillCTA>`

Primary action. 3-stop gradient (`ctaCoral`) vertical + 1px top-inner highlight `rgba(255,255,255,0.30)` + outer `shadowCTA` coral glow. Full-round. White ExtraBold label. Haptic `Heavy` on press. Press scale 0.98 via `reanimated`.

Variants:
- `variant="primary"` (default) — gradient fill
- `variant="outlined"` — 1.5px coral ring + transparent fill + coral label (используется на экране "Нет подключения")
- `variant="ghost"` — никакого фона + coral label + icon («Попробовать снова» без полной пилюли)

### `<PillChip>` (time pills, option pills)

Select chip. Два состояния:
- `active={true}` — gradient fill `ctaCoral` + белый label + shadowCTA (меньший радиус)
- `active={false}` — `surfaceLow` fill + `inkMuted` label + no shadow + warm `inkHairline` 1px (разрешаем здесь, потому что pill без fill «висит» некрасиво)

Haptic `Light` на tap.

### `<GlassIconChip>`

Круглый chip 48x48 (или 40/56) с иконкой. Backdrop: `primarySoft` (#FFDBCE) + subtle peach radial glow inside. Icon: coral (primaryMid). Используется перед label в row-items настроек.

### `<HeroNumber>`

Big display number. `displayXl` weight 800. Coral gradient `primary → primaryMid`. Опционально `ghost={true}` — рендерит полупрозрачный дубль (scale 1.15, opacity 0.12, color `primarySoft`) позади основного числа через absolute-layered View. Опциональный `subscript` под числом (Eyebrow label, e.g. «СЕК», «MIN»).

### `<Eyebrow>`

Tracked uppercase label (`label` token). Color `inkSubtle` by default, `primaryMid` when `variant="accent"`, белый when `variant="onDark"`. Использование: «НАПОМИНАНИЯ», «SEVERITY», «PREMIUM».

### `<ToggleSwitch>`

Custom glass toggle (не Material). Track: 52x32, pill-shaped.
- `on` → track `ctaCoral` gradient + thumb белый с warm shadow, сдвинут вправо
- `off` → track `surfaceHigh` + thumb `canvas` + inkHairline 1px

Анимация thumb через `reanimated` withTiming 180ms. Haptic `Selection`.

### `<PulseRings>`

SVG-композиция из 4 концентрических колец + central dot. Кольца — `Circle` с `stroke` coral (0.15-0.35 opacity depending on radius) + `strokeWidth` 1-1.5. Central dot — solid primaryMid 12px.

Анимация (reanimated): каждое кольцо масштабируется 0.8→1.2 + opacity 0.4→0 с staggered delay 0/200/400/600ms, бесконечный loop.

Используется на Sync screen.

### `<BodyPainMap>`

Dramatic dark-silhouette panel — rounded `Rect` fill `ink → inkDeep` vertical gradient inside the `240×320` viewBox, thin white outline strokes (`rgba(255,255,255,0.06–0.12)`) для torso / neck / head / midline. Поверх — coral `Circle` pulse-dots только на активных зонах (из props `painZones: ('neck'|'leftShoulder'|'rightShoulder'|'chest'|'abdomen'|'lowerBack')[]`). Каждый dot — radial gradient coral → transparent, outer radius anim 1→1.18 + inner core 0.45×base, reanimated loop 1600ms. Дизайн: контрастный «editorial medical» тон относительно cream-canvas вокруг — такой был намеренный upgrade vs Stitch photo-JPG.

### `<ProgressDots>`

Horizontal row of N tap-dots. Active — coral 8px; inactive — `surfaceHighest` 6px. Gap 8px. Используется на Exercise Session внизу.

### `<Glyph>`

Inline SVG icon set, единый API: `<Glyph name="bell" size={24} color={...} />`.

Имена: `bell, eye, speaker, crown, settings, back-chevron, play, pause, refresh, check, wifi-off, cloud-slash, clock, close-x`.

---

## 5. Layout system — 3-layer rule

**Каждый экран состоит из трёх слоёв. Никогда не смешивай.**

```tsx
<AtmosphericBackground>            {/* Layer 1 — background, absolute */}
  <NavHeader ... />                {/* Layer 3 — floating UI, absolute top */}
  <ScrollView                      {/* Layer 2 — content, flex */}
    contentContainerStyle={{
      paddingTop: insets.top + 60,
      paddingBottom: insets.bottom + 140,
      paddingHorizontal: 24,
    }}
  >
    {content}
  </ScrollView>
  <FloatingCTA ... />              {/* Layer 3 — absolute bottom */}
</AtmosphericBackground>
```

❌ Never кладёшь Background в ScrollView — orb позиции сломаются.
❌ Never рендеришь NavHeader внутри ScrollView — он должен быть absolute top с insets.
❌ Never `flex: 1` внутри BlurView — высота схлопнется. Используй `width: '100%'` + explicit padding.

---

## 6. Screen recipes

Copy — English (shipped). Product language decision: EN-only для MVP; i18n откладывается до post-launch.

### 1. Notification Settings (`/settings/notifications`)

```
<Screen scroll>
  <NavHeader title="Reminders" />
  <Headline>When should we nudge you?</Headline>
  <Subtitle>Pick a time that fits your day — we'll adapt the rest</Subtitle>

  <Eyebrow>DAILY SCHEDULE</Eyebrow>
  <PillChipRow>            // 4 chips, flex-wrap, gap xs
    <PillChip>09:00</PillChip>
    <PillChip>12:00</PillChip>
    <PillChip active>15:00</PillChip>
    <PillChip>18:00</PillChip>
  </PillChipRow>

  <Eyebrow>MORE OPTIONS</Eyebrow>
  <GlassRow icon="eye" tint="lavender" title="20-20-20 for eyes"
            sub="Every 20 min — 20 sec, 20 ft away" toggle={on} />
  <GlassRow icon="speaker" tint="peach" title="Notification sound"
            sub="Soft tone, never sharp" toggle={on} />
  <GlassRow icon="crown" tint="coral" title="Premium" badge="PRO"
            sub="Sciatica & carpal-tunnel programs"
            onPress={openSubscription} chevron />

  <FloatingCTA withScrim>Continue</FloatingCTA>
</Screen>
```

`<GlassRow>` — композиция `<GlassCard>` + `<IconHalo>` + title row (title + optional badge) + sub + right slot (ToggleSwitch | chevron). Если передан `onPress`, оборачивается в `<Pressable>` с a11y-role/label. Для title — `flex: 1 + minWidth: 0` чтобы ellipsis работал корректно рядом с badge.

`FloatingCTA withScrim` — absolute bottom container + `<LinearGradient>` scrim от `transparent → canvas` (0 → 0.85 → 1) на абсолютный фон, чтобы контент под пилюлей мягко растворялся, а не резко обрезался.

### 2. Thirty-Second Eye Break (`/eye/break`)

Fullscreen standalone (nav header с одной back-стрелкой, без title).

```
<Screen>
  <NavHeader onBack />
  <Center>
    <Eyebrow variant="accent">EYE BREAK</Eyebrow>
    <HeroNumber ghost halo size="xl">30</HeroNumber>
    <Eyebrow variant="accent" size="md">SECONDS</Eyebrow>

    <Headline>Rest{'\n'}your eyes</Headline>
    <BodyText muted align="center">
      Look at a point 20 ft away —{'\n'}let your eye muscles relax
    </BodyText>
    <InlineRow icon="infinity" tone="lavender">
      20 min · 20 sec · 20 ft
    </InlineRow>

    <PillCTA icon="play" breath>Start break</PillCTA>
    <GhostLink>Skip</GhostLink>
  </Center>
</Screen>
```

### 3. Permission Prompt (`/onboarding/permission`)

```
<Screen scroll>
  <IconHalo icon="bell" size="xl" tone="coral" variant="gradient" glow />
  <Eyebrow>REMINDERS</Eyebrow>
  <Headline align="center">Allow gentle{'\n'}nudges</Headline>
  <Subtitle align="center">
    We'll softly remind you when it's time{'\n'}
    to roll your shoulders or look away.{'\n'}No spam, ever.
  </Subtitle>

  <GlassCard tint="peach" innerGradient decorativeCorner>
    <BenefitRow icon="clock"   tone="coral">Every 2 hours · A short 2-minute stretch</BenefitRow>
    <BenefitRow icon="eye"     tone="lavender">20-20-20 for your eyes · A break every 20 minutes</BenefitRow>
    <BenefitRow icon="settings" tone="mint">Full control · Snooze, tune, turn off</BenefitRow>
  </GlassCard>

  <PillCTA icon="bell" breath>Turn on reminders</PillCTA>
  <GhostLink>Not now</GhostLink>
</Screen>
```

### 4. Eye Exercise Session (`/eye/session`)

```
<Screen>
  <NavHeader title="Eye exercise" onBack />
  <Eyebrow>STEP 1 OF 5</Eyebrow>
  <Headline size="sm">Distance focus</Headline>
  <ProgressDots count={5} active={0} />

  <Ring progress={elapsed/30}>
    <AnimatedEye breathing />       // SVG eye silhouette + iris + highlights
    <TimerPill>{mm}:{ss}</TimerPill>
  </Ring>

  <BodyText muted align="center">
    Look at an object{'\n'}20 ft away from you
  </BodyText>

  <TransportRow>
    <IconHalo icon="skip-back" variant="glass" onPress={rewind10} />
    <PillCTA variant="iconOnly" size="xl" icon="pause" />
    <IconHalo icon="check"      variant="glass" onPress={finish} />
  </TransportRow>
</Screen>
```

### 5. No Connection (`/errors/no-connection`)

```
<Screen>
  <Eyebrow>OFFLINE</Eyebrow>
  <ClayIllustration name="wifi-cloud" size={220} />   // floating animated

  <Headline align="center">No network{'\n'}connection</Headline>
  <Subtitle align="center">
    Check your connection or hang tight —{'\n'}we'll retry automatically
  </Subtitle>

  <PillCTA icon="refresh" breath>Try again</PillCTA>
  <GhostLink>Work offline</GhostLink>
</Screen>
```

Note: CTA `variant="primary"` (gradient). Ранее в guide стоял `outlined`, но шипнутый вариант — primary: visually сильнее, match остальным экранам.

### 6. Pain Location + Severity (`/pain/check-in`)

```
<Screen scroll>
  <NavHeader title="How do you feel?" onBack />
  <Headline>Where does it hurt?</Headline>
  <Subtitle>Tap the areas of discomfort — we'll tailor your routine</Subtitle>

  <ZoneRow horizontal>           // horizontal ScrollView, 4 Pressable tiles
    <ZoneTile label="Neck"       icon="infinity" tone="coral"    />
    <ZoneTile label="Shoulders"  icon="plus"     tone="peach"    />
    <ZoneTile label="Upper back" icon="plus"     tone="lavender" />
    <ZoneTile label="Lower back" icon="plus"     tone="mint"     />
  </ZoneRow>

  <GlassCard tint="cream" radius="xl">
    <BodyPainMap painZones={selectedZones} width={220} height={300} />
  </GlassCard>

  <GlassCard tint="peach" innerGradient decorativeCorner>
    <Eyebrow>INTENSITY</Eyebrow>  <Text>{round(pct*10)}/10</Text>
    <SeveritySlider value={pct} onChange={setSeverityPct} />
    <Labels>No pain — Sharp</Labels>
  </GlassCard>

  <Eyebrow>DESCRIBE IT</Eyebrow>
  <PillChipColumn>              // synced with slider (thresholds 1-3 / 4-7 / 8-10)
    <PillChip>Mild discomfort</PillChip>
    <PillChip active icon="check">Moderate pain</PillChip>
    <PillChip>Sharp, hard to work through</PillChip>
  </PillChipColumn>

  <FloatingCTA withScrim icon="check">Save & continue</FloatingCTA>
</Screen>
```

Slider ↔ chip sync: slider value `0..1` мапится через `levelFromPct` (≤0.3 → mild, ≤0.7 → moderate, > → severe). Chip onPress вызывает `pctFromLevel` (mid-range: 0.2 / 0.5 / 0.9). Оба всегда согласованы.

### 7. Sync (`/sync`)

```
<Screen>
  <Eyebrow>PLEASE WAIT</Eyebrow>
  <Center>
    <SoftAura pulsing />            // radial coral backdrop, scale loop
    <PulseRings size={260} rings={4} />
  </Center>
  <Headline align="center">Syncing{'\n'}your data</Headline>
  <Subtitle align="center">
    Saving your stretch progress and{'\n'}reminder preferences
  </Subtitle>
</Screen>
```

Flow note: screen auto-redirects to `/errors/no-connection` после ~2.4s (hardcoded for design-review demo — заменить на реальный sync-status в Stage 6).

---

## 7. Motion & haptics

### Motion (reanimated 4)

| Element | Animation | Duration | Easing |
|---|---|---|---|
| `PillCTA` press | scale 1 → 0.98 | 120ms | easeOut |
| `GlassCard` enter | opacity 0→1 + translateY 12→0 | 300ms | easeOut |
| `ToggleSwitch` thumb | translateX | 180ms | easeInOut |
| `PulseRings` | scale 0.8→1.2 + opacity 0.4→0, loop, stagger 200ms per ring | 1600ms | easeInOut |
| `BodyPainMap` dots | opacity 0.5→1.0, loop | 1600ms | easeInOut |
| `HeroNumber` enter | scale 0.92→1 + opacity 0→1 | 400ms | easeOut |
| Screen transition | stack push (iOS) / shared axis (Android) | 300ms | — |

`prefers-reduced-motion` → все loop/scale анимации → fade-only.

### Haptics (expo-haptics)

| Trigger | Haptic |
|---|---|
| `PillCTA` primary tap | `Haptics.impactAsync(Heavy)` |
| `PillChip` select | `Haptics.selectionAsync()` |
| `ToggleSwitch` flip | `Haptics.selectionAsync()` |
| `ProgressDots` dot tap | `Haptics.selectionAsync()` |
| CTA success (save) | `Haptics.notificationAsync(Success)` |
| Error toast | `Haptics.notificationAsync(Error)` |

---

## 8. Accessibility

- Все Pressable — `accessibilityRole="button"` + `accessibilityLabel`.
- Toggle — `accessibilityRole="switch"` + `accessibilityState={{checked}}`.
- Hero numbers — `accessibilityLabel="30 секунд"` (не «тридцать» — let screen reader decide).
- Color contrast: `ink` на `canvas` = 15.6:1 ✓. `inkMuted` на `canvas` = 7.8:1 ✓. `white` на `primaryMid` (#E87B4E) = 3.3:1 — **на границе 3:1 для large text**. Поэтому на CTA всегда используй `body > 14pt bold` чтобы сохранить large-text AA.
- Touch targets ≥ 44×44pt everywhere.
- VoiceOver/TalkBack: group Settings row так, чтобы read-out был "20-20-20 таймер для глаз, включено, кнопка".
- Reduce Motion: отключаем looping анимации (PulseRings, BodyPainMap dots).

---

## 9. Anti-patterns (graveyard)

| ❌ Не делай | ✅ Делай |
|---|---|
| `border: 1px solid #...` для карточек | tonal shift / shadow / gutter |
| Flat `#E87B4E` CTA fill | 3-stop `ctaCoral` gradient + top-inner highlight + coral glow |
| `shadowColor: '#000000'` | warm `#9D431A`/`#E87B4E` с opacity 0.05-0.35 |
| `fontStyle: 'italic'` в Plus Jakarta | Regular + muted для soft лайнов |
| `ScrollView` вокруг `AtmosphericBackground` | Background — absolute full-bleed вне ScrollView |
| `flex: 1` внутри BlurView | `width: '100%'` + explicit height/padding |
| "MicroMove" как продакт-имя | **DeskCare** — canonical brand |
| Photo-JPG body map | SVG silhouette с animated pulse-dots |
| Pure `#000` / `#FFF` text | `ink` (#1B1C1A) / `canvas` (#FBF9F5) |
| Material default Switch | `<ToggleSwitch>` глянцевый стеклянный |
| `router.back()` на deep-linked modal | `canGoBack() ? back() : replace('/(tabs)')` |
| Centering длинных заголовков | Left-align editorial, center — только ≤5 слов hero |

---

## 10. Pre-commit checklist

Перед коммитом любого экрана проверь:

- [ ] Экран обёрнут в `<Screen>` / `<AtmosphericBackground>`
- [ ] Нет inline styles — всё через StyleSheet.create
- [ ] Нет inline `#hex` — только `colors.*` из `tokens.ts`
- [ ] Все Pressable имеют `accessibilityLabel`
- [ ] Все primary CTAs — `<PillCTA>` (не ручной View + Text)
- [ ] Все карточки — `<GlassCard>` (не ручной View с `backgroundColor`)
- [ ] ScrollView имеет `paddingBottom: insets.bottom + 140` (clearance для CTA/tabs)
- [ ] Haptic подвязан на primary action
- [ ] Screen rendered корректно в Reduce Motion (нет непрерывных loops без fade-fallback)
- [ ] Test на iPhone SE (width 375) + iPhone 15 Pro Max (width 430) — текст не обрезается, CTAs не вылазят

---

## 11. Roadmap (следующие экраны не в этом batch)

Из [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md) у нас всего 39 экранов. В этом batch только 7. В следующие итерации:

- Onboarding flow (Welcome, 4 quiz steps, Labor Illusion, Personal Plan, Paywall) — см. [STITCH-PROMPTS.md](./STITCH-PROMPTS.md) промпты #1–#3
- Home (4 states) — промпт #4
- Library + Exercise Detail — #5
- Programs + Sciatica + Eye Program — #6, #7
- Exercise Player + Session Complete — #8
- Profile + Progress + Pain History — #9
- Settings stack (расширение экрана 1) — #10
- Остальные модалки — #11, #12
- Auth + System — #13

Каждый новый batch повторяет пайплайн stitch-to-native-ui: pull screens → inspect → DESIGN-GUIDE (append, а не replace) → build screens из тех же primitives.

---

## Источники

- [Stitch designTheme.designMd](./stitch-raw/design-theme.json) — «The Radiant Sanctuary» brand framework
- [Stitch screenshots](./stitch-raw/screenshots/) — 7 референсов
- [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md) — полная карта 39 экранов
- [UX-SPEC.md](../04-ux/UX-SPEC.md) — UX-принципы, haptics, a11y
- [stitch-to-native-ui skill](~/.claude/skills/stitch-to-native-ui/SKILL.md) — пайплайн
- [FixIt reference](../../../fixit/) — предыдущая реализация того же пайплайна (Noir mood)
