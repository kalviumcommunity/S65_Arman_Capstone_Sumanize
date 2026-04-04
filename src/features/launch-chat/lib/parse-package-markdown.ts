import type { LaunchPackage } from "@/types/launch";

function extractSections(markdown: string): Map<string, string> {
  const sections = new Map<string, string>();
  const pattern = /^## (.+)$/gm;
  const matches: Array<{ name: string; index: number; length: number }> = [];

  for (let m = pattern.exec(markdown); m !== null; m = pattern.exec(markdown)) {
    matches.push({ name: m[1].trim(), index: m.index, length: m[0].length });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i].length;
    const end = i < matches.length - 1 ? matches[i + 1].index : markdown.length;
    const raw = markdown.slice(start, end);
    const content = raw.replace(/^\s*---\s*$/gm, "").trim();
    sections.set(matches[i].name, content);
  }

  return sections;
}

function extractBullets(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => /^\s*[-*]\s/.test(line))
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter(Boolean);
}

function extractNumberedItems(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => /^\s*\d+\.\s/.test(line))
    .map((line) => line.replace(/^\s*\d+\.\s+/, "").trim())
    .filter(Boolean);
}

function extractLabeledField(text: string, label: string): string {
  const pattern = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`, "i");
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

function extractSubsectionContent(text: string, header: string): string {
  const pattern = new RegExp(`### ${header}\\s*\\n([\\s\\S]*?)(?=### |$)`, "i");
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

function extractHooks(text: string): string[] {
  const hooks: string[] = [];
  const pattern = /### Hook \d+\s*\n([\s\S]*?)(?=### Hook \d+|$)/gi;

  for (let m = pattern.exec(text); m !== null; m = pattern.exec(text)) {
    const hookText = m[1].replace(/^---\s*$/gm, "").trim();
    if (hookText) hooks.push(hookText);
  }
  return hooks;
}

function extractBodyBeats(scriptSection: string): string[] {
  const parts = scriptSection.split(/---/);
  const afterHook = parts[1] || "";
  const beforeCta = afterHook.split(/\*\*CTA Options:\*\*/)[0] || "";
  return extractBullets(beforeCta);
}

function extractCtaOptions(scriptSection: string): string[] {
  const afterCta = scriptSection.split(/\*\*CTA Options:\*\*/)[1] || "";
  return extractBullets(afterCta);
}

export function parsePackageFromMarkdown(
  markdown: string,
): LaunchPackage | null {
  try {
    const sections = extractSections(markdown);
    const strategicAngle = sections.get("Strategic Angle");
    if (!strategicAngle) return null;

    const scriptSection = sections.get("Launch Script") ?? "";
    const hookSection = sections.get("Hook Options") ?? "";
    const signalsSection = sections.get("Research Signals") ?? "";
    const strategySection = sections.get("Content Strategy") ?? "";
    const fundraisingSection = sections.get("Fundraising Angles") ?? "";
    const nextMovesSection = sections.get("Next Moves") ?? "";

    return {
      strategicAngle,
      researchSignals: extractBullets(signalsSection),
      hookOptions: extractHooks(hookSection),
      launchScript: {
        headline: extractLabeledField(scriptSection, "Headline"),
        hook: extractLabeledField(scriptSection, "Hook"),
        bodyBeats: extractBodyBeats(scriptSection),
        ctaOptions: extractCtaOptions(scriptSection),
      },
      contentStrategy: {
        positioning: extractLabeledField(strategySection, "Positioning"),
        campaignMoves: extractBullets(
          extractSubsectionContent(strategySection, "Campaign Moves"),
        ),
        channelPlan: extractBullets(
          extractSubsectionContent(strategySection, "Channel Plan"),
        ),
      },
      fundraisingAngles: extractBullets(fundraisingSection),
      nextMoves: extractNumberedItems(nextMovesSection),
    };
  } catch {
    return null;
  }
}
