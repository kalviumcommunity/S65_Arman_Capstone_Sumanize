import { cn } from "@/lib/utils";

type StatusIndicatorState = "live" | "complete" | "idle";

export function StatusIndicator({
  state,
  className,
}: {
  state: StatusIndicatorState;
  className?: string;
}) {
  if (state === "live") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground",
          className,
        )}
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        Live
      </div>
    );
  }

  if (state === "complete") {
    return (
      <span
        className={cn(
          "text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60",
          className,
        )}
      >
        Complete
      </span>
    );
  }

  return null;
}
