import { useState } from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router"

import { AuthLayout } from "@/widgets/auth-layout"
import { authClient } from "@/entities/session"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui"
import { icon } from "@/shared/assets"

export function RegisterSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email")
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle"
  )

  if (!email) {
    return <Navigate to="/register" replace />
  }

  const handleResend = async () => {
    setResendState("sending")
    await authClient.sendVerificationEmail({ email, callbackURL: "/" })
    setResendState("sent")

    setTimeout(() => {
      setResendState("idle")
    }, 4000)
  }

  return (
    <AuthLayout>
      <CardHeader className="items-center text-center">
        <img src={icon} alt="MarketMint" className="mx-auto mb-2 h-12 w-12" />
        <CardTitle>Revisa tu correo</CardTitle>
        <CardDescription>
          Te enviamos un enlace de confirmación a tu correo. Ábrelo y haz clic
          en el enlace para activar tu cuenta de MarketMint.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          ¿No recibiste el correo? Revisa tu carpeta de spam o solicita un nuevo
          correo de confirmación.
        </div>

        <Button className="w-full" onClick={() => navigate("/login")}>
          Volver a iniciar sesión
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={resendState === "sending"}
            >
              {resendState === "sent"
                ? "Correo reenviado"
                : resendState === "sending"
                  ? "Reenviando…"
                  : "Reenviar correo de confirmación"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Reenviar correo de confirmación?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Enviaremos un nuevo enlace de confirmación a{" "}
                <span className="font-semibold">{email}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleResend}>
                Reenviar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>

      <CardFooter />
    </AuthLayout>
  )
}
