import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";

export async function GET(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const chats = await Chat.find({ userId: session.user.id }).sort({
    updatedAt: -1,
  });
  return NextResponse.json(chats);
}

export async function POST(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const newChat = await Chat.create({
    userId: session.user.id,
    chatId: Date.now().toString(),
    title: "New Chat",
    messages: [],
  });

  return NextResponse.json(newChat);
}
