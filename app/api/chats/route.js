import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Chat from "@/models/Chat";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const chats = await Chat.find({ user: user.id })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error getting chats:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chats" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const chatData = await request.json();
    const chat = new Chat({
      ...chatData,
      user: user.id,
    });

    await chat.save();

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 },
    );
  }
}
