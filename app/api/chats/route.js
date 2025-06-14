import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
import mongoose from "mongoose";

export async function GET(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = mongoose.Types.ObjectId.isValid(session.user.id)
    ? new mongoose.Types.ObjectId(session.user.id)
    : session.user.id;

  const chats = await Chat.find({ userId: userId }).sort({
    updatedAt: -1,
  });
  return NextResponse.json(chats);
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = mongoose.Types.ObjectId.isValid(session.user.id)
      ? new mongoose.Types.ObjectId(session.user.id)
      : session.user.id;

    const newChat = await Chat.create({
      userId: userId,
      chatId: Date.now().toString(),
      title: "New Chat",
      messages: [],
    });

    return NextResponse.json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat", details: error.message },
      { status: 500 },
    );
  }
}