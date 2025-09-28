// app/api/platepal/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();
    console.log(
      "Making request to Gemini with prompt:",
      prompt.substring(0, 100) + "..."
    );

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    console.log("Gemini response status:", resp.status);

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: `Gemini request failed: ${resp.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const data = await resp.json();
    console.log("Gemini response data:", JSON.stringify(data, null, 2));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return NextResponse.json({ text });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        error: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
