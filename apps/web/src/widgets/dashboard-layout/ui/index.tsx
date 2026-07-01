import { Outlet } from "react-router"

export function DashboardLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b p-4 text-sm font-medium">MarketMint</header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
