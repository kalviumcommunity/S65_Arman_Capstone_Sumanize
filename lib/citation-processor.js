/**
 * Parse AI response to extract citations
 * @param {string} aiResponse - The AI response containing citations
 * @returns {Object} - {content: string, citations: Array}
 */
export function parseAIResponseWithCitations(aiResponse) {
  try {
    const citationSectionMatch = aiResponse.match(/CITATIONS:\s*([\s\S]+)$/i);

    if (!citationSectionMatch) {
      return {
        content: aiResponse,
        citations: [],
        hasCitations: false,
      };
    }

    const mainContent = aiResponse
      .replace(/\s*CITATIONS:\s*[\s\S]+$/i, "")
      .trim();

    const citationsText = citationSectionMatch[1];

    const citationMatches = citationsText.match(/\[(\d+)\]\s*"([^"]+)"/g) || [];

    const citations = [];
    for (const match of citationMatches) {
      const citationMatch = match.match(/\[(\d+)\]\s*"([^"]+)"/);
      if (citationMatch) {
        citations.push({
          id: parseInt(citationMatch[1]),
          sourceText: citationMatch[2].trim(),
          startIndex: -1,
          endIndex: -1,
          isMatched: false,
        });
      }
    }

    return {
      content: mainContent,
      citations,
      hasCitations: citations.length > 0,
    };
  } catch (error) {
    console.error("Error parsing citations:", error);
    return {
      content: aiResponse,
      citations: [],
      hasCitations: false,
    };
  }
}

/**
 * Match citations to positions in source text
 * @param {Array} citations - Citations from AI response
 * @param {string} sourceText - The original pasted content
 * @returns {Array} - Citations with matched positions
 */
export function matchCitationsToSource(citations, sourceText) {
  if (!sourceText || !citations || citations.length === 0) {
    return citations;
  }

  const matchedCitations = citations.map((citation) => {
    const matched = findTextInSource(citation.sourceText, sourceText);

    return {
      ...citation,
      startIndex: matched.startIndex,
      endIndex: matched.endIndex,
      isMatched: matched.isMatched,
      matchedText: matched.matchedText || citation.sourceText,
      confidence: matched.confidence || 0,
    };
  });

  return matchedCitations;
}

/**
 * Find text in source using multiple matching strategies
 * @param {string} searchText - Text to find
 * @param {string} sourceText - Source text to search in
 * @returns {Object} - Match result with position and confidence
 */
function findTextInSource(searchText, sourceText) {
  const exactMatch = sourceText.indexOf(searchText);
  if (exactMatch !== -1) {
    return {
      startIndex: exactMatch,
      endIndex: exactMatch + searchText.length,
      isMatched: true,
      matchedText: searchText,
      confidence: 1.0,
    };
  }

  const caseInsensitiveMatch = sourceText
    .toLowerCase()
    .indexOf(searchText.toLowerCase());
  if (caseInsensitiveMatch !== -1) {
    const matchedText = sourceText.substring(
      caseInsensitiveMatch,
      caseInsensitiveMatch + searchText.length,
    );
    return {
      startIndex: caseInsensitiveMatch,
      endIndex: caseInsensitiveMatch + searchText.length,
      isMatched: true,
      matchedText,
      confidence: 0.9,
    };
  }

  const keyPhraseMatch = findKeyPhraseMatch(searchText, sourceText);
  if (keyPhraseMatch.confidence > 0.7) {
    return keyPhraseMatch;
  }

  const sentenceMatch = findSentenceMatch(searchText, sourceText);
  if (sentenceMatch.confidence > 0.6) {
    return sentenceMatch;
  }

  const wordMatch = findWordOverlapMatch(searchText, sourceText);
  if (wordMatch.confidence > 0.5) {
    return wordMatch;
  }

  // No good match found
  return {
    startIndex: -1,
    endIndex: -1,
    isMatched: false,
    matchedText: null,
    confidence: 0,
  };
}

function findKeyPhraseMatch(searchText, sourceText) {
  const searchWords = searchText
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);
  const sentences = sourceText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 20);

  let bestMatch = {
    startIndex: -1,
    endIndex: -1,
    confidence: 0,
    matchedText: null,
  };

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    const sentenceWords = sentence.toLowerCase().split(/\s+/);

    let matchingWords = 0;
    let totalImportantWords = 0;

    for (const word of searchWords) {
      if (word.length > 3) {
        totalImportantWords++;
        if (
          sentenceWords.some((sw) => sw.includes(word) || word.includes(sw))
        ) {
          matchingWords++;
        }
      }
    }

    if (totalImportantWords > 0) {
      const confidence = matchingWords / totalImportantWords;

      if (confidence > bestMatch.confidence && confidence > 0.4) {
        const startIndex = sourceText
          .toLowerCase()
          .indexOf(sentence.toLowerCase());
        if (startIndex !== -1) {
          bestMatch = {
            startIndex,
            endIndex: startIndex + sentence.length,
            confidence,
            matchedText: sentence,
            isMatched: confidence > 0.7,
          };
        }
      }
    }
  }

  return bestMatch;
}

function findSentenceMatch(searchText, sourceText) {
  const searchKeywords = extractKeywords(searchText);
  const sentences = sourceText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 15);

  let bestMatch = {
    startIndex: -1,
    endIndex: -1,
    confidence: 0,
    matchedText: null,
  };

  for (const sentence of sentences) {
    const sentenceKeywords = extractKeywords(sentence);
    const similarity = calculateKeywordSimilarity(
      searchKeywords,
      sentenceKeywords,
    );

    if (similarity > bestMatch.confidence && similarity > 0.3) {
      const startIndex = sourceText
        .toLowerCase()
        .indexOf(sentence.toLowerCase());
      if (startIndex !== -1) {
        bestMatch = {
          startIndex,
          endIndex: startIndex + sentence.length,
          confidence: similarity,
          matchedText: sentence.trim(),
          isMatched: similarity > 0.6,
        };
      }
    }
  }

  return bestMatch;
}

function findWordOverlapMatch(searchText, sourceText) {
  const searchWords = searchText
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);
  const paragraphs = sourceText
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 50);

  let bestMatch = {
    startIndex: -1,
    endIndex: -1,
    confidence: 0,
    matchedText: null,
  };

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.toLowerCase().split(/\s+/);
    let matchingWords = 0;

    for (const word of searchWords) {
      if (paragraphWords.some((pw) => pw.includes(word) || word.includes(pw))) {
        matchingWords++;
      }
    }

    const confidence =
      searchWords.length > 0 ? matchingWords / searchWords.length : 0;

    if (confidence > bestMatch.confidence && confidence > 0.3) {
      const startIndex = sourceText
        .toLowerCase()
        .indexOf(paragraph.toLowerCase());
      if (startIndex !== -1) {
        bestMatch = {
          startIndex,
          endIndex: startIndex + paragraph.length,
          confidence,
          matchedText: paragraph.trim(),
          isMatched: confidence > 0.5,
        };
      }
    }
  }

  return bestMatch;
}

function extractKeywords(text) {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
  ]);

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .map((word) => word.replace(/[^a-z0-9]/g, ""))
    .filter((word) => word.length > 2);
}

function calculateKeywordSimilarity(keywords1, keywords2) {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;

  let matches = 0;
  for (const k1 of keywords1) {
    for (const k2 of keywords2) {
      if (k1 === k2 || k1.includes(k2) || k2.includes(k1)) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(keywords1.length, keywords2.length);
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function findActualPosition(sourceText, approximateIndex, isStart = true) {
  if (isStart) {
    let index = approximateIndex;
    while (index > 0 && /\w/.test(sourceText[index - 1])) {
      index--;
    }
    return index;
  } else {
    let index = approximateIndex;
    while (index < sourceText.length && /\w/.test(sourceText[index])) {
      index++;
    }
    return index;
  }
}

/**
 * Process complete AI response with citations
 * @param {string} aiResponse - AI response with citations
 * @param {string} sourceText - Original pasted content
 * @returns {Object} - Processed response with matched citations
 */
export function processAIResponseWithCitations(aiResponse, sourceText = null) {
  const parsed = parseAIResponseWithCitations(aiResponse);

  if (parsed.hasCitations && sourceText) {
    parsed.citations = matchCitationsToSource(parsed.citations, sourceText);
  }

  return parsed;
}
