import { createBrowserRouter } from "react-router"

import { DashboardLayout } from "@/widgets/dashboard-layout"
import { DashboardPage } from "@/pages/dashboard"
import { LoginPage } from "@/pages/login"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [{ index: true, element: <DashboardPage /> }],
  },
])
