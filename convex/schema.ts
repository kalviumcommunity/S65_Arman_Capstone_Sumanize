import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  artifactTypeValidator,
  runEventKindValidator,
  runStatusValidator,
  sourceNameValidator,
  stageRunStatusValidator,
  startupBriefValidator,
} from "./model";

export default defineSchema({
  ...authTables,
  startups: defineTable({
    ownerId: v.id("users"),
    brief: startupBriefValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_and_updatedAt", ["ownerId", "updatedAt"]),
  runs: defineTable({
    startupId: v.id("startups"),
    ownerId: v.id("users"),
    parentRunId: v.optional(v.id("runs")),
    briefSnapshot: startupBriefValidator,
    status: runStatusValidator,
    currentStage: v.optional(v.string()),
    latestError: v.optional(v.string()),
    finalArtifactId: v.optional(v.id("artifacts")),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_startup", ["startupId"])
    .index("by_startup_and_createdAt", ["startupId", "createdAt"]),
  artifacts: defineTable({
    runId: v.id("runs"),
    ownerId: v.id("users"),
    artifactType: artifactTypeValidator,
    version: v.number(),
    content: v.any(),
    markdown: v.optional(v.string()),
    createdAt: v.number(),
    isFinal: v.optional(v.boolean()),
  })
    .index("by_run", ["runId"])
    .index("by_run_and_type", ["runId", "artifactType"]),
  stageRuns: defineTable({
    runId: v.id("runs"),
    ownerId: v.id("users"),
    stageKey: v.string(),
    attemptNumber: v.number(),
    status: stageRunStatusValidator,
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    summary: v.optional(v.string()),
  })
    .index("by_run_and_startedAt", ["runId", "startedAt"])
    .index("by_run_and_stageKey_and_attemptNumber", [
      "runId",
      "stageKey",
      "attemptNumber",
    ]),
  runEvents: defineTable({
    runId: v.id("runs"),
    ownerId: v.id("users"),
    sequence: v.number(),
    kind: runEventKindValidator,
    stageKey: v.optional(v.string()),
    source: v.optional(sourceNameValidator),
    attemptNumber: v.optional(v.number()),
    message: v.optional(v.string()),
    payload: v.optional(v.any()),
    artifactId: v.optional(v.id("artifacts")),
    createdAt: v.number(),
  }).index("by_run_and_sequence", ["runId", "sequence"]),
  comments: defineTable({
    runId: v.id("runs"),
    ownerId: v.id("users"),
    artifactId: v.optional(v.id("artifacts")),
    body: v.string(),
    createdAt: v.number(),
  })
    .index("by_run_and_createdAt", ["runId", "createdAt"])
    .index("by_run_and_artifactId_and_createdAt", [
      "runId",
      "artifactId",
      "createdAt",
    ]),
  chatThreads: defineTable({
    runId: v.id("runs"),
    ownerId: v.id("users"),
    status: v.union(v.literal("open"), v.literal("closed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_run", ["runId"]),
  chatMessages: defineTable({
    threadId: v.id("chatThreads"),
    runId: v.id("runs"),
    ownerId: v.id("users"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_thread_and_createdAt", ["threadId", "createdAt"])
    .index("by_run_and_createdAt", ["runId", "createdAt"]),
});
