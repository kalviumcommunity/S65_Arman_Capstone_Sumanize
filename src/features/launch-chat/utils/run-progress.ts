const PIPELINE_STAGES = [
  "intake",
  "research_planning",
  "source_retrieval",
  "evidence_curation",
  "synthesis_agent",
  "hook_agent",
  "package_draft",
  "qa_check",
  "rewrite_attempt",
  "finalized",
] as const;

type StageRun = {
  attemptNumber: number;
  stageKey: string;
  status: "running" | "completed" | "stopped" | "failed";
};

export function getRunProgressPct(stageRuns: StageRun[]) {
  if (stageRuns.length === 0) return 0;

  const latest = new Map<string, StageRun>();
  for (const run of stageRuns) {
    const existing = latest.get(run.stageKey);
    if (!existing || run.attemptNumber > existing.attemptNumber) {
      latest.set(run.stageKey, run);
    }
  }

  const stages = PIPELINE_STAGES.map((key) => ({
    key,
    status: latest.get(key)?.status ?? "pending",
  }));

  let focusIdx = stages.findIndex((stage) => stage.status === "running");
  if (focusIdx === -1) {
    for (let index = stages.length - 1; index >= 0; index -= 1) {
      if (stages[index].status !== "pending") {
        focusIdx = index;
        break;
      }
    }
  }

  if (focusIdx === -1) return 0;
  if (stages.length <= 1) return 100;

  return Math.max(0, Math.min(100, (focusIdx / (stages.length - 1)) * 100));
}
