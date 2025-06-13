import { useState, useRef } from "react";
import { ArrowUp, Paperclip } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ChatInput({ onSendMessage, isLoading }) {
  const [input, setInput] = useState("");
  const [pastedContent, setPastedContent] = useState(null);
  const textareaRef = useRef(null);

  const PASTE_THRESHOLD = 500;

  const canSubmit = (input.trim().length > 0 || pastedContent) && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const messageContent = textareaRef.current?.value.trim();

    if (!messageContent && !pastedContent) return;

    const messageData = {
      content: messageContent,
      pastedContent: pastedContent,
    };

    setInput("");
    setPastedContent(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSendMessage(messageData);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData("text");

    if (pastedText.length > PASTE_THRESHOLD) {
      e.preventDefault();

      const lines = pastedText.split("\n");
      const lastLine = lines[lines.length - 1].trim();

      if (
        lastLine.length < 100 &&
        (lastLine.includes("?") ||
          lastLine
            .toLowerCase()
            .match(
              /^(analyze|summarize|explain|describe|what|how|why|can you|please)/,
            ))
      ) {
        const contentWithoutPrompt = lines.slice(0, -1).join("\n").trim();
        if (contentWithoutPrompt.length > PASTE_THRESHOLD) {
          setPastedContent(contentWithoutPrompt);
          setInput(lastLine);
          return;
        }
      }

      setPastedContent(pastedText);
      setInput("");
    }
  };

  const handleAutoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const removePastedContent = () => {
    setPastedContent(null);
  };

  return (
    <div className="w-full">
      <div className="w-full">
        {pastedContent && (
          <div className="mb-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Paperclip size={16} />
                <span>Pasted content ({pastedContent.length} characters)</span>
              </div>
              <button
                onClick={removePastedContent}
                className="text-neutral-400 hover:text-neutral-200 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="text-sm text-neutral-300 bg-neutral-900/50 p-2 rounded max-h-20 overflow-y-auto">
              {pastedContent.substring(0, 200)}
              {pastedContent.length > 200 && "..."}
            </div>
            {!input.trim() && (
              <div className="mt-2 text-xs text-neutral-500 bg-neutral-900/30 p-2 rounded">
                Add a question or instruction about this content in the message
                box below
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 rounded-xl bg-neutral-900 border-4 border-neutral-800 p-3 shadow-lg"
        >
          <div className="flex flex-col flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleAutoResize(e);
              }}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              placeholder={
                pastedContent
                  ? "Add your question or prompt..."
                  : "Type your message here..."
              }
              className="w-full min-h-[56px] max-h-[200px] bg-transparent px-3 py-2 text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none text-sm"
              disabled={isLoading}
              rows={2}
            />
          </div>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-9 w-9 flex-shrink-0 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <ArrowUp size={16} className="text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}
