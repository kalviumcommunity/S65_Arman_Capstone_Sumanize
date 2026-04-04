import type { StartupBrief } from "@/types/launch";

export const startupBriefStorageKey = "make-me-rich:brief";

export function saveStartupBriefDraft(brief: StartupBrief) {
  window.sessionStorage.setItem(startupBriefStorageKey, JSON.stringify(brief));
}

export function readStartupBriefDraft() {
  const raw = window.sessionStorage.getItem(startupBriefStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StartupBrief;
  } catch {
    return null;
  }
}

export function clearStartupBriefDraft() {
  window.sessionStorage.removeItem(startupBriefStorageKey);
}
