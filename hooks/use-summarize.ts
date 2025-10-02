import { useCallback, useState } from "react";

interface PastedItem {
  id: string;
  text: string;
}

export function useSummarize() {
  const [pastedItems, setPastedItems] = useState<PastedItem[]>([]);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addPastedItem = useCallback((text: string) => {
    const newItem: PastedItem = {
      id: `${Date.now()}-${Math.random()}`,
      text,
    };
    setPastedItems((prev) => [...prev, newItem]);
  }, []);

  const removePastedItem = useCallback((id: string) => {
    setPastedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const summarize = useCallback(async () => {
    if (!pastedItems.length) return;
    setIsLoading(true);
    setSummary("");

    const combinedMessage =
      `Pasted Texts (count: ${pastedItems.length}):\n` +
      pastedItems.map((item, i) => `[#${i + 1}]\n${item.text}\n`).join("\n");

    try {
      const response = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: combinedMessage }),
      });

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const json = JSON.parse(line.substring(6));
              setSummary((prev) => prev + (json.text || ""));
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error("Summarization error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pastedItems]);

  return {
    pastedItems,
    summary,
    isLoading,
    addPastedItem,
    removePastedItem,
    summarize,
  };
}
