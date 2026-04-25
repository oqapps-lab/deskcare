# DeskCare — Routine Player (React Native)

**Дата:** 2026-04-25
**Назначение:** Спецификация компонента-плеера, который проигрывает рутину как последовательность атомов с заданным числом повторов.
**Связано с:** `EXERCISES-LIBRARY-SUPABASE.md`, `ROUTINES-CATALOG.md`, `DATABASE-SCHEMA.md`.

---

## 1. Что такое атом и зачем повторы

**Атом** — короткое (4–21 сек) бесшовно зацикленное видео из таблицы `exercises`. Финальный кадр атома идентичен стартовому, поэтому несколько проигрышей подряд выглядят как непрерывное упражнение.

**Повтор** (`routine_exercises.reps`) — сколько раз подряд проигрывать атом. Конкретная пользовательская длительность одного item-а в плеере:

```
itemDuration = exercises.duration_seconds * routine_exercises.reps
```

Пример: атом `N1` (Наклоны головы, 6 сек, внутри 1 наклон вправо + 1 влево) с `reps=4` → 24 секунды непрерывного видео и 4 цикла наклонов.

---

## 2. Контракт данных

Плеер получает на вход результат запроса (один JOIN):

```typescript
type RoutineItem = {
  sortOrder: number;
  reps: number;
  overlayText: string | null;
  restSeconds: number;
  exercise: {
    id: string;
    code: string;        // 'N1'
    title: string;       // 'Наклоны головы в стороны'
    description: string; // короткое UI-описание
    videoUrl: string;    // public URL из exercise-videos
    durationSeconds: number; // длина атома, 6
    cautions: string | null; // напр. "Прекратите при онемении"
  };
};

type RoutinePlaylist = {
  routineId: string;
  routineSlug: string;
  title: string;
  totalDurationSeconds: number; // Σ duration_seconds * reps + rest_seconds
  items: RoutineItem[];
};
```

**SQL для загрузки:**

```sql
SELECT
  re.sort_order, re.reps, re.overlay_text, re.rest_seconds,
  json_build_object(
    'id', e.id, 'code', e.code, 'title', e.title,
    'description', e.description, 'videoUrl', e.video_url,
    'durationSeconds', e.duration_seconds, 'cautions', e.cautions
  ) AS exercise
FROM routine_exercises re
JOIN exercises e ON e.id = re.exercise_id
WHERE re.routine_id = $1
ORDER BY re.sort_order;
```

---

## 3. Жизненный цикл плеера

```
[Routine selected] → загрузка playlist
       ↓
[Pre-roll] показ poster + countdown 3-2-1 (опционально)
       ↓
[Item N] для каждого item:
   ├── Показать overlay_text + название упражнения
   ├── Запустить видео атома
   ├── Слушать onEnd → инкремент currentLoop
   ├── Если currentLoop < reps → setPosition(0), play() (бесшовный re-loop)
   ├── Если currentLoop == reps → wait rest_seconds → переход
   └── На любом этапе доступна кнопка [Skip → следующий item]
       ↓
[Post-roll] финальный экран: «Молодец! Ты сделал X минут растяжки»
       ↓
[Запись session] insert в sessions / session_exercises
```

**Важно:** видео должно стартовать с `position=0` каждый раз — иначе теряется бесшовность. Большинство плееров (`expo-av`, `expo-video`) корректно делают `replay()` с пер-loop колбэком.

---

## 4. Псевдокод компонента

```typescript
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';

export function RoutinePlayer({ playlist, onComplete }: Props) {
  const [itemIdx, setItemIdx] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const item = playlist.items[itemIdx];
  const totalLoops = item.reps;

  const player = useVideoPlayer(item.exercise.videoUrl, (p) => {
    p.loop = false;       // мы сами управляем повторами
    p.play();
  });

  // Слушаем конец каждого проигрыша
  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      const next = loopCount + 1;
      if (next < totalLoops) {
        setLoopCount(next);
        player.currentTime = 0;
        player.play();          // бесшовный re-loop
      } else {
        advanceToNextItem();    // включает rest_seconds паузу
      }
    });
    return () => sub.remove();
  }, [loopCount, totalLoops, player]);

  function advanceToNextItem() {
    if (item.restSeconds > 0) {
      setTimeout(() => moveNext(), item.restSeconds * 1000);
    } else {
      moveNext();
    }
  }

  function moveNext() {
    if (itemIdx + 1 >= playlist.items.length) {
      onComplete();
    } else {
      setItemIdx(itemIdx + 1);
      setLoopCount(0);
    }
  }

  return (
    <View>
      <VideoView player={player} style={styles.video} contentFit="cover" />
      <Overlay
        title={item.exercise.title}
        cue={item.overlayText}
        progressSec={loopCount * item.exercise.durationSeconds}
        totalSec={totalLoops * item.exercise.durationSeconds}
      />
      <ProgressBar
        elapsed={computeElapsed(playlist, itemIdx, loopCount, player.currentTime)}
        total={playlist.totalDurationSeconds}
      />
      <Controls onSkip={moveNext} onPause={() => player.pause()} />
    </View>
  );
}
```

**Стек:**
- Видео-плеер: `expo-video` (SDK 55+, заменяет deprecated `expo-av`).
- Анимации overlay: `react-native-reanimated`.
- Хептика на старте/смене item-а: `expo-haptics`.

---

## 5. Бесшовный re-loop без визуального скачка

`expo-video` поддерживает встроенный `loop=true`, но он не даёт нам callback на каждый цикл — а нам нужно знать `loopCount`, чтобы остановиться после `reps` повторов. Решения (по предпочтительности):

1. **Самый чистый:** `loop=false`, слушаем событие `playToEnd`, программно делаем `currentTime = 0; play()`. Современные плееры ставят следующий кадр практически без задержки (≤ 30 ms), что незаметно при бесшовно-склеенных атомах.
2. **Двухплеерная схема:** держать второй экземпляр `useVideoPlayer` с тем же URL и preload. На переходе свопаем рендер. Сложнее, но 0 ms задержка.
3. **Ручная склейка через AVPlayer queue / ExoPlayer Concatenating MediaSource** — нативный модуль, для MVP избыточно.

**Для MVP — вариант 1.** Если QA увидит скачок, перейти на вариант 2.

---

## 6. Расчёт прогресса

Прогресс-бар сверху показывает время в рамках всей рутины:

```typescript
function computeElapsed(playlist, itemIdx, loopCount, currentTimeSec) {
  let elapsed = 0;
  for (let i = 0; i < itemIdx; i++) {
    const it = playlist.items[i];
    elapsed += it.exercise.durationSeconds * it.reps + it.restSeconds;
  }
  const item = playlist.items[itemIdx];
  elapsed += loopCount * item.exercise.durationSeconds + currentTimeSec;
  return elapsed;
}
```

Этого достаточно для линейного прогресс-бара. На будущее — добавить тики на стыках item-ов (визуальные сегменты).

---

## 7. Overlay (подсказки)

Над видео отображается:

| Элемент | Источник | Когда |
|---------|----------|-------|
| **Название упражнения** | `exercise.title` | На время первого loop-а item-а (первые 3 сек) |
| **Подсказка-cue** | `routine_exercises.overlay_text` | На все loop-ы item-а |
| **Счётчик повторов** | `loopCount + 1 / reps` | Маленький badge внизу |
| **Прогресс-бар** | `computeElapsed / totalDuration` | Постоянно |
| **Cautions** | `exercise.cautions` (если не null) | Pre-roll item-а с задержкой 2 сек, до старта видео |

Для длинных атомов (≥ 15 сек) overlay блёкнет через 5 сек, чтобы не отвлекать от движения.

---

## 8. Smart Reminders — упрощённый плеер

Push-уведомление открывает мини-оверлей (модалка), не полный экран:

- 60-секундная рутина (R1, R4, R7, R10, R18) — 3–5 атомов.
- Без pre-roll countdown — сразу старт.
- Кнопка [Закрыть] всегда видима.
- На завершении — короткий тост «Спасибо!», без записи session_exercises детально (только `sessions.session_type='quick_relief'`).

---

## 9. Запись session по факту проигрывания

При `onComplete` пишем:

```typescript
await supabase.from('sessions').insert({
  session_type: 'routine',
  routine_id: playlist.routineId,
  body_zone_id: playlist.bodyZoneId,
  duration_seconds: actualElapsedSeconds,
  exercises_total: playlist.items.length,
  exercises_completed: completedCount,
  exercises_skipped: skippedCount,
  started_at: startedAt,
  completed_at: new Date().toISOString(),
});

// Детализация
await supabase.from('session_exercises').insert(
  playlist.items.map((it, i) => ({
    session_id, exercise_id: it.exercise.id, sort_order: i,
    was_skipped: skippedItems.has(i),
    was_repeated: false,
  }))
);
```

Стрик инкрементится через `streaks.last_activity_date` (RPC `incrementStreak()`).

---

## 10. Кэширование видео для оффлайн

Атомы маленькие (≤ 21 сек, обычно 0.5–2 МБ). На MVP:

1. При первом проигрывании — `expo-file-system` сохраняет файл в кэш.
2. Дальше плеер сначала пробует `localUri`, потом `videoUrl`.
3. Размер кэша 64 атомов ≈ 80–120 МБ — приемлемо.

```typescript
const localUri = await ensureCached(item.exercise.videoUrl);
useVideoPlayer(localUri ?? item.exercise.videoUrl, ...);
```

---

## 11. Тест-чеклист

- [ ] Атом с `reps=1` проигрывается ровно один раз и переходит к следующему.
- [ ] Атом с `reps=4` повторяется 4 раза без визуального скачка между циклами.
- [ ] Skip переходит к следующему item-у на любом loop-е.
- [ ] Pause останавливает таймер и видео; resume продолжает с того же места и того же loopCount.
- [ ] Прогресс-бар по всей рутине растёт линейно.
- [ ] Overlay cue (`overlay_text`) показывается во время всех loop-ов.
- [ ] Cautions (W8 — Median Nerve Glide) показывается перед стартом item-а.
- [ ] Завершение пишет `sessions` + `session_exercises` корректно.
- [ ] Premium-рутина (R14–R17) блокируется без активной подписки.
- [ ] Smart Reminder открывает мини-оверлей с R1/R4/R7/R10/R18.

---

# Источники

- `deskcare/docs/05-database/EXERCISES-LIBRARY-SUPABASE.md` — каталог атомов (длительности).
- `deskcare/docs/05-database/ROUTINES-CATALOG.md` — концертный список рутин.
- `deskcare/docs/05-database/DATABASE-SCHEMA.md` — таблицы `exercises`, `routines`, `routine_exercises`, `sessions`, `session_exercises`.
- `deskcare/docs/02-product/FEATURES.md` — F3 Video Player, F5 Smart Reminders.
- [expo-video documentation](https://docs.expo.dev/versions/latest/sdk/video/)
