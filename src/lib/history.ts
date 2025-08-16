export type HistoryItem = {
  id: string;
  title: string;
  source: string;
  summary: string;
  createdAt: number;
};

const STORAGE_KEY = "sumanize_history_v1";
const MAX_ITEMS = 16;

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addHistory(
  entry: Omit<HistoryItem, "id" | "createdAt"> &
    Partial<Pick<HistoryItem, "id" | "createdAt">>,
) {
  if (typeof window === "undefined") return;
  const id =
    entry.id ??
    (crypto?.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`);
  const createdAt = entry.createdAt ?? Date.now();
  const item: HistoryItem = {
    id,
    createdAt,
    title: entry.title?.slice(0, 140) ?? "Untitled",
    source: entry.source ?? "",
    summary: entry.summary ?? "",
  };
  const existing = getHistory();
  const next = [item, ...existing].slice(0, MAX_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("sumanize:history-updated"));
}
