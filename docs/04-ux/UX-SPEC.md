# DeskCare — UX Specification

**Дата:** 13 апреля 2026  
**Синтез:** [USER-FLOWS.md](./USER-FLOWS.md), [SCREEN-MAP.md](./SCREEN-MAP.md), [WIREFRAMES.md](./WIREFRAMES.md), [FUNNEL.md](./FUNNEL.md)

---

## 1. Общие принципы UX

### P1: Two-Tap Relief (Два нажатия до облегчения)

От открытия приложения до начала упражнения — максимум 2 нажатия. Home → Зона боли → Player. Каждый дополнительный шаг теряет ~20% пользователей. Минимальный путь = максимальная конверсия в сессию.

**Обоснование:** Primary persona (Марина) хочет "нажать Шея и получить рутину" ([TARGET-AUDIENCE.md](../02-product/TARGET-AUDIENCE.md) JTBD #1). Session completion rate target >80% ([PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md)).

### P2: Desk-Only, Always Discreet (Только за столом, всегда незаметно)

Все упражнения выполнимы сидя или стоя у стола. Ни одно не требует коврика, пола или пространства. Eye exercises работают без звука. Это не фитнес — это инструмент для рабочего дня.

**Обоснование:** Барьер #4 всех персон — "Неудобно в офисе". Триггер удаления Марины: "Нужно вставать/ложиться на пол" ([TARGET-AUDIENCE.md](../02-product/TARGET-AUDIENCE.md)).

### P3: Pain Progress, Not Guilt (Прогресс боли, а не чувство вины)

Мотивация через видимый прогресс (графики боли, стрики, бейджи), а не guilt-messaging. Пропуск дня → grace day + мягкий "С возвращением!", а не "Вы пропустили!". Тон — поддерживающий, не агрессивный.

**Обоснование:** Триггер удаления Алексея: "слишком игровой/несерьёзный тон". Streak Freeze снижает churn на 21% ([PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md)). "Мягкий тон" — acceptance criteria F8.

### P4: Personalization-First (Персонализация с первого экрана)

Каждый пользователь получает контент для СВОЕЙ зоны боли с первого дня. Onboarding quiz → персональный план → таргетированные push → адаптированная Home. Generic experience = churn.

**Обоснование:** Персонализация +35% completion, +200% конверсии ([ONBOARDING-RESEARCH.md](../03-practices/ONBOARDING-RESEARCH.md)). Триггер удаления Марины: "Нет таргетинга — хочет шея, а получает generic stretching".

### P5: Low-Friction Daily Anchor (Ежедневная точка входа с минимальным барьером)

Eye Break (30 сек) = ежедневная точка входа без обязательств. Даже если пользователь не готов к полной рутине, 30 секунд для глаз — это "почему бы и нет". Стрик засчитывается. Это формирует привычку и снижает порог возврата.

**Обоснование:** Eye exercises — уникальная фича, которой нет у конкурентов. Аналог Calm Sleep Stories — low-friction якорь ([PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md)).

---

## 2. Навигация

### Тип: Bottom Tab Bar (4 таба)

| Tab | Иконка | Название | Экран |
|-----|--------|----------|-------|
| 1 | 🏠 | Home | Home Screen (3.1) |
| 2 | 📚 | Библиотека | Library (3.2) |
| 3 | 📋 | Программы | Programs (3.3) |
| 4 | 👤 | Профиль | Profile (3.4) |

### Обоснование выбора

**Tab bar vs. Drawer:**
- Tab bar — стандарт для H&F приложений (Calm, Headspace, Peloton)
- 4 таба — оптимально (3 мало, 5 перегружает)
- Home = первый таб, core action (Body Map) виден сразу
- Drawer скрывает навигацию — противоречит P1 (Two-Tap Relief)

**Stack navigation внутри табов:**
- Home → Routine Preview → Exercise Player → Session Complete
- Library → Exercise Detail → Exercise Player
- Programs → Sciatica Program → Symptom Checker → Exercise Player
- Profile → Progress / Pain History / Settings / Sub-screens

### Глобальные overlay-экраны (поверх любого таба)

- Exercise Player (4.2) — полноэкранный, скрывает tab bar
- Paywall (5.1) — modal, можно закрыть
- Pain Check-in (5.4) — bottom sheet
- Share Sheet (5.7) — native share
- Milestone Celebration (5.8) — modal с анимацией

---

## 3. Состояния экранов

| # | Экран | Loading | Empty | Data | Error | Premium | Offline |
|---|-------|---------|-------|------|-------|---------|---------|
| 1.2 | Welcome | — | — | Static | — | — | ✅ Works |
| 1.3–1.6 | Quiz Steps | — | — | Static + Input | — | — | ✅ Works |
| 1.7 | Labor Illusion | ✅ Animation | — | — | — | — | ✅ Works |
| 1.8 | Персональный план | ✅ Brief | — | ✅ Персонализированный | — | — | ✅ Works |
| 1.10 | Paywall | ✅ Brief | — | ✅ Персонализированный | ❌ No Internet | — | ❌ Blocked |
| 3.1 | Home | ✅ Skeleton | ✅ Первый день | ✅ Стрик + рутина | ❌ Banner | ✅ Все зоны open | ✅ Cached |
| 3.2 | Library | ✅ Skeleton | ✅ Пустой поиск | ✅ Карточки | ❌ Banner | ✅ Без замков | ✅ Cached |
| 3.2.1 | Exercise Detail | ✅ Skeleton | — | ✅ Полное описание | ❌ Banner | ✅ Unlocked | ✅ If cached |
| 3.3 | Programs | ✅ Skeleton | — | ✅ Карточки программ | ❌ Banner | ✅ Без замков | ✅ Cached |
| 3.3.1 | Sciatica Program | ✅ Skeleton | — | ✅ Список упражнений | ❌ Banner | ✅ Full access | ❌ Needs data |
| 3.3.2 | Eye Program | — | — | ✅ Анимации | — | — | ✅ Works |
| 3.4 | Profile | ✅ Brief | — | ✅ Stats + nav | ❌ Banner | ✅ Pro badge | ✅ Cached |
| 3.4.1 | Progress | ✅ Skeleton | ✅ Нет сессий | ✅ Календарь + бейджи | ❌ Banner | — | ✅ Cached |
| 3.4.2 | Pain History | ✅ Skeleton | ✅ Нет check-ins | ✅ Графики | ❌ Banner | — | ✅ Cached |
| 4.1 | Routine Preview | ✅ Skeleton | — | ✅ Список упражнений | ❌ Full screen | — | ✅ If cached |
| 4.2 | Exercise Player | ✅ Buffering | — | ✅ Video + UI | ❌ Text fallback | — | ✅ If cached |
| 4.3 | Session Complete | — | — | ✅ Stats + стрик | — | — | ✅ Works |

### Принципы по состояниям

**Loading:**
- Skeleton screens (не spinner) для контентных экранов
- Немедленная интерактивность (tab bar, навигация) во время загрузки
- Максимальное время загрузки: 3 сек, после — retry prompt

**Empty:**
- Каждый empty state содержит CTA (что делать, чтобы наполнить)
- Мотивирующий тон: "Начните первую разминку!" вместо "Пусто"
- Иллюстрация + текст + действие

**Error:**
- Inline-баннер (не блокирующий): "Нет соединения. Кешированный контент доступен"
- Кнопка "Повторить" где применимо
- Exercise Player: text + illustration fallback при ошибке видео

**Offline:**
- Home, Library, Progress, Pain History — работают из кеша
- Exercise Player — только кешированные видео
- Eye exercises — полностью оффлайн (анимации, без видео)
- Paywall, Auth — требуют соединение

---

## 4. Микро-интеракции

### Анимации

| Элемент | Анимация | Длительность | Когда |
|---------|----------|-------------|-------|
| Splash → Welcome | Fade-in логотипа → scale-up | 1–2 сек | First launch |
| Quiz transition | Slide-left (iOS), shared axis (Android) | 300ms | Между шагами quiz |
| Прогресс-бар (quiz) | Fill animation, ease-out | 400ms | При переходе между шагами |
| Labor Illusion | Progress 0→100% + пульсирующие точки | 3–5 сек | После quiz |
| Body Map selection | Scale-up + highlight зоны (pulse glow) | 200ms | Home, нажатие на зону |
| Streak counter | Count-up animation + confetti (milestone) | 500ms | Session Complete |
| Pain slider | Smooth drag + emoji морф (😣→😊) | Continuous | Pain Check-in |
| Paywall timeline | Sequential reveal (dot → line → dot) | 800ms | При открытии paywall |
| Paywall plan selection | Scale-up выбранного + fade якоря | 200ms | Переключение плана |
| Milestone badge | Bounce-in + glow + confetti | 1.5 сек | При достижении milestone |
| Tab switch | Cross-fade content | 200ms | Навигация между табами |
| Exercise transition | Fade-out текущего → fade-in следующего | 500ms | Автопереход в Player |
| Eye exercise guide | Smooth path animation (circle, figure-8) | Continuous | Eye exercise |
| Streak Freeze | Ice-crystal animation on streak number | 800ms | При активации grace day |

### Haptic Feedback

| Действие | Тип Haptic | iOS | Android |
|----------|-----------|-----|---------|
| Кнопка (primary CTA) | Light impact | UIImpactFeedbackGenerator(.light) | HapticFeedbackConstants.KEYBOARD_TAP |
| Quiz answer selection | Selection changed | UISelectionFeedbackGenerator | HapticFeedbackConstants.CLOCK_TICK |
| Streak update | Success notification | UINotificationFeedbackGenerator(.success) | HapticFeedbackConstants.CONFIRM |
| Milestone achieved | Heavy impact + success | UIImpactFeedbackGenerator(.heavy) | HapticFeedbackConstants.LONG_PRESS |
| Pain slider drag | Selection changed (continuous) | UISelectionFeedbackGenerator | HapticFeedbackConstants.CLOCK_TICK |
| Exercise complete | Medium impact | UIImpactFeedbackGenerator(.medium) | HapticFeedbackConstants.KEYBOARD_TAP |
| Error / payment failed | Error notification | UINotificationFeedbackGenerator(.error) | HapticFeedbackConstants.REJECT |

**Реализация:** `Haptics.impactAsync()` (expo-haptics) — по CLAUDE.md.

### Transitions

| Переход | Тип | Обоснование |
|---------|-----|-------------|
| Tab → Tab | Cross-fade | Стандарт tab-навигации |
| Screen → Screen (stack) | Push (slide-from-right) | iOS/Android convention |
| Screen → Modal (paywall) | Present (slide-from-bottom) | Overlay, можно закрыть |
| Screen → Full-screen (player) | Present (slide-from-bottom) | Полноэкранный контент |
| Routine end → Session Complete | Custom fade + scale-up confetti | Награда, celebration |

---

## 5. Accessibility

### Минимальные требования (MVP)

| Требование | Standard | Реализация |
|------------|----------|------------|
| **Контраст текста** | WCAG 2.1 AA (4.5:1 normal, 3:1 large) | Все текст/фон комбинации проверены |
| **Размер touch targets** | Min 44×44 pt (iOS), 48×48 dp (Android) | Все кнопки, карточки, toggle |
| **Размер шрифта** | Min 16 sp body, 14 sp caption | Dynamic Type support (iOS), font scaling (Android) |
| **VoiceOver / TalkBack** | Все интерактивные элементы с labels | accessibilityLabel на всех Button, Image, Card |
| **Reduce Motion** | Анимации отключаются при системном Reduce Motion | useReducedMotion() → fallback (fade instead of slide) |
| **Цветовая независимость** | Информация не передаётся только цветом | Иконки + текст + цвет (стрик: число + огонь + зелёный) |
| **Screen reader navigation** | Логический порядок элементов | accessibilityOrder на каждом экране |
| **Video accessibility** | Субтитры на всех видео | Текстовые подсказки поверх видео (F3 acceptance criteria) |
| **Dark mode** | Полная поддержка тёмной темы | F10 acceptance criteria |

### Дополнительные рекомендации (v1.1)

- Font scaling up to 200% без обрезки контента
- Haptic + visual + audio feedback (тройная модальность)
- Keyboard navigation (для внешних клавиатур на iPad)
- RTL layout support (для арабского/иврита, если расширяемся)

---

## 6. Финальный список экранов

### Для передачи дизайнеру

| # | ID | Экран | Тип | Фичи | Состояния | Приоритет |
|---|-----|-------|-----|-------|-----------|-----------|
| 1 | ONB-01 | Splash Screen | Onboarding | — | 1 | P0 |
| 2 | ONB-02 | Welcome | Onboarding | F1 | 1 | P0 |
| 3 | ONB-03 | Quiz: Зона боли | Onboarding | F1 | 1 | P0 |
| 4 | ONB-04 | Quiz: Частота боли | Onboarding | F1 | 1 | P0 |
| 5 | ONB-05 | Quiz: Social Proof + Работа | Onboarding | F1 | 1 | P0 |
| 6 | ONB-06 | Quiz: Цель + Часы | Onboarding | F1 | 1 | P0 |
| 7 | ONB-07 | Labor Illusion | Onboarding | F1 | 1 | P0 |
| 8 | ONB-08 | Персональный план (AHA) | Onboarding | F1 | 1 | P0 |
| 9 | ONB-09 | Reminder Setup | Onboarding | F5 | 1 | P0 |
| 10 | PAY-01 | Paywall (основной) | Modal | — | 2 (default, personalized) | P0 |
| 11 | AUTH-01 | Sign In | Auth | F10 | 2 (default, error) | P1 |
| 12 | AUTH-02 | Sign Up | Auth | F10 | 2 (default, error) | P1 |
| 13 | HOME-01 | Home Screen | Tab | F2, F6, F8, F9 | 4 (empty, data, premium, re-engage) | P0 |
| 14 | LIB-01 | Library | Tab | F4 | 3 (catalog, empty search, free/premium) | P1 |
| 15 | LIB-02 | Exercise Detail | Screen | F4 | 2 (free, locked) | P1 |
| 16 | PRG-01 | Programs | Tab | F7 | 2 (free, premium) | P1 |
| 17 | PRG-02 | Sciatica Program | Screen | F7 | 2 (locked, active) | P1 |
| 18 | PRG-03 | Symptom Checker | Screen | F7 | 1 | P1 |
| 19 | PRG-04 | Eye Program | Screen | F6 | 1 | P0 |
| 20 | PRO-01 | Profile | Tab | F10 | 2 (free, premium) | P1 |
| 21 | PRO-02 | Progress | Screen | F8 | 2 (empty, data) | P1 |
| 22 | PRO-03 | Pain History | Screen | F9 | 2 (empty, data) | P1 |
| 23 | SET-01 | Settings | Screen | F10 | 1 | P1 |
| 24 | SET-02 | Reminder Settings | Screen | F5 | 1 | P0 |
| 25 | SET-03 | Subscription Management | Screen | F10 | 2 (free, premium) | P1 |
| 26 | EX-01 | Routine Preview | Flow | F2 | 1 | P0 |
| 27 | EX-02 | Exercise Player | Flow | F3 | 3 (playing, paused, buffering) | P0 |
| 28 | EX-03 | Session Complete | Flow | F8 | 3 (normal, milestone, pain prompt) | P0 |
| 29 | EX-04 | Eye Exercise | Flow | F6 | 1 | P0 |
| 30 | MOD-01 | Paywall (feature-gate) | Modal | — | 1 | P0 |
| 31 | MOD-02 | Mini-Paywall | Modal | — | 1 | P1 |
| 32 | MOD-03 | Push Permission Primer | Modal | F5 | 1 | P0 |
| 33 | MOD-04 | Pain Check-in | Bottom Sheet | F9 | 1 | P1 |
| 34 | MOD-05 | Streak Freeze Alert | Modal | F8 | 1 | P1 |
| 35 | MOD-06 | Rate App Prompt | Modal | — | 1 | P1 |
| 36 | MOD-07 | Share Sheet | Native | F8 | 1 | P1 |
| 37 | MOD-08 | Milestone Celebration | Modal | F8 | 1 | P1 |
| 38 | SYS-01 | Loading | System | — | 1 | P0 |
| 39 | SYS-02 | No Internet | System | — | 1 | P0 |
| 40 | SYS-03 | Force Update | System | — | 1 | P1 |
| 41 | SYS-04 | Maintenance | System | — | 1 | P2 |

### Сводка

| Категория | Кол-во экранов | Кол-во состояний | P0 | P1 | P2 |
|-----------|---------------|-----------------|----|----|-----|
| Onboarding | 9 | 9 | 9 | 0 | 0 |
| Auth | 2 | 4 | 0 | 2 | 0 |
| Tabs (Home, Library, Programs, Profile) | 4 | 11 | 1 | 3 | 0 |
| Sub-screens | 8 | 12 | 2 | 6 | 0 |
| Exercise Flow | 4 | 8 | 4 | 0 | 0 |
| Modals | 8 | 8 | 3 | 5 | 0 |
| System | 4 | 4 | 2 | 1 | 1 |
| **Итого** | **39** | **56** | **21** | **17** | **1** |

**P0 экраны (21)** — блокеры запуска. Дизайнер начинает с них.  
**P1 экраны (17)** — нужны к public launch.  
**P2 экраны (1)** — можно отложить.

---

## Источники

- [USER-FLOWS.md](./USER-FLOWS.md) — пользовательские сценарии
- [SCREEN-MAP.md](./SCREEN-MAP.md) — карта экранов
- [WIREFRAMES.md](./WIREFRAMES.md) — wireframes
- [FUNNEL.md](./FUNNEL.md) — воронка и метрики
- [FEATURES.md](../02-product/FEATURES.md) — MVP scope
- [PRACTICES-BRIEF.md](../03-practices/PRACTICES-BRIEF.md) — лучшие практики
- [TARGET-AUDIENCE.md](../02-product/TARGET-AUDIENCE.md) — персоны
- [PRODUCT-VISION.md](../02-product/PRODUCT-VISION.md) — product canvas
