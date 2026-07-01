export type AssetSortBy = "marketCap" | "price" | "change24h" | "volume24h"

export type PaginatedAsset = {
  providerAssetId: string
  symbol: string
  name: string
  currentPriceUsd: number
  priceChangePct24h: number | null
  marketCapUsd: number | null
  totalVolumeUsd: number | null
  isFavorite: boolean
}

export type PaginatedAssetsResponse = {
  items: PaginatedAsset[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
