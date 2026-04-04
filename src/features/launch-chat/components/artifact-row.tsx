"use client";

import { useEffect, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JsonArtifactView } from "@/features/launch-chat/components/json-artifact-view";
import { LaunchMarkdownBody } from "@/features/launch-chat/components/launch-markdown";
import { getArtifactDisplayName } from "@/features/launch-chat/utils/artifact-display-names";
import { formatTimestamp } from "@/features/launch-chat/utils/run-display";
import { cn } from "@/lib/utils";

export type Artifact = {
  _id: string;
  artifactType: string;
  content: unknown;
  createdAt: number;
  isFinal?: boolean;
  markdown?: string;
  version: number;
};

type ArtifactRowVariant = "accordion" | "exposed";

type QaArtifact = {
  pass: boolean;
  hookBreakdown: Array<{
    issue: string;
    label: string;
    score: number;
  }>;
  priorityFixes: string[];
  verdict: string;
  scores: {
    actionability: number;
    evidenceGrounding: number;
    fundraising: number;
    hooks: number;
    script: number;
    strategicAngle: number;
  };
  scriptBreakdown: {
    bodyBeats: number;
    cta: number;
    headline: number;
    openingHook: number;
    spokenDelivery: number;
  };
  weaknesses: string[];
  rewriteInstructions: string[];
};

type HookArtifact = {
  generatedHooks: Array<{
    archetype?: string;
    copy: string;
    label: string;
    rationale: string;
    score?: number;
    scoreReason?: string;
  }>;
  rejectedHooks: Array<{
    label: string;
    reason: string;
  }>;
  selectedHooks: Array<{
    archetype?: string;
    copy: string;
    label: string;
    rationale: string;
    score?: number;
    scoreReason?: string;
  }>;
  winningHook: {
    archetype?: string;
    copy: string;
    label: string;
    rationale: string;
    score?: number;
    scoreReason?: string;
  };
};

export function hasRenderableJson(content: unknown): boolean {
  if (content === undefined || content === null) return false;
  if (typeof content === "string") return content.trim().length > 0;
  if (typeof content === "object") {
    if (Array.isArray(content)) return content.length > 0;
    return Object.keys(content as object).length > 0;
  }
  return true;
}

function isQaArtifact(content: unknown): content is QaArtifact {
  if (!content || typeof content !== "object") return false;
  const candidate = content as Partial<QaArtifact>;
  return (
    typeof candidate.pass === "boolean" &&
    typeof candidate.verdict === "string" &&
    Boolean(candidate.scores)
  );
}

function isHookArtifact(content: unknown): content is HookArtifact {
  if (!content || typeof content !== "object") return false;
  const candidate = content as Partial<HookArtifact>;
  return (
    Array.isArray(candidate.generatedHooks) &&
    Array.isArray(candidate.selectedHooks) &&
    Boolean(candidate.winningHook)
  );
}

function HookArtifactSummary({ report }: { report: HookArtifact }) {
  return (
    <div className="space-y-4 border-l border-border/40 pl-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground/70">
          Winning Hook
        </p>
        <p className="mt-1 text-sm font-medium text-foreground/95">
          {report.winningHook.label}
          {report.winningHook.score ? ` • ${report.winningHook.score}/10` : ""}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/85">
          {report.winningHook.copy}
        </p>
        {report.winningHook.scoreReason ? (
          <p className="mt-1 text-xs text-muted-foreground/75">
            {report.winningHook.scoreReason}
          </p>
        ) : null}
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground/70">
          Selected Hooks
        </p>
        <div className="mt-2 grid gap-2">
          {report.selectedHooks.map((hook) => (
            <div key={hook.label} className="border-l border-border/35 pl-3">
              <p className="text-sm font-medium text-foreground/90">
                {hook.label}
                {hook.archetype ? ` • ${hook.archetype}` : ""}
                {hook.score ? ` • ${hook.score}/10` : ""}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                {hook.copy}
              </p>
              {hook.scoreReason ? (
                <p className="mt-1 text-xs text-muted-foreground/75">
                  {hook.scoreReason}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {report.rejectedHooks.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground/70">
            Rejected Hooks
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
            {report.rejectedHooks.map((hook) => (
              <li key={hook.label}>
                <span className="font-medium">{hook.label}:</span> {hook.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function QaArtifactSummary({ report }: { report: QaArtifact }) {
  const entries = Object.entries(report.scores);
  const scriptEntries = Object.entries(report.scriptBreakdown);

  return (
    <div className="space-y-4 border-l border-border/40 pl-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground/70">Verdict</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/90">
          {report.verdict}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-md border border-border/35 bg-muted/15 px-3 py-2"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
              {key.replace(/([A-Z])/g, " $1")}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground/90">
              {value}/10
            </p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground/70">
          Script Breakdown
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {scriptEntries.map(([key, value]) => (
            <div
              key={key}
              className="rounded-md border border-border/35 bg-muted/15 px-3 py-2"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground/90">
                {value}/10
              </p>
            </div>
          ))}
        </div>
      </div>

      {report.hookBreakdown.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground/70">
            Hook Breakdown
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
            {report.hookBreakdown.map((hook) => (
              <li key={hook.label}>
                <span className="font-medium">{hook.label}</span>
                {` • ${hook.score}/10`}
                {` • ${hook.issue}`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.weaknesses.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground/70">
            Weaknesses
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
            {report.weaknesses.map((weakness) => (
              <li key={weakness}>{weakness}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.priorityFixes.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground/70">
            Priority Fixes
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
            {report.priorityFixes.map((fix) => (
              <li key={fix}>{fix}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.rewriteInstructions.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground/70">
            Rewrite Instructions
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
            {report.rewriteInstructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function ArtifactRow({
  artifact,
  isLive = false,
  description,
  variant = "accordion",
}: {
  artifact: Artifact;
  isLive?: boolean;
  description?: string;
  variant?: ArtifactRowVariant;
}) {
  const [open, setOpen] = useState(isLive);
  const prevIsLiveRef = useRef(isLive);

  useEffect(() => {
    if (variant !== "accordion") return;
    const prev = prevIsLiveRef.current;
    prevIsLiveRef.current = isLive;
    if (isLive && !prev) {
      setOpen(true);
    } else if (!isLive && prev) {
      const t = setTimeout(() => setOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isLive, variant]);

  const showMarkdown = Boolean(artifact.markdown?.trim());
  const showJson = hasRenderableJson(artifact.content);
  const hookArtifact =
    artifact.artifactType === "hook_candidates" &&
    isHookArtifact(artifact.content)
      ? artifact.content
      : null;
  const qaArtifact =
    artifact.artifactType === "qa_report" && isQaArtifact(artifact.content)
      ? artifact.content
      : null;

  const title = getArtifactDisplayName(artifact.artifactType);
  const hasDesc = Boolean(description?.trim());
  const artifactBody = (
    <div className="relative">
      <ScrollArea className="h-[420px] max-h-[70vh]">
        <div className="max-w-full space-y-4 px-4 pb-4 pt-1">
          {showMarkdown ? (
            <div className="overflow-hidden border-l border-border/40 pl-4">
              <LaunchMarkdownBody markdown={artifact.markdown ?? ""} />
            </div>
          ) : null}
          {hookArtifact ? <HookArtifactSummary report={hookArtifact} /> : null}
          {qaArtifact ? <QaArtifactSummary report={qaArtifact} /> : null}
          {showJson ? (
            <div className="space-y-1.5">
              {showMarkdown ? (
                <p className="text-xs font-medium text-muted-foreground/70">
                  Structured data
                </p>
              ) : qaArtifact ? (
                <p className="text-xs font-medium text-muted-foreground/70">
                  Raw artifact
                </p>
              ) : null}
              <JsonArtifactView data={artifact.content} />
            </div>
          ) : null}
          {!showMarkdown && !showJson ? (
            <p className="text-sm text-muted-foreground/50">No content.</p>
          ) : null}
        </div>
      </ScrollArea>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/60 to-transparent" />
    </div>
  );

  if (variant === "exposed") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-md border border-border/30 bg-muted/[0.03]",
          isLive && "border-border/60 ring-1 ring-border/40",
        )}
      >
        <div className="flex min-w-0 items-start gap-2 px-3 py-3">
          <span className="min-w-0 flex-1 text-sm leading-snug text-muted-foreground/70">
            <span className="font-medium">{title}</span>
            {hasDesc ? (
              <>
                <span> - </span>
                <span>{description}</span>
              </>
            ) : null}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground/35">
            {formatTimestamp(artifact.createdAt)}
          </span>
        </div>
        {artifactBody}
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-start gap-2 px-3 py-3 text-left transition-colors hover:bg-muted/20",
          open && "bg-muted/10",
        )}
      >
        <span className="min-w-0 flex-1 text-sm leading-snug text-muted-foreground/70">
          <span className="font-medium">{title}</span>
          {hasDesc ? (
            <>
              <span> - </span>
              <span>{description}</span>
            </>
          ) : null}
        </span>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground/35">
          {formatTimestamp(artifact.createdAt)}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>{artifactBody}</CollapsibleContent>
    </Collapsible>
  );
}
