import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ConvexAuthProvider } from "@/components/providers/convex-auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Research Agent - Agentic brand research",
  description:
    "Agentic brand research: capture your identity once, get structured launch intelligence and cited sources.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-app-theme="cursor-dark"
      suppressHydrationWarning
      className={cn("dark h-full", "antialiased", geist.variable, "font-sans")}
    >
      <body className="flex min-h-full flex-col">
        <ConvexAuthProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </ConvexAuthProvider>
      </body>
    </html>
  );
}
