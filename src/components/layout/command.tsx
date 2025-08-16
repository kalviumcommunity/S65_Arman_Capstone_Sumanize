"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { getHistory, HistoryItem } from "@/lib/history";

export default function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<HistoryItem[]>([]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const load = React.useCallback(() => setItems(getHistory()), []);

  React.useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener(
      "sumanize:history-updated",
      handler as EventListener,
    );
    return () =>
      window.removeEventListener(
        "sumanize:history-updated",
        handler as EventListener,
      );
  }, [load]);

  const handleClose = () => setOpen(false);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search recent summaries..." />
      <CommandList>
        <CommandEmpty>No recent summaries.</CommandEmpty>
        <CommandGroup heading="Recent">
          {items.map((it) => (
            <CommandItem
              key={it.id}
              value={`${it.title} ${new Date(it.createdAt).toLocaleString()}`}
              onSelect={handleClose}
              className="cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-teal-950">
                  {it.title}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
