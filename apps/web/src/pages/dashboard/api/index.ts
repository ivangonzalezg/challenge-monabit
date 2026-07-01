import { NoDashboardDataError, type DashboardResponse } from "../model/types"

export async function getDashboard(): Promise<DashboardResponse> {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/crypto/dashboard`,
    {
      credentials: "include",
    }
  )

  if (res.status === 503) {
    throw new NoDashboardDataError()
  }

  if (!res.ok) {
    throw new Error("Failed to load dashboard")
  }

  return res.json()
}
