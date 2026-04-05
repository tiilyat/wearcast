import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { reverseGeocode } from '#/server/geocode'

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
    if (!('geolocation' in navigator)) return
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
          if (e.key === 'Enter' && !disabled) onSubmit()
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
