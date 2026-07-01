import { Navigate, Outlet } from "react-router"

import { useSession } from "@/entities/session"

export function GuestRoute() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return null
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
