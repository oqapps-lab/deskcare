# Баг-репорт — 28 мая 2026 (code-review)

**Дата:** 2026-05-28  
**Метод:** code-review SKILL — 5 измерений (Security, Performance, Correctness, Maintainability, Testing)  
**Ветка:** main (коммит `0942777` feat(challenges): F14)  
**Тестировал:** Claude (automated code review)  
**Фокус:** F14 — personal 7/14/30-day challenges + i18n drift fix

---

## Итог

| # | Баг | Файл:Строка | Приоритет |
|---|-----|------------|-----------|
| DC3 | TickGrid: done/missed по счётчику, а не по реально залогированным датам | `app/challenges.tsx:38` | MAJOR |
| DC4 | Timezone-баг: `today()` UTC vs. локальный парсинг `startedOn` | `hooks/useChallenge.ts:21,63` | MAJOR |
| DC5 | `load()` не защищён от параллельного монтирования — гонка AsyncStorage | `hooks/useChallenge.ts:17,34` | MINOR |
| DC6 | Нет тестов на `compute()` и `TickGrid` | `hooks/useChallenge.ts` | MINOR |
| DC7 | `useMemo(buildFilters, [])` игнорирует смену языка на лету | `app/library/create-routine.tsx:45` | MINOR |

> DC1, DC2 — см. отдельный отчёт `2026-05-28-claude-код-аудит/report.md`

---

## DC3: TickGrid показывает неверные "done" ячейки

**Где:** `app/challenges.tsx`, строка 38  
**Что вижу:**

```ts
if (i < dayNumber) cells.push({ state: i <= doneCount ? 'done' : 'missed' });
```

Условие `i <= doneCount` сравнивает **номер дня** с **количеством залогированных дней**. Работает только если пользователь логировал дни строго подряд. Если пропустил день 2 и залогировал дни 1, 3, 4 (`doneCount = 3`), ячейки 1–3 покрасятся зелёным, а ячейка 4 — серой. Реальная история не учитывается.

**Как должно быть:**

В снапшот добавить `loggedDayNumbers: Set<number>`, затем использовать его в TickGrid:

```ts
// в compute():
const loggedDayNumbers = new Set(
  inWindow.map((d) => {
    const diff = (new Date(d + 'T00:00:00').getTime() - startD.getTime()) / 86400000;
    return Math.floor(diff) + 1;
  })
);

// TickGrid:
if (i < dayNumber) cells.push({ state: loggedDayNumbers.has(i) ? 'done' : 'missed' });
```

**Приоритет:** MAJOR — пользователю показывается неверная история активности.

---

## DC4: Timezone-баг — `today()` UTC vs. локальный `startedOn`

**Где:** `hooks/useChallenge.ts`, строки 21 и 63  
**Что вижу:**

```ts
const ymd = (d: Date): string => d.toISOString().slice(0, 10); // всегда UTC
const today = (): string => ymd(new Date()); // → UTC-дата

const startD = new Date(c.startedOn + 'T00:00:00'); // парсит как LOCAL midnight
```

В регионах UTC+N с 00:00 до 0N:00 `today()` вернёт вчерашнюю UTC-дату. Например, в UTC+5 в 02:00 локального времени `today()` даёт `2026-05-27`, хотя локально `2026-05-28`. Это ломает `dayNumber`, ячейки "missed/done" и логику завершения челленджа.

**Как должно быть:**

Использовать единый локальный метод для всех дат:

```ts
const ymd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
```

`startD` тогда тоже строить из локальных частей, а не через `'T00:00:00'` суффикс.

**Приоритет:** MAJOR — в ранние утренние часы у всех пользователей вне UTC зоны dayNumber будет неверным.

---

## DC5: Гонка при параллельном монтировании `useChallenge`

**Где:** `hooks/useChallenge.ts`, строки 17 и 34  
**Что вижу:**

Модуль-уровневая `cache` мутируется без синхронизации. Если два экземпляра хука монтируются одновременно, оба видят `cache = null`, оба запускают `AsyncStorage.getItem`. В нынешнем коде (один экран) это безвредно. При появлении второго экрана с `useChallenge` — станет MAJOR.

**Как должно быть:**

Хранить in-flight Promise:

```ts
let loadPromise: Promise<Challenge | null> | null = null;

const load = (): Promise<Challenge | null> => {
  if (loadPromise) return loadPromise;
  loadPromise = AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => { cache = raw ? JSON.parse(raw) : null; return cache; })
    .catch(() => { cache = null; return null; })
    .finally(() => { loadPromise = null; });
  return loadPromise;
};
```

**Приоритет:** MINOR сейчас, MAJOR при расширении.

---

## DC6: Нет тестов на `compute()` и `TickGrid`

**Где:** `hooks/useChallenge.ts`, `app/challenges.tsx`  
**Что вижу:**

`compute()` — чистая функция с нетривиальной датовой арифметикой (`dayNumber`, `endD`, `inWindow`, `finished`, `daysLeft`). `TickGrid` — детерминированное преобразование состояния в ячейки. Обе идеальны для unit-тестов, но тестов нет. Баги DC3 и DC4 были бы пойманы тестами:

```ts
it('marks only logged days as done, not the first N days', () => {
  const c = { startedOn: '2026-05-01', duration: 7, completedDates: ['2026-05-01', '2026-05-03'] };
  // day 2 skipped — should be 'missed', day 3 should be 'done'
});
```

**Приоритет:** MINOR — без тестов регрессии не защищены.

---

## DC7: `useMemo(buildFilters, [])` игнорирует смену языка

**Где:** `app/library/create-routine.tsx`, строка 45  
**Что вижу:**

```ts
const FILTERS = React.useMemo(buildFilters, []);
```

Пустые зависимости — `buildFilters` вызывается один раз при первом рендере. При горячей смене языка фильтры не перестраиваются.

**Как должно быть:**

```ts
const locale = useLocale(); // или из i18n контекста
const FILTERS = React.useMemo(buildFilters, [locale]);
```

Если смена языка без перезапуска не поддерживается — добавить комментарий-допущение.

**Приоритет:** MINOR.
