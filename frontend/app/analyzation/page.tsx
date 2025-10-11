// frontend/app/analyzation/page.tsx
'use client'

import * as React from "react"
import { EHPanel } from "@/components/event-horizon/eh-panel"
import { EHButton } from "@/components/event-horizon/eh-button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Send, Upload, TrendingUp } from "lucide-react"
import { EHNavbar } from "@/components/event-horizon/eh-navbar" // ⬅️ NAVBAR IMPORTED

// --- Type Definitions ---
type AnalysisResult = {
  // Define structure based on what your /api/analysis/analyze returns
  summary: string;
  statistics: Record<string, any>;
  metadata: { rows: number; type: string };
  // ... other fields
}

export default function Page() {
  const [filePath, setFilePath] = React.useState<string>("")
  const [fileContent, setFileContent] = React.useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null)
  const [userPrompt, setUserPrompt] = React.useState("")
  const [chatResponse, setChatResponse] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // --- Reset Function (Step 5 Logic) ---
  const resetState = () => {
    setFilePath("")
    setFileContent("")
    setAnalysisResult(null)
    setChatResponse(null)
    setUserPrompt("")
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input field
    }
  }

  // --- File Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Step 5: Reset old output and chat when a new file is uploaded
    resetState(); 
    
    // Read file content
    const text = await file.text()
    setFileContent(text)
    setFilePath(file.name)
  }

  // --- Analysis Handler ---
  const handleAnalyze = async () => {
    if (!filePath || !fileContent) {
      alert("Please select or upload a file first.")
      return
    }

    setIsAnalyzing(true)

    const ANALYZE_SERVICE_URL = process.env.NEXT_PUBLIC_Analyze_URL;

    try {
      const res = await fetch(`${ANALYZE_SERVICE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // NOTE: In a real app, you'd send fileContent, not just filePath
        body: JSON.stringify({ filename: filePath, fileContent: fileContent }), 
      })

      if (!res.ok) throw new Error(`Server returned ${res.status}`)

      const data: AnalysisResult = await res.json()
      setAnalysisResult(data) // Step 2: Output displayed
    } catch (err) {
      console.error("Analysis failed:", err)
      alert("Analysis failed. Check console for details.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // --- Chat Prompt Handler (Step 4 Logic) ---
  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = userPrompt.trim();
    if (!prompt) return
    if (!analysisResult) {
        alert("Please run analysis first before asking questions.")
        return
    }

    setUserPrompt(""); // Clear the input immediately
    setChatResponse("..."); // Show a loading indicator in the response box

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send key info from the analysis result for context
          analysisData: analysisResult, 
          userPrompt: prompt,
        }),
      })

      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      
      const data = await res.json()
      // Step 4: Show the response
      setChatResponse(data.message || "Could not generate an explanation.") 
    } catch (err) {
      console.error("Explain API failed:", err)
      setChatResponse("Error: Failed to communicate with the explanation service.")
    }
  }

  // --- Rendering Helpers for EH Theme (Step 6) ---
  const buttonStyle = "w-full flex items-center justify-center gap-2 px-8 py-3 text-base";
  const textInputStyle = "flex-1 text-sm md:text-base rounded-xl border border-gray-700 bg-[#1A1A23] text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-pink-500";
  const resultPanelStyle = "bg-[#1A1A23] rounded-xl p-4 overflow-auto max-h-96 border border-pink-900/40 text-sm font-mono whitespace-pre-wrap shadow-inner";
  const headerStyle = "text-xl font-semibold mb-3 text-pink-400";

  return (
    <main className="min-h-dvh bg-[#08020A]"> {/* Apply Void Black Background */}
      
      {/* ⬅️ NAVBAR RENDERED */}
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
          
          {/* --- Step 1: Initial Upload State --- */}
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
                <span className="text-sm text-gray-500 mt-2">
                  (Supported formats: JSON, CSV)
                </span>
              </label>

              {/* Only show "Run Analysis" if a file is loaded */}
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

          {/* --- Step 2 & 3: Analysis Output and Chat --- */}
          {analysisResult && (
            <div className="flex flex-col gap-8">
              
              {/* Analysis Result Output */}
              <div>
                <h3 className={headerStyle}>Analysis Summary for {analysisResult.metadata.rows} Rows</h3>
                <div className={resultPanelStyle}>
                  <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
                </div>
              </div>

              {/* Chat Box (Step 3) */}
              <div className="border-t border-pink-900/50 pt-6 space-y-4">
                <h3 className={headerStyle}>AI Explainer Chat</h3>
                
                {/* Chat Response Display (Step 4) */}
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
                  />
                  <EHButton
                    type="submit"
                    className="px-4 py-2 rounded-xl flex items-center justify-center"
                    disabled={!userPrompt.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </EHButton>
                </form>
              </div>
              
              {/* Option to upload new file or re-analyze */}
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