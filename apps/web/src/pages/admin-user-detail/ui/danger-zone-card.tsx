import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { useDeleteUser, useSetUserBanned } from "../model"
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

type DangerZoneCardProps = {
  userId: string
  userName: string
  banned: boolean | null | undefined
}

export function DangerZoneCard({
  userId,
  userName,
  banned,
}: DangerZoneCardProps) {
  const navigate = useNavigate()
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const setUserBanned = useSetUserBanned(userId)
  const deleteUser = useDeleteUser(userId)

  const isBanned = Boolean(banned)

  const handleToggleBan = async () => {
    try {
      await setUserBanned.mutateAsync(!isBanned)
      toast.success(
        isBanned
          ? "El usuario ha sido desbaneado."
          : "El usuario ha sido baneado."
      )
      setBanDialogOpen(false)
    } catch {
      toast.error("No se pudo actualizar el estado del usuario.")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync()
      toast.success("El usuario ha sido eliminado.")
      navigate("/admin/users")
    } catch {
      toast.error("No se pudo eliminar el usuario.")
      setDeleteDialogOpen(false)
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Zona de peligro</CardTitle>
        <CardDescription>
          Estas acciones afectan directamente el acceso de este usuario.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">
              {isBanned ? "Desbanear usuario" : "Banear usuario"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isBanned
                ? "Restaura el acceso de este usuario a MarketMint."
                : "Impide que este usuario pueda acceder a MarketMint."}
            </p>
          </div>
          <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBanDialogOpen(true)}
            >
              {isBanned ? "Desbanear" : "Banear"}
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isBanned
                    ? "¿Desbanear a este usuario?"
                    : "¿Banear a este usuario?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isBanned
                    ? `${userName} podrá volver a acceder a su cuenta de MarketMint.`
                    : `${userName} no podrá acceder a su cuenta de MarketMint hasta que sea desbaneado.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleToggleBan}
                  disabled={setUserBanned.isPending}
                >
                  {setUserBanned.isPending
                    ? "Guardando…"
                    : isBanned
                      ? "Desbanear"
                      : "Banear"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/50 p-4">
          <div>
            <p className="text-sm font-medium">Eliminar usuario</p>
            <p className="text-sm text-muted-foreground">
              Elimina permanentemente la cuenta de este usuario. Esta acción no
              se puede deshacer.
            </p>
          </div>
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Eliminar
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar a este usuario?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente la cuenta de {userName}.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteUser.isPending}
                >
                  {deleteUser.isPending ? "Eliminando…" : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
