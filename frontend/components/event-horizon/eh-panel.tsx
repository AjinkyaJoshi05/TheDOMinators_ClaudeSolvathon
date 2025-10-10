import type * as React from "react"
import { cn } from "@/lib/utils"

export function EHPanel({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-background/60 backdrop-blur border border-border/60 rounded-xl eh-glow eh-transition",
        className,
      )}
    >
      {children}
    </div>
  )
}
