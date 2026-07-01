import { RouterProvider } from "react-router"

import { ThemeProvider } from "@/app/providers/theme-provider"

import { router } from "./router"

export function AppRoot() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
