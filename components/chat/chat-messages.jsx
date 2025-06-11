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
      <main className="flex-1 overflow-y-auto p-4">
        <EmptyState isNewChatPending={isNewChatPending} />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}
