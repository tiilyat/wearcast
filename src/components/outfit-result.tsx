import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { OutfitRecommendation } from "#/lib/schemas"

const layerLabels: Record<string, string> = {
  base: "Базовый слой",
  mid: "Средний слой",
  outer: "Верхний слой",
  accessory: "Аксессуар",
}

export function OutfitResult({ recommendation }: { recommendation: OutfitRecommendation }) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Рекомендация
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{recommendation.summary}</p>

        <div className="space-y-2">
          {recommendation.layers.map((layer, i) => (
            <div
              key={i}
              className="rounded-lg bg-muted p-3 space-y-1"
            >
              <Badge variant={layer.type === "outer" ? "default" : "secondary"} className="text-xs">
                {layerLabels[layer.type]}
              </Badge>
              <div className="text-sm font-medium">{layer.item}</div>
              <div className="text-xs text-muted-foreground">{layer.reason}</div>
            </div>
          ))}
        </div>

        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950">
            {recommendation.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
