import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractYouTubeTranscript } from "../../utils/content-extractor.js";

export const runtime = "edge";

const CONFIG = {
  MODEL_NAME: "gemini-2.0-flash-exp",
  MAX_TOKENS: 8192,
  TEMPERATURE: 0.3,
  TOP_P: 0.8,
  TOP_K: 40,
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION_TEXT = `You are Sumanize, a specialized AI assistant designed to help users understand large amounts of text efficiently. Your primary role is to distill extensive content into clear, digestible summaries.

When provided with YouTube video transcripts, your task is to:
1. Identify the most crucial pieces of information from the video content.
2. Present these as distinct bullet points.
3. For each bullet point, provide a brief and direct explanation or elaboration.
4. Include key timestamps or sections if relevant.
5. Highlight main topics, key insights, and actionable takeaways.

The overall goal is to be concise yet comprehensive in your summaries. Focus on conveying the core meaning and essential takeaways efficiently from video content. Strive for clarity and ensure your summaries are easy to understand.

Please maintain a semi-formal, respectful, and friendly tone in all your communications.`;

function validateInput(youtubeUrl) {
  const errors = [];

  if (
    !youtubeUrl ||
    typeof youtubeUrl !== "string" ||
    youtubeUrl.trim().length === 0
  ) {
    errors.push("YouTube URL is required and must be a non-empty string.");
  }

  const youtubePattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
  if (youtubeUrl && !youtubePattern.test(youtubeUrl)) {
    errors.push("Invalid YouTube URL format.");
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
  const maxRequests = 5; // Lower limit for video processing

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

    const { youtubeUrl, includeTranscript = false } = body;

    const validationErrors = validateInput(youtubeUrl);
    if (validationErrors.length > 0) {
      return createErrorResponse("Validation failed", 400, validationErrors);
    }

    // Extract transcript from YouTube video
    let transcript;
    try {
      transcript = await extractYouTubeTranscript(youtubeUrl.trim());
    } catch (error) {
      return createErrorResponse(
        "Failed to extract video transcript",
        400,
        error.message,
      );
    }

    if (!transcript || transcript.length < 10) {
      return createErrorResponse(
        "No transcript found or transcript too short",
        400,
        "The video may not have captions available or may be too short to summarize.",
      );
    }

    // Truncate transcript if too long
    const maxTranscriptLength = 45000;
    if (transcript.length > maxTranscriptLength) {
      transcript =
        transcript.substring(0, maxTranscriptLength) + "... [truncated]";
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

    const prompt = `Please provide a comprehensive summary of this YouTube video transcript:

${transcript}

Focus on:
- Main topics and themes discussed
- Key insights and takeaways
- Important facts or data mentioned
- Actionable advice or recommendations
- Overall conclusion or message`;

    const generationArgs = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const result = await model.generateContent(generationArgs);
    const summary = result.response.text();

    const responseData = {
      summary,
      youtubeUrl,
      extractedAt: new Date().toISOString(),
      transcriptLength: transcript.length,
    };

    if (includeTranscript) {
      responseData.transcript = transcript;
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
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
