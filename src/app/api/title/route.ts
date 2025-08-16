import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  const {
    source,
    summary,
    model: modelType = "gemini-2.0-flash",
  } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not found" },
      { status: 500 },
    );
  }

  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const instruction = `You are a title generator for summaries. Create a concise, descriptive title in Title Case, 4-8 words. Do not add quotes or trailing punctuation. Output only the title.`;
  const content = `Source:\n${String(source ?? "").slice(0, 4000)}\n\nSummary:\n${String(summary ?? "").slice(0, 4000)}`;

  try {
    const response = await genAI.models.generateContent({
      model: modelType,
      contents: [{ role: "user", parts: [{ text: content }] }],
      config: {
        systemInstruction: instruction,
        temperature: 0.3,
        maxOutputTokens: 32,
      },
    });

    const title: string =
      (response.text as string | undefined)?.trim() || "Untitled";
    return NextResponse.json({ title });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to generate title",
        details: error?.message ?? String(error),
      },
      { status: 500 },
    );
  }
}
