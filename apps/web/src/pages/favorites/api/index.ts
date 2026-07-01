import type { PaginatedAsset } from "../model/types"

const API_URL = import.meta.env.VITE_API_URL

export async function getFavorites(): Promise<{ items: PaginatedAsset[] }> {
  const res = await fetch(`${API_URL}/api/crypto/favorites`, {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Failed to load favorites")
  }

  return res.json()
}
