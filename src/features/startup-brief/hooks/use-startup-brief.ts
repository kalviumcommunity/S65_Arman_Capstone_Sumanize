"use client";

import { useEffect, useState } from "react";
import { initialStartupBrief } from "@/features/startup-brief/constants/startup-brief.defaults";
import {
  clearStartupBriefDraft,
  readStartupBriefDraft,
  saveStartupBriefDraft,
} from "@/features/startup-brief/utils/startup-brief-storage";
import type { StartupBrief } from "@/types/launch";

export function useStartupBrief() {
  const [brief, setBrief] = useState<StartupBrief>(() => {
    if (typeof window === "undefined") {
      return initialStartupBrief;
    }

    return readStartupBriefDraft() ?? initialStartupBrief;
  });

  useEffect(() => {
    saveStartupBriefDraft(brief);
  }, [brief]);

  function updateField<K extends keyof StartupBrief>(
    key: K,
    value: StartupBrief[K],
  ) {
    setBrief((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setBrief(initialStartupBrief);
    clearStartupBriefDraft();
  }

  function submit() {
    saveStartupBriefDraft(brief);
    return brief;
  }

  return {
    brief,
    reset,
    submit,
    updateField,
  };
}
