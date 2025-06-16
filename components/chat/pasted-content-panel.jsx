import { useEffect, useRef, useState } from "react";

export function PastedContentPanel({
  content,
  activeCitation,
  citations = [],
}) {
  const contentRef = useRef(null);
  const [highlightedCitation, setHighlightedCitation] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    console.log("PastedContentPanel effect:", {
      activeCitation,
      citationsLength: citations.length,
    });
    if (activeCitation && contentRef.current) {
      const citation = citations.find((c) => c.id === activeCitation);
      console.log("Found citation for highlighting:", {
        citation,
        isMatched: citation?.isMatched,
      });
      if (citation && citation.isMatched) {
        scrollToAndHighlightCitation(citation);
      } else if (citation) {
        console.log("Citation not matched, trying fuzzy highlight...");
        scrollToAndHighlightCitation(citation);
      }
    }
  }, [activeCitation, citations]);

  const scrollToAndHighlightCitation = (citation) => {
    if (!contentRef.current) return;

    console.log("Attempting to highlight citation:", {
      citationId: citation.id,
      isMatched: citation.isMatched,
      sourceText: citation.sourceText?.substring(0, 100) + "...",
    });

    setIsScrolling(true);

    const strategies = [
      () => highlightByTextPosition(citation),
      () => highlightByTextSearch(citation),
      () => highlightByFuzzyMatch(citation),
    ];

    let success = false;
    for (const strategy of strategies) {
      try {
        if (strategy()) {
          success = true;
          break;
        }
      } catch (error) {
        console.warn("Strategy failed:", error);
        continue;
      }
    }

    if (success) {
      console.log("Successfully highlighted citation:", citation.id);
      setHighlightedCitation(citation.id);
      setTimeout(() => {
        setHighlightedCitation(null);
        setIsScrolling(false);
      }, 3000);
    } else {
      console.warn("Failed to locate citation in text:", citation);
      setHighlightedCitation(citation.id);
      setTimeout(() => {
        setHighlightedCitation(null);
        setIsScrolling(false);
      }, 2000);
    }
  };

  const highlightByTextPosition = (citation) => {
    if (citation.startIndex < 0 || citation.endIndex < 0) return false;

    try {
      const textContent = contentRef.current.textContent || "";
      const citationText = content.substring(
        citation.startIndex,
        citation.endIndex,
      );

      if (
        textContent.substring(citation.startIndex, citation.endIndex) !==
        citationText
      ) {
        if (textContent.toLowerCase().includes(citationText.toLowerCase())) {
          return highlightByTextSearch(citation);
        }
        return false;
      }

      const textNode = findTextNodeAtPosition(
        contentRef.current,
        citation.startIndex,
      );
      if (textNode) {
        scrollToTextNode(textNode, citation.startIndex);
        return true;
      }
    } catch (error) {
      console.warn("Error in highlightByTextPosition:", error);
    }
    return false;
  };

  const highlightByTextSearch = (citation) => {
    try {
      const textContent = contentRef.current.textContent || "";
      const searchText = citation.matchedText || citation.sourceText;

      const index = textContent.toLowerCase().indexOf(searchText.toLowerCase());
      if (index === -1) return false;

      const textNode = findTextNodeAtPosition(contentRef.current, index);
      if (textNode) {
        scrollToTextNode(textNode, index);
        return true;
      }
    } catch (error) {
      console.warn("Error in highlightByTextSearch:", error);
    }
    return false;
  };

  const highlightByFuzzyMatch = (citation) => {
    try {
      const textContent = contentRef.current.textContent || "";
      const searchWords = citation.sourceText
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3);

      for (const word of searchWords) {
        const index = textContent.toLowerCase().indexOf(word);
        if (index !== -1) {
          const textNode = findTextNodeAtPosition(contentRef.current, index);
          if (textNode) {
            scrollToTextNode(textNode, index);
            return true;
          }
        }
      }
    } catch (error) {
      console.warn("Error in highlightByFuzzyMatch:", error);
    }
    return false;
  };

  const findTextNodeAtPosition = (element, targetIndex) => {
    let currentIndex = 0;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    let node;
    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent.length;
      if (currentIndex + nodeLength >= targetIndex) {
        return node;
      }
      currentIndex += nodeLength;
    }
    return null;
  };

  const scrollToTextNode = (textNode, globalIndex) => {
    try {
      const range = document.createRange();
      range.setStart(
        textNode,
        Math.max(
          0,
          globalIndex - getTextOffsetToNode(contentRef.current, textNode),
        ),
      );
      range.setEnd(
        textNode,
        Math.min(
          textNode.textContent.length,
          globalIndex - getTextOffsetToNode(contentRef.current, textNode) + 50,
        ),
      );

      const rect = range.getBoundingClientRect();
      const containerRect = contentRef.current.getBoundingClientRect();

      const targetScrollTop =
        contentRef.current.scrollTop + rect.top - containerRect.top - 150;

      contentRef.current.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    } catch (error) {
      console.warn("Error in scrollToTextNode:", error);
    }
  };

  const getTextOffsetToNode = (container, targetNode) => {
    let offset = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node === targetNode) {
        break;
      }
      offset += node.textContent.length;
    }
    return offset;
  };

  const renderContentWithHighlights = () => {
    if (!citations || citations.length === 0) {
      return content;
    }

    const sortedCitations = [...citations]
      .filter((c) => c.isMatched && c.startIndex >= 0)
      .sort((a, b) => a.startIndex - b.startIndex);

    if (sortedCitations.length === 0) {
      return content;
    }

    const parts = [];
    let lastIndex = 0;

    sortedCitations.forEach((citation, index) => {
      if (citation.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, citation.startIndex)}
          </span>,
        );
      }

      const isActive = activeCitation === citation.id;
      const isHighlighted = highlightedCitation === citation.id;
      const partContent = content.substring(
        citation.startIndex,
        citation.endIndex,
      );

      let highlightClass = "transition-all duration-200 rounded-sm";

      if (isHighlighted) {
        highlightClass += " bg-yellow-400/60 px-1";
      } else if (isActive) {
        if (citation.confidence >= 0.9) {
          highlightClass += " bg-blue-500/30 pl-1";
        } else if (citation.confidence >= 0.7) {
          highlightClass += " bg-amber-500/30 pl-1";
        } else {
          highlightClass += " bg-orange-500/30 pl-1";
        }
      }

      parts.push(
        <span
          key={`citation-${citation.id}-${index}`}
          className={highlightClass}
          title={`Citation ${citation.id} (${Math.round(citation.confidence * 100)}% match)`}
        >
          {partContent}
        </span>,
      );

      lastIndex = citation.endIndex;
    });

    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>,
      );
    }

    return parts;
  };

  if (!content) return null;

  const matchedCitations = citations.filter((c) => c.isMatched);
  const citationsText =
    citations.length > 0
      ? `${matchedCitations.length}/${citations.length} citations matched`
      : "";

  return (
    <div className="w-1/2 bg-comet-850 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-comet-900">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-comet-100">
            Pasted Content
          </h3>
          {citationsText && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-comet-500 font-mono">
                {citationsText}
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto p-6 text-sm text-comet-50 bg-comet-900"
        style={{ lineHeight: "1.6" }}
      >
        <pre className="bg-comet-850 rounded-xl p-6 font-mono whitespace-pre-wrap break-words">
          {renderContentWithHighlights()}
        </pre>
      </div>
    </div>
  );
}
