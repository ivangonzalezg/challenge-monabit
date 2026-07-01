import { Search } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button, Input } from "@/shared/ui"
import type { AssetSortBy } from "../model/types"

const SORT_ORDER: AssetSortBy[] = [
  "marketCap",
  "price",
  "change24h",
  "volume24h",
]

const sortLabels: Record<AssetSortBy, string> = {
  marketCap: "Market Cap",
  price: "Price",
  change24h: "24h Change",
  volume24h: "Volume 24h",
}

type AssetControlsProps = {
  search: string
  onSearchChange: (value: string) => void
  sortBy: AssetSortBy
  onSortByChange: (value: AssetSortBy) => void
}

export function AssetControls({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
}: AssetControlsProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="relative w-full md:w-96">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or symbol..."
          className="pl-9"
        />
      </div>
      <div className="flex w-full items-center gap-2 md:w-auto">
        <span className="hidden text-sm whitespace-nowrap text-muted-foreground sm:block">
          Sort by:
        </span>
        <div className="flex flex-1 rounded-lg border bg-muted/50 p-1 md:flex-none">
          {SORT_ORDER.map((option) => (
            <Button
              key={option}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSortByChange(option)}
              className={cn(
                "flex-1 rounded-md md:flex-none",
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
    </div>
  )
}
