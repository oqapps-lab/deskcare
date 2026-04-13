---
title: "Исследование: Онбординг мобильных приложений"
date: 2026-04-13
app: DeskCare
category: Health & Fitness
stage: Research
---

# Онбординг мобильных приложений: бенчмарки, практики, рекомендации

## Содержание
1. [Бенчмарки и метрики](#1-бенчмарки-и-метрики)
2. [Что конвертирует](#2-что-конвертирует)
3. [Лучшие примеры онбординга](#3-лучшие-примеры-онбординга)
4. [Антипаттерны](#4-антипаттерны)
5. [Рекомендации для DeskCare](#5-рекомендации-для-deskcare)

---

## 1. Бенчмарки и метрики

### 1.1. Конверсия после онбординга по категориям

| Метрика | Health & Fitness | Все категории | Источник |
|---|---|---|---|
| Установка → платящий подписчик (медиана) | 9.4% | — | [CleverTap](https://clevertap.com/blog/increase-app-conversion-rate/) |
| Установка → платящий (P90, топ-перформеры) | 12.1% | — | [RevenueCat SOSA 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |
| Trial → Paid (медиана) | 39.9% | 37.3% (2024) | [RevenueCat SOSA 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |
| Trial → Paid (P90, топ-перформеры) | 68.3% | — | [RevenueCat SOSA 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |
| Hard paywall → конверсия | — | 10.7% | [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| Freemium → конверсия | — | 2.1% | [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| App Store конверсия (iOS) | 30.8% | — | [Adjust](https://www.adjust.com/blog/what-is-a-good-conversion-rate/) |
| Google Play конверсия | 23.2% | — | [Adjust](https://www.adjust.com/blog/what-is-a-good-conversion-rate/) |

**Ключевые выводы:**

- 89.4% стартов триала происходят в **День 0** — первая сессия является решающей ([Adapty 2025](https://adapty.io/blog/state-of-in-app-subscriptions-2025-in-10-minutes/))
- 80%+ in-app покупок совершается на **первом экране пейволла** ([Adapty 2025](https://adapty.io/blog/state-of-in-app-subscriptions-2025-in-10-minutes/))
- Топ-25% приложений растут на 80% год к году, нижние 25% — падают на 33% ([RevenueCat SOSA 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/))

### 1.2. Оптимальное количество шагов

Единого "магического числа" не существует, но данные указывают на следующее:

| Факт | Данные | Источник |
|---|---|---|
| Каждый дополнительный шаг стоит ~20% пользователей | Данные DrawChat iOS | [Gabor Cselle, Medium](https://medium.com/gabor/every-step-costs-you-20-of-users-b613a804c329) |
| 72% пользователей бросают, если слишком много шагов | Опрос пользователей | [UserGuiding](https://userguiding.com/blog/user-onboarding-statistics) |
| 72% хотят онбординг < 60 секунд | Clutch Research | [Clutch / Appcues](https://www.appcues.com/blog/mobile-permission-priming) |
| Глобальный rate прохождения онбординга через 30 дней — 8.4% | Q2 2025 | [Business of Apps](https://www.businessofapps.com/data/app-onboarding-rates/) |

**Но**: длинный онбординг работает, если он персонализирован. Flo использует ~70 экранов и показывает высокую конверсию ([Retention Blog](https://www.retention.blog/p/flo-is-an-amazing-success-story)), Noom — 80+ экранов ([Retention Blog](https://www.retention.blog/p/the-longest-onboarding-ever)).

**Вывод для DeskCare**: Для health & fitness приложения с подпиской оптимально **5-8 экранов** контентного онбординга (без учета пейволла и системных запросов). Каждый экран должен либо собирать данные для персонализации, либо показывать ценность.

### 1.3. Drop-off по шагам воронки

| Переход | Средний drop-off | Источник |
|---|---|---|
| Экран 1 → Экран 2 | ~38% | [Amra and Elma](https://www.amraandelma.com/funnel-drop-off-rate-statistics/) |
| Экран 2 → Экран 3 | ~29% | [Amra and Elma](https://www.amraandelma.com/funnel-drop-off-rate-statistics/) |
| Экран 3 → Экран 4 | ~27% | [Amra and Elma](https://www.amraandelma.com/funnel-drop-off-rate-statistics/) |
| 55% отмен 3-дневного триала | День 0 | [RevenueCat SOSA 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/) |

**Критически важно**: Первый экран теряет больше всего пользователей. Если первый экран не захватывает внимание — конверсия всей воронки падает драматически.

### 1.4. Retention по категории Health & Fitness

| Метрика | Значение | Источник |
|---|---|---|
| Day 1 retention | ~26% | [Business of Apps](https://www.businessofapps.com/data/health-fitness-app-benchmarks/) |
| Day 30 retention (медиана) | 3.7% | [UXCam](https://uxcam.com/blog/mobile-app-retention-benchmarks/) |
| Day 30 retention (топ-перформеры) | 8-12% | [Setgreet](https://www.setgreet.com/blog/what-the-numbers-actually-say-about-mobile-app-onboarding-(and-what-to-track)) |
| Средний 30-дневный retention (топ) | до 47.5% | [Enable3](https://enable3.io/blog/app-retention-benchmarks-2025) |

Приложения с онбординг-кампаниями показывают **20% next-day return** vs 16% без онбординга ([OneSignal](https://onesignal.com/mobile-app-benchmarks-2024)).

---

## 2. Что конвертирует

### 2.1. Персонализация (сбор данных о пользователе)

Персонализация — самый мощный инструмент конверсии в онбординге:

| Факт | Данные | Источник |
|---|---|---|
| Персонализированный онбординг повышает completion rate | +35% | [UserGuiding](https://userguiding.com/blog/user-onboarding-statistics) |
| Эксперименты показывают рост конверсии до | +200% | [Medium / Ridhi Singh](https://medium.com/@ridhisingh/how-we-improved-our-onboarding-funnel-increased-conversions-by-200-9a106b238247) |
| Просьба указать имя дает uplift в активации | +13% | [Setgreet](https://www.setgreet.com/blog/what-the-numbers-actually-say-about-mobile-app-onboarding-(and-what-to-track)) |
| Только 18% онбордингов используют персонализацию | При этом 65% собирают данные | [Chameleon Benchmark 2025](https://www.chameleon.io/benchmark-report) |
| Приложения с онбординг-сообщениями — выше конверсия install-to-purchase | +24% | [OneSignal](https://onesignal.com/mobile-app-benchmarks-2024) |

**Как это работает на практике:**

- **Noom**: Задает 80+ вопросов с динамическим ветвлением. Каждый ответ меняет следующий вопрос. Между вопросами — статистика и истории успеха ([Retention Blog](https://www.retention.blog/p/the-longest-onboarding-ever))
- **Flo**: ~70 экранов опросника. Вопросы чередуются с объяснениями ценности. В конце — "Labor Illusion" (искусственная задержка создания "персонального плана") ([Medium / Angele Lenglemetz](https://medium.com/design-bootcamp/how-flo-and-zoe-use-a-web-to-app-to-boost-their-conversion-6f424171b1b7))
- **BetterMe**: 26 вопросов перед пейволлом. Пользователь чувствует, что приложение его "понимает" ([ScreensDesign](https://screensdesign.com/showcase/betterme-health-coaching))

**Labor Illusion** — когнитивный прием, когда после сбора данных показывается экран "загрузки" с текстом "Создаем ваш персональный план..." Пользователи доверяют и ценят результат больше, если видят процесс "работы" ([AppAgent](https://appagent.com/blog/mobile-app-onboarding/)).

### 2.2. Прогресс-бары

| Факт | Данные | Источник |
|---|---|---|
| Прогресс-бары + геймификация повышают completion rate | +50% | [UserGuiding](https://userguiding.com/blog/user-onboarding-statistics) |
| LinkedIn: прогресс-бар профиля повысил конверсию | +55% | [InAppStory](https://inappstory.com/blog/10-gamification-onboarding-techniques) |

**Психологические механизмы:**

- **Endowed Progress Effect** — если пользователь видит начальный прогресс (даже минимальный), он склонен завершить задачу ([UserPilot](https://userpilot.com/blog/progress-bar-psychology/))
- **Goal Gradient Effect** — чем ближе к цели, тем выше мотивация завершить ([UserPilot](https://userpilot.com/blog/progress-bar-psychology/))

**Важное предупреждение**: Плохо спроектированный прогресс-бар может снизить completion. Если пользователь видит медленный прогресс на первых шагах (ожидает быстро, а получает медленно) — прогресс-бар работает против вас. Оптимально: быстрый прогресс в начале, замедление к концу ([Irrational Labs](https://irrationallabs.com/blog/knowledge-cuts-both-ways-when-progress-bars-backfire/)).

### 2.3. Социальное доказательство (Social Proof)

| Приложение | Как используют | Источник |
|---|---|---|
| **Calm** | Статистика и отзывы в середине онбординга для мотивации пройти длинный флоу | [GoodUX / Appcues](https://goodux.appcues.com/blog/calm-app-new-user-experience) |
| **Craft** | Отзывы пользователей с акцентом на дизайн и функциональность сразу в онбординге | [Plotline](https://www.plotline.so/blog/mobile-app-onboarding-examples/) |
| **Noom** | Истории успеха и статистика между вопросами | [Retention Blog](https://www.retention.blog/p/the-longest-onboarding-ever) |

Social proof особенно эффективен:
- В середине длинных онбордингов (когда мотивация падает)
- Перед пейволлом (для снижения сопротивления)
- Как "передышка" между вопросами

### 2.4. "Aha-момент" до пейволла

**"Aha-момент"** — точка, где ценность продукта становится кристально ясной ([RevenueCat](https://www.revenuecat.com/blog/growth/paywall-placement/)).

| Факт | Данные | Источник |
|---|---|---|
| Если aha-момент не наступает в первые 60 минут — подписчик уже потерян | Данные 2026 | [RevenueCat SOSA 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/) |
| 55% отмен 3-дневного триала — День 0 | Пользователи оценивают за 1 сессию | [RevenueCat SOSA 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/) |
| Mojo: онбординг-пейволл дает >50% стартов триала | Данные Phiture | [Phiture](https://phiture.com/mobilegrowthstack/the-subscription-stack-conversion-rate-optimization/) |

**Лучший пример**: **PhotoRoom** — во время онбординга пользователь загружает фото и видит, как ИИ удаляет фон. Ценность мгновенно очевидна. Сразу после — пейволл. Конверсия значительно выше среднего ([RevenueCat](https://www.revenuecat.com/blog/growth/paywall-placement/)).

**Контекстуальные пейволлы** работают лучше общих "Subscribe now":
- "Разблокируйте неограниченный доступ"
- "Улучшите план для отслеживания больше привычек"
- Показ пейволла в момент пиковой мотивации ([Apphud](https://apphud.com/blog/design-high-converting-subscription-app-paywalls))

### 2.5. Геймификация и микро-вознаграждения

| Факт | Данные | Источник |
|---|---|---|
| Геймифицированные приложения: рост completion задач | +135% | [StriveCloud](https://www.strivecloud.io/blog/gamification-examples-onboarding) |
| Геймифицированные микро-инцентивы vs статические туториалы | +62% engagement | [InAppStory](https://inappstory.com/blog/10-gamification-onboarding-techniques) |
| 70% компаний из Global 2000 используют геймификацию | 2025 | [StriveCloud](https://www.strivecloud.io/blog/mobile-app-gamification-fintech) |
| Shine (финтех): удерживает 80% конверсию через геймификацию | При среднем 10% drop-off | [StriveCloud](https://www.strivecloud.io/blog/mobile-app-gamification-fintech) |
| Duolingo streak wager: рост retention на Day 14 | +14% | [StriveCloud](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo) |

**Duolingo — эталон**: Перед регистрацией пользователь проходит мини-урок, зарабатывает "gems" и чувствует прогресс. Отложенная регистрация (после первого урока) конвертирует лучше, чем регистрация вначале ([Appcues / GoodUX](https://goodux.appcues.com/blog/duolingo-user-onboarding)).

---

## 3. Лучшие примеры онбординга

### 3.1. Сводная таблица

| Приложение | Категория | Кол-во экранов | Что делает хорошо | Источник |
|---|---|---|---|---|
| **Noom** | Health (Weight Loss) | 80+ | Глубокая персонализация с динамическим ветвлением; поведенческий профиль; social proof между вопросами; "Barnum effect" для вовлечения | [Retention Blog](https://www.retention.blog/p/the-longest-onboarding-ever) |
| **Flo** | Health (Women) | ~70 (до 400) | Длинный квиз, повышающий commitment; Labor Illusion; чередование вопросов с объяснениями ценности | [Retention Blog](https://www.retention.blog/p/flo-is-an-amazing-success-story) |
| **Calm** | Wellness / Meditation | 8-10 | Social proof в середине длинного флоу; персонализация по целям; immersive дизайн с природными звуками | [GoodUX / Appcues](https://goodux.appcues.com/blog/calm-app-new-user-experience) |
| **Headspace** | Wellness / Meditation | 6-8 | Клинический подход: статистика, исследования; персонализация по уровню опыта; мягкий запрос нотификаций в конце | [Appcues / GoodUX](https://goodux.appcues.com/blog/headspaces-mindful-onboarding-sequence) |
| **Duolingo** | Education | 3-5 (до регистрации) | Мгновенный aha-момент (мини-урок до регистрации); геймификация с первой минуты; отложенная регистрация | [Appcues / GoodUX](https://goodux.appcues.com/blog/duolingo-user-onboarding) |
| **BetterMe** | Health & Fitness | ~26 вопросов | Длинный квиз создающий ощущение "app меня понимает"; цена показана понедельно для снижения восприятия | [ScreensDesign](https://screensdesign.com/showcase/betterme-health-coaching) |
| **PhotoRoom** | Photo / AI Tools | 3-4 | Мгновенный aha-момент: пользователь видит результат ИИ прямо в онбординге; пейволл сразу после aha | [RevenueCat](https://www.revenuecat.com/blog/growth/paywall-placement/) |

### 3.2. Детальный разбор релевантных примеров

#### Calm (конкурент в wellness)
- **Старт**: Выбор цели (медитация, сон, стресс)
- **Середина**: Social proof (кол-во пользователей, рейтинги)
- **Персонализация**: Уровень опыта с медитацией
- **Пейволл**: 7-дневный триал за $69.99/год, показан после демонстрации контента
- **Заключение**: Персонализированная домашняя страница с рекомендациями
- Источник: [Calm Onboarding / AppFuel](https://www.theappfuel.com/examples/calm_onboarding)

#### Headspace (конкурент в wellness)
- **Подход**: Клинический, evidence-based
- **Старт**: Вопрос об опыте медитации
- **Персонализация**: Выбор длительности сессии + цель
- **Нотификации**: Запрашиваются в конце, с объяснением пользы; есть кнопка "Not Now"
- **Сильная сторона**: Объясняет, что медитация — это и что нет, снимая барьеры новичков
- Источник: [Headspace / GoodUX](https://goodux.appcues.com/blog/headspaces-mindful-onboarding-sequence)

#### Noom (персонализация как конверсия)
- **80+ экранов** с динамическим ветвлением
- Первый вопрос: "Сколько хотите сбросить?" — сразу фокус на результате
- Между вопросами: статистика и истории успеха
- **Поведенческий профиль** ("ваш тип диеты") через Barnum Effect
- Результат: пользователь чувствует, что приложение его глубоко понимает
- Источник: [Justinmind UX Case Study](https://www.justinmind.com/blog/ux-case-study-of-noom-app-gamification-progressive-disclosure-nudges/)

### 3.3. Конкуренты DeskCare в нише desk exercises

| Приложение | Описание | Аудитория |
|---|---|---|
| **Wakeout** | 2000+ упражнений за столом; Apple App of the Year | Офисные работники |
| **StretchMinder** | Напоминания + видео-гиды по зонам тела (шея, спина, запястья) | Профессионалы (Netflix, Google) |
| **StretchClock** | 100+ видео-упражнений, 1M+ пользователей | Офисные работники |

Источники: [Wakeout](https://wakeout.app/), [StretchMinder](https://www.stretchminder.app/), [StretchClock](https://www.stretchclock.com/)

---

## 4. Антипаттерны

### 4.1. Что НЕ работает (с данными)

| Антипаттерн | Данные | Источник |
|---|---|---|
| **Требование регистрации до показа ценности** | Увеличивает abandonment на 56% | [LowCode Agency](https://www.lowcode.agency/blog/mobile-onboarding-best-practices) |
| **Перегрузка информацией** | 8 из 10 бросают из-за непонимания, как пользоваться | [Webisoft](https://webisoft.com/articles/mobile-onboarding-best-practices/) |
| **Слишком много шагов без ценности** | 72% бросают при длинном онбординге | [UserGuiding](https://userguiding.com/blog/user-onboarding-statistics) |
| **Ранний запрос разрешений** | Отложенные запросы дают +28% к grant rate | [DogTownMedia](https://www.dogtownmedia.com/the-ask-when-and-how-to-request-mobile-app-permissions-camera-location-contacts/) |
| **ATT-запрос на старте** | Opt-in только 13.85% глобально | [Appcues](https://www.appcues.com/blog/mobile-permission-priming) |
| **Нет кнопки "Пропустить"** | Отсутствие контроля увеличивает frustration и abandonment | [SmartLook](https://www.smartlook.com/blog/mobile-app-onboarding/) |
| **Отсутствие обратной связи** | "Тихие" интерфейсы снижают уверенность и замедляют engagement | [Digia](https://www.digia.tech/post/mobile-app-onboarding-activation-retention) |
| **Онбординг как one-time event** | Лучшие приложения возвращаются к онбордингу по мере открытия фич | [Chameleon](https://www.chameleon.io/blog/what-most-teams-get-wrong-about-onboarding-in-2025) |

### 4.2. Распространенные ошибки

**1. Front-loading информации**
Слишком много тултипов, инструкций и форм на старте. Пользователь чувствует, что "учится", а не "продвигается" ([Digia](https://www.digia.tech/post/mobile-app-onboarding-activation-retention)).

**2. Сбор данных без использования**
65% приложений собирают данные при регистрации, но только 18% используют их для персонализации. Огромный объем инсайтов уходит впустую ([Chameleon Benchmark 2025](https://www.chameleon.io/benchmark-report)).

**3. Generic пейволл вместо контекстуального**
"Subscribe now" без привязки к конкретной ценности конвертирует значительно хуже, чем контекстуальный пейволл после aha-момента ([RevenueCat](https://www.revenuecat.com/blog/growth/paywall-placement/)).

**4. Прогресс-бар с медленным стартом**
Если пользователь ожидает быстрый прогресс, но видит медленное заполнение — мотивация падает. Оптимально: быстрый старт, замедление к концу ([Irrational Labs](https://irrationallabs.com/blog/knowledge-cuts-both-ways-when-progress-bars-backfire/)).

**5. Нет A/B тестирования**
Приложения, которые проводят эксперименты, зарабатывают в **40 раз** больше, чем те, кто не тестирует ([Adapty 2025](https://adapty.io/blog/state-of-in-app-subscriptions-2025-in-10-minutes/)).

**6. Скрытие core action за слоями навигации**
Если пользователь не может быстро найти то, зачем пришел, он решает, что приложение бесполезно ([Digia](https://www.digia.tech/post/mobile-app-onboarding-activation-retention)).

---

## 5. Рекомендации для DeskCare

### 5.1. Стратегия пейволла и подписки

На основе данных Adapty и RevenueCat для Health & Fitness приложений:

| Параметр | Рекомендация | Обоснование | Источник |
|---|---|---|---|
| **Тип пейволла** | Soft paywall (freemium с ограничениями) | Freemium лучше для долгосрочной конверсии (23% конверсий freemium — через 6+ недель) | [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps/) |
| **Момент показа** | После aha-момента в онбординге | 89.4% триалов стартуют в День 0; первая сессия — highest-leverage surface | [Adapty 2025](https://adapty.io/blog/state-of-in-app-subscriptions-2025-in-10-minutes/) |
| **Планы на пейволле** | 3 плана: недельный, месячный, годовой | 3-plan paywall дает лучший LTV; недельный план конвертирует в 1.7-7.4x лучше годового | [Adapty 2026](https://adapty.io/state-of-in-app-subscriptions/) |
| **Триал** | 7-дневный free trial | Триалы 5-9 дней оптимальны для H&F; trial subscribers retain 1.4-1.7x лучше | [RevenueCat SOSA 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |
| **Годовой план** | Подчеркнуть (H&F лидирует в годовых — 68% выбирают annual) | H&F пользователи охотнее берут годовой план | [RevenueCat SOSA 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |

### 5.2. Количество шагов

**Рекомендация: 7 экранов** основного онбординга (без системных промптов и пейволла).

Обоснование:
- Слишком короткий (2-3 экрана) — не собирает достаточно данных для персонализации
- Слишком длинный (15+) — работает только у приложений с очень сильным value prop (Noom, Flo)
- 5-8 экранов — оптимальный баланс для health & fitness с подпиской
- Каждый экран должен стоить своих 20% drop-off ([Gabor Cselle](https://medium.com/gabor/every-step-costs-you-20-of-users-b613a804c329))

### 5.3. Какие данные собирать

| Шаг | Что спрашиваем | Зачем |
|---|---|---|
| 1 | Основная боль (шея, спина, глаза, запястья, общее) | Персонализация программы |
| 2 | Как часто болит (иногда / ежедневно / постоянно) | Определение интенсивности |
| 3 | Рабочее место (удаленка / офис / гибрид) | Контекст упражнений (дискретные vs открытые) |
| 4 | Сколько часов за столом в день | Частота напоминаний |
| 5 | Цель (снять боль / профилактика / привычка) | Тон коммуникации и контент |

### 5.4. Где показывать ценность

**Aha-момент для DeskCare**: Пользователь видит свою **персонализированную мини-программу** с конкретными упражнениями для его зоны боли.

| Момент | Что показываем |
|---|---|
| После 3 вопросов | "93% пользователей с такой же болью заметили улучшение за 2 недели" (social proof) |
| После всех вопросов | Labor Illusion: "Подбираем упражнения для вас..." (3-5 сек анимация) |
| Перед пейволлом | Персональный план: "Ваша 2-недельная программа для шеи" с превью 3 упражнений |
| На пейволле | "Разблокируйте полную программу из 14 упражнений" |

### 5.5. Предлагаемая структура онбординга

```
Экран 1: Welcome + Value Proposition
  "2 минуты в день — и шея перестанет болеть"
  [Иллюстрация: человек за столом делает простое упражнение]
  → Кнопка "Начать"

Экран 2: Основная зона боли (выбор)
  "Что беспокоит больше всего?"
  [Шея] [Спина] [Глаза] [Запястья] [Все понемногу]
  → Прогресс: ████░░░░░░ 20%

Экран 3: Частота боли
  "Как часто это беспокоит?"
  [Иногда] [Несколько раз в неделю] [Каждый день]
  → Прогресс: ██████░░░░ 40%

Экран 4: Social Proof + Контекст рабочего места
  "87% пользователей с болью в шее отмечают улучшение за 14 дней"
  "Где вы обычно работаете?"
  [Дома] [В офисе] [По-разному]
  → Прогресс: ████████░░ 60%

Экран 5: Цель + Время за столом
  "Что хотите получить?"
  [Убрать боль] [Профилактика] [Здоровая привычка]
  "Сколько часов в день за столом?" [4-6] [6-8] [8+]
  → Прогресс: █████████░ 80%

Экран 6: Labor Illusion
  [Анимация загрузки 3-5 сек]
  "Подбираем упражнения для вашей шеи..."
  "Рассчитываем оптимальное расписание..."
  "Готовим 2-недельную программу..."

Экран 7: Персональный план (AHA-момент)
  "Ваша программа готова!"
  [Карточки: 3 превью упражнений с названиями и длительностью]
  "14 упражнений • 2 мин/день • Результат за 14 дней"
  → Кнопка "Начать программу"

--- Системные промпты (вне основного флоу) ---

Экран N1: Напоминания
  "Когда удобно делать разминку?"
  [Утром] [В обед] [Вечером] [Каждые 2 часа]
  → Запрос push-уведомлений (после объяснения пользы)

Экран P: Пейволл
  "Разблокируйте полную программу"
  [7 дней бесплатно, затем $4.99/мес]
  [Годовой план $29.99 — экономия 50%]
  [Попробовать бесплатную версию]
```

### 5.6. Ключевые принципы реализации

1. **Прогресс-бар с ускоренным стартом**: Первые экраны заполняют прогресс быстрее (20% → 40% → 60%), последние — медленнее. Это использует Goal Gradient Effect ([UserPilot](https://userpilot.com/blog/progress-bar-psychology/))

2. **Кнопка "Пропустить" на каждом экране**: Видимая, но не навязчивая. Пользователь должен чувствовать контроль ([SmartLook](https://www.smartlook.com/blog/mobile-app-onboarding/))

3. **Отложенная регистрация**: Не требовать аккаунт до момента, когда пользователь увидит ценность. A/B тесты показывают +20% trial starts при отложенной регистрации ([Purchasely](https://www.purchasely.com/blog/app-onboarding))

4. **Разрешения — только по контексту**: Push-уведомления запрашивать после настройки напоминаний. Отложенные запросы дают +28% grant rate ([DogTownMedia](https://www.dogtownmedia.com/the-ask-when-and-how-to-request-mobile-app-permissions-camera-location-contacts/))

5. **A/B тестирование с первого дня**: Приложения с экспериментами зарабатывают в 40x больше ([Adapty 2025](https://adapty.io/blog/state-of-in-app-subscriptions-2025-in-10-minutes/)). Тестировать:
   - Количество шагов (5 vs 7 vs 9)
   - С Labor Illusion vs без
   - Пейволл до vs после первого упражнения
   - Формулировки на пейволле

6. **Haptic feedback на каждое действие**: Для DeskCare (Expo) — `Haptics.impactAsync()` при каждом выборе в онбординге. Тактильная обратная связь повышает engagement

7. **Микро-анимации**: Переходы между экранами, появление элементов — все анимировано. "Тихие" интерфейсы без обратной связи снижают уверенность ([Digia](https://www.digia.tech/post/mobile-app-onboarding-activation-retention))

### 5.7. Метрики для отслеживания

| Метрика | Целевое значение (MVP) | Целевое (6 мес) | Источник бенчмарка |
|---|---|---|---|
| Onboarding completion rate | 60% | 75% | [Business of Apps](https://www.businessofapps.com/data/app-onboarding-rates/) |
| Drop-off на каждом шаге | < 25% | < 15% | [Amra and Elma](https://www.amraandelma.com/funnel-drop-off-rate-statistics/) |
| Trial start rate (День 0) | 15% | 25% | [RevenueCat SOSA 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |
| Trial → Paid | 35% | 45% | [RevenueCat SOSA 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/) |
| Day 1 retention | 30% | 40% | [Business of Apps](https://www.businessofapps.com/data/health-fitness-app-benchmarks/) |
| Day 30 retention | 5% | 10% | [UXCam](https://uxcam.com/blog/mobile-app-retention-benchmarks/) |
| Push notification opt-in | 50% | 65% | [Appcues](https://www.appcues.com/blog/mobile-permission-priming) |

---

## Источники

### Отчеты и бенчмарки
- [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)
- [RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/)
- [RevenueCat — Subscription App Trends & Benchmarks 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/)
- [Adapty — State of In-App Subscriptions 2025](https://adapty.io/blog/state-of-in-app-subscriptions-2025-in-10-minutes/)
- [Adapty — State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions/)
- [Business of Apps — App Onboarding Rates](https://www.businessofapps.com/data/app-onboarding-rates/)
- [Business of Apps — Health & Fitness App Benchmarks](https://www.businessofapps.com/data/health-fitness-app-benchmarks/)
- [OneSignal — Mobile App Benchmarks 2024](https://onesignal.com/mobile-app-benchmarks-2024)
- [Chameleon — Benchmark Report 2025](https://www.chameleon.io/benchmark-report)
- [UserGuiding — 100+ Onboarding Statistics](https://userguiding.com/blog/user-onboarding-statistics)

### Статьи и гайды
- [Gabor Cselle — Every Step Costs You 20% of Users (Medium)](https://medium.com/gabor/every-step-costs-you-20-of-users-b613a804c329)
- [RevenueCat — Paywall Placement](https://www.revenuecat.com/blog/growth/paywall-placement/)
- [RevenueCat — Hard Paywall vs Soft Paywall](https://www.revenuecat.com/blog/growth/hard-paywall-vs-soft-paywall/)
- [Adapty — How to Build Onboarding Flows That Convert](https://adapty.io/blog/how-to-build-app-onboarding-flows-that-convert/)
- [Phiture — The Subscription Stack: CRO](https://phiture.com/mobilegrowthstack/the-subscription-stack-conversion-rate-optimization/)
- [Appcues — Mobile Permission Priming](https://www.appcues.com/blog/mobile-permission-priming)
- [UserPilot — Progress Bar Psychology](https://userpilot.com/blog/progress-bar-psychology/)
- [Irrational Labs — When Progress Bars Backfire](https://irrationallabs.com/blog/knowledge-cuts-both-ways-when-progress-bars-backfire/)
- [FunnelFox — Web-to-App Funnel Trends](https://blog.funnelfox.com/web-funnels-insights-and-trends/)
- [Ridhi Singh — How We Improved Onboarding by 200% (Medium)](https://medium.com/@ridhisingh/how-we-improved-our-onboarding-funnel-increased-conversions-by-200-9a106b238247)

### Примеры онбордингов
- [Retention Blog — Flo (Jacob Rushfinn)](https://www.retention.blog/p/flo-is-an-amazing-success-story)
- [Retention Blog — Noom (Jacob Rushfinn)](https://www.retention.blog/p/the-longest-onboarding-ever)
- [GoodUX / Appcues — Calm](https://goodux.appcues.com/blog/calm-app-new-user-experience)
- [GoodUX / Appcues — Headspace](https://goodux.appcues.com/blog/headspaces-mindful-onboarding-sequence)
- [GoodUX / Appcues — Duolingo](https://goodux.appcues.com/blog/duolingo-user-onboarding)
- [ScreensDesign — BetterMe](https://screensdesign.com/showcase/betterme-health-coaching)
- [Medium / Angele Lenglemetz — Flo Web-to-App](https://medium.com/design-bootcamp/how-flo-and-zoe-use-a-web-to-app-to-boost-their-conversion-6f424171b1b7)

### Антипаттерны и ошибки
- [Chameleon — What Teams Get Wrong About Onboarding 2025](https://www.chameleon.io/blog/what-most-teams-get-wrong-about-onboarding-in-2025)
- [Digia — Mobile App Onboarding Guide](https://www.digia.tech/post/mobile-app-onboarding-activation-retention)
- [SmartLook — Mobile App Onboarding](https://www.smartlook.com/blog/mobile-app-onboarding/)
- [DogTownMedia — Mobile Permission Requests](https://www.dogtownmedia.com/the-ask-when-and-how-to-request-mobile-app-permissions-camera-location-contacts/)
