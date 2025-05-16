import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Text from "@/models/Text";
import { callGemini } from "@/lib/gemini";

export async function GET() {
  await connectDB();
  const items = await Text.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(request) {
  await connectDB();
  const { text } = await request.json();
  if (!text)
    return NextResponse.json({ error: "Missing text" }, { status: 400 });

  const prompt = `Summarize in markdown:\n\n${text}`;
  const summary = await callGemini(prompt);

  const doc = await Text.create({ text, summary });
  return NextResponse.json(doc);
}
