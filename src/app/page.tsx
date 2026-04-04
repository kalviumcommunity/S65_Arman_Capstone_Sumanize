import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPageContent } from "@/components/landing/landing-page-content";

export const metadata: Metadata = {
  title: "Research Agent | Research-backed launch systems for startups",
  description:
    "Research Agent helps founders turn a startup brief into cited launch research, sharper positioning, and ready-to-use messaging.",
  openGraph: {
    title: "Research Agent | Research-backed launch systems for startups",
    description:
      "Turn a startup brief into research-backed positioning, launch angles, and messaging you can use right away.",
    images: ["/image6.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Research Agent | Research-backed launch systems for startups",
    description:
      "Turn a startup brief into research-backed positioning, launch angles, and messaging you can use right away.",
    images: ["/image6.png"],
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const isAuthed = await isAuthenticatedNextjs();
  if (isAuthed && preview !== "1") {
    redirect("/startup");
  }

  return <LandingPageContent isAuthed={isAuthed} />;
}
