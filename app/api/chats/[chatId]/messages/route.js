// app/api/chats/[chatId]/messages/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
// 1. Import from the built-in 'crypto' module instead of 'uuid'
import { randomUUID } from "crypto";

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

  // 2. Use randomUUID() to generate the ID. It's a simple function call.
  const message = { id: randomUUID(), role, content, timestamp: new Date() };
  chat.messages.push(message);
  await chat.save();
  return NextResponse.json(message);
}
