import { Button } from '@/components/ui/button'
import { Footprints, Bus, Car } from 'lucide-react'
import type { ActivityType } from '#/lib/schemas'

const activities: {
  value: ActivityType
  label: string
  icon: typeof Footprints
}[] = [
  { value: 'walking', label: 'Пешком', icon: Footprints },
  { value: 'transit', label: 'Транспорт', icon: Bus },
  { value: 'driving', label: 'Машина', icon: Car },
]

export function ActivitySelect({
  value,
  onChange,
  disabled,
}: {
  value: ActivityType | null
  onChange: (value: ActivityType) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {activities.map((activity) => {
        const Icon = activity.icon
        const isSelected = value === activity.value
        return (
          <Button
            key={activity.value}
            variant={isSelected ? 'default' : 'outline'}
            className="flex flex-col gap-1 h-auto py-3"
            onClick={() => onChange(activity.value)}
            disabled={disabled}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{activity.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
