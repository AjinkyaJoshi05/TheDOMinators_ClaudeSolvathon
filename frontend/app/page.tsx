import { EHNavbar } from "@/components/event-horizon/eh-navbar";
import { EHPanel } from "@/components/event-horizon/eh-panel";
import { EHCard } from "@/components/event-horizon/eh-card";
import { EHButton } from "@/components/event-horizon/eh-button";
import { EHLoader } from "@/components/event-horizon/eh-loader";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-dvh">
      <header className="sticky top-0 z-20 p-3">
        <EHNavbar />
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12 space-y-10">
        <div className="space-y-4">
          <h1 className="text-balance text-3xl md:text-5xl">
            Event Horizon Interface
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            A cosmic, high-tech UI system built with semantic tokens, subtle
            energy animations, and accessible dark-mode design.
          </p>
          <div className="flex items-center gap-3">
            <EHButton>Primary Action</EHButton>
            <EHButton variant="secondary">Secondary Action</EHButton>
          </div>
        </div>

        <EHLoader className="max-w-lg" />

        <div className="grid gap-5 md:grid-cols-3">
          <Link href="/data-generation">
            <EHCard className="cursor-pointer">
              <h3 className="mb-2 text-lg font-bold">Generate Cosmic Events</h3>
              <p className="text-muted-foreground">
                Click to generate and explore synthetic cosmic event data
              </p>
            </EHCard>
          </Link>
          <Link href="/analyzation">
            <EHCard className="cursor-pointer">
              <h3 className="mb-2 text-lg font-bold">
                Predict & Analyze Cosmic Events
              </h3>
              <p className="text-muted-foreground">
                Generate insights and explore synthetic event data
                interactively.
              </p>
            </EHCard>
          </Link>

          <EHCard>
            <h3 className="mb-2 text-lg">Adaptive Darkness</h3>
            <p className="text-muted-foreground">
              Built for consistent, accessible dark interfaces.
            </p>
          </EHCard>
        </div>

        <EHPanel className="p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl">Mission Control</h2>
              <p className="text-muted-foreground">
                Manage systems with clarity and focus.
              </p>
            </div>
            <div className="flex gap-3">
              <EHButton>Execute</EHButton>
              <EHButton variant="secondary">Simulate</EHButton>
            </div>
          </div>
        </EHPanel>
      </section>
    </main>
  );
}
