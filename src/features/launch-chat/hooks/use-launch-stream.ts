"use client";

import type { Id } from "@convex/_generated/dataModel";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { parseSseChunks } from "@/features/launch-chat/utils/sse";
import { getErrorMessage } from "@/lib/get-error-message";
import type { LaunchPackage, ResearchBucket } from "@/types/launch";

export type StreamPhase =
  | "idle"
  | "researching"
  | "synthesizing"
  | "stopped"
  | "done"
  | "error";

export function useLaunchStream() {
  const abortRef = useRef<AbortController | null>(null);
  const stopRequestedRef = useRef(false);
  const [phase, setPhase] = useState<StreamPhase>("idle");
  const [buckets, setBuckets] = useState<Map<string, ResearchBucket>>(
    new Map(),
  );
  const [finalPackage, setFinalPackage] = useState<LaunchPackage | null>(null);
  const [synthesis, setSynthesis] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(
    (args: {
      finalPackage?: LaunchPackage | null;
      research: ResearchBucket[];
      synthesisMarkdown: string;
    }) => {
      setBuckets(
        new Map(args.research.map((bucket) => [bucket.source, bucket])),
      );
      setFinalPackage(args.finalPackage ?? null);
      setSynthesis(args.synthesisMarkdown);
      setError(null);
      setPhase(args.finalPackage || args.synthesisMarkdown ? "done" : "idle");
    },
    [],
  );

  const startStream = useCallback(async (args: { runId: Id<"runs"> }) => {
    stopRequestedRef.current = false;
    setPhase("researching");
    setBuckets(new Map());
    setFinalPackage(null);
    setSynthesis("");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/launch-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: args.runId }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let sawTerminalEvent = false;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parsed = parseSseChunks(buffer);
        buffer = parsed.remainder;

        for (const event of parsed.events) {
          switch (event.type) {
            case "research":
              setBuckets((prev) =>
                new Map(prev).set(event.data.source, event.data),
              );
              break;
            case "research_complete":
              setPhase((current) =>
                current === "done" ? current : "synthesizing",
              );
              break;
            case "final_package":
              setFinalPackage(event.data);
              setPhase("done");
              break;
            case "token":
              setSynthesis((prev) => prev + event.data.text);
              break;
            case "done":
              sawTerminalEvent = true;
              setPhase("done");
              break;
            case "error":
              sawTerminalEvent = true;
              setError(event.data.message);
              setPhase("error");
              toast.error(event.data.message || "Workflow failed.");
              break;
            case "research_error":
              setError(event.data.message);
              toast.error(event.data.message || "A research source failed.");
              break;
          }
        }
      }

      if (!controller.signal.aborted && !sawTerminalEvent) {
        throw new Error(
          "The workflow stream ended before completion. This usually means the serverless function was terminated before the later stages finished.",
        );
      }

      setPhase((current) => (current === "synthesizing" ? "done" : current));
    } catch (err) {
      if (controller.signal.aborted) {
        if (stopRequestedRef.current) {
          setPhase("stopped");
        }
        return;
      }

      const message = getErrorMessage(
        err,
        "The research run stopped unexpectedly. Please try again.",
      );
      setError(message);
      setPhase("error");
      toast.error(message);
    }
  }, []);

  const stopStream = useCallback(() => {
    stopRequestedRef.current = true;
    setError(null);
    setPhase("stopped");
    abortRef.current?.abort();
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    buckets,
    error,
    finalPackage,
    hydrate,
    isLive: phase === "researching" || phase === "synthesizing",
    phase,
    startStream,
    stopStream,
    synthesis,
  };
}
