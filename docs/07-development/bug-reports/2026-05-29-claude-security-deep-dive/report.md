# Баг-репорт — 29 мая 2026 (security-deep-dive)

**Дата:** 2026-05-29  
**Метод:** Security audit — code-security-auditor + security-auditor + threat-model SKILLs  
**Ветка:** main  
**Тестировал:** Claude (automated security audit)  
**Фокус:** RLS, IDOR, SECURITY DEFINER RPCs, auth tokens, client-side gates

---

## Итог

| # | Баг | Файл:Строка | Приоритет |
|---|-----|------------|-----------|
| DC-S1 | IDOR: `check_and_unlock_achievements` SECURITY DEFINER принимает произвольный `p_user_id` без проверки | `supabase/migrations/20260527_achievements_rpc.sql:13` | CRITICAL |
| DC-S2 | JWT хранится в plaintext AsyncStorage на всех устройствах | `lib/supabase.ts` | HIGH |
| DC-S3 | `EXPO_PUBLIC_PREMIUM_BYPASS=1` разблокирует весь премиум без серверной проверки | `lib/premium.ts:18` | MEDIUM |
| DC-S4 | `is_premium=true` статьи доступны анонимно через REST API | `supabase/migrations/` | LOW |

---

## DC-S1: IDOR в `check_and_unlock_achievements` — CRITICAL

**Где:** `supabase/migrations/20260527_achievements_rpc.sql`, строка 13  
**Что вижу:**

```sql
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER  -- работает от имени owner БД, обходит RLS
AS $$
BEGIN
  -- p_user_id нигде не проверяется против auth.uid()
  SELECT COUNT(*) INTO v_sessions FROM sessions WHERE user_id = p_user_id;
  INSERT INTO user_achievements (user_id, ...) VALUES (p_user_id, ...);
```

Функция объявлена `SECURITY DEFINER` — это значит она работает с правами владельца БД и обходит все RLS-политики. При этом `p_user_id` берётся из тела запроса клиента и ни разу не сравнивается с `auth.uid()`.

Любой авторизованный пользователь может вызвать:
```js
supabase.rpc('check_and_unlock_achievements', { p_user_id: '<victim_uuid>' })
```
и получить:
1. **Чтение приватных данных жертвы** — количество сессий, минут, pain-логов, eye-break записей
2. **Запись достижений в аккаунт жертвы** — можно разблокировать (или имитировать) ачивки за другого пользователя

**Как должно быть:**

```sql
CREATE OR REPLACE FUNCTION check_and_unlock_achievements()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;
  -- использовать v_user везде вместо p_user_id
```

Убрать параметр, использовать `auth.uid()` внутри функции.

**Приоритет:** CRITICAL

---

## DC-S2: JWT в plaintext AsyncStorage

**Где:** `lib/supabase.ts`  
**Что вижу:**

```ts
createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,   // ← plaintext
    autoRefreshToken: true,
    persistSession: true,
  }
})
```

Supabase JWT (access token + refresh token) хранится в незашифрованном AsyncStorage. На Android это plaintext SQLite файл. При ADB backup без шифрования или на рутованном устройстве токен доступен любому приложению. `expo-secure-store` нигде в проекте не установлен.

**Как должно быть:**

```ts
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

createClient(url, anonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
  }
})
```

Установить: `npx expo install expo-secure-store`

**Приоритет:** HIGH

---

## DC-S3: `EXPO_PUBLIC_PREMIUM_BYPASS` — нет CI-защиты от попадания в production

**Где:** `lib/premium.ts`, строка 18  
**Что вижу:**

```ts
export const PREMIUM_BYPASS = process.env.EXPO_PUBLIC_PREMIUM_BYPASS === '1';
```

`EXPO_PUBLIC_*` переменные вшиваются в JS-бандл при сборке. Если production-сборка случайно будет запущена с `EXPO_PUBLIC_PREMIUM_BYPASS=1` — все пользователи получат бесплатный премиум без серверной проверки. Нет никакого CI-правила, запрещающего это значение в production-конфигурации.

**Как должно быть:**

Добавить в CI-pipeline шаг:
```bash
if [[ "$APP_ENV" == "production" && "$EXPO_PUBLIC_PREMIUM_BYPASS" == "1" ]]; then
  echo "ERROR: PREMIUM_BYPASS cannot be enabled in production builds"
  exit 1
fi
```

**Приоритет:** MEDIUM

---

## DC-S4: Статьи с `is_premium=true` доступны анонимно

**Где:** `supabase/migrations/` — политика `articles_public_read`  
**Что вижу:**

```sql
CREATE POLICY "articles_public_read" ON articles
  FOR SELECT USING (published_at IS NOT NULL);
```

Флаг `is_premium = true` на статье не ограничивает доступ через REST API — любой anon-клиент может прочитать тело premium-статьи. Если это намеренно (весь контент бесплатный), политика корректна. Если premium-статьи должны быть платными на уровне данных — нужна доработка.

**Как должно быть (если paywall на уровне данных нужен):**

```sql
CREATE POLICY "articles_read" ON articles
  FOR SELECT USING (
    published_at IS NOT NULL
    AND (NOT is_premium OR auth.uid() IS NOT NULL)
  );
```

**Приоритет:** LOW — уточнить намерение с командой
