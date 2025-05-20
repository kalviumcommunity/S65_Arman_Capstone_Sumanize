// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/database";
// import Document from "@/models/Document";
// import pdfParse from "pdf-parse";
// import mammoth from "mammoth";
// import { callGemini } from "@/lib/gemini";

// export const config = { api: { bodyParser: false } };

// export async function GET(request, { params }) {
//   await connectDB();
//   const doc = await Document.findById(params.id).lean();
//   if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(doc);
// }

// export async function PUT(request, { params }) {
//   await connectDB();
//   const form = await request.formData();
//   const file = form.get("file");
//   let text, filename;

//   if (file instanceof File) {
//     filename = file.name;
//     const buffer = Buffer.from(await file.arrayBuffer());
//     if (file.type === "application/pdf") {
//       text = (await pdfParse(buffer)).text;
//     } else {
//       text = (await mammoth.extractRawText({ buffer })).value;
//     }
//   } else {
//     const body = await request.json();
//     text = body.text;
//     if (!text) {
//       return NextResponse.json(
//         { error: "Missing text or file" },
//         { status: 400 },
//       );
//     }
//   }

//   const prompt = `Summarize in markdown:\n\n${text}`;
//   const summary = await callGemini(prompt);

//   const updated = await Document.findByIdAndUpdate(
//     params.id,
//     { filename, text, summary },
//     { new: true },
//   );
//   if (!updated)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(updated);
// }

// export async function DELETE(request, { params }) {
//   await connectDB();
//   const deleted = await Document.findByIdAndDelete(params.id);
//   if (!deleted)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json({ success: true });
// }
