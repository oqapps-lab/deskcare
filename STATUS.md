# DeskCare — Status

_Last updated: 2026-04-26_

## Где мы сейчас

**Stage 5 Design — закрыт** (41 экран, 25 примитивов, 22 QA-бага закрыты).
**Stage 6 — Trail A закрыт, инжиниринг сделан в основном**: Supabase подключен, auth работает, контент динамический, write-paths работают для всех ключевых пользовательских сценариев. Видео — placeholder'ы (Russell снимает). Adapty — Stage 7.
**QA Pass 3 (26 апреля) — закрыто 19 из 21 actionable** (3 BLOCKER + 9 HIGH + 7 MED). Висит только H3 (description_en — нужны переводы Russell) и M6 (premium chip унификация — design call). Отчёты: `/tmp/deskcare-qa-pass-3-report.md` + `/tmp/deskcare-qa-pass-3b-addendum.md`.

## Что подключено к БД

| Слой | Статус | Где |
|---|---|---|
| Supabase project | ✅ live `rwgpvmnuuarhcnpgibtm.supabase.co` (eu-west-1) | в org "burger app" |
| Schema | ✅ 20 таблиц по `docs/05-database/DATABASE-SCHEMA.md` (atom×reps по Russell-у) | commit `068c70e` |
| Seed | ✅ 6 zones · 64 atoms · 77 M:N · 20 routines · 190 routine_exercises · 2 programs · 3 phases | seed запущен через MCP |
| RLS | ✅ Включена на всех 20 таблицах. Content anon-readable, user-data owner-only | commit `068c70e` |
| Triggers | ✅ updated_at (13 таблиц), on_auth_user_created (auto-creates profile/settings/streak/free-subscription) | commit `068c70e` |
| Client lib | ✅ `lib/supabase.ts`, `lib/store/session.ts`, `lib/store/onboarding.ts`, `lib/types/db.ts` | commits `068c70e`, `f61e75b` |
| Hooks | ✅ `useAuth`, `useBodyZones`, `useExercises`, `useRoutines`, `useRoutineWithItems`, `useHomeSnapshot` | commits `068c70e`, `f61e75b` |

## Wired user-flow

| Экран | DB write/read | Коммит |
|---|---|---|
| Splash | Reads `profiles.onboarding_completed` для auth-aware redirect | `f61e75b` |
| Sign in / Sign up | `supabase.auth.signIn/signUp` (DB-trigger автосоздаёт profile) | `068c70e` |
| Quiz × 4 → Plan | Аккумулирует ответы в Zustand → `profiles.onboarding_data` upsert + `onboarding_completed=true` | `f61e75b` |
| Library | Real-time fetch 64 атомов с фильтром по zone | `068c70e` |
| Exercise Detail (slug) | Fetch by slug + premium gate из `is_premium` | `068c70e` |
| Routine Preview | `useRoutineWithItems(slug)` — title/description/items с формулой `atom × reps` | `f61e75b` |
| Routine Player | Streams items, `stepDur = atom.duration_seconds × reps`, `overlay_text` показывается | `f61e75b` |
| Pain Check-in | Upsert `pain_entries` (1 row per zone per day) | `a628c0a` |
| Pain History | Reads last 14 days из `pain_entries`, агрегирует по зонам | (в этой сессии) |
| Symptom Checker | Upsert `user_program_progress` с `last_symptom_check` jsonb | (в этой сессии) |
| Sciatica program | Phase routines (R14-R17) реально из БД, active state из `user_program_progress` | (в этой сессии) |
| Home | `useHomeSnapshot` — streak/profile/recommended routine/subscription из БД | `f61e75b` |
| Exercise Complete | Insert `sessions` + bump `streaks` (current/longest/total_sessions/total_minutes) | `a628c0a` |
| Profile/Progress | Last 20 sessions → bar chart Mon-Sun + recent list, header stats из `streaks` | `f61e75b` |
| Settings → Sign out | `supabase.auth.signOut()` + redirect | `068c70e` |

## Что НЕ подключено / отложено

- **Реальные видео** — все exercises имеют `video_url=null`. `<VideoPlaceholder>` рендерится. Когда Russell сдаст 64 видео в Storage bucket `exercise-videos/<slug>/video.mp4` — `UPDATE exercises SET video_url=...` и плеер автоматически подхватит.
- **Adapty billing** — Stage 7. Webhook → `deskcare_subscriptions`. Сейчас все юзеры `status=free, is_active=false`. Premium gate работает по `exercise.is_premium` флагу из контента.
- ~~**Push notifications**~~ — закрыто 26 апреля 2026. `expo-notifications@~55.0.20` поставлен; `lib/notifications.ts` оборачивает permission flow + `scheduleDailyReminder`. Settings screen загружает/сохраняет `reminder_schedules` row + `user_settings.audio_enabled`, на «Continue» применяет расписание через `cancelAllScheduledReminders` → `scheduleDailyReminder`. На SDK 55 это локальные нотификации (Expo Go не отдаёт push token); FCM/APNS push token отложен до dev build.
- **Apple/Google OAuth** — кнопки на Sign In показывают warning haptic, OAuth не подключен. Stage 7.
- ~~**Programs/eye dynamic**~~ — закрыто 26 апреля 2026. `useExercises('eyes')` рендерит все 8 атомов с реальными slug'ами; CTA "Start 3-min eye routine" пушит на `/exercise/preview?routine=eye-full-3min`. Заодно прошёл i18n-проход: title_en теперь primary в Library, Eye Program, Routine Preview, Routine Player.
- ~~**Atomic streak update**~~ — закрыто 26 апреля 2026. `public.log_completed_session(...)` SECURITY DEFINER RPC заменяет client-side read-modify-write. Гонок больше нет; смотри [`docs/05-database/MIGRATIONS.md` § 007](./docs/05-database/MIGRATIONS.md#007_log_completed_sessionsql-stage-7-prep).
- **Cold-start hydration regression test** — `_layout.tsx` уже ждёт `hasHydrated` перед рендером Stack. Тест с пустым AsyncStorage не прогонял.

## iOS Simulator

`iPhone 16e — deskcare` · UDID `D4C009F7-3BB8-43DC-B2AA-87D7F34BA82C` · Metro port **8083**. Инструкции запуска — [`docs/07-development/RUN-LOCAL.md`](./docs/07-development/RUN-LOCAL.md) и [`CLAUDE.md`](./CLAUDE.md).

**Metro поднимает пользователь вручную.** При завершении сессии Claude Code хук `SessionEnd` (`.claude/settings.json`) убивает Metro на порту 8083 — процессы не копятся.

## Где смотреть

- **Архитектура / дизайн-система**: [`docs/06-design/DESIGN-GUIDE.md`](./docs/06-design/DESIGN-GUIDE.md)
- **Карта экранов**: [`docs/04-ux/SCREEN-MAP.md`](./docs/04-ux/SCREEN-MAP.md)
- **БД схема (с atom×reps)**: [`docs/05-database/DATABASE-SCHEMA.md`](./docs/05-database/DATABASE-SCHEMA.md)
- **64 атома**: [`docs/05-database/EXERCISES-LIBRARY-SUPABASE.md`](./docs/05-database/EXERCISES-LIBRARY-SUPABASE.md)
- **20 рутин**: [`docs/05-database/ROUTINES-CATALOG.md`](./docs/05-database/ROUTINES-CATALOG.md)
- **Routine Player спека**: [`docs/07-development/ROUTINE-PLAYER.md`](./docs/07-development/ROUTINE-PLAYER.md)
- **QA отчёты**: [`docs/07-development/QA-BATCH-1.md`](./docs/07-development/QA-BATCH-1.md), [`docs/07-development/QA-BATCHES-2-6.md`](./docs/07-development/QA-BATCHES-2-6.md)

## Следующая сессия — с чего начать

Варианты (по порядку отдачи):

1. **Trail C — реальные видео** (когда Russell сдаст). Загрузка 64 файлов в Storage bucket `exercise-videos`, `UPDATE exercises SET video_url=...`. `<VideoPlaceholder>` через флаг `exercise.video_url` автоматически заменится `expo-video` плеером по спеке.
2. **Trail B — Adapty billing** (нужны ключи). Edge Function-webhook → `deskcare_subscriptions`. Real paywall с `Adapty.activate()`.
3. **Apple/Google OAuth** через `expo-apple-authentication` + Supabase OAuth.
4. **Push notifications** — `expo-notifications` permission flow + локальный scheduler из `reminder_schedules`.
5. **Cold-start regression** — переустановить Expo Go, пройти полный flow с нуля.
6. **Device-width pass** — повторный QA на iPhone 17 Pro Max (440px) и SE (375).

Backend живой. Auth работает. Real data везде, кроме видео. Готов к next stage.
