import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUserId } from "./lib/auth";

export const listForRun = query({
  args: {
    runId: v.id("runs"),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const run = await ctx.db.get(args.runId);

    if (!run || run.ownerId !== userId) {
      throw new ConvexError("Run not found.");
    }

    return ctx.db
      .query("comments")
      .withIndex("by_run_and_createdAt", (q) => q.eq("runId", args.runId))
      .order("asc")
      .take(200);
  },
});

export const create = mutation({
  args: {
    runId: v.id("runs"),
    artifactId: v.optional(v.id("artifacts")),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const run = await ctx.db.get(args.runId);

    if (!run || run.ownerId !== userId) {
      throw new ConvexError("Run not found.");
    }

    const body = args.body.trim();

    if (!body) {
      throw new ConvexError("Comment cannot be empty.");
    }

    if (args.artifactId) {
      const artifact = await ctx.db.get(args.artifactId);

      if (!artifact || artifact.runId !== run._id) {
        throw new ConvexError("Artifact not found.");
      }
    }

    return ctx.db.insert("comments", {
      runId: run._id,
      ownerId: userId,
      artifactId: args.artifactId,
      body,
      createdAt: Date.now(),
    });
  },
});
