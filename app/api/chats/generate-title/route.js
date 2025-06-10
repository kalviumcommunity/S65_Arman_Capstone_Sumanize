import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable not set");
      return Response.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const { message } = await req.json();

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // Limit message length for title generation
    const truncatedMessage =
      message.length > 500 ? message.substring(0, 500) + "..." : message;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: {
        parts: [
          {
            text: `You are a helpful assistant that generates short, descriptive titles for chat conversations. 
            
            Your task is to create a concise title that captures the main topic or intent of the user's message. 
            
            Rules:
            - Keep titles under 10 words and more than 5 words
            - Be descriptive but concise
            - Focus on the main topic or question
            - Don't use quotation marks or special formatting
            - Make it suitable for a chat tab title
            - If it's a greeting or simple question, try to infer the likely topic`,
          },
        ],
      },
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
      },
    });

    const prompt = `Generate a short, descriptive title for a chat conversation based on this user message:

"${truncatedMessage}"

Respond with only the title, nothing else. Minimum 5 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();

    // Ensure title is not too long and clean it up
    title = title
      .replace(/['"]/g, "") // Remove quotes
      .replace(/^Title:\s*/i, "") // Remove "Title:" prefix if present
      .replace(/^\d+\.\s*/, "") // Remove numbered list prefix like "1. "
      .replace(/^[\-\*]\s*/, "") // Remove bullet point prefix
      .trim();

    // If title is empty or too generic, create a fallback
    if (
      !title ||
      title.toLowerCase().includes("new chat") ||
      title.length < 3
    ) {
      // Extract key words from the message for a simple fallback
      const words = truncatedMessage.split(" ").slice(0, 3);
      title = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    const finalTitle =
      title.length > 50 ? title.substring(0, 47) + "..." : title;

    return Response.json({ title: finalTitle || "New Chat" });
  } catch (error) {
    console.error("Error generating chat title:", error);

    // Return a fallback title instead of failing
    return Response.json({ title: "New Chat" });
  }
}
