# WearCast — Design Spec

AI-помощник по подбору одежды на основе погоды и активности пользователя. Одностраничное мобилефёрст веб-приложение.

## Стек

- **Фреймворк**: TanStack Start (React)
- **UI**: shadcn/ui (дефолтная тема) + Tailwind CSS v4
- **AI SDK**: Vercel AI SDK + `@openrouter/ai-sdk-provider`
- **LLM**: `google/gemini-2.5-flash-preview` через OpenRouter
- **Structured output**: Zod-схемы через `generateObject()`
- **Погода**: OpenWeather Current Weather API
- **Язык**: TypeScript

## Пользовательский сценарий

1. Пользователь вводит город или нажимает кнопку геолокации (browser Geolocation API → reverse geocoding через OpenWeather)
2. Выбирает тип активности: 🚶 Пешком / 🚌 Транспорт / 🚗 Машина
3. Нажимает "Подобрать одежду"
4. Приложение показывает карточку погоды (мгновенно), затем рекомендацию по слоям (после ответа LLM)

## Архитектура

### Server functions (TanStack Start `createServerFn`)

Два отдельных server function:

**`getWeather(city: string)`** (`src/server/weather.ts`):
- `fetch` к `https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&lang=ru&appid={key}`
- Парсинг ответа через Zod-схему → `WeatherData`
- UV-индекс: отдельный запрос к `https://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={key}` (координаты из основного ответа)
- Ошибка 404 → выброс ошибки "Город не найден"

**`getOutfitRecommendation(weather: WeatherData, activity: ActivityType)`** (`src/server/outfit.ts`):
- Использует `generateObject()` из `ai` SDK
- Провайдер: `createOpenRouter` из `@openrouter/ai-sdk-provider`
- Модель: `google/gemini-2.5-flash-preview`
- Схема: `OutfitRecommendation` (Zod)
- Системный промпт (см. раздел ниже)

### Клиент вызывает последовательно

1. `getWeather(city)` → показывает карточку погоды
2. `getOutfitRecommendation(weather, activity)` → показывает рекомендацию

Преимущество: погоду видно сразу, пока LLM генерирует ответ. При смене активности погода не перезапрашивается.

## Типы данных

### `ActivityType`

```ts
const ActivityType = z.enum(["walking", "transit", "driving"])
type ActivityType = z.infer<typeof ActivityType>
```

### `WeatherData`

```ts
const WeatherData = z.object({
  city: z.string(),
  temp: z.number(),         // °C
  feelsLike: z.number(),    // °C
  humidity: z.number(),     // %
  windSpeed: z.number(),    // м/с
  description: z.string(),  // "облачно", "небольшой дождь"
  uvIndex: z.number(),
  rain: z.boolean(),
  snow: z.boolean(),
})
type WeatherData = z.infer<typeof WeatherData>
```

### `OutfitRecommendation`

```ts
const OutfitRecommendation = z.object({
  summary: z.string().describe("Краткое резюме погоды и что надеть — 1-2 предложения"),
  layers: z.array(z.object({
    type: z.enum(["base", "mid", "outer", "accessory"]),
    item: z.string().describe("Название предмета одежды"),
    reason: z.string().describe("Почему именно это — привязка к погоде"),
  })).describe("Рекомендуемые слои одежды"),
  warnings: z.array(z.string()).optional().describe("Предупреждения: солнцезащитный крем, зонт и т.д."),
})
type OutfitRecommendation = z.infer<typeof OutfitRecommendation>
```

## LLM промпт

```
Ты — стилист-метеоролог. Твоя задача — рекомендовать одежду на основе погоды и типа активности.

Правила:
- Учитывай ощущаемую температуру, а не фактическую
- Для пешей прогулки: максимальная защита от ветра, дождя, холода/жары
- Для транспорта: умеренная защита, человек частично на улице
- Для машины: минимальная верхняя одежда, фокус на комфорт при коротких переходах
- Если UV-индекс > 5: обязательно упомяни солнцезащиту
- Если скорость ветра > 10 м/с: упомяни ветрозащиту
- Если есть осадки: упомяни зонт или водонепроницаемую одежду
- Отвечай на русском языке
```

## UI Layout

Комбинированный вариант (mobile-first, single page):

### Структура экрана (сверху вниз)

1. **Заголовок**: "WearCast" + подзаголовок "Что надеть сегодня?"
2. **Поле ввода города** + кнопка геолокации (📍)
3. **Кнопки активности**: три toggle-кнопки в ряд (🚶 Пешком / 🚌 Транспорт / 🚗 Машина). Выбранная — с тёмной рамкой и фоном.
4. **Кнопка "Подобрать одежду"**: disabled пока город пуст или активность не выбрана
5. **Карточка погоды**: город, температура (крупно), ощущаемая, ветер, влажность
6. **Карточка рекомендации**: summary текст + список слоёв (название + тип слоя) + блок предупреждений (жёлтый)

### Компоненты (shadcn/ui)

- `Card` — карточки погоды и рекомендации
- `Button` — кнопка подбора, кнопка геолокации
- `Input` — поле ввода города
- `Skeleton` — загрузка карточек
- `Badge` — тип слоя (base/mid/outer/accessory)
- Иконки: `lucide-react`

### Состояния UI

| Состояние | Что видно |
|-----------|-----------|
| Пустое | Форма ввода, кнопки активности, "Подобрать" disabled |
| Загрузка погоды | Форма + Skeleton карточки погоды |
| Погода готова, LLM думает | Карточка погоды + Skeleton рекомендации |
| Результат | Карточка погоды + рекомендация + предупреждения |
| Ошибка | Красная карточка с сообщением + "Попробовать снова" |

### Анимации

- Карточки появляются с `rise-in` анимацией (translateY + opacity)

## Файловая структура

```
src/
  routes/
    index.tsx              — главная страница (единственный роут)
    __root.tsx             — shell (упрощённый, без Header/Footer)
  server/
    weather.ts             — getWeather server function
    outfit.ts              — getOutfitRecommendation server function
  lib/
    schemas.ts             — Zod-схемы (WeatherData, OutfitRecommendation, ActivityType)
  components/
    weather-card.tsx       — карточка погоды
    outfit-result.tsx      — список слоёв + предупреждения
    activity-select.tsx    — кнопки выбора активности
    city-input.tsx         — поле ввода + кнопка геолокации
```

### Удаляются

- `src/routes/about.tsx`
- `src/routes/demo/` (вся папка)
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/ThemeToggle.tsx`

## Обработка ошибок

- **Город не найден** (OpenWeather 404) → "Город не найден. Проверьте название."
- **API ключ невалидный** (401) → "Ошибка сервера. Попробуйте позже."
- **LLM таймаут / ошибка** → "Не удалось получить рекомендацию. Попробуйте ещё раз."
- **Геолокация отклонена** → ничего не делаем, поле ввода остаётся активным, пользователь вводит город вручную

## Переменные окружения

`.env.example`:
```
OPENROUTER_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
```

Ключи читаются из `process.env` в server functions. Никогда не передаются на клиент.

## Ограничения

- Без базы данных
- Без авторизации
- Без истории запросов
- Без кеширования
- Только TanStack Start — никаких Next.js/Remix
- Только AI SDK для LLM — никаких прямых fetch к OpenRouter
