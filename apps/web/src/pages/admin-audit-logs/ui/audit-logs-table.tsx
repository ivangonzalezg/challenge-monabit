import ReactTimeAgo from "react-time-ago"

import type { AuditLogActorOrTarget, AuditLogEntry } from "../model/types"
import {
  Badge,
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

const ACTION_LABEL: Record<AuditLogEntry["action"], string> = {
  USER_CREATED: "Usuario creado",
  USER_UPDATED: "Usuario actualizado",
  USER_DELETED: "Usuario eliminado",
}

const ACTION_VARIANT: Record<
  AuditLogEntry["action"],
  "default" | "destructive" | "secondary"
> = {
  USER_CREATED: "default",
  USER_UPDATED: "secondary",
  USER_DELETED: "destructive",
}

function PersonCell({
  person,
  fallback,
}: {
  person: AuditLogActorOrTarget
  fallback: string
}) {
  if (!person) {
    return <span className="text-muted-foreground">{fallback}</span>
  }

  return (
    <div>
      <div className="text-sm font-semibold">{person.name}</div>
      <div className="text-xs text-muted-foreground">{person.email}</div>
    </div>
  )
}

function DetailsCell({ metadata }: { metadata: unknown }) {
  if (metadata === null || metadata === undefined) {
    return <span className="text-muted-foreground">—</span>
  }

  const pretty = JSON.stringify(metadata, null, 2)
  const truncated = pretty.length > 40 ? `${pretty.slice(0, 40)}…` : pretty

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default font-mono text-xs text-muted-foreground">
          {truncated}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <pre className="max-w-xs whitespace-pre-wrap text-xs">{pretty}</pre>
      </TooltipContent>
    </Tooltip>
  )
}

type AuditLogsTableProps = {
  entries: AuditLogEntry[]
}

export function AuditLogsTable({ entries }: AuditLogsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Acción</TableHead>
          <TableHead>Realizado por</TableHead>
          <TableHead>Usuario afectado</TableHead>
          <TableHead>Detalles</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ReactTimeAgo
                      date={new Date(entry.createdAt)}
                      locale="es"
                      timeStyle="round"
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {new Date(entry.createdAt).toLocaleString("es")}
                </TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell>
              <Badge variant={ACTION_VARIANT[entry.action]}>
                {ACTION_LABEL[entry.action]}
              </Badge>
            </TableCell>
            <TableCell>
              <PersonCell person={entry.actor} fallback="Sistema" />
            </TableCell>
            <TableCell>
              <PersonCell person={entry.target} fallback="Usuario eliminado" />
            </TableCell>
            <TableCell>
              <DetailsCell metadata={entry.metadata} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
