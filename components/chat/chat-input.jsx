import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  StarFour,
  ArrowLineUp,
  YoutubeLogo,
  FolderSimple,
} from "@phosphor-icons/react";

export default function ChatInput({ onSendMessage, loading, isLimitReached }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading || isLimitReached) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAutoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  const isDisabled = loading || isLimitReached;

  return (
    <div className="mb-4 p-2 rounded-2xl bg-neutral-900/50 backdrop-blur-lg">
      <div className="rounded-xl p-4 bg-neutral-900/50">
        <div className="flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onInput={handleAutoResize}
            placeholder="Type your message here..."
            disabled={isDisabled}
            rows={1}
            className="w-full resize-none border-none bg-transparent p-2 mb-4 text-base leading-6 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              minHeight: "28px",
              maxHeight: "180px",
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 rounded-lg bg-neutral-700/50 px-3 py-1 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-200"
              >
                <StarFour weight="fill" className="h-4 w-4" />
                Gemini 2.0 Flash
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 rounded-lg bg-neutral-700/50 px-3 py-1 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-200"
              >
                <FolderSimple weight="fill" className="h-4 w-4" />
                Attach
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 rounded-lg bg-neutral-700/50 px-3 py-1 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-200"
              >
                <YoutubeLogo weight="fill" className="h-4 w-4" />
                Youtube
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={isDisabled || !input.trim()}
              size="icon"
              className="h-9 w-9 rounded-lg bg-neutral-700/50 transition-colors hover:bg-neutral-700 hover:text-neutral-200 disabled:bg-neutral-700 disabled:opacity-60 cursor-pointer"
            >
              <ArrowLineUp className="h-5 w-5" />
              <span className="sr-only">Send Message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
