import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { WeatherData } from '#/lib/schemas'

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
  rain: z.object({ '1h': z.number() }).optional(),
  snow: z.object({ '1h': z.number() }).optional(),
})

const UvResponse = z.object({
  value: z.number(),
})

export const getWeather = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ city: z.string().min(1) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY is not set')
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(data.city)}&units=metric&lang=ru&appid=${apiKey}`
    const weatherRes = await fetch(weatherUrl)

    if (weatherRes.status === 404) {
      throw new Error('Город не найден. Проверьте название.')
    }
    if (weatherRes.status === 401) {
      throw new Error('Ошибка сервера. Попробуйте позже.')
    }
    if (!weatherRes.ok) {
      throw new Error('Ошибка при получении погоды. Попробуйте позже.')
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
      description: parsed.weather[0]?.description ?? '',
      uvIndex,
      rain: !!parsed.rain,
      snow: !!parsed.snow,
    }

    return result
  })
