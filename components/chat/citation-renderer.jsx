import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MarkdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="mb-4 text-2xl font-bold" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="mb-3 text-xl font-semibold" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mb-3 text-lg font-semibold" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mb-4 list-disc space-y-3 pl-6" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mb-4 list-decimal space-y-3 pl-6" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a className="text-blue-400 hover:underline" {...props} />
  ),
  pre: ({ node, ...props }) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-white"
      {...props}
    />
  ),
  code: ({ node, ...props }) => (
    <code className="rounded bg-neutral-800 px-1.5 py-1" {...props} />
  ),
  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
};

/**
 * CitationRenderer - Renders AI response content with clickable citations
 * Optimized for bullet point summaries with citations
 */
export function CitationRenderer({ content, citations = [], onCitationClick }) {
  const [activeCitation, setActiveCitation] = useState(null);
  const [clickedCitation, setClickedCitation] = useState(null);

  console.log("CitationRenderer props:", {
    hasContent: !!content,
    citationsLength: citations.length,
    citations: citations.map((c) => ({
      id: c.id,
      isMatched: c.isMatched,
      confidence: c.confidence,
    })),
  });

  if (!citations || citations.length === 0) {
    console.log("No citations found, rendering plain markdown");
    return (
      <ReactMarkdown components={MarkdownComponents}>{content}</ReactMarkdown>
    );
  }

  // Create a map of citation IDs for quick lookup
  const citationMap = new Map();
  citations.forEach((citation) => {
    citationMap.set(citation.id, citation);
  });

  const handleCitationClick = (citationId, citation) => {
    console.log("Citation clicked in renderer:", { citationId, citation });
    setActiveCitation(citationId === activeCitation ? null : citationId);
    setClickedCitation(citationId);

    // Clear the clicked state after a short delay to show visual feedback
    setTimeout(() => setClickedCitation(null), 300);

    if (onCitationClick && citation) {
      onCitationClick(citation, citationId);
    }
  };

  // Process content with citations - handle both string and array children
  const processTextWithCitations = (text) => {
    if (typeof text !== "string") {
      // If it's not a string, try to extract text from React elements
      if (React.isValidElement(text)) {
        return text;
      }
      if (Array.isArray(text)) {
        return text.map((item, index) =>
          typeof item === "string" ? processTextWithCitations(item) : item,
        );
      }
      return text;
    }

    const citationRegex = /\[(\d+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(text)) !== null) {
      const citationId = parseInt(match[1]);
      const citation = citationMap.get(citationId);

      console.log("Found citation marker:", {
        citationId,
        hasCitation: !!citation,
      });

      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add clickable citation
      parts.push(
        <CitationLink
          key={`citation-${citationId}-${match.index}`}
          citation={citation}
          citationId={citationId}
          isActive={activeCitation === citationId}
          isClicked={clickedCitation === citationId}
          onClick={() => handleCitationClick(citationId, citation)}
        />,
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 1 ? parts : text;
  };

  // Enhanced markdown components that handle citations in text
  const citationMarkdownComponents = {
    ...MarkdownComponents,
    // Bullet points are the primary place for citations
    li: ({ children, ...props }) => {
      const processedChildren = Array.isArray(children)
        ? children.map((child, index) =>
            typeof child === "string" ? processTextWithCitations(child) : child,
          )
        : processTextWithCitations(children);

      return (
        <li className="leading-relaxed" {...props}>
          {processedChildren}
        </li>
      );
    },
    // Also handle citations in paragraphs (fallback)
    p: ({ children, ...props }) => {
      const processedChildren = Array.isArray(children)
        ? children.map((child, index) =>
            typeof child === "string" ? processTextWithCitations(child) : child,
          )
        : processTextWithCitations(children);

      return (
        <p className="mb-4 leading-relaxed" {...props}>
          {processedChildren}
        </p>
      );
    },
    // Handle citations in headings (less common but possible)
    h1: ({ children, ...props }) => {
      const processedChildren = Array.isArray(children)
        ? children.map((child, index) =>
            typeof child === "string" ? processTextWithCitations(child) : child,
          )
        : processTextWithCitations(children);

      return (
        <h1 className="mb-4 text-2xl font-bold" {...props}>
          {processedChildren}
        </h1>
      );
    },
    h2: ({ children, ...props }) => {
      const processedChildren = Array.isArray(children)
        ? children.map((child, index) =>
            typeof child === "string" ? processTextWithCitations(child) : child,
          )
        : processTextWithCitations(children);

      return (
        <h2 className="mb-3 text-xl font-semibold" {...props}>
          {processedChildren}
        </h2>
      );
    },
    h3: ({ children, ...props }) => {
      const processedChildren = Array.isArray(children)
        ? children.map((child, index) =>
            typeof child === "string" ? processTextWithCitations(child) : child,
          )
        : processTextWithCitations(children);

      return (
        <h3 className="mb-3 text-lg font-semibold" {...props}>
          {processedChildren}
        </h3>
      );
    },
  };

  return (
    <ReactMarkdown components={citationMarkdownComponents}>
      {content}
    </ReactMarkdown>
  );
}

/**
 * CitationLink - Individual clickable citation component
 * Simplified with underline and tooltip
 */
function CitationLink({ citation, citationId, isActive, isClicked, onClick }) {
  const isMatched = citation?.isMatched;
  const confidence = citation?.confidence || 0;

  console.log("Rendering CitationLink:", { citationId, isMatched, confidence });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Citation clicked:", citationId);
    onClick();
  };

  const getTooltipText = () => {
    if (!citation) return `Click to view citation ${citationId}`;

    const matchInfo = citation.isMatched
      ? `${Math.round(citation.confidence * 100)}% match`
      : "No match found";

    return `Click to view citation ${citationId} (${matchInfo})`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="underline cursor-pointer hover:text-blue-400 transition-colors duration-200"
            onClick={handleClick}
            style={{ userSelect: "none" }}
          >
            [{citationId}]
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
