import { useMemo, useState } from "react"

import { AssetsTable, useFavoriteToggle } from "@/entities/crypto-asset"
import { useFavorites } from "../model"
import type { AssetSortBy, PaginatedAsset } from "../model/types"
import { FavoriteSummaryCards } from "./favorite-summary-cards"
import { SortControl } from "./sort-control"
import { Button, Card, CardContent, CardHeader, Skeleton } from "@/shared/ui"

const FAVORITES_QUERY_KEY = ["favorites", "list"] as const

const sortField: Record<AssetSortBy, keyof PaginatedAsset> = {
  marketCap: "marketCapUsd",
  price: "currentPriceUsd",
  change24h: "priceChangePct24h",
  volume24h: "totalVolumeUsd",
}

function sortAssets(
  assets: PaginatedAsset[],
  sortBy: AssetSortBy
): PaginatedAsset[] {
  const field = sortField[sortBy]
  return [...assets].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]
    if (aValue === null && bValue === null) return 0
    if (aValue === null) return 1
    if (bValue === null) return -1
    return Number(bValue) - Number(aValue)
  })
}

function FavoritesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="font-medium">No se pudieron cargar tus favoritos.</p>
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
      <p className="font-medium text-foreground">
        No tienes criptomonedas favoritas todavía
      </p>
      <p className="text-sm">
        Agrega criptomonedas desde la pantalla de Explorar para verlas aquí.
      </p>
    </div>
  )
}

export function FavoritesPage() {
  const [sortBy, setSortBy] = useState<AssetSortBy>("marketCap")
  const { data, isPending, isError, refetch } = useFavorites()
  const favoriteToggle = useFavoriteToggle(FAVORITES_QUERY_KEY)

  const sortedAssets = useMemo(
    () => (data ? sortAssets(data.items, sortBy) : []),
    [data, sortBy]
  )

  const handleToggleFavorite = (asset: PaginatedAsset) => {
    favoriteToggle.mutate({
      providerAssetId: asset.providerAssetId,
      symbol: asset.symbol,
      name: asset.name,
      isFavorite: asset.isFavorite,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Favoritos</h1>
        <p className="text-muted-foreground">
          Sigue el rendimiento de las criptomonedas que has marcado como
          favoritas.
        </p>
      </div>

      {isPending ? (
        <FavoritesSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <FavoriteSummaryCards assets={data.items} />

          <Card>
            <CardHeader className="border-b">
              <SortControl sortBy={sortBy} onSortByChange={setSortBy} />
            </CardHeader>
            <CardContent>
              <AssetsTable
                assets={sortedAssets}
                onToggleFavorite={handleToggleFavorite}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
