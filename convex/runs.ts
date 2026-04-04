import { ConvexError, v } from "convex/values";
import { validateStartupBrief } from "../src/lib/launch-validation";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireCurrentUserId } from "./lib/auth";
import {
  artifactTypeValidator,
  researchBucketValidator,
  runEventKindValidator,
  sourceNameValidator,
  startupBriefValidator,
} from "./model";

async function requireOwnedRun(ctx: QueryCtx | MutationCtx, runId: Id<"runs">) {
  const userId = await requireCurrentUserId(ctx);
  const run = await ctx.db.get(runId);

  if (!run || run.ownerId !== userId) {
    throw new ConvexError("Run not found.");
  }

  return { run, userId };
}

async function nextEventSequence(ctx: MutationCtx, runId: Id<"runs">) {
  const lastEvent = await ctx.db
    .query("runEvents")
    .withIndex("by_run_and_sequence", (q) => q.eq("runId", runId))
    .order("desc")
    .take(1);

  return (lastEvent[0]?.sequence ?? 0) + 1;
}

async function appendRunEvent(
  ctx: MutationCtx,
  args: {
    runId: Id<"runs">;
    ownerId: Id<"users">;
    kind: Doc<"runEvents">["kind"];
    stageKey?: string;
    source?: Doc<"runEvents">["source"];
    attemptNumber?: number;
    message?: string;
    payload?: unknown;
    artifactId?: Id<"artifacts">;
  },
) {
  const sequence = await nextEventSequence(ctx, args.runId);

  return ctx.db.insert("runEvents", {
    runId: args.runId,
    ownerId: args.ownerId,
    sequence,
    kind: args.kind,
    stageKey: args.stageKey,
    source: args.source,
    attemptNumber: args.attemptNumber,
    message: args.message,
    payload: args.payload,
    artifactId: args.artifactId,
    createdAt: Date.now(),
  });
}

async function getLatestStageAttempt(
  ctx: MutationCtx,
  runId: Id<"runs">,
  stageKey: string,
) {
  const stageRuns = await ctx.db
    .query("stageRuns")
    .withIndex("by_run_and_stageKey_and_attemptNumber", (q) =>
      q.eq("runId", runId).eq("stageKey", stageKey),
    )
    .order("desc")
    .take(1);

  return stageRuns[0]?.attemptNumber ?? 0;
}

async function startStage(
  ctx: MutationCtx,
  args: {
    runId: Id<"runs">;
    ownerId: Id<"users">;
    stageKey: string;
    message?: string;
  },
) {
  const attemptNumber =
    (await getLatestStageAttempt(ctx, args.runId, args.stageKey)) + 1;
  await ctx.db.insert("stageRuns", {
    runId: args.runId,
    ownerId: args.ownerId,
    stageKey: args.stageKey,
    attemptNumber,
    status: "running",
    startedAt: Date.now(),
  });
  await appendRunEvent(ctx, {
    runId: args.runId,
    ownerId: args.ownerId,
    kind: "stage_started",
    stageKey: args.stageKey,
    attemptNumber,
    message: args.message,
  });

  return attemptNumber;
}

async function completeLatestStage(
  ctx: MutationCtx,
  args: {
    runId: Id<"runs">;
    ownerId: Id<"users">;
    stageKey: string;
    summary?: string;
  },
) {
  const stageRuns = await ctx.db
    .query("stageRuns")
    .withIndex("by_run_and_stageKey_and_attemptNumber", (q) =>
      q.eq("runId", args.runId).eq("stageKey", args.stageKey),
    )
    .order("desc")
    .take(1);
  const latestStage = stageRuns[0];

  if (!latestStage || latestStage.status !== "running") {
    return null;
  }

  await ctx.db.patch(latestStage._id, {
    status: "completed",
    completedAt: Date.now(),
    summary: args.summary,
  });
  await appendRunEvent(ctx, {
    runId: args.runId,
    ownerId: args.ownerId,
    kind: "stage_completed",
    stageKey: args.stageKey,
    attemptNumber: latestStage.attemptNumber,
    message: args.summary,
  });

  return latestStage.attemptNumber;
}

async function failLatestStage(
  ctx: MutationCtx,
  args: {
    runId: Id<"runs">;
    ownerId: Id<"users">;
    stageKey: string;
    summary: string;
  },
) {
  const stageRuns = await ctx.db
    .query("stageRuns")
    .withIndex("by_run_and_stageKey_and_attemptNumber", (q) =>
      q.eq("runId", args.runId).eq("stageKey", args.stageKey),
    )
    .order("desc")
    .take(1);
  const latestStage = stageRuns[0];

  if (latestStage && latestStage.status === "running") {
    await ctx.db.patch(latestStage._id, {
      status: "failed",
      completedAt: Date.now(),
      summary: args.summary,
    });
    await appendRunEvent(ctx, {
      runId: args.runId,
      ownerId: args.ownerId,
      kind: "stage_failed",
      stageKey: args.stageKey,
      attemptNumber: latestStage.attemptNumber,
      message: args.summary,
    });
  }
}

async function stopLatestStage(
  ctx: MutationCtx,
  args: {
    runId: Id<"runs">;
    ownerId: Id<"users">;
    stageKey: string;
    summary: string;
  },
) {
  const stageRuns = await ctx.db
    .query("stageRuns")
    .withIndex("by_run_and_stageKey_and_attemptNumber", (q) =>
      q.eq("runId", args.runId).eq("stageKey", args.stageKey),
    )
    .order("desc")
    .take(1);
  const latestStage = stageRuns[0];

  if (latestStage && latestStage.status === "running") {
    await ctx.db.patch(latestStage._id, {
      status: "stopped",
      completedAt: Date.now(),
      summary: args.summary,
    });
    await appendRunEvent(ctx, {
      runId: args.runId,
      ownerId: args.ownerId,
      kind: "stage_stopped",
      stageKey: args.stageKey,
      attemptNumber: latestStage.attemptNumber,
      message: args.summary,
    });
  }
}

export const createFromBrief = mutation({
  args: {
    brief: startupBriefValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const validation = validateStartupBrief(args.brief);

    if (!validation.ok) {
      throw new ConvexError(validation.error);
    }

    const now = Date.now();
    const startupId = await ctx.db.insert("startups", {
      ownerId: userId,
      brief: validation.brief,
      createdAt: now,
      updatedAt: now,
    });
    const runId = await ctx.db.insert("runs", {
      startupId,
      ownerId: userId,
      briefSnapshot: validation.brief,
      status: "queued",
      currentStage: "intake",
      createdAt: now,
      updatedAt: now,
    });

    await appendRunEvent(ctx, {
      runId,
      ownerId: userId,
      kind: "run_created",
      stageKey: "intake",
      message: "Run created from submitted startup brief.",
      payload: {
        companyName: validation.brief.companyName,
        productName: validation.brief.productName,
      },
    });

    return { runId, startupId };
  },
});

export const getById = query({
  args: {
    runId: v.id("runs"),
  },
  handler: async (ctx, args) => {
    const { run } = await requireOwnedRun(ctx, args.runId);
    const startup = await ctx.db.get(run.startupId);

    if (!startup) {
      throw new ConvexError("Startup not found.");
    }

    const artifacts = await ctx.db
      .query("artifacts")
      .withIndex("by_run", (q) => q.eq("runId", run._id))
      .order("asc")
      .collect();
    const stageRuns = await ctx.db
      .query("stageRuns")
      .withIndex("by_run_and_startedAt", (q) => q.eq("runId", run._id))
      .order("asc")
      .collect();
    const runEvents = await ctx.db
      .query("runEvents")
      .withIndex("by_run_and_sequence", (q) => q.eq("runId", run._id))
      .order("asc")
      .take(500);

    return {
      run,
      startup,
      artifacts,
      stageRuns,
      runEvents,
    };
  },
});

export const getExecutionState = query({
  args: {
    runId: v.id("runs"),
  },
  handler: async (ctx, args) => {
    const { run } = await requireOwnedRun(ctx, args.runId);

    return {
      currentStage: run.currentStage,
      status: run.status,
    };
  },
});

export const markGenerating = mutation({
  args: {
    runId: v.id("runs"),
  },
  handler: async (ctx, args) => {
    const { run, userId } = await requireOwnedRun(ctx, args.runId);

    if (run.status === "completed" || run.status === "stopped") {
      return run._id;
    }

    await appendRunEvent(ctx, {
      runId: run._id,
      ownerId: userId,
      kind: "run_started",
      stageKey: "research_planning",
      message: "Workflow started and entered research planning stage.",
    });
    await startStage(ctx, {
      runId: run._id,
      ownerId: userId,
      stageKey: "research_planning",
      message: "Research planning stage started.",
    });
    await ctx.db.patch(run._id, {
      status: "generating",
      currentStage: "research_planning",
      latestError: undefined,
      updatedAt: Date.now(),
    });

    return run._id;
  },
});

export const updateStage = mutation({
  args: {
    runId: v.id("runs"),
    currentStage: v.string(),
  },
  handler: async (ctx, args) => {
    const { run, userId } = await requireOwnedRun(ctx, args.runId);

    if (
      run.status === "completed" ||
      run.status === "stopped" ||
      run.status === "failed"
    ) {
      return run._id;
    }

    if (run.currentStage && run.currentStage !== args.currentStage) {
      await completeLatestStage(ctx, {
        runId: run._id,
        ownerId: userId,
        stageKey: run.currentStage,
        summary: `${run.currentStage} stage completed.`,
      });
      await startStage(ctx, {
        runId: run._id,
        ownerId: userId,
        stageKey: args.currentStage,
        message: `${args.currentStage} stage started.`,
      });
    }

    await ctx.db.patch(run._id, {
      status: "generating",
      currentStage: args.currentStage,
      updatedAt: Date.now(),
    });

    return run._id;
  },
});

export const saveStreamResult = mutation({
  args: {
    runId: v.id("runs"),
    finalPackage: v.any(),
    research: v.array(researchBucketValidator),
    synthesisMarkdown: v.string(),
  },
  handler: async (ctx, args) => {
    const { run, userId } = await requireOwnedRun(ctx, args.runId);
    const existingArtifacts = await ctx.db
      .query("artifacts")
      .withIndex("by_run", (q) => q.eq("runId", run._id))
      .collect();
    const researchVersion =
      existingArtifacts.filter(
        (artifact) => artifact.artifactType === "research",
      ).length + 1;
    const markdownVersion =
      existingArtifacts.filter(
        (artifact) => artifact.artifactType === "launch_package_markdown",
      ).length + 1;
    const finalPackageVersion =
      existingArtifacts.filter(
        (artifact) => artifact.artifactType === "launch_package_final",
      ).length + 1;
    const now = Date.now();

    const finalArtifactId = await ctx.db.insert("artifacts", {
      runId: run._id,
      ownerId: userId,
      artifactType: "launch_package_final",
      version: finalPackageVersion,
      content: args.finalPackage,
      createdAt: now,
      isFinal: true,
    });
    await appendRunEvent(ctx, {
      runId: run._id,
      ownerId: userId,
      kind: "artifact_created",
      stageKey: "finalized",
      message: "Final structured launch package saved.",
      artifactId: finalArtifactId,
    });

    await ctx.db.insert("artifacts", {
      runId: run._id,
      ownerId: userId,
      artifactType: "research",
      version: researchVersion,
      content: args.research,
      createdAt: now,
    });
    await appendRunEvent(ctx, {
      runId: run._id,
      ownerId: userId,
      kind: "artifact_created",
      stageKey: "research",
      message: "Research artifact saved.",
      payload: {
        bucketCount: args.research.length,
      },
    });

    await ctx.db.insert("artifacts", {
      runId: run._id,
      ownerId: userId,
      artifactType: "launch_package_markdown",
      version: markdownVersion,
      content: {
        text: args.synthesisMarkdown,
      },
      markdown: args.synthesisMarkdown,
      createdAt: now,
    });
    await appendRunEvent(ctx, {
      runId: run._id,
      ownerId: userId,
      kind: "artifact_created",
      stageKey: "finalized",
      message: "Final launch package markdown saved.",
    });

    if (run.currentStage) {
      await completeLatestStage(ctx, {
        runId: run._id,
        ownerId: userId,
        stageKey: run.currentStage,
        summary: `${run.currentStage} stage completed.`,
      });
    }

    await ctx.db.patch(run._id, {
      status: "completed",
      currentStage: "finalized",
      finalArtifactId,
      latestError: undefined,
      completedAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(run.startupId, {
      updatedAt: now,
    });
    await appendRunEvent(ctx, {
      runId: run._id,
      ownerId: userId,
      kind: "run_completed",
      stageKey: "finalized",
      message: "Run completed successfully.",
    });

    return finalArtifactId;
  },
});

export const createArtifact = mutation({
  args: {
    runId: v.id("runs"),
    artifactType: artifactTypeValidator,
    content: v.any(),
    markdown: v.optional(v.string()),
    isFinal: v.optional(v.boolean()),
    stageKey: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { run, userId } = await requireOwnedRun(ctx, args.runId);
    const existingArtifacts = await ctx.db
      .query("artifacts")
      .withIndex("by_run_and_type", (q) =>
        q.eq("runId", run._id).eq("artifactType", args.artifactType),
      )
      .collect();
    const artifactId = await ctx.db.insert("artifacts", {
      runId: run._id,
      ownerId: userId,
      artifactType: args.artifactType,
      version: existingArtifacts.length + 1,
      content: args.content,
      markdown: args.markdown,
      createdAt: Date.now(),
      isFinal: args.isFinal,
    });

    await appendRunEvent(ctx, {
      runId: run._id,
      ownerId: userId,
      kind: "artifact_created",
      stageKey: args.stageKey,
      message: args.message ?? `${args.artifactType} artifact saved.`,
      artifactId,
      payload: {
        artifactType: args.artifactType,
      },
    });

    return artifactId;
  },
});

export const markFailed = mutation({
  args: {
    runId: v.id("runs"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const { run, userId } = await requireOwnedRun(ctx, args.runId);

    if (run.status === "completed" || run.status === "failed") {
      return run._id;
    }

    if (run.currentStage) {
      await failLatestStage(ctx, {
        runId: run._id,
        ownerId: userId,
        stageKey: run.currentStage,
        summary: args.message,
      });
    }

    await ctx.db.patch(run._id, {
      status: "failed",
      currentStage: "failed",
      latestError: args.message,
      updatedAt: Date.now(),
    });
    await appendRunEvent(ctx, {
      runId: run._id,
      ownerId: userId,
      kind: "run_failed",
      stageKey: run.currentStage,
      message: args.message,
    });

    return run._id;
  },
});

export const markStopped = mutation({
  args: {
    runId: v.id("runs"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { run, userId } = await requireOwnedRun(ctx, args.runId);
    const message = args.message ?? "Run stopped by user.";

    if (run.status === "completed" || run.status === "failed") {
      return run._id;
    }

    if (run.status === "stopped") {
      return run._id;
    }

    if (run.currentStage) {
      await stopLatestStage(ctx, {
        runId: run._id,
        ownerId: userId,
        stageKey: run.currentStage,
        summary: message,
      });
    }

    await ctx.db.patch(run._id, {
      status: "stopped",
      latestError: undefined,
      updatedAt: Date.now(),
    });
    await appendRunEvent(ctx, {
      runId: run._id,
      ownerId: userId,
      kind: "run_stopped",
      stageKey: run.currentStage,
      message,
    });

    return run._id;
  },
});

export const recordEvent = mutation({
  args: {
    runId: v.id("runs"),
    kind: runEventKindValidator,
    stageKey: v.optional(v.string()),
    source: v.optional(sourceNameValidator),
    attemptNumber: v.optional(v.number()),
    message: v.optional(v.string()),
    payload: v.optional(v.any()),
    artifactId: v.optional(v.id("artifacts")),
  },
  handler: async (ctx, args) => {
    const { run, userId } = await requireOwnedRun(ctx, args.runId);

    return appendRunEvent(ctx, {
      runId: run._id,
      ownerId: userId,
      kind: args.kind,
      stageKey: args.stageKey,
      source: args.source,
      attemptNumber: args.attemptNumber,
      message: args.message,
      payload: args.payload,
      artifactId: args.artifactId,
    });
  },
});

export const rerunFromRun = mutation({
  args: {
    runId: v.id("runs"),
  },
  handler: async (ctx, args) => {
    const { run, userId } = await requireOwnedRun(ctx, args.runId);
    const now = Date.now();
    const newRunId = await ctx.db.insert("runs", {
      startupId: run.startupId,
      ownerId: userId,
      parentRunId: run._id,
      briefSnapshot: run.briefSnapshot,
      status: "queued",
      currentStage: "intake",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(run.startupId, {
      updatedAt: now,
    });
    await appendRunEvent(ctx, {
      runId: newRunId,
      ownerId: userId,
      kind: "run_created",
      stageKey: "intake",
      message: "Rerun created from prior run.",
      payload: {
        parentRunId: run._id,
      },
    });
    await appendRunEvent(ctx, {
      runId: newRunId,
      ownerId: userId,
      kind: "run_rerun_requested",
      stageKey: "intake",
      message: "Whole workflow rerun requested.",
      payload: {
        parentRunId: run._id,
      },
    });

    return { runId: newRunId };
  },
});
