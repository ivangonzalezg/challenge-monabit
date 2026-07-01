import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/entities/session"
import {
  Button,
  Card,
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

const nameSchema = z.object({
  name: z.string().min(1, "Ingresa tu nombre."),
})

type NameFormValues = z.infer<typeof nameSchema>

type NameFormCardProps = {
  currentName: string
}

export function NameFormCard({ currentName }: NameFormCardProps) {
  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    values: { name: currentName },
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  const onSubmit = async (values: NameFormValues) => {
    const { error } = await authClient.updateUser({ name: values.name })

    if (error) {
      toast.error("No se pudo actualizar el nombre. Intenta de nuevo.")
      return
    }

    toast.success("Nombre actualizado correctamente.")
  }

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <CardTitle>Nombre</CardTitle>
          <CardDescription>
            Actualiza el nombre que se muestra en tu cuenta de MarketMint.
          </CardDescription>
        </CardHeader>

        <CardContent>
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
        </CardContent>

        <CardFooter className="justify-end pt-6">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando…" : "Guardar nombre"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
