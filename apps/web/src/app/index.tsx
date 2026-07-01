import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router"
import TimeAgo from "javascript-time-ago"
import es from "javascript-time-ago/locale/es"

import { ThemeProvider } from "@/shared/lib/theme"
import { Toaster } from "@/shared/ui"

import { router } from "./router"

TimeAgo.addDefaultLocale(es)

const queryClient = new QueryClient()

export function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
