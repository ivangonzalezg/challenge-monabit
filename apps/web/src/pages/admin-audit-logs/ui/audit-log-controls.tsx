import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui"
import type { AuditLogAction } from "../model/types"

const FILTER_OPTIONS: (AuditLogAction | "all")[] = [
  "all",
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DELETED",
]

const FILTER_LABELS: Record<AuditLogAction | "all", string> = {
  all: "Todas",
  USER_CREATED: "Creación",
  USER_UPDATED: "Actualización",
  USER_DELETED: "Eliminación",
}

type AuditLogControlsProps = {
  action: AuditLogAction | "all"
  onActionChange: (value: AuditLogAction | "all") => void
}

export function AuditLogControls({
  action,
  onActionChange,
}: AuditLogControlsProps) {
  return (
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <span className="hidden text-sm whitespace-nowrap text-muted-foreground sm:block">
        Filtrar por:
      </span>
      <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/50 p-1">
        {FILTER_OPTIONS.map((option) => (
          <Button
            key={option}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onActionChange(option)}
            className={cn(
              "rounded-md",
              action === option
                ? "bg-background font-medium text-primary shadow-sm hover:bg-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {FILTER_LABELS[option]}
          </Button>
        ))}
      </div>
    </div>
  )
}
