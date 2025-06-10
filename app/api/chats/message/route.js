import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat-model";
import User from "@/models/user-model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await user.resetUsageIfNeeded();
    const rateLimits = user.getRateLimits();

    if (user.usage.messagesToday >= rateLimits.messagesPerDay) {
      return Response.json(
        {
          error:
            "Daily message limit reached. Please try again tomorrow or upgrade your plan.",
        },
        { status: 429 },
      );
    }

    const { chatId, message, history } = await req.json();

    if (!chatId || !message) {
      return Response.json(
        { error: "Missing chatId or message" },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    let mongoUserId;

    try {
      mongoUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Invalid user ID format:", userId);
      return Response.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    const updateResult = await Chat.updateOne(
      { userId: mongoUserId, chatId: chatId },
      {
        $push: { messages: userMessage },
        $set: { updatedAt: new Date() },
      },
    );

    if (updateResult.matchedCount === 0) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    user.usage.messagesToday += 1;
    await user.save();

    // Check if this is the first user message in the chat and generate a title
    const chat = await Chat.findOne({ userId: mongoUserId, chatId: chatId });
    const isFirstMessage = chat && chat.messages.length === 1; // Only the user message we just added

    if (isFirstMessage) {
      try {
        // Generate title based on the first message
        const titleResponse = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/chats/generate-title`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: message }),
          },
        );

        if (titleResponse.ok) {
          const { title } = await titleResponse.json();
          if (title && title !== "New Chat") {
            // Update the chat title in the database
            await Chat.updateOne(
              { userId: mongoUserId, chatId: chatId },
              { $set: { title: title } },
            );
          }
        }
      } catch (titleError) {
        console.error("Error generating chat title:", titleError);
        // Continue with the normal flow even if title generation fails
      }
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: {
        parts: [
          {
            text: "You are a helpful AI assistant. Provide clear, concise, and useful responses.",
          },
        ],
      },
    });

    const conversationHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    conversationHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    const result = await model.generateContentStream({
      contents: conversationHistory,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponse = "";

        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              fullResponse += chunkText;
              const data = JSON.stringify({ content: chunkText });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          const aiMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: fullResponse,
            timestamp: new Date(),
          };

          await Chat.updateOne(
            { userId: mongoUserId, chatId: chatId },
            {
              $push: { messages: aiMessage },
              $set: { updatedAt: new Date() },
            },
          );

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ status: "completed" })}\n\n`,
            ),
          );
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "AI response error" })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in message API:", error);
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
