import type * as React from "react"
import { cn } from "@/lib/utils"

export function EHCard({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border border-border/60 rounded-xl p-5 eh-transition hover:scale-[1.01] hover:eh-inner",
        className,
      )}
    >
      {children}
    </div>
  )
}
