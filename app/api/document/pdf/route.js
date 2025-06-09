import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractPDFText, validateFile } from "../../utils/content-extractor.js";

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

When provided with PDF document content, your task is to:
1. Identify the most crucial pieces of information from the document.
2. Present these as distinct bullet points.
3. For each bullet point, provide a brief and direct explanation or elaboration.
4. Maintain the document's logical structure and flow.
5. Highlight key sections, main arguments, and important conclusions.

The overall goal is to be concise yet comprehensive in your summaries. Focus on conveying the core meaning and essential takeaways efficiently from document content. Strive for clarity and ensure your summaries are easy to understand.

Please maintain a semi-formal, respectful, and friendly tone in all your communications.`;

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
  const maxRequests = 8; // Reasonable limit for file processing

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

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return createErrorResponse("Invalid form data.", 400);
    }

    const file = formData.get("file");
    const includeExtractedText =
      formData.get("includeExtractedText") === "true";

    if (!file) {
      return createErrorResponse("No file provided.", 400);
    }

    // Validate file
    try {
      validateFile(file, 15); // 15MB limit for PDFs
    } catch (error) {
      return createErrorResponse("File validation failed", 400, error.message);
    }

    // Check if it's actually a PDF
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return createErrorResponse("Only PDF files are supported.", 400);
    }

    // Extract text from PDF
    let extractedText;
    try {
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await extractPDFText(arrayBuffer);
    } catch (error) {
      return createErrorResponse(
        "Failed to extract text from PDF",
        400,
        error.message,
      );
    }

    if (!extractedText || extractedText.length < 50) {
      return createErrorResponse(
        "No readable text found in PDF",
        400,
        "The PDF may be image-based, encrypted, or corrupted. Please try a text-based PDF.",
      );
    }

    // Truncate text if too long
    const maxTextLength = 45000;
    if (extractedText.length > maxTextLength) {
      extractedText =
        extractedText.substring(0, maxTextLength) + "... [truncated]";
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

    const prompt = `Please provide a comprehensive summary of this PDF document content:

${extractedText}

Focus on:
- Main topics and sections
- Key arguments and findings
- Important data, statistics, or evidence
- Conclusions and recommendations
- Document structure and organization`;

    const generationArgs = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const result = await model.generateContent(generationArgs);
    const summary = result.response.text();

    const responseData = {
      summary,
      fileName: file.name,
      fileSize: file.size,
      processedAt: new Date().toISOString(),
      extractedTextLength: extractedText.length,
    };

    if (includeExtractedText) {
      responseData.extractedText = extractedText;
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
    console.error("PDF API Error:", error);

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
