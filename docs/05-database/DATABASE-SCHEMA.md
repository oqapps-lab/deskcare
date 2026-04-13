# DeskCare — Database Schema

**Дата:** 13 апреля 2026
**Основа:** [FEATURES.md](../02-product/FEATURES.md) (F1–F10), [MONETIZATION.md](../02-product/MONETIZATION.md), [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md)
**БД:** Supabase (PostgreSQL 15+)
**Схема:** `public`

---

## Обзор

20 таблиц: 9 справочных/контентных + 11 пользовательских.

| Категория | Таблицы |
|-----------|---------|
| **Контент** | body_zones, exercises, exercise_body_zones, routines, routine_exercises, programs, program_phases, program_exercises, achievements |
| **Пользователь** | profiles, user_settings, subscriptions, sessions, session_exercises, streaks, user_achievements, pain_entries, favorites, reminder_schedules, user_program_progress |

---

## Справочные / Контентные таблицы

### Таблица: body_zones

**Назначение:** Справочник зон тела для таргетинга упражнений (F2: Body-Part Targeting).
**Связана с:** exercises (M:N), routines, pain_entries, sessions

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| slug | text | NOT NULL | — | Уникальный код: neck, back, eyes, wrists, full_body |
| name | text | NOT NULL | — | Отображаемое название |
| icon_url | text | NULL | — | URL иконки в Storage |
| sort_order | smallint | NOT NULL | 0 | Порядок отображения |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (slug)`

**Индексы:**
- `idx_body_zones_slug ON (slug)`

**RLS:** Включена. Чтение для всех, запись — только service role. Политики в RLS-POLICIES.md.

---

### Таблица: exercises

**Назначение:** Каталог упражнений (50–80 к запуску). F3: Video Player, F4: Library, F6: Eye Exercises.
**Связана с:** body_zones (M:N), routine_exercises, program_exercises, session_exercises, favorites

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| slug | text | NOT NULL | — | URL-friendly идентификатор |
| title | text | NOT NULL | — | Название упражнения |
| description | text | NULL | — | Описание техники |
| video_url | text | NULL | — | URL видео в Storage |
| thumbnail_url | text | NULL | — | URL превью-изображения |
| duration_seconds | smallint | NOT NULL | 60 | Длительность в секундах |
| difficulty | text | NOT NULL | 'easy' | CHECK: easy, medium |
| exercise_type | text | NOT NULL | 'stretch' | CHECK: stretch, eye, nerve_glide, tendon_glide |
| is_premium | boolean | NOT NULL | false | Платный контент |
| target_muscles | text[] | NULL | — | Целевые мышцы |
| contraindications | text[] | NULL | — | Противопоказания |
| modifications | text | NULL | — | Описание модификаций |
| audio_url | text | NULL | — | URL аудио-инструкции |
| sort_order | smallint | NOT NULL | 0 | Порядок в каталоге |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (slug)`
- `CHECK (difficulty IN ('easy', 'medium'))`
- `CHECK (exercise_type IN ('stretch', 'eye', 'nerve_glide', 'tendon_glide'))`
- `CHECK (duration_seconds > 0)`

**Индексы:**
- `idx_exercises_slug ON (slug)`
- `idx_exercises_type ON (exercise_type)`
- `idx_exercises_is_premium ON (is_premium)`
- `idx_exercises_difficulty ON (difficulty)`

**RLS:** Включена. Публичное чтение; premium-контент фильтруется на клиенте + RLS по подписке.

---

### Таблица: exercise_body_zones

**Назначение:** Связь M:N между упражнениями и зонами тела.
**Связана с:** exercises, body_zones

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| exercise_id | uuid | NOT NULL | — | FK → exercises(id) ON DELETE CASCADE |
| body_zone_id | uuid | NOT NULL | — | FK → body_zones(id) ON DELETE CASCADE |

**Constraints:**
- `PRIMARY KEY (exercise_id, body_zone_id)`

**Индексы:**
- PK покрывает поиск по exercise_id
- `idx_exercise_body_zones_zone ON (body_zone_id)`

**RLS:** Включена. Публичное чтение.

---

### Таблица: routines

**Назначение:** Предсобранные рутины по зонам тела (F2: Body-Part Targeting).
**Связана с:** body_zones, routine_exercises, sessions

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| slug | text | NOT NULL | — | URL-friendly идентификатор |
| title | text | NOT NULL | — | Название рутины |
| description | text | NULL | — | Описание |
| body_zone_id | uuid | NOT NULL | — | FK → body_zones(id) |
| duration_seconds | smallint | NOT NULL | 180 | Общая длительность |
| is_premium | boolean | NOT NULL | false | Платная рутина |
| routine_type | text | NOT NULL | 'zone_based' | CHECK: zone_based, morning, evening, quick_relief |
| sort_order | smallint | NOT NULL | 0 | Порядок отображения |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (slug)`
- `CHECK (routine_type IN ('zone_based', 'morning', 'evening', 'quick_relief'))`
- `CHECK (duration_seconds > 0)`

**Индексы:**
- `idx_routines_slug ON (slug)`
- `idx_routines_body_zone ON (body_zone_id)`
- `idx_routines_type ON (routine_type)`

**RLS:** Включена. Публичное чтение.

---

### Таблица: routine_exercises

**Назначение:** Упражнения в составе рутины с порядком выполнения.
**Связана с:** routines, exercises

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| routine_id | uuid | NOT NULL | — | FK → routines(id) ON DELETE CASCADE |
| exercise_id | uuid | NOT NULL | — | FK → exercises(id) ON DELETE CASCADE |
| sort_order | smallint | NOT NULL | 0 | Порядок в рутине |
| created_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (routine_id, sort_order)`

**Индексы:**
- `idx_routine_exercises_routine ON (routine_id)`

**RLS:** Включена. Публичное чтение.

---

### Таблица: programs

**Назначение:** Структурированные программы — Sciatica (F7), Eye Program (F6).
**Связана с:** program_phases, user_program_progress

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| slug | text | NOT NULL | — | Код: sciatica, eye_program |
| title | text | NOT NULL | — | Название программы |
| description | text | NULL | — | Описание |
| thumbnail_url | text | NULL | — | Превью |
| duration_weeks | smallint | NULL | — | Длительность в неделях |
| is_premium | boolean | NOT NULL | false | Платная программа |
| disclaimer | text | NULL | — | Медицинский disclaimer |
| sort_order | smallint | NOT NULL | 0 | Порядок |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (slug)`

**Индексы:**
- `idx_programs_slug ON (slug)`

**RLS:** Включена. Публичное чтение.

---

### Таблица: program_phases

**Назначение:** Фазы программы (острая / поддержание для Sciatica).
**Связана с:** programs, program_exercises, user_program_progress

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| program_id | uuid | NOT NULL | — | FK → programs(id) ON DELETE CASCADE |
| title | text | NOT NULL | — | Название фазы |
| description | text | NULL | — | Описание |
| phase_type | text | NOT NULL | 'gentle' | CHECK: gentle, progressive |
| sort_order | smallint | NOT NULL | 0 | Порядок фаз |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (phase_type IN ('gentle', 'progressive'))`
- `UNIQUE (program_id, sort_order)`

**Индексы:**
- `idx_program_phases_program ON (program_id)`

**RLS:** Включена. Публичное чтение.

---

### Таблица: program_exercises

**Назначение:** Упражнения в фазе программы с порядком и привязкой к дню.
**Связана с:** program_phases, exercises

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| phase_id | uuid | NOT NULL | — | FK → program_phases(id) ON DELETE CASCADE |
| exercise_id | uuid | NOT NULL | — | FK → exercises(id) ON DELETE CASCADE |
| day_number | smallint | NOT NULL | 1 | День в программе |
| sort_order | smallint | NOT NULL | 0 | Порядок в дне |
| created_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (phase_id, day_number, sort_order)`

**Индексы:**
- `idx_program_exercises_phase ON (phase_id)`
- `idx_program_exercises_day ON (phase_id, day_number)`

**RLS:** Включена. Публичное чтение.

---

### Таблица: achievements

**Назначение:** Справочник бейджей и достижений (F8: Streaks & Gamification).
**Связана с:** user_achievements

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| slug | text | NOT NULL | — | Код: streak_3, streak_7, first_session и т.д. |
| title | text | NOT NULL | — | Название бейджа |
| description | text | NULL | — | Описание условий |
| icon_url | text | NULL | — | URL иконки |
| criteria_type | text | NOT NULL | — | Тип: streak_days, total_sessions, zone_sessions, pain_logs |
| criteria_value | integer | NOT NULL | — | Значение: 3, 7, 14, 30 и т.д. |
| sort_order | smallint | NOT NULL | 0 | Порядок отображения |
| created_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (slug)`

**Индексы:**
- `idx_achievements_slug ON (slug)`

**RLS:** Включена. Публичное чтение.

---

## Пользовательские таблицы

### Таблица: profiles

**Назначение:** Профиль пользователя — расширение auth.users (F1: Onboarding, F10: Profile).
**Связана с:** auth.users (1:1)

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | — | PK, FK → auth.users(id) ON DELETE CASCADE |
| display_name | text | NULL | — | Имя пользователя |
| avatar_url | text | NULL | — | URL аватара в Storage |
| onboarding_completed | boolean | NOT NULL | false | Завершён ли онбординг |
| onboarding_data | jsonb | NULL | — | Ответы квиза: {pain_zones, pain_frequency, work_type, goal, desk_hours} |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Структура `onboarding_data`:**
```json
{
  "pain_zones": ["neck", "back"],
  "pain_frequency": "daily",
  "work_type": "remote",
  "goal": "pain_relief",
  "desk_hours": "8plus"
}
```

**Индексы:**
- PK на id
- `idx_profiles_onboarding ON (onboarding_completed)`

**RLS:** Включена. Пользователь видит/редактирует только свой профиль.

---

### Таблица: user_settings

**Назначение:** Настройки приложения (F10: Profile & Settings).
**Связана с:** auth.users (1:1)

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE, UNIQUE |
| theme | text | NOT NULL | 'system' | CHECK: light, dark, system |
| language | text | NOT NULL | 'en' | Код языка ISO 639-1 |
| audio_enabled | boolean | NOT NULL | true | Аудио-инструкции вкл/выкл |
| haptics_enabled | boolean | NOT NULL | true | Вибрация на кнопках |
| notifications_enabled | boolean | NOT NULL | true | Push-уведомления вкл/выкл |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (user_id)`
- `CHECK (theme IN ('light', 'dark', 'system'))`

**Индексы:**
- `idx_user_settings_user ON (user_id)` (покрывается UNIQUE)

**RLS:** Включена. Пользователь видит/редактирует только свои настройки.

---

### Таблица: subscriptions

**Назначение:** Статус подписки, синхронизированный с Adapty через webhook (Monetization).
**Связана с:** auth.users (1:1)

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE, UNIQUE |
| adapty_profile_id | text | NULL | — | ID профиля в Adapty |
| status | text | NOT NULL | 'free' | CHECK: free, trialing, active, expired, cancelled, paused, billing_issue |
| plan | text | NOT NULL | 'free' | CHECK: free, pro_monthly, pro_annual, sciatica_addon, lifetime |
| is_active | boolean | NOT NULL | false | Быстрая проверка: есть ли активная подписка |
| store | text | NULL | — | CHECK: app_store, play_store |
| current_period_start | timestamptz | NULL | — | Начало текущего периода |
| current_period_end | timestamptz | NULL | — | Конец текущего периода |
| trial_start | timestamptz | NULL | — | Начало trial |
| trial_end | timestamptz | NULL | — | Конец trial |
| cancellation_reason | text | NULL | — | Причина отмены (от Adapty) |
| original_transaction_id | text | NULL | — | ID транзакции для восстановления покупки |
| raw_data | jsonb | NULL | — | Полный payload от Adapty |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (user_id)`
- `CHECK (status IN ('free', 'trialing', 'active', 'expired', 'cancelled', 'paused', 'billing_issue'))`
- `CHECK (plan IN ('free', 'pro_monthly', 'pro_annual', 'sciatica_addon', 'lifetime'))`
- `CHECK (store IN ('app_store', 'play_store') OR store IS NULL)`

**Индексы:**
- `idx_subscriptions_user ON (user_id)` (покрывается UNIQUE)
- `idx_subscriptions_adapty ON (adapty_profile_id)`
- `idx_subscriptions_status ON (status)`
- `idx_subscriptions_is_active ON (is_active)`

**RLS:** Включена. Пользователь читает только свою подписку. Запись — только через service role (webhook).

---

### Таблица: sessions

**Назначение:** Завершённые сессии упражнений (F3: Video Player, F8: Streaks).
**Связана с:** auth.users, routines, program_phases, body_zones, session_exercises

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| session_type | text | NOT NULL | 'routine' | CHECK: routine, single, eye_break, program |
| routine_id | uuid | NULL | — | FK → routines(id), для session_type = routine |
| program_phase_id | uuid | NULL | — | FK → program_phases(id), для session_type = program |
| body_zone_id | uuid | NULL | — | FK → body_zones(id), зона сессии |
| started_at | timestamptz | NOT NULL | now() | Начало сессии |
| completed_at | timestamptz | NULL | — | Завершение (NULL если прервана) |
| duration_seconds | smallint | NOT NULL | 0 | Фактическая длительность |
| exercises_total | smallint | NOT NULL | 0 | Всего упражнений |
| exercises_completed | smallint | NOT NULL | 0 | Завершено |
| exercises_skipped | smallint | NOT NULL | 0 | Пропущено |
| deleted_at | timestamptz | NULL | — | Мягкое удаление |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (session_type IN ('routine', 'single', 'eye_break', 'program'))`

**Индексы:**
- `idx_sessions_user ON (user_id)`
- `idx_sessions_user_date ON (user_id, started_at DESC)`
- `idx_sessions_type ON (session_type)`
- `idx_sessions_completed ON (user_id, completed_at) WHERE completed_at IS NOT NULL`

**RLS:** Включена. Пользователь видит/создаёт только свои сессии.

---

### Таблица: session_exercises

**Назначение:** Отдельные упражнения в рамках сессии (детализация F3).
**Связана с:** sessions, exercises

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| session_id | uuid | NOT NULL | — | FK → sessions(id) ON DELETE CASCADE |
| exercise_id | uuid | NOT NULL | — | FK → exercises(id) |
| sort_order | smallint | NOT NULL | 0 | Порядок в сессии |
| started_at | timestamptz | NULL | — | Начало упражнения |
| completed_at | timestamptz | NULL | — | Завершение |
| was_skipped | boolean | NOT NULL | false | Пропущено |
| was_repeated | boolean | NOT NULL | false | Повторено |
| created_at | timestamptz | NOT NULL | now() | |

**Индексы:**
- `idx_session_exercises_session ON (session_id)`

**RLS:** Включена. Доступ через родительскую сессию (user_id проверяется через JOIN).

---

### Таблица: streaks

**Назначение:** Трекинг стриков и grace days (F8: Streaks & Gamification).
**Связана с:** auth.users (1:1)

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE, UNIQUE |
| current_streak | integer | NOT NULL | 0 | Текущий стрик (дни подряд) |
| longest_streak | integer | NOT NULL | 0 | Лучший стрик |
| last_activity_date | date | NULL | — | Дата последней сессии |
| grace_day_used | boolean | NOT NULL | false | Использован ли grace day в текущем стрике |
| grace_day_date | date | NULL | — | Дата grace day |
| total_sessions | integer | NOT NULL | 0 | Всего завершённых сессий |
| total_minutes | integer | NOT NULL | 0 | Общее время растяжки (минуты) |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (user_id)`
- `CHECK (current_streak >= 0)`
- `CHECK (longest_streak >= 0)`

**Индексы:**
- `idx_streaks_user ON (user_id)` (покрывается UNIQUE)

**RLS:** Включена. Пользователь видит/обновляет только свой стрик.

---

### Таблица: user_achievements

**Назначение:** Полученные пользователем бейджи (F8: Gamification).
**Связана с:** auth.users, achievements

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| achievement_id | uuid | NOT NULL | — | FK → achievements(id) ON DELETE CASCADE |
| earned_at | timestamptz | NOT NULL | now() | Когда получен |
| created_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (user_id, achievement_id)` — нельзя получить один бейдж дважды

**Индексы:**
- `idx_user_achievements_user ON (user_id)`

**RLS:** Включена. Пользователь видит только свои бейджи.

---

### Таблица: pain_entries

**Назначение:** Ежедневные check-in боли по зонам (F9: Pain Tracking).
**Связана с:** auth.users, body_zones

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| body_zone_id | uuid | NOT NULL | — | FK → body_zones(id) |
| pain_level | smallint | NOT NULL | — | Уровень боли 1–10 |
| notes | text | NULL | — | Комментарий пользователя |
| recorded_date | date | NOT NULL | CURRENT_DATE | Дата записи |
| deleted_at | timestamptz | NULL | — | Мягкое удаление |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (pain_level BETWEEN 1 AND 10)`
- `UNIQUE (user_id, body_zone_id, recorded_date)` — одна запись на зону в день

**Индексы:**
- `idx_pain_entries_user ON (user_id)`
- `idx_pain_entries_user_date ON (user_id, recorded_date DESC)`
- `idx_pain_entries_zone ON (user_id, body_zone_id, recorded_date DESC)`

**RLS:** Включена. Пользователь видит/создаёт/редактирует только свои записи.

---

### Таблица: favorites

**Назначение:** Избранные упражнения пользователя (F4: Library).
**Связана с:** auth.users, exercises

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| exercise_id | uuid | NOT NULL | — | FK → exercises(id) ON DELETE CASCADE |
| created_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (user_id, exercise_id)` — нельзя добавить в избранное дважды

**Индексы:**
- `idx_favorites_user ON (user_id)`

**RLS:** Включена. Пользователь видит/управляет только своим избранным.

---

### Таблица: reminder_schedules

**Назначение:** Расписание push-напоминаний (F5: Smart Reminders, F6: Eye 20-20-20).
**Связана с:** auth.users

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| reminder_type | text | NOT NULL | 'stretch' | CHECK: stretch, eye |
| start_time | time | NOT NULL | '09:00' | Начало рабочего дня |
| end_time | time | NOT NULL | '18:00' | Конец рабочего дня |
| interval_minutes | smallint | NOT NULL | 60 | Интервал: 20 (eye), 30/45/60/90 (stretch) |
| days_of_week | smallint[] | NOT NULL | '{1,2,3,4,5}' | Дни: 0=вс, 1=пн...6=сб |
| tone | text | NOT NULL | 'neutral' | CHECK: soft, neutral, motivating |
| is_active | boolean | NOT NULL | true | Активно ли расписание |
| dnd_start | time | NULL | — | Начало "Не беспокоить" |
| dnd_end | time | NULL | — | Конец "Не беспокоить" |
| deleted_at | timestamptz | NULL | — | Мягкое удаление |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `CHECK (reminder_type IN ('stretch', 'eye'))`
- `CHECK (tone IN ('soft', 'neutral', 'motivating'))`
- `CHECK (interval_minutes > 0)`

**Индексы:**
- `idx_reminder_schedules_user ON (user_id)`
- `idx_reminder_schedules_active ON (user_id, is_active) WHERE is_active = true`

**RLS:** Включена. Пользователь управляет только своими напоминаниями.

---

### Таблица: user_program_progress

**Назначение:** Прогресс пользователя в структурированных программах (F7: Sciatica).
**Связана с:** auth.users, programs, program_phases

| Колонка | Тип | Nullable | Default | Описание |
|---------|-----|----------|---------|----------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → auth.users(id) ON DELETE CASCADE |
| program_id | uuid | NOT NULL | — | FK → programs(id) ON DELETE CASCADE |
| current_phase_id | uuid | NULL | — | FK → program_phases(id), текущая фаза |
| current_day | smallint | NOT NULL | 1 | Текущий день программы |
| status | text | NOT NULL | 'active' | CHECK: active, paused, completed |
| last_symptom_check | jsonb | NULL | — | Последний symptom check: {pain_level, symptoms, date} |
| started_at | timestamptz | NOT NULL | now() | Начало программы |
| last_session_at | timestamptz | NULL | — | Последняя сессия |
| completed_at | timestamptz | NULL | — | Дата завершения |
| deleted_at | timestamptz | NULL | — | Мягкое удаление |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Constraints:**
- `UNIQUE (user_id, program_id)` — один прогресс на программу
- `CHECK (status IN ('active', 'paused', 'completed'))`
- `CHECK (current_day > 0)`

**Индексы:**
- `idx_user_program_progress_user ON (user_id)`
- `idx_user_program_progress_program ON (user_id, program_id)`

**RLS:** Включена. Пользователь видит/обновляет только свой прогресс.

---

## Источники

- [FEATURES.md](../02-product/FEATURES.md) — MVP scope F1–F10
- [MONETIZATION.md](../02-product/MONETIZATION.md) — тиры подписки, Adapty
- [SCREEN-MAP.md](../04-ux/SCREEN-MAP.md) — экраны и состояния
- [USER-FLOWS.md](../04-ux/USER-FLOWS.md) — пользовательские сценарии
