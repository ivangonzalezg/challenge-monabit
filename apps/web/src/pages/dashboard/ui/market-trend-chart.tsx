import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { formatPercent, formatUsdCompact } from "../lib/format"
import type { MarketTrendPoint } from "../model/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui"
import { cn } from "@/shared/lib/utils"

type ChartMetric = "marketCap" | "volume" | "btcDom" | "ethDom" | "usdtDom"

const METRIC_ORDER: ChartMetric[] = [
  "marketCap",
  "volume",
  "btcDom",
  "ethDom",
  "usdtDom",
]

const metricLabels: Record<ChartMetric, string> = {
  marketCap: "Market cap",
  volume: "Volume",
  btcDom: "BTC dom",
  ethDom: "ETH dom",
  usdtDom: "USDT dom",
}

const metricField: Record<ChartMetric, keyof MarketTrendPoint> = {
  marketCap: "totalMarketCapUsd",
  volume: "totalVolumeUsd",
  btcDom: "btcDominancePct",
  ethDom: "ethDominancePct",
  usdtDom: "usdtDominancePct",
}

const metricFormatters: Record<ChartMetric, (value: number) => string> = {
  marketCap: (v) => formatUsdCompact(v),
  volume: (v) => formatUsdCompact(v),
  btcDom: (v) => formatPercent(v),
  ethDom: (v) => formatPercent(v),
  usdtDom: (v) => formatPercent(v),
}

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type MarketTrendChartProps = {
  marketTrend: MarketTrendPoint[]
}

export function MarketTrendChart({ marketTrend }: MarketTrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>("marketCap")
  const formatValue = metricFormatters[activeMetric]
  const dataKey = metricField[activeMetric]

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Market trend</CardTitle>
        <div className="flex rounded-lg border bg-muted/50 p-1">
          {METRIC_ORDER.map((metric) => (
            <button
              key={metric}
              type="button"
              onClick={() => setActiveMetric(metric)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                metric === "usdtDom" && "hidden sm:block",
                activeMetric === metric
                  ? "bg-background font-medium text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {metricLabels[metric]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <AreaChart data={marketTrend}>
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatValue}
              width={64}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  formatter={(value) => formatValue(Number(value))}
                />
              }
            />
            <Area
              dataKey={dataKey}
              type="natural"
              fill="url(#fillValue)"
              stroke="var(--color-value)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
