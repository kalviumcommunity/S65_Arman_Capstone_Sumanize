"use node";

import { ConvexError, v } from "convex/values";
import { refineLaunchPackage } from "../src/server/launch/engine";
import type { LaunchPackage, ResearchBucket } from "../src/types/launch";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

export const sendMessage = action({
  args: {
    runId: v.id("runs"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const runData: {
      artifacts: Array<{ _id: string; artifactType: string; content: unknown }>;
      run: {
        briefSnapshot: {
          category: string;
          companyName: string;
          desiredOutcome: string;
          fundingStage: string;
          launchGoal: string;
          productDescription: string;
          productName: string;
          targetAudience: string;
        };
        status: string;
      };
    } = await ctx.runQuery(api.runs.getById, { runId: args.runId });

    if (runData.run.status !== "completed") {
      throw new ConvexError(
        "Chat is only available after the run is complete.",
      );
    }

    const threadData: {
      messages: Array<{
        content: string;
        role: "assistant" | "system" | "user";
      }>;
      thread: { _id: string } | null;
    } = await ctx.runQuery(api.chats.getThreadForRun, { runId: args.runId });

    const question = args.message.trim();

    if (!question) {
      throw new ConvexError("Message cannot be empty.");
    }

    await ctx.runMutation(api.chats.storeUserMessage, {
      runId: args.runId,
      threadId: threadData.thread?._id as never,
      content: question,
    });

    const researchArtifact = runData.artifacts.find(
      (artifact) => artifact.artifactType === "research",
    );
    const finalArtifact =
      runData.artifacts.find(
        (artifact) => artifact.artifactType === "launch_package_final",
      ) ??
      runData.artifacts.find(
        (artifact) => artifact.artifactType === "rewrite_draft",
      ) ??
      runData.artifacts.find(
        (artifact) => artifact.artifactType === "launch_package_draft",
      );

    if (!researchArtifact || !finalArtifact) {
      throw new ConvexError("Run context is incomplete for chat.");
    }

    const answer = await refineLaunchPackage({
      brief: runData.run.briefSnapshot,
      history: threadData.messages.map((message) => ({
        role: message.role === "system" ? "assistant" : message.role,
        content: message.content,
      })) as Array<{ role: "assistant" | "user"; content: string }>,
      launchPackage: finalArtifact.content as LaunchPackage,
      question,
      research: researchArtifact.content as ResearchBucket[],
    });

    await ctx.runMutation(api.chats.storeAssistantMessage, {
      runId: args.runId,
      threadId: threadData.thread?._id as never,
      content: answer,
    });

    return { answer };
  },
});
