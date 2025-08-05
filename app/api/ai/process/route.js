import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Ably from "ably";
import { processAIResponseWithCitations } from "@/lib/citation-processor";
import { checkRateLimit } from "@/lib/rate-limiter";

const SYSTEM_PROMPT = `
You are a highly accurate data extraction assistant. Your task is to extract specific fields from a pasted PDF resume or document. The user will paste the full text content of a PDF into a text area. You must:

- Extract **only** the fields listed below, in the exact order given.
- For each field, output the field name in bold, followed by a colon, then the extracted value.
- Each field must be a separate bullet point in Markdown (\`-\`).
- If a field is not present or cannot be confidently extracted, output a single dash ("-") as the value.
- **After each field value, add a citation marker** in square brackets (e.g., [1], [2], etc.) that points to the relevant section of the source text.
- At the end, include a **CITATIONS** section, listing each citation marker with a brief quote from the source text that supports the extracted value.
- **Do not output any information or commentary other than the required fields and citations.**
- **Do not guess or infer values that are not explicitly present in the source text.**
- If a field is ambiguous, leave it blank ("-") and cite the most relevant text.

**FIELDS TO EXTRACT (output in this exact order):**
First Name : 	
Middle Name : 	
Last Name : 	
Date of Birth : 	
Gender : 	
Nationality : 	
Maritial Status : 	
Passport : 	
Hobbies : 	
Languages Known : 	
Address : 	
Landmark : 	
City : 	
State : 	
Pin Code : 	
Mobile : 	
Email Id : 	
SSC Result : 	
SSC Board/University : 	
SSC Passing Year : 	
HSC Result : 	
HSC Board/University : 	
HSC Passing Year : 	
Diploma : 	
Graduation Degree : 	
Graduation Result : 	
Graduation University : 	
Graduation Year : 	
Post-Graduation Degree : 	
Post-Graduation Result : 	
Post-Graduation University : 	
Post-Graduation Year : 	
Highest Level of Education : 	
Total Work Exp (Years) : 	
Total Work Exp (Month) : 	
Total Companies worked for : 	
Last/Current Employer : 

**OUTPUT FORMAT:**
\`\`\`markdown
- **First Name:** <value> [1]
- **Middle Name:** <value> [2]
- **Last Name:** <value> [3]
- **Date of Birth:** <value> [4]
...
- **Last/Current Employer:** <value> [37]

**CITATIONS:**
[1] "Relevant quote from source"
[2] "Relevant quote from source"
...
[37] "Relevant quote from source"
\`\`\`

**ADDITIONAL INSTRUCTIONS:**
- Do not include any fields not listed above.
- Do not include any explanation, summary, or commentary.
- For each field, the citation must be a direct quote from the source text that supports the value.
- If the value is "-", the citation should be the most relevant text or a note such as "Not found in source".
- Do not attempt to infer gender, nationality, or other fields unless they are explicitly stated.
- If the name is split across multiple lines, combine them as appropriate.
- For addresses, extract the full address as given, and split out city, state, and pin code if possible.
- For education fields, match the degree, result, university, and year as closely as possible.
- For work experience, only extract what is explicitly stated.

**EXAMPLE OUTPUT:**
\`\`\`markdown
- **First Name:** Samiksha [1]
- **Middle Name:** - [2]
- **Last Name:** Khera [3]
- **Date of Birth:** October 14, 1997 [4]
- **Gender:** - [5]
- **Nationality:** - [6]
- **Maritial Status:** Single [7]
- **Passport:** - [8]
- **Hobbies:** Cooking, Colouring, Dancing [9]
- **Languages Known:** English, Hindi, Punjabi [10]
- **Address:** 1008, ward number 8, Lohian Khas, Distt. Jalandhar. pincode 144629 [11]
- **Landmark:** - [12]
- **City:** Lohian Khas [13]
- **State:** Punjab [14]
- **Pin Code:** 144629 [15]
- **Mobile:** +91- 73472 - 85154 [16]
- **Email Id:** samikshakhera97@gmail.com [17]
- **SSC Result:** 70% [18]
- **SSC Board/University:** ICSE BOARD [19]
- **SSC Passing Year:** 2014 [20]
- **HSC Result:** 65% [21]
- **HSC Board/University:** CBSE BOARD [22]
- **HSC Passing Year:** 2016 [23]
- **Diploma:** - [24]
- **Graduation Degree:** Bachelors of business administration(BBA) [25]
- **Graduation Result:** 66% [26]
- **Graduation University:** CT GROUP OF HIGHER STUDIES(JALANDHAR) [27]
- **Graduation Year:** 2019 [28]
- **Post-Graduation Degree:** Master of business administration (MBA) [29]
- **Post-Graduation Result:** 68% [30]
- **Post-Graduation University:** GURU NANAK DEV UNIVERSITY(AMRITSAR) [31]
- **Post-Graduation Year:** 2021 [32]
- **Highest Level of Education:** Master of business administration (MBA) [33]
- **Total Work Exp (Years):** - [34]
- **Total Work Exp (Month):** - [35]
- **Total Companies worked for:** 5 [36]
- **Last/Current Employer:** Innovative Financial Management FinCoach (IFM FinCoach Global Pvt. Ltd.)Chandigarh [37]

**CITATIONS:**
[1] "SAMIKSHA"
[2] "Not found in source"
[3] "KHERA"
[4] "Date of birth: October 14, 1997"
[5] "Not found in source"
[6] "Not found in source"
[7] "Marital status: Single."
[8] "Not found in source"
[9] "HOBBIES Cooking. Colouring. Dancing."
[10] "LANGUAGES KNOWN English Hindi punjabi"
[11] "1008, ward number 8 , Lohian Khas Distt. Jalandhar. pincode 144629"
[12] "Not found in source"
[13] "Lohian Khas"
[14] "Distt. Jalandhar."
[15] "pincode 144629"
[16] "+91- 73472 - 85154"
[17] "samikshakhera97@gmail.com"
[18] "Year of completion: 2014 Percentage: 70%"
[19] "CHRIST JYOTI CONVENT SCHOOL (SULTANPUR LODHI) (ICSE BOARD)"
[20] "Year of completion: 2014"
[21] "Year of completion: 2016 Percentage : 65%"
[22] "ANAND PUBLIC SENIOR SECONDARY SCHOOL(KAPURTHALA) (CBSE BOARD)"
[23] "Year of completion: 2016"
[24] "Not found in source"
[25] "Bachelors of business administration(BBA)"
[26] "Percentage: 66%"
[27] "CT GROUP OF HIGHER STUDIES(JALANDHAR)"
[28] "Year of completion: 2019"
[29] "Master of business administration (MBA)"
[30] "Percentage : 68%"
[31] "GURU NANAK DEV UNIVERSITY(AMRITSAR)"
[32] "Year of completion: 2021"
[33] "Master of business administration (MBA)"
[34] "Not found in source"
[35] "Not found in source"
[36] "Campus Ambassador Internmind, Virtual (Aug 2020 - Aug 2020) Campus Ambassador InternIn, Virtual (Aug 2020 - Aug 2020) Brand Associate Houseitt, Virtual (Jul 2020 - Aug 2020) Marketing Associate My Study Buddy, Virtual (Jul 2020 - Aug 2020) Brand Promoter Bloombuzz, Virtual (Jul 2020 - Jul 2020)"
[37] "Currently pursuing Internship in Retail Banking (Certification in Banking Operations and Sales) at Innovative Financial Management FinCoach (IFM FinCoach Global Pvt. Ltd.)Chandigarh."
\`\`\`
`;

const CITATION_PROMPT_ADDITION = `
IMPORTANT: When analyzing text, please structure your response using bullet points for key insights, with each bullet point followed by a citation marker [1], [2], etc. After your analysis, include a CITATIONS section with brief quotes from the source material that support each bullet point.

**This citation requirement does not apply to code explanations.**`;

export async function POST(request) {
  try {
    const session = await auth();
    const rateLimitResult = await checkRateLimit(request, session);

    if (!rateLimitResult.allowed) {
      console.log("Rate limit exceeded:", {
        error: rateLimitResult.error,
        usage: rateLimitResult.usage,
        resetTime: rateLimitResult.resetTime,
      });

      return NextResponse.json(
        {
          error: rateLimitResult.error,
          rateLimited: true,
          usage: rateLimitResult.usage,
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 },
      );
    }

    if (!session?.user?.id) {
      console.log("Authentication failed: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, chatId } = await request.json();

    if (!message || !chatId) {
      console.log("Missing required fields:", {
        hasMessage: !!message,
        hasChatId: !!chatId,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectDB();

    const chat = await Chat.findOne({
      chatId,
      userId: session.user.id,
    }).lean();

    if (!chat) {
      console.log("Chat not found:", { chatId, userId: session.user.id });
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (!process.env.ABLY_API_KEY) {
      console.error("ABLY_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const ably = new Ably.Rest(process.env.ABLY_API_KEY);
    const aiChannel = ably.channels.get(
      `ai-responses:${session.user.id}:${chatId}`,
    );
    const statusChannel = ably.channels.get(
      `ai-status:${session.user.id}:${chatId}`,
    );

    await statusChannel.publish("ai-started", {
      type: "processing-started",
      chatId,
      usage: rateLimitResult.usage,
      timestamp: new Date().toISOString(),
    });

    const googleAiKey =
      process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!googleAiKey) {
      console.error(
        "Google AI API key not found. Checked GOOGLE_AI_API_KEY and GEMINI_API_KEY",
      );
      return NextResponse.json(
        { error: "AI service configuration error" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(googleAiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const conversationHistory = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I understand. I will create structured summaries using bullet points with citations when analyzing pasted content. How can I help you today?",
          },
        ],
      },
    ];

    if (chat.messages && Array.isArray(chat.messages)) {
      for (const msg of chat.messages.slice(-18)) {
        if (msg.role && msg.content && typeof msg.content === "string") {
          let messageContent = msg.content;

          if (msg.role === "user" && msg.pastedContent) {
            messageContent = `Here is the content to analyze:\n\n${msg.pastedContent}\n\n${msg.content}`;
          }

          conversationHistory.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: messageContent.substring(0, 8000) }],
          });
        }
      }
    }

    const chatSession = model.startChat({
      history: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
        candidateCount: 1,
      },
    });

    let fullResponse = "";
    let chunkCount = 0;

    let aiMessage = message.content;
    if (message.pastedContent) {
      aiMessage = `Here is the content to analyze:\n\n${message.pastedContent}\n\n${message.content}${CITATION_PROMPT_ADDITION}`;
    }

    const result = await chatSession.sendMessageStream(
      aiMessage.substring(0, 15000),
    );

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText && chunkText.length > 0) {
        fullResponse += chunkText;
        chunkCount++;

        await aiChannel.publish("ai-chunk", {
          type: "chunk",
          text: chunkText,
          chunkIndex: chunkCount,
          chatId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    let processedResponse = {
      content: fullResponse,
      citations: [],
      hasCitations: false,
    };
    if (message.pastedContent) {
      processedResponse = processAIResponseWithCitations(
        fullResponse,
        message.pastedContent,
      );
    }

    // Create the assistant message with unique ID
    const assistantMessage = {
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: "assistant",
      content: fullResponse,
      citations: processedResponse.hasCitations
        ? processedResponse.citations
        : undefined,
      timestamp: new Date(),
    };

    await aiChannel.publish("ai-complete", {
      type: "complete",
      content: fullResponse,
      citations: processedResponse.citations,
      hasCitations: processedResponse.hasCitations,
      messageId: assistantMessage.id,
      totalChunks: chunkCount,
      usage: rateLimitResult.usage,
      chatId,
      timestamp: new Date().toISOString(),
    });

    await statusChannel.publish("ai-completed", {
      type: "processing-completed",
      chatId,
      messageLength: processedResponse.content.length,
      usage: rateLimitResult.usage,
      timestamp: new Date().toISOString(),
    });

    await Chat.updateOne(
      { chatId, userId: session.user.id },
      { $push: { messages: assistantMessage } },
    );

    return NextResponse.json({
      success: true,
      messageId: assistantMessage.id,
      chunkCount,
      responseLength: fullResponse.length,
      usage: rateLimitResult.usage,
    });
  } catch (error) {
    console.error("=== AI processing error ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (
      error.message?.includes("fetch failed") ||
      error.code === "ECONNREFUSED"
    ) {
      errorMessage = "Connection error - this is common in development mode";
      console.log(
        "Detected fetch failed / connection error, likely undici issue",
      );
    } else if (error.message?.includes("GoogleGenerativeAI")) {
      errorMessage = "AI service temporarily unavailable";
      console.log("Google AI API error detected");
    } else if (error.name === "AbortError") {
      errorMessage = "Request timeout";
      console.log("Request was aborted/timed out");
    }

    try {
      if (process.env.ABLY_API_KEY) {
        const ably = new Ably.Rest(process.env.ABLY_API_KEY);
        const statusChannel = ably.channels.get(
          `ai-status:${session?.user?.id}:${chatId}`,
        );
        await statusChannel.publish("ai-error", {
          type: "processing-error",
          error: errorMessage,
          chatId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (ablyError) {
      console.error("Failed to publish error status:", ablyError);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: statusCode },
    );
  }
}
