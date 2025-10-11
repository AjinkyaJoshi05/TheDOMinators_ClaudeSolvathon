import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { datasetPath, userPrompt } = body

    // Replace with your real API endpoint
    const EXPLAIN_SERVICE_URL = process.env.Explain_URL;
    const llmResponse = await fetch(`${EXPLAIN_SERVICE_URL}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datasetPath, userPrompt }),
    })

    if (!llmResponse.ok)
      throw new Error(`Explain API returned ${llmResponse.status}`)

    const data = await llmResponse.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("Error in explain API:", err)
    return NextResponse.json({ error: "Failed to get explanation" }, { status: 500 })
  }
}
