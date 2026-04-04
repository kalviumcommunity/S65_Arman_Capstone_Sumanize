import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { requireCurrentUserId } from "./lib/auth";

async function deleteRunCascade(ctx: MutationCtx, runId: Id<"runs">) {
  const [artifacts, comments, runEvents, stageRuns, chatThreads, chatMessages] =
    await Promise.all([
      ctx.db
        .query("artifacts")
        .withIndex("by_run", (q) => q.eq("runId", runId as never))
        .collect(),
      ctx.db
        .query("comments")
        .withIndex("by_run_and_createdAt", (q) => q.eq("runId", runId as never))
        .collect(),
      ctx.db
        .query("runEvents")
        .withIndex("by_run_and_sequence", (q) => q.eq("runId", runId as never))
        .collect(),
      ctx.db
        .query("stageRuns")
        .withIndex("by_run_and_startedAt", (q) => q.eq("runId", runId as never))
        .collect(),
      ctx.db
        .query("chatThreads")
        .withIndex("by_run", (q) => q.eq("runId", runId as never))
        .collect(),
      ctx.db
        .query("chatMessages")
        .withIndex("by_run_and_createdAt", (q) => q.eq("runId", runId as never))
        .collect(),
    ]);

  await Promise.all(chatMessages.map((message) => ctx.db.delete(message._id)));
  await Promise.all(chatThreads.map((thread) => ctx.db.delete(thread._id)));
  await Promise.all(comments.map((comment) => ctx.db.delete(comment._id)));
  await Promise.all(runEvents.map((event) => ctx.db.delete(event._id)));
  await Promise.all(stageRuns.map((stageRun) => ctx.db.delete(stageRun._id)));
  await Promise.all(artifacts.map((artifact) => ctx.db.delete(artifact._id)));
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireCurrentUserId(ctx);
    const startups = await ctx.db
      .query("startups")
      .withIndex("by_owner_and_updatedAt", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      startups.map(async (startup) => {
        const runs = await ctx.db
          .query("runs")
          .withIndex("by_startup_and_createdAt", (q) =>
            q.eq("startupId", startup._id),
          )
          .order("desc")
          .collect();

        const latestRun = runs[0] ?? null;

        return {
          _id: startup._id,
          brief: startup.brief,
          createdAt: startup.createdAt,
          updatedAt: startup.updatedAt,
          latestRun: latestRun
            ? {
                _id: latestRun._id,
                status: latestRun.status,
                createdAt: latestRun.createdAt,
              }
            : null,
          runCount: runs.length,
        };
      }),
    );
  },
});

export const deleteMany = mutation({
  args: {
    startupIds: v.array(v.id("startups")),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const startupIds = [...new Set(args.startupIds)];

    if (startupIds.length === 0) {
      return { deletedCount: 0 };
    }

    for (const startupId of startupIds) {
      const startup = await ctx.db.get(startupId);

      if (!startup || startup.ownerId !== userId) {
        throw new ConvexError("Startup not found.");
      }

      const runs = await ctx.db
        .query("runs")
        .withIndex("by_startup", (q) => q.eq("startupId", startupId))
        .collect();

      for (const run of runs) {
        await deleteRunCascade(ctx as never, run._id);
        await ctx.db.delete(run._id);
      }

      await ctx.db.delete(startupId);
    }

    return {
      deletedCount: startupIds.length,
    };
  },
});
