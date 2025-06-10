import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat-model";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.id;
    let mongoUserId;

    try {
      mongoUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Invalid user ID format:", userId);
      return Response.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const chats = await Chat.find({ userId: mongoUserId, isActive: true })
      .sort({ updatedAt: -1 })
      .select("chatId title createdAt updatedAt")
      .lean();

    const simpleChats = chats.map((chat) => ({
      id: chat.chatId,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    }));

    return Response.json({ chats: simpleChats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();
    await connectDB();

    const userId = session.user.id;
    let mongoUserId;

    try {
      mongoUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Invalid user ID format:", userId);
      return Response.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const chatId = Date.now().toString();

    const newChat = new Chat({
      userId: mongoUserId,
      chatId: chatId,
      title: title || "New Chat",
      messages: [],
    });

    const savedChat = await newChat.save();

    const simpleChat = {
      id: savedChat.chatId,
      title: savedChat.title,
      createdAt: savedChat.createdAt.toISOString(),
      updatedAt: savedChat.updatedAt.toISOString(),
    };

    return Response.json({ chat: simpleChat }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
