import { Outlet, useLocation } from "react-router"
import { Moon, Sun } from "lucide-react"

import { AppSidebar } from "./app-sidebar"
import { useResolvedTheme, useTheme } from "@/shared/lib/theme"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui"

const pageTitles: Record<string, string> = {
  "/": "Panel",
  "/explore": "Explorar",
  "/favorites": "Favoritos",
  "/profile": "Perfil",
  "/admin/users": "Usuarios",
  "/admin/crypto-sync": "Sincronización de criptomonedas",
  "/admin/audit-logs": "Registro de auditoría",
}

export function DashboardLayout() {
  const { pathname } = useLocation()
  const currentTitle = pageTitles[pathname] ?? "MarketMint"
  const { setTheme } = useTheme()
  const resolvedTheme = useResolvedTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              resolvedTheme === "dark"
                ? "Cambiar a modo claro"
                : "Cambiar a modo oscuro"
            }
            onClick={toggleTheme}
            className="ml-auto"
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
