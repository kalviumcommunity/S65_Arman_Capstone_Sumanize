import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

interface Part {
  thought?: unknown;
  text?: string;
}

interface Content {
  parts?: Part[];
}

interface Candidate {
  content?: Content;
}

interface StreamChunk {
  text?: string;
  candidates?: Candidate[];
}

export async function POST(req: NextRequest) {
  const { message, model: modelType = "gemini-2.5-flash" } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not found" },
      { status: 500 },
    );
  }

  if (modelType !== "gemini-2.5-flash" && modelType !== "gemini-2.5-pro") {
    return NextResponse.json({ error: "Invalid model type" }, { status: 400 });
  }

  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemPrompt = `You are an expert AI summarization tool. Your task is to
provide a concise and accurate summary of the provided text snippet.

Output rules:
- Return valid Markdown only.
- Keep it brief: 1-3 sentences, or 3-6 list items.
- Use lists when appropriate:
  - Unordered list (UL): use "- " for non-sequential key points.
  - Ordered list (OL): use "1. " for steps, sequences, or rankings.
- Do not include headings, titles, code blocks, or extra commentary—only the
  summary content.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const responseIterator = await genAI.models.generateContentStream({
          model: modelType,
          contents: [
            { role: "user", parts: [{ text: String(message ?? "") }] },
          ],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.5,
          },
        });

        for await (const chunk of responseIterator) {
          const streamChunk = chunk as StreamChunk;
          const text = streamChunk?.text;
          if (typeof text === "string" && text.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "response", text })}\n\n`,
              ),
            );
          }
        }
      } catch (error) {
        console.error("Gemini API error:", error);
        const errorMessage = JSON.stringify({
          error: "Stream failed",
          details: error instanceof Error ? error.message : String(error),
        });
        controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
