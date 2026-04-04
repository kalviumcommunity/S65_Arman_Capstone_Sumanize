"use client";

import { CaretDown } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Artifact } from "@/features/launch-chat/components/artifact-row";
import { getArtifactDescription } from "@/features/launch-chat/utils/artifact-display-names";
import {
  formatDuration,
  formatTimestamp,
} from "@/features/launch-chat/utils/run-display";
import { cn } from "@/lib/utils";
import type { LaunchPackage } from "@/types/launch";

type StageRun = {
  _id: string;
  attemptNumber: number;
  completedAt?: number;
  stageKey: string;
  startedAt: number;
  status: "running" | "completed" | "stopped" | "failed";
  summary?: string;
};

type DerivedStage = {
  key: string;
  label: string;
  status: "completed" | "running" | "stopped" | "failed" | "pending";
  run: StageRun | null;
};

type QaArtifact = {
  pass: boolean;
  priorityFixes: string[];
  scores: Record<string, number>;
  verdict: string;
};

type HookArtifact = {
  selectedHooks: Array<{
    copy: string;
    label: string;
  }>;
  winningHook: {
    copy: string;
    label: string;
    score?: number;
  };
};

const PIPELINE_STAGES = [
  "intake",
  "research_planning",
  "source_retrieval",
  "evidence_curation",
  "synthesis_agent",
  "hook_agent",
  "package_draft",
  "qa_check",
  "rewrite_attempt",
  "finalized",
] as const;

/** What to show while each stage is actively running (no artifact yet). */
const STAGE_RUNNING_MESSAGES: Partial<Record<string, string>> = {
  intake: "Getting started…",
  research_planning: "Planning which sources to search…",
  source_retrieval: "Searching Reddit, X, YouTube, and the web…",
  evidence_curation: "Sifting through the results…",
  synthesis_agent: "Drawing out the key signals for your launch…",
  hook_agent: "Brainstorming launch angles and hooks…",
  package_draft: "Writing your first launch package…",
  qa_check: "Reviewing quality and identifying improvements…",
  rewrite_attempt: "Rewriting based on the quality review…",
  finalized: "Wrapping up and saving your package…",
};

/** Static mapping from pipeline stage → artifact types produced at that stage */
const STAGE_ARTIFACT_TYPES: Partial<Record<string, string[]>> = {
  research_planning: ["research_plan"],
  evidence_curation: ["evidence_bundle"],
  synthesis_agent: ["synthesis_notes"],
  hook_agent: ["hook_candidates"],
  package_draft: ["launch_package_draft"],
  qa_check: ["qa_report"],
  rewrite_attempt: ["rewrite_draft"],
  finalized: ["launch_package_final", "launch_package_markdown", "research"],
};

const STATUS_META: Record<
  DerivedStage["status"],
  { label: string; tone: string }
> = {
  completed: {
    label: "Completed",
    tone: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25",
  },
  running: {
    label: "Running",
    tone: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/25",
  },
  stopped: {
    label: "Stopped",
    tone: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25",
  },
  failed: {
    label: "Failed",
    tone: "bg-destructive/15 text-destructive ring-1 ring-destructive/25",
  },
  pending: {
    label: "Pending",
    tone: "bg-muted/40 text-muted-foreground/70 ring-1 ring-border/30",
  },
};

function titleCaseFromSnake(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function summarizeText(value: string, maxLength = 220) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength).trimEnd()}...`;
}

function collectStrings(value: unknown, limit = 4, depth = 0): string[] {
  if (limit <= 0 || depth > 4 || value === null || value === undefined)
    return [];
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [summarizeText(trimmed, 140)] : [];
  }
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => collectStrings(entry, limit, depth + 1))
      .slice(0, limit);
  }
  if (typeof value === "object") {
    return Object.values(value)
      .flatMap((entry) => collectStrings(entry, limit, depth + 1))
      .slice(0, limit);
  }
  return [String(value)];
}

function getMarkdownPreview(markdown?: string) {
  if (!markdown?.trim()) return null;
  const lines = markdown
    .split("\n")
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
  if (lines.length === 0) return null;
  return lines.map((line) => summarizeText(line, 140));
}

function isQaArtifact(content: unknown): content is QaArtifact {
  if (!content || typeof content !== "object") return false;
  const candidate = content as Partial<QaArtifact>;
  return (
    typeof candidate.pass === "boolean" && typeof candidate.verdict === "string"
  );
}

function isHookArtifact(content: unknown): content is HookArtifact {
  if (!content || typeof content !== "object") return false;
  const candidate = content as Partial<HookArtifact>;
  return (
    Boolean(candidate.winningHook) && Array.isArray(candidate.selectedHooks)
  );
}

function isLaunchPackage(content: unknown): content is LaunchPackage {
  if (!content || typeof content !== "object") return false;
  const candidate = content as Partial<LaunchPackage>;
  return (
    typeof candidate.strategicAngle === "string" &&
    Boolean(candidate.launchScript) &&
    Boolean(candidate.contentStrategy)
  );
}

function getStageSummary(stage: DerivedStage, artifactCount: number) {
  if (stage.status === "running") {
    return (
      STAGE_RUNNING_MESSAGES[stage.key] ?? "Working through this step now."
    );
  }
  if (stage.run?.summary?.trim()) {
    return stage.run.summary;
  }
  if (artifactCount > 0) {
    return artifactCount === 1
      ? "Saved one output from this step."
      : `Saved ${artifactCount} outputs from this step.`;
  }
  if (stage.status === "failed") {
    return "This stage failed before it produced a saved output.";
  }
  if (stage.status === "stopped") {
    return "This stage stopped before it produced a saved output.";
  }
  return "Waiting for earlier stages to finish.";
}

function ArtifactPreview({ artifact }: { artifact: Artifact }) {
  const markdownPreview = getMarkdownPreview(artifact.markdown);

  if (
    artifact.artifactType === "hook_candidates" &&
    isHookArtifact(artifact.content)
  ) {
    const hookArtifact = artifact.content;
    const alternates = hookArtifact.selectedHooks
      .filter((hook) => hook.label !== hookArtifact.winningHook.label)
      .slice(0, 2);

    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border/35 bg-background/50 px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/55">
            Winning hook
          </p>
          <p className="mt-2 text-sm font-medium text-foreground/90">
            {hookArtifact.winningHook.label}
            {hookArtifact.winningHook.score
              ? ` • ${hookArtifact.winningHook.score}/10`
              : ""}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground/85">
            {summarizeText(hookArtifact.winningHook.copy, 220)}
          </p>
        </div>
        {alternates.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/55">
              Alternates
            </p>
            {alternates.map((hook) => (
              <div key={hook.label} className="border-l border-border/35 pl-3">
                <p className="text-sm font-medium text-foreground/90">
                  {hook.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground/80">
                  {summarizeText(hook.copy, 160)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (artifact.artifactType === "qa_report" && isQaArtifact(artifact.content)) {
    const topScores = Object.entries(artifact.content.scores).slice(0, 4);
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {summarizeText(artifact.content.verdict, 220)}
          </p>
        </div>
        {topScores.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {topScores.map(([key, value]) => (
              <div
                key={key}
                className="rounded-lg border border-border/35 bg-background/50 px-3 py-2"
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/55">
                  {titleCaseFromSnake(
                    key.replace(/([A-Z])/g, "_$1").toLowerCase(),
                  )}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground/90">
                  {value}/10
                </p>
              </div>
            ))}
          </div>
        ) : null}
        {artifact.content.priorityFixes.length > 0 ? (
          <ul className="space-y-1.5 text-sm text-muted-foreground/82">
            {artifact.content.priorityFixes.slice(0, 3).map((fix) => (
              <li key={fix} className="flex gap-2">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-foreground/35" />
                <span>{summarizeText(fix, 180)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (
    (artifact.artifactType === "launch_package_final" ||
      artifact.artifactType === "launch_package_draft" ||
      artifact.artifactType === "rewrite_draft") &&
    isLaunchPackage(artifact.content)
  ) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border/35 bg-background/50 px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/55">
            Strategic angle
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {summarizeText(artifact.content.strategicAngle, 220)}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border/35 bg-background/50 px-3 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/55">
              Headline
            </p>
            <p className="mt-2 text-sm text-foreground/90">
              {summarizeText(artifact.content.launchScript.headline, 140)}
            </p>
          </div>
          <div className="rounded-lg border border-border/35 bg-background/50 px-3 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/55">
              Next moves
            </p>
            <p className="mt-2 text-sm text-foreground/90">
              {artifact.content.nextMoves.slice(0, 2).join(" • ") ||
                "No next moves captured."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const bullets = markdownPreview ?? collectStrings(artifact.content, 4);
  if (bullets.length > 0) {
    return (
      <ul className="space-y-1.5 text-sm text-muted-foreground/82">
        {bullets.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-foreground/35" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-sm text-muted-foreground/65">
      No preview available for this artifact.
    </p>
  );
}

function StageEntry({
  artifactCount,
  children,
  index,
  isOpen,
  onOpenChange,
  stage,
  total,
}: {
  artifactCount: number;
  children: ReactNode;
  index: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stage: DerivedStage;
  total: number;
}) {
  const statusMeta = STATUS_META[stage.status];
  const duration = formatDuration(stage.run?.startedAt, stage.run?.completedAt);
  const timestamp = formatTimestamp(
    stage.run?.completedAt ?? stage.run?.startedAt,
  );

  return (
    <div className="relative pl-8">
      <span
        className={cn(
          "absolute left-0 top-2 size-3 rounded-full border border-background",
          stage.status === "completed" && "bg-emerald-400",
          stage.status === "running" &&
            "bg-sky-400 shadow-[0_0_0_6px_rgba(56,189,248,0.12)]",
          stage.status === "stopped" && "bg-amber-400",
          stage.status === "failed" && "bg-destructive",
          stage.status === "pending" && "bg-muted-foreground/25",
        )}
      />
      {index < total - 1 ? (
        <span className="absolute left-[5px] top-5 bottom-[-1.25rem] w-px bg-border/35" />
      ) : null}

      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger
          className={cn(
            "group w-full rounded-xl border border-border/35 bg-muted/[0.03] px-4 py-4 text-left transition-colors hover:bg-muted/[0.06]",
            isOpen && "bg-muted/[0.05]",
            stage.status === "running" && "border-sky-500/30 bg-sky-500/[0.06]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-foreground/92">
                  {stage.label}
                </h3>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    statusMeta.tone,
                  )}
                >
                  {statusMeta.label}
                </span>
                {artifactCount > 0 ? (
                  <span className="rounded-full bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground/70 ring-1 ring-border/30">
                    {artifactCount}{" "}
                    {artifactCount === 1 ? "artifact" : "artifacts"}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground/78">
                {getStageSummary(stage, artifactCount)}
              </p>
            </div>

            <div className="flex shrink-0 items-start gap-3 pl-2">
              <div className="hidden text-right sm:block">
                <p className="text-xs tabular-nums text-muted-foreground/55">
                  {timestamp}
                </p>
                {duration ? (
                  <p className="mt-1 text-[11px] text-muted-foreground/45">
                    {duration}
                  </p>
                ) : null}
              </div>
              <CaretDown
                size={14}
                className={cn(
                  "mt-0.5 shrink-0 text-muted-foreground/45 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-1 pt-3">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function usePipeline(stageRuns: StageRun[]) {
  return useMemo(() => {
    const latest = new Map<string, StageRun>();
    for (const run of stageRuns) {
      const existing = latest.get(run.stageKey);
      if (!existing || run.attemptNumber > existing.attemptNumber) {
        latest.set(run.stageKey, run);
      }
    }

    // Build derived stages from the known pipeline, merging in any extra
    // stageKeys that appear in stageRuns but aren't in PIPELINE_STAGES
    // (e.g. a future stage or rewrite_attempt if it ran).
    const knownKeys = new Set<string>(PIPELINE_STAGES);
    const extraKeys = [...latest.keys()].filter((k) => !knownKeys.has(k));
    const allKeys = [...PIPELINE_STAGES, ...extraKeys];

    const stages: DerivedStage[] = allKeys.map((key) => {
      const run = latest.get(key) ?? null;
      return {
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        status: (run?.status ?? "pending") as DerivedStage["status"],
        run,
      };
    });

    // Remove pending stages that have never started and come after all activity
    const lastActiveIdx = stages.reduce(
      (acc, s, i) => (s.status !== "pending" ? i : acc),
      -1,
    );
    const visibleStages =
      lastActiveIdx === -1
        ? stages.slice(0, 3) // show a few pending stages on fresh run
        : stages;

    const focusIdx = (() => {
      const idx = stages.findIndex((s) => s.status === "running");
      if (idx !== -1) return idx;
      for (let i = stages.length - 1; i >= 0; i--) {
        if (
          stages[i].status === "completed" ||
          stages[i].status === "stopped" ||
          stages[i].status === "failed"
        ) {
          return i;
        }
      }
      return 0;
    })();

    return {
      stages: visibleStages,
      focusIdx,
    };
  }, [stageRuns]);
}

export function PipelineView({
  stageRuns,
  artifacts,
}: {
  stageRuns: StageRun[];
  artifacts: Artifact[];
}) {
  const { stages, focusIdx } = usePipeline(stageRuns);
  const activeStageKey = stages[focusIdx]?.key ?? stages[0]?.key ?? null;
  const [openStageKey, setOpenStageKey] = useState<string | null>(
    activeStageKey,
  );

  useEffect(() => {
    setOpenStageKey(activeStageKey);
  }, [activeStageKey]);

  const artifactsByType = useMemo(() => {
    const map = new Map<string, Artifact[]>();
    for (const artifact of artifacts) {
      const existing = map.get(artifact.artifactType) ?? [];
      map.set(artifact.artifactType, [...existing, artifact]);
    }
    return map;
  }, [artifacts]);

  if (stageRuns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/50">
        Waiting for the pipeline to start…
      </p>
    );
  }

  return (
    <div className="select-none">
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const stageArtifactTypes = STAGE_ARTIFACT_TYPES[stage.key] ?? [];
          const stageArtifacts = stageArtifactTypes.flatMap(
            (type) => artifactsByType.get(type) ?? [],
          );
          const latestArtifact =
            stageArtifacts[stageArtifacts.length - 1] ?? null;
          const isOpen = openStageKey === stage.key;

          return (
            <StageEntry
              key={stage.key}
              artifactCount={stageArtifacts.length}
              index={index}
              isOpen={isOpen}
              onOpenChange={(open) => setOpenStageKey(open ? stage.key : null)}
              stage={stage}
              total={stages.length}
            >
              <div className="space-y-3 pb-3">
                {latestArtifact ? (
                  <div className="rounded-xl border border-border/35 bg-background/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/50">
                          Latest output
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground/90">
                          {titleCaseFromSnake(latestArtifact.artifactType)}
                        </p>
                        {getArtifactDescription(latestArtifact.artifactType) ? (
                          <p className="mt-1 text-sm text-muted-foreground/72">
                            {getArtifactDescription(
                              latestArtifact.artifactType,
                            )}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-xs tabular-nums text-muted-foreground/45">
                        {formatTimestamp(latestArtifact.createdAt)}
                      </p>
                    </div>
                    <div className="mt-4">
                      <ArtifactPreview artifact={latestArtifact} />
                    </div>
                  </div>
                ) : stage.status === "running" ? (
                  <div className="rounded-xl border border-dashed border-sky-500/35 bg-sky-500/[0.05] px-4 py-3 text-sm text-sky-100/85">
                    {STAGE_RUNNING_MESSAGES[stage.key] ??
                      "Working through this step now."}
                  </div>
                ) : stage.status === "pending" ? (
                  <div className="rounded-xl border border-dashed border-border/30 bg-background/20 px-4 py-3 text-sm text-muted-foreground/60">
                    This stage is queued behind the earlier steps.
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/30 bg-background/20 px-4 py-3 text-sm text-muted-foreground/65">
                    {stage.run?.summary ??
                      "No artifact was saved for this stage."}
                  </div>
                )}

                {stageArtifacts.length > 1 ? (
                  <p className="text-xs text-muted-foreground/52">
                    {stageArtifacts.length - 1} earlier{" "}
                    {stageArtifacts.length - 1 === 1 ? "artifact" : "artifacts"}{" "}
                    were saved in this stage.
                  </p>
                ) : null}
              </div>
            </StageEntry>
          );
        })}
      </div>
    </div>
  );
}
