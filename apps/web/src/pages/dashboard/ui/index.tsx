import { useSession } from "@/entities/session"

export function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col gap-4 text-sm leading-loose">
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

      <div className="font-mono text-xs text-muted-foreground">
        (Presiona <kbd>d</kbd> para alternar el modo oscuro)
      </div>
    </div>
  )
}
