import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractYouTubeTranscript } from "../../utils/content-extractor.js";

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

    // Parse request body
    const { youtubeUrl } = await req.json();

    // Validate input
    if (!youtubeUrl || typeof youtubeUrl !== "string") {
      return Response.json(
        { error: "YouTube URL is required" },
        { status: 400 },
      );
    }

    // Extract transcript from YouTube video
    let transcript;
    try {
      transcript = await extractYouTubeTranscript(youtubeUrl.trim());
    } catch (error) {
      // Provide helpful error messages based on the type of failure
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

      return Response.json(
        {
          error: "Failed to extract video transcript",
          details: error.message,
          suggestions: suggestions,
          helpfulVideos: [
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ - Rick Astley (has captions)",
            "Any TED Talk video (they usually have captions)",
            "News videos from major channels (BBC, CNN, etc.)",
            "Educational channels (Khan Academy, Crash Course, etc.)",
          ],
        },
        { status: 400 },
      );
    }

    // Check if transcript is valid
    if (!transcript || transcript.length < 50) {
      return Response.json(
        {
          error: "No sufficient transcript content found",
          details:
            "The video transcript is too short to generate a meaningful summary",
          suggestions: [
            "Try a longer video (at least 2-3 minutes)",
            "Make sure the video has spoken content, not just music",
          ],
        },
        { status: 400 },
      );
    }

    // Truncate if too long (keep under token limits)
    if (transcript.length > 40000) {
      transcript = transcript.substring(0, 40000) + "... [truncated]";
    }

    // Configure Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: `You are Sumanize, an AI that creates concise, clear summaries of YouTube video content. 

When summarizing:
- Extract the main topics and key points
- Use bullet points for clarity
- Include important insights and takeaways
- Keep it comprehensive but digestible
- Maintain a friendly, professional tone`,
    });

    // Generate summary
    const prompt = `Please provide a comprehensive summary of this YouTube video transcript:

${transcript}

Focus on the main topics, key insights, and important takeaways.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // Return response
    return Response.json({
      summary,
      youtubeUrl,
      transcriptLength: transcript.length,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("YouTube API Error:", error);

    // Handle specific error types
    if (error.message?.includes("API key not valid")) {
      return Response.json(
        {
          error: "Invalid API Key",
          details: "Please check your Gemini API key configuration",
        },
        { status: 401 },
      );
    }

    if (error.status === 429) {
      return Response.json(
        {
          error: "Rate limit exceeded",
          details: "Too many requests. Please try again later.",
        },
        { status: 429 },
      );
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
