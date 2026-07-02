import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/entities/session"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      name: string
      email: string
      password: string
    }) => {
      const { error } = await authClient.admin.createUser({
        name: params.name,
        email: params.email,
        password: params.password,
        data: { emailVerified: true },
      })

      if (error) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}
