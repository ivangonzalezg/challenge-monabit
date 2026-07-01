import type { ReactNode } from "react"

import { Card } from "@/shared/ui"

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f6fbf7] p-4 dark:bg-background">
      <Card className="w-full max-w-md">{children}</Card>
    </div>
  )
}
