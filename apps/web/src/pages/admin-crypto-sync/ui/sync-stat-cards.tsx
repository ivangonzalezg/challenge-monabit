import ReactTimeAgo from "react-time-ago"

import type { SyncRun } from "../model/types"
import { Badge, Card, CardContent, Skeleton } from "@/shared/ui"

const STATUS_LABEL: Record<SyncRun["status"], string> = {
  success: "Exitosa",
  failed: "Fallida",
  running: "En curso",
}

const STATUS_VARIANT: Record<SyncRun["status"], "default" | "destructive" | "secondary"> = {
  success: "default",
  failed: "destructive",
  running: "secondary",
}

function LastSyncedCard({ lastRun }: { lastRun: SyncRun | null }) {
  return (
    <Card className="justify-center py-3">
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Última sincronización</p>
        {lastRun ? (
          <>
            <h3 className="text-lg font-semibold">
              <ReactTimeAgo
                date={new Date(lastRun.finishedAt ?? lastRun.startedAt)}
                locale="es"
                timeStyle="round"
              />
            </h3>
            <Badge variant={STATUS_VARIANT[lastRun.status]}>
              {STATUS_LABEL[lastRun.status]}
            </Badge>
          </>
        ) : (
          <h3 className="text-lg font-semibold text-muted-foreground">
            Nunca sincronizado
          </h3>
        )}
      </CardContent>
    </Card>
  )
}

type SyncStatCardsProps = {
  totalRegisters: number
  activeCount: number
  lastRun: SyncRun | null
}

export function SyncStatCards({
  totalRegisters,
  activeCount,
  lastRun,
}: SyncStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="justify-center py-3">
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Total de registros</p>
          <h3 className="text-lg font-semibold">
            {totalRegisters.toLocaleString()}
          </h3>
        </CardContent>
      </Card>
      <Card className="justify-center py-3">
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Criptomonedas activas
          </p>
          <h3 className="text-lg font-semibold">
            {activeCount.toLocaleString()}
          </h3>
        </CardContent>
      </Card>
      <LastSyncedCard lastRun={lastRun} />
    </div>
  )
}

export function SyncStatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="py-3">
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
