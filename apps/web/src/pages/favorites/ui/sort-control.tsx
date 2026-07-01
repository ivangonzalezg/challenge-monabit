import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui"
import type { AssetSortBy } from "../model/types"

const SORT_ORDER: AssetSortBy[] = [
  "marketCap",
  "price",
  "change24h",
  "volume24h",
]

const sortLabels: Record<AssetSortBy, string> = {
  marketCap: "Cap. de mercado",
  price: "Precio",
  change24h: "Cambio 24h",
  volume24h: "Volumen 24h",
}

type SortControlProps = {
  sortBy: AssetSortBy
  onSortByChange: (value: AssetSortBy) => void
}

export function SortControl({ sortBy, onSortByChange }: SortControlProps) {
  return (
    <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center">
      <span className="hidden text-sm whitespace-nowrap text-muted-foreground sm:block">
        Ordenar por:
      </span>
      <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/50 p-1">
        {SORT_ORDER.map((option) => (
          <Button
            key={option}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSortByChange(option)}
            className={cn(
              "rounded-md",
              sortBy === option
                ? "bg-background font-medium text-primary shadow-sm hover:bg-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {sortLabels[option]}
          </Button>
        ))}
      </div>
    </div>
  )
}
