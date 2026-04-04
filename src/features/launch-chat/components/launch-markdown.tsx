"use client";

import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/** Shared with Launch Package (synthesis) and artifact markdown bodies. */
export const launchMarkdownComponents: Components = {
  hr() {
    return (
      <hr className="my-8 w-full border-0 border-t border-transparent bg-transparent bg-transparent" />
    );
  },
  pre({ children }) {
    return (
      <div className="my-3 rounded-lg border border-border/45 bg-muted/25 p-4 text-sm leading-relaxed text-foreground/90 [&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0 [&>code]:font-sans [&>code]:text-inherit">
        {children}
      </div>
    );
  },
  code({ className, children, ...rest }) {
    const isBlock = Boolean(className?.includes("language-"));
    if (isBlock) {
      return (
        <code
          className={cn(
            "block whitespace-pre-wrap font-sans text-[0.95em] leading-relaxed",
            className,
          )}
          {...rest}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[0.85em] font-medium text-accent"
        {...rest}
      >
        {children}
      </code>
    );
  },
};

const proseClass =
  "prose prose-invert prose-sm max-w-full break-words text-foreground prose-headings:mb-3 prose-headings:mt-6 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground first:prose-headings:mt-0 prose-p:my-2 prose-p:leading-7 prose-p:text-foreground/90 prose-strong:text-foreground prose-ul:my-3 prose-ul:list-disc prose-ul:pl-5 prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-1 prose-li:text-foreground/90 prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-base prose-pre:my-0 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:bg-transparent prose-pre:p-0 prose-hr:my-0 prose-hr:border-0 prose-hr:bg-transparent";

export function LaunchMarkdownBody({
  markdown,
  className,
  suffix,
}: {
  markdown: string;
  className?: string;
  /** e.g. streaming caret after body markdown */
  suffix?: ReactNode;
}) {
  return (
    <div className={cn(proseClass, className)}>
      <ReactMarkdown components={launchMarkdownComponents}>
        {markdown}
      </ReactMarkdown>
      {suffix}
    </div>
  );
}
