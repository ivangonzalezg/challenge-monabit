import { useQuery } from "@tanstack/react-query"

import { getAssets } from "../api"
import type { AssetSortBy } from "./types"

export function useAssets(params: {
  page: number
  pageSize: number
  search: string
  sortBy: AssetSortBy
}) {
  return useQuery({
    queryKey: ["explore", "assets", params],
    queryFn: () => getAssets(params),
    placeholderData: (previousData) => previousData,
  })
}
