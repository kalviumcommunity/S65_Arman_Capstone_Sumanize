import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Ably from "ably";

const SYSTEM_PROMPT = `
You are Sumanize, a friendly AI assistant focused on conversation and summaries. You help users with various tasks including:

1. **Summarization**: Create concise summaries of long texts, articles, or documents
2. **Analysis**: Analyze content and provide insights
3. **Q&A**: Answer questions clearly and helpfully
4. **General Conversation**: Engage in natural dialogue

Guidelines:
- Be concise but comprehensive in summaries
- Use bullet points for clarity when appropriate
- Ask follow-up questions if you need clarification
- Be helpful and friendly in tone
- If you don't know something, say so honestly
- For summaries, capture key points while maintaining readability

How can I help you today?
`;

export async function POST(request) {
  try {
    console.log("=== AI Processing API called ===");

    // Debug environment variables (without exposing actual values)
    console.log("Environment check:", {
      hasAblyKey: !!process.env.ABLY_API_KEY,
      hasGoogleAI: !!process.env.GOOGLE_AI_API_KEY,
      hasGeminiAI: !!process.env.GEMINI_API_KEY,
      hasMongoUri: !!process.env.MONGODB_URI,
    });

    const session = await auth();
    if (!session?.user?.id) {
      console.log("Authentication failed: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("User authenticated:", session.user.id);

    const { message, chatId } = await request.json();

    if (!message || !chatId) {
      console.log("Missing required fields:", {
        hasMessage: !!message,
        hasChatId: !!chatId,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    console.log("Request data valid:", {
      chatId,
      messageLength: message.content?.length,
    });

    await connectDB();
    console.log("Database connected");

    // Verify chat ownership
    const chat = await Chat.findOne({
      chatId,
      userId: session.user.id,
    }).lean();

    if (!chat) {
      console.log("Chat not found:", { chatId, userId: session.user.id });
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    console.log("Chat found:", { messagesCount: chat.messages?.length || 0 });

    // Check Ably API key
    if (!process.env.ABLY_API_KEY) {
      console.error("ABLY_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Initialize Ably for publishing responses
    const ably = new Ably.Rest(process.env.ABLY_API_KEY);
    const aiChannel = ably.channels.get(
      `ai-responses:${session.user.id}:${chatId}`,
    );
    const statusChannel = ably.channels.get(
      `ai-status:${session.user.id}:${chatId}`,
    );
    console.log("Ably initialized");

    // Publish AI processing started status
    await statusChannel.publish("ai-started", {
      type: "processing-started",
      chatId,
      timestamp: new Date().toISOString(),
    });
    console.log("AI started status published");

    // Check Google AI API key - try both possible environment variable names
    const googleAiKey =
      process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!googleAiKey) {
      console.error(
        "Google AI API key not found. Checked GOOGLE_AI_API_KEY and GEMINI_API_KEY",
      );
      return NextResponse.json(
        { error: "AI service configuration error" },
        { status: 500 },
      );
    }

    // Initialize AI model
    const genAI = new GoogleGenerativeAI(googleAiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Google AI model initialized");

    // Build conversation history
    const conversationHistory = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I understand. I will follow these guidelines strictly in all our interactions. How can I help you today?",
          },
        ],
      },
    ];

    // Add recent messages from chat history
    if (chat.messages && Array.isArray(chat.messages)) {
      for (const msg of chat.messages.slice(-18)) {
        if (msg.role && msg.content && typeof msg.content === "string") {
          let messageContent = msg.content;

          // If this is a user message with pasted content, combine them intelligently
          if (msg.role === "user" && msg.pastedContent) {
            messageContent = `Here is the content to analyze:\n\n${msg.pastedContent}\n\n${msg.content}`;
          }

          conversationHistory.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: messageContent.substring(0, 8000) }],
          });
        }
      }
    }
    console.log("Conversation history built:", {
      historyLength: conversationHistory.length,
    });

    // Start AI chat session
    const chatSession = model.startChat({
      history: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
        candidateCount: 1,
      },
    });
    console.log("Chat session started");

    let fullResponse = "";
    let chunkCount = 0;

    // Prepare message for AI
    let aiMessage = message.content;
    if (message.pastedContent) {
      aiMessage = `Here is the content to analyze:\n\n${message.pastedContent}\n\n${message.content}`;
    }

    // Stream AI response
    console.log("Starting AI message stream...");
    const result = await chatSession.sendMessageStream(
      aiMessage.substring(0, 15000),
    );

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText && chunkText.length > 0) {
        fullResponse += chunkText;
        chunkCount++;

        // Publish chunk to Ably
        await aiChannel.publish("ai-chunk", {
          type: "chunk",
          text: chunkText,
          chunkIndex: chunkCount,
          chatId,
          timestamp: new Date().toISOString(),
        });
      }
    }
    console.log("AI streaming completed:", {
      chunkCount,
      responseLength: fullResponse.length,
    });

    // Publish completion
    await aiChannel.publish("ai-complete", {
      type: "complete",
      content: fullResponse,
      totalChunks: chunkCount,
      chatId,
      timestamp: new Date().toISOString(),
    });

    // Publish AI processing completed status
    await statusChannel.publish("ai-completed", {
      type: "processing-completed",
      chatId,
      messageLength: fullResponse.length,
      timestamp: new Date().toISOString(),
    });
    console.log("Ably messages published successfully");

    // Save assistant message to database
    const assistantMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: fullResponse,
      timestamp: new Date(),
    };

    await Chat.updateOne(
      { chatId, userId: session.user.id },
      { $push: { messages: assistantMessage } },
    );
    console.log("Message saved to database");

    return NextResponse.json({
      success: true,
      messageId: assistantMessage.id,
      chunkCount,
      responseLength: fullResponse.length,
    });
  } catch (error) {
    console.error("=== AI processing error ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Try to publish error status if possible
    try {
      if (process.env.ABLY_API_KEY) {
        const ably = new Ably.Rest(process.env.ABLY_API_KEY);
        const statusChannel = ably.channels.get(
          `ai-status:${session?.user?.id}:${chatId}`,
        );
        await statusChannel.publish("ai-error", {
          type: "processing-error",
          error: error.message,
          chatId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (ablyError) {
      console.error("Failed to publish error status:", ablyError);
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
