import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { datasetPath, userPrompt, analysisData } = body;

    if (!process.env.EXPLAIN_SERVICE_URL) {
      return NextResponse.json(
        { error: "EXPLAIN_SERVICE_URL not set in .env.local" },
        { status: 500 }
      );
    }

    // Call upstream explain service
    const response = await fetch(
      `${process.env.EXPLAIN_SERVICE_URL}/api/explain/explain`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetPath, userPrompt, analysisData }),
      }
    );

    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = text;
    }

    if (!response.ok) {
      // Log upstream error
      console.error("Upstream Explain API error:", response.status, data);
      return NextResponse.json(
        { error: "Upstream Explain API error", status: response.status, detail: data },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Explain API route failed:", err);
    return NextResponse.json({ error: "Explain API route failed", detail: String(err) }, { status: 500 });
  }
}
