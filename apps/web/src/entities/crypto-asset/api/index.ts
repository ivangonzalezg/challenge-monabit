const API_URL = import.meta.env.VITE_API_URL

export async function addFavorite(params: {
  providerAssetId: string
  symbol: string
  name: string
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/crypto/favorites`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error("Failed to add favorite")
  }
}

export async function removeFavorite(providerAssetId: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/crypto/favorites/${encodeURIComponent(providerAssetId)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )

  if (!res.ok) {
    throw new Error("Failed to remove favorite")
  }
}
