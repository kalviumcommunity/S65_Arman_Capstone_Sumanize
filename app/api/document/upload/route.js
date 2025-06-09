import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  extractDocumentText,
  validateFile,
} from "../../utils/content-extractor.js";

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

When provided with document content, your task is to:
1. Identify the most crucial pieces of information from the document.
2. Present these as distinct bullet points.
3. For each bullet point, provide a brief and direct explanation or elaboration.
4. Adapt to the document type and structure appropriately.
5. Highlight key information, main themes, and important details.

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
  const maxRequests = 10; // Higher limit for text files

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
      validateFile(file, 10); // 10MB limit for documents
    } catch (error) {
      return createErrorResponse("File validation failed", 400, error.message);
    }

    // Get file extension
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const supportedFormats = ["txt", "json", "csv", "md", "html", "htm"];

    if (!supportedFormats.includes(fileExtension)) {
      return createErrorResponse(
        "Unsupported file format",
        400,
        `Supported formats: ${supportedFormats.join(", ")}`,
      );
    }

    // Extract text from document
    let extractedText;
    try {
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await extractDocumentText(arrayBuffer, file.name);
    } catch (error) {
      return createErrorResponse(
        "Failed to extract text from document",
        400,
        error.message,
      );
    }

    if (!extractedText || extractedText.length < 10) {
      return createErrorResponse(
        "No readable text found in document",
        400,
        "The document appears to be empty or contains no readable text.",
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

    // Customize prompt based on file type
    let promptContext = "";
    switch (fileExtension) {
      case "json":
        promptContext =
          "This is JSON data. Focus on the structure, key-value relationships, and important data patterns.";
        break;
      case "csv":
        promptContext =
          "This is CSV data. Focus on the data structure, column relationships, and key insights from the data.";
        break;
      case "md":
        promptContext =
          "This is Markdown documentation. Focus on the structure, headings, and main content sections.";
        break;
      case "html":
      case "htm":
        promptContext =
          "This is HTML content. Focus on the main textual content and structure.";
        break;
      default:
        promptContext =
          "This is a text document. Focus on the main themes, key points, and overall message.";
    }

    const prompt = `Please provide a comprehensive summary of this ${fileExtension.toUpperCase()} document:

${promptContext}

Document content:
${extractedText}

Focus on:
- Main topics and themes
- Key information and data points
- Important insights or conclusions
- Document structure and organization
- Actionable takeaways if applicable`;

    const generationArgs = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const result = await model.generateContent(generationArgs);
    const summary = result.response.text();

    const responseData = {
      summary,
      fileName: file.name,
      fileType: fileExtension.toUpperCase(),
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
    console.error("Document API Error:", error);

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
