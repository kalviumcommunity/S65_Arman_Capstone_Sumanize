import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
import { v4 as uuidv4 } from "uuid";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const chats = await Chat.find({ userId: session.user.id }).sort({ updatedAt: -1 });
  return NextResponse.json(chats);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  
  // Count existing chats to create a numbered title
  const chatCount = await Chat.countDocuments({ userId: session.user.id });
  
  const newChat = await Chat.create({
    userId: session.user.id,
    chatId: uuidv4(),
    title: `Chat ${chatCount + 1}`,
    messages: [],
  });

  return NextResponse.json(newChat);
} 