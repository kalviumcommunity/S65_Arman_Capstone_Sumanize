import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    throw new ConvexError("Email is required.");
  }

  const email = value.trim().toLowerCase();

  if (!email) {
    throw new ConvexError("Email is required.");
  }

  return email;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = normalizeEmail(params.email);

        return {
          email,
          name: email,
        };
      },
      validatePasswordRequirements(password) {
        if (password.length < 8) {
          throw new ConvexError("Password must be at least 8 characters.");
        }
      },
    }),
  ],
});
