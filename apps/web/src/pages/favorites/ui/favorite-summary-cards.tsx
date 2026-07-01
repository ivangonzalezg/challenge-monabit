import { Minus, TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent } from "@/shared/ui"
import type { PaginatedAsset } from "../model/types"

function ChangeIndicator({ changePct }: { changePct: number | null }) {
  if (changePct === null || changePct === 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="size-3" /> 0%
      </span>
    )
  }

  const isPositive = changePct > 0

  return (
    <span
      className={
        isPositive
          ? "flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
          : "flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
      }
    >
      {isPositive ? (
        <TrendingUp className="size-3" />
      ) : (
        <TrendingDown className="size-3" />
      )}
      {isPositive ? "+" : ""}
      {changePct}%
    </span>
  )
}

function bestPerformer(assets: PaginatedAsset[]): PaginatedAsset | null {
  const withChange = assets.filter((a) => a.priceChangePct24h !== null)
  if (withChange.length === 0) return null
  return withChange.reduce((best, asset) =>
    (asset.priceChangePct24h as number) > (best.priceChangePct24h as number)
      ? asset
      : best
  )
}

function worstPerformer(assets: PaginatedAsset[]): PaginatedAsset | null {
  const withChange = assets.filter((a) => a.priceChangePct24h !== null)
  if (withChange.length === 0) return null
  return withChange.reduce((worst, asset) =>
    (asset.priceChangePct24h as number) < (worst.priceChangePct24h as number)
      ? asset
      : worst
  )
}

type FavoriteSummaryCardsProps = {
  assets: PaginatedAsset[]
}

export function FavoriteSummaryCards({ assets }: FavoriteSummaryCardsProps) {
  const best = bestPerformer(assets)
  const worst = worstPerformer(assets)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="justify-center py-3">
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Total de favoritos</p>
          <h3 className="text-lg font-semibold">{assets.length}</h3>
        </CardContent>
      </Card>
      <Card className="justify-center py-3">
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Mejor rendimiento</p>
          <h3 className="text-lg font-semibold">
            {best ? `${best.name} (${best.symbol.toUpperCase()})` : "—"}
          </h3>
          {best ? <ChangeIndicator changePct={best.priceChangePct24h} /> : null}
        </CardContent>
      </Card>
      <Card className="justify-center py-3">
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Peor rendimiento</p>
          <h3 className="text-lg font-semibold">
            {worst ? `${worst.name} (${worst.symbol.toUpperCase()})` : "—"}
          </h3>
          {worst ? (
            <ChangeIndicator changePct={worst.priceChangePct24h} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
