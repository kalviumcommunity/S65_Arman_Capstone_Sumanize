import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";

export async function POST(request, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    await connectDB();

    const chat = await Chat.findOne({
      chatId: params.chatId,
      userId: session.user.id,
    });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Based on this user message, generate a short, descriptive title (max 50 characters) for a chat conversation. Only return the title, nothing else:

"${message.trim()}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();

    title = title.replace(/^["']|["']$/g, "");
    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }

    if (title.length < 3) {
      title = "New Chat";
    }

    await Chat.updateOne(
      { chatId: params.chatId, userId: session.user.id },
      { title: title },
    );

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Error generating title:", error);
    return NextResponse.json(
      {
        error: "Failed to generate title",
        title: "New Chat",
      },
      { status: 500 },
    );
  }
}
