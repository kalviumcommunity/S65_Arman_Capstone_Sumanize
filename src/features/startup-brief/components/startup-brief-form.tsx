"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldCard } from "@/features/startup-brief/components/field-card";
import { FundingStageSelect } from "@/features/startup-brief/components/funding-stage-select";
import { SECTIONS_WITH_FIELDS } from "@/features/startup-brief/constants/form-fields";
import { riseInItem, staggerContainer } from "@/lib/motion";
import type { StartupBrief } from "@/types/launch";

export function StartupBriefForm({
  brief,
  isSubmitting = false,
  onFieldChange,
  onSubmit,
}: {
  brief: StartupBrief;
  isSubmitting?: boolean;
  onFieldChange: <K extends keyof StartupBrief>(
    key: K,
    value: StartupBrief[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;

  return (
    <motion.form
      onSubmit={onSubmit}
      className="w-full pb-8"
      variants={staggerContainer(reduceMotion, 0.06)}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="space-y-10"
        variants={staggerContainer(reduceMotion)}
      >
        {SECTIONS_WITH_FIELDS.map((section) => (
          <motion.div
            key={section.id}
            className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2"
            variants={riseInItem(reduceMotion, 14)}
          >
            {section.fields.map((field) => (
              <motion.div
                key={field.key}
                className={field.span === 2 ? "sm:col-span-2" : ""}
                variants={riseInItem(reduceMotion, 12)}
              >
                <FieldCard
                  id={`field-${field.key}`}
                  label={field.label}
                  hint={field.hint}
                  required={field.required}
                >
                  {field.type === "textarea" ? (
                    <Textarea
                      className="min-h-[100px]"
                      onChange={(e) => onFieldChange(field.key, e.target.value)}
                      required={field.required}
                      value={brief[field.key]}
                    />
                  ) : field.type === "select" ? (
                    <FundingStageSelect
                      onChange={(value) => onFieldChange(field.key, value)}
                      value={brief[field.key]}
                    />
                  ) : (
                    <Input
                      onChange={(e) => onFieldChange(field.key, e.target.value)}
                      required={field.required}
                      value={brief[field.key]}
                    />
                  )}
                </FieldCard>
              </motion.div>
            ))}
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="sticky bottom-0 flex justify-end bg-background/95 py-4 backdrop-blur-sm"
        variants={riseInItem(reduceMotion, 8)}
      >
        <Button
          size="lg"
          type="submit"
          className="gap-2 px-5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Starting research…" : "Get Started"}
          <ArrowRight size={16} weight="bold" />
        </Button>
      </motion.div>
    </motion.form>
  );
}
