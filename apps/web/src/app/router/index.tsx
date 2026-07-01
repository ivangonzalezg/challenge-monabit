import { createBrowserRouter } from "react-router"

import { DashboardLayout } from "@/widgets/dashboard-layout"
import { ProtectedRoute } from "@/widgets/protected-route"
import { DashboardPage } from "@/pages/dashboard"
import { EmailConfirmedPage } from "@/pages/email-confirmed"
import { LoginPage } from "@/pages/login"
import { RegisterPage } from "@/pages/register"
import { RegisterSuccessPage } from "@/pages/register-success"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/register/success",
    element: <RegisterSuccessPage />,
  },
  {
    path: "/email-confirmed",
    element: <EmailConfirmedPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [{ index: true, element: <DashboardPage /> }],
      },
    ],
  },
])
