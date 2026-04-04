"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/shared/app-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LaunchChatHeaderActions } from "@/features/launch-chat/components/launch-chat-header-actions";
import { LaunchPackagePreviewCard } from "@/features/launch-chat/components/launch-package-preview-card";
import { LaunchRunTabs } from "@/features/launch-chat/components/launch-run-tabs";
import { StartupBriefCard } from "@/features/launch-chat/components/startup-brief-card";
import {
  type StreamPhase,
  useLaunchStream,
} from "@/features/launch-chat/hooks/use-launch-stream";
import { useViewMode } from "@/features/launch-chat/hooks/use-view-mode";
import { getRunProgressPct } from "@/features/launch-chat/utils/run-progress";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  MOTION_SPRING,
  pageReveal,
  riseInItem,
  staggerContainer,
} from "@/lib/motion";
import type { LaunchPackage, ResearchBucket } from "@/types/launch";

const STAGE_PREVIEW_ARTIFACTS: Record<string, string> = {
  research_planning: "research_plan",
  source_retrieval: "evidence_bundle",
  evidence_curation: "evidence_bundle",
  synthesis_agent: "synthesis_notes",
  hook_agent: "hook_candidates",
  package_draft: "launch_package_draft",
  qa_check: "qa_report",
  rewrite_attempt: "rewrite_draft",
  finalized: "launch_package_final",
};

export function LaunchChatScreen({ runId }: { runId: string }) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;
  const typedRunId = runId as Id<"runs">;
  const runData = useQuery(api.runs.getById, { runId: typedRunId });
  const stopRun = useMutation(api.runs.markStopped);
  const rerunFromRun = useMutation(api.runs.rerunFromRun);
  const hasStartedRef = useRef(false);
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showOpenSequence, setShowOpenSequence] = useState(!reduceMotion);
  const {
    buckets,
    finalPackage: streamedPackage,
    hydrate,
    phase,
    startStream,
    stopStream,
    synthesis,
  } = useLaunchStream();
  const { mode, effectiveMode, setMode } = useViewMode();
  const reveal = pageReveal(reduceMotion);

  const persistedResearch = useMemo(() => {
    const artifact = runData?.artifacts.find(
      (entry) => entry.artifactType === "research",
    );
    return (artifact?.content as ResearchBucket[] | undefined) ?? [];
  }, [runData]);

  const persistedSynthesis = useMemo(() => {
    const artifact = runData?.artifacts.find(
      (entry) => entry.artifactType === "launch_package_markdown",
    );
    if (!artifact) return "";
    if (typeof artifact.markdown === "string") return artifact.markdown;
    const value = artifact.content as { text?: string } | undefined;
    return value?.text ?? "";
  }, [runData]);

  const persistedPackage = useMemo(() => {
    const artifact = runData?.artifacts.find(
      (entry) => entry.artifactType === "launch_package_final",
    );
    if (artifact?.content && typeof artifact.content === "object") {
      return artifact.content as LaunchPackage;
    }
    return null;
  }, [runData]);

  const displayedBuckets = buckets.size
    ? buckets
    : new Map(persistedResearch.map((bucket) => [bucket.source, bucket]));
  const displayedSynthesis = synthesis || persistedSynthesis;

  const sourceStatuses = useMemo(() => {
    const result: Partial<
      Record<
        ResearchBucket["source"],
        "waiting" | "running" | "completed" | "failed"
      >
    > = {};
    runData?.runEvents.forEach((event) => {
      if (!event.source) return;
      if (event.kind === "source_started") result[event.source] = "running";
      if (event.kind === "source_completed") result[event.source] = "completed";
      if (event.kind === "source_failed") result[event.source] = "failed";
    });
    return result;
  }, [runData]);

  const sourceMessages = useMemo(() => {
    const result: Partial<Record<ResearchBucket["source"], string>> = {};
    runData?.runEvents.forEach((event) => {
      if (event.source && event.message) result[event.source] = event.message;
    });
    return result;
  }, [runData]);

  const displayedPhase: StreamPhase =
    phase !== "idle"
      ? phase
      : runData?.run.status === "stopped"
        ? "stopped"
        : runData?.run.status === "failed"
          ? "error"
          : displayedSynthesis
            ? "done"
            : "idle";

  const displayedPackage = streamedPackage ?? persistedPackage;

  const previewArtifactType = useMemo(() => {
    if (displayedPackage || displayedSynthesis) {
      return "launch_package_final";
    }

    const currentStage = runData?.run.currentStage;
    if (!currentStage) {
      return "launch_package_final";
    }

    return STAGE_PREVIEW_ARTIFACTS[currentStage] ?? "launch_package_final";
  }, [displayedPackage, displayedSynthesis, runData?.run.currentStage]);

  const progressPct = useMemo(
    () => getRunProgressPct(runData?.stageRuns ?? []),
    [runData?.stageRuns],
  );

  useEffect(() => {
    if (!runData || hasStartedRef.current) return;
    if (persistedResearch.length > 0 || persistedSynthesis) {
      hydrate({
        finalPackage: persistedPackage,
        research: persistedResearch,
        synthesisMarkdown: persistedSynthesis,
      });
      hasStartedRef.current = true;
      return;
    }
    if (
      runData.run.status === "queued" ||
      runData.run.status === "generating"
    ) {
      hasStartedRef.current = true;
      void startStream({ runId: typedRunId });
    }
  }, [
    hydrate,
    persistedPackage,
    persistedResearch,
    persistedSynthesis,
    runData,
    startStream,
    typedRunId,
  ]);

  useEffect(() => {
    if (reduceMotion) {
      setShowOpenSequence(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowOpenSequence(false);
    }, 820);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [reduceMotion]);

  if (runData === undefined) {
    return (
      <motion.div
        className="flex min-h-screen flex-col bg-background"
        initial={reveal.initial}
        animate={reveal.animate}
        transition={reveal.transition}
      >
        <AppHeader />
        <div className="flex-1" />
      </motion.div>
    );
  }

  async function handleRerun() {
    if (isRestarting) return;

    setIsRestarting(true);

    try {
      const { runId: nextRunId } = await rerunFromRun({ runId: typedRunId });
      setIsRestartDialogOpen(false);
      router.push(`/chat/${nextRunId}`, {
        transitionTypes: ["route-chat-open"],
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to restart this run right now."),
      );
    } finally {
      setIsRestarting(false);
    }
  }

  async function handleStop() {
    stopStream();

    try {
      await stopRun({
        runId: typedRunId,
        message: "Run stopped by user.",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to stop this run right now."));
    }
  }

  const isSplit = effectiveMode === "split";

  const previewProps = {
    artifactType: previewArtifactType,
    phase: displayedPhase,
    progressPct,
    synthesis: displayedSynthesis,
    structuredPackage: displayedPackage,
  };

  const leftContent = (
    <motion.div
      className="space-y-0"
      variants={staggerContainer(reduceMotion, 0.08)}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={riseInItem(reduceMotion, 14)}>
        <StartupBriefCard brief={runData.run.briefSnapshot} />
      </motion.div>
      <motion.div variants={riseInItem(reduceMotion, 20)}>
        <LaunchRunTabs
          stageRuns={runData.stageRuns}
          buckets={displayedBuckets}
          latestMessages={sourceMessages}
          sourceStatuses={sourceStatuses}
          artifacts={runData.artifacts}
        />
      </motion.div>
    </motion.div>
  );

  const rightContent = (
    <motion.div
      variants={riseInItem(reduceMotion, 22)}
      initial="hidden"
      animate="visible"
      transition={MOTION_SPRING}
    >
      <LaunchPackagePreviewCard {...previewProps} centerPlaceholder={isSplit} />
    </motion.div>
  );

  const unifiedContent = (
    <motion.div
      className="space-y-6"
      variants={staggerContainer(reduceMotion, 0.1)}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={riseInItem(reduceMotion, 18)}>
        <LaunchPackagePreviewCard {...previewProps} />
      </motion.div>
      <motion.div variants={riseInItem(reduceMotion, 16)}>
        <LaunchRunTabs
          stageRuns={runData.stageRuns}
          buckets={displayedBuckets}
          latestMessages={sourceMessages}
          sourceStatuses={sourceStatuses}
          artifacts={runData.artifacts}
        />
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      className="flex min-h-screen flex-col bg-background"
      initial={
        reduceMotion
          ? false
          : { filter: "blur(14px)", opacity: 0, scale: 0.976, y: 34 }
      }
      animate={
        reduceMotion
          ? undefined
          : { filter: "blur(0px)", opacity: 1, scale: 1, y: 0 }
      }
      transition={{
        duration: reduceMotion ? 0 : 0.72,
        ease: [0.2, 0.95, 0.25, 1],
      }}
    >
      <AnimatePresence>
        {showOpenSequence ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="absolute inset-0 bg-background/50 backdrop-blur-[2px]"
              initial={{ opacity: 0.82 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.66, ease: [0.2, 0.95, 0.25, 1] }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-background via-background/75 to-transparent"
              initial={{ x: 0 }}
              animate={{ x: "-108%" }}
              transition={{ duration: 0.74, ease: [0.2, 0.95, 0.25, 1] }}
            />
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-background via-background/75 to-transparent"
              initial={{ x: 0 }}
              animate={{ x: "108%" }}
              transition={{ duration: 0.74, ease: [0.2, 0.95, 0.25, 1] }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AlertDialog
        open={isRestartDialogOpen}
        onOpenChange={(open) => {
          if (!isRestarting) {
            setIsRestartDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart this run?</AlertDialogTitle>
            <AlertDialogDescription>
              This will start a new run from the same startup brief and take you
              to the new run once it begins.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestarting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRerun} disabled={isRestarting}>
              {isRestarting ? "Restarting..." : "Restart run"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AppHeader
        actions={
          <LaunchChatHeaderActions
            runStatus={runData.run.status}
            viewMode={mode}
            onViewModeChange={setMode}
            onRerun={() => setIsRestartDialogOpen(true)}
            onStop={handleStop}
          />
        }
      />

      <div>
        {isSplit ? (
          <div
            className="grid grid-cols-2"
            style={{
              height: "calc(100vh - 3.5rem)",
            }}
          >
            <motion.div
              className="overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
              initial={reduceMotion ? undefined : { opacity: 0, x: -12 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={reduceMotion ? undefined : { transformPerspective: 1000 }}
            >
              {leftContent}
            </motion.div>
            <motion.div
              className="overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
              initial={
                reduceMotion ? undefined : { opacity: 0, rotateY: -3.8, x: 12 }
              }
              animate={
                reduceMotion ? undefined : { opacity: 1, rotateY: 0, x: 0 }
              }
              transition={{
                duration: reduceMotion ? 0 : 0.58,
                ease: [0.22, 1, 0.36, 1],
                delay: reduceMotion ? 0 : 0.07,
              }}
              style={
                reduceMotion
                  ? undefined
                  : {
                      transformOrigin: "left center",
                      transformPerspective: 1100,
                    }
              }
            >
              {rightContent}
            </motion.div>
          </div>
        ) : (
          <motion.div
            className="mx-auto w-full max-w-5xl px-5 py-5 sm:px-6 lg:px-8"
            variants={staggerContainer(reduceMotion, 0.08)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={riseInItem(reduceMotion, 12)}>
              <StartupBriefCard brief={runData.run.briefSnapshot} />
            </motion.div>
            <motion.div variants={riseInItem(reduceMotion, 18)}>
              {unifiedContent}
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
