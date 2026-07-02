import { RefreshCw } from "lucide-react"

import { useSyncStats, useTriggerSync } from "../model"
import { Button, Card, CardContent } from "@/shared/ui"
import { SyncStatCards, SyncStatCardsSkeleton } from "./sync-stat-cards"
import { SyncRunsTable, SyncRunsTableSkeleton } from "./sync-runs-table"

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="font-medium">
          No se pudieron cargar las estadísticas de sincronización.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      </CardContent>
    </Card>
  )
}

export function AdminCryptoSyncPage() {
  const { data, isPending, isError, refetch } = useSyncStats()
  const triggerSync = useTriggerSync()

  const isSyncRunning =
    triggerSync.isPending || data?.lastRun?.status === "running"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold">
            Sincronización de criptomonedas
          </h1>
          <p className="text-muted-foreground">
            Consulta el estado de la base de datos de criptomonedas y fuerza una
            sincronización manual con CoinGecko.
          </p>
        </div>
        <Button onClick={() => triggerSync.mutate()} disabled={isSyncRunning}>
          <RefreshCw
            className={isSyncRunning ? "size-4 animate-spin" : "size-4"}
          />
          Sincronizar ahora
        </Button>
      </div>

      {isPending ? (
        <>
          <SyncStatCardsSkeleton />
          <SyncRunsTableSkeleton />
        </>
      ) : isError || !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <SyncStatCards
            totalRegisters={data.totalRegisters}
            activeCount={data.activeCount}
            lastRun={data.lastRun}
          />
          <SyncRunsTable runs={data.recentRuns} />
        </>
      )}
    </div>
  )
}
