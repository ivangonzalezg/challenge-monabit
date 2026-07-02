import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router"

import { useUser } from "../model"
import { AdminNameFormCard } from "./admin-name-form-card"
import { AdminUserSummaryCard } from "./admin-user-summary-card"
import { DangerZoneCard } from "./danger-zone-card"
import { Button, Skeleton } from "@/shared/ui"

function AdminUserDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
      <p className="font-medium text-foreground">
        No se pudo cargar este usuario.
      </p>
      <p className="text-sm">Puede que ya no exista o no tengas acceso.</p>
    </div>
  )
}

export function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const { data: user, isPending, isError } = useUser(userId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/admin/users">
            <ArrowLeft />
            Volver a usuarios
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Editar usuario</h1>
        <p className="text-muted-foreground">
          Actualiza la información de la cuenta de este usuario.
        </p>
      </div>

      {isPending ? (
        <AdminUserDetailSkeleton />
      ) : isError || !user ? (
        <ErrorState />
      ) : (
        <>
          <AdminUserSummaryCard
            name={user.name}
            email={user.email}
            role={user.role}
            banned={user.banned}
          />
          <AdminNameFormCard userId={user.id} currentName={user.name} />
          <DangerZoneCard
            userId={user.id}
            userName={user.name}
            banned={user.banned}
          />
        </>
      )}
    </div>
  )
}
