"use client";

export function NextMovesTimeline({ moves }: { moves: string[] }) {
  if (moves.length === 0) return null;

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both px-6 py-6"
      style={{ animationDelay: "360ms", animationDuration: "500ms" }}
    >
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        Next moves
      </p>
      <div className="space-y-2">
        {moves.map((move, i) => (
          <div
            key={move}
            className="flex gap-3 rounded-md border border-border/25 bg-muted/[0.04] px-3.5 py-3 text-sm leading-relaxed text-foreground/85 hover:bg-muted/[0.08] transition-colors"
          >
            <span className="shrink-0 tabular-nums text-muted-foreground/40 font-semibold text-xs mt-px">
              {i + 1}.
            </span>
            <p className="min-w-0 flex-1">{move}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
