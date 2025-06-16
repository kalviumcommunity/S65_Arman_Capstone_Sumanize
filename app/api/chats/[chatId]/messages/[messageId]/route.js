import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import Chat from "@/models/chat";
import mongoose from "mongoose";

export async function DELETE(request, { params }) {
  try {
    console.log("DELETE request received with params:", params);

    const session = await auth();
    if (!session) {
      console.error("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user?.id) {
      console.error("No user ID in session");
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { chatId, messageId } = params;
    console.log("Attempting to delete message:", { chatId, messageId });

    if (!chatId || !messageId) {
      console.error("Missing parameters:", { chatId, messageId });
      return NextResponse.json(
        { error: "Missing chatId or messageId" },
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

    // Find the chat that belongs to the user
    const chat = await Chat.findOne({
      chatId: chatId,
      userId: userId,
    });

    if (!chat) {
      console.error("Chat not found:", {
        chatId: chatId,
        userId: userId,
      });
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    console.log("Chat found, total messages:", chat.messages.length);
    console.log("Looking for message ID:", messageId);
    console.log(
      "Available message IDs:",
      chat.messages.map((m) => m.id),
    );

    // Find the message to delete
    const messageIndex = chat.messages.findIndex((msg) => msg.id === messageId);

    if (messageIndex === -1) {
      console.error("Message not found:", {
        chatId: chatId,
        messageId: messageId,
        availableIds: chat.messages.map((m) => m.id),
      });
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    console.log("Found message at index:", messageIndex);

    // Remove the message from the array
    const removedMessage = chat.messages.splice(messageIndex, 1)[0];
    console.log("Removed message:", {
      id: removedMessage.id,
      role: removedMessage.role,
    });

    // Save the updated chat
    await chat.save();

    console.log("Successfully deleted message:", {
      chatId: chatId,
      messageId: messageId,
      remainingMessages: chat.messages.length,
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
      deletedMessageId: messageId,
      remainingMessages: chat.messages.length,
    });
  } catch (error) {
    console.error("Error deleting message:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to delete message",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 },
    );
  }
}
