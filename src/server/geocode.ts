import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const reverseGeocode = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ lat: z.number(), lon: z.number() }))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY is not set')
    }

    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${data.lat}&lon=${data.lon}&limit=1&appid=${apiKey}`,
    )

    if (!res.ok) {
      throw new Error('Не удалось определить город')
    }

    const results = await res.json()
    if (!Array.isArray(results) || results.length === 0) {
      throw new Error('Не удалось определить город')
    }

    return (results[0].local_names?.ru ?? results[0].name) as string
  })
