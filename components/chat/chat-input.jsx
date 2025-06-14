import { useState, useRef } from "react";
import { ArrowLineUp, Clipboard, Minus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput({
  onSendMessage,
  isLoading,
  width = "w-full",
  className = "",
  isInSplitView = false,
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

  const removePastedContent = (indexToRemove) => {
    setPastedContents((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  return (
    <div className={`${width} ${className} relative z-50`}>
      <div
        className={`w-full flex-1 ${isInSplitView ? "px-4" : "max-w-[55.5rem] mx-auto"}`}
      >
        {pastedContents.length > 0 && (
          <div
            className={`absolute bottom-full left-0 right-0 mb-2 ${isInSplitView ? "mx-4" : "mx-auto max-w-[55.5rem]"}`}
          >
            <div className="flex gap-3">
              {pastedContents.map((content, index) => (
                <div
                  key={index}
                  className="flex-1 relative text-sm text-comet-300 bg-comet-900 border-4 border-comet-850 p-3 rounded-xl text-center"
                >
                  <Button
                    size="sm"
                    onClick={() => removePastedContent(index)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-comet-100 bg-red-950 hover:bg-red-900 transition-colors duration-200 cursor-pointer rounded-full"
                  >
                    <Minus size={12} weight="bold" />
                  </Button>
                  Pasted text - {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 rounded-t-3xl bg-comet-850 border-8 border-b-0 border-comet-750 p-4 shadow-none"
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
              className="min-h-[94px] max-h-[200px] bg-transparent border-0 px-3 py-2 text-comet-300 placeholder-comet-100 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              disabled={isLoading}
              rows={2}
            />
          </div>
          <Button
            type="submit"
            disabled={!canSubmit}
            size="sm"
            className="h-9 w-9 flex-shrink-0 rounded-lg bg-comet-600 hover:bg-comet-700 disabled:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <ArrowLineUp size={16} className="text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}
