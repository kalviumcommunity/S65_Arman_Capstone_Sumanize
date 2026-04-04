import type { StartupBrief } from "@/types/launch";

export type FormSection = {
  id: string;
  label: string;
  number: string;
};

export type FieldDef = {
  key: keyof StartupBrief;
  label: string;
  hint: string;
  section: string;
  type: "input" | "textarea" | "select";
  required: boolean;
  /** 1 = half-width in the 2-col grid, 2 = full-width row */
  span: 1 | 2;
};

export type IndexedFieldDef = FieldDef & { stepNumber: number };

export type SectionWithFields = FormSection & { fields: IndexedFieldDef[] };

export const FORM_SECTIONS: FormSection[] = [
  { id: "identity", label: "Identity", number: "01" },
  { id: "audience", label: "Audience", number: "02" },
  { id: "outcome", label: "Outcome", number: "03" },
];

const FORM_FIELDS: FieldDef[] = [
  {
    key: "companyName",
    label: "Company Name",
    hint: "The legal or brand name of your company",
    section: "identity",
    type: "input",
    required: true,
    span: 1,
  },
  {
    key: "productName",
    label: "Product Name",
    hint: "What you call the product publicly",
    section: "identity",
    type: "input",
    required: true,
    span: 1,
  },
  {
    key: "productDescription",
    label: "Product Description",
    hint: "A concise elevator pitch — what does it do and who cares?",
    section: "identity",
    type: "textarea",
    required: true,
    span: 2,
  },
  {
    key: "targetAudience",
    label: "Target Audience",
    hint: "Be specific — job title, persona, or community",
    section: "audience",
    type: "input",
    required: true,
    span: 2,
  },
  {
    key: "category",
    label: "Category / Niche",
    hint: "The market category or vertical you compete in",
    section: "audience",
    type: "input",
    required: true,
    span: 1,
  },
  {
    key: "fundingStage",
    label: "Funding Stage",
    hint: "Helps calibrate the research depth and angles",
    section: "audience",
    type: "select",
    required: true,
    span: 1,
  },
  {
    key: "desiredOutcome",
    label: "Desired Outcome",
    hint: "The perception shift or action you want from your audience",
    section: "outcome",
    type: "input",
    required: false,
    span: 1,
  },
  {
    key: "launchGoal",
    label: "Launch Goal",
    hint: "One clear metric or milestone this launch targets",
    section: "outcome",
    type: "input",
    required: false,
    span: 1,
  },
];

export const SECTIONS_WITH_FIELDS: SectionWithFields[] = (() => {
  let idx = 0;
  return FORM_SECTIONS.map((section) => ({
    ...section,
    fields: FORM_FIELDS.filter((f) => f.section === section.id).map((f) => ({
      ...f,
      stepNumber: ++idx,
    })),
  }));
})();

export const TOTAL_FIELDS = FORM_FIELDS.length;

export function getSectionProgress(
  sectionId: string,
  brief: StartupBrief,
): { filled: number; total: number } {
  const section = SECTIONS_WITH_FIELDS.find((s) => s.id === sectionId);
  if (!section) return { filled: 0, total: 0 };
  const filled = section.fields.filter(
    (f) => brief[f.key].trim().length > 0,
  ).length;
  return { filled, total: section.fields.length };
}

export function getTotalFilled(brief: StartupBrief): number {
  return FORM_FIELDS.filter((f) => brief[f.key].trim().length > 0).length;
}
