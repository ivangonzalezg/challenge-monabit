import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, Eye, EyeOff } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { z } from "zod"

import { AuthLayout } from "@/widgets/auth-layout"
import { authClient } from "@/entities/session"
import {
  Alert,
  AlertDescription,
  Button,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Separator,
} from "@/shared/ui"

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
})

type LoginFormValues = z.infer<typeof loginSchema>

function GoogleIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setFormError("Correo o contraseña incorrectos. Intenta de nuevo.")
      return
    }

    navigate("/")
  }

  const handleGoogleSignIn = () => {
    authClient.signIn.social({ provider: "google", callbackURL: "/" })
  }

  return (
    <AuthLayout>
      <CardHeader className="items-center text-center">
        <img
          src="/favicon.png"
          alt="MarketMint"
          className="mx-auto mb-2 h-12 w-12"
        />
        <CardTitle>Iniciar sesión en MarketMint</CardTitle>
        <CardDescription>Accede a tu panel de mercado cripto.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {formError ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Correo electrónico</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-1 my-auto text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting
              ? "Iniciando sesión…"
              : "Iniciar sesión"}
          </Button>
        </form>

        <div className="relative flex items-center py-2">
          <Separator className="flex-1" />
          <span className="mx-4 shrink-0 text-xs tracking-wider text-muted-foreground uppercase">
            O continúa con
          </span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full"
        >
          <GoogleIcon />
          Google
        </Button>
      </CardContent>

      <CardFooter className="justify-center gap-1 text-sm">
        <span className="text-muted-foreground">¿No tienes una cuenta?</span>
        <span className="font-medium text-primary">Crear una</span>
      </CardFooter>
    </AuthLayout>
  )
}
