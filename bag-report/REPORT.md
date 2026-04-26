# Bag-report — Atom Library + Routines + Player

**Дата:** 2026-04-25
**Ветка:** `feature/RussellZain`
**Коммит с правками:** `72705ec docs(content): add atom library + routines catalog + player spec`
**Автор изменений:** Russell Zain

---

## Суть в трёх предложениях

1. Завели **библиотеку из 64 атомов** (бесшовно зацикленные видео-loop) — основу для таблицы `exercises` в Supabase. Каждый атом помечен длительностью (4–21 сек), числом повторов внутри атома и зонами тела (M:N через `exercise_body_zones`).
2. Расширили схему БД (`exercises`, `routine_exercises`) под модель **«атом × повторы»** — реальная длительность item-а в рутине = `atom.duration × reps`. Это позволяет составлять любые рутины из одних и тех же атомов без перезаписи видео.
3. Описали **20 готовых рутин** (формулы вида `N1×4 + N2×4 + N3×2`) и спецификацию **React Native плеера** на `expo-video`, который проигрывает рутину как поток атомов с бесшовными повторами.

---

## Что изменилось — список файлов

### В этой папке (`bag-report/`) — копии для вычитки

| Файл | Размер | Назначение |
|------|-------:|-----------|
| `EXERCISES-LIBRARY-SUPABASE.md` | ~40 KB | Каталог всех 64 атомов с длительностями, повторами, зонами и кросс-категориями. Источник истины для seed-скрипта. |
| `ROUTINES-CATALOG.md` | ~19 KB | Концертный список 20 рутин (формулы `code × reps` + расчёт времени). |
| `ROUTINE-PLAYER.md` | ~9 KB | Спецификация плеера в React Native: контракт данных, бесшовный re-loop, overlay, запись session. |
| `DATABASE-SCHEMA-CHANGES.md` | ~6 KB | Diff-сводка изменений в `DATABASE-SCHEMA.md` (только новые/изменённые поля). |
| `REPORT.md` | этот файл | Сводный отчёт. |

### В каноническом месте репозитория

| Путь | Действие |
|------|---------|
| `docs/05-database/EXERCISES-LIBRARY-SUPABASE.md` | **создан** |
| `docs/05-database/ROUTINES-CATALOG.md` | **создан** |
| `docs/05-database/DATABASE-SCHEMA.md` | **изменён** (см. `DATABASE-SCHEMA-CHANGES.md`) |
| `docs/07-development/ROUTINE-PLAYER.md` | **создан** (новая папка `07-development/`) |

---

## Ключевые концепты

### 1. Атом

Короткое видео (4–21 сек), снятое **с бесшовным стыком**: финальный кадр = стартовому. Это значит — несколько проигрышей подряд выглядят как одно непрерывное упражнение.

```
exercises table:
  code: 'N1'
  title: 'Наклоны головы в стороны'
  duration_seconds: 6
  reps_inside_atom: 'по 1 наклону в каждую сторону'
```

### 2. Повторы внутри атома (`reps_inside_atom`)

Сколько «реальных циклов» уже встроено в один проигрыш атома. Это **информационное** поле для дизайнера, чтобы понимать сколько работы один проигрыш даёт.

Пример: `N7` (Круги локтями) внутри уже делает 3 круга вперёд + 3 назад + возврат рук на бёдра — это считается «1 повтор атома».

### 3. Повторы в рутине (`routine_exercises.reps`)

Сколько раз атом проигрывается **бесшовно подряд** в рамках одного item-а рутины. Это **управляющее** поле для плеера.

```
itemDuration = exercises.duration_seconds * routine_exercises.reps
```

### 4. Кросс-категория = M:N запись, не клон

Атом `N5` (Круги плечами) фигурирует и в шее, и в «всё тело». В БД это **одна** строка в `exercises`, и **две** записи в `exercise_body_zones`: `(N5, neck, is_primary=true)` + `(N5, full_body, is_primary=false)`.

В каталоге библиотеки введены условные коды (B12, F11–F15, S12) — чисто для UI Library, чтобы при фильтре по «Спина» появлялся N9 и т.д. В seed-скрипте эти коды **подменяются исходным** code атома.

### 5. Формула рутины

```
N1×4 + N2×4 + N3×2 + N6×1 + N9×3 + N10×1
= 24 + 24 + 14 + 10 + 15 + 9
= 96 секунд (≈ 1:36, рутина «Шея · Быстрая»)
```

---

## Что выиграли архитектурно

| Аспект | Раньше | Теперь |
|--------|--------|--------|
| **Состав рутины** | таблица `routine_exercises` хранила только порядок (`sort_order`) | Хранит ещё `reps`, `overlay_text`, `rest_seconds` |
| **Длительность рутины** | приходилось руками считать или хардкодить в `routines.duration_seconds` | Вычисляется как `Σ (atom_duration × reps + rest)` — без расхождений |
| **Атомы и категории** | один атом = одна категория (нужны были клоны строк) | Один атом = одна строка, M:N в нескольких категориях |
| **Гибкость** | новая рутина → новый seed; иногда новые атомы | Любая комбинация существующих 64 атомов с любыми reps → новая рутина без съёмки |
| **Плеер** | проигрывал по одному атому per-item | Проигрывает атом N раз бесшовно, корректно показывает прогресс |

---

## Цифры

- **Атомы в БД:** 64 уникальные строки в `exercises`.
- **M:N связи:** 64 + 8 кросс-ссылок = 72 записи в `exercise_body_zones`.
- **Рутины:** 20 строк в `routines`, ≈ 200 записей в `routine_exercises`.
- **Покрытие:** каждый атом используется минимум в одной рутине.
- **Premium-рутины:** 4 шт (R14–R17, Sciatica acute + maintenance).
- **Smart Reminders 60-секундные:** 5 шт (R1, R4, R7, R10, R18) — по одной на каждую зону.

---

## Что в коде надо сделать дальше (не в этом коммите)

1. **Migrations SQL** — финализировать `MIGRATIONS.md` с фактическими `ALTER TABLE` (см. `DATABASE-SCHEMA-CHANGES.md`, раздел «Влияние на миграции»).
2. **Seed-скрипт** — `deskcare/supabase/seed/exercises.sql` (64 атома + 72 M:N) и `deskcare/supabase/seed/routines.sql` (20 рутин + ~200 routine_exercises).
3. **Загрузка видео в Storage** — 64 файла в bucket `exercise-videos` по структуре `{slug}/video.mp4` (опционально + `_720p.mp4` / `_480p.mp4`). И 64 thumbnail в `exercise-thumbnails`.
4. **Routine Player компонент** — реализовать по спецификации `ROUTINE-PLAYER.md` на `expo-video`. Тест-чеклист в конце спеки.
5. **Cautions UI** — pre-roll показ для W8 (Median Nerve Glide) и Sciatica-серии.

---

## Как проверить

1. `git checkout feature/RussellZain && git pull`
2. Посмотреть в `docs/05-database/EXERCISES-LIBRARY-SUPABASE.md` сводную таблицу атомов в разделе 8 — там вся библиотека одной таблицей.
3. Посмотреть в `docs/05-database/ROUTINES-CATALOG.md` раздел 9 (сводная таблица всех 20 рутин с длительностями).
4. Проверить, что `docs/05-database/DATABASE-SCHEMA.md` обновлён в части `exercises` и `routine_exercises` (см. `DATABASE-SCHEMA-CHANGES.md` за коротким diff).
5. Открыть `docs/07-development/ROUTINE-PLAYER.md` для контракта плеера (раздел 4 — псевдокод).

---

## Связанные файлы (точки входа)

- Каталог атомов: [`docs/05-database/EXERCISES-LIBRARY-SUPABASE.md`](../docs/05-database/EXERCISES-LIBRARY-SUPABASE.md)
- Каталог рутин: [`docs/05-database/ROUTINES-CATALOG.md`](../docs/05-database/ROUTINES-CATALOG.md)
- Схема БД: [`docs/05-database/DATABASE-SCHEMA.md`](../docs/05-database/DATABASE-SCHEMA.md)
- Плеер: [`docs/07-development/ROUTINE-PLAYER.md`](../docs/07-development/ROUTINE-PLAYER.md)
- MVP-промты Seedance (исходник, не в git): `C:\Users\Russell\Desktop\ПРИЛОЖЕНИЯ\DeskCare\MVP-EXERCISES-LIST.md`
