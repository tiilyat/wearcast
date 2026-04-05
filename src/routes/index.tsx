import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, AlertCircle } from 'lucide-react'
import { CityInput } from '#/components/city-input'
import { ActivitySelect } from '#/components/activity-select'
import { WeatherCard } from '#/components/weather-card'
import { OutfitResult } from '#/components/outfit-result'
import { getWeather } from '#/server/weather'
import { getOutfitRecommendation } from '#/server/outfit'
import type {
  ActivityType,
  WeatherData,
  OutfitRecommendation,
} from '#/lib/schemas'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const [city, setCity] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('wearcast-city')
    if (saved) setCity(saved)
  }, [])
  const [activity, setActivity] = useState<ActivityType>('walking')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [recommendation, setRecommendation] =
    useState<OutfitRecommendation | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [loadingOutfit, setLoadingOutfit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    city &&
    city.trim().length > 0 &&
    !loadingWeather &&
    !loadingOutfit

  async function handleSubmit() {
    if (!canSubmit) return

    setError(null)
    setWeather(null)
    setRecommendation(null)
    setLoadingWeather(true)

    try {
      localStorage.setItem('wearcast-city', city.trim())
      const weatherData = await getWeather({ data: { city: city.trim() } })
      setWeather(weatherData)
      setLoadingWeather(false)

      setLoadingOutfit(true)
      const outfit = await getOutfitRecommendation({
        data: { weather: weatherData, activity },
      })
      setRecommendation(outfit)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка. Попробуйте ещё раз.',
      )
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
        value={city ?? ''}
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
            {loadingWeather ? 'Получаю погоду...' : 'Подбираю одежду...'}
          </>
        ) : (
          'Подобрать одежду'
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
