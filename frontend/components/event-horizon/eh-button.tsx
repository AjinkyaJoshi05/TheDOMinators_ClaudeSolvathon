"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

type EHButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary"
}

export function EHButton({ className, variant = "primary", ...props }: EHButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium eh-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:brightness-110 hover:ring-2 hover:ring-primary/60 active:scale-[0.98] eh-glow",
    secondary:
      "border border-accent text-accent hover:bg-accent/10 hover:ring-2 hover:ring-accent/60 active:scale-[0.98]",
  }

  return <button className={cn(base, variants[variant], className)} {...props} />
}
