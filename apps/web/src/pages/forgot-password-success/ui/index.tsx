import { Navigate, useNavigate, useSearchParams } from "react-router"

import { AuthLayout } from "@/widgets/auth-layout"
import {
  Button,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui"
import { icon } from "@/shared/assets"

export function ForgotPasswordSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email")

  if (!email) {
    return <Navigate to="/forgot-password" replace />
  }

  return (
    <AuthLayout>
      <CardHeader className="items-center text-center">
        <img src={icon} alt="MarketMint" className="mx-auto mb-2 h-12 w-12" />
        <CardTitle>Revisa tu correo</CardTitle>
        <CardDescription>
          Si existe una cuenta con ese correo, te enviamos instrucciones para
          recuperar el acceso a tu cuenta de MarketMint.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          ¿No recibiste el correo? Revisa tu carpeta de spam.
        </div>

        <Button className="w-full" onClick={() => navigate("/login")}>
          Volver a iniciar sesión
        </Button>
      </CardContent>

      <CardFooter />
    </AuthLayout>
  )
}
