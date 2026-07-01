import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"

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

const REDIRECT_SECONDS = 5

export function EmailConfirmedPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasError = Boolean(searchParams.get("error"))
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    if (hasError) {
      return undefined
    }

    if (secondsLeft <= 0) {
      navigate("/")
      return
    }

    const timeout = setTimeout(() => {
      setSecondsLeft((current) => current - 1)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [hasError, secondsLeft, navigate])

  if (hasError) {
    return (
      <AuthLayout>
        <CardHeader className="items-center text-center">
          <img src={icon} alt="MarketMint" className="mx-auto mb-2 h-12 w-12" />
          <CardTitle>Enlace inválido o expirado</CardTitle>
          <CardDescription>
            Este enlace de confirmación ya no es válido. Si solicitaste el
            correo más de una vez, revisa tu bandeja de entrada y usa el enlace
            del correo más reciente.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button className="w-full" onClick={() => navigate("/register")}>
            Volver a registrarme
          </Button>
        </CardContent>

        <CardFooter className="justify-center text-sm">
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </CardFooter>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <CardHeader className="items-center text-center">
        <img src={icon} alt="MarketMint" className="mx-auto mb-2 h-12 w-12" />
        <CardTitle>Cuenta confirmada</CardTitle>
        <CardDescription>
          Tu cuenta de MarketMint ha sido confirmada exitosamente.
        </CardDescription>
        <CardDescription>
          Te estamos redirigiendo a tu panel para que puedas comenzar.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button className="w-full" onClick={() => navigate("/")}>
          Ir al panel ({secondsLeft})
        </Button>
      </CardContent>

      <CardFooter className="justify-center text-sm">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </CardFooter>
    </AuthLayout>
  )
}
