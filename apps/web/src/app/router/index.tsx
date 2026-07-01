import { createBrowserRouter } from "react-router"

import { DashboardLayout } from "@/widgets/dashboard-layout"
import { GuestRoute } from "@/widgets/guest-route"
import { ProtectedRoute } from "@/widgets/protected-route"
import { DashboardPage } from "@/pages/dashboard"
import { EmailConfirmedPage } from "@/pages/email-confirmed"
import { ForgotPasswordPage } from "@/pages/forgot-password"
import { ForgotPasswordSuccessPage } from "@/pages/forgot-password-success"
import { LoginPage } from "@/pages/login"
import { RegisterPage } from "@/pages/register"
import { RegisterSuccessPage } from "@/pages/register-success"
import { ResetPasswordPage } from "@/pages/reset-password"

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
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
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/forgot-password/success",
        element: <ForgotPasswordSuccessPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
    ],
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
