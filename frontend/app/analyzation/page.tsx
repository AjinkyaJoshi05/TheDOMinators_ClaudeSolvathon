'use client'

import * as React from "react"
import { EHPanel } from "@/components/event-horizon/eh-panel"
import { EHButton } from "@/components/event-horizon/eh-button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Send, Upload, TrendingUp } from "lucide-react"
import { EHNavbar } from "@/components/event-horizon/eh-navbar"

// --- Type Definitions ---
type AnalysisResult = {
  summary?: string
  statistics?: Record<string, any>
  metadata?: { rows?: number; type?: string }
  // Add any other fields returned by your API
}

type ExplainError = { status: number; message?: string; detail?: any } | null

export default function Page() {
  const [filePath, setFilePath] = React.useState<string>("")
  const [fileContent, setFileContent] = React.useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null)
  const [userPrompt, setUserPrompt] = React.useState("")
  const [chatResponse, setChatResponse] = React.useState<string | null>(null)
  const [explainError, setExplainError] = React.useState<ExplainError>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // --- debug: log analysisResult when it changes ---
  React.useEffect(() => {
    console.info("analysisResult (debug):", analysisResult)
  }, [analysisResult])

  // --- Env URLs (browser safe) ---
  // We call the local Next API route /api/explain, so no client-side EXPLAIN url is required.
  const ANALYZE_SERVICE_URL = process.env.NEXT_PUBLIC_ANALYZE_SERVICE_URL

  // --- Reset function ---
  const resetState = () => {
    setFilePath("")
    setFileContent("")
    setAnalysisResult(null)
    setChatResponse(null)
    setExplainError(null)
    setUserPrompt("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // --- File upload handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset old state
    resetState()

    const text = await file.text()
    setFileContent(text)
    setFilePath(file.name)
  }

  // --- Analysis handler ---
  const handleAnalyze = async () => {
    if (!filePath || !fileContent) {
      alert("Please select or upload a file first.")
      return
    }

    if (!ANALYZE_SERVICE_URL) {
      alert("NEXT_PUBLIC_ANALYZE_SERVICE_URL not set")
      return
    }

    setIsAnalyzing(true)
    setExplainError(null)
    setChatResponse(null)
    const datasetPathToSend = filePath.startsWith("public/") ? filePath : `public/temp/${filePath}`;

// store it in state so the explain call uses the same path
setFilePath(datasetPathToSend);

try {
  const res = await fetch(`${ANALYZE_SERVICE_URL}/api/analysis/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      datasetPath: datasetPathToSend,
      fileContent,
    }),
  });

      const text = await res.text()
      let parsed: any = null
      try {
        parsed = text ? JSON.parse(text) : null
      } catch {
        parsed = text
      }

      if (!res.ok) {
        // surface error to user and log via warn (avoid Next dev overlay)
        console.warn("Analyze API responded non-OK", res.status, parsed)
        alert(`Analysis failed: ${res.status} — see console or debug panel.`)
        return
      }

      // Normalize response so UI won't crash if metadata is missing
      const data = parsed ?? {}
      const normalized: AnalysisResult = {
        summary: data.summary ?? "",
        statistics: data.statistics ?? {},
        metadata: {
          rows: data?.metadata?.rows ?? data?.rows ?? 0,
          type: data?.metadata?.type ?? data?.type ?? "unknown",
        },
        // copy other fields through (if any)
        ...data,
      }

      setAnalysisResult(normalized)
    } catch (err: any) {
      // Avoid console.error for handled errors; use warn
      console.warn("Analysis request failed:", String(err))
      alert("Analysis failed: " + (err?.message ?? String(err)))
    } finally {
      setIsAnalyzing(false)
    }
  }

  // --- Chat / Explain Handler ---
  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    setExplainError(null)
    setChatResponse(null)

    const prompt = userPrompt.trim()
    if (!prompt) return
    if (!analysisResult) {
      alert("Please run analysis first before asking questions.")
      return
    }

    // Use local Next API route (this hits frontend/app/api/explain/route.ts)
    const url = "/api/explain"

    setUserPrompt("")
    setChatResponse("...")

    // AbortController timeout (15s)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          datasetPath: filePath || undefined,
          analysisData: analysisResult,
          userPrompt: prompt,
        }),
      })

      clearTimeout(timeoutId)

      const text = await res.text()
      let parsed: any = null
      try {
        parsed = text ? JSON.parse(text) : null
      } catch {
        parsed = text
      }

      if (!res.ok) {
        // Do not call console.error (Next dev overlay); use console.warn
        console.warn("Explain API error:", res.status, parsed)
        // store structured explain error so UI can show it
        setExplainError({ status: res.status, message: parsed?.message ?? String(parsed), detail: parsed })
        setChatResponse(`Error ${res.status}: ${parsed?.message ?? "Failed to get explanation."}`)
        return
      }

      // Success — show parsed.message if present, else stringified result
      if (parsed && typeof parsed === "object") {
        setChatResponse(parsed.message ?? JSON.stringify(parsed, null, 2))
      } else {
        setChatResponse(String(parsed ?? "No response"))
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err.name === "AbortError") {
        console.warn("Explain request aborted (timeout)")
        setExplainError({ status: 0, message: "Request timed out", detail: null })
        setChatResponse("Error: Request timed out (15s). Try again.")
        return
      }
      console.warn("Explain request failed:", String(err))
      setExplainError({ status: 0, message: String(err), detail: null })
      setChatResponse("Error: Failed to communicate with the explanation service.")
    }
  }

  // --- Styles & small UI helpers ---
  const buttonStyle = "w-full flex items-center justify-center gap-2 px-8 py-3 text-base"
  const textInputStyle =
    "flex-1 text-sm md:text-base rounded-xl border border-gray-700 bg-[#1A1A23] text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-pink-500"
  const resultPanelStyle =
    "bg-[#1A1A23] rounded-xl p-4 overflow-auto max-h-96 border border-pink-900/40 text-sm font-mono whitespace-pre-wrap shadow-inner"
  const headerStyle = "text-xl font-semibold mb-3 text-pink-400"

  // Error panel component
  const ErrorPanel: React.FC<{ err: ExplainError }> = ({ err }) => {
    if (!err) return null
    return (
      <div className="bg-[#2b0b1a] border border-red-700 text-red-200 p-3 rounded-xl space-y-2">
        <div className="font-semibold">Explain Service Error</div>
        <div>Status: {err.status === 0 ? "network/timeout" : err.status}</div>
        <div>Message: {String(err.message ?? "No message")}</div>
        <details className="text-xs text-red-300">
          <summary>Raw detail</summary>
          <pre className="whitespace-pre-wrap">{JSON.stringify(err.detail ?? {}, null, 2)}</pre>
        </details>
      </div>
    )
  }

  return (
    <main className="min-h-dvh bg-[#08020A]">
      {/* Navbar */}
      <header className="sticky top-0 z-20 p-3">
        <EHNavbar />
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 md:py-14 space-y-8">
        <div className="space-y-3 text-center text-gray-50">
          <h1 className="text-balance text-4xl md:text-6xl text-white font-mono">
            Event Horizon Analysis
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pink-200/70">
            Upload a dataset to run core statistical analysis and interact with the AI explainer.
          </p>
        </div>

        <EHPanel className={cn("p-6 md:p-8 space-y-8")}>
          {/* Upload Section */}
          {!analysisResult && (
            <div className="flex flex-col gap-8 items-center justify-center">
              <label
                className="w-full flex flex-col items-center px-4 py-8 bg-[#1A1A23] rounded-xl border-2 border-dashed border-pink-700/50 cursor-pointer hover:border-pink-500 transition-all shadow-md text-pink-300"
              >
                <Upload className="w-8 h-8 mb-3" />
                <span className="font-medium mb-1">
                  {filePath ? `File Selected: ${filePath}` : "Click to Upload Dataset"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <span className="text-sm text-gray-500 mt-2">(Supported formats: JSON, CSV)</span>
              </label>

              <EHButton
                onClick={handleAnalyze}
                disabled={!filePath || isAnalyzing}
                className={cn(buttonStyle)}
              >
                <TrendingUp className="w-5 h-5" />
                {isAnalyzing ? "Analyzing…" : "Run Core Analysis"}
              </EHButton>

              {fileContent && (
                <div className="w-full max-h-64 overflow-auto rounded-xl border border-gray-700 bg-[#08020A] text-gray-400 p-4 font-mono text-sm shadow-inner">
                  <pre>{fileContent.substring(0, 500)}...</pre>
                </div>
              )}
            </div>
          )}

          {/* Analysis Result & Chat */}
          {analysisResult && (
            <div className="flex flex-col gap-8">
              <div>
                <h3 className={headerStyle}>
                  Analysis Summary 
                </h3>
                <div className={resultPanelStyle}>
                  <pre>{JSON.stringify(analysisResult ?? {}, null, 2)}</pre>
                </div>
              </div>

              <div className="border-t border-pink-900/50 pt-6 space-y-4">
                <h3 className={headerStyle}>AI Explainer Chat</h3>

                {/* Error panel */}
                <ErrorPanel err={explainError} />

                {chatResponse && (
                  <div className="bg-[#08020A] text-pink-300 p-4 rounded-xl shadow-lg border border-pink-700/40 max-h-64 overflow-auto whitespace-pre-wrap">
                    {chatResponse}
                  </div>
                )}

                <form onSubmit={handleSendPrompt} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder='Ask something like "What is the mean energy_keV?"'
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className={cn(textInputStyle)}
                    disabled={isAnalyzing}
                  />
                  <EHButton
                    type="submit"
                    className="px-4 py-2 rounded-xl flex items-center justify-center"
                    disabled={!userPrompt.trim() || isAnalyzing}
                  >
                    <Send className="w-4 h-4" />
                  </EHButton>
                </form>
              </div>

              <EHButton
                onClick={resetState}
                className={cn(buttonStyle, "bg-gray-700 hover:bg-gray-600")}
              >
                Upload New Dataset
              </EHButton>
            </div>
          )}
        </EHPanel>
      </section>
    </main>
  )
}
