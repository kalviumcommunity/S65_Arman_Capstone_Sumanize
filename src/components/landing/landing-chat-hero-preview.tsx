"use client";

import {
  ArrowUUpLeftIcon,
  CaretDown,
  CaretRight,
  CheckIcon,
  CubeIcon,
  Globe,
  GlobeSimpleIcon,
  Plus,
  SignOut,
  Timer,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LaunchPackageStructuredView } from "@/features/launch-chat/components/package-view/launch-package-structured-view";
import {
  sourceMeta,
  sourceOrder,
} from "@/features/launch-chat/constants/source-meta";
import { cn } from "@/lib/utils";
import type { LaunchPackage } from "@/types/launch";

const DEMO_PACKAGE: LaunchPackage = {
  strategicAngle:
    "Fieldstone brings the independent bookshop back to neighborhoods that lost theirs\u2014curated picks, community events, and a human story no delivery box can replace.",
  launchScript: {
    headline: "The Bookshop That Comes to You.",
    hook: "Remember the quiet hum of your town\u2019s old bookstore? Fieldstone brings that feeling back\u2014on wheels, with curated shelves and membership perks that keep readers coming back.",
    bodyBeats: [
      "We park a converted vintage truck in underserved neighborhoods, rural towns, and mid-sized cities. Each stop is a curated pop-up: staff picks, local authors, and seasonal collections.",
      "Membership covers reserved drops, early access to events, and a quarterly book box\u2014so repeat visits feel like belonging, not a one-off sale.",
      "Prime delivery is fast; Fieldstone is restorative. We compete on trust, taste, and place\u2014not speed alone.",
    ],
    ctaOptions: [
      "Reserve your neighborhood stop\u2014join the waitlist",
      "Become a founding member\u2014early bird pricing",
    ],
  },
  hookOptions: [
    "Remember the quiet hum of your town\u2019s old bookstore? Fieldstone brings that feeling back\u2014on wheels, with curated shelves and membership perks that keep readers coming back.",
    "Amazon delivers boxes. Fieldstone delivers belonging. A curated mobile bookshop that parks in your neighborhood and stays until you\u2019ve found the perfect read.",
    "There are 3,000 fewer independent bookstores in America than there were in 2000. Fieldstone is building the next 3,000\u2014one neighborhood at a time.",
    "Your city lost its bookstore. We\u2019re bringing it back\u2014not in a strip mall, but in a converted vintage truck, staffed by readers who know your name.",
  ],
  researchSignals: [
    "Book desert: 30% of US counties lack a single bookstore within reasonable driving distance",
    "Membership model: subscription commerce in media verticals shows 40%+ retention at 12 months",
    "Community premium: consumers pay 15\u201325% more for locally curated vs algorithmic recommendations",
    "Mobile retail: pop-up and mobile retail saw 23% YoY growth post-pandemic in underserved markets",
    "BookTok fatigue: rising sentiment for slow reading and offline discovery in reader communities",
  ],
  contentStrategy: {
    positioning:
      "Fieldstone is the neighborhood bookshop reimagined for a delivery-first world\u2014mobile, membership-driven, and rooted in community trust over algorithmic convenience.",
    campaignMoves: [
      "Partner with 5 local authors in launch cities for co-branded pop-up events",
      "Run a \u2018What did your bookstore mean to you?\u2019 story campaign on social",
      "Launch founding member waitlist with early-bird pricing and city vote",
    ],
    channelPlan: [
      "Instagram and TikTok: weekly \u2018truck diary\u2019 video series showing stops, readers, and picks",
      "Newsletter: curated monthly reading list with member-only first editions",
      "Local press: pitch human-interest angle to city papers in launch markets",
    ],
  },
  fundraisingAngles: [
    "Market timing: indie retail renaissance meets subscription commerce\u2014Fieldstone sits at the intersection of two accelerating trends",
    "Unit economics: mobile format eliminates fixed lease costs while maintaining premium AOV through curated selection",
    "Community moat: each neighborhood stop builds local loyalty that no digital-first competitor can replicate",
    "Expansion playbook: asset-light model scales city-by-city with minimal capex per new market",
  ],
  nextMoves: [
    "Finalize first three launch cities based on book desert data and waitlist density",
    "Secure vintage truck conversion partner and design the branded mobile experience",
    "Open founding member waitlist with referral incentives and city unlock thresholds",
    "Build publisher relationships for exclusive early access and local author partnerships",
    "Plan grand opening weekend with local press, social coverage, and community event",
  ],
};

const DEMO_MARKDOWN = `## Strategic Angle

Fieldstone brings the independent bookshop back to neighborhoods that lost theirs\u2014curated picks, community events, and a human story no delivery box can replace.

---

## Launch Script
**Headline:** The Bookshop That Comes to You.

**Hook:** Remember the quiet hum of your town\u2019s old bookstore? Fieldstone brings that feeling back\u2014on wheels, with curated shelves and membership perks that keep readers coming back.

---

- We park a converted vintage truck in underserved neighborhoods, rural towns, and mid-sized cities. Each stop is a curated pop-up: staff picks, local authors, and seasonal collections.
- Membership covers reserved drops, early access to events, and a quarterly book box\u2014so repeat visits feel like belonging, not a one-off sale.
- Prime delivery is fast; Fieldstone is restorative. We compete on trust, taste, and place\u2014not speed alone.

**CTA Options:**
- Reserve your neighborhood stop\u2014join the waitlist
- Become a founding member\u2014early bird pricing`;

const PIPELINE_LABELS = [
  "Intake",
  "Research Planning",
  "Source Retrieval",
  "Evidence Curation",
  "Synthesis Agent",
  "Hook Agent",
  "Package Draft",
  "QA Check",
  "Finalized",
] as const;

const SOURCE_ROWS: Record<
  (typeof sourceOrder)[number],
  { subtitle: string; titles: string[] }
> = {
  reddit: {
    subtitle: "customer pain, community threads…",
    titles: [
      "Why indie bookstores still matter in 2026",
      "r/smallbusiness — pop-up retail lessons",
      "How r/books talks about Amazon vs local shops",
      "Book deserts and what readers actually miss",
      "AMA: running a mobile retail book pop-up",
    ],
  },
  youtube: {
    subtitle: "category demos, booktube…",
    titles: [
      "Pros and Cons of Substack for Writers",
      "Bookshop.org vs Amazon: what readers choose",
      "Libro.fm vs Audible — indie audio deep dive",
      "BookTube tour: smallest towns, biggest TBRs",
      "Retail math for niche subscription boxes",
    ],
  },
  x: {
    subtitle: "launch buzz, reader sentiment…",
    titles: [
      "Thread: what killed your local bookstore?",
      "Readers who want curation, not algorithms",
      "Indie publishers betting on IRL community again",
      "BookTok fatigue vs slow reading clubs",
      "Quote-tweet storm on “same-day delivery isn’t culture”",
    ],
  },
  web: {
    subtitle: "competitors, membership models…",
    titles: [
      "Why you should switch to Libro.fm",
      "Independent bookseller associations — trends",
      "Bookshop.org affiliate program overview 2026",
      "Case study: mobile retail in rural counties",
      "Membership commerce benchmarks for media brands",
    ],
  },
};

export function LandingChatHeroPreview() {
  const total = PIPELINE_LABELS.length;
  const focusIdx = total - 1;

  return (
    <section
      aria-label="Demo preview of the research chat interface"
      className="relative w-full overflow-hidden rounded-[10px] border border-border/50 bg-background text-start shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)]"
    >
      <div
        className={cn(
          /* Taller than 16:9 so the preview has more vertical room */
          "aspect-[16/10] w-full overflow-y-auto overscroll-contain",
        )}
      >
        <div className="flex min-h-full min-w-0 flex-col bg-background">
          {/* App header (static) */}
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <span className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                <Globe
                  size={18}
                  weight="duotone"
                  className="shrink-0 text-primary"
                />
                Research Agent
              </span>
              <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/70 bg-transparent px-2.5 text-xs font-medium text-foreground">
                <Plus size={16} weight="bold" aria-hidden />
                New startup
              </span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={(e) => e.preventDefault()}
              >
                <ArrowUUpLeftIcon size={16} weight="bold" aria-hidden />
                Restart
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={(e) => e.preventDefault()}
              >
                <CheckIcon size={16} weight="bold" aria-hidden />
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Sign out"
                onClick={(e) => e.preventDefault()}
              >
                <SignOut size={18} />
              </Button>
            </div>
          </header>

          <div>
            <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-5 sm:py-5 lg:px-8">
              {/* StartupBriefCard */}
              <section className="mb-5">
                <Card className="gap-0 p-6 shadow-md shadow-black/20 ring-1 ring-foreground/8 sm:p-8">
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    Startup brief
                  </p>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="text-lg font-medium text-foreground/95 sm:text-xl">
                        Fieldstone
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Fieldstone Press in independent publishing, retail,
                        community culture, subscription commerce, events.
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                      Show full
                      <CaretDown size={14} className="shrink-0" />
                    </span>
                  </div>
                  <div className="mt-5">
                    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="flex gap-2 text-sm leading-relaxed">
                        <span className="shrink-0 text-muted-foreground">
                          Company:
                        </span>
                        <span className="min-w-0 text-foreground/85">
                          Fieldstone Press
                        </span>
                      </div>
                      <div className="flex gap-2 text-sm leading-relaxed">
                        <span className="shrink-0 text-muted-foreground">
                          Product:
                        </span>
                        <span className="min-w-0 text-foreground/85">
                          Fieldstone
                        </span>
                      </div>
                      <div className="flex gap-2 text-sm leading-relaxed sm:col-span-2 xl:col-span-1">
                        <span className="shrink-0 text-muted-foreground">
                          Audience:
                        </span>
                        <span className="min-w-0 text-foreground/85">
                          Lifelong readers aged 30–65 in small cities and rural
                          areas seeking curation and community—not just
                          convenience.
                        </span>
                      </div>
                      <div className="flex gap-2 text-sm leading-relaxed sm:col-span-2 xl:col-span-3">
                        <span className="shrink-0 text-muted-foreground">
                          Category:
                        </span>
                        <span className="min-w-0 text-foreground/85">
                          Independent publishing, retail, community culture,
                          subscription commerce, events.
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* WorkflowTimeline (expanded, completed run) */}
              <section className="mb-5 select-none">
                <div className="flex w-full items-start gap-2 rounded-md py-1.5 text-left">
                  <CaretRight
                    size={12}
                    weight="bold"
                    className="shrink-0 rotate-90 text-muted-foreground/50"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Timer
                        size={16}
                        weight="fill"
                        className="shrink-0 text-[#a8cc7c]"
                      />
                      <h2 className="text-sm font-medium text-foreground/85">
                        Progress
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground/65">
                      Track each step as your research run moves forward.
                    </p>
                  </div>
                </div>
                <div className="relative mt-5 px-1.5">
                  <div className="relative flex h-5 items-center">
                    <div className="absolute inset-x-0 h-[1.5px] rounded-full bg-border/30" />
                    <div
                      className="absolute h-[1.5px] rounded-full bg-primary/50"
                      style={{ width: "100%" }}
                    />
                    {PIPELINE_LABELS.map((_, i) => {
                      const left = total <= 1 ? 50 : (i / (total - 1)) * 100;
                      const isLast = i === focusIdx;
                      return (
                        <div
                          key={PIPELINE_LABELS[i]}
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${left}%` }}
                        >
                          <div
                            className={cn(
                              "rounded-full transition-all duration-500",
                              isLast
                                ? "h-3 w-3 bg-chart-2"
                                : "h-2 w-2 bg-primary/70",
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 rounded-lg px-2 py-2 opacity-55 sm:px-3 sm:py-2.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-semibold tabular-nums leading-none text-muted-foreground/30">
                        {focusIdx}.
                      </span>
                      <span className="text-[13px] font-medium leading-snug text-muted-foreground/50">
                        QA Check
                      </span>
                    </div>
                    <p className="mt-1 pl-6 text-xs text-muted-foreground/30">
                      33s
                    </p>
                  </div>
                  <div className="flex-1 rounded-lg bg-muted/30 px-2 py-2 sm:px-3 sm:py-2.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-semibold tabular-nums leading-none text-primary">
                        {focusIdx + 1}.
                      </span>
                      <span className="text-[13px] font-medium leading-snug text-foreground/90">
                        Finalized
                      </span>
                    </div>
                    <p className="mt-1 pl-6 text-xs text-chart-2/70">0s</p>
                  </div>
                  <div className="flex-1" />
                </div>
              </section>

              {/* LaunchPackagePreviewCard */}
              <section className="mb-5">
                <div className="border-b border-border/40 pb-5">
                  <LaunchPackageStructuredView
                    pkg={DEMO_PACKAGE}
                    markdown={DEMO_MARKDOWN}
                  />
                </div>
              </section>

              {/* ResearchSourcesGrid */}
              <section className="mb-5 max-w-full select-none">
                <div className="flex w-full items-start gap-2 rounded-md py-1.5 text-left">
                  <CaretRight
                    size={12}
                    weight="bold"
                    className="shrink-0 rotate-90 text-muted-foreground/50"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <GlobeSimpleIcon
                        size={16}
                        weight="fill"
                        className="shrink-0 text-[#e394dc]"
                      />
                      <h2 className="text-sm font-medium text-foreground/85">
                        Sources
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground/65">
                      Review the live research inputs feeding this run.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-x-4 gap-y-1 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3">
                  {sourceOrder.map((key) => {
                    const meta = sourceMeta[key];
                    const Icon = meta.icon;
                    const row = SOURCE_ROWS[key];
                    return (
                      <div
                        key={key}
                        className="h-full max-w-full overflow-hidden border-b border-border/30 py-2.5 sm:py-3"
                      >
                        <div className="flex items-start gap-2.5 px-0.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/35">
                            <Icon
                              size={18}
                              weight="fill"
                              className={meta.iconClassName}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-foreground/85">
                              {meta.label}
                            </span>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/70">
                              {row.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 px-0.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <CaretRight
                              size={10}
                              weight="bold"
                              className="shrink-0"
                            />
                            Activity & insights
                          </span>
                        </div>
                        <div className="mt-2 flex max-w-full flex-wrap gap-1.5 px-0.5 pb-0.5">
                          {row.titles.map((title) => (
                            <span
                              key={title}
                              className="inline-block max-w-full truncate text-xs font-medium text-foreground/75"
                              title={title}
                            >
                              {title}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* RunArtifactsPanel (collapsed header only) */}
              <section className="mb-2 max-w-full select-none">
                <div className="flex w-full items-start gap-2 rounded-md py-1.5 text-left">
                  <CaretRight
                    size={12}
                    weight="bold"
                    className="shrink-0 text-muted-foreground/50"
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
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
