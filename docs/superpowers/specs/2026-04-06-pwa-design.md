# PWA для WearCast — Дизайн-спецификация

## Цель

Превратить WearCast в устанавливаемое PWA с кэшированием UI-шелла и красивой офлайн-страницей. Без push-уведомлений, без офлайн-кэширования данных.

## Решения

- **Уровень офлайн-поддержки**: кэширование статических ресурсов (app shell), офлайн-страница при отсутствии сети. Функционал (погода, AI-рекомендации) требует сети.
- **Подход**: ручной Service Worker (без vite-plugin-pwa) — предсказуемость и совместимость с TanStack Start + Nitro SSR.
- **Стиль иконки**: вешалка + облако с каплями дождя на светлом фоне.
- **Push-уведомления**: не нужны.

## 1. Web App Manifest

Обновить `public/manifest.json`:

```json
{
  "name": "WearCast — Что надеть сегодня?",
  "short_name": "WearCast",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "logo192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "logo512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "logo180.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

### Мета-теги в `__root.tsx`

Добавить в `head()`:

- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#ffffff">`
- `<link rel="apple-touch-icon" href="/logo180.png">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`

## 2. Service Worker (`public/sw.js`)

### Стратегия кэширования

| Тип запроса                      | Стратегия     | Описание                          |
| -------------------------------- | ------------- | --------------------------------- |
| Навигация (HTML)                 | Network First | При ошибке сети — офлайн-страница |
| Статика (JS/CSS/изображения)     | Cache First   | Из кэша, fallback на сеть         |
| API (`/api/`, серверные функции) | Network Only  | Не кэшируются                     |

### Жизненный цикл

- **Install**: precache app shell — офлайн-страницу, иконки. `skipWaiting()`.
- **Activate**: удаление кэшей с устаревшей версией. `clients.claim()`.
- **Fetch**: маршрутизация по типу запроса (см. таблицу выше).

### Версионирование

Константа `CACHE_VERSION` (например `'v1'`). При обновлении — инкремент, старые кэши удаляются в обработчике `activate`.

### Регистрация

В `__root.tsx` добавить `<script>` в `<body>`:

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

## 3. Офлайн-страница (`public/offline.html`)

Статическая HTML-страница с inline-стилями (не зависит от внешних ресурсов). Содержит:

- Иконку приложения (inline SVG)
- Заголовок "Нет подключения к интернету"
- Подсказку "Проверьте соединение и попробуйте снова"
- Стилизация в духе основной темы приложения (белый фон, тёмный текст, Inter шрифт)

## 4. Иконки

Сгенерировать PNG-иконки в стиле «вешалка + облако с каплями» на светлом фоне:

- `public/logo192.png` (192×192) — manifest
- `public/logo512.png` (512×512) — manifest + splash screen
- `public/logo180.png` (180×180) — Apple Touch Icon
- `public/favicon.ico` — обновить

## Scope

### В скоупе

- Manifest с правильными метаданными
- Ручной Service Worker с кэшированием шелла
- Офлайн-страница
- Новые иконки
- Мета-теги для PWA в root layout

### Вне скоупа

- Push-уведомления
- Офлайн-кэширование данных (погода, рекомендации)
- Background sync
- Периодические обновления
