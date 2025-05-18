import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const prompt = `Generate a concise title (no more than seven words) that captures the main topic 
    of the following text:\n\n${text}`;
    const generated = await callGemini(prompt);

    const title = generated
      .trim()
      .replace(/\*+/g, "")
      .split(/\s+/)
      .slice(0, 7)
      .join(" ");

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Error generating title:", error);
    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 },
    );
  }
}
