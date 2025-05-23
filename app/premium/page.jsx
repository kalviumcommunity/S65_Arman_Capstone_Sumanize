import React from "react";
import PremiumModal from "@/components/premium/premium-modal";

export const metadata = {
  title: "Sumanize Premium",
  description: "Upgrade to premium for enhanced features and faster summaries",
};

export default function PremiumPage() {
  return (
    <main className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <div className="flex flex-col flex-1">
        <PremiumModal />
      </div>
    </main>
  );
}
