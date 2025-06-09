import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

// YouTube transcript extraction using unofficial API
export async function extractYouTubeTranscript(videoUrl) {
  try {
    // Extract video ID from various YouTube URL formats
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Use YouTube transcript API endpoint
    const transcriptUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;

    const response = await fetch(transcriptUrl);
    if (!response.ok) {
      // Try alternative method - get video info and extract from captions
      return await getTranscriptAlternative(videoId);
    }

    const xmlText = await response.text();
    return parseTranscriptXML(xmlText);
  } catch (error) {
    console.error("YouTube transcript extraction error:", error);
    throw new Error(`Failed to extract YouTube transcript: ${error.message}`);
  }
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getTranscriptAlternative(videoId) {
  try {
    // Try to get transcript from video info
    const infoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(infoUrl);
    const html = await response.text();

    // Look for caption track URLs in the page
    const captionRegex = /"captionTracks":\[([^\]]+)\]/;
    const match = html.match(captionRegex);

    if (match) {
      const captionData = JSON.parse(`[${match[1]}]`);
      const englishCaption = captionData.find(
        (cap) => cap.languageCode === "en" || cap.languageCode === "en-US",
      );

      if (englishCaption && englishCaption.baseUrl) {
        const transcriptResponse = await fetch(englishCaption.baseUrl);
        const transcriptXml = await transcriptResponse.text();
        return parseTranscriptXML(transcriptXml);
      }
    }

    throw new Error("No English transcript available");
  } catch (error) {
    throw new Error("Could not extract transcript from video");
  }
}

function parseTranscriptXML(xmlText) {
  try {
    // Simple XML parsing for transcript
    const textRegex = /<text[^>]*>([^<]*)<\/text>/g;
    let match;
    let transcript = "";

    while ((match = textRegex.exec(xmlText)) !== null) {
      const text = match[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      transcript += text + " ";
    }

    return transcript.trim();
  } catch (error) {
    throw new Error("Failed to parse transcript XML");
  }
}

// PDF text extraction using built-in browser APIs
export async function extractPDFText(arrayBuffer) {
  try {
    // For Edge Runtime, we'll use a simpler approach
    // Convert PDF to text using a service or basic extraction
    return await extractPDFTextSimple(arrayBuffer);
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}

async function extractPDFTextSimple(arrayBuffer) {
  // Simple PDF text extraction
  // For production, consider using a PDF processing service
  const uint8Array = new Uint8Array(arrayBuffer);
  let text = "";

  // Look for text objects in PDF (very basic approach)
  const decoder = new TextDecoder("latin1");
  const pdfString = decoder.decode(uint8Array);

  // Extract text between BT and ET markers (Begin Text / End Text)
  const textRegex = /BT\s*(.*?)\s*ET/gs;
  let match;

  while ((match = textRegex.exec(pdfString)) !== null) {
    const textBlock = match[1];
    // Extract text from Tj operations
    const tjRegex = /\((.*?)\)\s*Tj/g;
    let tjMatch;

    while ((tjMatch = tjRegex.exec(textBlock)) !== null) {
      text += tjMatch[1] + " ";
    }
  }

  // If basic extraction fails, try alternative method
  if (text.trim().length < 50) {
    text = extractTextAlternative(pdfString);
  }

  return text.trim() || "Could not extract readable text from PDF";
}

function extractTextAlternative(pdfString) {
  // Alternative text extraction method
  const lines = pdfString.split("\n");
  let text = "";

  for (const line of lines) {
    // Look for readable text patterns
    if (line.includes("(") && line.includes(")")) {
      const textMatches = line.match(/\(([^)]+)\)/g);
      if (textMatches) {
        textMatches.forEach((match) => {
          const content = match.slice(1, -1);
          if (content.length > 2 && /[a-zA-Z]/.test(content)) {
            text += content + " ";
          }
        });
      }
    }
  }

  return text;
}

// Document text extraction for various formats
export async function extractDocumentText(arrayBuffer, fileName) {
  const extension = fileName.toLowerCase().split(".").pop();

  try {
    switch (extension) {
      case "txt":
        return new TextDecoder().decode(arrayBuffer);

      case "json":
        const jsonText = new TextDecoder().decode(arrayBuffer);
        const jsonData = JSON.parse(jsonText);
        return JSON.stringify(jsonData, null, 2);

      case "csv":
        return new TextDecoder().decode(arrayBuffer);

      case "md":
        return new TextDecoder().decode(arrayBuffer);

      case "html":
      case "htm":
        const htmlText = new TextDecoder().decode(arrayBuffer);
        return extractTextFromHTML(htmlText);

      default:
        // Try to decode as text for unknown formats
        try {
          return new TextDecoder().decode(arrayBuffer);
        } catch {
          throw new Error(`Unsupported file format: ${extension}`);
        }
    }
  } catch (error) {
    console.error("Document extraction error:", error);
    throw new Error(
      `Failed to extract text from ${extension} file: ${error.message}`,
    );
  }
}

function extractTextFromHTML(html) {
  // Simple HTML text extraction
  return html
    .replace(/<script[^>]*>.*?<\/script>/gis, "")
    .replace(/<style[^>]*>.*?<\/style>/gis, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Utility to validate file size and type
export function validateFile(file, maxSizeMB = 10) {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes

  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }

  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "application/json",
    "text/csv",
    "text/markdown",
    "text/html",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const fileExtension = file.name.toLowerCase().split(".").pop();
  const allowedExtensions = [
    "pdf",
    "txt",
    "json",
    "csv",
    "md",
    "html",
    "htm",
    "doc",
    "docx",
  ];

  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error(`File type not supported: ${fileExtension}`);
  }

  return true;
}
