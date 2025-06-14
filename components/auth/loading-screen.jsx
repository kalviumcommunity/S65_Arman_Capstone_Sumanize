"use client";

import { Spinner } from "@phosphor-icons/react";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size={36} className="animate-spin" />
    </div>
  );
}
