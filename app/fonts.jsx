// app/fonts.js
import {
  Funnel_Sans,
  Geist_Mono,
  Instrument_Serif,
  Judson,
  IBM_Plex_Serif,
} from "next/font/google";

export const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const judson = Judson({
  variable: "--font-judson",
  weight: "400",
  subsets: ["latin"],
});

export const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  weight: "400",
  subsets: ["latin"],
});
