import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Thermometer, Wind, Droplets, Sun } from 'lucide-react'
import type { WeatherData } from '#/lib/schemas'

export function WeatherCard({ weather }: { weather: WeatherData }) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardHeader>
        <CardTitle className="text-muted-foreground">
          Погода в {weather.city}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold">
            {weather.temp > 0 ? '+' : ''}
            {weather.temp}°
          </div>
          <div className="space-y-1 text-right text-sm text-muted-foreground">
            <div className="flex items-center justify-end gap-1">
              <Thermometer className="h-3 w-3" />
              Ощущается {weather.feelsLike > 0 ? '+' : ''}
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
