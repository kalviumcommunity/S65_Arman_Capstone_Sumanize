"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  BookmarkSimple,
  Buildings,
  Globe,
  Lightning,
  Pulse,
  Target,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";



import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LANDING_SECTION_MAX_WIDTH } from "@/lib/landing-layout";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export default function FeaturesMetrics() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  function getHeadingTransition(delay = 0.08, duration = 0.75) {
    if (shouldReduceMotion) {
      return { duration: 0 };
    }
    return { delay, duration, ease: EASE_OUT };
  }

  return (
    <section
      ref={sectionRef}
      className="bg-zinc-50 px-6 py-16 sm:px-8 md:py-32 lg:px-12 dark:bg-transparent"
    >
      <div className={cn("mx-auto w-full", LANDING_SECTION_MAX_WIDTH)}>
        <motion.div
          className="mb-16 text-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={getHeadingTransition(0.08, 0.75)}
        >
          <h2 className="mx-auto max-w-[720px] text-[2.1rem] leading-[1.06] font-medium tracking-[-0.06em] text-foreground sm:text-[2.75rem] lg:text-[3.4rem]">
            Performance you can measure.
          </h2>
          <p className="mx-auto mt-6 max-w-[600px] text-base leading-7 font-medium tracking-[-0.03em] text-muted-foreground">
            Uptime, latency, and intelligence coverage at a glance—so you know
            the system is fast, reliable, and ready when your brief turns into a
            research run.
          </p>
        </motion.div>

        <div className="mx-auto grid gap-4 lg:grid-cols-2">
          {/* Metric Card 1 - Blue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <FeatureCard>
              <CardHeader className="pb-3">
                <CardHeading
                  icon={Pulse}
                  title="Real-time Performance"
                  description="99.9% Uptime Guaranteed"
                />
              </CardHeader>

              <CardContent className="pb-6">
                <div className="relative border-t border-dashed max-sm:mb-6">
                  <div
                    aria-hidden
                    className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,var(--color-blue-600),var(--color-white)_100%)]"
                  />
                  <div className="relative p-8 flex flex-col items-center justify-center">
                    {isInView && (
                      <MetricGauge percentage={99.9} label="System Uptime" />
                    )}
                  </div>
                </div>
              </CardContent>
            </FeatureCard>
          </motion.div>

          {/* Metric Card 2 - Right Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <FeatureCard>
              <CardHeader className="pb-3">
                <CardHeading
                  icon={Lightning}
                  title="Lightning Fast"
                  description="Sub-100ms Response Times"
                />
              </CardHeader>

              <CardContent className="pb-6">
                <div className="relative border-t border-dashed max-sm:mb-6">
                  <div
                    aria-hidden
                    className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_100%,transparent_40%,var(--color-yellow-500),var(--color-white)_100%)]"
                  />
                  <div className="relative p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Avg Response Time
                        </span>
                        {isInView && (
                          <AnimatedNumber
                            value={87}
                            suffix="ms"
                            className="text-xl font-semibold"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Max Response Time
                        </span>
                        {isInView && (
                          <AnimatedNumber
                            value={142}
                            suffix="ms"
                            className="text-lg font-semibold"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Queries/Second
                        </span>
                        {isInView && (
                          <AnimatedNumber
                            value={15420}
                            suffix=" ops"
                            className="text-lg font-semibold"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </FeatureCard>
          </motion.div>

          {/* Full Width Card - Intelligence Capabilities */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <FeatureCard className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1.5">
                  Deep Intelligence Coverage
                </h3>
                <p className="text-muted-foreground text-sm max-w-2xl">
                  Harness global research sources and AI-powered analysis to
                  uncover market signals and competitive insights.
                </p>
              </div>

              {/* Intelligence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isInView && (
                  <>
                    <IntelligenceCard
                      icon={Globe}
                      title="Global Coverage"
                      description="25+ markets and regions"
                      metric="150+"
                      metricLabel="sources"
                    />
                    <IntelligenceCard
                      icon={Buildings}
                      title="Competitive Intel"
                      description="Track market players"
                      metric="500+"
                      metricLabel="analyzed"
                    />
                    <IntelligenceCard
                      icon={BookmarkSimple}
                      title="Signal Mapping"
                      description="Customer pain points"
                      metric="1000+"
                      metricLabel="signals"
                    />
                    <IntelligenceCard
                      icon={Target}
                      title="Launch Angles"
                      description="Positioning frameworks"
                      metric="48"
                      metricLabel="templates"
                    />
                  </>
                )}
              </div>
            </FeatureCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  children: ReactNode;
  className?: string;
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
  <Card
    className={cn(
      "group relative rounded-md shadow-zinc-950/5 transition-all duration-300 hover:shadow-lg overflow-hidden",
      className,
    )}
  >
    {children}
  </Card>
);

interface CardHeadingProps {
  icon: Icon;
  title: string;
  description: string;
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
  <div className="p-6">
    <span className="text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase">
      <Icon className="size-4" weight="bold" />
      {title}
    </span>
    <p className="mt-4 text-xl font-semibold tracking-tight">{description}</p>
  </div>
);

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  className?: string;
}

const AnimatedNumber = ({
  value,
  suffix = "",
  className,
}: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const increment = value / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

interface MetricGaugeProps {
  percentage: number;
  label: string;
}

const MetricGauge = ({ percentage, label }: MetricGaugeProps) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const increment = percentage / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= percentage) {
        setDisplayPercentage(percentage);
        clearInterval(timer);
      } else {
        setDisplayPercentage(Number(current.toFixed(1)));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [percentage]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-20">
        <svg
          className="size-full transform -rotate-90"
          viewBox="0 0 100 100"
          role="img"
          aria-label="uptime gauge"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${282 * (displayPercentage / 100)} 282`}
            className="text-primary transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold">{displayPercentage}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};

interface IntelligenceCardProps {
  icon: Icon;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}

const IntelligenceCard = ({
  icon: Icon,
  title,
  description,
  metric,
  metricLabel,
}: IntelligenceCardProps) => (
  <div className="rounded-lg border border-border/50 p-4 bg-card/50 backdrop-blur-sm transition-all duration-300">
    <div className="flex items-start justify-between mb-3">
      <Icon className="size-5 text-foreground/70" weight="fill" />
    </div>
    <div className="space-y-2">
      <div>
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-tight">
          {description}
        </p>
      </div>
      <div className="pt-2 border-t border-border/30">
        <p className="text-xl font-bold">{metric}</p>
        <p className="text-xs text-muted-foreground font-medium leading-tight">
          {metricLabel}
        </p>
      </div>
    </div>
  </div>
);
