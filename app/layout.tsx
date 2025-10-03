// Next.js Server-Side Rendering (SSR) Implementation
// This layout.tsx file demonstrates key SSR concepts in Next.js App Router

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// SSR Concept 1: Server-Side Font Optimization
// Next.js optimizes font loading by:
// - Preloading font files on the server
// - Eliminating layout shift during font loading
// - Reducing Cumulative Layout Shift (CLS) for better performance
// - Fonts are loaded and cached on the server before sending HTML to client
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SSR Concept 2: Static Metadata Generation
// Metadata is generated at build time on the server, not on the client
// This improves SEO and social media sharing by providing static metadata
// Next.js generates this metadata during the build process
export const metadata: Metadata = {
  title: "Sumanize - AI Summarizer",
  description:
    "Sumanize is an AI-powered summarizer that helps you summarize text quickly and easily.",
};

// SSR Concept 3: Server Component Layout
// This is a Server Component that runs on the server during the request
// Server Components run on the server and send pre-rendered HTML to the client
// Benefits:
// - Reduced client-side JavaScript bundle size
// - Faster initial page loads
// - Better SEO as content is rendered on server
// - Direct access to server-side resources and databases
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#191724]`}
      >
        {children}
      </body>
    </html>
  );
}
