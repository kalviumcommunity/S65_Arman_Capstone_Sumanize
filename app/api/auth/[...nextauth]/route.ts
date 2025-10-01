import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { z } from "zod"
import { env } from "@/env"
import { db } from "@/db/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const handler = NextAuth({
  providers: [
    GitHub({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials)

          // Query user from database
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

          if (!user) return null

          const isValid = await compare(password, user.password)
          if (!isValid) return null

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || user.email.split('@')[0],
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle GitHub OAuth - create user in DB if doesn't exist
      if (account?.provider === "github" && user.email) {
        try {
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1)

          if (!existingUser) {
            // Create new user for GitHub OAuth
            const [newUser] = await db
              .insert(users)
              .values({
                email: user.email,
                name: user.name || user.email.split('@')[0],
                password: "", // GitHub users don't have passwords
              })
              .returning()

            user.id = newUser.id.toString()
          } else {
            user.id = existingUser.id.toString()
          }
        } catch (error) {
          console.error("Error creating GitHub user:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
