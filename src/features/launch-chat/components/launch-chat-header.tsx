import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { StatusIndicator } from "@/components/shared/status-indicator";
import { BriefSummaryCard } from "@/features/launch-chat/components/brief-summary-card";
import type { StreamPhase } from "@/features/launch-chat/hooks/use-launch-stream";
import type { StartupBrief } from "@/types/launch";

export function LaunchChatHeader({
  brief,
  isLive,
  phase,
}: {
  brief: StartupBrief;
  isLive: boolean;
  phase: StreamPhase;
}) {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} weight="bold" />
          Back
        </Link>
        <StatusIndicator
          state={isLive ? "live" : phase === "done" ? "complete" : "idle"}
        />
      </div>
      <BriefSummaryCard brief={brief} />
    </header>
  );
}
