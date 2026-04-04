"use client";

import { ClipboardText } from "@phosphor-icons/react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ContentStrategyPanel } from "@/features/launch-chat/components/package-view/content-strategy-panel";
import { FundraisingAnglesGrid } from "@/features/launch-chat/components/package-view/fundraising-angles-grid";
import { HookOptionsGrid } from "@/features/launch-chat/components/package-view/hook-options-grid";
import { LaunchScriptPanel } from "@/features/launch-chat/components/package-view/launch-script-panel";
import { NextMovesTimeline } from "@/features/launch-chat/components/package-view/next-moves-timeline";
import { PackageHero } from "@/features/launch-chat/components/package-view/package-hero";
import { PackageSignalsTiles } from "@/features/launch-chat/components/package-view/package-signals-tiles";
import type { LaunchPackage } from "@/types/launch";

export function LaunchPackageStructuredView({
  pkg,
  markdown,
}: {
  pkg: LaunchPackage;
  markdown: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card className="gap-0 overflow-hidden p-0 ring-1 ring-foreground/8">
      <div className="flex justify-end border-b border-border/30 px-4 py-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground/55 transition-colors hover:bg-muted/20 hover:text-foreground/70"
        >
          <ClipboardText size={13} weight="bold" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="divide-y divide-border/30">
        <PackageHero angle={pkg.strategicAngle} />
        <LaunchScriptPanel script={pkg.launchScript} />
        <HookOptionsGrid hooks={pkg.hookOptions} />
        <PackageSignalsTiles signals={pkg.researchSignals} />
        <ContentStrategyPanel strategy={pkg.contentStrategy} />
        <FundraisingAnglesGrid angles={pkg.fundraisingAngles} />
        <NextMovesTimeline moves={pkg.nextMoves} />
      </div>
    </Card>
  );
}
