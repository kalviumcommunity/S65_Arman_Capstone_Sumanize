import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import connectDB, { clientPromise } from "@/lib/database";
import User from "@/models/user";

const adapter = MongoDBAdapter(clientPromise);
export const authOptions = {
  adapter,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      // If user exists and account not linked yet, link GitHub account
      if (account.provider === "github") {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
          // Link the account to the existing user
          await adapter.linkAccount({
            userId: existingUser._id.toString(),
            provider: account.provider,
            type: account.type,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      await connectDB();
      const userDoc = await User.findById(token.sub);
      session.user.id = token.sub;
      session.user.tier = userDoc?.tier;
      session.user.isPremium = userDoc?.isPremium() || false;
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
    verifyRequest: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
