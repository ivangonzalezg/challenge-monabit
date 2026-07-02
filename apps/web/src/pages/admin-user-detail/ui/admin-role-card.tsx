import { useState } from "react"
import { toast } from "sonner"

import { useSetUserRole } from "../model"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui"

type AdminRoleCardProps = {
  userId: string
  userName: string
  role: string | null | undefined
}

export function AdminRoleCard({ userId, userName, role }: AdminRoleCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const setUserRole = useSetUserRole(userId)

  const isAdmin = role === "admin"
  const nextRole = isAdmin ? "user" : "admin"

  const handleToggleRole = async () => {
    try {
      await setUserRole.mutateAsync(nextRole)
      toast.success(
        isAdmin
          ? "El usuario ahora es un usuario estándar."
          : "El usuario ahora es administrador."
      )
      setDialogOpen(false)
    } catch {
      toast.error("No se pudo actualizar el rol del usuario.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rol</CardTitle>
        <CardDescription>
          Controla el nivel de acceso de este usuario en MarketMint.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            {isAdmin ? "Quitar permisos de administrador" : "Hacer administrador"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Este usuario dejará de tener acceso al panel de administración."
              : "Este usuario podrá acceder al panel de administración."}
          </p>
        </div>
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            {isAdmin ? "Quitar administrador" : "Hacer administrador"}
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isAdmin
                  ? "¿Quitar permisos de administrador?"
                  : "¿Convertir a este usuario en administrador?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isAdmin
                  ? `${userName} perderá el acceso al panel de administración.`
                  : `${userName} tendrá acceso completo al panel de administración.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggleRole}
                disabled={setUserRole.isPending}
              >
                {setUserRole.isPending
                  ? "Guardando…"
                  : isAdmin
                    ? "Quitar administrador"
                    : "Hacer administrador"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
