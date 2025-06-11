import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  await connectDB();

  // Verify the chat exists and belongs to the user
  const chat = await Chat.findOne({
    chatId: params.chatId,
    userId: session.user.id,
  });
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  try {
    // Generate title using Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Based on this user message, generate a short, descriptive title (max 50 characters) for a chat conversation. Only return the title, nothing else:

"${message.trim()}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();

    // Clean up the title - remove quotes, ensure it's under 50 chars
    title = title.replace(/^["']|["']$/g, ""); // Remove surrounding quotes
    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }

    // Fallback if title is empty or too short
    if (title.length < 3) {
      title = "New Chat";
    }

    // Update the chat title in the database
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
        title: "New Chat", // Fallback title
      },
      { status: 500 },
    );
  }
}
