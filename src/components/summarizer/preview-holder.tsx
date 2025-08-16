"use client";

import { Sparkle } from "@phosphor-icons/react";

export default function PreviewHolder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <Sparkle size={32} className="text-teal-950" weight="fill" />
      <h2 className="text-teal-950 font-bold mb-2 text-center text-3xl">
        Response
      </h2>
      <p className="max-w-md text-teal-950 text-center text-base">
        Your structured summary will appear here. Paste content on the left and
        get a summary on the right.
      </p>
    </div>
  );
}
