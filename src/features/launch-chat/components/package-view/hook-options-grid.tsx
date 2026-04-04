"use client";

export function HookOptionsGrid({ hooks }: { hooks: string[] }) {
  if (hooks.length === 0) return null;

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both px-6 py-6"
      style={{ animationDelay: "120ms", animationDuration: "500ms" }}
    >
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        Hook options
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {hooks.map((hook, i) => (
          <div
            key={hook}
            className="rounded-lg border border-border/30 bg-muted/[0.04] px-4 py-4 transition-colors hover:bg-muted/[0.08]"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              Hook {i + 1}
            </p>
            <p className="text-sm leading-relaxed text-foreground/85">{hook}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
