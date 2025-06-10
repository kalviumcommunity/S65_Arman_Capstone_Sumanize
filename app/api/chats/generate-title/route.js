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

    const truncatedMessage =
      message.length > 500 ? message.substring(0, 500) + "..." : message;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: {
        parts: [
          {
            text: `You are an expert at creating concise, descriptive titles for chat conversations. Your task is to generate a title from the user's message that follows these strict rules:

1.  **Length:** The title must be between 5 and 10 words long. It should be concise but not too short.
2.  **Content:** The title must be descriptive and accurately summarize the main topic of the message.
3.  **Clarity:** A user should understand the chat's content just by reading the title.
4.  **Formatting:** Do not use quotation marks, markdown, or any other special formatting.
5.  **Output:** Respond with ONLY the generated title and nothing else. Do not add prefixes like "Title:".`,
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

    const prompt = `Generate a title for this message: "${truncatedMessage}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();

    title = title
      .replace(/['"]/g, "")
      .replace(/^Title:\s*/i, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/^[\-\*]\s*/, "")
      .trim();

    if (
      !title ||
      title.toLowerCase().includes("new chat") ||
      title.length < 3
    ) {
      const words = truncatedMessage.split(" ").slice(0, 5);
      title = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return Response.json({ title: title || "New Chat" });
  } catch (error) {
    console.error("Error generating chat title:", error);

    return Response.json({ title: "New Chat" });
  }
}
