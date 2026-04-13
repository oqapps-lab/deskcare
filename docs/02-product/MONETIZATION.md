# DeskCare — Monetization

**Дата:** 13 апреля 2026  
**Основа:** [RESEARCH-BRIEF.md](../01-research/RESEARCH-BRIEF.md) §6.2, [COMPETITORS.md](../01-research/COMPETITORS.md), бенчмарки RevenueCat/Adapty 2025–2026

---

## 1. Модель: Freemium + Subscription

### Выбранная модель

**Freemium с подпиской (monthly / annual) + premium add-on (специализированные программы)**

### Почему эта модель, а не другая

| Модель | Почему НЕ она |
|--------|--------------|
| **Полностью бесплатно (ad-supported)** | Реклама разрушает 2-минутную сессию. Wellness-аудитория ненавидит рекламу (Дженнифер удалила Office Yoga из-за рекламы). CPM для health-ниши $2–5 — нужно 1M+ DAU для значимого дохода. |
| **Только платная (no free tier)** | Wellness-приложения требуют "попробовать перед покупкой". Без free tier — 90%+ потенциальных пользователей не скачают. Конкуренция с бесплатным YouTube. |
| **One-time purchase (IAP)** | Не масштабируется. Нет recurring revenue. Контент нужно обновлять — ongoing costs требуют ongoing revenue. |
| **Только lifetime** | Убивает LTV для лояльных пользователей. Работает как дополнение, не как основная модель. |
| **Freemium + subscription** ✅ | Доказана конкурентами (Wakeout: $2/мес). H&F категория: trial-to-paid 35% — лучший показатель среди всех категорий (RevenueCat, 2025). Free tier для acquisition, paid — для retention и revenue. |

---

## 2. Тиры подписки

| Тир | Цена | Что включено | Ограничения бесплатного |
|-----|------|-------------|------------------------|
| **Free** | $0 | 3 рутины/день; 2 зоны тела (шея + спина); 1 eye exercise (20-20-20); базовые напоминания (fixed time); стрик-каунтер | Нет body-part targeting для глаз/запястий; нет pain tracking; нет специализированных программ; нет оффлайн; нет custom routines |
| **Pro Monthly** | $4.99/мес | Безлимитные рутины; все 5 зон тела; все eye exercises; smart reminders (DnD-aware); pain tracking; оффлайн-доступ; полная библиотека | — |
| **Pro Annual** | $29.99/год ($2.50/мес) | Всё из Pro Monthly + 50% скидка vs. monthly | — |
| **Sciatica Add-on** | +$2.99/мес (или +$19.99/год) | Полная sciatica-программа с фазами, прогрессией, PT-validated контентом | Требует Pro подписку |
| **Lifetime** | $79.99 | Всё из Pro + все текущие и будущие специализированные программы навсегда | — |

### Free Trial

| Параметр | Значение |
|----------|----------|
| **Длительность** | 7 дней (full Pro access) |
| **Запрос оплаты** | После trial, soft paywall (можно продолжить бесплатно) |
| **Когда предлагаем** | После первой успешной сессии (Aha-moment) — не до неё |

---

## 3. Ценообразование

### Бенчмарки конкурентов

| Приложение | Модель | Цена | Примечание |
|-----------|--------|------|-----------|
| **Wakeout** | Freemium | $2/мес или $15/год | Ниже рынка, но анимации, не видео |
| **Moova/StretchMinder** | Freemium | $3–5/мес | Слабый контент |
| **DeskBreak** | Freemium | до $19/мес | Десктоп, завышено |
| **Weasyo** | Freemium | ~$90/год (~$7.50/мес) | Жалобы на paywall |
| **[P]rehab** | Subscription | $49.99/мес | Premium rehab, другая категория |
| **Headspace** | Subscription | $12.99/мес или $69.99/год | Meditation, высокий бренд |
| **Noom** | Subscription | $59/мес | Weight loss, higher WTP |

**Медианная цена H&F категории:** $12.99/мес (RevenueCat, 2025). Наша цена $4.99/мес — ниже медианы, но оправданно: niche app vs. comprehensive fitness.

### Бенчмарки индустрии (RevenueCat / Adapty 2025–2026)

| Метрика | H&F бенчмарк | Наша цель |
|---------|-------------|-----------|
| **Медианная цена monthly** | $12.99/мес | $4.99/мес (нише-позиционирование) |
| **Медианная цена annual** | $38.42/год (H&F: $46.1) | $29.99/год |
| **Trial-to-paid (H&F)** | 35.0% (лидер среди всех категорий) | >25% (консервативно) |
| **Annual vs. monthly split** | 60–68% annual | Цель: 65% annual |
| **30-day churn** | ~30% от annual подписок | Цель: <25% |

**Источники:**
- [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)
- [RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/)
- [Adapty — Health & Fitness Benchmarks 2026](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/)
- [Adapty — State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions/)

### Обоснование выбранной цены

**$4.99/мес — sweet spot для DeskCare:**

| Фактор | Обоснование |
|--------|-------------|
| **WTP персон** | Марина: $4.99/мес. Дженнифер: $2.99–4.99/мес. Алексей: $7.99/мес (покрывается add-on). $4.99 — пересечение всех трёх. |
| **vs. YouTube** | Бесплатный YouTube — главный конкурент. $4.99 — "цена одного кофе" — психологически приемлемо. |
| **vs. Wakeout** | Wakeout: $2/мес — ниже, но без видео и спецпрограмм. DeskCare предлагает больше ценности за $4.99. |
| **vs. PT** | Физиотерапия: $40–80/визит. $4.99/мес = 1/16 одного визита. Argument в маркетинге: "дешевле одного кофе, полезнее одного визита к PT". |
| **Annual discount** | $29.99/год ($2.50/мес) — 50% скидка. Стимулирует annual, снижает churn. Бенчмарк: 60–68% подписчиков выбирают annual (RevenueCat). |
| **Sciatica premium** | +$2.99/мес — Алексей готов платить $7.99 total. Отдельный тир для high-WTP сегмента без повышения базовой цены. |

---

## 4. Unit Economics (целевые)

### Базовые параметры

| Параметр | Значение | Источник |
|----------|----------|----------|
| **Blended ARPU** | $3.50/мес (65% annual × $2.50 + 35% monthly × $4.99 + add-on uplift) | Расчёт |
| **Average Lifetime** | 8–12 месяцев | Бенчмарк H&F (RevenueCat) |
| **LTV** | **$28–$42** | ARPU × Lifetime |
| **CAC (organic)** | **$1–$3** | ASO/SEO-focused, минимальный paid. H&F CAC: $3–6 (AppsFlyer) |
| **CAC (paid)** | **$5–$8** | Facebook/Instagram ads, Reddit targeted |
| **Blended CAC** | **$3–$5** (80% organic, 20% paid) | Цель Year 1 |

### Unit Economics Summary

| Метрика | Значение | Target |
|---------|----------|--------|
| **LTV** | $28–$42 | — |
| **CAC** | $3–$5 | — |
| **LTV/CAC Ratio** | **6x–14x** | > 3x ✅ |
| **Payback Period** | **1–2 месяца** | < 6 месяцев ✅ |
| **Conversion (free → trial)** | 15–25% | — |
| **Conversion (trial → paid)** | 25–35% | H&F benchmark: 35% |
| **Conversion (install → paid)** | 5–8% | H&F median: 5.4% |
| **Monthly Churn (paid)** | 8–12% | H&F avg: ~10% |
| **D30 Retention (all users)** | 15–20% | Industry avg: 3–10% |

### Revenue Projections

| Период | Downloads | Paid Users | MRR | ARR |
|--------|-----------|-----------|-----|-----|
| Month 3 | 10K | 500–800 | $1.8–$2.8K | — |
| Month 6 | 30K | 1.5–2.4K | $5.3–$8.4K | — |
| Year 1 | 75K | 3.8–6K | $13–$21K | $156–$252K |
| Year 2 | 300K | 15–24K | $53–$84K | $636K–$1M |
| Year 3 | 750K | 38–60K | $133–$210K | $1.6–$2.5M |

---

## 5. Дополнительные потоки дохода

### 5.1 B2B / Enterprise (Фаза 2+)

| Параметр | Детали |
|----------|--------|
| **Модель** | Per-seat licensing ($3–5/employee/мес) |
| **Target** | HR-департаменты, wellness-программы компаний |
| **Value prop** | ROI 3–6x на wellness-программы (industry avg). Снижение МСК-дискомфорта = меньше больничных. |
| **Timing** | После подтверждения PMF (6–12 месяцев после запуска) |
| **Потенциал** | $5–15/employee/мес × 50–500 employees = $3K–$90K/год на клиента |

### 5.2 HSA/FSA Eligibility

| Параметр | Детали |
|----------|--------|
| **Что** | Пользователи платят за подписку pre-tax dollars через HSA/FSA |
| **Партнёры** | Truemed, Sika Health — HSA/FSA marketplaces |
| **Прецеденты** | [P]rehab, Noom уже HSA/FSA eligible |
| **Эффект** | Снижает effective price на ~30%. Убирает ценовой барьер для Алексея (ишиас). |
| **Timing** | v1.1 — после запуска, параллельно с основной работой |

### 5.3 Affiliate / Content Partnerships

| Партнёр | Модель | Потенциал |
|---------|--------|-----------|
| **Эргономичные аксессуары** | Affiliate links (кресла, мониторные стойки, мышки) | $2–5 за продажу, нативно |
| **PT-клиники** | Referral partnership (направляем пользователей при red flags) | Revenue share, B2B lead gen |
| **Corporate wellness platforms** | API-интеграция (контент DeskCare внутри Wellhub/Virgin Pulse) | Licensing fee |

### 5.4 Что НЕ делаем

| Поток | Почему нет |
|-------|-----------|
| **In-app advertising** | Разрушает UX 2-минутных сессий. Wellness-аудитория платит за отсутствие рекламы. |
| **Продажа данных** | Этически неприемлемо. Pain tracking — чувствительные данные. Убивает доверие. GDPR risk. |
| **Physical products** | Не наш бизнес. Капиталоёмко. Фокус на софт. |
| **Certifications / Courses** | Размывает позиционирование. Мы — quick relief tool, не education platform. |

---

## Источники

- [RESEARCH-BRIEF.md](../01-research/RESEARCH-BRIEF.md) §6.2 — рекомендуемая pricing модель
- [COMPETITORS.md](../01-research/COMPETITORS.md) — ценообразование конкурентов
- [TARGET-AUDIENCE.md](./TARGET-AUDIENCE.md) — WTP по персонам
- [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)
- [RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/)
- [Adapty — Health & Fitness Benchmarks 2026](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/)
- [Adapty — State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions/)
- [AppsFlyer — Performance Index 2025](https://www.appsflyer.com/resources/reports/performance-index/)
- [Business of Apps — H&F Benchmarks 2026](https://www.businessofapps.com/data/health-fitness-app-benchmarks/)
