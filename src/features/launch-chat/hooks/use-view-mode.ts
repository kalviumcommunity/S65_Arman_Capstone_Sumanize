"use client";

import { useCallback, useEffect, useState } from "react";

export type ViewMode = "unified" | "split";

const STORAGE_KEY = "launch-chat:view-mode";
const SPLIT_MIN_WIDTH = 1024;

function readStored(): ViewMode {
  if (typeof window === "undefined") return "unified";
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === "split" ? "split" : "unified";
}

export function useViewMode() {
  const [mode, setModeRaw] = useState<ViewMode>("unified");
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    setModeRaw(readStored());

    const mql = window.matchMedia(`(min-width: ${SPLIT_MIN_WIDTH}px)`);
    setIsWide(mql.matches);

    function onChange(e: MediaQueryListEvent) {
      setIsWide(e.matches);
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const setMode = useCallback((next: ViewMode) => {
    setModeRaw(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const effectiveMode: ViewMode =
    mode === "split" && isWide ? "split" : "unified";

  return { mode, effectiveMode, setMode, isWide } as const;
}
