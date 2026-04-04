import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
  apiKey: process.env.OLLAMA_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey:
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY,
});

const defaultGeminiModel = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const defaultOllamaModel = process.env.OLLAMA_MODEL ?? "glm-5:cloud";

export function getProviders() {
  const providers = [] as Array<{
    label: string;
    model: ReturnType<typeof google> | ReturnType<typeof ollama>;
  }>;

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY) {
    providers.push({
      label: `Gemini (${defaultGeminiModel})`,
      model: google(defaultGeminiModel),
    });
  }

  if (
    process.env.OLLAMA_BASE_URL ??
    process.env.OLLAMA_MODEL ??
    process.env.OLLAMA_API_KEY
  ) {
    providers.push({
      label: `Ollama (${defaultOllamaModel})`,
      model: ollama(defaultOllamaModel),
    });
  }

  if (providers.length === 0) {
    throw new Error(
      "No text model configured. Add GOOGLE_GENERATIVE_AI_API_KEY or Ollama environment settings.",
    );
  }

  return providers;
}
