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

    console.log("Session info:", {
      hasSession: !!session,
      hasUser: !!session.user,
      userId: session.user?.id,
      userEmail: session.user?.email,
    });

    if (!session.user?.id) {
      console.error("No user ID in session");
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { role, content, pastedContent } = await request.json();

    console.log("Request data:", {
      role,
      contentLength: content?.length || 0,
      pastedContentLength: pastedContent?.length || 0,
      chatId: params.chatId,
    });

    // Validate that we have a role and content (content is required by MongoDB schema)
    if (!role || !content) {
      console.error("Validation failed:", {
        role,
        content: content,
        hasContent: !!content,
        hasPastedContent: !!pastedContent,
        contentLength: content?.length || 0,
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
    console.log("Database connected, looking for chat...");

    // Ensure userId is properly formatted as ObjectId
    let userId;
    try {
      userId = mongoose.Types.ObjectId.isValid(session.user.id)
        ? new mongoose.Types.ObjectId(session.user.id)
        : session.user.id;
    } catch (error) {
      console.error("Invalid user ID format:", session.user.id);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    console.log("Looking for chat with:", {
      chatId: params.chatId,
      userId,
      userIdType: typeof userId,
    });

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

    console.log("Chat found, creating message...");

    const message = {
      id: Date.now().toString(),
      role,
      content: content || "", // Provide empty string if no content
      pastedContent: pastedContent || undefined,
      timestamp: new Date(),
    };

    console.log("Message created:", {
      messageId: message.id,
      role: message.role,
      contentLength: message.content?.length || 0,
      pastedContentLength: message.pastedContent?.length || 0,
      hasContent: !!message.content,
      hasPastedContent: !!message.pastedContent,
    });

    // Check if this might exceed MongoDB document size limit (16MB)
    const estimatedSize = JSON.stringify(message).length;
    console.log("Estimated message size:", estimatedSize, "bytes");

    if (estimatedSize > 15 * 1024 * 1024) {
      // 15MB warning threshold
      console.warn("Message size is very large, might hit MongoDB 16MB limit");
    }

    chat.messages.push(message);
    console.log("Message added to chat, saving to database...");

    await chat.save();
    console.log("Message saved successfully");

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error saving message:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      details: error,
    });

    // Check for specific MongoDB errors
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
