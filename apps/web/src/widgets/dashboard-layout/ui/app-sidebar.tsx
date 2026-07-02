import { useNavigate, useLocation, Link } from "react-router"
import {
  LayoutDashboard,
  Compass,
  Star,
  User,
  Users,
  RefreshCw,
  History,
  LogOut,
  type LucideIcon,
} from "lucide-react"

import { authClient, useSession } from "@/entities/session"
import { logo, logoDark } from "@/shared/assets"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/ui"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const mainGroup: NavGroup = {
  label: "Principal",
  items: [
    { title: "Panel", url: "/", icon: LayoutDashboard },
    { title: "Explorar", url: "/explore", icon: Compass },
    { title: "Favoritos", url: "/favorites", icon: Star },
  ],
}

const accountGroup: NavGroup = {
  label: "Cuenta",
  items: [{ title: "Perfil", url: "/profile", icon: User }],
}

const adminGroup: NavGroup = {
  label: "Administración",
  items: [
    { title: "Usuarios", url: "/admin/users", icon: Users },
    { title: "Registro de auditoría", url: "/admin/audit-logs", icon: History },
    {
      title: "Sincronización cripto",
      url: "/admin/crypto-sync",
      icon: RefreshCw,
    },
  ],
}

function NavGroupSection({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="tracking-wide uppercase">
        {group.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={
                    isActive
                      ? "rounded-xs border-r-3 border-sidebar-primary"
                      : undefined
                  }
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data: session } = useSession()
  const isAdmin = session?.user.role === "admin"

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate("/login")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="mb-2 flex items-center px-3 py-2">
          <img src={logo} alt="MarketMint" className="h-8 w-auto dark:hidden" />
          <img
            src={logoDark}
            alt="MarketMint"
            className="hidden h-8 w-auto dark:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavGroupSection group={mainGroup} pathname={pathname} />
        <NavGroupSection group={accountGroup} pathname={pathname} />
        {isAdmin ? (
          <NavGroupSection group={adminGroup} pathname={pathname} />
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="flex-1 truncate text-sm font-medium">
            {session?.user.name ?? ""}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Cerrar sesión"
            className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
