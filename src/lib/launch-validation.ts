import type { StartupBrief } from "@/types/launch";

function normalizeField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function sanitizeStartupBrief(input: unknown): StartupBrief {
  const candidate = (input ?? {}) as Record<string, unknown>;

  return {
    companyName: normalizeField(candidate.companyName),
    productName: normalizeField(candidate.productName),
    productDescription: normalizeField(candidate.productDescription),
    targetAudience: normalizeField(candidate.targetAudience),
    category: normalizeField(candidate.category),
    launchGoal: normalizeField(candidate.launchGoal),
    fundingStage: normalizeField(candidate.fundingStage),
    desiredOutcome: normalizeField(candidate.desiredOutcome),
  };
}

export function validateStartupBrief(input: unknown) {
  const brief = sanitizeStartupBrief(input);
  const fieldLabels: Record<keyof StartupBrief, string> = {
    category: "Category",
    companyName: "Company name",
    desiredOutcome: "Desired outcome",
    fundingStage: "Funding stage",
    launchGoal: "Launch goal",
    productDescription: "Product description",
    productName: "Product name",
    targetAudience: "Target audience",
  };

  const missing = (
    Object.keys(fieldLabels) as Array<keyof StartupBrief>
  ).filter((key) => brief[key].length === 0);

  if (missing.length > 0) {
    return {
      brief,
      error: `Please complete: ${missing.map((key) => fieldLabels[key]).join(", ")}.`,
      ok: false as const,
    };
  }

  if (brief.productDescription.length < 20) {
    return {
      brief,
      error:
        "Product description needs a bit more detail before research can start.",
      ok: false as const,
    };
  }

  return {
    brief,
    ok: true as const,
  };
}
