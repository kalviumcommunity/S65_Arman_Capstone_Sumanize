export const researchSchema = {
  type: "object",
  required: ["insights"] as string[],
  properties: {
    insights: {
      type: "array",
      description: "High-signal research findings pulled from this source.",
      items: {
        type: "object",
        required: [
          "signal",
          "evidence",
          "whyItMatters",
          "focus",
          "sourceTitle",
          "url",
          "quoteOrExcerpt",
        ],
        properties: {
          focus: {
            type: "string",
            description: "Which planned query focus this finding came from.",
          },
          signal: {
            type: "string",
            description: "Pattern, pain point, or hook worth using.",
          },
          evidence: {
            type: "string",
            description: "Short grounded evidence from the web results.",
          },
          sourceTitle: {
            type: "string",
            description: "Title of the source that best supports this finding.",
          },
          url: {
            type: "string",
            description: "Canonical URL for the supporting source.",
          },
          quoteOrExcerpt: {
            type: "string",
            description:
              "Exact quote or excerpt from the source. Prefer verbatim language over summaries.",
          },
          publishedDate: {
            type: "string",
            description: "Published date for the source when available.",
          },
          whyItMatters: {
            type: "string",
            description: "Why this is useful for a launch script or campaign.",
          },
        },
      },
    },
  },
} as const;
