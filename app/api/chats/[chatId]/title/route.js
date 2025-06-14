import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request, { params }) {
  const session = await auth();

  const rateLimitResult = await checkRateLimit(request, session);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: rateLimitResult.error,
        rateLimited: true,
        title: "New Chat",
      },
      { status: 429 },
    );
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, pastedContent } = await request.json();
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    const googleAiKey =
      process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!googleAiKey) {
      console.error(
        "Google AI API key not found. Checked GOOGLE_AI_API_KEY and GEMINI_API_KEY",
      );
      return NextResponse.json(
        {
          error: "AI service configuration error",
          title: "New Chat",
        },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(googleAiKey);

    await connectDB();

    const chat = await Chat.findOne({
      chatId: params.chatId,
      userId: session.user.id,
    });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt;
    if (pastedContent && pastedContent.trim().length > 0) {
      const contentPreview = pastedContent.substring(0, 1000);
      prompt = `Based on this content and user request, generate a short, descriptive title (max 50 characters) for a chat conversation. Focus on the main topic of the content being analyzed. Only return the title, nothing else:

Content being analyzed: "${contentPreview}${pastedContent.length > 1000 ? "..." : ""}"

User request: "${message.trim()}"`;
    } else {
      prompt = `Based on this user message, generate a short, descriptive title (max 50 characters) for a chat conversation. Only return the title, nothing else:

"${message.trim()}"`;
    }

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

    return NextResponse.json({ title, usage: rateLimitResult.usage });
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
