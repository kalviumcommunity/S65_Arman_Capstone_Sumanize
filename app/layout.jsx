import localFont from "next/font/local";
import "@/presentation/globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth-context";

const funnelSans = localFont({
  src: [
    {
      path: "./fonts/FunnelSans-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-funnel-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [
    {
      path: "./fonts/GeistMono-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

const instrumentSerif = localFont({
  src: [
    {
      path: "./fonts/InstrumentSerif-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/InstrumentSerif-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata = {
  title: "Sumanize - Text Summarization",
  description:
    "Text summarization tool that processes articles, PDFs, and YouTube videos. Get concise, accurate, humanized summaries instantly with simple paste or upload functionality.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
