import { Funnel_Sans, Geist_Mono, Instrument_Serif } from "next/font/google";
import "@/app/globals.css";
import Providers from "@/components/providers/session-provider";

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sumanize - Fast Summarization",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  description:
    "Sumanize is an AI-powered summarization tool that allows you to summarize your data.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${funnelSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased bg-neutral-950 text-neutral-300`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
