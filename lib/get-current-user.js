import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { connectDB } from "./database";
import User from "@/models/User";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sumanize-token");

    if (!token) {
      return null;
    }

    const decoded = verify(
      token.value,
      process.env.JWT_SECRET || "your-secret-key",
    );

    await connectDB();
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
