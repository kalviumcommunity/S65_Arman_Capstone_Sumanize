import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractYouTubeTranscript } from "../../utils/content-extractor.js";

const CONFIG = {
  MODEL_NAME: "gemini-1.5-flash-latest",
  MAX_TOKENS: 8192,
  TEMPERATURE: 0.3,
  TOP_P: 0.8,
  TOP_K: 40,
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION_TEXT = `You are Sumanize, a specialized AI assistant designed to create high-quality, structured summaries of YouTube video transcripts. Your tone is friendly, professional, and helpful.

## Core Mission
Your goal is to transform a raw video transcript into a clear, detailed, and easy-to-navigate summary. The output should allow a user to understand the video's key information, main arguments, and actionable insights without watching the entire video. The summary should be comprehensive and easy to understand.

## Summary Quality Guidelines
1.  **Objectivity:** Accurately reflect the content and context of the video transcript. Do not add external information or personal opinions.
2.  **Identify Core Purpose:** Distill the main topic, key arguments, demonstrations, and conclusions presented in the video.
3.  **Preserve Nuance:** Maintain the original context. Do not oversimplify complex topics.

## Strict Formatting Requirements
You MUST format your entire summary using Markdown according to these rules. There are no exceptions.

1.  **Main Heading:** Begin the summary with a Level 3 Markdown heading that reads exactly: \`### Video Summary\`

2.  **Primary Topics (Numbered List):** Use a numbered list for the main topics discussed in the video. Each topic must:
    *   Start with a number followed by a period (e.g., \`1. \`).
    *   Immediately state the core concept, which MUST be **bolded**.
    *   Follow the bolded text with a detailed, one-to-three-sentence explanation.
    *   **Crucially, end the explanation with a clickable YouTube timestamp in the format \`(MM:SS)\` or \`(HH:MM:SS)\` that points to the start of that topic in the video.**

3.  **Supporting Details (Bulleted List):** If a primary topic has specific examples, data points, or steps, list them as indented, nested bullet points directly below it.
    *   Use a hyphen for these sub-bullets, indented with two spaces (\`  - \`).

4.  **Key Takeaways Section:** After the main summary, add a final section with a Level 3 Markdown heading that reads exactly: \`### Key Takeaways\`
    *   Under this heading, create a simple, scannable bulleted list (using asterisks \`* \`) of the most important, actionable insights from the video.
`;

function createErrorResponse(
  message,
  status = 500,
  details = null,
  suggestions = null,
  helpfulVideos = null,
) {
  const errorObj = { error: message };
  if (details) errorObj.details = details;
  if (suggestions) errorObj.suggestions = suggestions;
  if (helpfulVideos) errorObj.helpfulVideos = helpfulVideos;

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
      return createErrorResponse("API key not configured", 500);
    }

    const { youtubeUrl } = await req.json();

    if (!youtubeUrl || typeof youtubeUrl !== "string") {
      return createErrorResponse("YouTube URL is required", 400);
    }

    let transcript;
    try {
      transcript = await extractYouTubeTranscript(youtubeUrl.trim());
    } catch (error) {
      let suggestions = [];

      if (error.message.includes("Invalid YouTube URL")) {
        suggestions = [
          "Make sure the URL is a valid YouTube link",
          "Try formats like: youtube.com/watch?v=ID or youtu.be/ID",
        ];
      } else if (error.message.includes("No transcript available")) {
        suggestions = [
          "This video doesn't have captions/subtitles available",
          "Try videos with auto-generated captions or manual subtitles",
          "Look for educational content, news videos, or popular creators who typically add captions",
          "Check if the video is public and not age-restricted",
        ];
      } else if (error.message.includes("private")) {
        suggestions = [
          "This video appears to be private or restricted",
          "Try using a public video instead",
        ];
      } else {
        suggestions = [
          "Try a different YouTube video",
          "Make sure the video is public and has captions enabled",
          "Educational videos and news content typically have better caption support",
        ];
      }

      return createErrorResponse(
        "Failed to extract video transcript",
        400,
        error.message,
        suggestions,
        [
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ - Rick Astley (has captions)",
          "Any TED Talk video (they usually have captions)",
          "News videos from major channels (BBC, CNN, etc.)",
          "Educational channels (Khan Academy, Crash Course, etc.)",
        ],
      );
    }

    if (!transcript || transcript.length < 50) {
      return createErrorResponse(
        "No sufficient transcript content found",
        400,
        "The video transcript is too short to generate a meaningful summary",
        [
          "Try a longer video (at least 2-3 minutes)",
          "Make sure the video has spoken content, not just music",
        ],
      );
    }

    if (transcript.length > 40000) {
      transcript = transcript.substring(0, 40000) + "... [truncated]";
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

    const prompt = `Please generate a summary for the following YouTube video transcript based on all the rules provided in your system instruction.

Video Transcript:
---
${transcript}
---`;

    const generationArgs = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const stream = await model.generateContentStream(generationArgs);

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let hasStarted = false;
        let fullSummary = "";

        try {
          const metaData = {
            status: "started",
            youtubeUrl,
            transcriptLength: transcript.length,
            processedAt: new Date().toISOString(),
          };

          const startData = `data: ${JSON.stringify(metaData)}\n\n`;
          controller.enqueue(encoder.encode(startData));

          for await (const chunk of stream.stream) {
            if (!hasStarted) {
              hasStarted = true;
            }

            if (chunk?.text) {
              const text =
                typeof chunk.text === "function" ? chunk.text() : chunk.text;
              if (text && text.trim()) {
                fullSummary += text;
                const sseFormattedData = `data: ${JSON.stringify({ text })}\n\n`;
                controller.enqueue(encoder.encode(sseFormattedData));
              }
            }
          }

          const endData = `data: ${JSON.stringify({
            status: "completed",
            summary: fullSummary,
          })}\n\n`;
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
    console.error("YouTube API Error:", error);

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
