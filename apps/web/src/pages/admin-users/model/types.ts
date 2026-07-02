export type AdminUserSortBy = "name" | "email" | "createdAt"

export type AdminUser = {
  id: string
  name: string
  email: string
  role?: string | null
  banned?: boolean | null
  createdAt: string | Date
}
