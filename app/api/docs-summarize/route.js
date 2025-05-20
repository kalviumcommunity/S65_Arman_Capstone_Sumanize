// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/database";
// import Document from "@/models/Document";
// import pdfParse from "pdf-parse";
// import mammoth from "mammoth";
// import { callGemini } from "@/lib/gemini";

// export const config = { api: { bodyParser: false } };

// export async function GET() {
//   await connectDB();
//   const items = await Document.find().sort({ createdAt: -1 }).lean();
//   return NextResponse.json(items);
// }

// export async function POST(request) {
//   await connectDB();
//   const form = await request.formData();
//   const file = form.get("file");
//   if (!file || !(file instanceof File)) {
//     return NextResponse.json({ error: "No file" }, { status: 400 });
//   }

//   const buffer = Buffer.from(await file.arrayBuffer());
//   let text = "";
//   if (file.type === "application/pdf") {
//     text = (await pdfParse(buffer)).text;
//   } else {
//     text = (await mammoth.extractRawText({ buffer })).value;
//   }

//   const prompt = `Summarize in markdown:\n\n${text}`;
//   const summary = await callGemini(prompt);

//   const doc = await Document.create({
//     filename: file.name,
//     text,
//     summary,
//   });
//   return NextResponse.json(doc);
// }
