"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { EHPanel } from "./eh-panel"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Dashboard" },
]

export function EHNavbar() {
  const pathname = usePathname()
  return (
    <EHPanel className="px-4 py-3">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="text-sm tracking-widest text-muted-foreground">EVENT HORIZON</div>
        <ul className="flex items-center gap-5">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "eh-transition px-2 py-1 rounded-md",
                    active
                      ? "text-primary border border-primary/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </EHPanel>
  )
}
