import Chat from "../models/chat.js";
import { isDbConnected } from "../lib/database.js";
import { safeSend, cleanupConnection } from "./connection-manager.js";

const SYSTEM_PROMPT = `
You are Sumanize, a friendly AI assistant focused on conversation and
summaries.

Behavior
1. Chat: If the user greets, asks a question, or makes a short statement,
   reply conversationally. Use normal formatting (paragraphs, bold, lists).
   Never apply the summary format.
2. Summarize: If the user provides long text or code, automatically
   summarize it using the rules below.

Summary Format
General Text
- Start with "### Summary".
- Use numbered main points. Each begins with a **bold heading** followed by a
  concise explanation. Indent bullets for sub-details.
- End with "### Key Takeaways" and a bullet list.

Code
- Start with "### Code Summary".
- 1. Purpose
  2. Key Components (bullets per item)
  3. Logic Flow
  4. Usage/Example
- Finish with "### Key Takeaways" and a bullet list.

Off-Topic
If asked to do anything outside chat or summarization, respond exactly:
"My apologies, but I am Sumanize, an AI designed for conversation and text
summarization. I can't assist with that request, but I would be happy to chat
or summarize any content you provide."
`;

const handleMessage = async (ws, data, model, chatId, userId) => {
  try {
    if (!isDbConnected()) {
      safeSend(ws, { error: "Database connection lost" });
      return;
    }

    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (parseError) {
      console.error("Invalid JSON received:", parseError);
      safeSend(ws, { error: "Invalid message format" });
      return;
    }

    if (
      message.type !== "message" ||
      !message.content ||
      typeof message.content !== "string"
    ) {
      safeSend(ws, { error: "Invalid message structure" });
      return;
    }

    const chatPromise = Chat.findOne({ chatId, userId }).lean().maxTimeMS(5000);
    const chat = await Promise.race([
      chatPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 6000),
      ),
    ]);

    if (!chat) {
      safeSend(ws, { error: "Chat not found or access denied" });
      return;
    }

    console.log(
      `Processing message for chat ${chatId} (${chat.messages?.length || 0} previous messages)`,
    );

    const conversationHistory = [];

    conversationHistory.push({
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }],
    });
    conversationHistory.push({
      role: "model",
      parts: [
        {
          text: "I understand. I will follow these guidelines strictly in all our interactions. How can I help you today?",
        },
      ],
    });

    if (chat.messages && Array.isArray(chat.messages)) {
      for (const msg of chat.messages.slice(-18)) {
        if (msg.role && msg.content && typeof msg.content === "string") {
          conversationHistory.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content.substring(0, 8000) }],
          });
        }
      }
    }

    let chatSession;
    try {
      chatSession = model.startChat({
        history: conversationHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
          candidateCount: 1,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      });
    } catch (modelError) {
      console.error("Failed to create chat session:", modelError);
      safeSend(ws, { error: "Failed to initialize AI chat session" });
      return;
    }

    const messageContent = message.content.substring(0, 15000);
    let fullResponse = "";
    let chunkCount = 0;

    try {
      const responseTimeout = setTimeout(() => {
        console.error("AI response timeout for chat", chatId);
        safeSend(ws, { error: "Response timeout" });
        cleanupConnection(ws, "Response timeout");
      }, 45000);

      const result = await chatSession.sendMessageStream(messageContent);

      for await (const chunk of result.stream) {
        if (ws.readyState !== ws.OPEN) {
          clearTimeout(responseTimeout);
          console.log("Connection closed during streaming");
          return;
        }

        const chunkText = chunk.text();
        if (chunkText && chunkText.length > 0) {
          fullResponse += chunkText;
          chunkCount++;

          const sent = safeSend(ws, {
            type: "chunk",
            text: chunkText,
            chunkIndex: chunkCount,
          });

          if (!sent) {
            clearTimeout(responseTimeout);
            console.log("Failed to send chunk, connection likely closed");
            return;
          }
        }
      }

      clearTimeout(responseTimeout);

      if (!fullResponse || fullResponse.length === 0) {
        safeSend(ws, { error: "Empty response generated" });
        return;
      }

      safeSend(ws, {
        type: "complete",
        content: fullResponse,
        totalChunks: chunkCount,
      });

      console.log(
        `Response completed for chat ${chatId} (${chunkCount} chunks, ${fullResponse.length} chars)`,
      );
    } catch (streamError) {
      console.error("Streaming error:", streamError);
      safeSend(ws, {
        error: "Failed to generate response",
        details: streamError.message || "Unknown streaming error",
      });
    }
  } catch (error) {
    console.error(`Message processing error for ${ws.connectionId}:`, error);
    safeSend(ws, {
      error: "Internal server error",
      details: error.message || "Unknown error",
    });
  }
};

export { handleMessage };
