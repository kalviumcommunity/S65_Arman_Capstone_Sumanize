import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
import mongoose from "mongoose";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      console.error("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user?.id) {
      console.error("No user ID in session");
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { role, content, pastedContent } = await request.json();

    if (!role || !content) {
      console.error("Validation failed: Missing role or content", {
        role,
        hasContent: !!content,
      });
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: !role ? "Role is required" : "Content is required",
        },
        { status: 400 },
      );
    }

    await connectDB();

    let userId;
    try {
      userId = mongoose.Types.ObjectId.isValid(session.user.id)
        ? new mongoose.Types.ObjectId(session.user.id)
        : session.user.id;
    } catch (error) {
      console.error("Invalid user ID format:", session.user.id);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const chat = await Chat.findOne({
      chatId: params.chatId,
      userId: userId,
    });

    if (!chat) {
      console.error("Chat not found:", {
        chatId: params.chatId,
        userId: userId,
      });
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const message = {
      id: Date.now().toString(),
      role,
      content: content || "",
      pastedContent: pastedContent || undefined,
      timestamp: new Date(),
    };

    const estimatedSize = JSON.stringify(message).length;
    if (estimatedSize > 15 * 1024 * 1024) {
      console.warn("Message size is very large, might hit MongoDB 16MB limit", {
        size: estimatedSize,
      });
    }

    chat.messages.push(message);
    await chat.save();

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error saving message:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
    });

    if (error.name === "ValidationError") {
      console.error("MongoDB Validation Error:", error.errors);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: Object.keys(error.errors).map((key) => ({
            field: key,
            message: error.errors[key].message,
          })),
        },
        { status: 400 },
      );
    }

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      console.error("MongoDB Server Error:", error.code, error.codeName);
      return NextResponse.json(
        {
          error: "Database error",
          code: error.code,
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to save message",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 },
    );
  }
}
