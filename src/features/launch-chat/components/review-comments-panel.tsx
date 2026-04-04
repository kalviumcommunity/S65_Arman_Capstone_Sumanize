"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getArtifactDisplayName } from "@/features/launch-chat/utils/artifact-display-names";
import { formatTimestamp } from "@/features/launch-chat/utils/run-display";

type ArtifactSummary = {
  _id: Id<"artifacts">;
  artifactType: string;
  version: number;
};

type CommentItem = {
  _id: Id<"comments">;
  artifactId?: Id<"artifacts">;
  body: string;
  createdAt: number;
};

export function ReviewCommentsPanel({
  artifacts,
  runId,
}: {
  artifacts: ArtifactSummary[];
  runId: Id<"runs">;
}) {
  const comments = useQuery(api.comments.listForRun, { runId }) as
    | CommentItem[]
    | undefined;
  const createComment = useMutation(api.comments.create);
  const [artifactValue, setArtifactValue] = useState<string>(
    artifacts[artifacts.length - 1]?._id ?? "run",
  );
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedArtifact = useMemo(
    () => artifacts.find((artifact) => artifact._id === artifactValue),
    [artifactValue, artifacts],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createComment({
        runId,
        artifactId:
          artifactValue === "run"
            ? undefined
            : (artifactValue as Id<"artifacts">),
        body,
      });
      setBody("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save comment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Review Comments
        </h2>
        <span className="text-[11px] text-muted-foreground/50">
          {comments?.length ?? 0} comments
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leave feedback on this run</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Attach comment to</Label>
              <Select
                value={artifactValue}
                onValueChange={(value) => setArtifactValue(value ?? "run")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="run">Run-level review</SelectItem>
                  {artifacts.map((artifact) => (
                    <SelectItem key={artifact._id} value={artifact._id}>
                      {getArtifactDisplayName(artifact.artifactType)} v
                      {artifact.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-comment">Comment</Label>
              <Textarea
                id="review-comment"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={
                  selectedArtifact
                    ? `Feedback for ${getArtifactDisplayName(selectedArtifact.artifactType)}...`
                    : "Describe what should change."
                }
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Add Comment"}
            </Button>
          </form>

          <div className="grid gap-3">
            {comments?.map((comment: CommentItem) => (
              <div
                key={comment._id}
                className="rounded-lg border border-border/50 bg-muted/15 p-3"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatTimestamp(comment.createdAt)}</span>
                  <span>•</span>
                  <span>
                    {comment.artifactId
                      ? (() => {
                          const linked = artifacts.find(
                            (artifact) => artifact._id === comment.artifactId,
                          );
                          return linked
                            ? getArtifactDisplayName(linked.artifactType)
                            : "Artifact";
                        })()
                      : "Run review"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {comment.body}
                </p>
              </div>
            ))}
            {comments && comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No review comments yet.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
