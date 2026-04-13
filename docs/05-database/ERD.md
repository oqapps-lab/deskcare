# DeskCare — Entity-Relationship Diagram

**Дата:** 13 апреля 2026
**Основа:** [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md)

---

## Полная диаграмма

```
                                    ┌─────────────────┐
                                    │   auth.users     │
                                    │   (Supabase)     │
                                    └────────┬────────┘
                                             │ id
           ┌──────────┬──────────┬───────────┼───────────┬──────────┬──────────┐
           │          │          │           │           │          │          │
           │ 1:1      │ 1:1     │ 1:1       │ 1:1       │ 1:N      │ 1:N      │
           ▼          ▼         ▼           ▼           ▼          ▼          │
    ┌──────────┐ ┌─────────┐ ┌───────┐ ┌──────────────┐ ┌────────┐ ┌────────┐ │
    │ profiles │ │  user_  │ │subscrip│ │   streaks    │ │sessions│ │ pain_  │ │
    │          │ │settings │ │ tions  │ │              │ │        │ │entries │ │
    │ id = FK  │ │         │ │        │ │ current_     │ │        │ │        │ │
    │ display_ │ │ theme   │ │ status │ │ streak       │ │ type   │ │ level  │ │
    │ name     │ │ lang    │ │ plan   │ │ longest_     │ │ dur.   │ │ zone   │ │
    │ onboard_ │ │ audio   │ │ adapty │ │ streak       │ │ compl. │ │ date   │ │
    │ data     │ │ haptics │ │ is_act.│ │ grace_day    │ │        │ │        │ │
    └──────────┘ └─────────┘ └────────┘ └──────────────┘ └───┬────┘ └───┬────┘
                                                              │          │
                                                              │ 1:N      │ N:1
                                                              ▼          ▼
                                                        ┌──────────┐ ┌────────┐
                                                        │ session_ │ │ body_  │
                                                        │exercises │ │ zones  │
                                                        │          │ │        │
                                                        │ sort     │ │ slug   │
                                                        │ skipped  │ │ name   │
                                                        │ repeated │ │ icon   │
                                                        └────┬─────┘ └───┬────┘
                                                             │           │
                                                             │ N:1       │ 1:N         1:N
                                                             ▼           │              │
    ┌───────────┐    ┌────────────────┐    ┌───────────┐ ┌───┴──────┐    │    ┌─────────┴──┐
    │ routine_  │    │exercise_body_  │    │ program_  │ │exercises │    │    │  routines   │
    │ exercises │    │    zones       │    │ exercises │ │          │    │    │             │
    │           │◄───┤               ├───►│           │ │ slug     │◄───┘    │ slug        │
    │ sort_order│    │ exercise_id   │    │ day_number│ │ title    │         │ body_zone_id│
    │           │    │ body_zone_id  │    │ sort_order│ │ video    │         │ duration    │
    └─────┬─────┘    └───────────────┘    └─────┬─────┘ │ duration │         │ is_premium  │
          │                                     │       │ type     │         └─────────────┘
          │ N:1                                 │ N:1   │ premium  │
          ▼                                     ▼       └──────────┘
    ┌───────────┐                         ┌───────────┐
    │ routines  │                         │ program_  │
    │           │                         │  phases   │
    │ (см. выше)│                         │           │
    └───────────┘                         │ phase_type│
                                          │ sort_order│
                                          └─────┬─────┘
                                                │ N:1
                                                ▼
                                          ┌───────────┐
                                          │ programs  │
                                          │           │
                                          │ slug      │
                                          │ is_premium│
                                          │ disclaimer│
                                          └─────┬─────┘
                                                │
                                                │ 1:N
                                                ▼
                                     ┌─────────────────────┐
                                     │ user_program_        │
                                     │ progress             │
                                     │                      │
                                     │ user_id → auth.users │
                                     │ current_phase_id     │
                                     │ current_day          │
                                     │ status               │
                                     └──────────────────────┘


           ┌─────────────────┐
           │   auth.users     │
           └────────┬────────┘
                    │
        ┌───────────┼───────────┐
        │ 1:N       │ 1:N       │ 1:N
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌──────────────┐
   │favorites│ │reminder_│ │user_         │
   │         │ │schedules│ │achievements  │
   │         │ │         │ │              │
   │ exer_id │ │ type    │ │ achievement_ │
   │         │ │ interval│ │ id           │
   └────┬────┘ │ tone    │ │ earned_at    │
        │      │ is_act. │ └──────┬───────┘
        │ N:1  └─────────┘        │ N:1
        ▼                         ▼
   ┌─────────┐              ┌───────────┐
   │exercises│              │achievements│
   │(см.выше)│              │            │
   └─────────┘              │ slug       │
                            │ criteria   │
                            └────────────┘
```

---

## Связи (все)

### 1:1 (One-to-One)

| Таблица A | Таблица B | FK | Механизм |
|-----------|-----------|-------|----------|
| auth.users | profiles | profiles.id = auth.users.id | PK = FK |
| auth.users | user_settings | user_settings.user_id | UNIQUE |
| auth.users | subscriptions | subscriptions.user_id | UNIQUE |
| auth.users | streaks | streaks.user_id | UNIQUE |

### 1:N (One-to-Many)

| Таблица "1" | Таблица "N" | FK |
|-------------|-------------|-----|
| auth.users | sessions | sessions.user_id |
| auth.users | pain_entries | pain_entries.user_id |
| auth.users | favorites | favorites.user_id |
| auth.users | reminder_schedules | reminder_schedules.user_id |
| auth.users | user_achievements | user_achievements.user_id |
| auth.users | user_program_progress | user_program_progress.user_id |
| body_zones | routines | routines.body_zone_id |
| body_zones | pain_entries | pain_entries.body_zone_id |
| routines | routine_exercises | routine_exercises.routine_id |
| routines | sessions | sessions.routine_id |
| exercises | routine_exercises | routine_exercises.exercise_id |
| exercises | program_exercises | program_exercises.exercise_id |
| exercises | session_exercises | session_exercises.exercise_id |
| exercises | favorites | favorites.exercise_id |
| programs | program_phases | program_phases.program_id |
| programs | user_program_progress | user_program_progress.program_id |
| program_phases | program_exercises | program_exercises.phase_id |
| program_phases | sessions | sessions.program_phase_id |
| program_phases | user_program_progress | user_program_progress.current_phase_id |
| sessions | session_exercises | session_exercises.session_id |
| achievements | user_achievements | user_achievements.achievement_id |

### M:N (Many-to-Many)

| Таблица A | Таблица B | Junction Table |
|-----------|-----------|---------------|
| exercises | body_zones | exercise_body_zones |

---

## Количество таблиц

| Категория | Кол-во | Таблицы |
|-----------|--------|---------|
| Auth (Supabase) | 1 | auth.users |
| Справочники | 2 | body_zones, achievements |
| Контент | 6 | exercises, exercise_body_zones, routines, routine_exercises, programs, program_phases, program_exercises |
| Пользователь | 11 | profiles, user_settings, subscriptions, sessions, session_exercises, streaks, user_achievements, pain_entries, favorites, reminder_schedules, user_program_progress |
| **Итого** | **20** | (без auth.users) |

---

## Источники

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) — полная структура таблиц
