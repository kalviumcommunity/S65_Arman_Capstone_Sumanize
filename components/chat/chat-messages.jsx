import { MessageItem } from "./message-item";
import { LoadingIndicator } from "./loading-indicator";
import { EmptyState } from "./empty-state";

export function ChatMessages({
  messages,
  isLoading,
  isNewChatPending,
  messagesEndRef,
}) {
  if (messages.length === 0) {
    return (
      // This part is already correct for centering the empty state.
      <main className="flex-1 flex items-center justify-center p-4">
        <EmptyState isNewChatPending={isNewChatPending} />
      </main>
    );
  }

  return (
    // THE FIX:
    // 1. Add `flex` and `flex-col` to make this a flex container.
    // 2. Add `items-center` to horizontally center its direct children.
    <main className="flex-1 flex flex-col items-center overflow-y-auto p-4">
      {/* 
        This div acts as the container for all messages.
        - `w-full`: Ensures it takes the full width of the parent.
        - `max-w-3xl`: Constrains the maximum width for readability.
        - `mx-auto` is no longer needed as the parent `main` now handles centering.
      */}
      <div className="w-full max-w-3xl space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}
