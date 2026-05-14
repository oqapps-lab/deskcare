# DeskCare — Design Guide

**Версия:** 2.1  
**Дата:** 14 мая 2026  
**Источник истины:** код в `/app/`, `/components/primitives/`, `/constants/tokens.ts`  
**Стек:** Expo SDK 55, React Native, iOS + Android

---

## 1. TL;DR

**Принципы текущего дизайна:**
- Минимализм и чистота: белые карточки на светлом `canvas`, никакого glassmorphism на основных экранах
- Тональное слоение вместо теней и бордеров
- Органические формы: радиус-таблетки для кнопок и nav, асимметричные «камушки» для деталей
- Два шрифта: CormorantGaramond (serif, заголовки и hero-числа) + Inter (sans-serif, тело и подписи)
- Единственный акцент — `primary` (#00677d). `primaryLight` (#00b4d8) только в свечениях и nav

**Что НЕ используем:**
- Glassmorphism на домашних карточках (убрано в v2)
- Цветные фоновые блобы/градиенты на Home
- Glow-бордеры (`borderColor` с opacity) на интерактивных элементах
- Тени серого цвета (`shadowColor: '#000'`)
- `borderWidth` как декоративные разделители

---

## 2. Цвета

```ts
// constants/tokens.ts

export const Colors = {
  // Фоны
  canvas:           '#F8F9FA',  // нейтральный светло-серый, карточки читаются на нём
  surface:          '#ffffff',  // карточки, sheet, поверхности
  surfaceLow:       '#E2F4F8',  // вложенные блоки, неактивные чипы, dayBox
  surfaceHighest:   '#CDEAF1',  // secondary button, input fill

  // Основной синий
  primary:          '#2271B3',  // кнопки, активный таб, hero-числа, акценты
  primaryLight:     '#4A9FD9',  // только BottomNav activePill, PillCTA glow
  primaryFixed:     '#85C4EA',  // зарезервирован, не используется в v1

  // Текст
  onSurface:        '#191c1e',
  onSurfaceVar:     '#3d494d',
  onPrimary:        '#ffffff',

  // Outline
  outline:          '#bcc9ce',  // chevron-иконки, ghost-бордер

  // Semantic
  error:            '#ba1a1a',
  success:          '#1a6b3c',
  warning:          '#7d5700',

  // Gradient endpoints
  gradientStart:    '#2271B3',
  gradientEnd:      '#4A9FD9',
};
```

**Специальные цвета вне токенов:**
```ts
// Свечение камушков-дней (Home, StreakWidget)
const PEBBLE_GLOW = '#7DC0E8';  // мягкий голубой

// Light leaks (Welcome screen)
const LEAK_COLOR = 'rgba(34, 113, 179, 0.13)';

// PillCTA градиент по умолчанию
const CTA_GRADIENT = ['#2271B3', '#4A9FD9'];

// Welcome CTA градиент
const WELCOME_CTA_GRADIENT = ['rgba(74, 159, 217, 0.30)', '#1A5E9A'];
```

**Правило:** текст всегда `onSurface`/`onSurfaceVar`, никогда `#000000`. Hero-числа (стрик) — `primary`. Тени только тонированные, не серые.

---

## 3. Типографика

Шрифты: **CormorantGaramond** (display, h1–h3, brand) + **Inter** (body, labels, meta).

```ts
// constants/tokens.ts

export const FontFamily = {
  displaySerif:      'CormorantGaramond-SemiBold',
  displaySerifLight: 'CormorantGaramond-Regular',
  displaySerifItalic:'CormorantGaramond-Italic',
  interRegular:      'Inter-Regular',
  interMedium:       'Inter-Medium',
};

export const Typography = {
  display: { fontFamily: 'CormorantGaramond-SemiBold', fontSize: 56, lineHeight: 66, letterSpacing: 0.2 },
  h1:      { fontFamily: 'CormorantGaramond-SemiBold', fontSize: 32, lineHeight: 40, letterSpacing: 0.1 },
  h2:      { fontFamily: 'CormorantGaramond-SemiBold', fontSize: 24, lineHeight: 32, letterSpacing: 0.1 },
  h3:      { fontFamily: 'CormorantGaramond-SemiBold', fontSize: 20, lineHeight: 28, letterSpacing: 0.1 },
  body:    { fontFamily: 'Inter-Regular', fontSize: 15, lineHeight: 22 },
  bodyMd:  { fontFamily: 'Inter-Regular', fontSize: 13, lineHeight: 20 },
  label:   { fontFamily: 'Inter-Medium',  fontSize: 12, lineHeight: 16 },
  caption: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 16 },
};
```

**Hero-числа (вне Typography):**
```ts
// Стрик на Home screen
{
  fontFamily: 'CormorantGaramond-Regular',
  fontSize: 52,
  lineHeight: 52,
  color: Colors.primary,
  letterSpacing: -1,
}

// Brand на Welcome screen
{
  fontFamily: 'CormorantGaramond-SemiBold',
  fontSize: 20,
  letterSpacing: 3,
  color: '#ffffff',
}

// Headline на Welcome screen
{
  fontFamily: 'CormorantGaramond-SemiBold',
  fontSize: 38,
  lineHeight: 48,
  letterSpacing: 0.2,
}
```

---

## 4. Поверхности

**Принцип слоения:**
```
canvas (#f2f6f8)
  └── surface (#ffffff)            ← Card elevated, sheet, infoRow
        └── surfaceLow (#eceef0)   ← вложенные чипы, exNum, dayBox (неактивный), infoIcon
```

**Карточки (`Card elevated`):**
```ts
{
  backgroundColor: Colors.surface,   // #ffffff
  borderRadius: 28,
  padding: 16,
  shadowColor: Colors.primary,       // #00677d
  shadowOpacity: 0.07,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
}
```

**Floating island (BottomNav):**
```ts
{
  backgroundColor: 'rgba(255, 255, 255, 0.88)',
  backdropFilter: 'blur(20px)',      // только web
  borderRadius: 32,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.95)',
  shadowColor: Colors.primary,
  shadowOpacity: 0.12,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 10,
}
```

**Info-строки (Eye Break, Pain Check-in на Home):**
```ts
{
  backgroundColor: Colors.surface,
  borderRadius: Radii.md,  // 16
  padding: 16,
  flexDirection: 'row', alignItems: 'center', gap: 12,
}
```

**Правила:**
- Никаких `borderWidth` как декора
- Никаких серых теней (`shadowColor: '#000'`)
- Никакого glassmorphism (`rgba(255,255,255,0.78)`) на основных карточках
- Glassmorphism разрешён только на BottomNav и Welcome light leaks

---

## 5. Радиусы

```ts
export const Radii = {
  sm:   12,   // infoIcon, exNum, dayBox
  md:   16,   // exRow, infoRow
  lg:   24,   // hero sheet overlap (routine), zone cards
  full: 9999, // PillCTA, BottomNav island, activePill
};
```

**Пебблы (dayBox в StreakWidget):**  
Каждый из 7 дней имеет уникальный набор из 4 разных радиусов — органическая форма «камушка». Радиусы захардкожены массивом `PEBBLE` в `home.tsx`.

---

## 6. Layout

```ts
export const Layout = {
  screenPadding:  20,
  cardPadding:    16,
  sectionGap:     24,
  cardGap:        12,
  minTouchTarget: 44,
  headerHeight:   56,
  tabBarHeight:   64,
  bodyZoneCols:   2,
};
```

**Safe areas:** `useSafeAreaInsets()` обязателен на каждом экране.

**3-Layer Layout System:**
```
1. Background  — absolute, fullscreen фото/градиент, НЕ внутри ScrollView
2. Content     — ScrollView с screenPadding (20px горизонталь)
3. Floating UI — absolute, BottomNav внизу, TopBar/IconButton вверху
```

---

## 7. Примитивы

| Компонент | Файл | Статус | Описание |
|---|---|---|---|
| `Card` | `Card.tsx` | ✅ | `elevated` (белый + тень) или `bg={color}` |
| `Text` + `H1`/`H2` | `Text.tsx` | ✅ | variant prop: display, h1–h3, body, bodyMd, label, caption |
| `PillCTA` | `PillCTA.tsx` | ✅ | Градиентная кнопка-таблетка, h=56, haptics |
| `BottomNav` | `BottomNav.tsx` | ✅ | Floating island, 4 таба, activePill |
| `Badge` | `Badge.tsx` | ✅ | variant="zone": NECK/BACK/EYES/WRISTS |
| `Divider` | `Divider.tsx` | ✅ | Вертикальный отступ: xs/sm/md/lg/xl/xxl/xxxl |
| `IconButton` | `IconButton.tsx` | ✅ | variant="ghost" для hero-бара |
| `GhostButton` | `GhostButton.tsx` | ✅ | Вторичное действие |
| `HeroNumber` | `HeroNumber.tsx` | ✅ | Крупное число с Cormorant |
| `ProgressBar` | `ProgressBar.tsx` | ✅ | Линейный прогресс |
| `Toggle` | `Toggle.tsx` | ✅ | Switch, цвет трека `primary` при ON |
| `TopBar` | `TopBar.tsx` | ✅ | Хедер экрана |
| `Eyebrow` | `Eyebrow.tsx` | ✅ | Надпись над заголовком |
| `Stat` | `Stat.tsx` | ✅ | Число + подпись |
| `Screen` | `Screen.tsx` | ✅ | SafeAreaView обёртка |

**Не реализованы (нужны для следующих экранов):**
`CircularTimer`, `CoachingCue`, `TransportControls`, `QuizCard`, `ProgressQuizBar`, `PainSlider`, `BadgeGrid`, `BottomSheet`, `InlineAlert`

---

## 8. Screen Recipes

### 8.1. Welcome Screen (`app/index.tsx`)

```
View (root, backgroundColor: #ffffff)
  Image (absoluteFill, hero yoga photo, contentFit: cover)
  LinearGradient (absoluteFill, white fade bottom: transparent → 0.78 → #fff)
  View × 4 (corners, light leaks — cyan gradient rgba(0,200,230,0.13))
  View (brand top-left, DESKCARE, CormorantGaramond-SemiBold, white, letterSpacing 3)
  View (bottom absolute)
    Text (headline, Cormorant 38px, «2 минуты в день — шея перестанет болеть»)
    Text (sub, Inter 16px, onSurfaceVar)
    PillCTA («Начать», градиент rgba(0,230,245,0.22)→#009DB5, labelGlow)
    Pressable («Войти»)
```

### 8.2. Home Screen (`app/home.tsx`)

```
View (root, backgroundColor: canvas #f2f6f8)
  StatusBar dark-content
  ScrollView (paddingH: 20, paddingBottom: tabBar + safe area)
    Header (имя + шестерёнка)
    Card elevated ← StreakWidget
      Row: heroNumber (52px Cormorant primary) + flame icon
      Row: 7 × dayBox (pebble shape — уникальные асимметричные радиусы)
        inactive: surfaceLow, active: surface + sky-blue glow (#72b8f8, opacity 0.28)
    Card elevated ← RecommendedCard
      Badge zone + h2 название + bodyMd «N мин · N упражнения»
      PillCTA «Начать рутину»
    H2 «Выберите зону»
    FlatList 2-col ← BodyZoneCard × 4 (photo + dark gradient overlay)
    infoRow ← Eye Break (иконка eye + текст + chevron)
    infoRow ← Pain Check-in (иконка analytics + текст + chevron)
  BottomNav (absolute bottom)
```

**Ключевые детали StreakWidget:**
- `PEBBLE` — массив из 7 объектов с 4 borderRadius каждый (tl/tr/bl/br от 11 до 23)
- Активный dayBox: `backgroundColor: Colors.surface`, `shadowColor: '#72b8f8'`, `shadowOpacity: 0.28`, `shadowRadius: 10`
- Текст активного дня: `Colors.primary`, `fontWeight: '600'`

### 8.3. Routine Preview (`app/routine.tsx`)

```
View (root, backgroundColor: canvas)
  View (hero, height: 320, overflow: hidden)
    Image (absoluteFill, зонное фото)
    LinearGradient (тёмный сверху 0.10 → 0.38 → прозрачный)
    View (heroBar) ← IconButton назад (ghost) + IconButton bookmark (ghost)
  View (sheet, backgroundColor: surface, borderTopRadius: 24, marginTop: -24)
    ScrollView
      metaRow: Badge + time + level
      h1 название + body описание
      h2 «Упражнения» + список exRow
        exNum (surfaceLow circle) + exText + play-circle icon
      Card (surfaceLow) ← Целевые мышцы
    View (ctaWrap, backgroundColor: surface)
      PillCTA «Начать рутину»
```

---

## 9. Детальные паттерны

### Pebble Day Selector

Уникальность форм достигается массивом `PEBBLE` в `home.tsx`:

```ts
const PEBBLE = [
  { borderTopLeftRadius: 16, borderTopRightRadius: 22, borderBottomLeftRadius: 20, borderBottomRightRadius: 12 },
  { borderTopLeftRadius: 20, borderTopRightRadius: 13, borderBottomLeftRadius: 11, borderBottomRightRadius: 22 },
  { borderTopLeftRadius: 13, borderTopRightRadius: 19, borderBottomLeftRadius: 23, borderBottomRightRadius: 15 },
  { borderTopLeftRadius: 22, borderTopRightRadius: 11, borderBottomLeftRadius: 17, borderBottomRightRadius: 21 },
  { borderTopLeftRadius: 11, borderTopRightRadius: 21, borderBottomLeftRadius: 19, borderBottomRightRadius: 13 },
  { borderTopLeftRadius: 19, borderTopRightRadius: 15, borderBottomLeftRadius: 13, borderBottomRightRadius: 23 },
  { borderTopLeftRadius: 21, borderTopRightRadius: 17, borderBottomLeftRadius: 22, borderBottomRightRadius: 14 },
];
```

Размер: `flex: 1`, `height: 48`. Gap между камушками: `5px`.

### PillCTA

- Высота: `56px`, `borderRadius: 9999`
- Градиент по умолчанию: `['#005f73', '#008fa3']`, diagonal
- Glow: `shadowColor: '#00b4d8'`, `shadowOpacity: 0.22`, `shadowRadius: 28`
- Haptics при нажатии: `ImpactFeedbackStyle.Light`
- `labelGlow` (Welcome): текстовая тень `rgba(0,235,255,0.95)`

### BottomNav Island

- Frosted glass: `rgba(255,255,255,0.88)` + blur(20px) на web
- Active pill: `rgba(0,180,216,0.12)` фон + `rgba(0,180,216,0.30)` border
- Цвет активного таба: `Colors.primaryLight` (#00b4d8)
- Цвет неактивного таба: `Colors.onSurfaceVar`

---

## 10. Haptics

| Действие | Тип |
|---|---|
| PillCTA нажатие | `ImpactFeedbackStyle.Light` |
| BottomNav таб | `ImpactFeedbackStyle.Light` |
| Milestone badge | `ImpactFeedbackStyle.Heavy` |
| Ошибка / payment failed | `NotificationFeedbackType.Error` |
| Стрик обновился | `NotificationFeedbackType.Success` |

---

## 11. Антипаттерны

1. **Glassmorphism на обычных карточках.** `rgba(255,255,255,0.78)` + blur — только BottomNav и Welcome leaks.
2. **Цветные background-блобы.** Никаких `rgba(0,180,216,0.10)` пятен на фоне Home.
3. **Glow-бордеры.** `borderColor: rgba(0,180,216,0.65)` как активный стиль — заменён на тень.
4. **Серые тени.** `shadowColor: '#000'` — запрещено. Только тонированные: `primary` или `#72b8f8`.
5. **Sci-fi язык.** «Telemetry», «Operator», «Luminance» — не используем.
6. **Shoulders как зона.** Зоны строго: Neck / Back / Eyes / Wrists.
7. **Чистый чёрный текст.** `#000000` → всегда `onSurface: '#191c1e'`.
8. **Mindfulness / Connected Devices.** Не MVP, не показываем.

---

## 12. Pre-commit Checklist

- [ ] Фон экрана — `canvas` или `surface`, не произвольный цвет
- [ ] Тени только тонированные (`primary`, `primaryLight`, `#72b8f8`)
- [ ] Нет `borderWidth > 0` как декоративных разделителей
- [ ] Нет `borderColor` как единственного активного индикатора
- [ ] Touch targets: `minHeight: 44`
- [ ] `useSafeAreaInsets()` на каждом новом экране
- [ ] Haptics на каждом PrimaryButton
- [ ] `aspectRatio` на изображениях, нет фиксированных `height` для фото
- [ ] Зоны: Neck / Back / Eyes / Wrists — без Shoulders

---

## Источники

- `constants/tokens.ts` — токены (цвета, типографика, спейсинг, радиусы, тени)
- `components/primitives/` — все примитивы
- `app/index.tsx` — Welcome screen
- `app/home.tsx` — Home screen
- `app/routine.tsx` — Routine Preview
- `mock/data.ts` — мок-данные (пользователь, рутины, зоны)
- `docs/06-design/DESIGN-GUIDE.md` — этот файл
