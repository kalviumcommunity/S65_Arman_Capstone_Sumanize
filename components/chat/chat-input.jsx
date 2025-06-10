import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="border-t border-neutral-800 p-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isLimitReached
              ? isAuthenticated
                ? "Message limit reached - Upgrade to Premium"
                : "Message limit reached - Sign in for more"
              : "Type a message..."
          }
          disabled={loading || isLimitReached}
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim() || isLimitReached}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 disabled:opacity-50"
        >
          Send
        </Button>
      </div>
      {isLimitReached && (
        <div className="mt-2 text-center">
          <Button
            onClick={onSignIn}
            variant="outline"
            size="sm"
            className="bg-transparent border-neutral-700 text-white hover:bg-neutral-800"
          >
            {isAuthenticated
              ? "Upgrade to Premium"
              : "Sign In for More Messages"}
          </Button>
        </div>
      )}
    </div>
  );
} 