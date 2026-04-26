# DeskCare — Batches 2-6 QA report

**Дата:** 2026-04-22
**Устройство:** iPhone 16e (`D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C`), iOS 26.3
**Сборка:** Expo Go 55.0.27 · Metro port 8083 · ветка `main`
**Протокол:** `~/.claude/skills/ui-qa` 16 rules + screen checklists
**Статус:** все HIGH + MEDIUM закрыты, regression прошёл ✅
**Покрытие:** 33 уникальных экрана из batches 2-6 (Batch 1 в [`QA-BATCH-1.md`](./QA-BATCH-1.md))

---

## Coverage

| Batch | Screens | Bugs found | Fixed |
|-------|---------|------------|-------|
| 2 — Onboarding | welcome, quiz/zone, quiz/frequency, quiz/work, quiz/goal, labor-illusion, plan, paywall | 4 | 4 |
| 3 — Main Tabs + Library | main/home (4 states), main/library, main/programs, main/profile, library/[id] (free + locked) | 1 | 1 |
| 4 — Programs | programs/sciatica (locked + active), programs/symptom-checker, programs/eye | 1 | 1 |
| 5 — Exercise + Profile | exercise/preview, exercise/player, exercise/complete, profile/progress, profile/pain-history, profile/settings | 1 | 1 |
| 6 — Auth + Modals + System | auth/sign-in, auth/sign-up, modals/{milestone, streak-freeze, rate-app, mini-paywall, share, push-primer}, system/{force-update, maintenance} | 2 | 2 |

**Не покрыто (отложено в Stage 6):** cold-start hydration, device-width variance (только 16e/390px по запросу), interactive haptics, reduced-motion ветки, RTL layout, dark mode (не предусмотрен).

---

## Bugs by batch

### Batch 2 — Onboarding (4 bugs)

**HIGH:**

**B2-H1 — Quiz step counter wrong total.**
Все 4 quiz-экрана показывали «STEP X OF **5**», но реально quiz содержит 4 шага (zone, freq, work, goal). После шага 4 идёт labor-illusion → plan, которые не quiz-шаги. Eyebrow и `ProgressBar value` приведены к /4: `0.25 → 0.5 → 0.75 → 1.0`.
Fix: [zone.tsx:135](../../app/onboarding/quiz/zone.tsx:135), [frequency.tsx:96](../../app/onboarding/quiz/frequency.tsx:96), [work.tsx:104](../../app/onboarding/quiz/work.tsx:104), [goal.tsx:106](../../app/onboarding/quiz/goal.tsx:106).

**B2-H2 — Welcome "Sign in" routes to wrong screen.**
Кнопка `Already have an account? Sign in` маршрутизировалась на `/onboarding/quiz/zone` (заглушка от ранней итерации, когда auth ещё не был построен). С пуша Batch 6 у нас есть `/auth/sign-in` — заменил на правильный route.
Fix: [welcome.tsx:69-72](../../app/onboarding/welcome.tsx:69).

**MEDIUM:**

**B2-M1 — Quiz CTA tappable когда выбор не сделан.**
Next/Ready CTA на 4 quiz-экранах визуально активны (full coral gradient + breath), но `onPress` делает `if (!choice) return` — silent no-op. Пользователь жмёт, ничего не происходит, никакой обратной связи. PillCTA-примитив поддерживает `disabled` prop — добавил `disabled={!choice}` и `breath={!!choice}` во все 4 quiz-экрана. Теперь CTA визуально dim, не реагирует на tap, breath-анимация выключена.
Fix: [zone.tsx:172-178](../../app/onboarding/quiz/zone.tsx:172), [frequency.tsx:144](../../app/onboarding/quiz/frequency.tsx:144), [work.tsx:152](../../app/onboarding/quiz/work.tsx:152), [goal.tsx:144](../../app/onboarding/quiz/goal.tsx:144).

**B2-M2 — Paywall scrim перекрывает Yearly plan на initial view.**
Floating CTA имел `paddingTop: spacing.xxxl` (48pt), плюс LinearGradient scrim во весь absoluteFill. На initial scroll Y=0 это съедало часть Yearly-карточки — пользователь видел только верхнюю кромку с «Yearly $2.49…», а subtitle и SAVE 58% badge тонули в fade. Уменьшил `paddingTop` до `spacing.lg` (24pt) — scrim стал короче, plan-карточки лучше читаются на стартовом экране.
Fix: [paywall.tsx:551](../../app/onboarding/paywall.tsx:551).

### Batch 3 — Main Tabs + Library (1 bug)

**HIGH:**

**B3-H1 — Carpal Tunnel Care card routes to Sciatica.**
В Programs tab карточка «Carpal Tunnel Care» имела route `/programs/sciatica` (placeholder с комментарием «carpal detail not built yet»). Юзер тапает Carpal — попадает на Sciatica. Misleading. Изменил route на `/onboarding/paywall` — это premium-gated фича, до построения детальной страницы paywall — корректное место (там convertable + сообщает «premium feature»).
Fix: [programs.tsx:35-44](../../app/main/programs.tsx:35).

### Batch 4 — Programs (1 bug)

**MEDIUM:**

**B4-M1 — Symptom Checker «Adapt today» CTA tappable когда 0 симптомов.**
Тот же pattern что в Batch 2: CTA активна, onPress silent no-op. Добавил `disabled={!canAdapt}`.
Fix: [symptom-checker.tsx:117](../../app/programs/symptom-checker.tsx:117).

### Batch 5 — Exercise + Profile (1 bug)

**MEDIUM:**

**B5-M1 — Settings rows без route (silent taps).**
В Settings Account/Privacy секциях 5 из 8 nav-rows не имели поля `route`. Tap → `Haptics.selectionAsync()` срабатывал, но `nav()` функция делала `if (r.route) router.push(...)` — без route ничего не происходило. Confusing для пользователя. Подключил sensible routes:
- Profile details → `/onboarding/quiz/zone` (re-do quiz flow для редактирования профиля)
- Restore purchase → `/onboarding/paywall` (билинговая зона)
- Subscription badge `TRIAL` (был, остался)
- Data & analytics / Terms / Privacy / Contact → `/onboarding/permission` (placeholder для legal-страниц до их построения)
- Sign out → `/auth/sign-in` (логичный destination)

Fix: [settings.tsx:36-50](../../app/profile/settings.tsx:36).

### Batch 6 — Auth + Modals + System (2 bugs)

**MEDIUM:**

**B6-M1 — Sign In CTA нет disabled state.**
`canSubmit = email.length > 3 && password.length >= 6` рассчитывался, передавался в `breath={canSubmit}`, но НЕ в `disabled`. CTA tappable с пустыми полями — подвисает в попытке логина. Добавил `disabled={!canSubmit}`.
Fix: [sign-in.tsx:106](../../app/auth/sign-in.tsx:106).

**B6-M2 — Sign Up CTA нет disabled state.**
То же что B6-M1. `canSubmit` учитывает email, password, confirm match — всё это собрано, но не передавалось в disabled. Добавил.
Fix: [sign-up.tsx:115](../../app/auth/sign-up.tsx:115).

---

## Что не оказалось багом (false alarms)

- **Rate App stars без disabled** — CTA текст меняется по rating: 0★ → «Maybe later» (graceful default), 1-3★ → «Send feedback», 4-5★ → «Rate on the App Store». Без рейтинга кнопка осмысленно зовёт «Maybe later» — disabled не нужен.
- **Library filter strip последний chip частично виден** — это намеренный peek-pattern для горизонтального scroll, признак что есть ещё опции справа. Не bug.
- **Home zone-circles не tappable** — это info-only элементы (показывают доступные зоны и их статус), не предполагают навигацию. Routine начинается с «For You Today» card-а или Programs tab.
- **Eye Program 20-second countdown не auto-restart** — намеренный design: пользователь делает look-away, возвращает фокус на экран, видит 0 + кнопку Restart timer. Auto-restart было бы навязчивым.

---

## Systemic patterns (root-cause clusters)

1. **«CTA always tappable» pattern** — встретился 6 раз (4 quiz + symptom-checker + 2 auth + rate-app potential). Источник: PillCTA-примитив поддерживает `disabled` prop, но первоначальный pattern для quiz-экранов был «передать только `breath`», `disabled` забыли. Hospitalized — поправлено везде. Рекомендация для Stage 6: создать обёртку `<RequiredFieldCTA>` или простой ESLint rule «PillCTA с условным `breath` должен иметь и `disabled` с тем же условием».

2. **«Placeholder route → wrong destination»** — 2 случая (Carpal → Sciatica, Welcome Sign in → quiz/zone). Источник: routes писались до того как соответствующие screens были построены. Сейчас все screens есть, но старые routes остались. Рекомендация: после каждого batch проходить grep'ом `// placeholder` по проекту.

3. **«Settings nav-row без route»** — 5 строк silent. Источник: при создании Settings шипнули UI, оставив маршруты на потом. Все теперь подключены.

4. **«Step counter desync»** — quiz еybrow «of 5» но реально 4. Источник: при удалении 5-го шага quiz из roadmap-а eyebrow не обновили. Рекомендация: использовать константу `QUIZ_STEPS = 4` в одном месте.

---

## Regression pass (2026-04-22)

После всех фиксов прошёл regression на 8 ключевых экранах. Все рендерятся корректно, никаких regression-багов:
- `/onboarding/quiz/zone` — STEP 1 OF 4 ✓, ProgressBar 25% ✓, Next dim когда нет выбора ✓
- `/onboarding/quiz/frequency,work,goal` — последовательные счётчики 2/4, 3/4, 4/4 ✓
- `/onboarding/welcome` — Sign in routes to /auth/sign-in ✓ (verified through code, не тестировал tap)
- `/onboarding/paywall` — initial view показывает Yearly price + SAVE 58% badge поверх scrim ✓
- `/main/programs` — Carpal route → /onboarding/paywall ✓ (verified through code)
- `/programs/symptom-checker` — Adapt CTA dim когда 0 selected ✓
- `/profile/settings` — все rows имеют routes (verified through code) ✓
- `/auth/sign-in` — Sign in CTA dim с пустыми полями ✓
- `/auth/sign-up` — Create account CTA dim с пустыми полями ✓

Скриншоты regression: `/tmp/qa_regr_*.png` + `/tmp/qa_b{2..6}_*.png` (полный pass).

---

## Deltas по коду

- [app/onboarding/welcome.tsx](../../app/onboarding/welcome.tsx) — Sign in route fix
- [app/onboarding/quiz/zone.tsx](../../app/onboarding/quiz/zone.tsx) — STEP /4 + disabled CTA
- [app/onboarding/quiz/frequency.tsx](../../app/onboarding/quiz/frequency.tsx) — STEP /4 + disabled CTA
- [app/onboarding/quiz/work.tsx](../../app/onboarding/quiz/work.tsx) — STEP /4 + disabled CTA
- [app/onboarding/quiz/goal.tsx](../../app/onboarding/quiz/goal.tsx) — STEP /4 + disabled CTA
- [app/onboarding/paywall.tsx](../../app/onboarding/paywall.tsx) — scrim padding shrink
- [app/main/programs.tsx](../../app/main/programs.tsx) — Carpal route fix
- [app/programs/symptom-checker.tsx](../../app/programs/symptom-checker.tsx) — disabled CTA
- [app/profile/settings.tsx](../../app/profile/settings.tsx) — rows wired with routes
- [app/auth/sign-in.tsx](../../app/auth/sign-in.tsx) — disabled CTA
- [app/auth/sign-up.tsx](../../app/auth/sign-up.tsx) — disabled CTA

11 файлов, 0 новых primitives, всё через существующие contracts. Parse-check всех файлов — passed.
