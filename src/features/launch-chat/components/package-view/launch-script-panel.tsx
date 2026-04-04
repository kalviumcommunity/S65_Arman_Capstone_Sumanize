"use client";

import type { LaunchPackage } from "@/types/launch";

export function LaunchScriptPanel({
  script,
}: {
  script: LaunchPackage["launchScript"];
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-5 px-6 py-6"
      style={{ animationDelay: "60ms", animationDuration: "500ms" }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        Launch script
      </p>

      {script.headline ? (
        <div className="rounded-lg border border-border/30 bg-muted/[0.05] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-2">
            Headline
          </p>
          <p className="text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
            {script.headline}
          </p>
        </div>
      ) : null}

      {script.hook ? (
        <div className="border-l-2 border-foreground/20 pl-5 py-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-2">
            Opening hook
          </p>
          <p className="text-sm leading-7 text-foreground/85 italic">
            &ldquo;{script.hook}&rdquo;
          </p>
        </div>
      ) : null}

      {script.bodyBeats.length > 0 ? (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Body beats
          </p>
          <div className="space-y-2">
            {script.bodyBeats.map((beat, i) => (
              <div
                key={beat}
                className="flex gap-3 rounded-md border border-border/25 bg-muted/[0.04] px-3.5 py-3 text-sm leading-relaxed text-foreground/85"
              >
                <span className="shrink-0 tabular-nums text-muted-foreground/40 font-semibold text-xs mt-px">
                  {i + 1}.
                </span>
                <p className="min-w-0 flex-1">{beat}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {script.ctaOptions.length > 0 ? (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Call to action
          </p>
          <div className="flex flex-wrap gap-2">
            {script.ctaOptions.map((cta) => (
              <div
                key={cta}
                className="rounded-md border border-border/30 bg-muted/[0.05] px-3.5 py-2 text-sm leading-snug text-foreground/85 hover:bg-muted/[0.09] transition-colors"
              >
                {cta}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
