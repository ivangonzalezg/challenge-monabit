import { Check, X } from "lucide-react"
import { useNavigate } from "react-router"

import { formatDate } from "@/shared/lib/format"
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui"
import type { AdminUser } from "../model/types"

type UsersTableProps = {
  users: AdminUser[]
}

export function UsersTable({ users }: UsersTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo electrónico</TableHead>
          <TableHead className="text-center">Correo confirmado</TableHead>
          <TableHead>Registrado</TableHead>
          <TableHead className="text-center">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            onClick={() => navigate(`/admin/users/${user.id}`)}
            className="cursor-pointer"
          >
            <TableCell>
              <div className="text-sm font-semibold">{user.name}</div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.email}
            </TableCell>
            <TableCell className="text-center">
              {user.emailVerified ? (
                <Check
                  className="mx-auto size-4 text-emerald-600"
                  aria-label="Correo confirmado"
                />
              ) : (
                <X
                  className="mx-auto size-4 text-muted-foreground"
                  aria-label="Correo sin confirmar"
                />
              )}
            </TableCell>
            <TableCell>{formatDate(user.createdAt)}</TableCell>
            <TableCell className="text-center">
              <Badge variant={user.banned ? "destructive" : "secondary"}>
                {user.banned ? "Baneado" : "Activo"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
