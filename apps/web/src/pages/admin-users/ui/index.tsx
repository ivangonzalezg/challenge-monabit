import { Fragment, useEffect, useState } from "react"

import { useSession } from "@/entities/session"
import { useUsers } from "../model"
import type { AdminUserSortBy } from "../model/types"
import { UserControls } from "./user-controls"
import { UsersTable } from "./users-table"
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
} from "@/shared/ui"

const PAGE_SIZE = 20

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}

function UsersSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="font-medium">No se pudieron cargar los usuarios.</p>
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
      <p className="font-medium text-foreground">No se encontraron usuarios</p>
      <p className="text-sm">Intenta con otro correo.</p>
    </div>
  )
}

export function AdminUsersPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<AdminUserSortBy>("createdAt")
  const debouncedSearch = useDebouncedValue(search, 350)

  const [resetKey, setResetKey] = useState({ search: debouncedSearch, sortBy })
  if (resetKey.search !== debouncedSearch || resetKey.sortBy !== sortBy) {
    setResetKey({ search: debouncedSearch, sortBy })
    setPage(1)
  }

  const queryParams = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    sortBy,
    currentUserId: session?.user.id,
  }

  const { data, isPending, isError, refetch } = useUsers(queryParams)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <p className="text-muted-foreground">
          Administra las cuentas registradas en MarketMint.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <UserControls
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />
        </CardHeader>
        <CardContent>
          {isPending ? (
            <UsersSkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : data.items.length === 0 ? (
            <EmptyState />
          ) : (
            <UsersTable users={data.items} />
          )}
        </CardContent>

        {data && data.totalPages > 1 ? (
          <CardFooter className="justify-center border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.max(1, p - 1))
                    }}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : undefined
                    }
                  />
                </PaginationItem>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === data.totalPages ||
                      Math.abs(p - page) <= 1
                  )
                  .map((p, index, arr) => (
                    <Fragment key={p}>
                      {index > 0 && p - arr[index - 1] > 1 ? (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : null}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(p)
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    </Fragment>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.min(data.totalPages, p + 1))
                    }}
                    className={
                      page === data.totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}
