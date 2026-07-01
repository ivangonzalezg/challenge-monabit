import { useQuery } from "@tanstack/react-query"

import { getDashboard } from "../api"

export function useDashboard() {
  return useQuery({
    queryKey: ["crypto-market", "dashboard"],
    queryFn: getDashboard,
  })
}

export {
  NoDashboardDataError,
  type DashboardResponse,
  type KpiField,
  type TopAsset,
  type MarketTrendPoint,
} from "./types"
