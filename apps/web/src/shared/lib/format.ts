export function formatUsdCompact(value: number | null): string {
  if (value === null) return "—"
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—"
  return `${value.toFixed(1)}%`
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
