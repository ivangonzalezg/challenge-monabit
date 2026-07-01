import { useSession } from "@/entities/session"
import { Skeleton } from "@/shared/ui"
import { NameFormCard } from "./name-form-card"
import { PasswordFormCard } from "./password-form-card"
import { ProfileSummaryCard } from "./profile-summary-card"

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  )
}

export function ProfilePage() {
  const { data: session, isPending } = useSession()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <p className="text-muted-foreground">
          Administra tu información básica de cuenta y tu contraseña.
        </p>
      </div>

      {isPending || !session ? (
        <ProfileSkeleton />
      ) : (
        <>
          <ProfileSummaryCard
            name={session.user.name}
            email={session.user.email}
            role={session.user.role}
            banned={session.user.banned}
          />
          <NameFormCard currentName={session.user.name} />
          <PasswordFormCard />
        </>
      )}
    </div>
  )
}
