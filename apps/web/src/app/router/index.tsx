import { createBrowserRouter } from "react-router"

import { DashboardLayout } from "@/widgets/dashboard-layout"
import { GuestRoute } from "@/widgets/guest-route"
import { ProtectedRoute } from "@/widgets/protected-route"
import { AdminAuditLogsPage } from "@/pages/admin-audit-logs"
import { AdminCryptoSyncPage } from "@/pages/admin-crypto-sync"
import { AdminUsersPage } from "@/pages/admin-users"
import { DashboardPage } from "@/pages/dashboard"
import { EmailConfirmedPage } from "@/pages/email-confirmed"
import { ExplorePage } from "@/pages/explore"
import { FavoritesPage } from "@/pages/favorites"
import { ForgotPasswordPage } from "@/pages/forgot-password"
import { ForgotPasswordSuccessPage } from "@/pages/forgot-password-success"
import { LoginPage } from "@/pages/login"
import { ProfilePage } from "@/pages/profile"
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
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "explore", element: <ExplorePage /> },
          { path: "favorites", element: <FavoritesPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "admin/users", element: <AdminUsersPage /> },
          { path: "admin/crypto-sync", element: <AdminCryptoSyncPage /> },
          { path: "admin/audit-logs", element: <AdminAuditLogsPage /> },
        ],
      },
    ],
  },
])
