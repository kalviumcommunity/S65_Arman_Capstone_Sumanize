import type { StartupBrief } from "@/types/launch";

export function BriefSummaryCard({ brief }: { brief: StartupBrief }) {
  return (
    <div className="mt-4 rounded-lg border border-border/70 bg-card/80 px-5 py-4">
      <h1 className="text-lg font-semibold tracking-tight text-foreground">
        {brief.productName}
      </h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {brief.companyName}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/80">
        {brief.targetAudience ? (
          <span>
            <span className="text-muted-foreground/50">Audience </span>
            {brief.targetAudience}
          </span>
        ) : null}
        {brief.category ? (
          <span>
            <span className="text-muted-foreground/50">Category </span>
            {brief.category}
          </span>
        ) : null}
        <span>
          <span className="text-muted-foreground/50">Stage </span>
          {brief.fundingStage}
        </span>
        {brief.launchGoal ? (
          <span>
            <span className="text-muted-foreground/50">Goal </span>
            {brief.launchGoal}
          </span>
        ) : null}
      </div>
    </div>
  );
}
