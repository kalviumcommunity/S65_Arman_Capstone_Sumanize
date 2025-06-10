import { YoutubeTranscript } from "youtube-transcript";
import pdf from "pdf-parse";

export async function extractYouTubeTranscript(videoUrl) {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    let transcript = null;
    let extractionMethod = "";

    try {
      const transcriptParts = await YoutubeTranscript.fetchTranscript(videoUrl);
      if (transcriptParts && transcriptParts.length > 0) {
        transcript = transcriptParts.map((part) => part.text).join(" ");
        extractionMethod = "youtube-transcript";
      }
    } catch (error) {
      console.log("youtube-transcript failed:", error.message);
    }

    if (!transcript || transcript.length < 50) {
      try {
        const transcriptParts = await YoutubeTranscript.fetchTranscript(
          videoUrl,
          {
            lang: "en",
            country: "US",
          },
        );
        if (transcriptParts && transcriptParts.length > 0) {
          transcript = transcriptParts.map((part) => part.text).join(" ");
          extractionMethod = "youtube-transcript-en-US";
        }
      } catch (error) {
        console.log("youtube-transcript with en-US failed:", error.message);
      }
    }

    if (!transcript || transcript.length < 50) {
      try {
        transcript = await extractTranscriptManual(videoId);
        if (transcript && transcript.length > 50) {
          extractionMethod = "manual-extraction";
        }
      } catch (error) {
        console.log("Manual extraction failed:", error.message);
      }
    }

    if (!transcript || transcript.length < 50) {
      throw new Error(
        "No transcript available for this video. The video may not have captions enabled, may be private, or may not support transcript extraction.",
      );
    }

    console.log(
      `Successfully extracted transcript using: ${extractionMethod}, length: ${transcript.length}`,
    );
    return transcript;
  } catch (error) {
    throw new Error(`Failed to extract transcript: ${error.message}`);
  }
}

async function extractTranscriptManual(videoId) {
  const transcriptUrls = [
    `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
    `https://www.youtube.com/api/timedtext?lang=en-US&v=${videoId}`,
    `https://www.youtube.com/api/timedtext?lang=en-GB&v=${videoId}`,
    `https://www.youtube.com/api/timedtext?v=${videoId}`,
  ];

  for (const url of transcriptUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });

      if (response.ok) {
        const xmlText = await response.text();
        if (xmlText && xmlText.length > 100) {
          const transcript = parseTranscriptXML(xmlText);
          if (transcript && transcript.length > 50) {
            return transcript;
          }
        }
      }
    } catch (error) {
      console.log(`Failed to fetch from ${url}:`, error.message);
      continue;
    }
  }

  throw new Error("Manual extraction failed for all attempted URLs");
}

function parseTranscriptXML(xmlText) {
  try {
    const textRegex = /<text[^>]*>([^<]*)<\/text>/g;
    let match;
    let transcript = "";

    while ((match = textRegex.exec(xmlText)) !== null) {
      const text = match[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, " ")
        .trim();

      if (text.length > 0) {
        transcript += text + " ";
      }
    }

    return transcript.trim();
  } catch (error) {
    throw new Error("Failed to parse transcript XML");
  }
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Extracts text from a PDF file using the pdf-parse library.
 * @param {File} file - The PDF file object from the form data.
 * @returns {Promise<string>} The extracted text content.
 */
export async function extractPDFText(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfData = await pdf(buffer);
    let text = pdfData.text;

    if (text && text.length > 20) {
      return text.replace(/\s+/g, " ").trim();
    }

    throw new Error(
      "No readable text found in PDF. The document may be image-based or encrypted.",
    );
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}

/**
 * Extracts text from simple document formats like TXT, MD, CSV.
 * @param {ArrayBuffer} arrayBuffer - The file content as an ArrayBuffer.
 * @param {string} fileName - The name of the file to determine its type.
 * @returns {Promise<string>} The extracted text content.
 */
export async function extractDocumentText(arrayBuffer, fileName) {
  try {
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(arrayBuffer);
    return text.trim();
  } catch (error) {
    throw new Error(`Failed to decode document text: ${error.message}`);
  }
}

/**
 * Validates a file based on size and allowed extensions.
 * @param {File} file - The file object to validate.
 * @param {number} maxSizeMB - The maximum allowed file size in megabytes.
 * @param {string[]} allowedExtensions - An array of allowed file extensions (e.g., ['pdf', 'txt']).
 * @returns {boolean} True if the file is valid.
 * @throws {Error} If the file is invalid.
 */
export function validateFile(file, maxSizeMB, allowedExtensions) {
  const maxSize = maxSizeMB * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(`File size exceeds the ${maxSizeMB}MB limit.`);
  }

  const fileExtension = file.name.toLowerCase().split(".").pop();

  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error(
      `Unsupported file format. Supported formats are: ${allowedExtensions.join(
        ", ",
      )}`,
    );
  }

  return true;
}
