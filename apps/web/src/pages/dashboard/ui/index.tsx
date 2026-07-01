import { Clock, Database } from "lucide-react"
import ReactTimeAgo from "react-time-ago"

import { useDashboard } from "../model"
import { NoDashboardDataError } from "../model/types"
import { Button, Card, CardContent, Skeleton } from "@/shared/ui"
import { KpiCards } from "./kpi-cards"
import { MarketTrendChart } from "./market-trend-chart"
import { TopCryptocurrenciesTable } from "./top-cryptocurrencies-table"

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="py-3">
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-75 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
        <p className="font-medium text-foreground">
          No hay datos de mercado disponibles todavía
        </p>
        <p className="text-sm">La sincronización aún no se ha ejecutado.</p>
      </CardContent>
    </Card>
  )
}

function UpdatedAt({ lastUpdatedAt }: { lastUpdatedAt: string | null }) {
  if (!lastUpdatedAt) {
    return <span>Actualizado —</span>
  }

  return (
    <span>
      Actualizado{" "}
      <ReactTimeAgo
        date={new Date(lastUpdatedAt)}
        locale="es"
        timeStyle="round"
      />
    </span>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="font-medium">
          No se pudieron cargar los datos del mercado.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { data, isPending, isError, error, refetch } = useDashboard()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Resumen del mercado</h1>
          <p className="text-muted-foreground">
            Consulta los últimos datos del mercado cripto en tu panel privado.
          </p>
        </div>
        {data ? (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="size-4" />
              <UpdatedAt lastUpdatedAt={data.lastUpdatedAt} />
            </div>
            <div className="flex items-center gap-1">
              <Database className="size-4" />
              <span>Fuente: {data.source}</span>
            </div>
          </div>
        ) : null}
      </div>

      {isPending ? (
        <DashboardSkeleton />
      ) : isError && error instanceof NoDashboardDataError ? (
        <EmptyState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <KpiCards kpis={data.kpis} />
          <div className="hidden">
            <MarketTrendChart marketTrend={data.marketTrend} />
          </div>
          <TopCryptocurrenciesTable topAssets={data.topAssets} />
        </>
      )}
    </div>
  )
}
