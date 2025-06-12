import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import connectDB, { clientPromise } from "@/lib/database";
import User from "@/models/user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      if (account && user) {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
          try {
            console.log("User already exists, account linked");
          } catch (error) {
            if (error.code !== 11000) {
              throw error;
            }
          }
        }
      }
      return true;
    },
    async session({ session, token }) {
      await connectDB();
      if (token?.sub) {
        const userDoc = await User.findById(token.sub);
        if (session.user) {
          session.user.id = token.sub;
          session.user.tier = userDoc?.tier;
          session.user.isPremium = userDoc?.isPremium() || false;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
  },
});
