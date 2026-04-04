import Exa from "exa-js";
import { researchSchema } from "@/server/launch/schemas";
import type {
  CuratedEvidenceBundle,
  PlannedResearchSource,
  ResearchBucket,
  SourceInsight,
  SourceResult,
  StartupBrief,
} from "@/types/launch";

export const sourceConfigs = [
  {
    source: "reddit" as const,
    label: "Reddit",
    includeDomains: ["reddit.com"],
    buildQueries: (brief: StartupBrief) => [
      {
        focus: "customer pain",
        query: `${brief.productName} ${brief.targetAudience} ${brief.category} customer pain points, objections, complaints, buying triggers, desired outcomes`,
      },
      {
        focus: "controversy and objections",
        query: `${brief.productName} ${brief.targetAudience} category distrust, failed alternatives, backlash, skepticism, reddit threads`,
      },
      {
        focus: "verbatim buyer language",
        query: `${brief.targetAudience} ${brief.category} reddit exact phrases, complaints, wish list, quote, wording people actually use`,
      },
    ],
  },
  {
    source: "youtube" as const,
    label: "YouTube",
    includeDomains: ["youtube.com"],
    buildQueries: (brief: StartupBrief) => [
      {
        focus: "category demos and reactions",
        query: `${brief.productName} ${brief.category} product demo, customer reaction, review, comparison, youtube`,
      },
      {
        focus: "creator storytelling",
        query: `${brief.category} before after transformation, daily use, review, youtube`,
      },
      {
        focus: "comment language and objections",
        query: `${brief.category} youtube comments objections, skepticism, what people praise or complain about`,
      },
    ],
  },
  // {
  //   source: "x" as const,
  //   label: "X",
  //   includeDomains: ["x.com", "twitter.com"],
  //   buildQueries: (brief: StartupBrief) => [
  //     {
  //       focus: "launch discourse",
  //       query: `${brief.productName} ${brief.targetAudience} public X posts from founders, launch reactions, quote tweets, replies, direct post links`,
  //     },
  //     {
  //       focus: "fundraising and market framing",
  //       query: `${brief.productName} ${brief.category} public X posts about market narrative, why now, investor reactions, direct post links`,
  //     },
  //     {
  //       focus: "high-engagement reactions",
  //       query: `${brief.category} public X posts with replies, quote tweets, objections, launch reactions, direct post links`,
  //     },
  //   ],
  // },
  {
    source: "web" as const,
    label: "Web",
    includeDomains: undefined,
    buildQueries: (brief: StartupBrief) => [
      {
        focus: "competitor positioning",
        query: `${brief.productName} ${brief.category} competitors, positioning gaps, category framing, market narrative, launch messaging`,
      },
      {
        focus: "buyer language",
        query: `${brief.targetAudience} ${brief.category} buying criteria, objections, alternatives, use cases`,
      },
      {
        focus: "proof points and reviews",
        query: `${brief.category} reviews, testimonials, case studies, why people buy, objections before purchase`,
      },
    ],
  },
];

export function getExaClient() {
  if (!process.env.EXA_API_KEY) {
    throw new Error("Missing EXA_API_KEY. Add it to your environment.");
  }

  return new Exa(process.env.EXA_API_KEY);
}

function normalizeResult(
  result: {
    title?: string | null;
    url?: string;
    publishedDate?: string;
    text?: string;
  },
  source: PlannedResearchSource["source"],
) {
  const rawUrl = result.url ?? "";
  const url =
    source === "reddit"
      ? normalizeRedditPostUrl(rawUrl)
      : source === "x"
        ? normalizeXPostUrl(rawUrl)
        : rawUrl;

  return {
    title: result.title ?? "Untitled result",
    url,
    publishedDate: result.publishedDate,
    text: result.text?.slice(0, 900),
  } satisfies SourceResult;
}

function normalizeXPostUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const parsed = (() => {
    try {
      return new URL(trimmed);
    } catch {
      return null;
    }
  })();

  if (!parsed) {
    return "";
  }

  const host = parsed.hostname.toLowerCase();
  if (
    !(
      host === "x.com" ||
      host.endsWith(".x.com") ||
      host === "twitter.com" ||
      host.endsWith(".twitter.com")
    )
  ) {
    return "";
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 3 || segments[1] !== "status") {
    return "";
  }

  const username = segments[0]?.trim();
  const postId = segments[2]?.trim();

  if (!username || !postId || !/^\d+$/.test(postId)) {
    return "";
  }

  return `https://x.com/${username}/status/${postId}`;
}

function getDeepSearchSystemPrompt(source: PlannedResearchSource["source"]) {
  if (source !== "x") {
    return undefined;
  }

  return [
    "Return only direct X post evidence.",
    "Prefer canonical x.com/<user>/status/<id> or twitter.com/<user>/status/<id> URLs.",
    "Exclude blogs, newsletters, link roundups, analytics tools, and articles that only discuss posts.",
    "If no direct X post URL supports a candidate insight, omit that insight.",
  ].join(" ");
}

type DeepSearchGrounding = {
  citations?: Array<{
    title?: string;
    url?: string;
  }>;
  field?: string;
};

function getGroundedInsightCitation(args: {
  grounding?: DeepSearchGrounding[];
  index: number;
  source: PlannedResearchSource["source"];
}) {
  const relevantEntries =
    args.grounding?.filter((entry) =>
      entry.field?.startsWith(`insights[${args.index}]`),
    ) ?? [];

  for (const entry of relevantEntries) {
    for (const citation of entry.citations ?? []) {
      const url =
        args.source === "x"
          ? normalizeXPostUrl(citation.url ?? "")
          : args.source === "reddit"
            ? normalizeRedditPostUrl(citation.url ?? "")
            : (citation.url ?? "");

      if (!url) {
        continue;
      }

      return {
        title: citation.title,
        url,
      };
    }
  }

  return null;
}

function normalizeRedditPostUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const parsed = (() => {
    try {
      return new URL(trimmed);
    } catch {
      return null;
    }
  })();

  if (!parsed) {
    return "";
  }

  const host = parsed.hostname.toLowerCase();

  if (!host.endsWith("reddit.com")) {
    return "";
  }

  const segments = parsed.pathname
    .replace(/\.json$/i, "")
    .split("/")
    .filter(Boolean);
  const commentsIndex = segments.findIndex((segment) =>
    /^comments?$/i.test(segment),
  );

  if (commentsIndex === -1 || commentsIndex + 1 >= segments.length) {
    return "";
  }

  const postId = segments[commentsIndex + 1]?.replace(/\.json$/i, "").trim();

  if (!postId) {
    return "";
  }

  const subreddit =
    commentsIndex >= 2 && /^r$/i.test(segments[commentsIndex - 2])
      ? segments[commentsIndex - 1]
      : "";
  const slug = segments[commentsIndex + 2]?.replace(/\.json$/i, "").trim();
  const normalizedPath = subreddit
    ? `/r/${subreddit}/comments/${postId}${slug ? `/${slug}` : ""}`
    : `/comments/${postId}${slug ? `/${slug}` : ""}`;

  return `https://www.reddit.com${normalizedPath}`;
}

export async function researchSource(
  exa: Exa,
  brief: StartupBrief,
  config: (typeof sourceConfigs)[number],
) {
  const plannedSource = buildResearchPlan(brief).find(
    (entry) => entry.source === config.source,
  );

  if (!plannedSource) {
    throw new Error(`Missing research plan for ${config.source}.`);
  }

  const curated = await runPlannedSourceResearch(
    exa,
    plannedSource,
    config.includeDomains,
  );

  return curated.curatedBucket;
}

export function buildResearchPlan(
  brief: StartupBrief,
): PlannedResearchSource[] {
  return sourceConfigs.map((config) => ({
    source: config.source,
    label: config.label,
    queries: config.buildQueries(brief),
  }));
}

function dedupeResults(results: SourceResult[]) {
  const seen = new Set<string>();
  const deduped: SourceResult[] = [];

  for (const result of results) {
    const key = `${result.url}::${result.title}`;

    if (!result.url || seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(result);
  }

  return deduped;
}

function dedupeInsights(insights: SourceInsight[]) {
  const seen = new Set<string>();
  const deduped: SourceInsight[] = [];

  for (const insight of insights) {
    const key =
      `${insight.signal}::${insight.url}::${insight.quoteOrExcerpt}`.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(insight);
  }

  return deduped;
}

const EMOTIONAL_LANGUAGE = [
  "guilty",
  "frustrated",
  "annoyed",
  "hate",
  "love",
  "wish",
  "afraid",
  "embarrassed",
  "anxious",
  "waste",
  "expensive",
  "disappointed",
];

const META_CONTENT_PATTERNS = [
  /how to write/i,
  /copywriting/i,
  /title formula/i,
  /thumbnail/i,
  /viral hooks/i,
  /marketing tips/i,
  /attention-grabbing/i,
];

function countMatches(text: string, patterns: string[]) {
  const lower = text.toLowerCase();
  return patterns.reduce(
    (count, pattern) => count + (lower.includes(pattern) ? 1 : 0),
    0,
  );
}

function isMetaContent(text: string) {
  return META_CONTENT_PATTERNS.some((pattern) => pattern.test(text));
}

function getInsightStrength(insight: SourceInsight) {
  const combined = `${insight.signal} ${insight.evidence} ${insight.quoteOrExcerpt} ${insight.sourceTitle}`;
  let score = 3;

  if (
    insight.focus.includes("pain") ||
    insight.focus.includes("objection") ||
    insight.focus.includes("buyer") ||
    insight.focus.includes("competitor")
  ) {
    score += 2;
  }

  if (insight.quoteOrExcerpt.length >= 90) {
    score += 1;
  }

  score += Math.min(2, countMatches(combined, EMOTIONAL_LANGUAGE));

  if (
    /(vs\.?|alternative|switch|compare|comparison|instead of)/i.test(combined)
  ) {
    score += 2;
  }

  if (insight.publishedDate) {
    const year = new Date(insight.publishedDate).getFullYear();
    if (!Number.isNaN(year) && year >= 2023) {
      score += 1;
    }
  }

  if (isMetaContent(combined)) {
    score -= 4;
  }

  if (insight.quoteOrExcerpt.length < 40) {
    score -= 1;
  }

  return Math.max(1, Math.min(10, score));
}

function getResultStrength(result: SourceResult, focus: string) {
  const combined = `${result.title} ${result.text ?? ""}`;
  let score = 2;

  if (
    focus.includes("pain") ||
    focus.includes("objection") ||
    focus.includes("buyer") ||
    focus.includes("competitor")
  ) {
    score += 2;
  }

  if (result.text && result.text.length >= 220) {
    score += 1;
  }

  score += Math.min(2, countMatches(combined, EMOTIONAL_LANGUAGE));

  if (
    /(review|comparison|vs\.?|alternative|complaint|reaction|objection)/i.test(
      combined,
    )
  ) {
    score += 2;
  }

  if (isMetaContent(combined)) {
    score -= 4;
  }

  return score;
}

function rankInsights(insights: SourceInsight[]) {
  return [...insights].sort((left, right) => {
    const strengthDelta =
      (right.signalStrength ?? getInsightStrength(right)) -
      (left.signalStrength ?? getInsightStrength(left));

    if (strengthDelta !== 0) {
      return strengthDelta;
    }

    return right.quoteOrExcerpt.length - left.quoteOrExcerpt.length;
  });
}

function rankResults(results: Array<{ focus: string; result: SourceResult }>) {
  return [...results].sort(
    (left, right) =>
      getResultStrength(right.result, right.focus) -
      getResultStrength(left.result, left.focus),
  );
}

export async function runPlannedSourceResearch(
  exa: Exa,
  plannedSource: PlannedResearchSource,
  includeDomains?: string[],
  throwIfStopped?: () => void | Promise<void>,
) {
  const queryRuns = [] as Array<{
    focus: string;
    insights: SourceInsight[];
    query: string;
    results: SourceResult[];
  }>;

  for (const plannedQuery of plannedSource.queries) {
    await throwIfStopped?.();
    const response = await exa.search(plannedQuery.query, {
      type: "deep",
      numResults: 6,
      includeDomains,
      systemPrompt: getDeepSearchSystemPrompt(plannedSource.source),
      contents: {
        text: { maxCharacters: 5000 },
      },
      outputSchema: researchSchema,
    });
    await throwIfStopped?.();

    const structured = response.output?.content as
      | { insights?: SourceInsight[] }
      | undefined;
    const grounding = response.output?.grounding as
      | DeepSearchGrounding[]
      | undefined;

    const normalizedResults = (
      (response.results ?? []) as Array<{
        title?: string | null;
        url?: string;
        publishedDate?: string;
        text?: string;
      }>
    )
      .map((result) => normalizeResult(result, plannedSource.source))
      .filter((result) => Boolean(result.url));
    const fallbackResult = normalizedResults[0];

    queryRuns.push({
      focus: plannedQuery.focus,
      insights:
        structured?.insights
          ?.slice(0, 5)
          .reduce<SourceInsight[]>((acc, insight, index) => {
            const groundedCitation = getGroundedInsightCitation({
              grounding,
              index,
              source: plannedSource.source,
            });
            const normalizedInsightUrl =
              plannedSource.source === "reddit"
                ? normalizeRedditPostUrl(insight.url || "")
                : plannedSource.source === "x"
                  ? normalizeXPostUrl(insight.url || "")
                  : insight.url || "";
            const resolvedUrl =
              groundedCitation?.url ||
              normalizedInsightUrl ||
              fallbackResult?.url ||
              "";
            const resolvedTitle =
              groundedCitation?.title ||
              insight.sourceTitle ||
              fallbackResult?.title ||
              "Untitled source";
            const resolvedInsight = {
              ...insight,
              focus: insight.focus || plannedQuery.focus,
              sourceTitle: resolvedTitle,
              url: resolvedUrl,
              quoteOrExcerpt:
                insight.quoteOrExcerpt ||
                fallbackResult?.text?.slice(0, 280) ||
                insight.evidence,
              publishedDate:
                insight.publishedDate || fallbackResult?.publishedDate,
            } satisfies SourceInsight;

            if (plannedSource.source === "x" && !resolvedInsight.url) {
              return acc;
            }

            acc.push({
              ...resolvedInsight,
              signalStrength: getInsightStrength(resolvedInsight),
            });

            return acc;
          }, []) ?? [],
      query: plannedQuery.query,
      results: normalizedResults,
    });
  }

  const curatedBucket = {
    source: plannedSource.source,
    label: plannedSource.label,
    query: plannedSource.queries
      .map((query) => `${query.focus}: ${query.query}`)
      .join("\n"),
    insights: rankInsights(
      dedupeInsights(
        queryRuns.flatMap((run) =>
          run.insights.map((insight) => ({
            ...insight,
            focus: run.focus,
            whyItMatters: `${run.focus}: ${insight.whyItMatters}`,
            signalStrength:
              insight.signalStrength ?? getInsightStrength(insight),
          })),
        ),
      ),
    ).slice(0, 8),
    results: dedupeResults(
      rankResults(
        queryRuns.flatMap((run) =>
          run.results.map((result) => ({ focus: run.focus, result })),
        ),
      ).map((entry) => entry.result),
    ).slice(0, 10),
  } satisfies ResearchBucket;

  return {
    curatedBucket,
    queryRuns,
  };
}

export function curateEvidenceBundle(args: {
  plannedSources: PlannedResearchSource[];
  retrievalRuns: Array<{
    curatedBucket: ResearchBucket;
    queryRuns: Array<{
      focus: string;
      insights: SourceInsight[];
      query: string;
      results: SourceResult[];
    }>;
  }>;
}) {
  return {
    curatedResearch: args.retrievalRuns.map((entry) => entry.curatedBucket),
    plannedSources: args.plannedSources,
    retrievalSummary: args.retrievalRuns.flatMap((entry) =>
      entry.queryRuns.map((queryRun) => ({
        query: queryRun.query,
        resultCount: queryRun.results.length,
        source: entry.curatedBucket.source,
      })),
    ),
  } satisfies CuratedEvidenceBundle;
}
