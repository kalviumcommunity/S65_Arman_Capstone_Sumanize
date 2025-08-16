"use client";

import { CursorClick } from "@phosphor-icons/react";

export default function PreviewHolder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center text-md justify-center pointer-events-none">
      <CursorClick size={32} className="text-teal-950" weight="fill" />
      <h2 className="text-teal-950 font-bold mb-2 text-center text-4xl">
        Sumanize
      </h2>
      <p className="max-w-sm text-teal-950 text-center">
        Paste text or upload a document to get a summary. You can also drag and
        drop files.
      </p>
    </div>
  );
}
