import { ReactScan } from "@/lib/react-scan";
import React from "react";
import "@/presentation/globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { AuthProvider } from "@/context/auth-context";
import { funnelSans, geistMono, instrumentSerif } from "@/app/fonts";

export const metadata = {
  title: "Sumanize - Text Summarization",
  description:
    "Text summarization tool that processes articles, PDFs, and YouTube videos. Get concise, accurate, humanized summaries instantly with simple paste or upload functionality.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ReactScan />
      <body
        className={[
          funnelSans.variable,
          geistMono.variable,
          instrumentSerif.variable,
          "antialiased bg-neutral-950",
        ].join(" ")}
      >
        <AuthProvider>
          {children}
          <SonnerToaster
            position="bottom-right"
            duration={5000}
            visibleToasts={1}
            gap={24}
            theme="dark"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
