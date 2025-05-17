"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center min-h-[35em] text-center">
      <h1 className="text-7xl font-serif mb-6 text-neutral-300">
        <span className="block">Built to Save You Time,</span>
        <span className="block">
          AI Powered Content <em className="italic">Summarizer.</em>
        </span>
      </h1>
      <p className="max-w-3xl mx-auto text-md text-neutral-400 mb-8">
        Just drop a link or upload a file, and get clear, short, and
        natural-sounding summaries in a flash. Works with articles, PDFs, and
        YouTube videos. No fluff, no fancy words—just the important stuff, quick
        and easy!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="secondary"
          className="w-[10em] text-lg text-neutral-900 bg-neutral-300 hover:bg-neutral-400 rounded-full h-12 cursor-pointer transition-colors duration-300 ease-in-out"
          onClick={() => router.push("/summarize")}
        >
          Summarize
        </Button>

        <Button
          variant="secondary"
          className="w-[10em] text-lg text-neutral-900 bg-neutral-300 hover:bg-neutral-400 rounded-full h-12 cursor-pointer transition-colors duration-300 ease-in-out"
          onClick={() => router.push("/humanize")}
        >
          Humanize
        </Button>
      </div>
    </section>
  );
}
