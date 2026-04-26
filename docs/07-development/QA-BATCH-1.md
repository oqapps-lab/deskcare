# DeskCare — Batch 1 QA report

**Дата:** 2026-04-21 (аудит) / 2026-04-22 (fixes)
**Устройство:** iPhone 16e (`D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C`), iOS 26.3
**Сборка:** Expo Go 55.0.27 · Metro port 8083 · ветка `dev`
**Протокол:** `~/.claude/skills/ui-qa` 16 rules + screen checklists
**Статус:** все HIGH + MEDIUM + LOW closed, regression прошёл ✅

---

## Coverage

| # | Screen | Route | Result |
|---|--------|-------|--------|
| 1 | Notification Settings | `/settings/notifications` | 3 bugs |
| 2 | 30-Second Eye Break | `/eye/break` | ✅ clean |
| 3 | Permission Prompt | `/onboarding/permission` | ✅ clean |
| 4 | Eye Exercise Session | `/eye/session` | 1 bug |
| 5 | No Connection | `/errors/no-connection` | 1 spec-deviation |
| 6 | Pain Check-in | `/pain/check-in` | 3 bugs |
| 7 | Sync | `/sync` | ✅ clean |

Не покрыто: cold-start rehydration, device-width variance (тест только на 16e по запросу пользователя), haptics (на симуляторе не чувствуются), dark mode (не предусмотрен дизайном).

---

## Bugs

### BLOCKER

нет.

### HIGH

**H1. Notification Settings — «DeskCare Premium» row title и subtitle срезаны.**
На 3-й row в списке `titleRow` делит ширину с badge «PRO», и при `numberOfLines={1}` на title + `numberOfLines={2}` на sub визуально обрезается:
- Title: `DeskCare Premium` → `DeskCare Premi…`
- Sub: `Sciatica & carpal-tunnel programs` → `Sc…`

Repro: открой `/settings/notifications`, посмотри на 3-ю glass-card.
Файл: [app/settings/notifications.tsx:204-222](../../app/settings/notifications.tsx:204).
Fix: дать `flex: 1` + `minWidth: 0` на `textCol`, убрать или укоротить badge, либо снять `numberOfLines={1}`.

**H2. Notification Settings — 3-я row не кликается, но chevron намекает на action.**
Row `DeskCare Premium` рендерит `<Glyph name="chevron-right" …/>` справа — визуальный сигнал «tap → navigate», — но `GlassRow` вообще не wrapped в `Pressable`, `onPress` нигде нет.
Файл: [app/settings/notifications.tsx:137-147](../../app/settings/notifications.tsx:137).
Fix: обернуть `GlassCard` в `Pressable` с `onPress` → роут на `/paywall` (или где будет управление подпиской), плюс `accessibilityRole="button"` + label.

**H3. Pain Check-in — floating CTA перекрывает severity-блок.**
При scroll = 0 `Save & continue` сидит поверх `GlassCard` с slider-ом: `INTENS…` и `/10` value обрезаются пилюлей. Scrim/blur за CTA нет — текст просто перечёркнут оранжевой пилюлей. `paddingBottom: insets.bottom + 180` достаточно для scroll-clearance, но при первой загрузке карточка рендерится под пилюлей.
Файл: [app/pain/check-in.tsx:101-228](../../app/pain/check-in.tsx:101).
Fix: добавить fade-mask/BlurView за CTA container (`position: absolute` с `LinearGradient` от transparent к cream) ИЛИ подвинуть severity-карточку выше в scroll order.

**H4. Pain Check-in — `ZoneTile` использует `onTouchEnd` вместо `Pressable`.**
A11y-нарушение: нет `accessibilityRole="button"`, нет pressed-feedback, VoiceOver не увидит кнопку. Также `onTouchEnd` не гарантирует cancel при drag-out.
Файл: [app/pain/check-in.tsx:241-262](../../app/pain/check-in.tsx:241).
Fix: заменить `View` + `onTouchEnd` на `Pressable` с `accessibilityRole="button"` и `accessibilityLabel={label}`.

### MEDIUM

**M1. Eye Session — неактивные ProgressDots почти невидимы на cream-канве.**
`ProgressDots count={5} active={0}` — на экране видна только 1 точка. Спека говорит `surfaceHighest (#E4E2DE)` 6px для inactive, но контраст к canvas `#FBF9F5` ≈ 1.09 — дотсы сливаются с фоном. Пользователь не понимает, что упражнений 5.
Файл: [components/ui/ProgressDots.tsx](../../components/ui/ProgressDots.tsx) — проверить какой token используется.
Fix: заменить `surfaceHighest` на `secondaryDim` (#D6C3B1) или на `inkHairline` с непрозрачным фоном; увеличить до 8px.

**M2. Pain Check-in — `BodyPainMap` силуэт значительно темнее спецификации.**
DESIGN-GUIDE §4 говорит: «SVG-силуэт — outline thin, fill `inkHairline`». Реально: силуэт залит тёмно-бордовым (выглядит как `primaryInk` / `primaryDeep`), фон карточки почти чёрно-коричневый. Не соответствует «warm cream sanctuary» mood-у.
Файл: [components/ui/BodyPainMap.tsx](../../components/ui/BodyPainMap.tsx).
Fix: либо привести к спеке (light silhouette, coral pulse dots), либо обновить DESIGN-GUIDE если текущее направление принято.

**M3. Pain Check-in — двойной UI для severity (slider + chips) не синхронизирован.**
Пользователь видит slider `0—10` И три чипа `Mild/Moderate/Severe`. Они хранятся в разных state-переменных (`severityPct`, `level`) и не связаны: slider=9/10 + level='mild' одновременно валидно. Это либо UX-confusion, либо product decision.
Файл: [app/pain/check-in.tsx:56-57](../../app/pain/check-in.tsx:56).
Recommendation: либо дропнуть chips и оставить slider (с label, например «Moderate (4/10)»), либо дропнуть slider. Решение за продуктом.

### LOW

**L1. No Connection — CTA variant отличается от recipe.**
DESIGN-GUIDE §6.5 говорит: `<PillCTA variant="outlined" icon="refresh">`. Код: `variant="primary"` (solid coral gradient). Не ломает UX, просто спек-drift.

**L2. DESIGN-GUIDE скрин-копия на русском, продукт на английском.**
Все screen recipes в guide — русский копирайт (`Настройки и напоминания`, `Где именно болит?`, `Нет подключения` и т.д.). В реализации всё английское. Если английский — финальный выбор, обновить DESIGN-GUIDE.

**L3. DESIGN-GUIDE §4 говорит «11 primitives», фактически 20.**
README корректно перечисляет 20 компонентов, DESIGN-GUIDE стал неактуален.

**L4. README описывает `app/index.tsx` как «design-review hub (temporary)».**
Реально `index.tsx` — splash-экран с 1.8s таймером, автороутит на `/onboarding/permission`. README стал неактуален.

**L5. Sync → No Connection хардкод.**
`app/sync.tsx:45-48` — `setTimeout(() => router.replace('/errors/no-connection'), 2400)`. Это ок для demo-flow review, но при переходе к Stage 6 нужно заменить на реальный статус sync-операции.

**L6. `PainZone` type mismatch: guide vs code.**
Guide (§4 BodyPainMap): `'neck'|'shoulder'|'chest'|'abdomen'|'lowerBack'|'wrist'`.
Код ([app/pain/check-in.tsx:38-43](../../app/pain/check-in.tsx:38)): `'neck'|'leftShoulder'|'chest'|'lowerBack'` + chest labeled as «Upper back».

---

## Systemic patterns (root-cause clusters)

1. **Truncation on composed rows** — H1 симптом, потенциально повторится в будущих батчах когда row получит badge/chevron/action. Рекомендация: `GlassRow` принимает `badge` как prop — сделать layout так, чтобы badge не ел ширину title. Можно использовать `flex: 1, flexShrink: 1, minWidth: 0` паттерн.

2. **Floating CTA без fade-scrim** — H3 симптом. Все три экрана со sticky CTA (Notification Settings, Pain Check-in, … будущий Onboarding) страдают от того же: контент под CTA crossed-over. Нужен общий примитив `<FloatingCTAContainer>` с LinearGradient-scrim.

3. **A11y: ручной `onTouchEnd` вместо `Pressable`** — H4 симптом. Легко упустить в code-review. Добавить lint rule или ESLint custom rule `no-manual-touch-handlers`.

4. **Doc drift** — L2/L3/L4/L6 симптомы. DESIGN-GUIDE и README написаны до финала Batch 1 и не обновились. Процедура «после каждого batch-а — апдейт guide» уже описана в корневом [CLAUDE.md](../../../CLAUDE.md).

---

## Resolution log (2026-04-22)

Все пункты закрыты. Ниже — что именно сделано.

### HIGH — 4 из 4 closed
- **H1 title-truncation** — [notifications.tsx:140](../../app/settings/notifications.tsx:140) title `"DeskCare Premium"` → `"Premium"` (self-префикс избыточен внутри DeskCare). В `rowStyles.title`: `flexShrink: 1` → `flex: 1 + minWidth: 0`; badge получил `flexShrink: 0`. Title теперь умеет корректно занимать оставшуюся ширину и использовать `ellipsizeMode="tail"`, если ещё что-то не уместится.
- **H2 untappable row** — `GlassRow` расширен опциональным `onPress`; при его наличии оборачивается в `<Pressable>` с `accessibilityRole="button"` + `accessibilityLabel={title}` + `pressed`-style (0.85 opacity + scale 0.98). Premium row теперь кликается и стреляет `Haptics.selectionAsync`.
- **H3 CTA-scrim** — в [pain/check-in.tsx](../../app/pain/check-in.tsx) и [notifications.tsx](../../app/settings/notifications.tsx) добавлен `<LinearGradient>` (`rgba(251,249,245,0 → 0.85 → 1)`) во весь `ctaFloating` `absoluteFill`, `pointerEvents="none"`. Контейнер CTA получил `pointerEvents="box-none"` и `paddingTop: spacing.xxxl` — чтобы scrim имел область для растворения. Контент под пилюлей плавно уходит в cream, а не режется резко.
- **H4 ZoneTile a11y** — [pain/check-in.tsx:241](../../app/pain/check-in.tsx:241) `View + onTouchEnd` → `Pressable` с `accessibilityRole="button"` + `accessibilityLabel={label}` + `accessibilityState={{ selected: active }}` + `btnPressed` style (0.7 opacity + scale 0.96) + `hitSlop: 6`.

### MEDIUM — 3 из 3 closed
- **M1 ProgressDots contrast** — [ProgressDots.tsx](../../components/ui/ProgressDots.tsx): inactive dot `{ width: 6, backgroundColor: surfaceHighest }` → `{ width: 8, backgroundColor: secondaryDim }` (secondaryDim #D6C3B1 — warm-tan, контраст к canvas #FBF9F5 ≈ 1.72 против прежних 1.09); база `height: 6` → `8` чтобы inactive стал round 8×8. Все 5 точек теперь чётко видны.
- **M2 BodyPainMap spec drift** — обновлён [DESIGN-GUIDE §4 BodyPainMap](../06-design/DESIGN-GUIDE.md): guide описывал «outline thin, fill inkHairline», но код (intentionally) рендерит dramatic dark silhouette (`ink → inkDeep` vertical gradient + thin 6-12% white strokes). Guide приведён в соответствие с кодом.
- **M3 severity slider ↔ chips sync** — [pain/check-in.tsx:39-53](../../app/pain/check-in.tsx:39) добавлены `levelFromPct` (0-3=mild, 4-7=moderate, 8-10=severe) и `pctFromLevel` (0.2/0.5/0.9 — середины диапазонов). `setSeverityPct` и `setLevel` стали wrappers вокруг raw setters и поддерживают два состояния в синхроне. Edge-cases (equal, no-op) обработаны.

### LOW — 6 из 6 closed
- **L1 no-connection CTA variant** — обновлён [DESIGN-GUIDE §6.5](../06-design/DESIGN-GUIDE.md): recipe приведён к шипнутому `variant="primary"` (gradient); комментарий объясняет почему.
- **L2 RU → EN в рецептах** — вся §6 DESIGN-GUIDE перерисована с шипнутой английской копией. Добавлен заголовок-note «Copy — English (shipped). Product language decision: EN-only для MVP».
- **L3 primitive count** — §4 «11 primitives» заменено на reference к README `components/ui/` (actual 20 на Batch 1).
- **L4 README index.tsx** — «design-review hub (temporary)» → «animated splash → /onboarding/permission (~1.8s)».
- **L5 Sync hardcoded redirect** — note добавлен в DESIGN-GUIDE §6.7 (нужно заменить на реальный sync-status в Stage 6). Код пока оставлен — intentional demo-flow.
- **L6 PainZone type drift** — guide §4 BodyPainMap обновлён: `'shoulder'|'abdomen'|'wrist'` → шипнутый `'neck'|'leftShoulder'|'rightShoulder'|'chest'|'abdomen'|'lowerBack'`.

### Visual polish (после повторного обхода)
- **Notifications chip row** — 4 чипа не помещались в 1 ряд (336px vs 342px content). `gap: spacing.sm` → `spacing.xs` + `justifyContent: 'space-between'`. Теперь `09:00 · 12:00 · 15:00 (active) · 18:00` в одной строке с равномерными промежутками.
- **Eye Break eyebrow** — «EYE BREAK» на default `muted` (#89726A inkSubtle) сливался с peach-orb в top-right. `<Eyebrow>` → `<Eyebrow variant="accent">` (coral primaryMid) — читается и on-brand.

### Regression pass (2026-04-22)
Все 7 экранов пройдены заново после всех фиксов:
- `/onboarding/permission` — без изменений, чисто
- `/settings/notifications` — chips в ряд ✓, Premium row полностью виден с badge + sub ✓, scrim плавный ✓
- `/eye/break` — EYE BREAK coral ✓, остальное без изменений
- `/eye/session` — 5 ProgressDots чётко видны ✓, timer тикает ✓
- `/pain/check-in` — scrim ✓, zones ✓, body map ✓
- `/sync` — чисто
- `/errors/no-connection` — чисто

Deltas по коду:
- [app/settings/notifications.tsx](../../app/settings/notifications.tsx) — `onPress` на GlassRow, title `flex:1 + minWidth:0`, scrim за CTA, chip row gap/justify, title «Premium»
- [app/pain/check-in.tsx](../../app/pain/check-in.tsx) — scrim за CTA, ZoneTile → Pressable + a11y, severity sync
- [app/eye/break.tsx](../../app/eye/break.tsx) — eyebrow variant accent
- [components/ui/ProgressDots.tsx](../../components/ui/ProgressDots.tsx) — inactive dot contrast + size
- [docs/06-design/DESIGN-GUIDE.md](../06-design/DESIGN-GUIDE.md) — §4 primitives + BodyPainMap spec; §6 recipes EN + note по no-connection variant
- [README.md](../../README.md) — index.tsx описание

---

## What was not tested

- Interactive haptics (симулятор не даёт feedback).
- Device-width variance (только 390px по запросу; нужен pass на 440 Pro Max и 375 SE).
- Cold-start hydration (прогон не перезапускал Expo Go с нуля).
- Reduced-motion path (reanimated useReducedMotion ветки).
- Dark mode (не предусмотрен).
- RTL layout (не предусмотрен).

В следующий прогон добавить cold-start + 2-й device width.
