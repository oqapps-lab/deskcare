# DeskCare — Product Vision

**Дата:** 13 апреля 2026  
**Синтез:** [TARGET-AUDIENCE.md](./TARGET-AUDIENCE.md) + [PROBLEM-SOLUTION-FIT.md](./PROBLEM-SOLUTION-FIT.md) + [FEATURES.md](./FEATURES.md) + [MONETIZATION.md](./MONETIZATION.md)

---

## 1. Elevator Pitch

**DeskCare — приложение для микро-растяжек за рабочим столом.** Показываешь, где болит — получаешь 2–3 минутное видео-упражнение прямо за столом, без коврика и переодевания. Специализированные программы для ишиаса, упражнения для глаз, умные напоминания — всё, чтобы 80% офисных работников наконец перестали терпеть боль и начали двигаться.

---

## 2. Product Canvas

| Блок | Содержание |
|------|-----------|
| **Problem** | 80% офисных/удалённых работников испытывают хроническую боль (шея 58.6%, спина 52.5%, глаза 69–94%) от сидячей работы. Существующие решения либо не работают (YouTube — нет системы), либо недоступны (PT — $320/мес), либо ограничены платформой (Wakeout — iOS-only). |
| **Solution** | Мобильное приложение с body-part targeting: нажми "Шея" → получи 3-мин видео-рутину с профессиональным инструктором. Desk-friendly (сидя/стоя), ультра-короткий формат (2–5 мин), специализированные программы (ишиас), eye exercises, smart reminders. |
| **Key Metrics** | D1 Retention >60%, D7 >30%, D30 >15%, Trial-to-paid >25%, Session completion >80%, NPS >50 |
| **UVP** | Единственное кросс-платформенное приложение, объединяющее профессиональное видео + таргетинг по зоне боли + специализированные программы (ишиас) + упражнения для глаз — всё desk-friendly. |
| **Unfair Advantage** | (1) Кросс-платформа на пустом Android-рынке (Wakeout — iOS-only). (2) Eye exercises — ни один конкурент. (3) Sciatica B2C программа — полная пустота. (4) First-mover SEO/ASO advantage по "desk stretches" + "sciatica exercises at desk". |
| **Channels** | ASO/SEO (primary), Content marketing (blog/YouTube → app), Reddit organic (r/remotework, r/sciatica), Product Hunt launch, Word-of-mouth (dev Slack-каналы) |
| **Customer Segments** | Primary: удалённые tech-работники 28–35 с болью в шее (Марина). Secondary: менеджеры 38–48 с ишиасом (Алексей). Tertiary: офисные работники 24–30 с CVS (Дженнифер). |
| **Cost Structure** | Видеопродакшн ($5–15K upfront), Supabase/CDN ($100–500/мес), Apple/Google fees (15–30%), Advisory board ($1–3K/мес), Marketing ($500–2K/мес). Total burn: $3–5K/мес pre-revenue. |
| **Revenue Streams** | Pro подписка ($4.99/мес, $29.99/год), Sciatica add-on (+$2.99/мес), Lifetime ($79.99), B2B licensing (Фаза 2), HSA/FSA (v1.1), Affiliate (эргономика). |

---

## 3. Success Metrics (KPI)

### Основные метрики

| Метрика | 3 мес | 6 мес | 12 мес |
|---------|-------|-------|--------|
| **Downloads (cumulative)** | 10K | 30K | 75K |
| **MAU** | 3K | 8K | 18K |
| **Paid subscribers** | 500–800 | 1.5–2.4K | 3.8–6K |
| **Conversion (install → paid)** | 5% | 6% | 8% |
| **D1 Retention** | 50% | 55% | 60% |
| **D7 Retention** | 25% | 28% | 30% |
| **D30 Retention** | 12% | 15% | 18% |
| **MRR** | $1.8–$2.8K | $5.3–$8.4K | $13–$21K |
| **NPS** | 40 | 50 | 55 |
| **App Store Rating** | 4.3 | 4.5 | 4.6 |

### Retention Focus Metrics

| Метрика | Target | Почему важна |
|---------|--------|-------------|
| **Session completion rate** | >80% | Рутины правильной длительности |
| **Sessions per week (active users)** | >3 | Формирование привычки |
| **Streak length (median)** | >5 дней | Геймификация работает |
| **Eye exercise usage** | >20% сессий | Eye exercises — уникальная фича |
| **Pain tracking engagement** | >30% MAU | Perceived value + retention |

---

## 4. Roadmap

### MVP (Month 1–2): Запуск

**Цель:** Первый работающий продукт на обеих платформах.

| Компонент | Детали |
|-----------|--------|
| **Фичи** | Body-part targeting, Video player, Eye exercises, Smart reminders, Onboarding quiz, Streaks |
| **Контент** | 50–80 видео (шея 10, спина 10, поясница/ишиас 15, глаза 5, запястья 5, full-body 5) |
| **Платформы** | iOS + Android (Expo) |
| **Монетизация** | Free tier + Pro ($4.99/мес, $29.99/год), 7-day trial |
| **Advisory** | 1 PT + 1 врач на контракте |
| **Launch** | Soft launch (TestFlight + closed beta, 200–500 users) |

### v1.0 (Month 3–4): Public Launch

**Цель:** Public launch, начало organic growth.

| Компонент | Детали |
|-----------|--------|
| **Фичи** | Pain tracking, Exercise library с фильтрами, Sciatica program (базовая), Profile & settings |
| **Контент** | +20 видео (итого 70–100) |
| **Marketing** | Product Hunt launch, ASO optimization, Reddit organic |
| **Монетизация** | Sciatica add-on (+$2.99/мес), Lifetime ($79.99) |
| **Target** | 10K downloads, 500 paid, 4.3+ rating |

### v1.1 (Month 5–6): Retention & Growth

**Цель:** Улучшить retention, расширить контент, начать B2B exploration.

| Компонент | Детали |
|-----------|--------|
| **Фичи** | Calendar-aware reminders, Custom routines, Carpal tunnel program, Advanced analytics, Social challenges |
| **Контент** | +30 видео (итого 100–130), 2-й инструктор |
| **Marketing** | Content marketing (blog/YouTube), Instagram Reels, SEO |
| **Монетизация** | HSA/FSA eligibility, Affiliate (эргономика) |
| **B2B** | Landing page, первые 3–5 пилотных компаний |
| **Target** | 30K downloads, 2.4K paid, D30 retention >15% |

### v1.5 (Month 7–9): Scale

| Компонент | Детали |
|-----------|--------|
| **Фичи** | Audio-only mode, Guided 4-week programs, Apple Watch (basic), Slack/Teams integration (beta) |
| **Контент** | +40 видео (итого 140–170) |
| **Marketing** | Paid acquisition (Facebook/Instagram), Influencer partnerships |
| **B2B** | B2B dashboard (beta), 10–20 компаний |
| **Target** | 75K downloads, 6K paid, MRR $15K+ |

### v2.0 (Month 10–12): Intelligence

| Компонент | Детали |
|-----------|--------|
| **Фичи** | AI form correction (camera-based), AI-персонализация рутин, Posture check-ins, WearOS |
| **B2B** | Full B2B product, enterprise pricing, wellness platform integrations |
| **Target** | 150K downloads, 12K paid, MRR $40K+ |

---

## 5. Стратегические принципы

### Retention > Acquisition

Wellness-приложения имеют **60–80% churn в первый месяц** ([RESEARCH-BRIEF.md](../01-research/RESEARCH-BRIEF.md) §4). Если не решить retention — все остальные метрики бессмысленны. Retention — это THE product challenge, а не side feature.

**Retention-first дизайн:**
1. Ультра-короткий формат (2–3 мин = "нет отговорок")
2. Стрики с мягкой геймификацией (grace day, не guilt)
3. Smart reminders (DnD-aware, контекстные, не раздражающие)
4. Pain tracking = видимый прогресс ("шея на 30% лучше за месяц")
5. Body-part targeting = relevance ("именно для моей боли")

### Content = Product

Видеоконтент — **не фича, а сам продукт**. Без профессионального видео DeskCare не отличается от десятков низкокачественных приложений. Один инструктор, одна студия, 2–3 дня съёмки = 50–80 видео к запуску.

### Cross-Platform = Moat

Кросс-платформенный запуск (iOS + Android) — не "nice-to-have", а **стратегическое преимущество #1**. Android пуст. Первый качественный продукт на обеих платформах получает SEO/ASO-позиции, которые крайне сложно отобрать.

---

## 6. Verdict — Финальный вердикт Product Stage

### ✅ GO — переход к UX-проектированию

**Обоснование:**

| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| **Проблема валидирована** | ✅ | 80.81% МСК, 69–94% CVS, подтверждено Nature/NIOSH |
| **Аудитория определена** | ✅ | 3 персоны, primary = Марина (удалённый dev с шеей) |
| **Конкурентная позиция ясна** | ✅ | Верхний правый квадрант: desk-specific + specialized content |
| **MVP scope определён** | ✅ | 10 фич, 12 экранов, 50–80 видео |
| **Монетизация спроектирована** | ✅ | Freemium + $4.99/мес, LTV/CAC 6–14x |
| **Unit economics сходятся** | ✅ | Payback < 2 мес, LTV $28–42, CAC $3–5 |
| **Roadmap есть** | ✅ | MVP → v1.0 → v1.1 → v2.0, 12 месяцев |
| **Риски идентифицированы** | ✅ | Retention (#1), видеоконтент (#2), юридический (#3) |

### Условия GO

1. **Бюджет на видеопродакшн** подтверждён (минимум $5–10K на 50–80 видео)
2. **Advisory board** (1 PT + 1 врач) привлечён до начала UX-дизайна
3. **UX-дизайн** начинается с retention-first подхода: onboarding → first session → Aha-moment < 3 мин
4. **Обе платформы** (iOS + Android) — с первого дня, без компромиссов

### Следующий этап

**Stage 3: UX/UI Design** — проектирование пользовательских потоков, wireframes, дизайн-система, прототип.

---

## Источники

- [TARGET-AUDIENCE.md](./TARGET-AUDIENCE.md)
- [PROBLEM-SOLUTION-FIT.md](./PROBLEM-SOLUTION-FIT.md)
- [FEATURES.md](./FEATURES.md)
- [MONETIZATION.md](./MONETIZATION.md)
- [RESEARCH-BRIEF.md](../01-research/RESEARCH-BRIEF.md)
- [MARKET-RESEARCH.md](../01-research/MARKET-RESEARCH.md)
- [COMPETITORS.md](../01-research/COMPETITORS.md)
- [DOMAIN-RESEARCH.md](../01-research/DOMAIN-RESEARCH.md)
