/** User-facing labels for internal artifact type keys (non-technical wording). */
const ARTIFACT_DISPLAY_NAMES: Record<string, string> = {
  research_plan: "Research outline",
  evidence_bundle: "Findings",
  synthesis_notes: "Key insights",
  hook_candidates: "Hook ideas",
  launch_package_draft: "First draft",
  qa_report: "Quality review",
  rewrite_draft: "Revised draft",
  launch_package_final: "Launch package",
  launch_package_markdown: "Copy-ready text",
  research: "Research results",
};

/** One-line plain-English descriptions of what each artifact contains. */
const ARTIFACT_DESCRIPTIONS: Record<string, string> = {
  research_plan: "Mapped out where to look and what questions to ask",
  evidence_bundle: "Gathered raw findings from across the web",
  synthesis_notes: "Extracted the signals that matter most for your launch",
  hook_candidates: "Generated opening hook options for your content",
  launch_package_draft: "First version of your complete launch package",
  qa_report: "Checked the package for gaps and scored each section",
  rewrite_draft: "Improved version based on the quality review",
  launch_package_final: "Your complete, ready-to-use launch package",
  launch_package_markdown: "Formatted text ready to copy and use",
  research: "All research findings compiled and saved",
};

function titleCaseFromSnake(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getArtifactDisplayName(artifactType: string): string {
  const mapped = ARTIFACT_DISPLAY_NAMES[artifactType];
  if (mapped) return mapped;
  return titleCaseFromSnake(artifactType);
}

export function getArtifactDescription(
  artifactType: string,
): string | undefined {
  return ARTIFACT_DESCRIPTIONS[artifactType];
}
