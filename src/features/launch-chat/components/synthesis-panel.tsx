"use client";

import { LaunchMarkdownBody } from "@/features/launch-chat/components/launch-markdown";
import type { StreamPhase } from "@/features/launch-chat/hooks/use-launch-stream";

export function SynthesisPanel({
  phase,
  synthesis,
}: {
  phase: StreamPhase;
  synthesis: string;
}) {
  if (phase !== "synthesizing" && phase !== "done") {
    return null;
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
      <div className="max-w-full overflow-hidden rounded-lg border border-border/70 bg-card/50 px-5 py-5">
        <LaunchMarkdownBody
          markdown={synthesis}
          suffix={
            phase === "synthesizing" ? (
              <span className="streaming-cursor ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-primary" />
            ) : null
          }
        />
      </div>
    </section>
  );
}
