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
import { Wardrobe } from '#/lib/schemas'
import type { LayerType } from '#/lib/schemas'

const STORAGE_KEY = 'wearcast-wardrobe'
const LAYER_ORDER: LayerType[] = ['base', 'mid', 'outer', 'accessory']

export function readWardrobe(): Wardrobe | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const result = Wardrobe.safeParse(JSON.parse(raw))
    if (!result.success) return null
    const hasItems = Object.values(result.data).some(
      (items) => items.length > 0,
    )
    return hasItems ? result.data : null
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
      const items = prev[layer]
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
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto px-6">
        <SheetHeader className="px-0">
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
                        checked={selected[layer].includes(item)}
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
