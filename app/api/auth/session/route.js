import { kv } from "@vercel/kv";
import { getCurrentUser } from "@/lib/get-current-user";

export const runtime = "edge";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ user: null });
    }

    const userKey = `user:${user.email}`;
    let userData = await kv.get(userKey);

    if (userData) {
      userData = JSON.parse(userData);
      return Response.json({
        user: {
          id: userData.id,
          email: userData.email,
          isPremium: userData.isPremium || false,
          currentPeriodEnd: userData.currentPeriodEnd,
          isVerified: userData.isVerified || false,
        },
      });
    }

    try {
      const { connectDB } = await import("@/lib/database");
      const { default: User } = await import("@/models/User");
      
      await connectDB();
      const dbUser = await User.findOne({ email: user.email });

      if (!dbUser) {
        return Response.json({ user: null });
      }

      const userDataToCache = {
        id: dbUser._id.toString(),
        email: dbUser.email,
        isPremium: dbUser.isPremium || false,
        currentPeriodEnd: dbUser.currentPeriodEnd,
        isVerified: dbUser.isVerified || false,
        createdAt: dbUser.createdAt,
      };

      await kv.setex(userKey, 3600, JSON.stringify(userDataToCache));

      return Response.json({
        user: {
          id: userDataToCache.id,
          email: userDataToCache.email,
          isPremium: userDataToCache.isPremium,
          currentPeriodEnd: userDataToCache.currentPeriodEnd,
          isVerified: userDataToCache.isVerified,
        },
      });
    } catch (dbError) {
      console.error("Database fallback failed:", dbError);
      
      return Response.json({
        user: {
          id: user.id,
          email: user.email,
          isPremium: false,
          currentPeriodEnd: null,
          isVerified: true,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching session:", error);
    return Response.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
