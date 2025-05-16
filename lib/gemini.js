// lib/gemini.js

export async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in .env.local");
  }

  // Endpoint for Gemini 2.0 Flash text generation
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" +
    `?key=${apiKey}`; // API key in query string :contentReference[oaicite:1]{index=1}

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // sending JSON body :contentReference[oaicite:2]{index=2}
    },
    body: JSON.stringify({
      // wrap your prompt in the required contents array :contentReference[oaicite:3]{index=3}
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  // pull out the first candidate's text :contentReference[oaicite:4]{index=4}
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    "No summary returned from Gemini."
  );
}
