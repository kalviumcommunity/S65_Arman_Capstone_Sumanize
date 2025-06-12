// app/api/chats/route.js (Corrected)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
// Change this import
import { randomUUID } from "crypto";

export async function GET(request) {
  const session = await getServerSession(authOptions);
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
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const newChat = await Chat.create({
    userId: session.user.id,
    // Use the new function
    chatId: randomUUID(),
    title: "New Chat",
    messages: [],
  });

  return NextResponse.json(newChat);
}
