# Баг-репорт — 28 мая 2026 (back-nav-audit)

**Дата:** 2026-05-28  
**Метод:** ui-qa playbook `back-navigation-traps.md` — grep + статический анализ  
**Ветка:** main  
**Тестировал:** Claude (automated audit)

---

## Итог

| # | Баг | Файл:Строка | Приоритет |
|---|-----|------------|-----------|
| BN4 | `router.back()` без `canGoBack()` на экране challenges | `app/challenges.tsx:226` | MAJOR |

---

## BN4: `router.back()` без guard на экране F14 Challenges

**Где:** `app/challenges.tsx`, строка 226  
**Что вижу:**

```ts
<NavHeader title={t('ch_nav_title')} onBack={() => router.back()} />
```

`challenges.tsx` достижим через push из `main/home`, но также может открываться через deep-link (push-уведомление о напоминании челленджа). При deep-link входе стек пуст, `router.back()` — silent no-op, кнопка назад не работает.

Все аналогичные экраны в проекте (`library/[exerciseId]`, `exercise/preview`, etc.) корректно используют guard:
```ts
if (router.canGoBack()) router.back();
else router.replace('/main/home');
```

**Как должно быть:**

```ts
<NavHeader
  title={t('ch_nav_title')}
  onBack={() => {
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  }}
/>
```

**Приоритет:** MAJOR — пользователь, открывший челлендж через уведомление, не может выйти с экрана.
