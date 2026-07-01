import { RouterProvider } from "react-router"

import { ThemeProvider } from "@/shared/lib/theme"
import { Toaster } from "@/shared/ui"

import { router } from "./router"

export function AppRoot() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  )
}
