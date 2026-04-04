function includesAny(message: string, terms: string[]) {
  return terms.some((term) => message.includes(term));
}

export function getErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message.trim() : "";

  if (!message) {
    return fallback;
  }

  const lower = message.toLowerCase();

  if (
    includesAny(lower, ["not authenticated", "unauthorized", "session expired"])
  ) {
    return "Your session expired. Please sign in again.";
  }

  if (includesAny(lower, ["invalid login", "invalid credentials"])) {
    return "Incorrect email or password.";
  }

  if (
    lower.includes("password") &&
    includesAny(lower, ["at least", "too short", "8"])
  ) {
    return "Password must be at least 8 characters.";
  }

  if (lower.includes("email") && includesAny(lower, ["invalid", "valid"])) {
    return "Enter a valid email address.";
  }

  if (
    includesAny(lower, ["already exists", "already registered", "duplicate"]) &&
    includesAny(lower, ["email", "account", "user"])
  ) {
    return "An account with this email already exists.";
  }

  if (
    includesAny(lower, ["network", "timed out", "timeout", "failed to fetch"])
  ) {
    return "The request could not be completed. Please try again.";
  }

  if (lower.includes("failed to connect to stream")) {
    return "Unable to connect right now. Please try again.";
  }

  return fallback;
}
