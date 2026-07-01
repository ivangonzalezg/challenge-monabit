import { Minus, TrendingDown, TrendingUp } from "lucide-react"

import { formatPercent, formatUsdCompact } from "@/shared/lib/format"
import type { DashboardResponse } from "../model/types"
import { Card, CardContent } from "@/shared/ui"

function ChangeIndicator({ changePct }: { changePct: number | null }) {
  if (changePct === null || changePct === 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="size-3" /> 0%
      </span>
    )
  }

  const isPositive = changePct > 0

  return (
    <span
      className={
        isPositive
          ? "flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
          : "flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
      }
    >
      {isPositive ? (
        <TrendingUp className="size-3" />
      ) : (
        <TrendingDown className="size-3" />
      )}
      {isPositive ? "+" : ""}
      {changePct}%
    </span>
  )
}

type KpiCardsProps = {
  kpis: DashboardResponse["kpis"]
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const cards: { label: string; value: string; changePct?: number | null }[] = [
    {
      label: "Capitalización total",
      value: formatUsdCompact(kpis.totalMarketCapUsd.value),
      changePct: kpis.totalMarketCapUsd.changePct24h,
    },
    {
      label: "Volumen 24h",
      value: formatUsdCompact(kpis.totalVolumeUsd.value),
      changePct: kpis.totalVolumeUsd.changePct24h,
    },
    {
      label: "Dominancia BTC",
      value: formatPercent(kpis.btcDominancePct.value),
    },
    {
      label: "Dominancia ETH",
      value: formatPercent(kpis.ethDominancePct.value),
    },
    {
      label: "Dominancia USDT",
      value: formatPercent(kpis.usdtDominancePct.value),
    },
    {
      label: "Criptomonedas activas",
      value: kpis.activeCryptocurrencies.value?.toLocaleString() ?? "—",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((kpi) => (
        <Card key={kpi.label} className="justify-center py-3">
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <h3 className="text-lg font-semibold">{kpi.value}</h3>
            {kpi.changePct !== undefined ? (
              <ChangeIndicator changePct={kpi.changePct} />
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
