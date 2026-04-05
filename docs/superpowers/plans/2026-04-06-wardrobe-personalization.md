# Wardrobe Personalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Персонализировать рекомендации одежды — по умолчанию советовать только общедоступные вещи, а при наличии настроенного гардероба — строить рекомендации строго из вещей пользователя.

**Architecture:** Данные гардероба хранятся в localStorage и передаются как опциональный параметр `wardrobe` в серверную функцию `getOutfitRecommendation`. Промпт адаптируется: без гардероба — правила про общедоступную одежду, с гардеробом — секция со списком вещей пользователя. UI: кнопка «Мой гардероб» рядом с выбором активности открывает Sheet с чекбоксами по слоям.

**Tech Stack:** React 19, TanStack Start, Zod, shadcn/ui (Sheet, Accordion, Checkbox), localStorage, lucide-react

---

## File Structure

| File                                 | Action | Responsibility                                                 |
| ------------------------------------ | ------ | -------------------------------------------------------------- |
| `src/lib/schemas.ts`                 | Modify | Добавить схему `Wardrobe` и тип `LayerType`                    |
| `src/lib/wardrobe-items.ts`          | Create | Предустановленный список вещей по слоям (данные)               |
| `src/server/outfit.ts`               | Modify | Принять параметр `wardrobe`, адаптировать промпт               |
| `src/components/wardrobe-drawer.tsx` | Create | Drawer с чекбоксами для настройки гардероба                    |
| `src/routes/index.tsx`               | Modify | Состояние гардероба, кнопка открытия drawer, передача в запрос |

---

### Task 1: Добавить схему Wardrobe и данные вещей

**Files:**

- Modify: `src/lib/schemas.ts:1-4`
- Create: `src/lib/wardrobe-items.ts`

- [ ] **Step 1: Добавить LayerType и Wardrobe в schemas.ts**

В `src/lib/schemas.ts` добавить после строки 4 (`export type ActivityType = ...`):

```ts
export const LayerType = z.enum(['base', 'mid', 'outer', 'accessory'])
export type LayerType = z.infer<typeof LayerType>

export const Wardrobe = z.record(LayerType, z.array(z.string()))
export type Wardrobe = z.infer<typeof Wardrobe>
```

- [ ] **Step 2: Создать src/lib/wardrobe-items.ts**

```ts
import type { LayerType } from '#/lib/schemas'

export const WARDROBE_ITEMS: Record<LayerType, string[]> = {
  base: ['Футболка', 'Майка', 'Лонгслив', 'Термобельё', 'Рубашка', 'Поло'],
  mid: ['Свитер', 'Худи', 'Кардиган', 'Флиска', 'Жилетка'],
  outer: [
    'Куртка',
    'Пуховик',
    'Ветровка',
    'Пальто',
    'Дождевик',
    'Кожаная куртка',
    'Шуба',
  ],
  accessory: [
    'Шапка',
    'Шарф',
    'Перчатки',
    'Зонт',
    'Солнцезащитные очки',
    'Кепка/панама',
  ],
}

export const LAYER_LABELS: Record<LayerType, string> = {
  base: 'Базовый слой',
  mid: 'Средний слой',
  outer: 'Верхний слой',
  accessory: 'Аксессуары',
}
```

- [ ] **Step 3: Проверить что проект компилируется**

Run: `pnpm build 2>&1 | tail -5`
Expected: сборка завершается без ошибок

- [ ] **Step 4: Commit**

```bash
git add src/lib/schemas.ts src/lib/wardrobe-items.ts
git commit -m "feat: add Wardrobe schema and preset wardrobe items"
```

---

### Task 2: Адаптировать промпт в серверной функции

**Files:**

- Modify: `src/server/outfit.ts`

- [ ] **Step 1: Обновить системный промпт**

В `src/server/outfit.ts` заменить `SYSTEM_PROMPT` (строки 7-17):

```ts
const SYSTEM_PROMPT = `Ты — стилист-метеоролог. Твоя задача — рекомендовать одежду на основе погоды и типа активности.

Правила:
- Учитывай ощущаемую температуру, а не фактическую
- Для пешей прогулки: максимальная защита от ветра, дождя, холода/жары
- Для транспорта: умеренная защита, человек частично на улице
- Для машины: минимальная верхняя одежда, фокус на комфорт при коротких переходах
- Если UV-индекс > 5: обязательно упомяни солнцезащиту
- Если скорость ветра > 10 м/с: упомяни ветрозащиту
- Если есть осадки: упомяни зонт или водонепроницаемую одежду
- Рекомендуй только общедоступную, повседневную одежду: футболки, рубашки, свитера, джинсы, куртки, кроссовки и т.п.
- Не предлагай специализированную одежду (термобельё, мембранные куртки, горнолыжное снаряжение), если это не экстремальные условия
- Если погода требует специализированной защиты — объясни это в warnings, но основная рекомендация должна быть из обычных вещей
- Отвечай на русском языке`
```

- [ ] **Step 2: Добавить параметр wardrobe и адаптировать формирование промпта**

Обновить импорт в строке 5:

```ts
import {
  OutfitRecommendation,
  WeatherData,
  ActivityType,
  Wardrobe,
} from '#/lib/schemas'
```

Заменить `inputValidator` и `handler` (строки 25-59):

```ts
export const getOutfitRecommendation = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      weather: WeatherData,
      activity: ActivityType,
      wardrobe: Wardrobe.optional(),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set')
    }

    const openrouter = createOpenRouter({ apiKey })

    let wardrobeSection = ''
    if (
      data.wardrobe &&
      Object.values(data.wardrobe).some((items) => items.length > 0)
    ) {
      const lines = Object.entries(data.wardrobe)
        .filter(([, items]) => items.length > 0)
        .map(([layer, items]) => {
          const label =
            layer === 'base'
              ? 'Базовый слой'
              : layer === 'mid'
                ? 'Средний слой'
                : layer === 'outer'
                  ? 'Верхний слой'
                  : 'Аксессуары'
          return `${label}: ${items.join(', ')}`
        })
        .join('\n')
      wardrobeSection = `\n\nГардероб пользователя:\n${lines}\n\nРекомендуй только из этих вещей. Если чего-то критичного не хватает — укажи в warnings.`
    }

    const { output } = await generateText({
      model: openrouter('google/gemini-2.5-flash'),
      output: Output.object({ schema: OutfitRecommendation }),
      system: SYSTEM_PROMPT,
      prompt: `Погода в городе ${data.weather.city}:
- Температура: ${data.weather.temp}°C
- Ощущается как: ${data.weather.feelsLike}°C
- Описание: ${data.weather.description}
- Ветер: ${data.weather.windSpeed} м/с
- Влажность: ${data.weather.humidity}%
- UV-индекс: ${data.weather.uvIndex}
- Дождь: ${data.weather.rain ? 'да' : 'нет'}
- Снег: ${data.weather.snow ? 'да' : 'нет'}

Тип активности: ${activityLabels[data.activity]}${wardrobeSection}

Дай рекомендацию по одежде.`,
    })

    if (!output) {
      throw new Error('Не удалось получить рекомендацию. Попробуйте ещё раз.')
    }

    return output
  })
```

- [ ] **Step 3: Проверить что проект компилируется**

Run: `pnpm build 2>&1 | tail -5`
Expected: сборка завершается без ошибок

- [ ] **Step 4: Commit**

```bash
git add src/server/outfit.ts
git commit -m "feat: adapt outfit prompt for wardrobe personalization"
```

---

### Task 3: Установить shadcn/ui компоненты

**Files:**

- Create: `src/components/ui/sheet.tsx` (через shadcn CLI)
- Create: `src/components/ui/accordion.tsx` (через shadcn CLI)
- Create: `src/components/ui/checkbox.tsx` (через shadcn CLI)

- [ ] **Step 1: Установить Sheet, Accordion и Checkbox**

Run: `npx shadcn@latest add sheet accordion checkbox -y`
Expected: три компонента добавлены в `src/components/ui/`

- [ ] **Step 2: Проверить что файлы созданы**

Run: `ls src/components/ui/sheet.tsx src/components/ui/accordion.tsx src/components/ui/checkbox.tsx`
Expected: все три файла существуют

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/sheet.tsx src/components/ui/accordion.tsx src/components/ui/checkbox.tsx
git commit -m "feat: add shadcn sheet, accordion, checkbox components"
```

---

### Task 4: Создать компонент WardrobeDrawer

**Files:**

- Create: `src/components/wardrobe-drawer.tsx`

- [ ] **Step 1: Создать компонент wardrobe-drawer.tsx**

```tsx
import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { WARDROBE_ITEMS, LAYER_LABELS } from '#/lib/wardrobe-items'
import type { LayerType, Wardrobe } from '#/lib/schemas'

const STORAGE_KEY = 'wearcast-wardrobe'
const LAYER_ORDER: LayerType[] = ['base', 'mid', 'outer', 'accessory']

export function readWardrobe(): Wardrobe | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const hasItems = Object.values(parsed).some(
      (items) => Array.isArray(items) && items.length > 0,
    )
    return hasItems ? parsed : null
  } catch {
    return null
  }
}

function saveWardrobe(wardrobe: Wardrobe) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wardrobe))
}

function clearWardrobe() {
  localStorage.removeItem(STORAGE_KEY)
}

export function WardrobeDrawer({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (wardrobe: Wardrobe | null) => void
}) {
  const [selected, setSelected] = useState<Wardrobe>({
    base: [],
    mid: [],
    outer: [],
    accessory: [],
  })

  useEffect(() => {
    if (open) {
      const saved = readWardrobe()
      setSelected(saved ?? { base: [], mid: [], outer: [], accessory: [] })
    }
  }, [open])

  function toggleItem(layer: LayerType, item: string) {
    setSelected((prev) => {
      const items = prev[layer] ?? []
      const next = items.includes(item)
        ? items.filter((i) => i !== item)
        : [...items, item]
      return { ...prev, [layer]: next }
    })
  }

  function handleSave() {
    const hasItems = Object.values(selected).some((items) => items.length > 0)
    if (hasItems) {
      saveWardrobe(selected)
      onSave(selected)
    } else {
      clearWardrobe()
      onSave(null)
    }
    onOpenChange(false)
  }

  function handleReset() {
    clearWardrobe()
    setSelected({ base: [], mid: [], outer: [], accessory: [] })
    onSave(null)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Мой гардероб</SheetTitle>
          <SheetDescription>
            Отметьте вещи, которые у вас есть — рекомендации будут точнее
          </SheetDescription>
        </SheetHeader>

        <Accordion type="multiple" defaultValue={LAYER_ORDER} className="mt-4">
          {LAYER_ORDER.map((layer) => (
            <AccordionItem key={layer} value={layer}>
              <AccordionTrigger>{LAYER_LABELS[layer]}</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2">
                  {WARDROBE_ITEMS[layer].map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selected[layer]?.includes(item) ?? false}
                        onCheckedChange={() => toggleItem(layer, item)}
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex gap-2 mt-4 pb-4">
          <Button onClick={handleSave} className="flex-1">
            Сохранить
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Сбросить
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Проверить что проект компилируется**

Run: `pnpm build 2>&1 | tail -5`
Expected: сборка завершается без ошибок

- [ ] **Step 3: Commit**

```bash
git add src/components/wardrobe-drawer.tsx
git commit -m "feat: add WardrobeDrawer component"
```

---

### Task 5: Интегрировать гардероб в главную страницу

**Files:**

- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Добавить импорты**

В `src/routes/index.tsx` добавить в блок импортов:

```ts
import { Shirt } from 'lucide-react'
import { WardrobeDrawer, readWardrobe } from '#/components/wardrobe-drawer'
import type { Wardrobe } from '#/lib/schemas'
```

- [ ] **Step 2: Добавить состояние гардероба**

В функции `HomePage()`, после строки `const [error, setError] = useState<string | null>(null)` (строка 34), добавить:

```ts
const [wardrobe, setWardrobe] = useState<Wardrobe | null>(null)
const [drawerOpen, setDrawerOpen] = useState(false)

useEffect(() => {
  setWardrobe(readWardrobe())
}, [])
```

- [ ] **Step 3: Передать wardrobe в запрос рекомендации**

Заменить вызов `getOutfitRecommendation` (строки 57-59):

```ts
const outfit = await getOutfitRecommendation({
  data: { weather: weatherData, activity, wardrobe: wardrobe ?? undefined },
})
```

- [ ] **Step 4: Добавить кнопку и drawer в JSX**

После `<ActivitySelect ... />` (строка 91) добавить:

```tsx
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setDrawerOpen(true)}
          disabled={loadingWeather || loadingOutfit}
        >
          <Shirt className="mr-2 h-4 w-4" />
          Мой гардероб
          {wardrobe && (
            <span className="ml-auto rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
              {Object.values(wardrobe).flat().length}
            </span>
          )}
        </Button>
      </div>

      <WardrobeDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={setWardrobe}
      />
```

- [ ] **Step 5: Проверить что проект компилируется и dev-сервер работает**

Run: `pnpm build 2>&1 | tail -5`
Expected: сборка завершается без ошибок

- [ ] **Step 6: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat: integrate wardrobe into main page"
```

---

### Task 6: Ручное тестирование

- [ ] **Step 1: Запустить dev-сервер**

Run: `pnpm dev`

- [ ] **Step 2: Проверить базовый сценарий (без гардероба)**

1. Открыть http://localhost:3000
2. Ввести город, выбрать активность, нажать «Подобрать одежду»
3. Убедиться что рекомендации содержат только обычную одежду (без термобелья, мембранных курток и т.п.)

- [ ] **Step 3: Проверить сценарий с гардеробом**

1. Нажать «Мой гардероб»
2. Отметить несколько вещей в разных категориях
3. Нажать «Сохранить»
4. Нажать «Подобрать одежду»
5. Убедиться что рекомендации используют только отмеченные вещи

- [ ] **Step 4: Проверить сброс гардероба**

1. Нажать «Мой гардероб»
2. Нажать «Сбросить»
3. Запросить рекомендацию — должен вернуться к базовому поведению

- [ ] **Step 5: Проверить persistence**

1. Настроить гардероб
2. Перезагрузить страницу
3. Открыть drawer — выбранные вещи должны сохраниться
4. Бейдж с количеством вещей должен отображаться на кнопке
