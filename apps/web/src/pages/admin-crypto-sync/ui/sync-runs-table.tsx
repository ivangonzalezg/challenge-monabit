import ReactTimeAgo from "react-time-ago"

import type { SyncRun } from "../model/types"
import {
  Badge,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui"

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

const TRIGGER_LABEL: Record<SyncRun["trigger"], string> = {
  manual: "Manual",
  scheduled: "Programada",
}

function ErrorCell({ errorMessage }: { errorMessage: string | null }) {
  if (!errorMessage) {
    return <span className="text-muted-foreground">—</span>
  }

  const truncated =
    errorMessage.length > 40 ? `${errorMessage.slice(0, 40)}…` : errorMessage

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default text-red-600 dark:text-red-400">
          {truncated}
        </span>
      </TooltipTrigger>
      <TooltipContent>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}

type SyncRunsTableProps = {
  runs: SyncRun[]
}

export function SyncRunsTable({ runs }: SyncRunsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de sincronizaciones</CardTitle>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Todavía no hay sincronizaciones registradas.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead className="text-right">Activos actualizados</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>{TRIGGER_LABEL[run.trigger]}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[run.status]}>
                      {STATUS_LABEL[run.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ReactTimeAgo
                      date={new Date(run.startedAt)}
                      locale="es"
                      timeStyle="round"
                    />
                  </TableCell>
                  <TableCell>
                    {run.finishedAt ? (
                      <ReactTimeAgo
                        date={new Date(run.finishedAt)}
                        locale="es"
                        timeStyle="round"
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {run.assetsUpdated ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ErrorCell errorMessage={run.errorMessage} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export function SyncRunsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de sincronizaciones</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
