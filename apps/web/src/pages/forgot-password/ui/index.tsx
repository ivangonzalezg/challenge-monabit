import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert } from "lucide-react"
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
} from "@/shared/ui"
import { icon } from "@/shared/assets"

const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null)

    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setFormError("No se pudo enviar el enlace. Intenta de nuevo.")
      return
    }

    navigate(
      `/forgot-password/success?email=${encodeURIComponent(values.email)}`
    )
  }

  return (
    <AuthLayout>
      <CardHeader className="items-center text-center">
        <img src={icon} alt="MarketMint" className="mx-auto mb-2 h-12 w-12" />
        <CardTitle>Recupera tu contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo y te enviaremos instrucciones para recuperar el
          acceso a tu cuenta de MarketMint.
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

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Enviando…" : "Enviar enlace"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-sm">
        <Link to="/login" className="font-medium text-primary hover:underline">
          ← Volver a iniciar sesión
        </Link>
      </CardFooter>
    </AuthLayout>
  )
}
