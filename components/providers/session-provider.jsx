"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children, session }) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  );
}
