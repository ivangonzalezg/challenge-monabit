import { AreaChart, Area } from "recharts"

import { formatUsdCompact } from "@/shared/lib/format"
import type { TopAsset } from "../model/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui"

function AssetCell({ asset }: { asset: TopAsset }) {
  return (
    <div>
      <div className="text-sm font-semibold">{asset.name}</div>
      <div className="text-xs text-muted-foreground">
        {asset.symbol.toUpperCase()}
      </div>
    </div>
  )
}

function ChangeCell({ changePct24h }: { changePct24h: number | null }) {
  if (changePct24h === null || changePct24h === 0) {
    return <span className="text-muted-foreground">0%</span>
  }

  return (
    <span
      className={
        changePct24h > 0
          ? "font-medium text-emerald-600 dark:text-emerald-400"
          : "font-medium text-red-600 dark:text-red-400"
      }
    >
      {changePct24h > 0 ? "+" : ""}
      {changePct24h}%
    </span>
  )
}

function SparklineCell({ sparkline7d }: { sparkline7d: number[] | null }) {
  if (sparkline7d === null || sparkline7d.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const isUp = sparkline7d[sparkline7d.length - 1] >= sparkline7d[0]
  const data = sparkline7d.map((value, index) => ({ index, value }))
  const strokeColor = isUp ? "#059669" : "#dc2626"

  return (
    <AreaChart width={100} height={32} data={data}>
      <Area
        dataKey="value"
        type="natural"
        stroke={strokeColor}
        fill={strokeColor}
        fillOpacity={0.15}
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false}
      />
    </AreaChart>
  )
}

type TopCryptocurrenciesTableProps = {
  topAssets: TopAsset[]
}

export function TopCryptocurrenciesTable({
  topAssets,
}: TopCryptocurrenciesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 criptomonedas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Cambio 24h</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                Cap. de mercado
              </TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                Volumen (24h)
              </TableHead>
              <TableHead className="w-32 text-center">Tendencia 7d</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topAssets.map((asset, index) => (
              <TableRow key={asset.providerAssetId}>
                <TableCell className="text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <AssetCell asset={asset} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatUsdCompact(asset.currentPriceUsd)}
                </TableCell>
                <TableCell className="text-right">
                  <ChangeCell changePct24h={asset.priceChangePct24h} />
                </TableCell>
                <TableCell className="hidden text-right md:table-cell">
                  {formatUsdCompact(asset.marketCapUsd)}
                </TableCell>
                <TableCell className="hidden text-right lg:table-cell">
                  {formatUsdCompact(asset.totalVolumeUsd)}
                </TableCell>
                <TableCell className="w-32">
                  <SparklineCell sparkline7d={asset.sparkline7d} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
