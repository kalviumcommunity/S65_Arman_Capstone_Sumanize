import { kv } from "@vercel/kv";
import { getCurrentUser } from "@/lib/get-current-user";

export const runtime = "edge";

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const userKey = `user:${user.email}`;

    let userData = await kv.get(userKey);
    
    if (userData) {
      userData = JSON.parse(userData);
    } else {
      userData = user;
    }

    const updatedUser = {
      ...userData,
      ...updates,
      updatedAt: Date.now(),
    };

    await kv.setex(userKey, 3600, JSON.stringify(updatedUser));

    updateDatabaseInBackground(user.email, updates);

    return Response.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

async function updateDatabaseInBackground(email, updates) {
  try {
    const { connectDB } = await import("@/lib/database");
    const { default: User } = await import("@/models/User");
    
    await connectDB();
    await User.findOneAndUpdate({ email }, updates);
  } catch (error) {
    console.error("Background database update failed:", error);
  }
}
