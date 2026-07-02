import { Fragment, useState } from "react"

import { useAuditLogs } from "../model"
import type { AuditLogAction } from "../model/types"
import { AuditLogControls } from "./audit-log-controls"
import { AuditLogsTable } from "./audit-logs-table"
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
} from "@/shared/ui"

const PAGE_SIZE = 20

function AuditLogsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="font-medium">No se pudieron cargar los registros de auditoría.</p>
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
      <p className="font-medium text-foreground">
        No hay registros de auditoría.
      </p>
    </div>
  )
}

export function AdminAuditLogsPage() {
  const [action, setAction] = useState<AuditLogAction | "all">("all")
  const [page, setPage] = useState(1)

  const [resetKey, setResetKey] = useState(action)
  if (resetKey !== action) {
    setResetKey(action)
    setPage(1)
  }

  const { data, isPending, isError, refetch } = useAuditLogs({
    page,
    pageSize: PAGE_SIZE,
    action,
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Registro de auditoría</h1>
        <p className="text-muted-foreground">
          Consulta las acciones administrativas realizadas sobre las cuentas de
          usuario.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <AuditLogControls action={action} onActionChange={setAction} />
        </CardHeader>
        <CardContent>
          {isPending ? (
            <AuditLogsSkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : data.items.length === 0 ? (
            <EmptyState />
          ) : (
            <AuditLogsTable entries={data.items} />
          )}
        </CardContent>

        {data && data.totalPages > 1 ? (
          <CardFooter className="justify-center border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.max(1, p - 1))
                    }}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : undefined
                    }
                  />
                </PaginationItem>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === data.totalPages ||
                      Math.abs(p - page) <= 1
                  )
                  .map((p, index, arr) => (
                    <Fragment key={p}>
                      {index > 0 && p - arr[index - 1] > 1 ? (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : null}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(p)
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    </Fragment>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.min(data.totalPages, p + 1))
                    }}
                    className={
                      page === data.totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}
