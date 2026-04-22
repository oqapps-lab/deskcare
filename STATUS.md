# DeskCare — Status

_Last updated: 2026-04-22_

## Где мы сейчас

Stage 5 **Design — завершён**. Все 6 батчей (41 экран / 25 примитивов) шипнуты в `main` и запушены в [oqapps-lab/deskcare](https://github.com/oqapps-lab/deskcare).

| Batch | Что внутри | Коммит |
|-------|------------|--------|
| 1 | Settings · Eye break · Permission · Pain · Sync · Offline · Eye session + QA pass | `24f0724` · `d9fce8f` · `dcd15ae` · `622e1ae` |
| 2 | Welcome · Quiz × 4 · Labor Illusion · Plan · Paywall + ProgressBar / QuizTile / SizeCircleRow | `28afaae` |
| 3 | Main Tabs (Home × 4 состояния · Library · Programs · Profile) + Exercise Detail (free + locked) + TabBar / VideoPlaceholder | `d56c6f8` |
| 4 | Sciatica (locked + active) · Symptom Checker · Eye Program | `4fec744` |
| 5 | Exercise Flow (Preview · Player · Complete) + Profile detail (Progress · Pain History · Settings) | `9c5e435` |
| 6 | Auth (Sign In / Sign Up) · 6 Modals (Milestone · Streak Freeze · Rate App · Mini Paywall · Share · Push Primer) · 2 System (Force Update · Maintenance) | `ce22b3f` |
| Docs | README обновлён, отмечены все батчи и план Stage 6 | `dfd345d` · `4417114` |

## Что осталось до релиза

Stage 5 закрыт. Stage 6 — инжиниринг:

1. **Реальный бэкенд (Supabase)** — auth (sign-in/sign-up сейчас просто `router.replace('/main/home')`), persistence стрика / плана / pain history, RLS-политики. Схема и миграции — в [docs/05-database/](./docs/05-database/).
2. **Adapty** — реальный paywall (Yearly $2.49/mo, Monthly $4.99/mo), 7-day trial, восстановление покупок.
3. **Реальные видео упражнений** — сейчас везде `<VideoPlaceholder>` (тонированный gradient-пэнл + breathing silhouette). Как появятся съёмки — заменить прямо в `<VideoPlaceholder>` на `expo-video` с адаптивным URL.
4. **Push уведомления** — `/modals/push-primer` ведёт к permission-прайму; Stage 6 подключает iOS APNs + scheduling для 20-20-20 и reminders.
5. **Cold-start / hydration** — сейчас splash (`app/index.tsx`) всегда ведёт в `/onboarding/welcome`. Stage 6: проверка persisted state и роутинг `welcome | main/home` в зависимости от того, прошёл ли user onboarding.
6. **Демо-хардкоды убрать** — `sync.tsx` хардкодом роутит в `/errors/no-connection` через 2.4s (для demo); заменить на реальный sync-статус.
7. **i18n** — сейчас EN-only. Решение продукта на Stage 6+.

## iOS Simulator

`iPhone 16e — deskcare` · UDID `D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C` · Metro port **8083**. Инструкции по запуску — [`docs/07-development/RUN-LOCAL.md`](./docs/07-development/RUN-LOCAL.md) и [`CLAUDE.md`](./CLAUDE.md).

## Где смотреть

- **Архитектура / дизайн-система**: [`docs/06-design/DESIGN-GUIDE.md`](./docs/06-design/DESIGN-GUIDE.md)
- **Карта всех экранов**: [`docs/04-ux/SCREEN-MAP.md`](./docs/04-ux/SCREEN-MAP.md)
- **QA-протокол Batch 1**: [`docs/07-development/QA-BATCH-1.md`](./docs/07-development/QA-BATCH-1.md)
- **Stitch промпты** (для будущих экранов): [`docs/06-design/STITCH-PROMPTS.md`](./docs/06-design/STITCH-PROMPTS.md)

## Чтобы возобновить работу

**Metro поднимает пользователь вручную, Claude — не должен.** Команды и UDID — в [`docs/07-development/RUN-LOCAL.md`](./docs/07-development/RUN-LOCAL.md) и [`CLAUDE.md`](./CLAUDE.md). При завершении сессии Claude Code хук `SessionEnd` (см. `.claude/settings.json`) убивает Metro на порту 8083, чтобы процессы не копились.

## Следующая сессия — с чего начать

Варианты (по порядку ожидаемой отдачи):

1. **Stage 6 kick-off** — поднять Supabase проект, накатить миграции из `docs/05-database/`, прописать auth в `app/auth/sign-in.tsx` + `sign-up.tsx`, сделать Zustand store для сессии.
2. **Adapty интеграция** — ключи, продукты, hook в `app/onboarding/paywall.tsx`.
3. **QA pass всех батчей 2–6** — прогнать протокол `ui-qa` (см. Batch 1 отчёт как референс), собрать HIGH/MED/LOW и пофиксить.
4. **Повторный обход на iPhone 17 Pro Max** — из ui-qa правила: device-width variance. На 16e (390) всё ок, но 440 может вскрыть overflow.

Выбор за следующей сессией.
