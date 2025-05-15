"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowElbowRightDown } from "@phosphor-icons/react";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-8xl font-serif mb-6 text-neutral-50">
          <span className="block">Read Less.</span>
          <span className="block">
            Understand <em className="italic">More.</em>
          </span>
        </h1>

        <p className="w-3xl mx-auto text-md text-neutral-400 mb-10">
          Paste a link or upload a file to get clear, concise, and human-like
          summaries in seconds. Works with articles, PDFs, and YouTube videos.
          No clutter, no jargon, just the key points you need, fast.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            className="w-[10em] text-lg text-neutral-900 bg-neutral-100 rounded-full h-12 cursor-pointer"
            onClick={() => router.push("/summarize")}
          >
            Summerize <ArrowElbowRightDown size={32} weight="bold" />
          </Button>
        </div>
      </div>
    </section>
  );
}
