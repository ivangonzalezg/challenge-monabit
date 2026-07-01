import type { AssetSortBy, PaginatedAssetsResponse } from "../model/types"

const API_URL = import.meta.env.VITE_API_URL

export async function getAssets(params: {
  page: number
  pageSize: number
  search?: string
  sortBy: AssetSortBy
}): Promise<PaginatedAssetsResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
  })
  if (params.search) {
    query.set("search", params.search)
  }

  const res = await fetch(`${API_URL}/api/crypto/assets?${query.toString()}`, {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Failed to load assets")
  }

  return res.json()
}
