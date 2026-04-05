# WearCast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page mobile-first app that recommends clothing based on weather and activity type.

**Architecture:** Two TanStack Start server functions (weather + LLM recommendation) called sequentially from a single-page React UI. Weather card shows immediately while LLM generates outfit recommendation. shadcn/ui with default theme for all components.

**Tech Stack:** TanStack Start, shadcn/ui, Tailwind CSS v4, Vercel AI SDK + @openrouter/ai-sdk-provider, OpenWeather API, Zod, TypeScript

---

### Task 1: Clean up template files and simplify shell

**Files:**
- Delete: `src/routes/about.tsx`
- Delete: `src/routes/demo/tanstack-query.tsx`
- Delete: `src/components/Header.tsx`
- Delete: `src/components/Footer.tsx`
- Delete: `src/components/ThemeToggle.tsx`
- Modify: `src/routes/__root.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Delete unused files**

```bash
rm src/routes/about.tsx
rm -rf src/routes/demo
rm src/components/Header.tsx
rm src/components/Footer.tsx
rm src/components/ThemeToggle.tsx
```

- [ ] **Step 2: Simplify `__root.tsx`**

Replace the entire file with a minimal shell — no Header, no Footer, no ThemeToggle, updated meta title:

```tsx
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'WearCast — Что надеть сегодня?' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Replace `src/styles.css` with minimal Tailwind v4 setup**

Replace the entire file:

```css
@import "tailwindcss";
```

All the custom CSS variables, theme code, animations, island-shell styles — delete them. shadcn/ui will bring its own design tokens.

- [ ] **Step 4: Verify the app starts**

```bash
pnpm dev
```

Expected: app starts on port 3000, shows a blank page (index.tsx still has old content but no errors from missing imports).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove template files, simplify shell for WearCast"
```

---

### Task 2: Set up shadcn/ui

**Files:**
- Create: `src/lib/utils.ts`
- Create: `components.json`
- Modify: `package.json` (new deps)
- Modify: `src/styles.css`
- Modify: `tsconfig.json`

- [ ] **Step 1: Install shadcn/ui dependencies**

```bash
pnpm add class-variance-authority clsx tailwind-merge
```

- [ ] **Step 2: Create `src/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Create `components.json`** in project root

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 4: Initialize shadcn/ui CSS variables**

Update `src/styles.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar-background: var(--sidebar-background);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar-background: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 5: Add shadcn/ui components**

```bash
pnpm dlx shadcn@latest add button card input skeleton badge
```

If the CLI asks questions, accept defaults. Verify files created in `src/components/ui/`.

- [ ] **Step 6: Verify the app starts with shadcn/ui**

```bash
pnpm dev
```

Expected: app starts, no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: set up shadcn/ui with default theme"
```

---

### Task 3: Create Zod schemas and `.env.example`

**Files:**
- Create: `src/lib/schemas.ts`
- Create: `.env.example`

- [ ] **Step 1: Create `src/lib/schemas.ts`**

```ts
import { z } from "zod"

export const ActivityType = z.enum(["walking", "transit", "driving"])
export type ActivityType = z.infer<typeof ActivityType>

export const WeatherData = z.object({
  city: z.string(),
  temp: z.number(),
  feelsLike: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  description: z.string(),
  uvIndex: z.number(),
  rain: z.boolean(),
  snow: z.boolean(),
})
export type WeatherData = z.infer<typeof WeatherData>

export const OutfitRecommendation = z.object({
  summary: z.string().describe("Краткое резюме погоды и что надеть — 1-2 предложения"),
  layers: z
    .array(
      z.object({
        type: z.enum(["base", "mid", "outer", "accessory"]),
        item: z.string().describe("Название предмета одежды"),
        reason: z.string().describe("Почему именно это — привязка к погоде"),
      }),
    )
    .describe("Рекомендуемые слои одежды"),
  warnings: z
    .array(z.string())
    .optional()
    .describe("Предупреждения: солнцезащитный крем, зонт и т.д."),
})
export type OutfitRecommendation = z.infer<typeof OutfitRecommendation>
```

- [ ] **Step 2: Create `.env.example`**

```
OPENROUTER_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
```

- [ ] **Step 3: Add `.env` to `.gitignore`**

Append to `.gitignore`:

```
.env
.env.local
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/schemas.ts .env.example .gitignore
git commit -m "feat: add Zod schemas and env example"
```

---

### Task 4: Implement `getWeather` server function

**Files:**
- Create: `src/server/weather.ts`

- [ ] **Step 1: Create `src/server/weather.ts`**

```ts
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { WeatherData } from "#/lib/schemas"

const OpenWeatherResponse = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    humidity: z.number(),
  }),
  wind: z.object({
    speed: z.number(),
  }),
  weather: z.array(
    z.object({
      description: z.string(),
    }),
  ),
  coord: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  rain: z.object({ "1h": z.number() }).optional(),
  snow: z.object({ "1h": z.number() }).optional(),
})

const UvResponse = z.object({
  value: z.number(),
})

export const getWeather = createServerFn({ method: "GET" })
  .validator(z.object({ city: z.string().min(1) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      throw new Error("OPENWEATHER_API_KEY is not set")
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(data.city)}&units=metric&lang=ru&appid=${apiKey}`
    const weatherRes = await fetch(weatherUrl)

    if (weatherRes.status === 404) {
      throw new Error("Город не найден. Проверьте название.")
    }
    if (weatherRes.status === 401) {
      throw new Error("Ошибка сервера. Попробуйте позже.")
    }
    if (!weatherRes.ok) {
      throw new Error("Ошибка при получении погоды. Попробуйте позже.")
    }

    const raw = await weatherRes.json()
    const parsed = OpenWeatherResponse.parse(raw)

    let uvIndex = 0
    try {
      const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${parsed.coord.lat}&lon=${parsed.coord.lon}&appid=${apiKey}`
      const uvRes = await fetch(uvUrl)
      if (uvRes.ok) {
        const uvRaw = await uvRes.json()
        const uvParsed = UvResponse.parse(uvRaw)
        uvIndex = uvParsed.value
      }
    } catch {
      // UV index is non-critical, default to 0
    }

    const result: WeatherData = {
      city: parsed.name,
      temp: Math.round(parsed.main.temp),
      feelsLike: Math.round(parsed.main.feels_like),
      humidity: parsed.main.humidity,
      windSpeed: Math.round(parsed.wind.speed),
      description: parsed.weather[0]?.description ?? "",
      uvIndex,
      rain: !!parsed.rain,
      snow: !!parsed.snow,
    }

    return result
  })
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors (or only pre-existing ones unrelated to this file).

- [ ] **Step 3: Commit**

```bash
git add src/server/weather.ts
git commit -m "feat: add getWeather server function"
```

---

### Task 5: Implement `getOutfitRecommendation` server function

**Files:**
- Create: `src/server/outfit.ts`

- [ ] **Step 1: Create `src/server/outfit.ts`**

```ts
import { createServerFn } from "@tanstack/react-start"
import { generateObject } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { z } from "zod"
import { OutfitRecommendation, WeatherData, ActivityType } from "#/lib/schemas"

const SYSTEM_PROMPT = `Ты — стилист-метеоролог. Твоя задача — рекомендовать одежду на основе погоды и типа активности.

Правила:
- Учитывай ощущаемую температуру, а не фактическую
- Для пешей прогулки: максимальная защита от ветра, дождя, холода/жары
- Для транспорта: умеренная защита, человек частично на улице
- Для машины: минимальная верхняя одежда, фокус на комфорт при коротких переходах
- Если UV-индекс > 5: обязательно упомяни солнцезащиту
- Если скорость ветра > 10 м/с: упомяни ветрозащиту
- Если есть осадки: упомяни зонт или водонепроницаемую одежду
- Отвечай на русском языке`

const activityLabels: Record<ActivityType, string> = {
  walking: "пешая прогулка",
  transit: "поездка на общественном транспорте",
  driving: "поездка на машине",
}

export const getOutfitRecommendation = createServerFn({ method: "POST" })
  .validator(z.object({ weather: WeatherData, activity: ActivityType }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set")
    }

    const openrouter = createOpenRouter({ apiKey })

    const { object } = await generateObject({
      model: openrouter("google/gemini-2.5-flash-preview"),
      schema: OutfitRecommendation,
      system: SYSTEM_PROMPT,
      prompt: `Погода в городе ${data.weather.city}:
- Температура: ${data.weather.temp}°C
- Ощущается как: ${data.weather.feelsLike}°C
- Описание: ${data.weather.description}
- Ветер: ${data.weather.windSpeed} м/с
- Влажность: ${data.weather.humidity}%
- UV-индекс: ${data.weather.uvIndex}
- Дождь: ${data.weather.rain ? "да" : "нет"}
- Снег: ${data.weather.snow ? "да" : "нет"}

Тип активности: ${activityLabels[data.activity]}

Дай рекомендацию по одежде.`,
    })

    return object
  })
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/server/outfit.ts
git commit -m "feat: add getOutfitRecommendation server function"
```

---

### Task 6: Build UI components

**Files:**
- Create: `src/components/city-input.tsx`
- Create: `src/components/activity-select.tsx`
- Create: `src/components/weather-card.tsx`
- Create: `src/components/outfit-result.tsx`

- [ ] **Step 1: Create `src/components/city-input.tsx`**

```tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"
import { useState } from "react"

export function CityInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}) {
  const [locating, setLocating] = useState(false)

  function handleGeolocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=placeholder`,
          )
          if (res.ok) {
            const data = await res.json()
            if (data[0]?.local_names?.ru) {
              onChange(data[0].local_names.ru)
            } else if (data[0]?.name) {
              onChange(data[0].name)
            }
          }
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocating(false)
      },
    )
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Введите город..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) onSubmit()
        }}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleGeolocation}
        disabled={disabled || locating}
        aria-label="Определить местоположение"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
```

**Note:** The geolocation reverse geocoding uses the OpenWeather Geocoding API. The API key will need to be passed through a server function for security. However, for the initial implementation, we'll handle this in Task 7 when wiring everything together — the geolocation fetch here is a placeholder that will be replaced with a server function call.

- [ ] **Step 2: Create `src/components/activity-select.tsx`**

```tsx
import { Button } from "@/components/ui/button"
import { Footprints, Bus, Car } from "lucide-react"
import type { ActivityType } from "#/lib/schemas"

const activities: { value: ActivityType; label: string; icon: typeof Footprints }[] = [
  { value: "walking", label: "Пешком", icon: Footprints },
  { value: "transit", label: "Транспорт", icon: Bus },
  { value: "driving", label: "Машина", icon: Car },
]

export function ActivitySelect({
  value,
  onChange,
  disabled,
}: {
  value: ActivityType | null
  onChange: (value: ActivityType) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {activities.map((activity) => {
        const Icon = activity.icon
        const isSelected = value === activity.value
        return (
          <Button
            key={activity.value}
            variant={isSelected ? "default" : "outline"}
            className="flex flex-col gap-1 h-auto py-3"
            onClick={() => onChange(activity.value)}
            disabled={disabled}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{activity.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/weather-card.tsx`**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Wind, Droplets, Sun } from "lucide-react"
import type { WeatherData } from "#/lib/schemas"

export function WeatherCard({ weather }: { weather: WeatherData }) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Погода в {weather.city}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold">
            {weather.temp > 0 ? "+" : ""}
            {weather.temp}°
          </div>
          <div className="space-y-1 text-right text-sm text-muted-foreground">
            <div className="flex items-center justify-end gap-1">
              <Thermometer className="h-3 w-3" />
              Ощущается {weather.feelsLike > 0 ? "+" : ""}
              {weather.feelsLike}°
            </div>
            <div className="flex items-center justify-end gap-1">
              <Wind className="h-3 w-3" />
              {weather.windSpeed} м/с
            </div>
            <div className="flex items-center justify-end gap-1">
              <Droplets className="h-3 w-3" />
              {weather.humidity}%
            </div>
            {weather.uvIndex > 0 && (
              <div className="flex items-center justify-end gap-1">
                <Sun className="h-3 w-3" />
                UV {weather.uvIndex}
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm capitalize text-muted-foreground">
          {weather.description}
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Create `src/components/outfit-result.tsx`**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { OutfitRecommendation } from "#/lib/schemas"

const layerLabels: Record<string, string> = {
  base: "Базовый слой",
  mid: "Средний слой",
  outer: "Верхний слой",
  accessory: "Аксессуар",
}

export function OutfitResult({ recommendation }: { recommendation: OutfitRecommendation }) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Рекомендация
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{recommendation.summary}</p>

        <div className="space-y-2">
          {recommendation.layers.map((layer, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg bg-muted p-3"
            >
              <Badge variant={layer.type === "outer" ? "default" : "secondary"} className="text-xs shrink-0">
                {layerLabels[layer.type]}
              </Badge>
              <div className="min-w-0">
                <div className="text-sm font-medium">{layer.item}</div>
                <div className="text-xs text-muted-foreground">{layer.reason}</div>
              </div>
            </div>
          ))}
        </div>

        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950">
            {recommendation.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/city-input.tsx src/components/activity-select.tsx src/components/weather-card.tsx src/components/outfit-result.tsx
git commit -m "feat: add WearCast UI components"
```

---

### Task 7: Wire up the main page

**Files:**
- Modify: `src/routes/index.tsx`
- Modify: `src/components/city-input.tsx` (fix geolocation to use server function)
- Create: `src/server/geocode.ts`

- [ ] **Step 1: Create `src/server/geocode.ts`** for secure reverse geocoding

```ts
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

export const reverseGeocode = createServerFn({ method: "GET" })
  .validator(z.object({ lat: z.number(), lon: z.number() }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      throw new Error("OPENWEATHER_API_KEY is not set")
    }

    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${data.lat}&lon=${data.lon}&limit=1&appid=${apiKey}`,
    )

    if (!res.ok) {
      throw new Error("Не удалось определить город")
    }

    const results = await res.json()
    if (!Array.isArray(results) || results.length === 0) {
      throw new Error("Не удалось определить город")
    }

    return (results[0].local_names?.ru as string) ?? (results[0].name as string)
  })
```

- [ ] **Step 2: Update `src/components/city-input.tsx`** to use the server function

Replace the entire file:

```tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"
import { useState } from "react"
import { reverseGeocode } from "#/server/geocode"

export function CityInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}) {
  const [locating, setLocating] = useState(false)

  function handleGeolocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await reverseGeocode({
            data: {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            },
          })
          onChange(city)
        } catch {
          // Geolocation failed silently — user can type manually
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocating(false)
      },
    )
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Введите город..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) onSubmit()
        }}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleGeolocation}
        disabled={disabled || locating}
        aria-label="Определить местоположение"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Rewrite `src/routes/index.tsx`**

Replace the entire file:

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, AlertCircle } from "lucide-react"
import { CityInput } from "#/components/city-input"
import { ActivitySelect } from "#/components/activity-select"
import { WeatherCard } from "#/components/weather-card"
import { OutfitResult } from "#/components/outfit-result"
import { getWeather } from "#/server/weather"
import { getOutfitRecommendation } from "#/server/outfit"
import type { ActivityType, WeatherData, OutfitRecommendation } from "#/lib/schemas"

export const Route = createFileRoute("/")({ component: HomePage })

function HomePage() {
  const [city, setCity] = useState("")
  const [activity, setActivity] = useState<ActivityType | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [loadingOutfit, setLoadingOutfit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = city.trim().length > 0 && activity !== null && !loadingWeather && !loadingOutfit

  async function handleSubmit() {
    if (!canSubmit || !activity) return

    setError(null)
    setWeather(null)
    setRecommendation(null)
    setLoadingWeather(true)

    try {
      const weatherData = await getWeather({ data: { city: city.trim() } })
      setWeather(weatherData)
      setLoadingWeather(false)

      setLoadingOutfit(true)
      const outfit = await getOutfitRecommendation({
        data: { weather: weatherData, activity },
      })
      setRecommendation(outfit)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка. Попробуйте ещё раз.")
    } finally {
      setLoadingWeather(false)
      setLoadingOutfit(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">WearCast</h1>
        <p className="text-sm text-muted-foreground">Что надеть сегодня?</p>
      </div>

      <CityInput
        value={city}
        onChange={setCity}
        onSubmit={handleSubmit}
        disabled={loadingWeather || loadingOutfit}
      />

      <ActivitySelect
        value={activity}
        onChange={setActivity}
        disabled={loadingWeather || loadingOutfit}
      />

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full"
        size="lg"
      >
        {loadingWeather || loadingOutfit ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingWeather ? "Получаю погоду..." : "Подбираю одежду..."}
          </>
        ) : (
          "Подобрать одежду"
        )}
      </Button>

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-start gap-2 pt-4">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
            <div className="space-y-2">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={handleSubmit}>
                Попробовать снова
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loadingWeather && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      )}

      {weather && <WeatherCard weather={weather} />}

      {loadingOutfit && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      )}

      {recommendation && <OutfitResult recommendation={recommendation} />}
    </main>
  )
}
```

- [ ] **Step 4: Verify the app starts and renders**

```bash
pnpm dev
```

Expected: app shows the WearCast UI — title, city input, activity buttons, disabled submit button. No errors in console.

- [ ] **Step 5: Commit**

```bash
git add src/routes/index.tsx src/server/geocode.ts src/components/city-input.tsx
git commit -m "feat: wire up main page with all components and server functions"
```

---

### Task 8: End-to-end manual test

**Files:** None (testing only)

- [ ] **Step 1: Create `.env` file with real API keys**

Copy `.env.example` to `.env` and fill in real API keys:

```bash
cp .env.example .env
```

Then edit `.env` with your actual `OPENROUTER_API_KEY` and `OPENWEATHER_API_KEY`.

- [ ] **Step 2: Start the app and test the happy path**

```bash
pnpm dev
```

Open `http://localhost:3000`. Test:
1. Type "Москва" in city input
2. Select "Пешком" activity
3. Click "Подобрать одежду"
4. Verify: weather card appears first, then outfit recommendation loads
5. Verify: layers show with badge labels, warnings section appears if applicable

- [ ] **Step 3: Test error states**

1. Type a non-existent city (e.g., "asdfqwer") → should show "Город не найден" error
2. Click "Попробовать снова" → should retry

- [ ] **Step 4: Test geolocation**

1. Click the 📍 button → browser asks for location permission
2. If allowed → city field fills in automatically
3. If denied → nothing happens, input stays active

- [ ] **Step 5: Test mobile viewport**

Open browser DevTools, switch to mobile viewport (375px). Verify:
1. All elements fit on screen
2. Activity buttons are readable
3. Cards don't overflow

- [ ] **Step 6: Fix any issues found during testing**

If any issues are found, fix them and commit:

```bash
git add -A
git commit -m "fix: address issues found during manual testing"
```
