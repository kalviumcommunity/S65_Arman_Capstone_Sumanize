import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractPDFText, validateFile } from "../../utils/content-extractor.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file");

    // Validate file
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    try {
      validateFile(file, 15); // 15MB limit for PDFs
    } catch (error) {
      return Response.json(
        {
          error: "File validation failed",
          details: error.message,
        },
        { status: 400 },
      );
    }

    // Extract text from PDF
    let extractedText;
    try {
      extractedText = await extractPDFText(file);
    } catch (error) {
      return Response.json(
        {
          error: "Failed to extract text from PDF",
          details: error.message,
        },
        { status: 400 },
      );
    }

    // Check if extracted text is sufficient
    if (!extractedText || extractedText.length < 100) {
      return Response.json(
        {
          error: "No sufficient text content found",
          details:
            "The PDF may be image-based, encrypted, or contain no readable text",
        },
        { status: 400 },
      );
    }

    // Truncate if too long (keep under token limits)
    if (extractedText.length > 40000) {
      extractedText = extractedText.substring(0, 40000) + "... [truncated]";
    }

    // Configure Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: `You are Sumanize, an AI that creates concise, clear summaries of PDF documents.

When summarizing:
- Extract the main topics and key points
- Use bullet points for clarity
- Highlight important findings and conclusions
- Maintain document structure and flow
- Keep it comprehensive but digestible
- Maintain a friendly, professional tone`,
    });

    // Generate summary
    const prompt = `Please provide a comprehensive summary of this PDF document:

${extractedText}

Focus on the main topics, key arguments, important data, and conclusions.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // Return response
    return Response.json({
      summary,
      fileName: file.name,
      fileSize: file.size,
      extractedTextLength: extractedText.length,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("PDF API Error:", error);

    // Handle specific error types
    if (error.message?.includes("API key not valid")) {
      return Response.json({ error: "Invalid API Key" }, { status: 401 });
    }

    if (error.status === 429) {
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    return Response.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
