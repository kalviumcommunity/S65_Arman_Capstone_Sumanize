import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const user = new User({ email, password });
    await user.save();

    const userData = {
      id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ user: userData }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
