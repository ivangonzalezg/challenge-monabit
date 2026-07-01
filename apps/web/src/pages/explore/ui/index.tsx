import { Fragment, useEffect, useState } from "react"

import { AssetsTable, useFavoriteToggle } from "@/entities/crypto-asset"
import { useAssets } from "../model"
import type { AssetSortBy, PaginatedAsset } from "../model/types"
import { AssetControls } from "./asset-controls"
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
} from "@/shared/ui"

const PAGE_SIZE = 20

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}

function ExploreSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="font-medium">No se pudieron cargar las criptomonedas.</p>
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
        No se encontraron criptomonedas
      </p>
      <p className="text-sm">Intenta con otro nombre o símbolo.</p>
    </div>
  )
}

export function ExplorePage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<AssetSortBy>("marketCap")
  const debouncedSearch = useDebouncedValue(search, 350)

  const [resetKey, setResetKey] = useState({ search: debouncedSearch, sortBy })
  if (resetKey.search !== debouncedSearch || resetKey.sortBy !== sortBy) {
    setResetKey({ search: debouncedSearch, sortBy })
    setPage(1)
  }

  const queryParams = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    sortBy,
  }

  const { data, isPending, isError, refetch } = useAssets(queryParams)
  const favoriteToggle = useFavoriteToggle(["explore", "assets", queryParams])

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
        <h1 className="text-2xl font-semibold">Explorar criptomonedas</h1>
        <p className="text-muted-foreground">
          Busca y guarda criptomonedas de los activos sincronizados en
          MarketMint.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <AssetControls
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />
        </CardHeader>
        <CardContent>
          {isPending ? (
            <ExploreSkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : data.items.length === 0 ? (
            <EmptyState />
          ) : (
            <AssetsTable
              assets={data.items}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </CardContent>

        {data && data.totalPages > 1 ? (
          <CardFooter className="justify-center border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.max(1, p - 1))
                    }}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : undefined
                    }
                  />
                </PaginationItem>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === data.totalPages ||
                      Math.abs(p - page) <= 1
                  )
                  .map((p, index, arr) => (
                    <Fragment key={p}>
                      {index > 0 && p - arr[index - 1] > 1 ? (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : null}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(p)
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    </Fragment>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.min(data.totalPages, p + 1))
                    }}
                    className={
                      page === data.totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}
