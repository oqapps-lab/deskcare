# DeskCare — RLS Policies

**Дата:** 13 апреля 2026
**Основа:** [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md)
**Принцип:** RLS включена на ВСЕХ таблицах без исключений.

---

## Общие правила

1. **Пользовательские данные** — доступ только к своим записям (`auth.uid() = user_id`)
2. **Контент/справочники** — публичное чтение, запись только через service role
3. **Premium-контент** — доступ через проверку подписки
4. **Подписки** — чтение пользователем, запись только через service role (webhook)
5. **Мягкое удаление** — RLS фильтрует `deleted_at IS NULL` где применимо

---

## Вспомогательная функция: проверка активной подписки

```sql
CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid()
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## Справочные / Контентные таблицы

### Таблица: body_zones

```sql
ALTER TABLE public.body_zones ENABLE ROW LEVEL SECURITY;

-- SELECT: публичное чтение
CREATE POLICY "Anyone can read body zones"
ON public.body_zones FOR SELECT
USING (true);

-- INSERT/UPDATE/DELETE: только service role (миграции, seed)
-- Нет политик = запрещено для authenticated/anon ролей
```

---

### Таблица: exercises

```sql
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- SELECT: бесплатные — всем, premium — подписчикам
CREATE POLICY "Anyone can read free exercises"
ON public.exercises FOR SELECT
USING (
  is_premium = false
  OR public.has_active_subscription()
);
```

---

### Таблица: exercise_body_zones

```sql
ALTER TABLE public.exercise_body_zones ENABLE ROW LEVEL SECURITY;

-- SELECT: публичное чтение (фильтрация premium на уровне exercises)
CREATE POLICY "Anyone can read exercise-zone mappings"
ON public.exercise_body_zones FOR SELECT
USING (true);
```

---

### Таблица: routines

```sql
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- SELECT: бесплатные — всем, premium — подписчикам
CREATE POLICY "Anyone can read free routines"
ON public.routines FOR SELECT
USING (
  is_premium = false
  OR public.has_active_subscription()
);
```

---

### Таблица: routine_exercises

```sql
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

-- SELECT: публичное чтение (фильтрация на уровне routines)
CREATE POLICY "Anyone can read routine exercises"
ON public.routine_exercises FOR SELECT
USING (true);
```

---

### Таблица: programs

```sql
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- SELECT: все видят программы (для отображения карточек с lock/unlock)
CREATE POLICY "Anyone can read programs"
ON public.programs FOR SELECT
USING (true);
```

---

### Таблица: program_phases

```sql
ALTER TABLE public.program_phases ENABLE ROW LEVEL SECURITY;

-- SELECT: фазы premium-программ — только подписчикам
CREATE POLICY "Users can read program phases"
ON public.program_phases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.programs p
    WHERE p.id = program_phases.program_id
    AND (p.is_premium = false OR public.has_active_subscription())
  )
);
```

---

### Таблица: program_exercises

```sql
ALTER TABLE public.program_exercises ENABLE ROW LEVEL SECURITY;

-- SELECT: упражнения premium-фаз — только подписчикам
CREATE POLICY "Users can read program exercises"
ON public.program_exercises FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.program_phases ph
    JOIN public.programs p ON p.id = ph.program_id
    WHERE ph.id = program_exercises.phase_id
    AND (p.is_premium = false OR public.has_active_subscription())
  )
);
```

---

### Таблица: achievements

```sql
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- SELECT: публичное чтение (все видят доступные бейджи)
CREATE POLICY "Anyone can read achievements"
ON public.achievements FOR SELECT
USING (true);
```

---

## Пользовательские таблицы

### Таблица: profiles

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: пользователь видит только свой профиль
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- UPDATE: пользователь редактирует только свой профиль
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- INSERT: автоматически через trigger on_auth_user_created
-- Дополнительная политика для случая ручного создания:
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- DELETE: запрещён (аккаунт удаляется через auth.users CASCADE)
```

---

### Таблица: user_settings

```sql
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "Users can view own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can create own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

### Таблица: subscriptions

```sql
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: пользователь видит только свою подписку
CREATE POLICY "Users can view own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE: ЗАПРЕЩЕНО для клиента
-- Только service role через Edge Function (Adapty webhook)
-- Service role автоматически обходит RLS
```

**Важно:** Запись в `subscriptions` происходит ТОЛЬКО через Edge Function `handle-adapty-webhook`, которая работает с `service_role` key и обходит RLS.

---

### Таблица: sessions

```sql
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- SELECT: пользователь видит только свои сессии (без удалённых)
CREATE POLICY "Users can view own sessions"
ON public.sessions FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT: пользователь создаёт сессии от своего имени
CREATE POLICY "Users can create own sessions"
ON public.sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: пользователь обновляет свои сессии (завершение, soft delete)
CREATE POLICY "Users can update own sessions"
ON public.sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

### Таблица: session_exercises

```sql
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;

-- SELECT: через принадлежность сессии пользователю
CREATE POLICY "Users can view own session exercises"
ON public.session_exercises FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_exercises.session_id
    AND s.user_id = auth.uid()
    AND s.deleted_at IS NULL
  )
);

-- INSERT: если сессия принадлежит пользователю
CREATE POLICY "Users can create own session exercises"
ON public.session_exercises FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_exercises.session_id
    AND s.user_id = auth.uid()
  )
);

-- UPDATE: если сессия принадлежит пользователю
CREATE POLICY "Users can update own session exercises"
ON public.session_exercises FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_exercises.session_id
    AND s.user_id = auth.uid()
  )
);
```

---

### Таблица: streaks

```sql
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "Users can view own streak"
ON public.streaks FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can create own streak"
ON public.streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own streak"
ON public.streaks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

### Таблица: user_achievements

```sql
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- SELECT: пользователь видит свои бейджи
CREATE POLICY "Users can view own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: пользователь (клиент) может добавить бейдж
CREATE POLICY "Users can earn achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

### Таблица: pain_entries

```sql
ALTER TABLE public.pain_entries ENABLE ROW LEVEL SECURITY;

-- SELECT: свои записи, без удалённых
CREATE POLICY "Users can view own pain entries"
ON public.pain_entries FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT
CREATE POLICY "Users can create own pain entries"
ON public.pain_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: для редактирования и soft delete
CREATE POLICY "Users can update own pain entries"
ON public.pain_entries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

### Таблица: favorites

```sql
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "Users can view own favorites"
ON public.favorites FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can add favorites"
ON public.favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- DELETE: физическое удаление (убрать из избранного)
CREATE POLICY "Users can remove own favorites"
ON public.favorites FOR DELETE
USING (auth.uid() = user_id);
```

---

### Таблица: reminder_schedules

```sql
ALTER TABLE public.reminder_schedules ENABLE ROW LEVEL SECURITY;

-- SELECT: свои, без удалённых
CREATE POLICY "Users can view own reminders"
ON public.reminder_schedules FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT
CREATE POLICY "Users can create own reminders"
ON public.reminder_schedules FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own reminders"
ON public.reminder_schedules FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

### Таблица: user_program_progress

```sql
ALTER TABLE public.user_program_progress ENABLE ROW LEVEL SECURITY;

-- SELECT: свой прогресс, без удалённых
CREATE POLICY "Users can view own program progress"
ON public.user_program_progress FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT
CREATE POLICY "Users can start programs"
ON public.user_program_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own program progress"
ON public.user_program_progress FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## Сводная таблица политик

| Таблица | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| body_zones | public | service | service | service |
| exercises | free/premium | service | service | service |
| exercise_body_zones | public | service | service | service |
| routines | free/premium | service | service | service |
| routine_exercises | public | service | service | service |
| programs | public | service | service | service |
| program_phases | free/premium | service | service | service |
| program_exercises | free/premium | service | service | service |
| achievements | public | service | service | service |
| profiles | own | own | own | cascade |
| user_settings | own | own | own | — |
| subscriptions | own | service | service | service |
| sessions | own (soft) | own | own | — |
| session_exercises | own (join) | own (join) | own (join) | — |
| streaks | own | own | own | — |
| user_achievements | own | own | — | — |
| pain_entries | own (soft) | own | own | — |
| favorites | own | own | — | own |
| reminder_schedules | own (soft) | own | own | — |
| user_program_progress | own (soft) | own | own | — |

**Легенда:**
- `public` — любой пользователь (включая anon)
- `free/premium` — бесплатный контент всем, premium — подписчикам
- `own` — только свои данные (`auth.uid() = user_id`)
- `own (soft)` — свои данные + фильтр `deleted_at IS NULL`
- `own (join)` — через JOIN с родительской таблицей
- `service` — только service role (Edge Functions, webhooks)
- `cascade` — удаление через каскад auth.users

---

## Источники

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) — структура таблиц
- [MONETIZATION.md](../02-product/MONETIZATION.md) — тиры Free/Pro/Sciatica
