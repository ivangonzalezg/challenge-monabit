import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { SyncRun, SyncStats } from "./types"

const API_URL = import.meta.env.VITE_API_URL

const SYNC_STATS_QUERY_KEY = ["admin", "crypto-sync", "stats"]

async function fetchSyncStats(): Promise<SyncStats> {
  const res = await fetch(`${API_URL}/api/crypto/sync/stats`, {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Failed to load sync stats")
  }

  return res.json()
}

export function useSyncStats() {
  return useQuery({
    queryKey: SYNC_STATS_QUERY_KEY,
    queryFn: fetchSyncStats,
    refetchOnWindowFocus: false,
  })
}

async function triggerSync(): Promise<{ run: SyncRun }> {
  const res = await fetch(`${API_URL}/api/crypto/sync`, {
    method: "POST",
    credentials: "include",
  })

  if (res.status === 409) {
    throw new Error("CONFLICT")
  }

  if (!res.ok) {
    throw new Error("Failed to trigger sync")
  }

  return res.json()
}

export function useTriggerSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: triggerSync,
    onSuccess: ({ run }) => {
      queryClient.invalidateQueries({ queryKey: SYNC_STATS_QUERY_KEY })
      toast.success(
        `Sincronización completada — ${run.assetsUpdated ?? 0} activos actualizados.`
      )
    },
    onError: (error: Error) => {
      if (error.message === "CONFLICT") {
        toast.error("Ya hay una sincronización en curso.")
        return
      }
      toast.error("No se pudo completar la sincronización. Intenta de nuevo.")
    },
  })
}
