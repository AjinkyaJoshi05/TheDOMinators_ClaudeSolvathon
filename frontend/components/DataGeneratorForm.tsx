"use client"

import * as React from "react"
import { EHPanel } from "@/components/event-horizon/eh-panel"
import { EHButton } from "@/components/event-horizon/eh-button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type EventType = "WIMP-like" | "Axion-like" | "Sterile Neutrino Background" | "Gamma Ray Background"
type FileType = "CSV" | "JSON"

type FormState = {
	rows: number
	missingPct: number // This holds the percentage value (0-50) from the slider
	eventType: EventType
	fileType: FileType
}

export function DataGeneratorForm({ className }: { className?: string }) {
	const [state, setState] = React.useState<FormState>({
		rows: 1000,
		missingPct: 5,
		eventType: "WIMP-like",
		fileType: "JSON",
	})
	const [isGenerating, setIsGenerating] = React.useState(false)

	const [fileUrl, setFileUrl] = React.useState<string>("")
	const [fileContent, setFileContent] = React.useState<string>("")
    const [fileName, setFileName] = React.useState<string>("") // Add state for file name

	// Load fileUrl and fileName from localStorage on mount and fetch content
	React.useEffect(() => {
		const savedUrl = localStorage.getItem("fileUrl")
        const savedFileName = localStorage.getItem("fileName")
		if (savedUrl) {
			setFileUrl(savedUrl)
            if (savedFileName) setFileName(savedFileName)

			// Fetch content for preview/analysis
			fetch(savedUrl)
				.then(res => res.text())
				.then(text => setFileContent(text))
				.catch(err => console.error("Failed to fetch saved file content:", err))
		}
	}, [])

	// Save fileUrl, fileContent, and fileName to localStorage whenever they change
	React.useEffect(() => {
		if (fileUrl) localStorage.setItem("fileUrl", fileUrl)
        // Set a generic name if generating data, which can be useful for the Analysis page
        if (fileName) localStorage.setItem("fileName", fileName) 
        if (fileContent) localStorage.setItem("fileContent", fileContent) 
	}, [fileUrl, fileName, fileContent])


	const onGenerate = async (e: React.FormEvent) => {
		e.preventDefault()
		if (state.rows < 1) return

		setIsGenerating(true)
		setFileUrl("")
		setFileContent("")
        setFileName("") // Clear previous file name

        // 🚨 CRITICAL FIX: Convert missingPct to a decimal fraction for the API
        const missingValueDecimal = state.missingPct / 100;

        // Prepare the data to be sent to the API
        const apiPayload = {
            ...state,
            missingPct: missingValueDecimal, // Use the corrected decimal value
        };

		try {
			const res = await fetch("/api/generate-data", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(apiPayload), // Send the corrected payload
			})
			if (!res.ok) throw new Error(`Server returned ${res.status}`)

            // Assuming the API returns both fileUrl and a suggested fileName
			const { fileUrl, fileName: receivedFileName } = await res.json() 

            // Update state with generated file details
			setFileUrl(fileUrl)
            setFileName(receivedFileName || `data_${state.eventType.replace(/\s/g, '_')}.${state.fileType.toLowerCase()}`)

			const fileRes = await fetch(fileUrl)
			const content = await fileRes.text()
			setFileContent(content)
		} catch (err) {
			console.error("Failed to generate data:", err)
			alert("Error generating data. See console for details.")
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<EHPanel
			className={cn(
				"relative p-6 md:p-8 overflow-hidden",
				"animate-in fade-in duration-500",
				className,
			)}
		>
			<div className="space-y-2">
				<h2 className="text-2xl md:text-3xl">Cloud Solvathon: Echoes from the Invisible Universe</h2>
				<p className="text-muted-foreground leading-relaxed">
					Generate synthetic observation data via our LLM.
				</p>
			</div>

			<form onSubmit={onGenerate} className="mt-6 grid gap-6 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<Label htmlFor="rows">Number of Rows</Label>
					<Input
						id="rows"
						type="number"
						min={1}
						max={1_000_000}
						value={state.rows}
						onChange={(e) => setState(s => ({ ...s, rows: Number(e.target.value) }))}
						placeholder="e.g. 10000"
						className="eh-transition"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="missing">Missing Value Ratio</Label>
					<div className="flex items-center gap-3">
						<Slider
							id="missing"
							min={0}
							max={50}
							value={[state.missingPct]}
							onValueChange={v => setState(s => ({ ...s, missingPct: v[0] ?? 0 }))}
							className="eh-transition"
							aria-label="Missing value ratio"
						/>
						<span className="text-sm tabular-nums">{state.missingPct}%</span>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="event-type">Event Type</Label>
					<Select value={state.eventType} onValueChange={v => setState(s => ({ ...s, eventType: v as EventType }))}>
						<SelectTrigger id="event-type" className="w-full eh-transition">
							<SelectValue placeholder="Select an event type" />
						</SelectTrigger>
						<SelectContent className="eh-transition">
							<SelectGroup>
								<SelectLabel>Cosmic Event</SelectLabel>
								<SelectItem value="WIMP-like">WIMP-like</SelectItem>
								<SelectItem value="Axion-like">Axion-like</SelectItem>
								<SelectItem value="Sterile Neutrino Background">Sterile Neutrino Background</SelectItem>
								<SelectItem value="Gamma Ray Background">Gamma Ray Background</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="file-type">File Type</Label>
					<Select value={state.fileType} onValueChange={v => setState(s => ({ ...s, fileType: v as FileType }))}>
						<SelectTrigger id="file-type" className="w-full eh-transition">
							<SelectValue placeholder="Choose file type" />
						</SelectTrigger>
						<SelectContent className="eh-transition">
							<SelectGroup>
								<SelectLabel>Format</SelectLabel>
								<SelectItem value="JSON">JSON</SelectItem>
								<SelectItem value="CSV">CSV</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div className="md:col-span-2 mt-2">
					<div className="relative inline-block">
						<EHButton
							type="submit"
							disabled={isGenerating}
							className={cn(
								"eh-transition",
								"hover:shadow-[0_0_0_1px_color-mix(in_oklch,var(--color-primary)_60%,transparent),0_0_28px_color-mix(in_oklch,var(--color-primary)_45%,transparent)]",
							)}
						>
							{isGenerating ? "Generating…" : "Generate Data"}
						</EHButton>
					</div>
				</div>
			</form>

			{fileUrl && (
				<div className="mt-6">
					<h3 className="text-xl mb-2">Generated Data</h3>
                    {fileName && <p className="text-sm text-muted-foreground mb-1">File: {fileName}</p>}
					<a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
						Download File
					</a>
					{fileContent && (
						<pre className="bg-gray-900 text-white p-4 rounded max-h-96 overflow-auto mt-2">
							{fileContent}
						</pre>
					)}
				</div>
			)}
		</EHPanel>
	)
}