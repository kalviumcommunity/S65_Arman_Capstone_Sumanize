import { useState, useRef } from "react";
import { ArrowUp, Clipboard, Minus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput({
  onSendMessage,
  isLoading,
  width = "w-full",
  className = "",
}) {
  const [input, setInput] = useState("");
  const [pastedContents, setPastedContents] = useState([]);
  const textareaRef = useRef(null);

  const PASTE_THRESHOLD = 500;

  const canSubmit =
    (input.trim().length > 0 || pastedContents.length > 0) && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const messageContent = textareaRef.current?.value.trim();

    if (!messageContent && pastedContents.length === 0) return;

    // Ensure content is never empty for MongoDB validation
    const finalContent =
      messageContent ||
      (pastedContents.length > 0 ? "Please analyze the provided content." : "");

    const messageData = {
      content: finalContent,
      pastedContent:
        pastedContents.length > 0
          ? pastedContents.join("\n\n--- Document Separator ---\n\n")
          : null,
    };

    setInput("");
    setPastedContents([]);
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

      // Limit to 2 pasted documents
      if (pastedContents.length >= 2) {
        return; // Don't paste more than 2 documents
      }

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
          setPastedContents((prev) => [...prev, contentWithoutPrompt]);
          setInput(lastLine);
          return;
        }
      }

      setPastedContents((prev) => [...prev, pastedText]);
      setInput("");
    }
  };

  const handleAutoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const removeAllPastedContent = () => {
    setPastedContents([]);
  };

  return (
    <div className={`${width} ${className} relative z-50`}>
      <div className="w-full max-w-[55.5rem] mx-auto flex-1">
        {pastedContents.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-comet-900 rounded-2xl border-4 border-comet-850 mx-auto max-w-[55.5rem]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-comet-400">
                <Clipboard size={16} weight="bold" />
                <span>
                  Pasted content ({pastedContents.length} document
                  {pastedContents.length > 1 ? "s" : ""})
                </span>
              </div>
              <Button
                size="sm"
                onClick={removeAllPastedContent}
                className="h-auto text-comet-400 bg-comet-900 cursor-pointer hover:bg-comet-700"
              >
                <Minus size={16} weight="bold" />
              </Button>
            </div>
            <div
              className={`space-y-3 ${pastedContents.length > 1 ? "grid grid-cols-2 gap-3 space-y-0" : ""}`}
            >
              {pastedContents.map((content, index) => (
                <div
                  key={index}
                  className="text-sm text-comet-400 bg-comet-800 p-3 rounded-lg max-h-16 overflow-y-auto"
                >
                  {content.substring(0, 180)}
                  {content.length > 180 && "..."}
                </div>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 rounded-xl bg-neutral-900 border-4 border-neutral-800 p-3 shadow-lg"
        >
          <div className="flex flex-col flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleAutoResize(e);
              }}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              placeholder={
                pastedContents.length > 0
                  ? "Add your question or prompt..."
                  : "Type your message here..."
              }
              className="min-h-[56px] max-h-[200px] bg-transparent border-0 px-3 py-2 text-neutral-100 placeholder-neutral-500 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              disabled={isLoading}
              rows={2}
            />
          </div>
          <Button
            type="submit"
            disabled={!canSubmit}
            size="sm"
            className="h-9 w-9 flex-shrink-0 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <ArrowUp size={16} className="text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}
