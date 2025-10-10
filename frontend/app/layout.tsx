import type React from "react"
import type { Metadata } from "next"
import { Inter, Michroma } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})
const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-michroma",
})

export const metadata: Metadata = {
  title: "Event Horizon",
  description: "Cosmic dark UI powered by v0",
  generator: "v0.app",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // We keep dark mode enforced at the root for a consistent dark interface.
      className={`${inter.variable} ${michroma.variable} antialiased dark`}
    >
      <body className="font-sans">
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
