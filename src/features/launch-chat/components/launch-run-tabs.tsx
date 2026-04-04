"use client";

import type { Artifact } from "@/features/launch-chat/components/artifact-row";
import { ResearchSourcesGrid } from "@/features/launch-chat/components/research-sources-grid";
import type { ResearchBucket } from "@/types/launch";

type StageRun = {
  _id: string;
  attemptNumber: number;
  completedAt?: number;
  stageKey: string;
  startedAt: number;
  status: "running" | "completed" | "stopped" | "failed";
  summary?: string;
};

export function LaunchRunTabs({
  buckets,
  latestMessages,
  sourceStatuses,
}: {
  stageRuns: StageRun[];
  buckets: Map<string, ResearchBucket>;
  latestMessages: Partial<Record<ResearchBucket["source"], string>>;
  sourceStatuses: Partial<
    Record<
      ResearchBucket["source"],
      "waiting" | "running" | "completed" | "failed"
    >
  >;
  artifacts: Artifact[];
}) {
  return (
    <section className="mb-6">
      {/* PipelineView intentionally disabled for now. */}
      <ResearchSourcesGrid
        buckets={buckets}
        latestMessages={latestMessages}
        sourceStatuses={sourceStatuses}
        embedded
      />
    </section>
  );
}
