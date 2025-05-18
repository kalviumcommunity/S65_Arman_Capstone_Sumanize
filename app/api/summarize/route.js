import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Text from "@/models/Text";
import { callGemini } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET() {
  await connectDB();

  const user = await getCurrentUser();

  if (user) {
    const items = await Text.find({ user: user.id })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(items);
  } else {
    const items = await Text.find({ user: { $exists: false } })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(items);
  }
}

export async function POST(request) {
  await connectDB();

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { text } = await request.json();
  if (!text)
    return NextResponse.json({ error: "Missing text" }, { status: 400 });

  const prompt = `Summarize the following text in markdown format. Use appropriate markdown 
  list formatting (bullet points, numbered lists, etc.) based on the content. Avoid using only 
  paragraphs - structure the information in lists where it makes sense. When including code 
  solutions, present them in proper markdown code blocks with appropriate language syntax 
  highlighting, followed by explanations or summaries.\n\n${text}`;

  const summary = await callGemini(prompt);

  const doc = await Text.create({
    text,
    summary,
    user: user.id,
  });

  return NextResponse.json(doc);
}
