# Icon A/B/N Testing — deskcare

## Как это работает

App Store позволяет тестировать иконки через **Product Page Optimization (PPO)** — встроенный A/B тест Apple. Разные пользователи видят разные иконки, Apple считает конверсию (просмотр → установка) и показывает победителя.

Автоматизация настроена: Claude-сессия этого проекта делает всё сама — от упаковки иконок в билд до создания теста в App Store Connect и мониторинга результатов.

---

## Ограничения PPO

| Параметр | Значение |
|---|---|
| Вариантов за 1 тест | Максимум 3 (+ 1 текущая = 4 всего) |
| Длительность теста | До 90 дней (обычно 2–4 недели достаточно) |
| Одновременных тестов | 1 |
| Размер иконки | 1024×1024 px, PNG, без прозрачности |
| Минимум трафика | ~5 установок для начала данных, ~500+ для достоверности |

Если иконок больше 3 — запускаем тесты последовательно.

---

## Папка icons — структура

```
icons/
  ICON_TESTING.md          ← эта инструкция
  candidates/              ← все варианты (исходники 2048×2048 или 1024×1024)
    icon-v1.png
    icon-v2.png
    ...
  ready/                   ← подготовленные 1024×1024 для загрузки
    icon-base.png
    icon-a.png
    icon-b.png
    icon-c.png
  results/                 ← отчёты по завершённым тестам
    test-01-results.md
```

---

## Шаг 1 — Подготовить иконки

**Требования:**
- PNG, 1024×1024 px (2048×2048 Claude масштабирует сама)
- Без прозрачности, без скруглений (iOS сам скругляет)
- Без текста (плохо читается на 60×60)

**Как выбрать 3 из нескольких:**
1. Оставь максимально разные концепты — разная композиция, не просто цвет
2. Проверь читаемость на 60×60 px
3. Выбери те, что отличаются от конкурентов в категории
4. Один вариант — "сейфовый", похожий на текущую иконку

Положи файлы в `icons/candidates/`

---

## Шаг 2 — Запустить тест

Напиши в сессии проекта:

> "Запусти A/B тест иконок. Файлы в icons/candidates/"

Claude автоматически:
1. Масштабирует до 1024×1024
2. Пропишет в `app.json` как alternate icons
3. Запустит `eas build --platform ios --profile production`
4. Отправит в App Store через `eas submit`
5. Создаст PPO эксперимент через App Store Connect API
6. Настроит мониторинг — проверка каждые 3 дня

---

## Шаг 3 — Мониторинг

Claude проверяет API и докладывает:
- Конверсию каждого варианта
- Confidence level (нужно ≥ 90%)
- Статус: "Performing Better" / "Performing Worse" / "No Clear Result"

**Когда останавливать:**
- Confidence ≥ 90% → останавливаем, применяем победителя
- 4 недели, данных нет → мало трафика, продолжаем
- Все "No Clear Result" после 6 недель → иконки слишком похожи, нужны новые

---

## Шаг 4 — Применить победителя

Claude заменяет `icon.png`, убирает alternate icons из `app.json`, собирает новый билд, фиксирует результат в `icons/results/`.

---

## Технические детали

### Alternate icons в app.json (Expo)

```json
"ios": {
  "icon": "./assets/images/icon.png",
  "alternateIcons": {
    "iconA": { "image": "./assets/images/icons/icon-a.png" },
    "iconB": { "image": "./assets/images/icons/icon-b.png" },
    "iconC": { "image": "./assets/images/icons/icon-c.png" }
  }
}
```

### App Store Connect API

```bash
# Получить версии приложения
curl -H "Authorization: Bearer $JWT" \
  "https://api.appstoreconnect.apple.com/v1/apps/NOT FOUND/appStoreVersions?filter[appStoreState]=READY_FOR_SALE"

# Создать эксперимент
curl -X POST -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  "https://api.appstoreconnect.apple.com/v1/appStoreVersionExperiments" \
  -d '{
    "data": {
      "type": "appStoreVersionExperiments",
      "attributes": { "name": "Icon Test 01", "trafficProportion": 40 },
      "relationships": {
        "appStoreVersion": {
          "data": { "type": "appStoreVersions", "id": "VERSION_ID" }
        }
      }
    }
  }'
```

### Credentials

- App ID: `NOT FOUND`
- Bundle ID: `NOT FOUND`
- API Key: `/Users/evgenij/.appstoreconnect/private_keys/AuthKey_787835NFD8.p8`
- Key ID: `787835NFD8`
- Issuer ID: `2f01e90d-40ee-4f1d-9a37-651713378b40`
- SSH Mac: `ssh -p 2222 -i ~/.ssh/id_ed25519 evgenij@localhost`
- EAS: `EXPO_TOKEN` установлен в окружении Мака

---

## Чеклист перед запуском

- [ ] Иконки в `icons/candidates/`
- [ ] Выбрано 3 финальных варианта (максимально разные)
- [ ] Приложение опубликовано в App Store
- [ ] Нет активного PPO теста в App Store Connect
- [ ] EAS авторизован

---

## История тестов

| Тест | Дата | Варианты | Победитель | Прирост |
|------|------|----------|-----------|---------|
| — | — | — | — | — |
