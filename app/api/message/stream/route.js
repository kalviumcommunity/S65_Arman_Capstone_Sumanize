import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

const CONFIG = {
  MODEL_NAME: "gemini-1.5-flash-latest",
  MAX_TOKENS: 8192,
  TEMPERATURE: 0.3,
  TOP_P: 0.8,
  TOP_K: 40,
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION_TEXT =
  `You are Sumanize, a specialized AI assistant with a friendly, semi-formal, and respectful tone. Your single purpose is to help users understand large texts by creating exceptionally clear and well-structured summaries.

## Core Directive: Summarization

When a user provides text, your primary function is to distill it into a concise, easy-to-digest summary. Your response MUST strictly follow the formatting guidelines below.

## Formatting and Structure Requirements

You MUST format your entire summary using Markdown according to these specific rules:

1.  **Main Heading:** Begin the summary with a Level 3 Markdown heading that reads exactly: \`### Overview\`

2.  **Primary Points:** Create a bulleted list for the main ideas. Each main idea must:
    *   Start with an asterisk (` *
    `).
    *   Immediately state the core concept, which MUST be **bolded** using double asterisks.
    *   Follow the bolded text with a concise, one-to-two-sentence explanation on the same line.

3.  **Supporting Details (Optional):** If a primary point has specific examples, data, or components that require further breakdown, list them as indented, nested bullet points directly below it. Use a hyphen (` -
  `) for these sub-bullets.

## Interaction Rules

*   **On-Topic Requests:** When a user provides text to be summarized, generate the summary immediately according to the rules above.
*   **Off-Topic Requests:** If a user asks a question unrelated to text summarization (e.g., "What is the weather?", "Write me a poem"), you MUST politely decline and restate your purpose. Respond with: "My apologies, but I am Sumanize, an AI designed specifically for summarizing text. I can't assist with that request, but I would be happy to summarize any content you provide."
`;

function validateInput(prompt, history) {
  const errors = [];

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    errors.push("Prompt is required and must be a non-empty string.");
  }

  if (prompt && prompt.length > 50000) {
    errors.push("Prompt exceeds maximum length of 50,000 characters.");
  }

  if (history && !Array.isArray(history)) {
    errors.push("History must be an array.");
  }

  if (history && history.length > 50) {
    errors.push("Chat history is too long. Maximum 50 messages allowed.");
  }

  return errors;
}

function createErrorResponse(message, status = 500, details = null) {
  const errorObj = { error: message };
  if (details) errorObj.details = details;

  return new Response(JSON.stringify(errorObj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const rateLimitMap = new Map();
function checkRateLimit(identifier) {
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 10;

  const requests = rateLimitMap.get(identifier) || [];
  const validRequests = requests.filter((time) => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    return false;
  }

  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  return true;
}

export async function POST(req) {
  try {
    const clientId = req.headers.get("x-forwarded-for") || "anonymous";
    if (!checkRateLimit(clientId)) {
      return createErrorResponse(
        "Rate limit exceeded. Please try again later.",
        429,
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable not set");
      return createErrorResponse("API key not configured.", 500);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return createErrorResponse("Invalid JSON payload.", 400);
    }

    const { prompt, history } = body;

    const validationErrors = validateInput(prompt, history);
    if (validationErrors.length > 0) {
      return createErrorResponse("Validation failed", 400, validationErrors);
    }

    const model = genAI.getGenerativeModel({
      model: CONFIG.MODEL_NAME,
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION_TEXT }],
      },
      generationConfig: {
        maxOutputTokens: CONFIG.MAX_TOKENS,
        temperature: CONFIG.TEMPERATURE,
        topP: CONFIG.TOP_P,
        topK: CONFIG.TOP_K,
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

    const chatHistory = (history || [])
      .filter((item) => item && item.role && item.text)
      .slice(-20)
      .map((item) => ({
        role: item.role === "ai" ? "model" : "user",
        parts: [{ text: String(item.text).slice(0, 10000) }],
      }));

    const generationArgs = {
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: prompt.trim() }] },
      ],
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION_TEXT }],
      },
    };

    const stream = await model.generateContentStream(generationArgs);

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let hasStarted = false;

        try {
          for await (const chunk of stream.stream) {
            if (!hasStarted) {
              hasStarted = true;
              const startData = `data: ${JSON.stringify({ status: "started" })}\n\n`;
              controller.enqueue(encoder.encode(startData));
            }

            if (chunk?.text) {
              const text =
                typeof chunk.text === "function" ? chunk.text() : chunk.text;
              if (text && text.trim()) {
                const sseFormattedData = `data: ${JSON.stringify({ text })}\n\n`;
                controller.enqueue(encoder.encode(sseFormattedData));
              }
            }
          }

          const endData = `data: ${JSON.stringify({ status: "completed" })}\n\n`;
          controller.enqueue(encoder.encode(endData));
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          const sseError = `data: ${JSON.stringify({
            error: "Error processing stream from AI.",
            details: streamError.message,
          })}\n\n`;
          controller.enqueue(encoder.encode(sseError));
        } finally {
          controller.close();
        }
      },
      cancel() {
        console.log("Stream cancelled by client");
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("API Error:", error);

    let errorMessage = "Internal Server Error";
    let statusCode = 500;

    if (error.message?.includes("API key not valid")) {
      errorMessage = "Invalid API Key. Please check your configuration.";
      statusCode = 401;
    } else if (
      error.status === 404 ||
      error.message?.includes("Could not find model")
    ) {
      errorMessage = `Model '${CONFIG.MODEL_NAME}' not found. Ensure it's available for your API key.`;
      statusCode = 404;
    } else if (error.status === 429) {
      errorMessage = "API rate limit exceeded. Please try again later.";
      statusCode = 429;
    } else if (error.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please check your billing settings.";
      statusCode = 429;
    } else if (error.message) {
      errorMessage = error.message;
      statusCode = error.status || 500;
    }

    return createErrorResponse(errorMessage, statusCode);
  }
}
