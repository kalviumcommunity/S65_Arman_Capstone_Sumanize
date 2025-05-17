"use client";

import { useState, useEffect } from "react";
import * as Cmdk from "cmdk";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  MagnifyingGlass,
  Clipboard,
  File,
  YoutubeLogo,
  Eye,
  Translate,
} from "@phosphor-icons/react";

function VisuallyHidden({ children }) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </span>
  );
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSelect = (path) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      {/* <button 
        onClick={() => setOpen(true)}
        className="flex items-center px-3 py-2 text-sm rounded-md bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors"
      >
        <Search size={16} className="mr-2" />
        <span>Search</span>
        <kbd className="ml-auto inline-flex items-center gap-1 rounded border border-neutral-700 bg-neutral-900 px-1.5 font-mono text-xs text-neutral-400">
          ⌘K
        </kbd>
      </button> */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-4 max-w-lg w-full bg-neutral-800/30 backdrop-blur-lg border-none rounded-lg overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Command Palette</DialogTitle>
          </VisuallyHidden>
          <Cmdk.Command
            className="w-full"
            value={inputValue}
            onValueChange={setInputValue}
          >
            <div className="flex items-center border-b border-neutral-800 px-3">
              <MagnifyingGlass className="h-4 w-4 text-neutral-500 mr-2" />
              <Cmdk.CommandInput
                className="h-12 w-full bg-transparent text-neutral-500 placeholder:text-neutral-500 focus:outline-none text-sm"
                placeholder="Type a command or search…"
              />
            </div>

            <Cmdk.CommandList className="max-h-80 overflow-y-auto py-2">
              <Cmdk.CommandEmpty className="py-6 text-center text-sm text-neutral-500">
                No results found.
              </Cmdk.CommandEmpty>

              <Cmdk.CommandGroup className="pb-1">
                <Cmdk.CommandItem
                  className="mx-2 mb-2 px-3 py-2.5 rounded-md cursor-pointer flex items-center gap-4 text-neutral-300 aria-selected:bg-neutral-800/50 transition-colors hover:bg-neutral-800"
                  onSelect={() => onSelect("/summarize")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-800 text-amber-200">
                    <Clipboard weight="duotone" size={18} />
                  </div>
                  <div className="flex flex-row items-center justify-left w-full">
                    <span>Summarize Text</span>
                    <span className="text-xs text-neutral-500 ml-1">
                      {" "}
                      - Condense your pasted text content
                    </span>
                  </div>
                </Cmdk.CommandItem>

                <Cmdk.CommandItem
                  className="mx-2 mb-2 px-3 py-2.5 rounded-md cursor-pointer flex items-center gap-4 text-neutral-300 aria-selected:bg-neutral-800/50 transition-colors hover:bg-neutral-800"
                  onSelect={() => onSelect("/summarize/docs")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-800 text-indigo-200">
                    <File weight="duotone" size={18} />
                  </div>
                  <div className="flex flex-row items-center justify-left w-full">
                    <span>Summarize Document</span>
                    <span className="text-xs text-neutral-500 ml-1">
                      {" "}
                      - Extract from uploaded documents
                    </span>
                  </div>
                </Cmdk.CommandItem>

                <Cmdk.CommandItem
                  className="mx-2 mb-2 px-3 py-2.5 rounded-md cursor-pointer flex items-center gap-4 text-neutral-300 aria-selected:bg-neutral-800/50 transition-colors hover:bg-neutral-800"
                  onSelect={() => onSelect("/summarize/youtube")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-800 text-rose-300">
                    <YoutubeLogo weight="duotone" size={18} />
                  </div>
                  <div className="flex flex-row items-center justify-left w-full">
                    <span>Summarize Videos</span>
                    <span className="text-xs text-neutral-500 ml-1">
                      {" "}
                      - Get video content summaries
                    </span>
                  </div>
                </Cmdk.CommandItem>

                <Cmdk.CommandItem
                  className="mx-2 mb-2 px-3 py-2.5 rounded-md cursor-pointer flex items-center gap-4 text-neutral-300 aria-selected:bg-neutral-800/50 transition-colors hover:bg-neutral-800"
                  onSelect={() => onSelect("/humanize")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-800 text-emerald-200">
                    <Eye weight="duotone" size={18} />
                  </div>
                  <div className="flex flex-row items-center justify-left w-full">
                    <span>Humanize Text</span>
                    <span className="text-xs text-neutral-500 ml-1">
                      {" "}
                      - Make content sound more natural
                    </span>
                  </div>
                </Cmdk.CommandItem>

                <Cmdk.CommandItem
                  className="mx-2 px-3 py-2.5 rounded-md cursor-pointer flex items-center gap-4 text-neutral-300 aria-selected:bg-neutral-800/50 transition-colors hover:bg-neutral-800"
                  onSelect={() => onSelect("/translate")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-800 text-violet-200">
                    <Translate weight="duotone" size={18} />
                  </div>
                  <div className="flex flex-row items-center justify-left w-full">
                    <span>Translate Content</span>
                    <span className="text-xs text-neutral-500 ml-1">
                      {" "}
                      - Translate your content to any language
                    </span>
                  </div>
                </Cmdk.CommandItem>
              </Cmdk.CommandGroup>
            </Cmdk.CommandList>
          </Cmdk.Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
