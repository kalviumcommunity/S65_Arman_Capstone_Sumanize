import type { Metadata } from "next";
import { Funnel_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sumanize - Better summaries, faster",
  description: "Sumanize is a tool that helps you summarize text.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${funnelSans.variable} ${geistMono.variable} antialiased bg-stone-300`}
      >
        {children}
      </body>
    </html>
  );
}
