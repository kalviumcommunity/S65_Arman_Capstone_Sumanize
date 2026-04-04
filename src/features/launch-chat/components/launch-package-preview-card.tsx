"use client";

import { CaretDown, Clock } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LaunchMarkdownBody } from "@/features/launch-chat/components/launch-markdown";
import { LaunchPackageStructuredView } from "@/features/launch-chat/components/package-view/launch-package-structured-view";
import type { StreamPhase } from "@/features/launch-chat/hooks/use-launch-stream";
import { parsePackageFromMarkdown } from "@/features/launch-chat/lib/parse-package-markdown";
import {
  getArtifactDescription,
  getArtifactDisplayName,
} from "@/features/launch-chat/utils/artifact-display-names";
import { riseInItem, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LaunchPackage } from "@/types/launch";

function getPreviewMarkdown(markdown: string) {
  const previewLines = markdown
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .slice(0, 12);

  return previewLines.join("\n\n");
}

export function LaunchPackagePreviewCard({
  artifactType,
  centerPlaceholder = false,
  phase,
  progressPct = 0,
  synthesis,
  structuredPackage,
}: {
  artifactType?: string;
  centerPlaceholder?: boolean;
  phase: StreamPhase;
  progressPct?: number;
  synthesis: string;
  structuredPackage?: LaunchPackage | null;
}) {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;
  const [expanded, setExpanded] = useState(false);
  const hasSynthesis = synthesis.trim().length > 0;
  const previewMarkdown = hasSynthesis ? getPreviewMarkdown(synthesis) : "";
  const isLoading = phase === "researching" || phase === "synthesizing";
  const isStopped = phase === "stopped";
  const artifactTitle = artifactType
    ? getArtifactDisplayName(artifactType)
    : "Launch package";
  const artifactDescription = artifactType
    ? getArtifactDescription(artifactType)
    : undefined;

  const resolvedPackage = useMemo(() => {
    if (structuredPackage) return structuredPackage;
    if (!isLoading && !isStopped && hasSynthesis) {
      return parsePackageFromMarkdown(synthesis);
    }
    return null;
  }, [structuredPackage, hasSynthesis, isLoading, isStopped, synthesis]);

  const showStructuredView = resolvedPackage !== null;
  const showMarkdownPreview = !showStructuredView && hasSynthesis;
  const shouldCenterPlaceholder =
    centerPlaceholder && !showStructuredView && !showMarkdownPreview;

  return (
    <motion.section
      className={cn(
        "mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both",
        shouldCenterPlaceholder &&
          "flex min-h-full items-center justify-center",
      )}
      variants={staggerContainer(reduceMotion, 0.05)}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-full pb-6"
        variants={riseInItem(reduceMotion, 14)}
      >
        {showStructuredView ? (
          <motion.div
            initial={
              reduceMotion
                ? undefined
                : { opacity: 0, y: 12, clipPath: "inset(0 0 32% 0)" }
            }
            animate={
              reduceMotion
                ? undefined
                : { opacity: 1, y: 0, clipPath: "inset(0 0 0 0)" }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.52,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <LaunchPackageStructuredView
              pkg={resolvedPackage}
              markdown={synthesis}
            />
          </motion.div>
        ) : isLoading ? (
          <motion.div
            className="px-4 py-6"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <motion.div
                className="flex size-9 items-center justify-center rounded-full bg-muted/40"
                animate={
                  reduceMotion
                    ? undefined
                    : { rotate: [0, -8, 9, 0], scale: [1, 1.08, 1] }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 1.4, ease: "easeInOut", repeat: Infinity }
                }
              >
                <Clock
                  size={16}
                  weight="fill"
                  className="text-muted-foreground/75"
                />
              </motion.div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground/80">
                <p className="font-medium text-foreground/85">
                  {artifactTitle}
                </p>
                {artifactDescription ? <p>{artifactDescription}</p> : null}
                <p className="text-xs text-muted-foreground/70">
                  Building this stage now.
                </p>
              </div>
              <div className="mt-5 w-full max-w-md">
                <div className="relative h-1.5 overflow-hidden rounded-full bg-muted/40">
                  <motion.div
                    className="h-full rounded-full bg-primary/70"
                    animate={{ width: `${progressPct}%` }}
                    initial={{ width: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.46,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                  {!reduceMotion ? (
                    <motion.div
                      key={`progress-pulse-${Math.round(progressPct)}`}
                      className="pointer-events-none absolute inset-0 rounded-full"
                      initial={{ opacity: 0.38 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 40%, transparent), transparent)",
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <Card className="gap-0 overflow-hidden p-0 ring-1 ring-foreground/8">
            <div className="border-b border-border/30 px-4 py-3">
              {showMarkdownPreview ? (
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded((value) => !value)}
                  >
                    {expanded ? "Show preview" : "Show full"}
                    <CaretDown
                      size={14}
                      className={cn(
                        "transition-transform",
                        expanded && "rotate-180",
                      )}
                    />
                  </Button>
                </div>
              ) : null}
            </div>

            <div
              className={cn(
                "px-4 py-6",
                !showMarkdownPreview &&
                  "flex min-h-[320px] flex-col items-center justify-center text-center",
              )}
            >
              {isStopped && artifactType ? (
                <div className="space-y-2 text-sm text-muted-foreground/80">
                  <p className="font-medium text-foreground/85">
                    {artifactTitle}
                  </p>
                  {artifactDescription ? <p>{artifactDescription}</p> : null}
                  <p className="text-xs text-muted-foreground/70">
                    Research stopped before this stage finished.
                  </p>
                </div>
              ) : showMarkdownPreview ? (
                <div className="border border-border/30 bg-background/20 px-4 py-4">
                  <div
                    className={cn(
                      "relative text-sm",
                      !expanded && "max-h-96 overflow-hidden",
                    )}
                  >
                    <LaunchMarkdownBody
                      markdown={expanded ? synthesis : previewMarkdown}
                    />
                    {!expanded ? (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/85 to-transparent" />
                    ) : null}
                  </div>
                </div>
              ) : artifactType ? (
                <div className="space-y-2 text-sm text-muted-foreground/80">
                  <p className="font-medium text-foreground/85">
                    {artifactTitle}
                  </p>
                  {artifactDescription ? <p>{artifactDescription}</p> : null}
                </div>
              ) : (
                <div className="border border-destructive/30 bg-destructive/[0.04] px-4 py-4 text-sm text-destructive/85">
                  Launch package preview unavailable for this run.
                </div>
              )}
            </div>
          </Card>
        )}
      </motion.div>
    </motion.section>
  );
}
