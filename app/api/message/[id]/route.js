import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Chat from "@/models/Chat";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const chat = await Chat.findOne({ _id: id, user: user.id }).lean();
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error(`Error getting chat ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to retrieve chat" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const updateData = await request.json();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const chat = await Chat.findOne({ _id: id, user: user.id });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    chat.title = updateData.title || chat.title;
    chat.messages = updateData.messages || chat.messages;
    chat.updatedAt = new Date();

    await chat.save();

    return NextResponse.json(chat);
  } catch (error) {
    console.error(`Error updating chat ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const result = await Chat.deleteOne({ _id: id, user: user.id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting chat ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 },
    );
  }
}
