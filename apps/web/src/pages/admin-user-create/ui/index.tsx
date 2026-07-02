import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, CircleAlert, Eye, EyeOff } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

import { useCreateUser } from "../model"
import {
  Alert,
  AlertDescription,
  Button,
  Card,
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

const createUserSchema = z
  .object({
    name: z.string().min(1, "Ingresa el nombre."),
    email: z.string().email("Ingresa un correo válido."),
    password: z.string().min(8, "Mínimo 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirma la contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

type CreateUserFormValues = z.infer<typeof createUserSchema>

export function AdminUserCreatePage() {
  const navigate = useNavigate()
  const createUser = useCreateUser()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  const onSubmit = async (values: CreateUserFormValues) => {
    setFormError(null)

    try {
      await createUser.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      })
    } catch (error) {
      const code = (error as { code?: string } | null)?.code
      if (code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        setFormError("Ya existe una cuenta con este correo.")
      } else {
        setFormError("No se pudo crear el usuario. Intenta de nuevo.")
      }
      return
    }

    toast.success("Usuario creado correctamente.")
    navigate("/admin/users")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/admin/users">
            <ArrowLeft />
            Volver a usuarios
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Agregar usuario</h1>
        <p className="text-muted-foreground">
          Crea una nueva cuenta de usuario en MarketMint.
        </p>
      </div>

      <Card>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardHeader>
            <CardTitle>Datos del usuario</CardTitle>
            <CardDescription>
              El usuario podrá iniciar sesión de inmediato con estas
              credenciales.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {formError ? (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Correo electrónico
                  </FieldLabel>
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
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
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
          </CardContent>

          <CardFooter className="justify-end pt-6">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creando…" : "Crear usuario"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
