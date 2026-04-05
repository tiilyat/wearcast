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
