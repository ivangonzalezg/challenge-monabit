import { useNavigate } from "react-router"

import { authClient, useSession } from "@/entities/session"
import { Button } from "@/shared/ui"

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate("/login")
  }

  return (
    <div className="flex flex-col gap-4 p-6 text-sm leading-loose">
      <div>
        <h1 className="font-medium">Panel</h1>
        {session ? (
          <p>
            Sesión iniciada como{" "}
            <span className="font-medium">{session.user.name}</span> (
            {session.user.email}).
          </p>
        ) : null}
      </div>

      <Button variant="outline" className="w-fit" onClick={handleSignOut}>
        Cerrar sesión
      </Button>

      <div className="font-mono text-xs text-muted-foreground">
        (Presiona <kbd>d</kbd> para alternar el modo oscuro)
      </div>
    </div>
  )
}
