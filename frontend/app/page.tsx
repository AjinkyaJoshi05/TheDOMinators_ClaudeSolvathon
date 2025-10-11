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
        </div>

        <EHLoader className="max-w-lg" />

<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full"> 
    {/* 🚨 CHANGED: Removed max-w-6xl and mx-auto, added w-full */}
    {/* This ensures the grid itself takes up 100% of its parent's width */}
    
    <Link 
        href="/data-generation"
        className="block group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(231,11,92,0.5)] rounded-xl"
    >
        <EHCard className="cursor-pointer h-full p-6 transition-colors duration-300 group-hover:border-pink-500/80">
            <h3 className="mb-2 text-xl font-bold text-pink-400 group-hover:text-white transition-colors">
                GENERATE COSMIC EVENTS
            </h3>
            <p className="text-gray-400 text-sm">
                Click to synthesize observation datasets with adjustable sparsity and event profiles.
            </p>
        </EHCard>
    </Link>
    
    <Link 
        href="/analyzation"
        className="block group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(231,11,92,0.5)] rounded-xl"
    >
        <EHCard className="cursor-pointer h-full p-6 transition-colors duration-300 group-hover:border-pink-500/80">
            <h3 className="mb-2 text-xl font-bold text-pink-400 group-hover:text-white transition-colors">
                PREDICT & ANALYZE COSMIC EVENTS
            </h3>
            <p className="text-gray-400 text-sm">
                Upload or load generated data to run analysis and interact with the AI explainer.
            </p>
        </EHCard>
    </Link>
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
