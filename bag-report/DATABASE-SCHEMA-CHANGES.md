# Изменения в DATABASE-SCHEMA.md

**Файл:** `deskcare/docs/05-database/DATABASE-SCHEMA.md`
**Что изменилось:** расширены две таблицы — `exercises` и `routine_exercises` — чтобы поддержать модель «атом × повторы» в плеере и каталоге.

---

## Таблица `exercises` — добавленные / изменённые поля

| Поле | Было | Стало | Зачем |
|------|------|-------|-------|
| `code` | — (нет) | `text NOT NULL UNIQUE` | Внутренний короткий код (`N1`, `B5`, `W12`, `S7`, `E3`) — для seed-скрипта и отладки |
| `title_en` | — | `text NULL` | Английское название (для биязычной библиотеки) |
| `description` | `text NULL` | то же, **используется как короткое UI-описание для карточки** | Раньше использовался как «описание техники» (длинно). Теперь это лаконичный текст для Library/Player |
| `duration_seconds` | `default 60` | `default 5` (диапазон 4–21 на практике) | Атомы — короткие loop-видео, не полные упражнения |
| `reps_inside_atom` | — | `text NULL` | Информационно: сколько повторений уже встроено в один проигрыш (например, "по 3 в каждую сторону"). Подсказка для дизайнера при сборке рутин |
| `difficulty` | `text` (`easy`/`medium`) | `smallint` (1/2/3) | Соответствие шкале в `EXERCISES-LIBRARY-SUPABASE.md`. Hard добавлен для Sciatica maintenance |
| `exercise_type` | CHECK: `stretch, eye, nerve_glide, tendon_glide` | CHECK: `stretch, mobility, strength, nerve_glide, tendon_glide, breathing` | Появились категории для Y-T-W (strength), круги плечами (mobility), диафрагмальное дыхание (breathing) |
| `cautions` | — | `text NULL` | Предупреждение в UI ("Прекратите при онемении" — для W8). Раньше было неявно через `contraindications text[]` |

**Полная новая структура:**

```sql
exercises (
  id                uuid PRIMARY KEY,
  code              text NOT NULL UNIQUE,         -- 'N1', 'B5', etc.
  slug              text NOT NULL UNIQUE,         -- 'neck-lateral-tilt'
  title             text NOT NULL,                -- "Наклоны головы в стороны"
  title_en          text,                         -- "Lateral Neck Tilt"
  description       text,                         -- короткое UI-описание для карточки
  video_url         text,                         -- exercise-videos bucket
  thumbnail_url     text,
  duration_seconds  smallint NOT NULL DEFAULT 5,  -- длина одного проигрыша атома
  reps_inside_atom  text,                         -- "по 3 в каждую сторону"
  difficulty        smallint NOT NULL DEFAULT 1,  -- 1=easy, 2=medium, 3=hard
  exercise_type     text NOT NULL DEFAULT 'stretch',
  is_premium        boolean NOT NULL DEFAULT false,
  target_muscles    text[],
  contraindications text[],
  cautions          text,
  modifications     text,
  audio_url         text,
  sort_order        smallint NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CHECK (difficulty BETWEEN 1 AND 3),
  CHECK (exercise_type IN ('stretch','mobility','strength','nerve_glide','tendon_glide','breathing')),
  CHECK (duration_seconds > 0 AND duration_seconds <= 60)
);

CREATE INDEX idx_exercises_code  ON exercises(code);
CREATE INDEX idx_exercises_slug  ON exercises(slug);
CREATE INDEX idx_exercises_type  ON exercises(exercise_type);
CREATE INDEX idx_exercises_is_premium ON exercises(is_premium);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
```

---

## Таблица `routine_exercises` — добавленные поля

Это **главное изменение** под модель «атом × повторы».

| Поле | Было | Стало | Зачем |
|------|------|-------|-------|
| `reps` | — | `smallint NOT NULL DEFAULT 1` | Сколько раз атом проигрывается бесшовно подряд внутри одного item-а рутины. Реальная длительность item-а = `exercises.duration_seconds × reps` |
| `overlay_text` | — | `text NULL` | Подсказка-оверлей для плеера ("вдох-выдох", "по 1 повтору в каждую сторону") |
| `rest_seconds` | — | `smallint NOT NULL DEFAULT 0` | Пауза после item-а перед следующим (на MVP = 0, бесшовные стыки атомов) |

**Новая структура:**

```sql
routine_exercises (
  id            uuid PRIMARY KEY,
  routine_id    uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id   uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sort_order    smallint NOT NULL DEFAULT 0,
  reps          smallint NOT NULL DEFAULT 1,
  overlay_text  text,
  rest_seconds  smallint NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (routine_id, sort_order),
  CHECK (reps > 0 AND reps <= 20),
  CHECK (rest_seconds >= 0 AND rest_seconds <= 30)
);

CREATE INDEX idx_routine_exercises_routine ON routine_exercises(routine_id, sort_order);
```

**Расчёт длительности рутины** (для клиента или триггера):

```
total_routine_duration = Σ (exercises.duration_seconds × reps + rest_seconds)
```

В MVP считаем на клиенте при загрузке `routine_items`. На v1.1 — добавить триггер пересчёта `routines.duration_seconds` при изменении состава.

---

## Что НЕ менялось

- Таблица `body_zones` — slugs остались `neck`, `back`, `wrists`, `full_body`, `eyes`. Sciatica остаётся **программой** (`programs.slug='sciatica'`), не зоной тела.
- Таблица `exercise_body_zones` (M:N) — без изменений. Кросс-категория обеспечивается через 2-ю запись в этой таблице (примеры: N5 → `(N5, neck, primary=true)` + `(N5, full_body, primary=false)`).
- Таблицы пользовательской части (`profiles`, `sessions`, `session_exercises`, `streaks`, `pain_entries`, ...) — без изменений.

---

## Влияние на миграции

При следующей миграции в `MIGRATIONS.md` добавить:

```sql
-- Migration: extend exercises and routine_exercises for atom×reps model
ALTER TABLE exercises
  ADD COLUMN code text,
  ADD COLUMN title_en text,
  ADD COLUMN reps_inside_atom text,
  ADD COLUMN cautions text;

UPDATE exercises SET code = upper(left(slug, 3)) WHERE code IS NULL; -- временный код, потом seed перезапишет
ALTER TABLE exercises
  ALTER COLUMN code SET NOT NULL,
  ALTER COLUMN duration_seconds SET DEFAULT 5;
ALTER TABLE exercises ADD CONSTRAINT exercises_code_unique UNIQUE (code);

-- difficulty: text → smallint
ALTER TABLE exercises ADD COLUMN difficulty_new smallint;
UPDATE exercises SET difficulty_new = CASE difficulty
  WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 ELSE 1 END;
ALTER TABLE exercises DROP COLUMN difficulty;
ALTER TABLE exercises RENAME COLUMN difficulty_new TO difficulty;
ALTER TABLE exercises ALTER COLUMN difficulty SET NOT NULL, ALTER COLUMN difficulty SET DEFAULT 1;
ALTER TABLE exercises ADD CONSTRAINT exercises_difficulty_check CHECK (difficulty BETWEEN 1 AND 3);

-- расширение exercise_type
ALTER TABLE exercises DROP CONSTRAINT exercises_exercise_type_check;
ALTER TABLE exercises ADD CONSTRAINT exercises_exercise_type_check
  CHECK (exercise_type IN ('stretch','mobility','strength','nerve_glide','tendon_glide','breathing'));

-- routine_exercises: reps + overlay + rest
ALTER TABLE routine_exercises
  ADD COLUMN reps smallint NOT NULL DEFAULT 1,
  ADD COLUMN overlay_text text,
  ADD COLUMN rest_seconds smallint NOT NULL DEFAULT 0,
  ADD CONSTRAINT routine_exercises_reps_check CHECK (reps > 0 AND reps <= 20),
  ADD CONSTRAINT routine_exercises_rest_check CHECK (rest_seconds >= 0 AND rest_seconds <= 30);
```

(Финальный миграционный SQL — задача отдельного PR с правкой `MIGRATIONS.md`.)
