import "@/app/globals.css";
import Providers from "@/components/providers/session-provider";
import { funnelSans, geistMono, quattrocento } from "@/app/fonts";
import "@/lib/init-server"; // Initialize server-side services including cron jobs
import Script from "next/script";

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
        className={`${funnelSans.variable} ${geistMono.variable} ${quattrocento.variable} antialiased bg-comet-800 text-comet-100`}
      >
        <Providers>{children}</Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
