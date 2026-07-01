import { Star } from "lucide-react"

import { formatUsdCompact } from "@/shared/lib/format"
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui"
import type { PaginatedAsset } from "../model/types"

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

type AssetsTableProps = {
  assets: PaginatedAsset[]
  onToggleFavorite: (asset: PaginatedAsset) => void
}

export function AssetsTable({ assets, onToggleFavorite }: AssetsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Activo</TableHead>
          <TableHead className="text-right">Precio</TableHead>
          <TableHead className="text-right">Cambio 24h</TableHead>
          <TableHead className="text-right">Cap. de mercado</TableHead>
          <TableHead className="text-right">Volumen (24h)</TableHead>
          <TableHead className="w-16 text-center">Fav.</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={asset.providerAssetId}>
            <TableCell>
              <div>
                <div className="text-sm font-semibold">{asset.name}</div>
                <div className="text-xs text-muted-foreground">
                  {asset.symbol.toUpperCase()}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatUsdCompact(asset.currentPriceUsd)}
            </TableCell>
            <TableCell className="text-right">
              <ChangeCell changePct24h={asset.priceChangePct24h} />
            </TableCell>
            <TableCell className="text-right">
              {formatUsdCompact(asset.marketCapUsd)}
            </TableCell>
            <TableCell className="text-right">
              {formatUsdCompact(asset.totalVolumeUsd)}
            </TableCell>
            <TableCell className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(asset)}
                aria-label={
                  asset.isFavorite
                    ? "Quitar de favoritos"
                    : "Agregar a favoritos"
                }
                className="text-muted-foreground hover:text-emerald-600"
              >
                <Star
                  className={
                    asset.isFavorite
                      ? "size-4 fill-emerald-600 text-emerald-600"
                      : "size-4"
                  }
                />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
