"use client";

import { CaretRight, GlobeSimpleIcon } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ResearchSourceCard } from "@/features/launch-chat/components/research-source-card";
import {
  sourceMeta,
  sourceOrder,
} from "@/features/launch-chat/constants/source-meta";
import { riseInItem, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ResearchBucket } from "@/types/launch";

export function ResearchSourcesGrid({
  buckets,
  latestMessages,
  sourceStatuses,
  embedded = false,
}: {
  buckets: Map<string, ResearchBucket>;
  latestMessages: Partial<Record<ResearchBucket["source"], string>>;
  sourceStatuses: Partial<
    Record<
      ResearchBucket["source"],
      "waiting" | "running" | "completed" | "failed"
    >
  >;
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;

  const content = (
    <motion.div
      className={cn("grid gap-x-6 gap-y-3 sm:grid-cols-2", !embedded && "mt-5")}
      variants={staggerContainer(reduceMotion, 0.04)}
      initial="hidden"
      animate="visible"
    >
      {sourceOrder.map((sourceKey, index) => {
        const meta = sourceMeta[sourceKey];
        return (
          <motion.div
            key={sourceKey}
            variants={riseInItem(reduceMotion, 12 + index * 2)}
          >
            <ResearchSourceCard
              bucket={buckets.get(sourceKey)}
              icon={meta.icon}
              iconClassName={meta.iconClassName}
              label={meta.label}
              latestMessage={latestMessages[sourceKey]}
              status={sourceStatuses[sourceKey]}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );

  if (embedded) {
    return <div className="max-w-full select-none">{content}</div>;
  }

  return (
    <section className="mb-6 max-w-full select-none">
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
              <GlobeSimpleIcon
                size={16}
                weight="fill"
                className="shrink-0 text-[#e394dc]"
              />
              <h2 className="text-sm font-medium text-foreground/85">
                Sources
              </h2>
            </div>
            <p className="text-xs text-muted-foreground/65">
              Review the live research inputs feeding this run.
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
