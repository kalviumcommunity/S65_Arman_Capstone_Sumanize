import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Ably from "ably";
import { processAIResponseWithCitations } from "@/lib/citation-processor";
import { checkRateLimit } from "@/lib/rate-limiter";

const SYSTEM_PROMPT = `
You are Sumanize, a friendly AI assistant focused on creating clear, structured summaries and analysis. You help users with various tasks including:

1. **Summarization**: Create concise summaries of long texts, articles, or documents
2. **Analysis**: Analyze content and provide insights
3. **Q&A**: Answer questions clearly and helpfully
4. **General Conversation**: Engage in natural dialogue

**FORMATTING GUIDELINES:**
- Always use bullet points for summaries and key information
- Be concise but comprehensive in your analysis
- Ask follow-up questions if you need clarification
- Be helpful and friendly in tone
- If you don't know something, say so honestly

**CITATION INSTRUCTIONS FOR PASTED CONTENT:**
When analyzing pasted documents or content:
1. Structure your response using bullet points for key insights
2. Add citation markers [1], [2], [3], etc. immediately after each bullet point to reference the source material
3. Each bullet point should have ONE citation that points to the relevant section of the source
4. At the end of your response, include a CITATIONS section with brief quotes from the source
5. Format like this:

• Key insight about the content [1]
• Another important point from the analysis [2]
• Third major finding [3]

CITATIONS:
[1] "Brief relevant quote from source material"
[2] "Another supporting quote from the source"
[3] "Third quote that supports the finding"

This helps users verify your analysis against the original content and understand where each insight comes from.

How can I help you today?
`;

const CITATION_PROMPT_ADDITION = `

IMPORTANT: Please structure your response using bullet points for key insights, with each bullet point followed by a citation marker [1], [2], etc. After your analysis, include a CITATIONS section with brief quotes from the source material that support each bullet point.`;

export async function POST(request) {
  try {
    const session = await auth();
    const rateLimitResult = await checkRateLimit(request, session);

    if (!rateLimitResult.allowed) {
      console.log("Rate limit exceeded:", {
        error: rateLimitResult.error,
        usage: rateLimitResult.usage,
        resetTime: rateLimitResult.resetTime,
      });

      return NextResponse.json(
        {
          error: rateLimitResult.error,
          rateLimited: true,
          usage: rateLimitResult.usage,
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 },
      );
    }

    if (!session?.user?.id) {
      console.log("Authentication failed: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    await connectDB();

    const chat = await Chat.findOne({
      chatId,
      userId: session.user.id,
    }).lean();

    if (!chat) {
      console.log("Chat not found:", { chatId, userId: session.user.id });
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (!process.env.ABLY_API_KEY) {
      console.error("ABLY_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const ably = new Ably.Rest(process.env.ABLY_API_KEY);
    const aiChannel = ably.channels.get(
      `ai-responses:${session.user.id}:${chatId}`,
    );
    const statusChannel = ably.channels.get(
      `ai-status:${session.user.id}:${chatId}`,
    );

    await statusChannel.publish("ai-started", {
      type: "processing-started",
      chatId,
      usage: rateLimitResult.usage,
      timestamp: new Date().toISOString(),
    });

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

    const genAI = new GoogleGenerativeAI(googleAiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const conversationHistory = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I understand. I will create structured summaries using bullet points with citations when analyzing pasted content. How can I help you today?",
          },
        ],
      },
    ];

    if (chat.messages && Array.isArray(chat.messages)) {
      for (const msg of chat.messages.slice(-18)) {
        if (msg.role && msg.content && typeof msg.content === "string") {
          let messageContent = msg.content;

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

    let fullResponse = "";
    let chunkCount = 0;

    let aiMessage = message.content;
    if (message.pastedContent) {
      aiMessage = `Here is the content to analyze:\n\n${message.pastedContent}\n\n${message.content}${CITATION_PROMPT_ADDITION}`;
    }

    const result = await chatSession.sendMessageStream(
      aiMessage.substring(0, 15000),
    );

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText && chunkText.length > 0) {
        fullResponse += chunkText;
        chunkCount++;

        await aiChannel.publish("ai-chunk", {
          type: "chunk",
          text: chunkText,
          chunkIndex: chunkCount,
          chatId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    let processedResponse = {
      content: fullResponse,
      citations: [],
      hasCitations: false,
    };
    if (message.pastedContent) {
      processedResponse = processAIResponseWithCitations(
        fullResponse,
        message.pastedContent,
      );
    }

    await aiChannel.publish("ai-complete", {
      type: "complete",
      content: processedResponse.content,
      citations: processedResponse.citations,
      hasCitations: processedResponse.hasCitations,
      totalChunks: chunkCount,
      usage: rateLimitResult.usage,
      chatId,
      timestamp: new Date().toISOString(),
    });

    await statusChannel.publish("ai-completed", {
      type: "processing-completed",
      chatId,
      messageLength: processedResponse.content.length,
      usage: rateLimitResult.usage,
      timestamp: new Date().toISOString(),
    });

    const assistantMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: processedResponse.content,
      citations: processedResponse.hasCitations
        ? processedResponse.citations
        : undefined,
      timestamp: new Date(),
    };

    await Chat.updateOne(
      { chatId, userId: session.user.id },
      { $push: { messages: assistantMessage } },
    );

    return NextResponse.json({
      success: true,
      messageId: assistantMessage.id,
      chunkCount,
      responseLength: fullResponse.length,
      usage: rateLimitResult.usage,
    });
  } catch (error) {
    console.error("=== AI processing error ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

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
