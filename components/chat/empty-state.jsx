export function EmptyState({ isNewChatPending }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-neutral-400">
        <h2 className="text-2xl font-semibold mb-2">
          {isNewChatPending
            ? "Ready for a new conversation"
            : "Start a conversation"}
        </h2>
        <p>
          {isNewChatPending
            ? "Type your message below to begin"
            : "Send a message to begin chatting with AI"}
        </p>
      </div>
    </div>
  );
}
