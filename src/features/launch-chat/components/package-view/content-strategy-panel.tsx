"use client";

import type { LaunchPackage } from "@/types/launch";

export function ContentStrategyPanel({
  strategy,
}: {
  strategy: LaunchPackage["contentStrategy"];
}) {
  const hasPositioning = Boolean(strategy.positioning);
  const hasCampaignMoves = strategy.campaignMoves.length > 0;
  const hasChannelPlan = strategy.channelPlan.length > 0;

  if (!hasPositioning && !hasCampaignMoves && !hasChannelPlan) return null;

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-5 px-6 py-6"
      style={{ animationDelay: "240ms", animationDuration: "500ms" }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        Content strategy
      </p>

      {hasPositioning ? (
        <div className="border-l-2 border-foreground/20 pl-5 py-1">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Positioning
          </p>
          <p className="text-sm leading-relaxed text-foreground/85">
            {strategy.positioning}
          </p>
        </div>
      ) : null}

      {hasCampaignMoves ? (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Campaign moves
          </p>
          <div className="space-y-1.5">
            {strategy.campaignMoves.map((move) => (
              <div
                key={move}
                className="flex gap-3 rounded-md border border-border/25 bg-muted/[0.04] px-3.5 py-2.5 text-sm leading-relaxed text-foreground/85 hover:bg-muted/[0.08] transition-colors"
              >
                <span className="mt-px shrink-0 text-muted-foreground/30">
                  &#x203A;
                </span>
                <p className="min-w-0 flex-1">{move}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hasChannelPlan ? (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Channel plan
          </p>
          <div className="space-y-1.5">
            {strategy.channelPlan.map((channel) => (
              <div
                key={channel}
                className="flex gap-3 rounded-md border border-border/25 bg-muted/[0.04] px-3.5 py-2.5 text-sm leading-relaxed text-foreground/85 hover:bg-muted/[0.08] transition-colors"
              >
                <span className="mt-px shrink-0 text-muted-foreground/30">
                  &#x203A;
                </span>
                <p className="min-w-0 flex-1">{channel}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
