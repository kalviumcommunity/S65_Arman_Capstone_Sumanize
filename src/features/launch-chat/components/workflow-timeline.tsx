"use client";

import { CaretRight, Timer } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDuration } from "@/features/launch-chat/utils/run-display";
import { MOTION_SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

type StageRun = {
  _id: string;
  attemptNumber: number;
  completedAt?: number;
  stageKey: string;
  startedAt: number;
  status: "running" | "completed" | "stopped" | "failed";
  summary?: string;
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
  "finalized",
] as const;

type StageStatus = "completed" | "running" | "stopped" | "failed" | "pending";

type DerivedStage = {
  key: string;
  label: string;
  status: StageStatus;
  run: StageRun | null;
};

function humanize(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusText(stage: DerivedStage) {
  if (!stage.run) return "Pending";
  const duration = formatDuration(stage.run.startedAt, stage.run.completedAt);
  switch (stage.status) {
    case "running":
      return "In progress\u2026";
    case "failed":
      return duration ? `Failed \u00b7 ${duration}` : "Failed";
    case "stopped":
      return duration ? `Stopped \u00b7 ${duration}` : "Stopped";
    case "completed":
      return duration ?? "Done";
    default:
      return "Pending";
  }
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

    const stages: DerivedStage[] = PIPELINE_STAGES.map((key) => {
      const run = latest.get(key) ?? null;
      return {
        key,
        label: humanize(key),
        status: (run?.status ?? "pending") as StageStatus,
        run,
      };
    });

    let focusIdx = stages.findIndex((s) => s.status === "running");
    if (focusIdx === -1) {
      for (let i = stages.length - 1; i >= 0; i--) {
        if (
          stages[i].status === "completed" ||
          stages[i].status === "stopped" ||
          stages[i].status === "failed"
        ) {
          focusIdx = i;
          break;
        }
      }
    }
    if (focusIdx === -1) focusIdx = 0;

    const completedCount = stages.filter(
      (s) => s.status === "completed",
    ).length;

    return { stages, focusIdx, completedCount };
  }, [stageRuns]);
}

function StageCard({
  stage,
  stepNumber,
  variant,
}: {
  stage: DerivedStage;
  stepNumber: number;
  variant: "previous" | "current" | "next";
}) {
  const isCurrent = variant === "current";
  const isFailed = stage.status === "failed";
  const isStopped = stage.status === "stopped";

  return (
    <div
      className={cn(
        "flex-1 rounded-lg px-3 py-2.5 transition-all duration-300",
        isCurrent && !isFailed && !isStopped && "bg-muted/30",
        isCurrent && isFailed && "bg-destructive/[0.06]",
        isCurrent && isStopped && "bg-muted/20",
        !isCurrent && "bg-transparent",
        variant === "previous" && "opacity-55",
        variant === "next" && "opacity-40",
      )}
    >
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "text-base font-semibold tabular-nums leading-none",
            isCurrent && !isFailed && !isStopped && "text-primary",
            isCurrent && isFailed && "text-destructive",
            isCurrent && isStopped && "text-muted-foreground/80",
            !isCurrent && "text-muted-foreground/30",
          )}
        >
          {stepNumber}.
        </span>
        <span
          className={cn(
            "text-[13px] font-medium leading-snug",
            isCurrent ? "text-foreground/90" : "text-muted-foreground/50",
          )}
        >
          {stage.label}
        </span>
      </div>
      <p
        className={cn(
          "mt-1 pl-6 text-xs",
          isCurrent && stage.status === "running" && "text-primary/60",
          isCurrent && stage.status === "completed" && "text-chart-2/70",
          isCurrent && stage.status === "stopped" && "text-muted-foreground/70",
          isCurrent && stage.status === "failed" && "text-destructive/60",
          isCurrent && stage.status === "pending" && "text-muted-foreground/40",
          !isCurrent && "text-muted-foreground/30",
        )}
      >
        {statusText(stage)}
      </p>
    </div>
  );
}

export function WorkflowTimeline({
  stageRuns,
  embedded = false,
}: {
  stageRuns: StageRun[];
  embedded?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;
  const { stages, focusIdx, completedCount } = usePipeline(stageRuns);
  const total = stages.length;
  const allStagesComplete = total > 0 && completedCount === total;

  const [open, setOpen] = useState(true);
  const prevAllCompleteRef = useRef<boolean | null>(null);

  useEffect(() => {
    const prev = prevAllCompleteRef.current;
    if (prev === null) {
      if (allStagesComplete) setOpen(false);
      prevAllCompleteRef.current = allStagesComplete;
      return;
    }
    prevAllCompleteRef.current = allStagesComplete;
    if (allStagesComplete && !prev) {
      setOpen(false);
    }
  }, [allStagesComplete]);

  if (stageRuns.length === 0) return null;

  const progressPct = total <= 1 ? 100 : (focusIdx / (total - 1)) * 100;

  const focusStage = stages[focusIdx];
  const prevStage = focusIdx > 0 ? stages[focusIdx - 1] : null;
  const nextStage = focusIdx < total - 1 ? stages[focusIdx + 1] : null;

  const isRunning = focusStage.status === "running";

  const tooltipTransform =
    progressPct < 20
      ? "translateX(-10%)"
      : progressPct > 80
        ? "translateX(-90%)"
        : "translateX(-50%)";

  const content = (
    <>
      {/* Progress bar area */}
      <div className={cn("relative px-1.5", !embedded && "mt-5")}>
        {/* Floating tooltip (only while running) */}
        {isRunning && (
          <div
            className="pointer-events-none absolute z-10 mb-2.5"
            style={{
              left: `${progressPct}%`,
              transform: tooltipTransform,
              bottom: "calc(100% - 0.25rem)",
            }}
          >
            <div className="rounded-md border border-primary/15 bg-card px-3 py-1.5">
              <p className="whitespace-nowrap text-xs font-medium text-foreground/80">
                {focusStage.label}
              </p>
              <p className="whitespace-nowrap text-[10px] text-primary/50">
                In progress\u2026
              </p>
            </div>
            <svg
              aria-hidden="true"
              width="10"
              height="5"
              viewBox="0 0 10 5"
              className="mx-auto block"
              style={{
                marginLeft:
                  progressPct < 20
                    ? "10%"
                    : progressPct > 80
                      ? "calc(100% - 10% - 10px)"
                      : "calc(50% - 5px)",
              }}
            >
              <path d="M0 0 L5 5 L10 0" className="fill-card" />
            </svg>
          </div>
        )}

        {/* Track */}
        <div className="relative flex h-5 items-center">
          {/* Base line */}
          <div className="absolute inset-x-0 h-[1.5px] rounded-full bg-border/30" />
          {/* Filled line */}
          <motion.div
            className="absolute h-[1.5px] rounded-full bg-primary/50 transition-[width] duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
            transition={reduceMotion ? undefined : MOTION_SPRING}
          />

          {!reduceMotion ? (
            <motion.div
              className="absolute top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/80 blur-[0.5px]"
              style={{ left: `${progressPct}%` }}
              animate={{ opacity: [0.35, 0.95, 0.35], scale: [0.8, 1.25, 0.8] }}
              transition={{
                duration: 1.1,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          ) : null}

          {/* Dots */}
          {stages.map((stage, i) => {
            const left = total <= 1 ? 50 : (i / (total - 1)) * 100;
            const isActive = i === focusIdx;
            const isCompleted = stage.status === "completed";
            const isStopped = stage.status === "stopped";
            const isFailed = stage.status === "failed";
            const stageRunning = stage.status === "running";
            const isPast = i < focusIdx;

            return (
              <div
                key={stage.key}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%` }}
              >
                <motion.div
                  className={cn(
                    "rounded-full transition-all duration-500",
                    stageRunning && "timeline-stage-running",
                    isActive && stageRunning && "h-3.5 w-3.5 bg-primary",
                    isActive && isCompleted && "h-3 w-3 bg-chart-2",
                    isActive && isStopped && "h-3 w-3 bg-muted-foreground/80",
                    isActive && isFailed && "h-3.5 w-3.5 bg-destructive",
                    isActive &&
                      stage.status === "pending" &&
                      "h-3 w-3 border-2 border-primary/40 bg-background",
                    !isActive && isCompleted && "h-2 w-2 bg-primary/70",
                    !isActive && isStopped && "h-2 w-2 bg-muted-foreground/60",
                    !isActive && isFailed && "h-2 w-2 bg-destructive/60",
                    !isActive &&
                      !isCompleted &&
                      !isStopped &&
                      !isFailed &&
                      isPast &&
                      "h-2 w-2 bg-primary/40",
                    !isActive &&
                      stage.status === "pending" &&
                      !isPast &&
                      "h-[7px] w-[7px] border border-border/50 bg-background",
                  )}
                  animate={
                    reduceMotion
                      ? undefined
                      : isActive && stageRunning
                        ? { scale: [1, 1.16, 1] }
                        : undefined
                  }
                  transition={
                    reduceMotion
                      ? undefined
                      : isActive && stageRunning
                        ? { duration: 1, ease: "easeInOut", repeat: Infinity }
                        : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage detail cards */}
      <div className="mt-5 flex gap-2">
        {prevStage ? (
          <StageCard
            stage={prevStage}
            stepNumber={focusIdx}
            variant="previous"
          />
        ) : (
          <div className="flex-1" />
        )}
        <StageCard
          stage={focusStage}
          stepNumber={focusIdx + 1}
          variant="current"
        />
        {nextStage ? (
          <StageCard
            stage={nextStage}
            stepNumber={focusIdx + 2}
            variant="next"
          />
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className="select-none">{content}</div>;
  }

  return (
    <section className="mb-6 select-none">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full cursor-pointer items-start gap-2 rounded-md py-1.5 text-left">
          <CaretRight
            size={12}
            weight="bold"
            className={cn(
              "shrink-0 text-muted-foreground/50 transition-transform duration-150",
              open && "rotate-90",
            )}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Timer
                size={16}
                weight="fill"
                className="shrink-0 text-[#a8cc7c]"
              />
              <h2 className="text-sm font-medium text-foreground/85">
                Progress
              </h2>
            </div>
            <p className="text-xs text-muted-foreground/65">
              Track each step as your research run moves forward.
            </p>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="data-[ending-style]:animate-out data-[ending-style]:fade-out-0 data-[starting-style]:animate-in data-[starting-style]:fade-in-0">
          {content}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
