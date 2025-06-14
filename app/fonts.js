import { Funnel_Sans, Geist_Mono, Quattrocento } from "next/font/google";

export const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const quattrocento = Quattrocento({
  variable: "--font-quattrocento",
  weight: ["400", "700"],
  subsets: ["latin"],
});
