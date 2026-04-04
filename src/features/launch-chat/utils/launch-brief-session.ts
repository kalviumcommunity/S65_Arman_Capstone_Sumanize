import { startupBriefStorageKey } from "@/features/startup-brief/utils/startup-brief-storage";
import type { StartupBrief } from "@/types/launch";

function isStartupBrief(value: unknown): value is StartupBrief {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return [
    "companyName",
    "productName",
    "productDescription",
    "targetAudience",
    "category",
    "launchGoal",
    "fundingStage",
    "desiredOutcome",
  ].every((key) => typeof candidate[key] === "string");
}

export function readLaunchBriefSession() {
  const raw = window.sessionStorage.getItem(startupBriefStorageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isStartupBrief(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
