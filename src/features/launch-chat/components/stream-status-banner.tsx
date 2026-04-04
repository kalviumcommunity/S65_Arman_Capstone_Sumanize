import { Sparkle } from "@phosphor-icons/react";
import type { StreamPhase } from "@/features/launch-chat/hooks/use-launch-stream";

export function StreamStatusBanner({
  bucketCount,
  currentStage,
  eventCount,
  phase,
}: {
  bucketCount: number;
  currentStage?: string;
  eventCount: number;
  phase: StreamPhase;
}) {
  if (phase === "idle") {
    return null;
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-card/20 px-4 py-3 text-sm text-muted-foreground/60">
      <Sparkle
        size={16}
        weight="fill"
        className="animate-pulse text-primary/40"
      />
      <span>
        Stage: {currentStage ?? phase} &middot; {bucketCount} source buckets
        visible &middot; {eventCount} logged events
      </span>
    </div>
  );
}
