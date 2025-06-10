"use client";

import { Spinner } from "@phosphor-icons/react";

export default function LoadingScreen() {
  return (
    // This outer div creates the full-screen overlay.
    // - `fixed inset-0`: Covers the entire viewport.
    // - `z-50`: Ensures it's on top of other content.
    // - `bg-black/30`: A semi-transparent black background.
    // - `backdrop-blur-sm`: Applies the blur effect to content behind it.
    // - `flex items-center justify-center`: Centers the spinner.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <Spinner
        className="h-12 w-12 animate-spin text-white"
        aria-label="Loading"
      />
    </div>
  );
}
