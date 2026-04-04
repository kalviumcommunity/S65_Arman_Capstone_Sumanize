import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUserId } from "./lib/auth";

export const getThreadForRun = query({
  args: {
    runId: v.id("runs"),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const run = await ctx.db.get(args.runId);

    if (!run || run.ownerId !== userId) {
      throw new ConvexError("Run not found.");
    }

    const thread = await ctx.db
      .query("chatThreads")
      .withIndex("by_run", (q) => q.eq("runId", run._id))
      .unique();

    if (!thread) {
      return { messages: [], thread: null };
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_thread_and_createdAt", (q) => q.eq("threadId", thread._id))
      .order("asc")
      .take(200);

    return { messages, thread };
  },
});

export const storeUserMessage = mutation({
  args: {
    runId: v.id("runs"),
    threadId: v.optional(v.id("chatThreads")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const run = await ctx.db.get(args.runId);

    if (!run || run.ownerId !== userId) {
      throw new ConvexError("Run not found.");
    }

    let threadId = args.threadId;

    if (!threadId) {
      threadId = await ctx.db.insert("chatThreads", {
        runId: run._id,
        ownerId: userId,
        status: "open",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    const content = args.content.trim();

    if (!content) {
      throw new ConvexError("Message cannot be empty.");
    }

    await ctx.db.patch(threadId, {
      updatedAt: Date.now(),
    });

    return ctx.db.insert("chatMessages", {
      threadId,
      runId: run._id,
      ownerId: userId,
      role: "user",
      content,
      createdAt: Date.now(),
    });
  },
});

export const storeAssistantMessage = mutation({
  args: {
    runId: v.id("runs"),
    threadId: v.optional(v.id("chatThreads")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const run = await ctx.db.get(args.runId);

    if (!run || run.ownerId !== userId) {
      throw new ConvexError("Run not found.");
    }

    let threadId = args.threadId;

    if (!threadId) {
      threadId = await ctx.db.insert("chatThreads", {
        runId: run._id,
        ownerId: userId,
        status: "open",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    await ctx.db.patch(threadId, {
      updatedAt: Date.now(),
    });

    return ctx.db.insert("chatMessages", {
      threadId,
      runId: run._id,
      ownerId: userId,
      role: "assistant",
      content: args.content,
      createdAt: Date.now(),
    });
  },
});
