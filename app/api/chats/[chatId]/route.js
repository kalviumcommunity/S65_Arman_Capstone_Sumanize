import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import authOptions from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat-model";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const { id: userId } = session.user;

    await connectDB();

    let mongoUserId;
    try {
      mongoUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      return Response.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    const chat = await Chat.findOne({
      userId: mongoUserId,
      chatId: chatId,
      isActive: true,
    }).lean();

    if (!chat) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    const simpleMessages = chat.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    }));

    return Response.json({ messages: simpleMessages });
  } catch (error) {
    console.error("GET /api/chats/[chatId] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const { id: userId } = session.user;

    await connectDB();

    let mongoUserId;
    try {
      mongoUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      return Response.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    const result = await Chat.updateOne(
      { userId: mongoUserId, chatId: chatId, isActive: true },
      { $set: { isActive: false } },
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    return Response.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/chats/[chatId] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
