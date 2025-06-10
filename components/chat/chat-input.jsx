import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Crown, LogIn } from "lucide-react";

export default function ChatInput({
  onSendMessage,
  loading,
  isLimitReached,
  isAuthenticated,
  onSignIn,
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-800 p-4 backdrop-blur-lg bg-black/20">
      <div className="flex space-x-2">
        {/* Main chat input */}
        <div className="backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-4 shadow-2xl flex-1">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isLimitReached
                  ? isAuthenticated
                    ? "Message limit reached - Upgrade to Premium"
                    : "Message limit reached - Sign in for more"
                  : "Type your message..."
              }
              disabled={loading || isLimitReached}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-white/50 border-none outline-none resize-none text-base leading-6 py-2 disabled:opacity-50"
              style={{
                minHeight: "24px",
                maxHeight: "120px",
                height: "auto",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim() || isLimitReached}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Limit reached notice */}
      {isLimitReached && (
        <div className="mt-3 backdrop-blur-lg bg-black/20 border border-white/20 rounded-xl p-3 text-center">
          <Button
            onClick={onSignIn}
            className={`
              ${
                isAuthenticated
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-green-600 hover:bg-green-700"
              }
              text-white px-4 py-2 rounded-lg
            `}
          >
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In for More Messages
                </>
              )}
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
