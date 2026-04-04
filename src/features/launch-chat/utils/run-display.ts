export function formatTimestamp(value?: number) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatDuration(startedAt?: number, completedAt?: number) {
  if (!startedAt || !completedAt || completedAt < startedAt) {
    return null;
  }

  const totalSeconds = Math.round((completedAt - startedAt) / 1000);

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}
