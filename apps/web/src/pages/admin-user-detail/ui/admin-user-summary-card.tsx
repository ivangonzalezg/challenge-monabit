import { Badge, Card, CardContent } from "@/shared/ui"

type AdminUserSummaryCardProps = {
  name: string
  email: string
  role: string | null | undefined
  banned: boolean | null | undefined
}

export function AdminUserSummaryCard({
  name,
  email,
  role,
  banned,
}: AdminUserSummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm text-muted-foreground">{email}</p>
        <div className="flex gap-2 pt-1">
          <Badge variant="secondary">
            {role === "admin" ? "Administrador" : "Usuario"}
          </Badge>
          <Badge variant={banned ? "destructive" : "secondary"}>
            {banned ? "Baneado" : "Activo"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
