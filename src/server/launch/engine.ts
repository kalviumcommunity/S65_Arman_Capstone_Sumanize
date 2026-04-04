import { generateText, streamText } from "ai";
import {
  buildDraftPackagePrompt,
  buildHookCandidatesPrompt,
  buildHookSelectionPrompt,
  buildMarkdownSynthesisPrompt,
  buildQaCheckPrompt,
  buildRefinementAnswerPrompt,
  buildRefinePackagePrompt,
  buildSynthesisNotesPrompt,
} from "@/server/launch/prompts";
import { getProviders } from "@/server/launch/providers";
import {
  buildResearchPlan,
  curateEvidenceBundle,
  getExaClient,
  researchSource,
  runPlannedSourceResearch,
  sourceConfigs,
} from "@/server/launch/research";
import type {
  CuratedEvidenceBundle,
  HookCandidate,
  HookSelectionResult,
  LaunchPackage,
  LaunchPackageResponse,
  PlannedResearchSource,
  QaReport,
  ResearchBucket,
  StartupBrief,
  SynthesisNotes,
} from "@/types/launch";

function stripCodeFences(input: string) {
  return input
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseJsonObject<T>(input: string): T {
  const cleaned = stripCodeFences(input);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }

    throw new Error("Model did not return valid JSON.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `Structured response validation failed: ${path} must be a non-empty string.`,
    );
  }

  return value;
}

function assertNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(
      `Structured response validation failed: ${path} must be a number.`,
    );
  }

  return value;
}

function assertBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(
      `Structured response validation failed: ${path} must be a boolean.`,
    );
  }

  return value;
}

function assertStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `Structured response validation failed: ${path} must be an array of strings.`,
    );
  }

  return value.map((entry, index) => assertString(entry, `${path}[${index}]`));
}

function validateHookCandidate(value: unknown, path: string): HookCandidate {
  if (!isRecord(value)) {
    throw new Error(
      `Structured response validation failed: ${path} must be an object.`,
    );
  }

  return {
    archetype:
      value.archetype === undefined
        ? undefined
        : assertString(value.archetype, `${path}.archetype`),
    copy: assertString(value.copy, `${path}.copy`),
    label: assertString(value.label, `${path}.label`),
    rationale: assertString(value.rationale, `${path}.rationale`),
    score:
      value.score === undefined
        ? undefined
        : assertNumber(value.score, `${path}.score`),
    scoreReason:
      value.scoreReason === undefined
        ? undefined
        : assertString(value.scoreReason, `${path}.scoreReason`),
  };
}

function validateSynthesisNotes(value: unknown): SynthesisNotes {
  if (!isRecord(value)) {
    throw new Error(
      "Structured response validation failed: synthesis notes must be an object.",
    );
  }

  return {
    audienceSignals: assertStringArray(
      value.audienceSignals,
      "synthesisNotes.audienceSignals",
    ),
    evidenceMap: assertStringArray(
      value.evidenceMap,
      "synthesisNotes.evidenceMap",
    ),
    strongestAngle: assertString(
      value.strongestAngle,
      "synthesisNotes.strongestAngle",
    ),
    strategicTensions: assertStringArray(
      value.strategicTensions,
      "synthesisNotes.strategicTensions",
    ),
  };
}

function validateHookSelectionResult(value: unknown): HookSelectionResult {
  if (!isRecord(value)) {
    throw new Error(
      "Structured response validation failed: hook selection must be an object.",
    );
  }

  if (!Array.isArray(value.selectedHooks) || value.selectedHooks.length !== 4) {
    throw new Error(
      "Structured response validation failed: selectedHooks must contain exactly 4 hooks.",
    );
  }

  if (!Array.isArray(value.rejectedHooks)) {
    throw new Error(
      "Structured response validation failed: rejectedHooks must be an array.",
    );
  }

  return {
    rejectedHooks: value.rejectedHooks.map((entry, index) => {
      if (!isRecord(entry)) {
        throw new Error(
          `Structured response validation failed: rejectedHooks[${index}] must be an object.`,
        );
      }

      return {
        label: assertString(entry.label, `rejectedHooks[${index}].label`),
        reason: assertString(entry.reason, `rejectedHooks[${index}].reason`),
      };
    }),
    selectedHooks: value.selectedHooks.map((entry, index) =>
      validateHookCandidate(entry, `selectedHooks[${index}]`),
    ),
    winningHook: validateHookCandidate(value.winningHook, "winningHook"),
  };
}

export function validateLaunchPackage(value: unknown): LaunchPackage {
  if (!isRecord(value)) {
    throw new Error(
      "Structured response validation failed: launch package must be an object.",
    );
  }

  const launchScript = value.launchScript;
  if (!isRecord(launchScript)) {
    throw new Error(
      "Structured response validation failed: launchScript must be an object.",
    );
  }

  const contentStrategy = value.contentStrategy;
  if (!isRecord(contentStrategy)) {
    throw new Error(
      "Structured response validation failed: contentStrategy must be an object.",
    );
  }

  const pkg = {
    strategicAngle: assertString(
      value.strategicAngle,
      "launchPackage.strategicAngle",
    ),
    researchSignals: assertStringArray(
      value.researchSignals,
      "launchPackage.researchSignals",
    ),
    hookOptions: assertStringArray(
      value.hookOptions,
      "launchPackage.hookOptions",
    ),
    launchScript: {
      headline: assertString(
        launchScript.headline,
        "launchPackage.launchScript.headline",
      ),
      hook: assertString(launchScript.hook, "launchPackage.launchScript.hook"),
      bodyBeats: assertStringArray(
        launchScript.bodyBeats,
        "launchPackage.launchScript.bodyBeats",
      ),
      ctaOptions: assertStringArray(
        launchScript.ctaOptions,
        "launchPackage.launchScript.ctaOptions",
      ),
    },
    contentStrategy: {
      positioning: assertString(
        contentStrategy.positioning,
        "launchPackage.contentStrategy.positioning",
      ),
      campaignMoves: assertStringArray(
        contentStrategy.campaignMoves,
        "launchPackage.contentStrategy.campaignMoves",
      ),
      channelPlan: assertStringArray(
        contentStrategy.channelPlan,
        "launchPackage.contentStrategy.channelPlan",
      ),
    },
    fundraisingAngles: assertStringArray(
      value.fundraisingAngles,
      "launchPackage.fundraisingAngles",
    ),
    nextMoves: assertStringArray(value.nextMoves, "launchPackage.nextMoves"),
  } satisfies LaunchPackage;

  if (pkg.hookOptions.length !== 4) {
    throw new Error(
      "Structured response validation failed: launchPackage.hookOptions must contain exactly 4 strings.",
    );
  }

  if (pkg.launchScript.ctaOptions.length !== 2) {
    throw new Error(
      "Structured response validation failed: launchPackage.launchScript.ctaOptions must contain exactly 2 strings.",
    );
  }

  return pkg;
}

function validateQaReport(value: unknown): QaReport {
  if (!isRecord(value)) {
    throw new Error(
      "Structured response validation failed: qa report must be an object.",
    );
  }

  const scores = value.scores;
  const scriptBreakdown = value.scriptBreakdown;
  if (!isRecord(scores) || !isRecord(scriptBreakdown)) {
    throw new Error(
      "Structured response validation failed: qa report scores and scriptBreakdown must be objects.",
    );
  }

  if (!Array.isArray(value.hookBreakdown)) {
    throw new Error(
      "Structured response validation failed: qa report hookBreakdown must be an array.",
    );
  }

  return {
    pass: assertBoolean(value.pass, "qaReport.pass"),
    verdict: assertString(value.verdict, "qaReport.verdict"),
    scores: {
      actionability: assertNumber(
        scores.actionability,
        "qaReport.scores.actionability",
      ),
      evidenceGrounding: assertNumber(
        scores.evidenceGrounding,
        "qaReport.scores.evidenceGrounding",
      ),
      fundraising: assertNumber(
        scores.fundraising,
        "qaReport.scores.fundraising",
      ),
      hooks: assertNumber(scores.hooks, "qaReport.scores.hooks"),
      script: assertNumber(scores.script, "qaReport.scores.script"),
      strategicAngle: assertNumber(
        scores.strategicAngle,
        "qaReport.scores.strategicAngle",
      ),
    },
    scriptBreakdown: {
      bodyBeats: assertNumber(
        scriptBreakdown.bodyBeats,
        "qaReport.scriptBreakdown.bodyBeats",
      ),
      cta: assertNumber(scriptBreakdown.cta, "qaReport.scriptBreakdown.cta"),
      headline: assertNumber(
        scriptBreakdown.headline,
        "qaReport.scriptBreakdown.headline",
      ),
      openingHook: assertNumber(
        scriptBreakdown.openingHook,
        "qaReport.scriptBreakdown.openingHook",
      ),
      spokenDelivery: assertNumber(
        scriptBreakdown.spokenDelivery,
        "qaReport.scriptBreakdown.spokenDelivery",
      ),
    },
    hookBreakdown: value.hookBreakdown.map((entry, index) => {
      if (!isRecord(entry)) {
        throw new Error(
          `Structured response validation failed: qaReport.hookBreakdown[${index}] must be an object.`,
        );
      }

      return {
        issue: assertString(
          entry.issue,
          `qaReport.hookBreakdown[${index}].issue`,
        ),
        label: assertString(
          entry.label,
          `qaReport.hookBreakdown[${index}].label`,
        ),
        score: assertNumber(
          entry.score,
          `qaReport.hookBreakdown[${index}].score`,
        ),
      };
    }),
    priorityFixes: assertStringArray(
      value.priorityFixes,
      "qaReport.priorityFixes",
    ),
    rewriteInstructions: assertStringArray(
      value.rewriteInstructions,
      "qaReport.rewriteInstructions",
    ),
    weaknesses: assertStringArray(value.weaknesses, "qaReport.weaknesses"),
  };
}

async function generateTextWithFallback(args: {
  prompt: string;
  temperature: number;
  throwIfStopped?: () => void | Promise<void>;
}) {
  const providers = getProviders();
  const failures: string[] = [];

  for (const provider of providers) {
    try {
      await args.throwIfStopped?.();
      const result = await generateText({
        model: provider.model,
        temperature: args.temperature,
        prompt: args.prompt,
      });

      return result.text.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      failures.push(`${provider.label}: ${message}`);
    }
  }

  throw new Error(`All text model providers failed. ${failures.join(" | ")}`);
}

export async function generateDraftPackage(
  brief: StartupBrief,
  research: ResearchBucket[],
  stageContext?: {
    hookCandidates?: HookCandidate[];
    synthesisNotes?: SynthesisNotes;
    winningHook?: HookCandidate;
  },
  throwIfStopped?: () => void | Promise<void>,
) {
  const text = await generateTextWithFallback({
    prompt: buildDraftPackagePrompt(brief, research, stageContext),
    temperature: 0.4,
    throwIfStopped,
  });

  return validateLaunchPackage(parseJsonObject<unknown>(text));
}

export async function refinePackageWithWeaponsCheck(
  brief: StartupBrief,
  research: ResearchBucket[],
  draft: LaunchPackage,
  qaReport: QaReport,
  throwIfStopped?: () => void | Promise<void>,
) {
  const text = await generateTextWithFallback({
    prompt: buildRefinePackagePrompt(brief, research, draft, qaReport),
    temperature: 0.35,
    throwIfStopped,
  });

  return validateLaunchPackage(parseJsonObject<unknown>(text));
}

export async function generateSynthesisNotes(
  brief: StartupBrief,
  research: ResearchBucket[],
  throwIfStopped?: () => void | Promise<void>,
) {
  const text = await generateTextWithFallback({
    prompt: buildSynthesisNotesPrompt(brief, research),
    temperature: 0.3,
    throwIfStopped,
  });

  return validateSynthesisNotes(parseJsonObject<unknown>(text));
}

export async function generateHookCandidates(
  brief: StartupBrief,
  research: ResearchBucket[],
  synthesisNotes: SynthesisNotes,
  throwIfStopped?: () => void | Promise<void>,
) {
  const text = await generateTextWithFallback({
    prompt: buildHookCandidatesPrompt(brief, research, synthesisNotes),
    temperature: 0.55,
    throwIfStopped,
  });

  const parsed = parseJsonObject<unknown>(text);
  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.hooks) ||
    parsed.hooks.length !== 8
  ) {
    throw new Error(
      "Structured response validation failed: hooks must contain exactly 8 hook objects.",
    );
  }

  return parsed.hooks.map((entry, index) =>
    validateHookCandidate(entry, `hooks[${index}]`),
  );
}

export async function selectHookCandidates(
  brief: StartupBrief,
  research: ResearchBucket[],
  synthesisNotes: SynthesisNotes,
  hookCandidates: HookCandidate[],
  throwIfStopped?: () => void | Promise<void>,
) {
  const text = await generateTextWithFallback({
    prompt: buildHookSelectionPrompt({
      brief,
      research,
      synthesisNotes,
      hookCandidates,
    }),
    temperature: 0.25,
    throwIfStopped,
  });

  return validateHookSelectionResult(parseJsonObject<unknown>(text));
}

export async function qaCheckPackage(
  brief: StartupBrief,
  research: ResearchBucket[],
  draft: LaunchPackage,
  throwIfStopped?: () => void | Promise<void>,
) {
  const text = await generateTextWithFallback({
    prompt: buildQaCheckPrompt(brief, research, draft),
    temperature: 0.2,
    throwIfStopped,
  });

  return validateQaReport(parseJsonObject<unknown>(text));
}

export function streamTextWithFallback(args: {
  prompt: string;
  temperature: number;
}) {
  const providers = getProviders();
  const provider = providers[0];

  return streamText({
    model: provider.model,
    temperature: args.temperature,
    prompt: args.prompt,
  });
}

export {
  buildMarkdownSynthesisPrompt,
  buildResearchPlan,
  curateEvidenceBundle,
  getExaClient,
  researchSource,
  runPlannedSourceResearch,
  sourceConfigs,
};

export function formatLaunchPackageMarkdown(pkg: LaunchPackage) {
  const validatedPackage = validateLaunchPackage(pkg);
  const hooks = pkg.hookOptions.length
    ? validatedPackage.hookOptions
        .map((hook: string, index: number) => `### Hook ${index + 1}\n${hook}`)
        .join("\n\n")
    : "No hooks generated.";
  const bodyBeats = validatedPackage.launchScript.bodyBeats
    .map((beat: string) => `- ${beat}`)
    .join("\n");
  const ctas = validatedPackage.launchScript.ctaOptions
    .map((cta: string) => `- ${cta}`)
    .join("\n");
  const campaignMoves = validatedPackage.contentStrategy.campaignMoves
    .map((move: string) => `- ${move}`)
    .join("\n");
  const channels = validatedPackage.contentStrategy.channelPlan
    .map((channel: string) => `- ${channel}`)
    .join("\n");
  const fundraising = validatedPackage.fundraisingAngles
    .map((angle: string) => `- ${angle}`)
    .join("\n");
  const nextMoves = validatedPackage.nextMoves
    .map((move: string, index: number) => `${index + 1}. ${move}`)
    .join("\n");

  return `## Strategic Angle
${validatedPackage.strategicAngle}

---

## Launch Script
**Headline:** ${validatedPackage.launchScript.headline}

**Hook:** ${validatedPackage.launchScript.hook}

---

${bodyBeats}

**CTA Options:**
${ctas}

---

## Hook Options
${hooks}

---

## Research Signals
${validatedPackage.researchSignals.map((signal) => `- ${signal}`).join("\n")}

---

## Content Strategy
**Positioning:** ${validatedPackage.contentStrategy.positioning}

### Campaign Moves
${campaignMoves}

### Channel Plan
${channels}

---

## Fundraising Angles
${fundraising}

---

## Next Moves
${nextMoves}`;
}

export async function collectCuratedResearch(brief: StartupBrief): Promise<{
  curatedResearch: ResearchBucket[];
  evidenceBundle: CuratedEvidenceBundle;
  plannedSources: PlannedResearchSource[];
}> {
  const exa = getExaClient();
  const plannedSources = buildResearchPlan(brief);
  const retrievalRuns = await Promise.all(
    plannedSources.map((plannedSource: PlannedResearchSource) => {
      const config = sourceConfigs.find(
        (entry: (typeof sourceConfigs)[number]) =>
          entry.source === plannedSource.source,
      );

      if (!config) {
        throw new Error(`Missing source config for ${plannedSource.source}.`);
      }

      return runPlannedSourceResearch(
        exa,
        plannedSource,
        config.includeDomains,
      );
    }),
  );
  const evidenceBundle = curateEvidenceBundle({
    plannedSources,
    retrievalRuns,
  });

  return {
    curatedResearch: evidenceBundle.curatedResearch,
    evidenceBundle,
    plannedSources,
  };
}

export async function buildLaunchPackage(
  brief: StartupBrief,
): Promise<LaunchPackageResponse> {
  const { curatedResearch: research } = await collectCuratedResearch(brief);

  const synthesisNotes = await generateSynthesisNotes(brief, research);
  const generatedHookCandidates = await generateHookCandidates(
    brief,
    research,
    synthesisNotes,
  );
  const hookSelection = await selectHookCandidates(
    brief,
    research,
    synthesisNotes,
    generatedHookCandidates,
  );
  const draft = await generateDraftPackage(brief, research, {
    hookCandidates: hookSelection.selectedHooks,
    synthesisNotes,
    winningHook: hookSelection.winningHook,
  });
  const refinedPackage = await refinePackageWithWeaponsCheck(
    brief,
    research,
    draft,
    await qaCheckPackage(brief, research, draft),
  );

  return {
    brief,
    research,
    package: refinedPackage,
  };
}

export async function refineLaunchPackage(args: {
  brief: StartupBrief;
  research: ResearchBucket[];
  launchPackage: LaunchPackage;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  question: string;
}) {
  return generateTextWithFallback({
    prompt: buildRefinementAnswerPrompt(args),
    temperature: 0.45,
  });
}
