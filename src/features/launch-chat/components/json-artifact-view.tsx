"use client";

import { cn } from "@/lib/utils";

function stableItemKey(item: unknown, index: number): string {
  try {
    const s = JSON.stringify(item);
    if (s.length > 0 && s.length < 240) return s;
  } catch {
    /* non-serializable */
  }
  return `idx-${index}`;
}

function JsonValue({ value, depth }: { value: unknown; depth: number }) {
  if (value === null) {
    return (
      <span className="font-mono text-xs text-muted-foreground/80">null</span>
    );
  }

  if (value === undefined) {
    return (
      <span className="font-mono text-xs text-muted-foreground/60">
        undefined
      </span>
    );
  }

  if (typeof value === "string") {
    return (
      <span className="break-words font-mono text-sm leading-relaxed text-foreground/90">
        <span className="text-muted-foreground/45">&quot;</span>
        {value}
        <span className="text-muted-foreground/45">&quot;</span>
      </span>
    );
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return (
      <span className="font-mono text-sm tabular-nums text-accent">
        {String(value)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="font-mono text-xs text-muted-foreground/70">[]</span>
      );
    }
    return (
      <ul
        className={cn(
          "my-1.5 list-none space-y-2.5 border-l border-border/45 pl-3",
          depth > 0 && "ml-0.5",
        )}
      >
        {value.map((item, index) => (
          <li key={stableItemKey(item, index)} className="flex gap-2.5 text-sm">
            <span className="w-5 shrink-0 pt-0.5 text-right font-mono text-[10px] leading-normal text-muted-foreground/45 tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <JsonValue value={item} depth={depth + 1} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return (
        <span className="font-mono text-xs text-muted-foreground/70">
          {"{}"}
        </span>
      );
    }
    return (
      <dl
        className={cn(
          "my-1.5 space-y-3 border-l border-border/40 pl-3",
          depth > 0 && "ml-0.5",
        )}
      >
        {entries.map(([key, val]) => (
          <div key={key} className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/75">
              {key}
            </dt>
            <dd className="mt-1 min-w-0 border-t border-border/20 pt-1.5">
              <JsonValue value={val} depth={depth + 1} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <span className="font-mono text-sm text-foreground/80">
      {String(value)}
    </span>
  );
}

export function JsonArtifactView({ data }: { data: unknown }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted-20 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <JsonValue value={data} depth={0} />
    </div>
  );
}
