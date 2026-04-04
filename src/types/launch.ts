export type StartupBrief = {
  companyName: string;
  productName: string;
  productDescription: string;
  targetAudience: string;
  category: string;
  launchGoal: string;
  fundingStage: string;
  desiredOutcome: string;
};

export type SourceInsight = {
  focus: string;
  sourceTitle: string;
  url: string;
  quoteOrExcerpt: string;
  signal: string;
  evidence: string;
  publishedDate?: string;
  engagementHint?: string;
  signalStrength?: number;
  whyItMatters: string;
};

export type SourceResult = {
  title: string;
  url: string;
  publishedDate?: string;
  text?: string;
};

export type ResearchBucket = {
  source: "reddit" | "youtube" | "x" | "web";
  label: string;
  query: string;
  insights: SourceInsight[];
  results: SourceResult[];
};

export type PlannedResearchQuery = {
  focus: string;
  query: string;
};

export type PlannedResearchSource = {
  source: ResearchBucket["source"];
  label: string;
  queries: PlannedResearchQuery[];
};

export type CuratedEvidenceBundle = {
  curatedResearch: ResearchBucket[];
  plannedSources: PlannedResearchSource[];
  retrievalSummary: Array<{
    query: string;
    resultCount: number;
    source: ResearchBucket["source"];
  }>;
};

export type SynthesisNotes = {
  audienceSignals: string[];
  evidenceMap: string[];
  strongestAngle: string;
  strategicTensions: string[];
};

export type HookCandidate = {
  archetype?: string;
  copy: string;
  label: string;
  rationale: string;
  score?: number;
  scoreReason?: string;
};

export type HookSelectionResult = {
  rejectedHooks: Array<{
    label: string;
    reason: string;
  }>;
  selectedHooks: HookCandidate[];
  winningHook: HookCandidate;
};

export type QaReport = {
  pass: boolean;
  hookBreakdown: Array<{
    issue: string;
    label: string;
    score: number;
  }>;
  priorityFixes: string[];
  rewriteInstructions: string[];
  scores: {
    actionability: number;
    evidenceGrounding: number;
    fundraising: number;
    hooks: number;
    script: number;
    strategicAngle: number;
  };
  scriptBreakdown: {
    bodyBeats: number;
    cta: number;
    headline: number;
    openingHook: number;
    spokenDelivery: number;
  };
  verdict: string;
  weaknesses: string[];
};

export type LaunchPackage = {
  strategicAngle: string;
  researchSignals: string[];
  hookOptions: string[];
  launchScript: {
    headline: string;
    hook: string;
    bodyBeats: string[];
    ctaOptions: string[];
  };
  contentStrategy: {
    positioning: string;
    campaignMoves: string[];
    channelPlan: string[];
  };
  fundraisingAngles: string[];
  nextMoves: string[];
};

export type LaunchPackageResponse = {
  brief: StartupBrief;
  research: ResearchBucket[];
  package: LaunchPackage;
};
