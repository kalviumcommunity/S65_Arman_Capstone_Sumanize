"use client";

import {
  ArrowUUpLeftIcon,
  CheckIcon,
  Columns,
  Rows,
  StopCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ViewMode } from "@/features/launch-chat/hooks/use-view-mode";
import { cn } from "@/lib/utils";

function ViewModePopover({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (next: ViewMode) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        {mode === "split" ? (
          <Columns size={16} weight="fill" aria-hidden />
        ) : (
          <Rows size={16} weight="fill" aria-hidden />
        )}
        View
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1">
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Layout
        </div>
        <div className="space-y-1">
          <PopoverClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-between",
                  mode === "unified" && "bg-muted text-foreground",
                )}
              />
            }
            onClick={() => onChange("unified")}
          >
            <span className="flex items-center gap-1.5">
              <Rows
                size={14}
                weight={mode === "unified" ? "fill" : "regular"}
              />
              Unified
            </span>
            <span className="text-primary">
              {mode === "unified" ? (
                <CheckIcon size={14} weight="bold" />
              ) : null}
            </span>
          </PopoverClose>
          <PopoverClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-between",
                  mode === "split" && "bg-muted text-foreground",
                )}
              />
            }
            onClick={() => onChange("split")}
          >
            <span className="flex items-center gap-1.5">
              <Columns
                size={14}
                weight={mode === "split" ? "fill" : "regular"}
              />
              Split
            </span>
            <span className="text-primary">
              {mode === "split" ? <CheckIcon size={14} weight="bold" /> : null}
            </span>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function LaunchChatHeaderActions({
  runStatus,
  viewMode,
  onViewModeChange,
  onRerun,
  onStop,
}: {
  runStatus: string;
  viewMode: ViewMode;
  onViewModeChange: (next: ViewMode) => void;
  onRerun: () => void;
  onStop: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ViewModePopover mode={viewMode} onChange={onViewModeChange} />
      {runStatus === "generating" ? (
        <Button
          variant="destructive"
          size="sm"
          className="gap-1.5"
          onClick={onStop}
        >
          <StopCircle size={16} weight="bold" aria-hidden />
          Stop
        </Button>
      ) : null}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onRerun}>
        <ArrowUUpLeftIcon size={16} weight="bold" aria-hidden />
        Restart
      </Button>
    </div>
  );
}
