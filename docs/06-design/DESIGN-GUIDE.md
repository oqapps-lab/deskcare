# DeskCare — Design Guide

**Версия:** 1.0  
**Дата:** 24 апреля 2026  
**Источники:** Stitch v2 скриншоты + `docs/02-product/` + `docs/04-ux/`  
**Стек:** Expo SDK 55, React Native, iOS + Android

> **Правило приоритетов:** `docs/04-ux/` — источник истины по структуре и функциональности. Stitch — источник визуального стиля. Когда они противоречат — берём функционал из UX-доков, адаптируем визуал из Stitch.

---

## 1. TL;DR

**Берём из Stitch:**
- Палитру: холодный почти-белый фон, тёмный голубой (#00677d) как primary, светлый голубой (#00b4d8) как accent
- Форму всего: радиусы таблетки и 3rem-карточки, нулевые линии-разделители
- Типографику: Manrope для заголовков, Inter для тела
- Паттерны поверхностей: тональное слоение вместо теней и бордеров
- Home Dashboard, Exercise Player, Routine Preview, Settings, Profile — их компоновку

**Выбрасываем из Stitch:**
- Sci-fi язык: никаких «Telemetry», «Operator», «Luminance History Field», «Artifacts», «Initiate Recalibration»
- «Mindfulness» и «Guided Breathwork» — они в Won't Have по `FEATURES.md`
- «Connected Devices» / «Health Sync» — фича v2.0, не MVP
- «Shoulders» как отдельную зону — по продукту зоны: Neck, Back, Eyes, Wrists
- Дублирующий экран Settings (был v1 + v2; оставляем один)

**Апгрейдим относительно Stitch:**
- Home: добавляем Streak widget + Pain check-in баннер (есть в `WIREFRAMES.md`, нет в Stitch v2)
- Body Zones: меняем сетку Eyes/Neck/Shoulders/Lower Back → Neck/Back/Eyes/Wrists
- Progress-экран: добавляем график боли по зонам (`Pain History`) — Stitch v2 показывает только активность
- Settings: добавляем Eye break toggle, Dark mode, Subscription management, Export data — по `WIREFRAMES.md`
- «Today's Score» оставляем, но добавляем ссылку-пояснение «Что это?»

---

## 2. Цвета

```
// constants/colors.ts

export const Colors = {
  // Фоны
  canvas:          '#f2f6f8',  // основной фон экрана
  surface:         '#ffffff',  // карточки, поверх canvas
  surfaceLow:      '#eceef0',  // вложенные блоки, неактивные чипы
  surfaceHighest:  '#e0e3e5',  // secondary button, input fill

  // Основной голубой
  primary:         '#00677d',  // кнопки, активный таб, активный тогл
  primaryLight:    '#00b4d8',  // accent, progress bars, вторичные акценты
  primaryFixed:    '#4cd6fb',  // числа в holographic-режиме (опционально)

  // Текст
  onSurface:       '#191c1e',  // основной текст (не чистый чёрный)
  onSurfaceVar:    '#3d494d',  // вторичный текст, подписи
  outline:         '#bcc9ce',  // ghost-border (только при opacity 0.15)

  // Служебные
  error:           '#ba1a1a',
  success:         '#1a6b3c',
  warning:         '#7d5700',
};
```

**Градиент CTA:**
```ts
// gradient для PrimaryButton и активных badge
linearGradient: ['#00677d', '#00b4d8']  // 135deg или left→right
```

**Правило:** текст всегда `onSurface`, никогда `#000000`. Числа-метрики (стрик, минуты, score) — `primary` или `primaryLight`. Ошибки — `error`.

---

## 3. Типографика

Шрифты: **Manrope** (заголовки и акценты) + **Inter** (тело и мелкие подписи).

```
// constants/typography.ts

export const Typography = {
  display:   { fontFamily: 'Manrope', fontSize: 56, fontWeight: '700', lineHeight: 64 },
  // — большие числа: score, стрик, суммарные минуты

  h1:        { fontFamily: 'Manrope', fontSize: 28, fontWeight: '700', lineHeight: 36 },
  // — заголовок экрана (Routine Preview, Settings)

  h2:        { fontFamily: 'Manrope', fontSize: 22, fontWeight: '700', lineHeight: 30 },
  // — заголовок секции (Body Zones, Quick Relief, Badges)

  h3:        { fontFamily: 'Manrope', fontSize: 18, fontWeight: '600', lineHeight: 26 },
  // — название карточки упражнения, название рутины

  body:      { fontFamily: 'Inter',   fontSize: 15, fontWeight: '400', lineHeight: 22 },
  // — основной текст описаний

  bodyMd:    { fontFamily: 'Inter',   fontSize: 13, fontWeight: '400', lineHeight: 20 },
  // — вторичные подписи, meta-данные (duration, sets)

  label:     { fontFamily: 'Inter',   fontSize: 12, fontWeight: '500', lineHeight: 16 },
  // — бейджи, фильтры, теги зон (NECK, BACK)

  caption:   { fontFamily: 'Inter',   fontSize: 11, fontWeight: '400', lineHeight: 16 },
  // — мелкий текст: версия приложения, legal
};
```

**Примеры применения:**

| Элемент | Стиль |
|---|---|
| Число стрика / score | `display` + `primaryLight` |
| Заголовок «Tension Release» | `h1` + `onSurface` |
| «Body Zones», «Badges» | `h2` + `onSurface` |
| Название упражнения в списке | `h3` + `onSurface` |
| Описание рутины | `body` + `onSurfaceVar` |
| «3 sets • 10 reps» | `bodyMd` + `onSurfaceVar` |
| Бейдж «NECK» | `label` uppercase + `primary` |

---

## 4. Поверхности

**Принцип слоения (без теней, без линий):**

```
canvas (#f2f6f8)
  └── surface (#ffffff)          ← карточки поверх фона
        └── surfaceLow (#eceef0) ← вложенные чипы, неактивные элементы
```

**Карточки:**
- `backgroundColor: surface`, `borderRadius: 24` (3rem ≈ 24pt на мобиле)
- Никаких `borderWidth`. Граница — только тональный сдвиг
- Если нужна граница для a11y: `outline` (#bcc9ce) при `opacity: 0.15`

**Floating-элементы (modal, tab bar, bottom sheet):**
```ts
// Frosted glass эффект
backgroundColor: 'rgba(242, 246, 248, 0.85)'
backdropFilter:  'blur(20px)'  // через react-native-blur или expo-blur
```

**Ambient shadow (только для FAB и primary CTA):**
```ts
shadowColor: '#00677d'
shadowOpacity: 0.07
shadowRadius: 32
elevation: 8  // Android
```

**Правила:**
- Никаких серых `#00000020` теней
- Никаких `borderWidth: 1`
- Разделение контента — отступами (`gap: 16–24`) или сменой `backgroundColor`

---

## 5. Примитивы

Список компонентов, которые нужны под наши экраны (по `SCREEN-MAP.md`):

| # | Компонент | Роль | Где используется |
|---|---|---|---|
| 1 | `PrimaryButton` | Главный CTA. Градиентный таблетка-пилл, `height: 56`, полная ширина | Routine Preview, Paywall, Onboarding, Session Complete |
| 2 | `SecondaryButton` | Вторичное действие. `surfaceHighest`, без градиента | Exercise Player (Skip), модалы |
| 3 | `TabBar` | Bottom nav 4 таба: Home / Library / Programs / Profile. Активный таб — пилл с `primary` | Все основные экраны |
| 4 | `BodyZoneCard` | Квадратная карточка зоны. Иконка + лейбл + прогресс-бар снизу. 2×2 сетка | Home |
| 5 | `StreakWidget` | Карточка стрика: число дней + иконка огня + 7-дневный календарь-ряд | Home |
| 6 | `RecommendedCard` | Карточка рекомендованной рутины: зона, название, длительность, кнопка Start | Home |
| 7 | `EyeBreakBanner` | Inline-баннер: «Глаза устали? 30 сек» с кнопкой запуска | Home |
| 8 | `PainCheckInBanner` | Inline-баннер: «Оценить боль сегодня →» с открытием BottomSheet | Home |
| 9 | `ExerciseCard` | Карточка в библиотеке: thumbnail + название + длительность + зона + Free/🔒 бейдж + ♡ | Library |
| 10 | `RoutineRow` | Строка упражнения в превью рутины: иконка/фото + название + meta + play-кнопка | Routine Preview |
| 11 | `CircularTimer` | Кольцевой прогресс + обратный таймер в центре. Цвет кольца — `primaryLight` | Exercise Player |
| 12 | `CoachingCue` | Крупный текст подсказки + subtitle с названием упражнения | Exercise Player |
| 13 | `TransportControls` | Previous / Pause(Play) / Next. Pause — крупный тёмный пилл, остальные — серые круги | Exercise Player |
| 14 | `QuizCard` | Карточка-выбор в онбординге: иконка + заголовок + описание. Активная — `surfaceLow` + левая голубая полоска | Onboarding quiz |
| 15 | `ProgressQuizBar` | Прогресс онбординга. Быстрый рост в начале (Goal Gradient Effect) | Onboarding |
| 16 | `PainSlider` | Слайдер 1–10, emoji по краям (😣 😊), текущее значение над ползунком | Session Complete, Pain Check-in |
| 17 | `BadgeGrid` | Сетка 2×2: milestone badges 3/7/14/30 дней. Выполненные — тёмный, заблокированные — серый | Progress, Profile |
| 18 | `InlineAlert` | Баннер-ошибка/оффлайн внизу экрана без блокировки контента | Все экраны |
| 19 | `Toggle` | Системный Switch, цвет трека — `primary` при ON | Settings |
| 20 | `BottomSheet` | Полупрозрачный draggable sheet. Используется для Pain Check-in, mini-Paywall | Модалы |

---

## 6. Layout

```ts
// constants/layout.ts

export const Layout = {
  // Горизонтальные отступы
  screenPadding:   20,   // px, стандартный padding экрана
  cardPadding:     16,   // внутри карточек
  sectionGap:      24,   // между секциями одного экрана
  cardGap:         12,   // между карточками в списке

  // Вертикаль
  headerHeight:    56,   // высота хедера
  tabBarHeight:    64,   // высота tab bar (+ safe area inset снизу)

  // Touch targets (a11y минимум)
  minTouchTarget:  44,   // pt для iOS, 48dp для Android

  // Радиусы
  radiusFull:      9999, // кнопки, чипы, тоглы
  radiusCard:      24,   // карточки (≈ 3rem)
  radiusSmall:     12,   // вложенные элементы (thumbnail, avatar)

  // Колонки (Home Body Zones)
  bodyZoneCols:    2,
  bodyZoneGap:     12,
};
```

**Safe areas:** обязательно `useSafeAreaInsets()` на всех экранах. Tab bar учитывает `insets.bottom`, хедер — `insets.top`.

**3-Layer Layout System (из CLAUDE.md):**
```
1. Background  — absolute, gradients/images, НЕ внутри ScrollView
2. Content     — flex/scroll с screenPadding
3. Floating UI — absolute, tab bar + bottom CTAs + header
```

**Изображения:** всегда `aspectRatio` + `resizeMode: 'cover'`. Никаких фиксированных `height` для фото.

---

## 7. Screen Recipes

### 7.1. Home Screen (`HOME-01`)

**Структура (по `WIREFRAMES.md` §4, визуал из Stitch home_dashboard):**

```
SafeAreaView
  ScrollView (contentContainerStyle: { paddingHorizontal: 20, gap: 16 })
    StreakWidget          ← стрик + 7-дневный ряд
    RecommendedCard       ← персонализированная рутина
    EyeBreakBanner        ← если время для глаз (или вообще)
    <SectionTitle>Body Zones
    <FlatList 2-col>      ← BodyZoneCard × 4 (Neck, Back, Eyes, Wrists)
    PainCheckInBanner     ← если сегодня не заполнен pain check-in
  TabBar (position: absolute, bottom: 0)
```

**Данные:** имя пользователя, стрик, recommended рутина по профилю, наличие pain check-in за сегодня  
**Действия:** BodyZoneCard → Routine Preview; RecommendedCard → Routine Preview; EyeBreakBanner → Eye Exercise; PainCheckInBanner → BottomSheet

---

### 7.2. Exercise Player (`EX-02`)

**Структура (по `WIREFRAMES.md` §7, визуал из Stitch exercise_player):**

```
View (fullscreen, backgroundColor: canvas)
  View (absolute, top) ← CloseButton (×) + SET_COUNTER + MoreMenu (···)
  CoachingCue          ← крупный текст подсказки + subtitle название упражнения
  CircularTimer        ← поверх/под фото инструктора (полупрозрачное фото фоном)
  ProgressDots         ← ● ● ○  (текущее из N)
  TransportControls    ← Previous | Pause | Next
```

**Нет tab bar.** Плеер — полноэкранный, скрывает навигацию.  
**Аудио-тогл:** иконка в углу, работает без звука (важно для офиса).  
**Coaching cue:** конкретная техническая подсказка («Keep your chin tucked»), не мотивационные фразы.

---

### 7.3. Routine Preview (`EX-01`)

**Структура (по `WIREFRAMES.md` §6, визуал из Stitch routine_preview):**

```
View (flex: 1)
  View (height: 280, overflow: hidden)  ← hero-фото инструктора (aspectRatio 3:4)
  View (absolute, bottom: -1, left: 0, right: 0)  ← white card начинается поверх фото
    <ZoneBadge>NECK   <Duration>15 min   <Level>Beginner
    <h1>Tension Release
    <body>Описание рутины
    <SectionTitle>Movements
    FlatList ← RoutineRow × N
  PrimaryButton (position: absolute, bottom: safeInset)  ← Start Routine
```

**Бейдж зоны:** `label` uppercase + `primary` цвет — NECK / BACK / EYES / WRISTS. Не «RECOVERY», не «MORNING».

---

### 7.4. Onboarding Quiz (шаг «Зона боли», `ONB-03`)

**Структура (по `WIREFRAMES.md` §2, визуал из Stitch intake):**

```
SafeAreaView
  View (paddingHorizontal: 20)
    BackButton (←)
    ProgressQuizBar (value: 0.2)
    <h1>Which area needs attention most?
    <gap: 12>
    QuizCard (Neck & Shoulders)   ← выбрана → surfaceLow + синяя полоска слева
    QuizCard (Lower Back)
    QuizCard (Eyes & Head)
    QuizCard (Wrists & Hands)
    <Spacer flex: 1>
    PrimaryButton "This is my focus →"
    TextButton "Skip" (мелкий, под кнопкой)
```

**Можно выбрать несколько** (multi-select). Выбранная карточка: `surfaceLow` фон + 3px левый бордер `primary`.

---

## 8. Motion & Haptics

**Transitions:**

| Переход | Анимация | Длительность |
|---|---|---|
| Tab → Tab | Cross-fade | 200ms |
| Screen → Screen (stack) | Slide from right | 300ms |
| Modal / Paywall | Slide from bottom | 350ms |
| Exercise Player | Slide from bottom (fullscreen) | 350ms |
| Quiz шаг → шаг | Shared axis (slide + fade) | 300ms |

**Ключевые анимации:**
- **ProgressQuizBar:** fill, ease-out, 400ms при переходе между шагами
- **Body Zone tap:** scale 0.96 → 1.0 + pulse glow `primary` 200ms
- **Streak update:** count-up + confetti 500ms (Session Complete)
- **Milestone badge:** bounce-in + glow 1.5 сек
- **Labor Illusion:** progress 0→100% + пульсирующие точки, 3–5 сек

**Haptics (все через `Haptics.impactAsync()` из expo-haptics):**

| Действие | Тип |
|---|---|
| Нажатие PrimaryButton | `ImpactFeedbackStyle.Light` |
| Выбор в quiz | `ImpactFeedbackStyle.Light` |
| Обновление стрика | `NotificationFeedbackType.Success` |
| Milestone | `ImpactFeedbackStyle.Heavy` |
| Ошибка / payment failed | `NotificationFeedbackType.Error` |
| Drag слайдера боли | `ImpactFeedbackStyle.Light` (continuous) |

**Reduce Motion:** при `useReducedMotion() === true` — fade вместо slide, убираем confetti, убираем pulse.

---

## 9. Антипаттерны

**Никогда не делать:**

1. **Sci-fi язык.** «Telemetry», «Operator Profile», «Initiate Recalibration», «Luminance History Field», «Artifact Collection» — не используем. Язык простой: «Your Progress», «Profile», «Start Session», «Activity», «Badges».

2. **Mindfulness и breathwork.** «Guided Breathwork», «Stay Present», Mindfulness как зона фокуса — не MVP. Конкурируем с Calm/Headspace по функции, а не по стилю.

3. **Острые углы.** `borderRadius: 0` или `borderRadius: 4` — не для DeskCare. Минимум `borderRadius: 12` для самых маленьких элементов.

4. **Серые тени.** `shadowColor: '#000'` — выглядит «грязно» на нашем светлом фоне. Только тонированные ambient: `shadowColor: primary` при `opacity: 0.07`.

5. **Линии-разделители.** Никаких `borderBottomWidth: 1`. Разделение — отступом или сменой `backgroundColor`.

6. **Чистый чёрный текст.** `color: '#000000'` — не используем. Всегда `onSurface: '#191c1e'`.

7. **«Shoulders» как отдельная зона.** Зоны строго: Neck, Back, Eyes, Wrists. «Shoulders» — часть Neck & Shoulders в онбординге, не отдельный Body Zone Card.

8. **Фичи v2.0 в MVP UI.** Connected Devices, Health Sync, Wearables, AI Form Correction — в интерфейсе не показываем до v2.0.

---

## 10. Pre-commit Checklist

Перед каждым PR с UI-изменениями проверить:

- [ ] **Навигация:** табы — Home / Library / Programs / Profile. Никаких «Sanctuary», «Flow», «Vitals».
- [ ] **Зоны тела:** Neck / Back / Eyes / Wrists. Не Shoulders, не Mindfulness, не Full Body в Body Zone Grid.
- [ ] **Язык:** нет sci-fi терминов. Копи проходит «понял бы Алексей-менеджер?» тест.
- [ ] **Цвета:** нет `#000000`, нет серых теней (`shadowColor: '#000'`), нет `borderWidth > 0` как декоративных разделителей.
- [ ] **Радиусы:** все интерактивные элементы `borderRadius >= 12`, кнопки `borderRadius: 9999`.
- [ ] **Touch targets:** все кнопки и карточки `minHeight: 44` (iOS) / `minHeight: 48` (Android).
- [ ] **Safe areas:** `useSafeAreaInsets()` подключён на каждом новом экране.
- [ ] **Haptics:** `Haptics.impactAsync()` вызывается на каждом PrimaryButton `onPress`.
- [ ] **Изображения:** `aspectRatio` проставлен, нет фиксированных `height` для фото.
- [ ] **Фичи v2.0:** в PR нет Connected Devices, Health Sync, Wearables, AI-функций.

---

## Источники

- `docs/02-product/FEATURES.md` — MVP scope, Won't Have
- `docs/02-product/TARGET-AUDIENCE.md` — персоны и JTBD
- `docs/02-product/PRODUCT-VISION.md` — product canvas, KPI
- `docs/03-practices/ONBOARDING-RESEARCH.md` — онбординг-паттерны
- `docs/04-ux/SCREEN-MAP.md` — карта экранов
- `docs/04-ux/WIREFRAMES.md` — структура каждого экрана
- `docs/04-ux/UX-SPEC.md` — UX-принципы, haptics, transitions, accessibility
- `docs/06-design/stitch-raw/design-theme.json` — токены из Stitch
- `docs/06-design/stitch-raw/screenshots/` — визуальные референсы v2
