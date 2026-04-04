import { v } from "convex/values";

export const startupBriefValidator = v.object({
  companyName: v.string(),
  productName: v.string(),
  productDescription: v.string(),
  targetAudience: v.string(),
  category: v.string(),
  launchGoal: v.string(),
  fundingStage: v.string(),
  desiredOutcome: v.string(),
});

export const sourceInsightValidator = v.object({
  focus: v.string(),
  sourceTitle: v.string(),
  url: v.string(),
  quoteOrExcerpt: v.string(),
  signal: v.string(),
  evidence: v.string(),
  publishedDate: v.optional(v.string()),
  engagementHint: v.optional(v.string()),
  signalStrength: v.optional(v.number()),
  whyItMatters: v.string(),
});

export const sourceResultValidator = v.object({
  title: v.string(),
  url: v.string(),
  publishedDate: v.optional(v.string()),
  text: v.optional(v.string()),
});

export const researchBucketValidator = v.object({
  source: v.union(
    v.literal("reddit"),
    v.literal("youtube"),
    v.literal("x"),
    v.literal("web"),
  ),
  label: v.string(),
  query: v.string(),
  insights: v.array(sourceInsightValidator),
  results: v.array(sourceResultValidator),
});

export const sourceNameValidator = v.union(
  v.literal("reddit"),
  v.literal("youtube"),
  v.literal("x"),
  v.literal("web"),
);

export const runStatusValidator = v.union(
  v.literal("queued"),
  v.literal("generating"),
  v.literal("stopped"),
  v.literal("completed"),
  v.literal("failed"),
);

export const artifactTypeValidator = v.union(
  v.literal("research"),
  v.literal("research_plan"),
  v.literal("evidence_bundle"),
  v.literal("synthesis_notes"),
  v.literal("hook_candidates"),
  v.literal("launch_package_draft"),
  v.literal("qa_report"),
  v.literal("rewrite_draft"),
  v.literal("launch_package_final"),
  v.literal("launch_package_markdown"),
);

export const stageRunStatusValidator = v.union(
  v.literal("running"),
  v.literal("completed"),
  v.literal("stopped"),
  v.literal("failed"),
);

export const runEventKindValidator = v.union(
  v.literal("run_created"),
  v.literal("run_started"),
  v.literal("run_stopped"),
  v.literal("run_completed"),
  v.literal("run_failed"),
  v.literal("run_rerun_requested"),
  v.literal("stage_started"),
  v.literal("stage_completed"),
  v.literal("stage_stopped"),
  v.literal("stage_failed"),
  v.literal("source_started"),
  v.literal("source_completed"),
  v.literal("source_failed"),
  v.literal("artifact_created"),
  v.literal("stream_connected"),
  v.literal("stream_completed"),
);
