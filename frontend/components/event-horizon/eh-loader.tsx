import type * as React from "react"
import { cn } from "@/lib/utils"

export function EHLoader({
  className,
  "aria-label": ariaLabel = "Loading",
}: React.HTMLAttributes<HTMLDivElement> & { "aria-label"?: string }) {
  return (
    <div className={cn("w-full", className)} role="status" aria-label={ariaLabel}>
      <div
        className="h-1 w-full rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_200%] [animation:eh-energy_1.2s_ease-in-out_infinite]"
        aria-hidden="true"
      />
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}
