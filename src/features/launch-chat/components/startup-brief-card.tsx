"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StartupBrief } from "@/types/launch";

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground/85">{value}</span>
    </div>
  );
}

function NarrativeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {label}
      </span>
      <p className="text-sm leading-relaxed text-foreground/80">{value}</p>
    </div>
  );
}

export function StartupBriefCard({ brief }: { brief: StartupBrief }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mb-6">
      <Card className="gap-0 overflow-hidden p-0 ring-1 ring-foreground/8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/30 px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {brief.productName}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {brief.companyName}
              {brief.category ? (
                <span className="text-muted-foreground/50">
                  {" "}
                  · {brief.category}
                </span>
              ) : null}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : "Show more"}
            <CaretDown
              size={13}
              className={cn(
                "transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
          </Button>
        </div>

        {/* Expanded narrative fields */}
        {expanded ? (
          <div className="flex flex-col divide-y divide-border/30">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-4">
              <MetaChip label="Audience" value={brief.targetAudience} />
              <MetaChip label="Category" value={brief.category} />
              <MetaChip label="Funding stage" value={brief.fundingStage} />
              <MetaChip label="Company" value={brief.companyName} />
            </div>
            {brief.launchGoal ? (
              <div className="px-6 py-5">
                <NarrativeBlock label="Launch goal" value={brief.launchGoal} />
              </div>
            ) : null}
            {brief.desiredOutcome ? (
              <div className="px-6 py-5">
                <NarrativeBlock
                  label="Desired outcome"
                  value={brief.desiredOutcome}
                />
              </div>
            ) : null}
            {brief.productDescription ? (
              <div className="px-6 py-5">
                <NarrativeBlock
                  label="Product description"
                  value={brief.productDescription}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
    </section>
  );
}
