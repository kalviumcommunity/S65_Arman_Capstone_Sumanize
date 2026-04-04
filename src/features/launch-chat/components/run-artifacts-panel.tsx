"use client";

import { CaretRight, CubeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  type Artifact,
  ArtifactRow,
} from "@/features/launch-chat/components/artifact-row";
import { cn } from "@/lib/utils";

export function RunArtifactsPanel({
  artifacts,
  embedded = false,
}: {
  artifacts: Artifact[];
  embedded?: boolean;
}) {
  const [sectionOpen, setSectionOpen] = useState(true);

  if (artifacts.length === 0) return null;

  const content = (
    <div
      className={cn(
        "max-w-full divide-y divide-border/30 border-y border-border/30",
        !embedded && "mt-5",
      )}
    >
      {artifacts.map((artifact) => (
        <ArtifactRow key={artifact._id} artifact={artifact} />
      ))}
    </div>
  );

  if (embedded) {
    return <div className="max-w-full select-none">{content}</div>;
  }

  return (
    <section className="mb-6 max-w-full select-none">
      <Collapsible open={sectionOpen} onOpenChange={setSectionOpen}>
        <CollapsibleTrigger className="flex w-full cursor-pointer items-start gap-2 rounded-md py-1.5 text-left">
          <CaretRight
            size={12}
            weight="bold"
            className={cn(
              "shrink-0 text-muted-foreground/50 transition-transform duration-150",
              sectionOpen && "rotate-90",
            )}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CubeIcon
                size={16}
                weight="fill"
                className="shrink-0 text-[#efb080]"
              />
              <h2 className="text-sm font-medium text-foreground/85">
                Artifacts
              </h2>
            </div>
            <p className="text-xs text-muted-foreground/65">
              Open the saved outputs generated during this run.
            </p>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="data-[ending-style]:animate-out data-[ending-style]:fade-out-0 data-[starting-style]:animate-in data-[starting-style]:fade-in-0">
          {content}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
