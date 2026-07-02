import { Navigate, Outlet } from "react-router"

import { useSession } from "@/entities/session"

export function AdminRoute() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return null
  }

  if (!session || session.user.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
