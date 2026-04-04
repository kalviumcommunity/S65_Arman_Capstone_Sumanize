import type { ReactNode } from "react";
import { SectionHeading } from "@/components/shared/section-heading";

export function StartupBriefSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <SectionHeading title={title} />
      {children}
    </section>
  );
}
