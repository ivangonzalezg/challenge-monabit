import { useQuery } from "@tanstack/react-query"

import { getFavorites } from "../api"

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites", "list"],
    queryFn: getFavorites,
  })
}
