import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, Eye, EyeOff } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
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
import { google, icon } from "@/shared/assets"

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
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
        <img src={icon} alt="MarketMint" className="mx-auto mb-2 h-12 w-12" />
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
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
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
          <img src={google} alt="" className="size-5" />
          Google
        </Button>
      </CardContent>

      <CardFooter className="justify-center gap-1 text-sm">
        <span className="text-muted-foreground">¿No tienes una cuenta?</span>
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          Crear una
        </Link>
      </CardFooter>
    </AuthLayout>
  )
}
