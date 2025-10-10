import { DataGeneratorForm } from "@/components/DataGeneratorForm"
import { EHNavbar } from "@/components/event-horizon/eh-navbar"
import { EHLoader } from "@/components/event-horizon/eh-loader"
import { EHPanel } from "@/components/event-horizon/eh-panel"

export default function Page() {
  return (
    <main className="min-h-dvh">
      <header className="sticky top-0 z-20 p-3">
        <EHNavbar />
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 md:py-14 space-y-8">
        <div className="space-y-3">
          <h1 className="text-balance text-3xl md:text-5xl">Data Generation</h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            A cosmic, dark, high-tech form to synthesize observation datasets with adjustable sparsity and event
            profiles. Export as CSV or JSON.
          </p>
        </div>

        <EHPanel className="p-4">
          <EHLoader className="max-w-xl" />
        </EHPanel>

        <DataGeneratorForm />
      </section>
    </main>
  )
}
