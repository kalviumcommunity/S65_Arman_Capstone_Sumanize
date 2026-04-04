export type LaunchErrorCode =
  | "AUTH"
  | "INPUT"
  | "SEARCH"
  | "MODEL"
  | "PARSE"
  | "PERSISTENCE"
  | "UNKNOWN";

export type ClassifiedLaunchError = {
  code: LaunchErrorCode;
  internalMessage: string;
  retryable: boolean;
  userMessage: string;
};

export function classifyLaunchError(error: unknown): ClassifiedLaunchError {
  const message = error instanceof Error ? error.message : "Unknown failure";
  const lower = message.toLowerCase();

  if (
    lower.includes("validation failed") ||
    lower.includes("schema") ||
    lower.includes("structured response") ||
    lower.includes("shape")
  ) {
    return {
      code: "PARSE",
      internalMessage: message,
      retryable: true,
      userMessage:
        "The model returned an invalid structured response. Retrying may help.",
    };
  }

  if (lower.includes("not authenticated") || lower.includes("unauthorized")) {
    return {
      code: "AUTH",
      internalMessage: message,
      retryable: false,
      userMessage: "Your session expired. Please sign in again.",
    };
  }

  if (
    lower.includes("complete:") ||
    lower.includes("product description") ||
    lower.includes("missing run id") ||
    lower.includes("invalid")
  ) {
    return {
      code: "INPUT",
      internalMessage: message,
      retryable: false,
      userMessage: message,
    };
  }

  if (lower.includes("valid json") || lower.includes("json")) {
    return {
      code: "PARSE",
      internalMessage: message,
      retryable: true,
      userMessage:
        "The model returned an invalid structured response. Retrying may help.",
    };
  }

  if (
    lower.includes("exa") ||
    lower.includes("search") ||
    lower.includes("timed out") ||
    lower.includes("network")
  ) {
    return {
      code: "SEARCH",
      internalMessage: message,
      retryable: true,
      userMessage: "A research source failed while gathering evidence.",
    };
  }

  if (
    lower.includes("provider") ||
    lower.includes("model") ||
    lower.includes("generate")
  ) {
    return {
      code: "MODEL",
      internalMessage: message,
      retryable: true,
      userMessage: "The strategy model failed during generation.",
    };
  }

  if (
    lower.includes("artifact") ||
    lower.includes("persist") ||
    lower.includes("convex")
  ) {
    return {
      code: "PERSISTENCE",
      internalMessage: message,
      retryable: false,
      userMessage: "The run could not be saved correctly.",
    };
  }

  return {
    code: "UNKNOWN",
    internalMessage: message,
    retryable: false,
    userMessage: "The workflow failed unexpectedly.",
  };
}

export async function withRetry<T>(args: {
  fn: () => Promise<T>;
  label: string;
  maxAttempts: number;
  onRetry?: (details: {
    attempt: number;
    error: ClassifiedLaunchError;
  }) => Promise<void> | void;
}) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= args.maxAttempts; attempt += 1) {
    try {
      return await args.fn();
    } catch (error) {
      const classified = classifyLaunchError(error);
      lastError = error;

      if (!classified.retryable || attempt === args.maxAttempts) {
        throw error;
      }

      await args.onRetry?.({ attempt, error: classified });
    }
  }

  throw lastError ?? new Error(`${args.label} failed.`);
}
