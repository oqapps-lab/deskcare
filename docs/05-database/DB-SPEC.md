# DeskCare — Database Specification

**Дата:** 13 апреля 2026
**Основа:** [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md), [FEATURES.md](../02-product/FEATURES.md), [MONETIZATION.md](../02-product/MONETIZATION.md)

---

## 1. Storage Buckets

Supabase Storage для медиафайлов.

| Bucket | Тип | Доступ | Содержимое | Макс. размер файла |
|--------|-----|--------|------------|-------------------|
| `avatars` | Private | Авторизованные пользователи (свои файлы) | Аватары профиля | 2 MB |
| `exercise-videos` | Public | Публичное чтение | Видео упражнений (MP4, HLS) | 100 MB |
| `exercise-thumbnails` | Public | Публичное чтение | Превью упражнений (WebP, PNG) | 1 MB |
| `achievement-icons` | Public | Публичное чтение | Иконки бейджей (SVG, PNG) | 500 KB |

### Политики Storage

**avatars:**
```sql
-- SELECT: пользователь видит свой аватар
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- INSERT: пользователь загружает свой аватар
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- UPDATE: пользователь обновляет свой аватар
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE: пользователь удаляет свой аватар
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Публичные бакеты (exercise-videos, exercise-thumbnails, achievement-icons):**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('exercise-videos', 'exercise-thumbnails', 'achievement-icons'));

-- Запись — только через service role (admin upload)
```

### Структура файлов

```
avatars/
  {user_id}/avatar.webp

exercise-videos/
  {exercise_slug}/video.mp4
  {exercise_slug}/video_720p.mp4
  {exercise_slug}/video_480p.mp4

exercise-thumbnails/
  {exercise_slug}/thumb.webp
  {exercise_slug}/thumb@2x.webp

achievement-icons/
  {achievement_slug}/icon.svg
  {achievement_slug}/icon.png
```

---

## 2. Edge Functions

Серверные функции на Deno (Supabase Edge Functions).

### 2.1 handle-adapty-webhook

**Назначение:** Обработка webhook-событий от Adapty при изменении подписки.
**Триггер:** POST запрос от Adapty
**Частота:** По событию (покупка, отмена, продление, billing issue)

**Логика:**
1. Валидация подписи webhook (Adapty secret)
2. Извлечение `adapty_profile_id` и `event_type`
3. Маппинг Adapty event → status/plan в таблице `subscriptions`
4. Upsert в `subscriptions` через service role
5. Обновление `is_active` флага

**Маппинг событий:**

| Adapty Event | status | is_active |
|-------------|--------|-----------|
| subscription_started | active | true |
| trial_started | trialing | true |
| subscription_renewed | active | true |
| subscription_expired | expired | false |
| subscription_cancelled | cancelled | (зависит от периода) |
| billing_issue_detected | billing_issue | (зависит от grace period) |
| subscription_paused | paused | false |

### 2.2 delete-user-data

**Назначение:** Полное удаление данных пользователя (GDPR, Privacy — F10).
**Триггер:** Запрос из приложения (Settings → Privacy → Delete Account)
**Частота:** Редко

**Логика:**
1. Проверка авторизации (auth.uid())
2. Удаление из `auth.users` (CASCADE удалит все связанные данные)
3. Удаление файлов из Storage (`avatars/{user_id}/`)
4. Опционально: отзыв подписки через Adapty API

### 2.3 export-pain-data

**Назначение:** Экспорт данных боли в PDF для врача (F9: Pain Tracking).
**Триггер:** Запрос из приложения (Pain History → Export)
**Частота:** Редко

**Логика:**
1. Получение `pain_entries` пользователя за период
2. Получение `sessions` за тот же период (корреляция)
3. Генерация PDF с графиками
4. Возврат URL для скачивания (временная ссылка)

---

## 3. Database Functions

PL/pgSQL функции, выполняемые внутри PostgreSQL.

### 3.1 update_updated_at()

```sql
-- Автообновление updated_at при UPDATE
-- Применена ко всем таблицам с updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3.2 handle_new_user()

```sql
-- Автосоздание профиля, настроек, стрика, подписки при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  INSERT INTO public.streaks (user_id) VALUES (NEW.id);
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.3 has_active_subscription()

```sql
-- Проверка активной подписки для RLS-политик premium-контента
CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid()
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## 4. Realtime

Supabase Realtime подписки.

| Таблица | Realtime | Обоснование |
|---------|----------|-------------|
| subscriptions | Да | Клиент должен мгновенно реагировать на изменение статуса подписки (unlock/lock контента) |
| streaks | Нет | Обновляется только клиентом, не нужна синхронизация |
| sessions | Нет | Создаётся и обновляется клиентом |
| Все остальные | Нет | Не требуют real-time обновлений |

**Включение:**
```sql
-- В Supabase Dashboard → Database → Replication
-- Или через SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
```

**Использование на клиенте:**
```typescript
supabase
  .channel('subscription-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'subscriptions',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Обновить UI (unlock premium, show paywall)
  })
  .subscribe();
```

---

## 5. Cron Jobs

Периодические задачи (pg_cron или Supabase Cron).

| Job | Расписание | Описание |
|-----|-----------|----------|
| **reset_stale_streaks** | `0 3 * * *` (ежедневно 03:00 UTC) | Обнуление стриков для пользователей, у которых `last_activity_date < current_date - 2` (пропущен 1 день + grace day) |
| **cleanup_expired_trials** | `0 4 * * *` (ежедневно 04:00 UTC) | Обновление `subscriptions.status = 'expired'` для истёкших trial без оплаты |
| **aggregate_weekly_stats** | `0 5 * * 1` (понедельник 05:00 UTC) | Агрегация недельной статистики для weekly summary push |

### reset_stale_streaks

```sql
-- Ежедневно: обнулить стрики с просроченным grace day
UPDATE public.streaks
SET
  current_streak = 0,
  grace_day_used = false,
  grace_day_date = NULL,
  updated_at = now()
WHERE
  last_activity_date IS NOT NULL
  AND last_activity_date < CURRENT_DATE - INTERVAL '2 days'
  AND current_streak > 0;
```

### cleanup_expired_trials

```sql
-- Ежедневно: пометить истёкшие trial
UPDATE public.subscriptions
SET
  status = 'expired',
  is_active = false,
  plan = 'free',
  updated_at = now()
WHERE
  status = 'trialing'
  AND trial_end < now();
```

---

## 6. Estimated Scale

Прогноз объёма данных на основе [MONETIZATION.md](../02-product/MONETIZATION.md) (Year 1: 75K downloads, 3.8–6K paid users).

### Year 1

| Таблица | Строк (оценка) | Средний размер строки | Общий объём |
|---------|-----------------|----------------------|------------|
| profiles | 75K | 500 B | ~37 MB |
| user_settings | 75K | 200 B | ~15 MB |
| subscriptions | 75K | 500 B | ~37 MB |
| streaks | 75K | 200 B | ~15 MB |
| sessions | 750K–1.5M | 300 B | ~225–450 MB |
| session_exercises | 2–5M | 200 B | ~400 MB–1 GB |
| pain_entries | 200K–500K | 200 B | ~40–100 MB |
| favorites | 100K–300K | 100 B | ~10–30 MB |
| reminder_schedules | 100K | 300 B | ~30 MB |
| user_program_progress | 10K–30K | 400 B | ~4–12 MB |
| user_achievements | 100K–300K | 100 B | ~10–30 MB |
| exercises | 80 | 1 KB | < 1 MB |
| routines | 30 | 500 B | < 1 MB |
| body_zones | 5 | 200 B | < 1 MB |
| programs | 2 | 500 B | < 1 MB |
| achievements | 10 | 300 B | < 1 MB |
| **Итого (данные)** | | | **~800 MB–2 GB** |

### Storage (Year 1)

| Bucket | Файлов | Средний размер | Общий объём |
|--------|--------|---------------|------------|
| exercise-videos | 80 × 3 качества | 30 MB | ~7 GB |
| exercise-thumbnails | 80 × 2 размера | 100 KB | ~16 MB |
| avatars | 15K (20% загрузят) | 500 KB | ~7 GB |
| achievement-icons | 10 × 2 формата | 50 KB | ~1 MB |
| **Итого (storage)** | | | **~14 GB** |

### Supabase Plan

Для Year 1 достаточно **Pro Plan** ($25/мес):
- 8 GB database
- 100 GB storage
- 50 GB bandwidth
- 500K Edge Function invocations

---

## 7. Backup Strategy

### Supabase Built-in

| Механизм | Детали |
|----------|--------|
| **Point-in-Time Recovery (PITR)** | Доступен на Pro plan. Восстановление до любой секунды за последние 7 дней. |
| **Daily Backups** | Автоматические ежедневные бэкапы (включены в Pro). |
| **Logical Backups** | pg_dump по расписанию через Supabase CLI для long-term хранения. |

### Рекомендации

1. **PITR** включён — основная защита от ошибок и потери данных
2. **Еженедельный pg_dump** в S3/R2 для long-term архива (вне Supabase)
3. **Перед миграциями** — ручной snapshot через Supabase Dashboard
4. **Storage backup** — Supabase не бэкапит Storage автоматически; для критичных файлов (videos) хранить копию в S3

### Disaster Recovery

| Сценарий | RTO | RPO | Действие |
|----------|-----|-----|----------|
| Ошибка в данных | < 1 час | 0 (PITR) | Восстановление через PITR |
| Некорректная миграция | < 1 час | 0 (PITR) | Rollback через PITR |
| Полная потеря Supabase | < 4 часа | 1 день | Восстановление из pg_dump + Storage backup |

---

## 8. Миграционная стратегия Anonymous → Authenticated

Supabase Auth поддерживает anonymous users. Стратегия для DeskCare:

1. **Первый запуск** — создаётся anonymous user (Supabase Auth)
2. **Trigger `handle_new_user()`** — создаёт profile, settings, streak, subscription
3. **Онбординг** — данные сохраняются в `profiles.onboarding_data`
4. **Sign Up/Sign In** — anonymous user конвертируется в authenticated через `supabase.auth.updateUser()`
5. **Все данные сохраняются** — `auth.users.id` не меняется при конвертации

```typescript
// Конвертация anonymous → email
const { data, error } = await supabase.auth.updateUser({
  email: 'user@example.com',
  password: 'password123',
});
```

---

## 9. Типовые запросы

### Home Screen — загрузка данных

```sql
-- Профиль + стрик + подписка (1 запрос)
SELECT
  p.display_name, p.onboarding_data, p.onboarding_completed,
  s.current_streak, s.longest_streak, s.last_activity_date,
  s.total_sessions, s.total_minutes,
  sub.status, sub.plan, sub.is_active
FROM public.profiles p
JOIN public.streaks s ON s.user_id = p.id
JOIN public.subscriptions sub ON sub.user_id = p.id
WHERE p.id = auth.uid();
```

### Body-Part Targeting — рутины по зоне

```sql
-- Рутины для выбранной зоны с упражнениями
SELECT
  r.id, r.title, r.duration_seconds, r.is_premium,
  json_agg(
    json_build_object(
      'id', e.id,
      'title', e.title,
      'duration_seconds', e.duration_seconds,
      'thumbnail_url', e.thumbnail_url
    ) ORDER BY re.sort_order
  ) AS exercises
FROM public.routines r
JOIN public.routine_exercises re ON re.routine_id = r.id
JOIN public.exercises e ON e.id = re.exercise_id
WHERE r.body_zone_id = $1  -- uuid зоны
GROUP BY r.id
ORDER BY r.sort_order;
```

### Pain Tracking — график за месяц

```sql
-- Записи боли за последние 30 дней
SELECT
  pe.recorded_date, pe.pain_level,
  bz.slug AS zone_slug, bz.name AS zone_name
FROM public.pain_entries pe
JOIN public.body_zones bz ON bz.id = pe.body_zone_id
WHERE pe.user_id = auth.uid()
  AND pe.deleted_at IS NULL
  AND pe.recorded_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY pe.recorded_date DESC, bz.sort_order;
```

### Weekly Summary — статистика за неделю

```sql
-- Сессии за неделю
SELECT
  COUNT(*) AS sessions_count,
  COALESCE(SUM(duration_seconds), 0) / 60 AS total_minutes,
  COUNT(DISTINCT body_zone_id) AS zones_covered,
  COUNT(DISTINCT DATE(started_at)) AS active_days
FROM public.sessions
WHERE user_id = auth.uid()
  AND deleted_at IS NULL
  AND completed_at IS NOT NULL
  AND started_at >= CURRENT_DATE - INTERVAL '7 days';
```

---

## Источники

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) — структура таблиц
- [RLS-POLICIES.md](./RLS-POLICIES.md) — политики безопасности
- [MIGRATIONS.md](./MIGRATIONS.md) — SQL миграции
- [MONETIZATION.md](../02-product/MONETIZATION.md) — прогнозы downloads/users
- [FEATURES.md](../02-product/FEATURES.md) — MVP scope
