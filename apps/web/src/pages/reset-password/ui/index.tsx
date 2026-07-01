import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, Eye, EyeOff } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
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
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from "@/shared/ui"
import { icon } from "@/shared/assets"

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Mínimo 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const urlError = searchParams.get("error")

  const [tokenInvalid, setTokenInvalid] = useState(
    !token || urlError === "INVALID_TOKEN"
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null)

    const { error } = await authClient.resetPassword({
      newPassword: values.newPassword,
      token: token ?? "",
    })

    if (error) {
      if (error.code === "INVALID_TOKEN") {
        setTokenInvalid(true)
        return
      }
      setFormError("No se pudo restablecer la contraseña. Intenta de nuevo.")
      return
    }

    toast.success("Contraseña actualizada correctamente.")
    navigate("/login")
  }

  if (tokenInvalid) {
    return (
      <AuthLayout>
        <CardHeader className="items-center text-center">
          <img src={icon} alt="MarketMint" className="mx-auto mb-2 h-12 w-12" />
          <CardTitle>Enlace inválido o expirado</CardTitle>
          <CardDescription>
            Este enlace para restablecer tu contraseña ya no es válido. Solicita
            uno nuevo para continuar.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            className="w-full"
            onClick={() => navigate("/forgot-password")}
          >
            Solicitar nuevo enlace
          </Button>
        </CardContent>

        <CardFooter />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <CardHeader className="items-center text-center">
        <img src={icon} alt="MarketMint" className="mx-auto mb-2 h-12 w-12" />
        <CardTitle>Restablece tu contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta de
          MarketMint.
        </CardDescription>
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
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nueva contraseña</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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
                ) : (
                  <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
                )}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Confirmar contraseña
                </FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute inset-y-0 right-1 my-auto text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
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
              ? "Restableciendo…"
              : "Restablecer contraseña"}
          </Button>
        </form>
      </CardContent>

      <CardFooter />
    </AuthLayout>
  )
}
