import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import connectDB from "@/lib/database";
import User from "@/models/user-model";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();

        let existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          const accountExists = existingUser.accounts.some(
            (acc) =>
              acc.provider === account.provider &&
              acc.providerAccountId === account.providerAccountId,
          );

          if (!accountExists) {
            existingUser.accounts.push({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            });
            await existingUser.save();
          }

          await existingUser.updateLastLogin();
        } else {
          const newUser = new User({
            name: user.name || profile?.name || "User",
            email: user.email,
            image: user.image || profile?.avatar_url || profile?.picture,
            emailVerified: new Date(),
            accounts: [
              {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            ],
          });

          const savedUser = await newUser.save();
          await savedUser.updateLastLogin();
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.tier = dbUser.tier;
            token.isPremium = dbUser.isPremium();
            token.subscriptionStatus = dbUser.subscriptionStatus;
          } else {
            console.error(
              "User not found in JWT callback for email:",
              user.email,
            );
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.tier = token.tier;
        session.user.isPremium = token.isPremium;
        session.user.subscriptionStatus = token.subscriptionStatus;

        try {
          await connectDB();
          const dbUser = await User.findById(token.id);

          if (dbUser) {
            await dbUser.resetUsageIfNeeded();

            session.user.tier = dbUser.tier;
            session.user.isPremium = dbUser.isPremium();
            session.user.subscriptionStatus = dbUser.subscriptionStatus;
            session.user.usage = dbUser.usage;
            session.user.rateLimits = dbUser.getRateLimits();
          } else {
            console.error(
              "User not found in session callback for ID:",
              token.id,
            );
          }
        } catch (error) {
          console.error("Session callback error:", error);
        }
      }

      return session;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Optional: Log significant events for monitoring
    },
    async signOut({ session, token }) {
      // Optional: Log significant events for monitoring
    },
  },

  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
