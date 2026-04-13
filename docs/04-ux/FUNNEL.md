# DeskCare — Funnel (Воронка пользователя)

**Дата:** 13 апреля 2026  
**Основа:** [PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md), [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md), [USER-FLOWS.md](./USER-FLOWS.md)

---

## 1. Полная воронка

```
App Store / Google Play (Impressions)
    ↓ CVR: 25–30%
Install
    ↓ Open rate: 85–90%
First Open
    ↓ Completion: 60% (цель MVP), 75% (цель 6 мес)
Onboarding Complete
    ↓ Paywall shown: 100%
Paywall View
    ↓ Trial start: 15% (цель MVP), 25% (цель 6 мес)
Trial Started (7 дней)
    ↓ Trial-to-paid: 35% (цель MVP), 45% (цель 6 мес)
Paid Subscriber
    ↓ D30 retention: 10% (цель MVP), 15% (цель 6 мес)
Active User (Month 2+)
    ↓ Monthly churn: 8% (цель MVP), 5% (цель 6 мес)
Long-term Subscriber (Month 6+)
```

---

## 2. Детализация по шагам

### Step 1: App Store Impressions → Install

| Метрика | Целевой % | Источник |
|---------|-----------|----------|
| iOS CVR (impressions → install) | 30.8% | [Adjust](https://www.adjust.com/blog/what-is-a-good-conversion-rate/) |
| Google Play CVR | 23.2% | [Adjust](https://www.adjust.com/blog/what-is-a-good-conversion-rate/) |
| Средневзвешенный target | 25–30% | — |

**Что делаем для максимизации:**
- Title: "DeskCare: Desk Stretches" + Subtitle: "Neck, Back & Eye Exercises" — покрывает ключевые запросы
- 8 вертикальных скриншотов с текстовыми оверлеями (первые 3 = 90% решения)
- Видеопревью 15–30 сек (автозапуск без звука, субтитры)
- Фокус на long-tail: "sciatica exercises at desk", "eye exercises for computer"
- Рейтинг 4.5+ звёзд (порог 4.0 = cliff, -15–20% CVR)

**Точки потери:**
- Невнятные скриншоты → не понятно что делает приложение
- Нет видеопревью → -20–40% CVR
- Рейтинг < 4.0 → -15–20% CVR
- Generic title без ключевых слов → низкая видимость

**Re-engagement:**
- ASO-оптимизация ежемесячно (A/B тест скриншотов через PPO / Store Listing Experiments)
- Ответы на все отзывы (особенно 1-2 звезды)

---

### Step 2: Install → First Open

| Метрика | Целевой % | Источник |
|---------|-----------|----------|
| Open rate (install → first open) | 85–90% | Industry average |

**Что делаем:**
- Push-уведомление через 1 час после установки (если не открыл): "Ваша шея ждёт — 2 минуты на первую разминку"
- Небольшой размер приложения (< 100 MB) — быстрая установка

**Точки потери:**
- Забыл про приложение после скачивания
- Установил "на потом" и не вернулся

**Re-engagement:**
- Day 0 push (если не открыл в первый час)
- Day 1 push: "Начните с 2-минутной растяжки для [зоны]"

---

### Step 3: First Open → Onboarding Complete

| Метрика | Целевой % (MVP) | Целевой % (6 мес) | Источник |
|---------|-----------------|-------------------|----------|
| Onboarding completion | 60% | 75% | [Business of Apps](https://www.businessofapps.com/data/app-onboarding-rates/) |

**Что делаем:**
- 7 экранов quiz с персонализацией (+35% completion)
- Прогресс-бар с ускоренным стартом (Goal Gradient Effect)
- Social proof на 3-м шаге ("87% пользователей...")
- Зона боли на 1-м экране (UVP = hook)
- Labor Illusion перед результатом (perceived value)
- Aha-момент: персональный план до paywall
- Возможность пропустить quiz (default-профиль)
- Время прохождения < 60 секунд

**Точки потери (по шагам):**
- Welcome → Quiz Step 1: ~38% drop-off (самый большой)
- Step 1 → Step 2: ~15% drop-off
- Step 2 → Step 3: ~10% drop-off
- Step 3 → Step 4: ~5% drop-off (social proof снижает)
- Step 4 → Labor Illusion: ~2% drop-off

**Re-engagement:**
- Push Day 1 (если бросил quiz): "Осталось 2 вопроса — и ваша программа готова"
- Повторный запуск → продолжение с последнего шага

---

### Step 4: Onboarding Complete → Paywall View

| Метрика | Целевой % | Источник |
|---------|-----------|----------|
| Paywall shown | 100% | По дизайну (обязательный шаг) |

**Что делаем:**
- Paywall показывается всем после онбординга (soft paywall с hard-элементами)
- Aha-момент (персональный план) непосредственно перед paywall
- 89.4% trial starts — День 0, поэтому первый показ критичен

---

### Step 5: Paywall View → Trial Start

| Метрика | Целевой % (MVP) | Целевой % (6 мес) | Источник |
|---------|-----------------|-------------------|----------|
| Trial start rate | 15% | 25% | [Adapty 2025](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/) |

**Что делаем:**
- Визуальный timeline (паттерн Blinkist): +23% trial starts
- Анимированный paywall: 2.9x конверсия vs статичный
- Персонализация (имя + зона боли): +17% конверсия
- Ценовое якорение: месячная цена рядом с годовой
- Social proof: отзывы + рейтинг (+72% install-to-trial)
- Bullet-список преимуществ (не таблица сравнения)
- 7-дневный trial (5-9 дней = 37.4–45% trial-to-paid, оптимально)
- Кнопка "Позже" (не блокируем, soft paywall)

**Точки потери:**
- Не понял ценности → не увидел персональный план
- Ценобоязнь → нет упоминания "бесплатно 7 дней" в первом экране paywall
- Privacy concerns → нет trust signals
- "Попробую бесплатно сначала" → закрывает paywall

**Re-engagement (для тех, кто закрыл paywall):**
- Feature-gate: premium-контент с замком → нажатие → mini-paywall
- Value moment paywall: после 7-дневного стрика → "Хотите больше?"
- Push Day 3: "Вы попробовали 3 упражнения. Pro открывает 50+"
- Повторный paywall: не чаще 1 раза в 3 дня

---

### Step 6: Trial Start → Paid Subscriber

| Метрика | Целевой % (MVP) | Целевой % (6 мес) | Источник |
|---------|-----------------|-------------------|----------|
| Trial-to-paid | 35% | 45% | [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps/) |

**Что делаем:**
- 7-дневная программа "Неделя без боли" — ежедневное вовлечение в trial
- Day 1: Первая рутина для основной зоны боли
- Day 2: Eye break introduction (low friction)
- Day 3: Новая зона тела (multi-zone engagement)
- Day 4: Pain check-in + прогресс ("Боль ↓ на 20%!")
- Day 5: Reminder о конце trial (push + in-app)
- Day 6: "Завтра заканчивается — сохраните доступ"
- Day 7: "Trial закончился. Вернитесь к Pro"

**Точки потери:**
- 55% отмен trial — День 0 (если aha не наступил)
- Забыл пользоваться → не сформировал привычку
- "Бесплатного контента достаточно" → нет perceived premium value

**Re-engagement:**
- Push-серия в течение trial (Day 1, 3, 5, 6, 7)
- In-app баннер "Осталось N дней trial"
- Post-trial: ограничение контента (3 упражнения/зона) + paywall при locked
- Win-back push через 7 дней после окончания trial: "Скучаем! Специальная цена"

---

### Step 7: Paid Subscriber → Active User (Month 2+)

| Метрика | Целевой % (MVP) | Целевой % (6 мес) | Источник |
|---------|-----------------|-------------------|----------|
| D30 retention | 10% | 15% | [Business of Apps](https://www.businessofapps.com/data/health-fitness-app-benchmarks/) |
| Monthly churn (paid) | 8% | 5% | [RevenueCat 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |
| First-renewal retention | 35% | 45% | [Adapty 2026](https://adapty.io/state-of-in-app-subscriptions-report/) |

**Что делаем:**
- Streak system с Streak Freeze (1 бесплатный/неделю): -21% churn
- Smart push 2–3 раза/неделю (behavior-based): 3–8x retention
- Multi-zone engagement (шея + спина + глаза): -60% churn
- Pain tracking = видимый прогресс ("Шея на 30% лучше за месяц")
- Weekly summary (воскресенье): мотивация + шеринг
- Новый контент (регулярно): предотвращение скуки
- Eye Break как ежедневный low-friction якорь

**Точки потери:**
- Скука (одни и те же упражнения)
- Прекращение боли → "Мне уже не нужно" (success = churn)
- Конкурент с лучшим контентом
- Техническая проблема (crash, баг) без быстрого фикса

**Re-engagement:**
- At-risk detection: если пропустил 3+ дня → push "С возвращением! Начнём с 2 мин?"
- Win-back email через 14 дней после churn: специальная цена
- Контент-обновления → push "Новые упражнения для шеи!"

---

## 3. Сводная воронка с цифрами (на 10,000 установок)

| Шаг | Пользователей | Конверсия | Cumulative |
|-----|--------------|-----------|------------|
| Install | 10,000 | — | 100% |
| First Open | 8,750 | 87.5% | 87.5% |
| Onboarding Complete | 5,250 | 60% | 52.5% |
| Paywall View | 5,250 | 100% | 52.5% |
| Trial Start | 788 | 15% | 7.9% |
| Paid (after trial) | 276 | 35% | 2.8% |
| Active Month 2 | 221 | 80% | 2.2% |
| Active Month 6 | 142 | 64% | 1.4% |

**Install-to-Paid (D35): ~2.8%** → выше Freemium медианы (2.18%), на уровне H&F median (6.7% для top performers с более агрессивными paywall).

---

## 4. Retention Loop (Цикл возврата)

### Ежедневный Hook Model

```
┌─────────────────────────────────────────────┐
│                                             │
│   1. TRIGGER (Триггер)                      │
│   ├── External: Push-уведомление            │
│   │   "Растяжка шеи — 3 мин.               │
│   │    Стрик: 5 дней 🔥"                    │
│   ├── External: Eye Break reminder          │
│   │   (каждые 20 мин)                       │
│   └── Internal: Боль в шее / глазах         │
│       (привычка: боль → открыть DeskCare)   │
│                                             │
│                    ↓                         │
│                                             │
│   2. ACTION (Действие)                      │
│   ├── Нажать push → Routine Preview         │
│   │   → 1 кнопка "Начать"                  │
│   ├── Открыть приложение → Home             │
│   │   → Нажать зону на Body Map             │
│   └── Eye Break → 30 сек (минимальный       │
│       барьер)                               │
│                                             │
│                    ↓                         │
│                                             │
│   3. REWARD (Награда)                       │
│   ├── Физическая: облегчение боли           │
│   │   (немедленный результат)               │
│   ├── Социальная: "Отлично! Шея скажет      │
│   │   спасибо" (позитивный feedback)        │
│   ├── Прогресс: 🔥 Стрик +1                │
│   ├── Данные: Pain ↓ 29% за месяц           │
│   │   (визуальный прогресс)                 │
│   └── Milestone: бейдж "7-Day Warrior"      │
│       (переменная награда)                  │
│                                             │
│                    ↓                         │
│                                             │
│   4. INVESTMENT (Инвестиция)                │
│   ├── Стрик (loss aversion:                 │
│   │   "не хочу потерять 14 дней")           │
│   ├── Pain data (персональная история,      │
│   │   "мой график боли")                    │
│   ├── Персонализация (система знает         │
│   │   мои зоны, предпочтения)              │
│   ├── Бейджи (коллекция)                    │
│   └── Routine preferences                   │
│       (избранные, привычные)                │
│                                             │
│                    ↓ (усиливает trigger)     │
│                                             │
│   Повтор цикла (каждый день)                │
│                                             │
└─────────────────────────────────────────────┘
```

### Retention-механики по периодам

| Период | Механика | Метрика | Target |
|--------|----------|---------|--------|
| D0 | Первая сессия сразу после онбординга | Session completion | >80% |
| D1–D3 | Push-серия "Неделя без боли" + streak start | D1 retention | 35% |
| D3–D7 | Multi-zone engagement + streak 3-day badge | D7 retention | 20% |
| D7–D14 | 7-day badge + pain trend "↓ 20%" | D14 retention | 15% |
| D14–D30 | 14-day badge + weekly summary + new content | D30 retention | 10% |
| D30+ | Streak freeze + monthly progress + content updates | Monthly churn | <8% |

### Триггеры по времени суток

| Время | Триггер | Контент |
|-------|---------|---------|
| 09:00 (утро) | Push | "Утренняя разминка шеи — начните день без боли" |
| ~13:00 (обед) | Push | "Обеденная растяжка — 3 мин для спины" |
| Каждые 20 мин | Silent push / in-app | Eye Break (30 сек) |
| ~18:00 (вечер) | Push (если нет сессии) | "Ещё есть время сохранить стрик — 2 мин" |
| Воскресенье | Push | "Ваш итог недели готов! 📊" |

---

## 5. Monetization Funnel (дополнительная)

### Точки показа paywall

| Момент | Тип paywall | Ожидаемая конверсия | Обоснование |
|--------|-------------|--------------------|-|
| После онбординга (Day 0) | Полный (timeline) | 15% trial start | 89.4% trial starts — Day 0 |
| Feature-gate (locked content) | Mini-paywall | 3–5% | Контекстное предложение при высоком intent |
| После 7-дневного стрика | Контекстный | 5–8% | Value moment — пользователь доказал вовлечённость |
| После trial expiry | Полный (win-back) | 10–15% | Пользователь испытал premium и потерял доступ |
| Settings → Подписка | Информационный | 2–3% | Self-serve для тех, кто "созрел" |

### Revenue projection (на 10,000 установок/месяц)

| Метрика | Значение |
|---------|----------|
| Install-to-paid | 2.8% (276 пользователей) |
| Annual plan share | 55% (152 annual, 124 monthly) |
| Monthly revenue | 152 × $2.49 + 124 × $4.99 = $378 + $619 = **$997/мес** |
| Projected MRR at 10K install/month (compounding) | ~$3K–$5K к месяцу 3 |

---

## Источники

- [PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md) — KPI targets, бенчмарки
- [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) — Success Metrics, Roadmap
- [ONBOARDING-RESEARCH.md](../03-practices/ONBOARDING-RESEARCH.md) — drop-off по шагам, конверсии
- [PAYWALL-RESEARCH.md](../03-practices/PAYWALL-RESEARCH.md) — типы paywall, trial конверсии
- [RETENTION-RESEARCH.md](../03-practices/RETENTION-RESEARCH.md) — retention механики
- [USER-FLOWS.md](./USER-FLOWS.md) — пользовательские сценарии
