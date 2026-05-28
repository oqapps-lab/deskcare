# Баг-репорт — 28 мая 2026 (код-аудит)

**Дата:** 2026-05-28  
**Метод:** grep-аудит кода по playbook `ui-qa/playbooks/05-code-pattern-bug-hunt.md`  
**Ветка:** main (после pull `d4d001a`)  
**Тестировал:** Claude (code-pattern audit)  
**Фокус:** новые миграции v1.1 + полный проход по app/exercise/player.tsx

---

## Итог

| # | Баг | Файл | Приоритет |
|---|-----|------|-----------|
| D1 | Supabase fetch без `.catch()` — бесконечный spinner при сетевой ошибке | `app/exercise/player.tsx:58–80` | MEDIUM |
| D2 | Непривязанный `setTimeout` для навигации — может отработать после cleanup | `app/exercise/player.tsx:183–190` | MEDIUM |

---

## D1: Supabase fetch без `.catch()` в `useSingleExerciseAsRoutine`

**Где:** `app/exercise/player.tsx`, строки 58–80  
**Что вижу:**

```typescript
supabase
  .from('exercises')
  .select(...)
  .eq('slug', exerciseSlug)
  .maybeSingle()
  .then(({ data }) => {
    if (cancelled || !data) {
      if (!cancelled) setLoading(false);
      return;
    }
    // ...
    setLoading(false);
  });
  // ← нет .catch()
```

Supabase SDK возвращает `{ data, error }` при API-ошибках (404, 403), поэтому `.then()` их поймает — там `data` будет `null`, loading сбросится. НО при настоящих сетевых ошибках (таймаут, offline) промис может rejected, `.then()` не вызовется, `setLoading(false)` не выполнится → пользователь видит вечный spinner на экране плеера упражнения.

**Как должно быть:**

```typescript
.then(({ data }) => { /* ... */ })
.catch(() => setLoading(false));
```

**Приоритет:** MEDIUM  
Воспроизводится в режиме авиаперелёта или при слабом 3G с таймаутом.

---

## D2: Непривязанный `setTimeout` для навигации в конце упражнения

**Где:** `app/exercise/player.tsx`, строки 183–190  
**Что вижу:**

```typescript
setTimeout(
  () =>
    router.replace({
      pathname: '/exercise/complete',
      params: { duration: String(totalDur), moves: String(items.length) },
    } as never),
  400,
);
```

`setTimeout` запускается внутри `setInterval` callback (useEffect с deps `[paused, stepDur, stepIdx, items.length, step, ready]`). Когда на последнем шаге таймер отсчитывает и вызывает `router.replace`, параллельно стартует этот 400ms setTimeout. Если в эти 400ms deps useEffect поменяются (например, `paused` становится `true` через системное прерывание), useEffect запустит cleanup (`clearInterval(id)`), но 400ms setTimeout уже «в воздухе» и не будет остановлен. Результат: навигация сработает, но useEffect успеет запустить новый интервал до перехода → потенциально двойной вызов `router.replace`.

**Как должно быть:**

```typescript
const navTimer = setTimeout(() => router.replace(...), 400);
return () => { clearInterval(id); clearTimeout(navTimer); };
```

**Приоритет:** MEDIUM  
Редкий race condition (нужно прерывание за 400ms до конца упражнения), но воспроизводится при входящем звонке / уходе в фон на последнем шаге.

---

## Что не проверено

- Живое тестирование на симуляторе/устройстве (требует macOS + mobilecli)
- Новые миграции SQL (`20260527_achievements_rpc.sql`, `articles.sql`, `buddies.sql`) — структурная проверка не выполнялась
- Seeds (`20260527_achievements_initial.sql`, `articles_initial.sql`) — не проверялись на корректность данных
