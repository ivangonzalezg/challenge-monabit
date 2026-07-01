import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { addFavorite, getAssets, removeFavorite } from "../api"
import type { AssetSortBy, PaginatedAssetsResponse } from "./types"

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

export function useFavoriteToggle(queryKey: readonly unknown[]) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      providerAssetId: string
      symbol: string
      name: string
      isFavorite: boolean
    }) => {
      if (params.isFavorite) {
        await removeFavorite(params.providerAssetId)
      } else {
        await addFavorite(params)
      }
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey })
      const previous =
        queryClient.getQueryData<PaginatedAssetsResponse>(queryKey)

      queryClient.setQueryData<PaginatedAssetsResponse | undefined>(
        queryKey,
        (current) => {
          if (!current) return current
          return {
            ...current,
            items: current.items.map((item) =>
              item.providerAssetId === params.providerAssetId
                ? { ...item, isFavorite: !params.isFavorite }
                : item
            ),
          }
        }
      )

      return { previous }
    },
    onError: (_error, _params, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
