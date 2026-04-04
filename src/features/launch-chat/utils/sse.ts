import type { LaunchPackage, ResearchBucket } from "@/types/launch";

export type LaunchStreamEvent =
  | { type: "research"; data: ResearchBucket }
  | { type: "research_complete" }
  | { type: "final_package"; data: LaunchPackage }
  | { type: "token"; data: { text: string } }
  | { type: "done" }
  | { type: "error"; data: { message: string } }
  | {
      type: "research_error";
      data: { source: string; label: string; message: string };
    };

export function parseSseChunks(input: string) {
  const parts = input.split("\n\n");
  const remainder = parts.pop() ?? "";
  const events: LaunchStreamEvent[] = [];

  for (const part of parts) {
    if (!part.trim()) {
      continue;
    }

    let eventName = "";
    let data = "";

    for (const line of part.split("\n")) {
      if (line.startsWith("event: ")) {
        eventName = line.slice(7);
      }
      if (line.startsWith("data: ")) {
        data = line.slice(6);
      }
    }

    if (!eventName) {
      continue;
    }

    switch (eventName) {
      case "research":
        events.push({
          type: "research",
          data: JSON.parse(data) as ResearchBucket,
        });
        break;
      case "research_complete":
        events.push({ type: "research_complete" });
        break;
      case "final_package":
        events.push({
          type: "final_package",
          data: JSON.parse(data) as LaunchPackage,
        });
        break;
      case "token":
        events.push({
          type: "token",
          data: JSON.parse(data) as { text: string },
        });
        break;
      case "done":
        events.push({ type: "done" });
        break;
      case "error":
        events.push({
          type: "error",
          data: JSON.parse(data) as { message: string },
        });
        break;
      case "research_error":
        events.push({
          type: "research_error",
          data: JSON.parse(data) as {
            source: string;
            label: string;
            message: string;
          },
        });
        break;
      default:
        break;
    }
  }

  return { events, remainder };
}
