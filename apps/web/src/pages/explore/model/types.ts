export type { AssetSortBy, PaginatedAsset } from "@/entities/crypto-asset"

import type { PaginatedAsset } from "@/entities/crypto-asset"

export type PaginatedAssetsResponse = {
  items: PaginatedAsset[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
