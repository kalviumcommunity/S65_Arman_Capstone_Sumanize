"use client";

import type { IconProps } from "@phosphor-icons/react";
import { CaretRight } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ResearchBucket } from "@/types/launch";

export function ResearchSourceCard({
  bucket,
  icon: Icon,
  iconClassName,
  label,
  latestMessage,
  status,
}: {
  bucket?: ResearchBucket;
  icon: ComponentType<IconProps>;
  iconClassName: string;
  label: string;
  latestMessage?: string;
  status?: "waiting" | "running" | "completed" | "failed";
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const formatInsightYear = (publishedDate?: string) => {
    if (!publishedDate) {
      return "";
    }

    const date = new Date(publishedDate);
    return Number.isNaN(date.getTime()) ? "" : String(date.getFullYear());
  };

  const hasFoldableDetails =
    bucket &&
    (Boolean(latestMessage) ||
      bucket.insights.length > 0 ||
      (bucket.query && bucket.query.length > 0));

  return (
    <div className="h-full max-w-full overflow-hidden border-b border-border/30 py-3 transition-all duration-500">
      <div className="flex items-start gap-2.5 px-1">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            bucket ? "bg-muted/35" : "bg-muted/20",
          )}
        >
          <Icon
            size={18}
            weight="fill"
            className={cn(iconClassName, !bucket && "opacity-45")}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground/85">
              {label}
            </span>
            {status === "failed" ? (
              <span className="text-xs text-destructive/80">failed</span>
            ) : null}
          </div>
          {bucket?.query && status !== "running" ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/70">
              {bucket.query}
            </p>
          ) : latestMessage && status !== "running" ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/70">
              {latestMessage}
            </p>
          ) : null}
        </div>
      </div>

      {hasFoldableDetails ? (
        <div className="mt-3 pt-1">
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-1.5 px-1 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:text-foreground/80">
              <CaretRight
                size={10}
                weight="bold"
                className={cn(
                  "shrink-0 transition-transform duration-150",
                  detailsOpen && "rotate-90",
                )}
              />
              {detailsOpen ? "Hide details" : "Activity & insights"}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2.5 px-1 pb-1 pt-2">
                {bucket.query ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      Query:
                    </span>{" "}
                    {bucket.query}
                  </p>
                ) : null}
                {latestMessage ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      Latest:
                    </span>{" "}
                    {latestMessage}
                  </p>
                ) : null}
                {bucket.insights.length > 0 ? (
                  <div className="space-y-1.5">
                    {bucket.insights.map((insight) => (
                      <div
                        key={`${bucket.source}-${insight.url}-${insight.signal}`}
                        className="border-l border-border/40 pl-3 text-sm leading-relaxed text-foreground/70"
                      >
                        <p>
                          <span className="font-medium text-foreground/85">
                            {insight.signal}
                          </span>
                          {" — "}
                          {insight.evidence}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                          {insight.sourceTitle}
                          {formatInsightYear(insight.publishedDate)
                            ? ` • ${formatInsightYear(insight.publishedDate)}`
                            : ""}
                          {insight.engagementHint
                            ? ` • ${insight.engagementHint}`
                            : ""}
                        </p>
                        <p className="mt-1 text-xs italic text-muted-foreground/75">
                          "{insight.quoteOrExcerpt}"
                        </p>
                        {insight.url ? (
                          <a
                            href={insight.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block text-xs text-primary/80 hover:underline"
                          >
                            Open source
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ) : !bucket && latestMessage ? (
        <div className="px-1 py-2">
          <p className="line-clamp-1 text-xs text-muted-foreground/70">
            {latestMessage}
          </p>
        </div>
      ) : null}

      {bucket && bucket.results.length > 0 ? (
        <div
          className={cn(
            "flex max-w-full flex-wrap gap-1.5 px-1 pb-1",
            hasFoldableDetails ? "mt-3" : "mt-2",
          )}
        >
          {bucket.results.map((result) => (
            <a
              key={`${bucket.source}-${result.url}`}
              href={result.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block max-w-full truncate text-xs font-medium text-foreground/75 transition-colors hover:text-foreground hover:underline"
              title={result.title}
            >
              {result.title}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
