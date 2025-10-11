import { NextRequest, NextResponse } from "next/server"
import dotenv from "dotenv"
dotenv.config()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { rows, missingPct, eventType, fileType, mock = true } = body
    
    const backendUrl = `${process.env.BACKEND_API_URL}/api/dataset/generate`
    console.log("Calling backend at:", backendUrl)
    

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, missingPct, eventType, fileType, mock }),
    })

    if (!backendResponse.ok) {
      const text = await backendResponse.text()
      console.error("Backend error response:", text)
      return NextResponse.json(
        { error: `Backend returned ${backendResponse.status}` },
        { status: 500 }
      )
    }

    const result = await backendResponse.json()
    const fileUrl = result.data.file_url

    return NextResponse.json({ fileUrl })

  } catch (err) {
    console.error("Error in API:", err)
    return NextResponse.json(
      { error: "Failed to generate dataset" },
      { status: 500 }
    )
  }
}
