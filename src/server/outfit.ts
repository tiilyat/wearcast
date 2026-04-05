import { createServerFn } from "@tanstack/react-start"
import { generateText, Output } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { z } from "zod"
import { OutfitRecommendation, WeatherData, ActivityType, Wardrobe } from "#/lib/schemas"
import { LAYER_LABELS } from "#/lib/wardrobe-items"

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

const activityLabels: Record<ActivityType, string> = {
  walking: "пешая прогулка",
  transit: "поездка на общественном транспорте",
  driving: "поездка на машине",
}

export const getOutfitRecommendation = createServerFn({ method: "POST" })
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
      throw new Error("OPENROUTER_API_KEY is not set")
    }

    const openrouter = createOpenRouter({ apiKey })

    let wardrobeSection = ""
    if (data.wardrobe && Object.values(data.wardrobe).some((items) => items.length > 0)) {
      const lines = Object.entries(data.wardrobe)
        .filter(([, items]) => items.length > 0)
        .map(([layer, items]) => {
          const label = LAYER_LABELS[layer as keyof typeof LAYER_LABELS] ?? layer
          return `${label}: ${items.join(", ")}`
        })
        .join("\n")
      wardrobeSection = `\n\nГардероб пользователя:\n${lines}\n\nРекомендуй только из этих вещей. Если чего-то критичного не хватает — укажи в warnings.`
    }

    const { output } = await generateText({
      model: openrouter("google/gemini-2.5-flash"),
      output: Output.object({ schema: OutfitRecommendation }),
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

Тип активности: ${activityLabels[data.activity]}${wardrobeSection}

Дай рекомендацию по одежде.`,
    })

    if (!output) {
      throw new Error("Не удалось получить рекомендацию. Попробуйте ещё раз.")
    }

    return output
  })
