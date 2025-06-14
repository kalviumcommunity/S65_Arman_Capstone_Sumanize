import { useState, useRef } from "react";
import {
  ArrowLineUp,
  Minus,
  Plus,
  SlidersHorizontal,
  WifiLow,
  WifiMedium,
  WifiHigh,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChatInput({
  onSendMessage,
  isLoading,
  width = "w-full",
  className = "",
  isInSplitView = false,
}) {
  const [input, setInput] = useState("");
  const [pastedContents, setPastedContents] = useState([]);
  const [responseMode, setResponseMode] = useState("normal");
  const textareaRef = useRef(null);

  const PASTE_THRESHOLD = 500;

  const canSubmit =
    (input.trim().length > 0 || pastedContents.length > 0) && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const messageContent = textareaRef.current?.value.trim();

    if (!messageContent && pastedContents.length === 0) return;

    const finalContent =
      messageContent ||
      (pastedContents.length > 0 ? "Please analyze the provided content." : "");

    const messageData = {
      content: finalContent,
      pastedContent:
        pastedContents.length > 0
          ? pastedContents.join("\n\n--- Document Separator ---\n\n")
          : null,
      responseMode: responseMode,
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

      if (pastedContents.length >= 2) {
        return;
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

  const removePastedContent = (indexToRemove) => {
    setPastedContents((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleUpload = () => {
    // TODO: Implement file upload functionality
    console.log("Upload clicked");
  };

  const getModeConfig = (mode) => {
    switch (mode) {
      case "concise":
        return {
          label: "Concise",
          description: "Brief responses",
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          icon: WifiLow,
        };
      case "normal":
        return {
          label: "Normal",
          description: "Balanced responses",
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          icon: WifiMedium,
        };
      case "explanatory":
        return {
          label: "Detailed",
          description: "Comprehensive responses",
          color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
          icon: WifiHigh,
        };
      default:
        return {
          label: "Normal",
          description: "Balanced responses",
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          icon: WifiMedium,
        };
    }
  };

  const currentModeConfig = getModeConfig(responseMode);

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
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-red-400 bg-red-950 hover:bg-red-900 transition-colors duration-200 cursor-pointer rounded-full"
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
          className="rounded-t-3xl bg-comet-900 border-4 border-b-0 border-comet-850 p-4 shadow-none"
        >
          {/* Main Input Area */}
          <div className="flex items-end gap-3">
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
                className="min-h-[72px] max-h-[200px] bg-transparent border-0 px-3 py-2 text-comet-300 placeholder-comet-100 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                disabled={isLoading}
                rows={2}
              />
            </div>

            {/* Upload Button */}
            <Button
              type="button"
              onClick={handleUpload}
              size="sm"
              className="h-9 px-3 flex items-center gap-2 rounded-md bg-transparent hover:bg-comet-800 text-comet-400 hover:text-comet-300 transition-colors duration-200"
            >
              <Plus size={16} weight="bold" />
              <span className="text-sm font-medium">Upload</span>
            </Button>

            {/* Settings Dropdown with Badge */}
            <div className="relative flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 px-3 flex items-center gap-2 rounded-md bg-transparent hover:bg-comet-800 text-comet-400 hover:text-comet-300 transition-colors duration-200"
                  >
                    <SlidersHorizontal size={16} weight="bold" />
                    <span className="text-sm font-medium">Manner</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-comet-900 border border-comet-700 shadow-lg"
                >
                  <DropdownMenuItem
                    onClick={() => setResponseMode("concise")}
                    className="text-comet-300 hover:bg-comet-800 hover:text-white cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <WifiLow size={16} className="text-blue-400" />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Concise</span>
                        <span className="text-xs text-comet-400">
                          Brief, to-the-point responses
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setResponseMode("normal")}
                    className="text-comet-300 hover:bg-comet-800 hover:text-white cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <WifiMedium size={16} className="text-green-400" />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Normal</span>
                        <span className="text-xs text-comet-400">
                          Balanced detail and clarity
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setResponseMode("explanatory")}
                    className="text-comet-300 hover:bg-comet-800 hover:text-white cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <WifiHigh size={16} className="text-purple-400" />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Detailed</span>
                        <span className="text-xs text-comet-400">
                          Comprehensive responses
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Response Mode Badge */}
              <div className="ml-2">
                <div className="h-9 px-3 flex items-center gap-2 rounded-md bg-transparent border border-comet-700 text-comet-300 transition-colors duration-200">
                  <currentModeConfig.icon size={16} />
                  <span className="text-sm font-medium">
                    {currentModeConfig.label}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              size="md"
              className="h-9 w-9 flex-shrink-0 rounded-md bg-comet-700 hover:bg-comet-800 disabled:bg-comet-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-300 cursor-pointer"
            >
              <ArrowLineUp size={16} weight="bold" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
