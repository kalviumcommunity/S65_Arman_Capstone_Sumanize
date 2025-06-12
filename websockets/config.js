import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: ".env.local" });

const validateEnvironment = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing from environment variables");
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing from environment variables");
    process.exit(1);
  }
};

const initializeAI = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export { validateEnvironment, initializeAI };
