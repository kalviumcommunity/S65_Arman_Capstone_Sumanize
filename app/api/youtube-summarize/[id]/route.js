import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import YT from "@/models/Youtube";
import { YoutubeTranscript } from "youtube-transcript";
import { callGemini } from "@/lib/gemini";

export async function GET(request, { params }) {
  await connectDB();
  const doc = await YT.findById(params.id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(request, { params }) {
  await connectDB();
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  const vid = new URL(url).searchParams.get("v");
  if (!vid) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

  const transcript = await YoutubeTranscript.fetchTranscript(vid);
  const text = transcript.map((p) => p.text).join(" ");
  const prompt = `Summarize in markdown:\n\n${text}`;
  const summary = await callGemini(prompt);

  const updated = await YT.findByIdAndUpdate(
    params.id,
    { url, text, summary },
    { new: true },
  );
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  await connectDB();
  const deleted = await YT.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
