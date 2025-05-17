import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import YT from "@/models/Youtube";
import { YoutubeTranscript } from "youtube-transcript";
import { callGemini } from "@/lib/gemini";

export async function GET() {
  await connectDB();
  const items = await YT.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(request) {
  await connectDB();
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  const vid = new URL(url).searchParams.get("v");
  if (!vid) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

  const transcript = await YoutubeTranscript.fetchTranscript(vid);
  const text = transcript.map((p) => p.text).join(" ");
  const prompt = `Summarize in markdown:\n\n${text}`;
  const summary = await callGemini(prompt);

  const doc = await YT.create({ url, text, summary });
  return NextResponse.json(doc);
}
