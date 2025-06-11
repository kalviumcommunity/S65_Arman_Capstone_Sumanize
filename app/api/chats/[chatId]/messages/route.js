import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
import { v4 as uuidv4 } from "uuid";

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role, content } = await request.json();
  if (!role || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectDB();
  const chat = await Chat.findOne({
    chatId: params.chatId,
    userId: session.user.id,
  });
  if (!chat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = { id: uuidv4(), role, content, timestamp: new Date() };
  chat.messages.push(message);
  await chat.save();
  return NextResponse.json(message);
}
