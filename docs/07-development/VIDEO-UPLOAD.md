# Загрузка видео упражнений в Supabase

**Кому:** Russell Zain
**Что:** Залить 64 видео-атома (и опционально thumbnail'ы) в Supabase Storage, чтобы плеер в приложении начал показывать их вместо stick-figure placeholder'ов.
**Сколько займёт:** один проход через `tsx`-скрипт, ~5–15 минут на upload в зависимости от твоего интернета.

---

## TL;DR

1. Переименуй файлы по slug-конвенции (таблица в §3 ниже): `seated-cat-cow.mp4`, `neck-rotation.mp4` и т.д. Положи всё в одну папку.
2. `git pull` ветку `main` (там скрипт и эта инструкция).
3. Получи у меня (Евгения) `SERVICE_ROLE_KEY` Supabase — в открытом репо его нет.
4. Из корня проекта:
   ```bash
   cd deskcare
   npm install     # один раз; ставит supabase-js + tsx
   SUPABASE_URL=https://rwgpvmnuuarhcnpgibtm.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=<KEY> \
   npx tsx scripts/upload-exercise-videos.ts /path/to/your/videos --dry-run
   ```
5. Если `--dry-run` показывает план без ошибок — запусти ещё раз без `--dry-run`. Готово.

---

## 1. Конвенция именования файлов

Имя файла = `<slug>.<ext>` без подпапок.

- **Видео:** `.mp4` (предпочтительно H.264) или `.mov`. Лимит 50 MB на файл.
- **Thumbnail:** `.jpg` / `.png` / `.webp`. Лимит 5 MB. Опционально (если не зальёшь — UI покажет первый кадр видео).
- Регистр имени **не важен** (`Seated-Cat-Cow.mp4` ≡ `seated-cat-cow.mp4`).
- **Один файл на slug.** Если у тебя есть `_720p` / `_480p` варианты — пока кладём только мастер-файл; адаптивный stream'инг — отдельная задача.

После загрузки скрипт автоматически:
- Положит файл в `exercise-videos/<slug>/video.mp4` (или `.mov`).
- Запишет публичный URL в `exercises.video_url` для строки с этим `slug`.
- Сделает то же для thumbnail'а в `exercise-thumbnails/<slug>/thumb.<ext>` → `exercises.thumbnail_url`.

Файлы с именем, которое не матчится ни на один slug, скрипт **пропустит** и распечатает список — чтобы ты мог проверить опечатки.

---

## 2. Что нужно установить локально

На Windows достаточно:

```bash
# Node 20+ (если ещё не стоит)
winget install OpenJS.NodeJS.LTS

# Клон репо (если ещё нет)
git clone https://github.com/oqapps-lab/deskcare.git
cd deskcare
git checkout main
git pull

# Установить зависимости (включает @supabase/supabase-js + tsx)
npm install
```

Проверка: `npx tsx --version` должно напечатать версию.

---

## 3. Полный маппинг code → slug → название

64 атома, по которым ты снимал. Каждая строка — одно ожидаемое имя файла.

### Шея (neck) — 10 атомов

| Code | filename                        | RU название                       |
|------|---------------------------------|-----------------------------------|
| N1   | `neck-lateral-tilt.mp4`         | Наклоны головы в стороны          |
| N2   | `neck-rotation.mp4`             | Повороты головы                   |
| N3   | `chin-nod.mp4`                  | Кивки «да»                        |
| N4   | `slow-head-circles.mp4`         | Круговые движения головой         |
| N5   | `shoulder-rolls.mp4`            | Круги плечами                     |
| N6   | `upper-trap-stretch.mp4`        | Растяжка шеи с рукой              |
| N7   | `fingertips-elbow-circles.mp4`  | Кисти к плечам — круги локтями    |
| N8   | `shoulder-shrugs.mp4`           | Подъёмы плеч                      |
| N9   | `scapular-squeeze.mp4`          | Сведение лопаток                  |
| N10  | `back-of-neck-stretch.mp4`      | Растяжка задней поверхности шеи   |

### Спина (back) — 11 атомов

| Code | filename                        | RU название                       |
|------|---------------------------------|-----------------------------------|
| B1   | `seated-cat-cow.mp4`            | Кошка-Корова сидя                 |
| B2   | `seated-spinal-twist.mp4`       | Скручивание сидя                  |
| B3   | `seated-forward-fold.mp4`       | Наклон вперёд сидя                |
| B4   | `seated-side-bend.mp4`          | Боковые наклоны сидя              |
| B5   | `seated-knee-to-chest.mp4`      | Колено к груди сидя               |
| B6   | `seated-back-extension.mp4`     | Прогиб сидя                       |
| B7   | `seated-figure-4.mp4`           | «Фигура 4» сидя                   |
| B8   | `seated-pelvic-tilts.mp4`       | Прогибы таза в динамике           |
| B9   | `seated-hamstring-stretch.mp4`  | Растяжка подколенных сидя         |
| B10  | `seated-upper-back-round.mp4`   | «Молитвенный» жест для верха спины|
| B11  | `overhead-side-reach.mp4`       | Наклон в сторону с вытянутой рукой|

### Кисти (wrists) — 12 атомов

| Code | filename                        | RU название                       |
|------|---------------------------------|-----------------------------------|
| W1   | `wrist-flexor-stretch.mp4`      | Растяжка сгибателей запястья      |
| W2   | `wrist-extensor-stretch.mp4`    | Растяжка разгибателей запястья    |
| W3   | `wrist-circles.mp4`             | Круги запястьями                  |
| W4   | `fist-open-close.mp4`           | Сжатие/раскрытие кулаков          |
| W5   | `prayer-stretch.mp4`            | «Молитвенный» растяжитель         |
| W6   | `reverse-prayer.mp4`            | Обратный «молитвенный»            |
| W7   | `finger-fan.mp4`                | Поочерёдный веер пальцами         |
| W8   | `median-nerve-glide.mp4`        | Скольжение срединного нерва       |
| W9   | `thumb-stretch.mp4`             | Растяжка большого пальца          |
| W10  | `finger-wave.mp4`               | «Волна» пальцами                  |
| W11  | `hand-shake-out.mp4`            | Встряска кистями                  |
| W12  | `finger-claws.mp4`              | Сгибание фалангов пальцев         |

### Всё тело (full_body) — 10 атомов

| Code | filename                        | RU название                       |
|------|---------------------------------|-----------------------------------|
| F1   | `seated-chest-open-cross.mp4`   | Раскрытие грудного отдела + лопатки |
| F2   | `cross-body-shoulder.mp4`       | Растяжка плеча через грудь        |
| F3   | `y-t-w-arms.mp4`                | Подъёмы рук Y-T-W                 |
| F4   | `self-hug-scap.mp4`             | «Обнимашки»                       |
| F5   | `ankle-rolls.mp4`               | Перекаты стопами                  |
| F6   | `seated-calf-toe.mp4`           | Растяжка икр сидя                 |
| F7   | `seated-marching.mp4`           | Подъёмы колен сидя                |
| F8   | `full-body-wakeup.mp4`          | «Просыпающаяся» полная разминка   |
| F9   | `inner-arm-stretch.mp4`         | Растяжение внутренней поверхности руки |
| F10  | `arm-bicycles.mp4`              | Велосипед руками                  |

### Седалищный нерв (sciatica) — 13 атомов

| Code | filename                        | RU название                       |
|------|---------------------------------|-----------------------------------|
| S1   | `gentle-seated-decompression.mp4` | Мягкое вытяжение позвоночника сидя |
| S2   | `sciatic-nerve-mobilization.mp4` | Мобилизация седалищного нерва     |
| S3   | `gentle-figure-4.mp4`           | Лёгкая «Фигура 4» сидя            |
| S4   | `seated-sciatic-glide.mp4`      | Нерв-глайд седалищного            |
| S5   | `gentle-seated-twist.mp4`       | Мягкое скручивание сидя           |
| S6   | `diaphragmatic-breathing.mp4`   | Диафрагмальное дыхание            |
| S7   | `hip-hinge-chair.mp4`           | Хип-хиндж у кресла                |
| S8   | `dynamic-hamstring.mp4`         | Динамическая растяжка подколенных |
| S9   | `standing-piriformis.mp4`       | Растяжка грушевидной стоя         |
| S10  | `standing-hip-flexor.mp4`       | Растяжка сгибателей бедра стоя    |
| S11  | `standing-pelvic-tilts.mp4`     | Подъёмы таза у кресла             |
| S12  | `seated-piriformis.mp4`         | Растяжка грушевидной мышцы сидя   |
| S13  | `seated-core-activation.mp4`    | Стабилизация ядра сидя            |

### Глаза (eyes) — 8 атомов

| Code | filename                        | RU название                       |
|------|---------------------------------|-----------------------------------|
| E1   | `near-far-focus.mp4`            | Взгляд близко/далеко              |
| E2   | `palming.mp4`                   | Палминг                           |
| E3   | `conscious-blinking.mp4`        | Моргание по счёту                 |
| E4   | `eye-figure-8.mp4`              | Восьмёрки глазами                 |
| E5   | `eye-circles.mp4`               | Круги глазами                     |
| E6   | `eye-vertical.mp4`              | Вверх-вниз                        |
| E7   | `eye-horizontal.mp4`            | Влево-вправо                      |
| E8   | `eye-squares.mp4`               | Квадраты глазами                  |

**Всего: 64 файла.**

---

## 4. Запуск

### Шаг 1. Положи все файлы в одну папку

Например: `C:\Users\Russell\Desktop\deskcare-videos\`

```
deskcare-videos\
├── neck-lateral-tilt.mp4
├── neck-rotation.mp4
├── chin-nod.mp4
... (всего 64 файла, по слугам выше)
```

### Шаг 2. Получи у Евгения SERVICE_ROLE_KEY

Это **серверный** ключ Supabase (не anon!). Его нельзя коммитить в репо. Я (Евгений) перешлю в Telegram.

### Шаг 3. Сухой прогон (`--dry-run`)

Из корня репо:

```bash
SUPABASE_URL=https://rwgpvmnuuarhcnpgibtm.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... \
npx tsx scripts/upload-exercise-videos.ts "C:\Users\Russell\Desktop\deskcare-videos" --dry-run
```

Что напечатается:
```
Loaded 64 exercises from DB.

Plan: 64 files to upload (64 videos, 0 thumbs).
  → exercise-videos/seated-cat-cow/video.mp4  (3.2 MB)
  → exercise-videos/neck-rotation/video.mp4   (2.8 MB)
  ...
--dry-run set, exiting.
```

Если в плане **меньше 64 файлов** или есть `Skipped: <name> (no exercise with slug "...")` — это опечатка в имени файла. Поправь и запусти `--dry-run` ещё раз. Опечатки скрипт **не загружает**.

### Шаг 4. Реальная загрузка

Убери `--dry-run`:

```bash
SUPABASE_URL=https://rwgpvmnuuarhcnpgibtm.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... \
npx tsx scripts/upload-exercise-videos.ts "C:\Users\Russell\Desktop\deskcare-videos"
```

Что напечатается (per file):
```
  video seated-cat-cow              3.2 MB  … ok
  video neck-rotation               2.8 MB  … ok
  ...
Upload: 64 ok, 0 failed.
Updated 64/64 exercises rows.
```

При обрыве/ошибке скрипт продолжит со следующего файла. **Можно перезапускать сколько угодно раз** — `upsert: true` перезаписывает файлы, так что не дубли.

### Шаг 5. Проверка

Открой Expo Go в симуляторе iPhone (или у меня на тестовом устройстве). Тапни любое упражнение в Library — должно проиграться твоё видео вместо stick-figure placeholder'а.

Также — пинг мне в Telegram, проверю в Supabase:
```sql
select count(*) from exercises where video_url is not null;
-- ожидается: 64
```

---

## 5. Если что-то пошло не так

### `Missing env: SUPABASE_SERVICE_ROLE_KEY`

Не выставил переменную окружения. На Windows PowerShell:
```powershell
$env:SUPABASE_URL = "https://rwgpvmnuuarhcnpgibtm.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbG..."
npx tsx scripts/upload-exercise-videos.ts "C:\path\to\videos"
```

### `FAIL: new row violates row-level security policy`

Залил `SUPABASE_ANON_KEY` вместо `SERVICE_ROLE_KEY`. RLS-политики разрешают upload только service-role — anon read-only. Спроси у меня правильный ключ.

### `Skipped: <name> (no exercise with slug "...")`

Имя файла не матчится ни на один slug. Сверь по таблице §3, переименуй, перезапусти.

### Файл больше 50 MB

Либо сожми (`ffmpeg -i in.mov -c:v libx264 -crf 23 -preset slow -movflags +faststart out.mp4`), либо скажи мне — подниму лимит на конкретный bucket.

### Ничего не отвечает / зависло

Большие файлы по тонкому каналу могут грузиться долго. 64 файла × 3 MB средне = ~200 MB → 3–10 минут на нормальной выделенке. Если кажется что висит — посмотри traffic в Activity Monitor / Task Manager.

---

## 6. Что произойдёт после успешной загрузки

В приложении (без какого-либо релиза) на следующем cold-start экраны Library и Exercise Player начнут проигрывать твои видео:

- `<VideoPlaceholder>` (stick-figure) рендерится только при `video_url === null`. Как только URL заполнится — компонент `<expo-video>` берёт верх автоматически.
- Player воспроизводит атом N раз бесшовно (см. `docs/07-development/ROUTINE-PLAYER.md` §3 «Бесшовный re-loop»).

После твоего отчёта запушу финальный pre-launch билд с реальным контентом — сабмит в App Store.

---

## 7. Опционально — thumbnail'ы

Если ты сделал статичные превью (первый "хороший" кадр каждого видео) — называй их так же по slug, расширение `.jpg` / `.png` / `.webp`, лимит 5 MB:

```
deskcare-videos\
├── neck-lateral-tilt.mp4
├── neck-lateral-tilt.jpg     ← thumbnail для того же атома
├── neck-rotation.mp4
├── neck-rotation.jpg
...
```

Скрипт автоматически загрузит обе пары и заполнит и `video_url`, и `thumbnail_url`.

Без них Library покажет первый кадр самого видео — обычно тоже OK, но статичный JPEG грузится быстрее на медленном интернете.

---

## Контакт

Евгений в Telegram. Если что-то не так — пинг с конкретной ошибкой / именем файла, разберёмся за 10 минут.
