"use client";

function splitAtFirstClause(text: string): [string, string] {
  const idx = text.search(/[—–:]/);
  if (idx > 0 && idx < 80) {
    const separator = text[idx];
    return [
      text.slice(0, idx + (separator === ":" ? 1 : 0)).trim(),
      text.slice(idx + 1).trim(),
    ];
  }
  return ["", text];
}

export function PackageSignalsTiles({ signals }: { signals: string[] }) {
  if (signals.length === 0) return null;

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both px-6 py-6"
      style={{ animationDelay: "180ms", animationDuration: "500ms" }}
    >
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        Research signals
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {signals.map((signal) => {
          const [lead, rest] = splitAtFirstClause(signal);
          return (
            <div
              key={signal}
              className="rounded-md border border-border/30 bg-muted/[0.04] px-3.5 py-3 transition-colors hover:bg-muted/[0.08]"
            >
              <p className="text-sm leading-relaxed text-foreground/80">
                {lead ? (
                  <span className="font-medium text-foreground/90">
                    {lead}{" "}
                  </span>
                ) : null}
                {rest}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
