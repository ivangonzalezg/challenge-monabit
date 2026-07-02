export type SyncRunStatus = "running" | "success" | "failed"
export type SyncTrigger = "scheduled" | "manual"

export type SyncRun = {
  id: string
  provider: string
  trigger: SyncTrigger
  status: SyncRunStatus
  startedAt: string
  finishedAt: string | null
  assetsRequested: number | null
  assetsUpdated: number | null
  kpisUpdated: boolean | null
  errorMessage: string | null
  createdAt: string
}

export type SyncStats = {
  totalRegisters: number
  activeCount: number
  lastRun: SyncRun | null
  recentRuns: SyncRun[]
}
