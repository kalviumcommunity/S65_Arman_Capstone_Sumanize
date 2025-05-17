import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Text from "@/models/Text";
import { callGemini } from "@/lib/gemini";

export async function GET(request, { params }) {
  await connectDB();
  const doc = await Text.findById(params.id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(request, { params }) {
  await connectDB();
  const { text } = await request.json();
  if (!text)
    return NextResponse.json({ error: "Missing text" }, { status: 400 });

  const prompt = `Summarize in markdown:\n\n${text}`;
  const summary = await callGemini(prompt);

  const updated = await Text.findByIdAndUpdate(
    params.id,
    { text, summary },
    { new: true },
  );
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  await connectDB();
  const deleted = await Text.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
