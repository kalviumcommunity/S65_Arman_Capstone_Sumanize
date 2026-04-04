"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useAction, useQuery } from "convex/react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatTimestamp } from "@/features/launch-chat/utils/run-display";

export function StrategistChatPanel({
  canChat,
  runId,
}: {
  canChat: boolean;
  runId: Id<"runs">;
}) {
  const threadData = useQuery(api.chats.getThreadForRun, { runId }) as
    | {
        messages: Array<{
          _id: Id<"chatMessages">;
          content: string;
          createdAt: number;
          role: "assistant" | "system" | "user";
        }>;
        thread: { _id: Id<"chatThreads"> } | null;
      }
    | undefined;
  const sendMessage = useAction(api.chatActions.sendMessage);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canChat) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await sendMessage({ runId, message });
      setMessage("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Strategist Chat
        </h2>
        <span className="text-[11px] text-muted-foreground/50">
          {threadData?.messages.length ?? 0} messages
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Continue the strategy session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canChat ? (
            <p className="text-sm text-muted-foreground">
              Follow-up chat unlocks once the run is completed.
            </p>
          ) : null}

          <div className="grid gap-3">
            {threadData?.messages.map((messageItem) => (
              <div
                key={messageItem._id}
                className="rounded-lg border border-border/50 bg-muted/15 p-3"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{messageItem.role}</span>
                  <span>•</span>
                  <span>{formatTimestamp(messageItem.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {messageItem.content}
                </p>
              </div>
            ))}
            {threadData && threadData.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No follow-up messages yet.
              </p>
            ) : null}
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={!canChat || isSubmitting}
              placeholder="Ask for revisions, channel-specific rewrites, investor framing, or deeper strategy."
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button disabled={!canChat || isSubmitting} type="submit">
              {isSubmitting ? "Thinking..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
