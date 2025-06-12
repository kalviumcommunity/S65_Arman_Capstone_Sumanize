// lib/auth.js (Corrected and Final Version)

import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import clientPromise from "@/lib/mongodb";
import User from "@/models/user";
import connectDB from "./database";

export const authOptions = {
  // The adapter will handle user creation and account linking automatically.
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
    // Use JWTs for session management.
    strategy: "jwt",
  },

  // REMOVED the entire custom `signIn` callback. It is not needed.

  callbacks: {
    // The `jwt` callback is called first. We enrich the token here.
    async jwt({ token, user }) {
      // On initial sign-in, `user` object is available.
      if (user) {
        // Persist the user's ID and custom properties to the token.
        token.id = user.id;
        // We need to connect to the DB to get the Mongoose document for custom methods.
        await connectDB();
        const userDoc = await User.findById(user.id);
        if (userDoc) {
          token.tier = userDoc.tier;
          token.isPremium = userDoc.isPremium();
        }
      }
      return token;
    },

    // The `session` callback is called next. It receives the enriched token.
    async session({ session, token }) {
      // Pass the custom properties from the token to the client-side session object.
      if (token && session.user) {
        session.user.id = token.id;
        session.user.tier = token.tier;
        session.user.isPremium = token.isPremium;
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
    verifyRequest: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
