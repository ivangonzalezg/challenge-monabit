export type KpiField = {
  value: number | null
  changePct24h: number | null
}

export type DashboardResponse = {
  source: string
  lastUpdatedAt: string | null
  kpis: {
    totalMarketCapUsd: KpiField
    totalVolumeUsd: KpiField
    btcDominancePct: { value: number | null }
    ethDominancePct: { value: number | null }
    usdtDominancePct: { value: number | null }
    activeCryptocurrencies: { value: number | null }
  }
  topAssets: TopAsset[]
  marketTrend: MarketTrendPoint[]
}

export type TopAsset = {
  providerAssetId: string
  symbol: string
  name: string
  marketCapRank: number | null
  currentPriceUsd: number
  priceChangePct24h: number | null
  marketCapUsd: number | null
  totalVolumeUsd: number | null
  sparkline7d: number[] | null
}

export type MarketTrendPoint = {
  date: string
  totalMarketCapUsd: number
  totalVolumeUsd: number
  btcDominancePct: number
  ethDominancePct: number
  usdtDominancePct: number
}

export class NoDashboardDataError extends Error {
  constructor() {
    super("No crypto data available yet")
    this.name = "NoDashboardDataError"
  }
}
