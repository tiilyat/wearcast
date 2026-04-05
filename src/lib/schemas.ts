import { z } from 'zod'

export const ActivityType = z.enum(['walking', 'transit', 'driving'])
export type ActivityType = z.infer<typeof ActivityType>

export const LayerType = z.enum(['base', 'mid', 'outer', 'accessory'])
export type LayerType = z.infer<typeof LayerType>

export const Wardrobe = z.record(LayerType, z.array(z.string()))
export type Wardrobe = z.infer<typeof Wardrobe>

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
  summary: z
    .string()
    .describe('Краткое резюме погоды и что надеть — 1-2 предложения'),
  layers: z
    .array(
      z.object({
        type: z.enum(['base', 'mid', 'outer', 'accessory']),
        item: z.string().describe('Название предмета одежды'),
        reason: z.string().describe('Почему именно это — привязка к погоде'),
      }),
    )
    .describe('Рекомендуемые слои одежды'),
  warnings: z
    .array(z.string())
    .optional()
    .describe('Предупреждения: солнцезащитный крем, зонт и т.д.'),
})
export type OutfitRecommendation = z.infer<typeof OutfitRecommendation>
