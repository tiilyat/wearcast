## Project Overview

WearCast — веб-приложение для рекомендации одежды по погоде. Стек: React 19, TanStack Start (Router + Query), Tailwind CSS 4, Vite, Nitro, AI SDK + OpenRouter.

## Architecture

- `src/routes/` — страницы приложения (file-based routing через TanStack Router)
- `src/server/` — серверные функции (`createServerFn`): weather API, outfit AI, geocode
- `src/components/` — React-компоненты приложения
- `src/components/ui/` — UI-примитивы shadcn/ui (стиль new-york)
- `src/integrations/` — провайдеры и обёртки (TanStack Query)
- `src/lib/` — Zod-схемы (`schemas.ts`), утилиты
- `src/routes/__root.tsx` — корневой layout

## Build & Run

```bash
pnpm install
pnpm dev        # dev-сервер на порту 3000
pnpm build      # продакшн-сборка
pnpm preview    # предпросмотр продакшн-билда
```

## Testing

```bash
pnpm test       # запуск всех тестов (vitest)
```

Тестовых файлов в проекте пока нет. Тест-раннер: Vitest + jsdom + Testing Library.

## Linting & Formatting

```bash
pnpm lint       # ESLint (конфиг @tanstack/eslint-config)
pnpm format     # Prettier --check
pnpm check      # Prettier --write + ESLint --fix
```

## Environment

Файл `.env` (шаблон: `.env.example`). Обязательные переменные:

- `OPENROUTER_API_KEY` — ключ OpenRouter для AI-рекомендаций
- `OPENWEATHER_API_KEY` — ключ OpenWeatherMap для данных о погоде

## Key Conventions

- Серверные функции создаются через `createServerFn` из `@tanstack/react-start` в `src/server/`
- Импорт внутри проекта: `#/` — алиас на `src/` (настроен в package.json `imports`). Для shadcn/ui компонентов используется `@/` (настроен в tsconfig)
- Zod-схемы для валидации данных и типизации — единый источник типов в `src/lib/schemas.ts`
- UI-компоненты: shadcn/ui (new-york стиль, lucide иконки). Добавлять через `npx shadcn@latest add <component>`
- Язык интерфейса: русский
